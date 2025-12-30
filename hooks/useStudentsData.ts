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

    // --- RAW STARTUP DATA LOGIC ---
    const studentsRaw = useMemo(() => {
        if (!processedData || !processedData.length) return [];

        const studentsMap = new Map();

        processedData.forEach(row => {
            // Filter out non-income (defensive check, though usually students pay us)
            // AND ensure it's not just a generic label row. 
            // Often 'Mensalidade' is in desc if it's not a student row? 
            // User says: 'Apenas nomes de alunos são alunos'. 
            // If desc is 'Mensalidade', likely it's NOT a student name unless the name is elsewhere.
            // But usually the row has 'Valentina...'. 

            if (row.type !== 'Entrada' && row.source !== 'geral') return;

            // Name mapping: For Base Geral, use 'nome_completo_aluno'
            let studentName = row.desc;
            if (row.source === 'geral') {
                studentName = row['nome_completo_aluno'] || row['Nome'] || row['nome'] || row.desc;
            }
            // For Base Principal (Entrada), use Desc or Resp
            if (!studentName && !row.resp) return;

            const rawName = (studentName || row.resp).trim(); // Prioritize Student Name

            // Parse [x/y] from name
            let cleanName = rawName;
            let installmentInfo: any = null;
            // Match pattern like Name [1/10], Name (1/10), Name 1/6, Name 1/6[2]
            const match = rawName.match(/(\s|^|\[|\()(\d+)\/(\d+)(?:\[.*?\])?(\)|\])?/);
            if (match) {
                cleanName = rawName.replace(match[0], ' ').trim();
                installmentInfo = { current: parseInt(match[2]), total: parseInt(match[3]) };
            }

            if (!studentsMap.has(cleanName)) {
                studentsMap.set(cleanName, {
                    id: cleanName,
                    name: cleanName,
                    totalPaid: 0,
                    totalPending: 0,
                    totalOverdue: 0,
                    installments: [],
                    status: 'Ativo',
                    lastPayment: null,
                    nextDue: null,
                    responsible: row.resp || row['nome_responsavel_financeiro'] || '',
                    phone: '',
                    age: null,
                    enrollmentDate: null,
                    contractValue: null,
                    currentValue: null,
                    scholarship: null,
                    books: new Set(),
                    periods: new Set(),
                    days: new Set(),
                    vigente: null,
                    externalId: null,
                    cpf: null,
                    financialCpf: null,
                    birthDate: null,
                    exitDate: null,
                    statusFlags: { matriculado: false, trancado: false, desistente: false, evadido: false }
                });
            }
            const student = studentsMap.get(cleanName);

            // Metadata Enrichment from 'geral' source
            if (row.source === 'geral') {
                if (row['telefone_contato']) student.phone = row['telefone_contato'];
                if (row['idade']) student.age = parseInt(row['idade']) || null;
                if (row['data_matricula']) student.enrollmentDate = row['data_matricula'];
                if (row['valor_contrato']) student.contractValue = row['valor_contrato'];
                if (row['valor_atual']) student.currentValue = row['valor_atual'];
                if (row['bolsa']) student.scholarship = row['bolsa'];
                if (row['dia_pagamento']) student.paymentDay = row['dia_pagamento']; // Override from Geral
                if (row['livro']) student.book = row['livro'];
                if (row['nome_responsavel_financeiro']) student.responsible = row['nome_responsavel_financeiro'];
                if (row['tempo_primeiro_contrato']) student.period = row['tempo_primeiro_contrato'];
                if (row['vigente']) student.vigente = row['vigente'];
                if (row['id']) student.externalId = row['id'];
                if (row['cpf_aluno']) student.cpf = row['cpf_aluno'];
                if (row['cpf_responsavel_financeiro']) student.financialCpf = row['cpf_responsavel_financeiro'];
                if (row['data_nascimento']) student.birthDate = row['data_nascimento'];

                if (row['valor_contrato']) {
                    const valStr = String(row['valor_contrato']).replace('R$', '').trim().replace(/\./g, '').replace(',', '.');
                    student.contractValue = parseFloat(valStr) || 0;
                }

                // Calculate Exit Date (Data de Saída - First non-null date from churn columns)
                // Logic based on Image 1: "Pega a primeira data não nula entre essas três"
                const churnCols = [row['trancado'], row['desistente'], row['evadido']];
                const validChurnDates = churnCols
                    .map(d => {
                        if (!d || typeof d !== 'string') return null;
                        if (d.toUpperCase() === 'TRUE' || d.toUpperCase() === 'FALSE') return null; // Skip flags
                        // Try standard date parsing
                        const parsed = new Date(d);
                        return isNaN(parsed.getTime()) ? null : parsed;
                    })
                    .filter(d => d !== null) as Date[];

                if (validChurnDates.length > 0) {
                    validChurnDates.sort((a, b) => a.getTime() - b.getTime());
                    student.exitDate = validChurnDates[0]; // Earliest date is the Exit Date
                }

                // Status Flags
                student.statusFlags.matriculado = row['matriculado'] === true || row['matriculado'] === 'TRUE';
                student.statusFlags.trancado = row['trancado'] === true || row['trancado'] === 'TRUE' || !!validChurnDates.length; // If has date, effectively true
                student.statusFlags.desistente = row['desistente'] === true || row['desistente'] === 'TRUE';
                student.statusFlags.evadido = row['evadido'] === true || row['evadido'] === 'TRUE';

                // Also add to options
                if (row['livro']) student.books.add(row['livro']);
                if (row['tempo_primeiro_contrato']) student.periods.add(row['tempo_primeiro_contrato']);
            }

            // Add installment with extra info ONLY if it's a Transaction (Entrada)
            if (row.type === 'Entrada') {
                student.installments.push({ ...row, ...installmentInfo });
            }

            // Update totals
            if (row.status === 'Pago') {
                student.totalPaid += row.absVal;
                if (row.ts && (!student.lastPayment || row.ts > student.lastPayment)) {
                    student.lastPayment = row.ts;
                }
            } else if (row.status === 'Pendente') {
                student.totalPending += row.absVal;
                if (row.ts && (!student.nextDue || row.ts < student.nextDue)) {
                    student.nextDue = row.ts;
                }
            } else if (row.status === 'Atrasado') {
                student.totalOverdue += row.absVal;
                if (row.ts && (!student.nextDue || row.ts < student.nextDue)) {
                    student.nextDue = row.ts;
                }
            }
        });

        // Post-process students to determine status and sort
        return Array.from(studentsMap.values()).map((s: any) => {
            // Determine status
            const hasSpecialStatus = s.installments.some((r: any) => ['Cancelado', 'Evadido', 'Trancado', 'Concluído'].includes(r.status));
            if (hasSpecialStatus) {
                const specialRow = s.installments.find((r: any) => ['Cancelado', 'Evadido', 'Trancado', 'Concluído'].includes(r.status));
                s.status = specialRow ? specialRow.status : 'Ativo';
            } else if (s.totalOverdue > 0) {
                s.status = 'Inadimplente';
            } else {
                s.status = 'Ativo';
            }

            s.nextDueDateStr = s.nextDue ? new Date(s.nextDue).toLocaleDateString('pt-BR') : '-';

            // Current Installment Logic using parsed numbers
            const knownInstallments = s.installments.filter((i: any) => i.current && i.total);

            if (knownInstallments.length > 0) {
                // Sort by Installment Index
                knownInstallments.sort((a: any, b: any) => a.current - b.current);

                // Find first Pending/Atrasado to show as "Current"
                const firstOpen = knownInstallments.find((i: any) => i.status !== 'Pago');

                if (firstOpen) {
                    s.currentInstallment = firstOpen.current;
                    s.totalInstallments = firstOpen.total;
                } else {
                    // If all are paid, show the last one
                    const last = knownInstallments[knownInstallments.length - 1];
                    s.currentInstallment = last.current;
                    s.totalInstallments = last.total;
                }
            } else {
                // Fallback: estimate based on paid count
                s.currentInstallment = s.installments.filter((i: any) => i.status === 'Pago').length + 1;
                s.totalInstallments = s.installments.length;
            }

            return s;
        });
    }, [processedData]);

    // --- FILTERED LIST ---
    // --- FILTERED LIST ---
    const { studentsData, uniqueOptions } = useMemo(() => {
        let list = studentsRaw;

        // Collect options before full filtering
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

    // --- RETENTION STATS (Uses RAW Data or FILTERED? Usually Raw for accurate stats regardless of view filter) ---
    // In App.tsx it used `studentsData` which WAS the filtered list (line 347 calls `studentsData`).
    // However, often retention stats should be global. 
    // Code in App.tsx: `studentsData` was the result of lines 204-318.
    // Lines 308-315 applied filters *to* `students`.
    // So `studentsData` in App.tsx *was* filtered.
    // I will keep it consistent: calculate retention stats based on `studentsData` (filtered).
    // WAIT, usually KPI cards should show global status unless specified.
    // Actually, standard behavior in dashboards: Top KPIs follow filters? 
    // Let's stick to `studentsData` (Filtered) to match exactly what App.tsx did.

    const retentionStats = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const prevYear = currentYear - 1;

        // 1. Build a specific map for Base Geral students to ensure we only count them
        const geralMap = new Map();
        if (processedData) {
            processedData.forEach((row: any) => {
                if (row.source !== 'geral') return; // ONLY Base Geral
                if (row.type !== 'Entrada' && row.source !== 'geral') return; // Base Geral might be 'Info'

                // Name cleaning logic (duplicated from studentsRaw for consistency)
                let name = row.desc;
                if (row.source === 'geral') name = row['nome_completo_aluno'] || row['Nome'] || row.desc;

                if (!row.resp && !name) return;
                const rawName = (name || row.resp).trim(); // Prioritize Desc (Student Name)
                let cleanName = rawName;
                const match = rawName.match(/(\s|^|\[|\()(\d+)\/(\d+)(?:\[.*?\])?(\)|\])?/);
                if (match) cleanName = rawName.replace(match[0], ' ').trim();

                if (!geralMap.has(cleanName)) {
                    geralMap.set(cleanName, { installments: [], status: 'Ativo', totalOverdue: 0 });
                }
                const s = geralMap.get(cleanName);
                s.installments.push(row);
                if (row.status === 'Atrasado') s.totalOverdue += row.absVal;
            });
        }

        // 2. Process status for these specific students
        const geralStudents = Array.from(geralMap.values()).map((s: any) => {
            const hasSpecialStatus = s.installments.some((r: any) => ['Cancelado', 'Evadido', 'Trancado', 'Concluído'].includes(r.status));
            if (hasSpecialStatus) {
                const specialRow = s.installments.find((r: any) => ['Cancelado', 'Evadido', 'Trancado', 'Concluído'].includes(r.status));
                s.status = specialRow ? specialRow.status : 'Ativo';
            } else if (s.totalOverdue > 0) {
                s.status = 'Inadimplente';
            } else {
                s.status = 'Ativo';
            }
            return s;
        });

        // 3. Count helper
        const count = (year: number, semester: number, status: string) => {
            return geralStudents.filter(s => {
                if (s.status !== status) return false;
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
    }, [processedData]);

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
