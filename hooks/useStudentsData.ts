import { useState, useMemo } from 'react';
import { sortData, SortConfig } from '../utils/formatters';
import {
    calculateActiveBase,
    calculateChurnRate,
    calculateAverageTicket,
    calculateScholarshipImpact,
    calculateStudentProfile,
    calculateTicketDistribution,
    calculatePaymentDayDistribution
} from '../utils/studentMetrics';

export const useStudentsData = (processedData: any[]) => {
    // --- STATE ---
    const [searchTerm, setSearchTerm] = useState('');
    const [studentFilters, setStudentFilters] = useState<{ status: string, book?: string, period?: string, day?: string }>({ status: 'Todos' });
    const [stuSortConfig, setStuSortConfig] = useState<SortConfig[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [retentionYear, setRetentionYear] = useState(new Date().getFullYear());

    // --- RAW DATA PROCESSING (Hydrated Object Pattern) ---
    const studentsRaw = useMemo(() => {
        if (!processedData || !processedData.length) return [];

        const studentsMap = new Map();
        const nameToIdIndex = new Map(); // Fallback index for reconciliation

        // STEP 1: INDEXING (Base Geral - The Skeleton)
        processedData.forEach(row => {
            if (row.source !== 'geral') return;

            const id = (row['id'] || row.desc || '').trim();
            const rawName = (row['nome_completo_aluno'] || row['Nome'] || '').trim();

            // Cleanup name for fallback matching (removing [1/x] tags)
            let matchName = rawName.toLowerCase();
            const tagMatch = rawName.match(/(\s|^|\[|\()(\d+)\/(\d+)(?:\[.*?\])?(\)|\])?/);
            if (tagMatch) matchName = rawName.replace(tagMatch[0], ' ').trim().toLowerCase();

            if (!id) return; // Skip invalid rows without ID

            const student = {
                ...row, // Preserve all original columns
                id,
                name: rawName,
                matchName,
                responsible: (row['nome_responsavel_financeiro'] || row.resp || '').trim(),
                phone: row['telefone_contato'] || '',
                age: parseInt(row['idade']) || null,
                enrollmentDate: row['data_matricula'] || null,
                contractValue: 0,
                currentValue: 0,
                valor_atual: 0,
                scholarship: row['bolsa'] || '0%',
                book: row['livro'] || null,
                paymentDay: row['dia_pagamento'] || null,
                period: row['tempo_primeiro_contrato'] || null,
                cpf: row['cpf_aluno'] || null,
                financialCpf: row['cpf_responsavel_financeiro'] || null,
                birthDate: row['data_nascimento'] || null,

                // Real-time Flags (Columns from Geral)
                // Real-time Flags (Columns from Geral)
                flags: {
                    vigente: row['vigente'] === true || row['vigente'] === 'TRUE',
                    matriculado: row['matriculado'] === true || row['matriculado'] === 'TRUE',
                    concluido: row['concluido'] === true || row['concluido'] === 'TRUE',
                    trancadoDate: null as Date | null,
                    desistenteDate: null as Date | null,
                    evadidoDate: null as Date | null,
                    concluidoDate: null as Date | null
                },

                // Buckets for enrichment
                installments: [] as any[],
                totalPaid: 0,
                totalPending: 0,
                totalOverdue: 0,
                lastPayment: null as number | null,
                nextDue: null as number | null,
                status: 'Outros',
                // Metric Flags
                retentionFlag: 0,
                churnFlag: 0,
                pauseFlag: 0
            };

            // Parse exit dates if present
            const parseDate = (val: any) => {
                if (!val || val === 'TRUE' || val === 'FALSE' || val === true || val === false) return null;

                // If already a date object
                if (val instanceof Date) return isNaN(val.getTime()) ? null : val;

                if (typeof val !== 'string') return null;

                // Try parsing DD/MM/YYYY
                const match = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
                if (match) {
                    const d = parseInt(match[1]);
                    const m = parseInt(match[2]) - 1;
                    const y = parseInt(match[3]);
                    const date = new Date(y, m, d);
                    return isNaN(date.getTime()) ? null : date;
                }

                const d = new Date(val);
                return isNaN(d.getTime()) ? null : d;
            };
            student.flags.trancadoDate = parseDate(row['trancado']);
            student.flags.desistenteDate = parseDate(row['desistente']);
            student.flags.evadidoDate = parseDate(row['evadido']);
            student.flags.concluidoDate = parseDate(row['concluido']);

            // Parse values
            const cleanVal = (v: any) => {
                const s = String(v || '0').replace('R$', '').trim().replace(/\./g, '').replace(',', '.');
                return parseFloat(s) || 0;
            };

            if (row['valor_contrato']) student.contractValue = cleanVal(row['valor_contrato']);
            if (row['valor_atual']) {
                const v = cleanVal(row['valor_atual']);
                student.valor_atual = v;
                student.currentValue = v;
            }

            studentsMap.set(id, student);
            if (matchName) nameToIdIndex.set(matchName, id);
        });

        // STEP 2: BUCKETING (Financeiro - The Muscle)
        processedData.forEach(row => {
            if (row.source === 'geral' || row.type !== 'Entrada') return;

            const desc = (row.desc || '').trim();
            const resp = (row.resp || '').trim();

            // Reconciliation Strategy: 1. ID check (if in desc), 2. Name check, 3. Resp check
            let studentId = null;

            // Try matching ID directly if it's in a specific column or found in desc
            if (row.id && studentsMap.has(row.id)) {
                studentId = row.id;
            } else {
                // Try matching cleaned description name
                let cleanDesc = desc.toLowerCase();
                const tagMatch = desc.match(/(\s|^|\[|\()(\d+)\/(\d+)(?:\[.*?\])?(\)|\])?/);
                if (tagMatch) cleanDesc = desc.replace(tagMatch[0], ' ').trim().toLowerCase();

                studentId = nameToIdIndex.get(cleanDesc) || (resp ? nameToIdIndex.get(resp.toLowerCase()) : null);
            }

            if (studentId) {
                const student = studentsMap.get(studentId);
                student.installments.push(row);

                // Cumulative Financials
                if (row.status === 'Pago') {
                    student.totalPaid += row.absVal;
                    if (row.ts && (!student.lastPayment || row.ts > student.lastPayment)) student.lastPayment = row.ts;
                } else if (row.status === 'Pendente') {
                    student.totalPending += row.absVal;
                    if (row.ts && (!student.nextDue || row.ts < student.nextDue)) student.nextDue = row.ts;
                } else if (row.status === 'Atrasado') {
                    student.totalOverdue += row.absVal;
                    if (row.ts && (!student.nextDue || row.ts < student.nextDue)) student.nextDue = row.ts;
                }
            }
        });

        // STEP 3: COMPUTATION (Applying Hierarchy & Formatting)
        return Array.from(studentsMap.values()).map((s: any) => {
            // Business Logic Priority: Concluido > Evadido > Desistente > Trancado > Ativo > Matriculado > Outros
            if (s.flags.concluido || s.flags.concluidoDate) {
                s.status = 'Concluído';
            } else if (s.flags.evadidoDate) {
                s.status = 'Evadido';
            } else if (s.flags.desistenteDate) {
                s.status = 'Desistente';
            } else if (s.flags.trancadoDate) {
                s.status = 'Trancado';
            } else if (s.flags.vigente) {
                s.status = s.totalOverdue > 0 ? 'Inadimplente/Ativo' : 'Ativo';
            } else if (s.flags.matriculado) {
                s.status = s.totalOverdue > 0 ? 'Inadimplente/Matriculado' : 'Matriculado';
            } else {
                s.status = 'Outros';
            }

            // Flags for Dashboard
            s.activeFlag = (s.status === 'Ativo' || s.status === 'Inadimplente/Ativo') ? 1 : 0;
            s.enrolledFlag = (s.status === 'Matriculado' || s.status === 'Inadimplente/Matriculado') ? 1 : 0;
            s.finishedFlag = (s.status === 'Concluído') ? 1 : 0;
            s.churnFlag = (s.status === 'Desistente' || s.status === 'Evadido') ? 1 : 0;
            s.pauseFlag = (s.status === 'Trancado') ? 1 : 0;

            // Deprecated (keeping for compatibility with other internal components if any, but marking as unused in metrics)
            s.retentionFlag = s.activeFlag + s.enrolledFlag;

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
            if (studentFilters.status === 'Ativo') {
                list = list.filter(s => s.status === 'Ativo' || s.status === 'Inadimplente/Ativo');
            } else if (studentFilters.status === 'Matriculado') {
                list = list.filter(s => s.status === 'Matriculado' || s.status === 'Inadimplente/Matriculado');
            } else {
                list = list.filter(s => s.status === studentFilters.status);
            }
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
        activeBase: calculateActiveBase(studentsRaw),
        churnRate: calculateChurnRate(studentsRaw),
        avgTicket: calculateAverageTicket(studentsRaw),
        ticketDistribution: calculateTicketDistribution(studentsRaw)
    }), [studentsRaw]);

    const scholarshipData = useMemo(() => {
        const activeBase = studentsRaw.filter(s => s.activeFlag === 1 || s.enrolledFlag === 1);
        return calculateScholarshipImpact(activeBase);
    }, [studentsRaw]);

    const studentProfileData = useMemo(() => {
        const activeBase = studentsRaw.filter(s => s.activeFlag === 1 || s.enrolledFlag === 1);
        return calculateStudentProfile(activeBase);
    }, [studentsRaw]);

    const paymentDayData = useMemo(() => {
        const activeBase = studentsRaw.filter(s => s.activeFlag === 1 || s.enrolledFlag === 1);
        return calculatePaymentDayDistribution(activeBase);
    }, [studentsRaw]);

    const retentionStats = useMemo(() => {
        const currentYear = retentionYear;
        const prevYear = currentYear - 1;

        const countByDate = (year: number, semester: number, dateKey: string) => {
            return studentsRaw.filter((s: any) => {
                const date = s.flags[dateKey];
                if (!date) return false;

                const d = new Date(date);
                if (isNaN(d.getTime())) return false;

                const y = d.getFullYear();
                const m = d.getMonth() + 1;
                const sem = m <= 6 ? 1 : 2;

                return y === year && sem === semester;
            }).length;
        };

        return {
            currentYear,
            selectedYear: retentionYear,
            setRetentionYear,
            cancelado: {
                currS1: countByDate(currentYear, 1, 'desistenteDate'), prevS1: countByDate(prevYear, 1, 'desistenteDate'),
                currS2: countByDate(currentYear, 2, 'desistenteDate'), prevS2: countByDate(prevYear, 2, 'desistenteDate')
            },
            evadido: {
                currS1: countByDate(currentYear, 1, 'evadidoDate'), prevS1: countByDate(prevYear, 1, 'evadidoDate'),
                currS2: countByDate(currentYear, 2, 'evadidoDate'), prevS2: countByDate(prevYear, 2, 'evadidoDate')
            },
            trancado: {
                currS1: countByDate(currentYear, 1, 'trancadoDate'), prevS1: countByDate(prevYear, 1, 'trancadoDate'),
                currS2: countByDate(currentYear, 2, 'trancadoDate'), prevS2: countByDate(prevYear, 2, 'trancadoDate')
            }
        };
    }, [studentsRaw, retentionYear]);

    return {
        studentsData,
        studentMetrics,
        retentionStats,
        scholarshipData,
        studentProfileData,
        paymentDayData,
        searchTerm, setSearchTerm,
        studentFilters, setStudentFilters,
        stuSortConfig, setStuSortConfig,
        currentPage, setCurrentPage,
        itemsPerPage, setItemsPerPage,
        uniqueOptions,
        totalStudentsCount: studentsRaw.length
    };
};
