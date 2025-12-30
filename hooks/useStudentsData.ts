import { useState, useMemo } from 'react';
import { sortData, SortConfig } from '../utils/formatters';
import {
    calculateActiveBase,
    calculateChurnRate,
    calculateAverageTicket,
    calculateScholarshipImpact,
    calculateStudentProfile
} from '../utils/studentMetrics';

export const useStudentsData = (processedData: any[]) => {
    // --- STATE ---
    const [searchTerm, setSearchTerm] = useState('');
    const [studentFilters, setStudentFilters] = useState({ status: 'Todos' });
    const [stuSortConfig, setStuSortConfig] = useState<SortConfig[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // --- RAW DATA PROCESSING ---
    const studentsRaw = useMemo(() => {
        if (!processedData || !processedData.length) return [];

        const studentsMap = new Map();
        const nameToStudentMap = new Map(); // For matching financial data

        // 1. REGISTRATION PHASE (Base Geral)
        processedData.forEach(row => {
            if (row.source !== 'geral') return;

            const studentId = row['id'] || row.desc; // ID is primary
            const rawName = (row['nome_completo_aluno'] || row['Nome'] || row.desc || '').trim();

            // Parse [x/y] from name if present for matching purposes
            let cleanNameForMatch = rawName;
            const match = rawName.match(/(\s|^|\[|\()(\d+)\/(\d+)(?:\[.*?\])?(\)|\])?/);
            if (match) cleanNameForMatch = rawName.replace(match[0], ' ').trim();

            if (!studentsMap.has(studentId)) {
                studentsMap.set(studentId, {
                    id: studentId,
                    name: rawName,
                    cleanName: cleanNameForMatch,
                    totalPaid: 0,
                    totalPending: 0,
                    totalOverdue: 0,
                    installments: [],
                    status: 'Ativo',
                    lastPayment: null,
                    nextDue: null,
                    responsible: row['nome_responsavel_financeiro'] || row.resp || '',
                    phone: row['telefone_contato'] || '',
                    age: parseInt(row['idade']) || null,
                    enrollmentDate: row['data_matricula'] || null,
                    contractValue: null,
                    currentValue: null,
                    scholarship: row['bolsa'] || null,
                    book: row['livro'] || null,
                    paymentDay: row['dia_pagamento'] || null,
                    period: row['tempo_primeiro_contrato'] || null,
                    vigente: row['vigente'] || null,
                    externalId: row['id'] || null,
                    cpf: row['cpf_aluno'] || null,
                    financialCpf: row['cpf_responsavel_financeiro'] || null,
                    birthDate: row['data_nascimento'] || null,
                    exitDate: null,
                    statusFlags: { matriculado: false, trancado: false, desistente: false, evadido: false }
                });

                // Index by clean name AND responsible to improve matching
                if (cleanNameForMatch) nameToStudentMap.set(cleanNameForMatch.toLowerCase(), studentId);
            }

            const student = studentsMap.get(studentId);

            // Detailed Mapping from 'geral'
            if (row['valor_contrato']) {
                const valStr = String(row['valor_contrato']).replace('R$', '').trim().replace(/\./g, '').replace(',', '.');
                student.contractValue = parseFloat(valStr) || 0;
            }

            // Churn Logic
            const churnCols = [row['trancado'], row['desistente'], row['evadido']];
            const validChurnDates = churnCols
                .map(d => {
                    if (!d || typeof d !== 'string') return null;
                    if (d.toUpperCase() === 'TRUE' || d.toUpperCase() === 'FALSE') return null;
                    const parsed = new Date(d);
                    return isNaN(parsed.getTime()) ? null : parsed;
                })
                .filter(d => d !== null) as Date[];

            if (validChurnDates.length > 0) {
                validChurnDates.sort((a, b) => a.getTime() - b.getTime());
                student.exitDate = validChurnDates[0];
            }

            student.statusFlags.matriculado = row['matriculado'] === true || row['matriculado'] === 'TRUE';
            student.statusFlags.trancado = row['trancado'] === true || row['trancado'] === 'TRUE' || !!validChurnDates.length;
            student.statusFlags.desistente = row['desistente'] === true || row['desistente'] === 'TRUE';
            student.statusFlags.evadido = row['evadido'] === true || row['evadido'] === 'TRUE';
        });

        // 2. FINANCIAL ENRICHMENT PHASE (Transactions)
        processedData.forEach(row => {
            if (row.source === 'geral' || row.type !== 'Entrada') return;

            const rawDesc = (row.desc || '').trim();
            const rawResp = (row.resp || '').trim();

            // Match logic: Try to find student by name in the description or responsible
            let studentToUpdate = null;

            // Try to match description (clean any [1/x] first)
            let cleanDesc = rawDesc;
            const match = rawDesc.match(/(\s|^|\[|\()(\d+)\/(\d+)(?:\[.*?\])?(\)|\])?/);
            if (match) cleanDesc = rawDesc.replace(match[0], ' ').trim();

            const idFromDesc = nameToStudentMap.get(cleanDesc.toLowerCase());
            const idFromResp = rawResp ? nameToStudentMap.get(rawResp.toLowerCase()) : null;

            if (idFromDesc) studentToUpdate = studentsMap.get(idFromDesc);
            else if (idFromResp) studentToUpdate = studentsMap.get(idFromResp);

            if (studentToUpdate) {
                studentToUpdate.installments.push({ ...row, current: match ? parseInt(match[2]) : null, total: match ? parseInt(match[3]) : null });

                if (row.status === 'Pago') {
                    studentToUpdate.totalPaid += row.absVal;
                    if (row.ts && (!studentToUpdate.lastPayment || row.ts > studentToUpdate.lastPayment)) {
                        studentToUpdate.lastPayment = row.ts;
                    }
                } else if (row.status === 'Pendente') {
                    studentToUpdate.totalPending += row.absVal;
                    if (row.ts && (!studentToUpdate.nextDue || row.ts < studentToUpdate.nextDue)) {
                        studentToUpdate.nextDue = row.ts;
                    }
                } else if (row.status === 'Atrasado') {
                    studentToUpdate.totalOverdue += row.absVal;
                    if (row.ts && (!studentToUpdate.nextDue || row.ts < studentToUpdate.nextDue)) {
                        studentToUpdate.nextDue = row.ts;
                    }
                }
            }
        });

        // 3. FINAL PROCESSING
        return Array.from(studentsMap.values()).map((s: any) => {
            // Determine status from Base Geral flags first
            if (s.statusFlags.evadido) s.status = 'Evadido';
            else if (s.statusFlags.trancado) s.status = 'Trancado';
            else if (s.statusFlags.desistente) s.status = 'Cancelado';
            else if (s.totalOverdue > 0) s.status = 'Inadimplente';
            else s.status = 'Ativo';

            s.nextDueDateStr = s.nextDue ? new Date(s.nextDue).toLocaleDateString('pt-BR') : '-';

            // Current Installment
            const known = s.installments.filter((i: any) => i.current && i.total);
            if (known.length > 0) {
                known.sort((a: any, b: any) => a.current - b.current);
                const firstOpen = known.find((i: any) => i.status !== 'Pago');
                s.currentInstallment = firstOpen ? firstOpen.current : known[known.length - 1].current;
                s.totalInstallments = firstOpen ? firstOpen.total : known[known.length - 1].total;
            } else {
                s.currentInstallment = s.installments.filter((i: any) => i.status === 'Pago').length + 1;
                s.totalInstallments = s.installments.length;
            }

            return s;
        });
    }, [processedData]);

    // --- FILTERED LIST & OPTIONS ---
    const { studentsData, uniqueOptions } = useMemo(() => {
        let list = studentsRaw;

        const books = new Set<string>();
        const periods = new Set<string>();
        const days = new Set<string>();

        studentsRaw.forEach((s: any) => {
            if (s.book && s.book !== 'N/A') books.add(s.book);
            if (s.period && s.period !== 'N/A') periods.add(s.period);
            if (s.paymentDay && s.paymentDay !== '-' && s.paymentDay !== 'N/A') days.add(s.paymentDay);
        });

        if (studentFilters.status !== 'Todos') {
            list = list.filter(s => s.status === studentFilters.status);
        }
        if (studentFilters.book && studentFilters.book !== 'Todos') {
            list = list.filter(s => s.book === studentFilters.book);
        }
        if (studentFilters.period && studentFilters.period !== 'Todos') {
            list = list.filter(s => s.period === studentFilters.period);
        }
        if (studentFilters.day && studentFilters.day !== 'Todos') {
            list = list.filter(s => s.paymentDay === studentFilters.day);
        }

        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            list = list.filter(s =>
                s.name.toLowerCase().includes(lower) ||
                (s.cpf && s.cpf.toString().includes(searchTerm)) ||
                (s.financialCpf && s.financialCpf.toString().includes(searchTerm))
            );
        }

        const sortedDays = Array.from(days).map(d => parseInt(d)).filter(n => !isNaN(n)).sort((a, b) => a - b).map(String);

        return {
            studentsData: sortData(list, stuSortConfig),
            uniqueOptions: {
                books: Array.from(books).sort(),
                periods: Array.from(periods).sort(),
                days: sortedDays
            }
        };
    }, [studentsRaw, studentFilters, searchTerm, stuSortConfig]);

    // --- KPIS & STATS ---
    const studentMetrics = useMemo(() => ({
        activeBase: calculateActiveBase(studentsData),
        churnRate: calculateChurnRate(studentsData),
        avgTicket: calculateAverageTicket(studentsData)
    }), [studentsData]);

    const scholarshipData = useMemo(() => calculateScholarshipImpact(studentsData), [studentsData]);
    const studentProfileData = useMemo(() => calculateStudentProfile(studentsData), [studentsData]);

    const retentionStats = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const prevYear = currentYear - 1;

        // Use studentsRaw to identify students registered in Base Geral
        const count = (year: number, semester: number, status: string) => {
            return studentsRaw.filter(s => {
                if (s.status !== status) return false;
                // Check if any installment matched from Base Geral (or just transaction dates)
                // Actually, for retention, we usually look at the date they reached that status.
                // But simplified: check if they have installments in that period.
                return s.installments.some((i: any) => {
                    if (!i.dateObj) return false;
                    const y = i.dateObj.getFullYear();
                    const m = i.dateObj.getMonth() + 1;
                    const sem = m <= 6 ? 1 : 2;
                    return y === year && sem === semester;
                });
            }).length;
        };

        return {
            currentYear,
            cancelado: {
                currS1: count(currentYear, 1, 'Cancelado'), prevS1: count(prevYear, 1, 'Cancelado'),
                currS2: count(currentYear, 2, 'Cancelado'), prevS2: count(prevYear, 2, 'Cancelado')
            },
            evadido: {
                currS1: count(currentYear, 1, 'Evadido'), prevS1: count(prevYear, 1, 'Evadido'),
                currS2: count(currentYear, 2, 'Evadido'), prevS2: count(prevYear, 2, 'Evadido')
            },
            trancado: {
                currS1: count(currentYear, 1, 'Trancado'), prevS1: count(prevYear, 1, 'Trancado'),
                currS2: count(currentYear, 2, 'Trancado'), prevS2: count(prevYear, 2, 'Trancado')
            }
        };
    }, [studentsRaw]);

    return {
        studentsData,
        studentMetrics,
        retentionStats,
        scholarshipData,
        studentProfileData,
        searchTerm, setSearchTerm,
        studentFilters, setStudentFilters,
        stuSortConfig, setStuSortConfig,
        currentPage, setCurrentPage,
        itemsPerPage, setItemsPerPage,
        uniqueOptions
    };
};
