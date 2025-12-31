import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { formatMonthLabel, formatDateDisplay, getDefaultDates, parseDateString } from '../utils/dates';
import { formatBRL, sortData, SortConfig, parseCurrency } from '../utils/formatters';
import { calculateAverageTicket, calculateTicketDistribution } from '../utils/studentMetrics';

export const useFinancialData = (processedData: any[], dataByPeriod: any[], studentsData: any[], startDate: string, endDate: string) => {
    // --- STATE ---
    const [graphFilters, setGraphFilters] = useState({ search: '', status: 'Todos' });
    const [expenseSubTab, setExpenseSubTab] = useState('fixed');
    const [expenseFilters, setExpenseFilters] = useState({ category: 'Todas', payment: 'Todos', status: 'Todos' });
    const [expSortConfig, setExpSortConfig] = useState<SortConfig[]>([]);
    const [expensesCurrentPage, setExpensesCurrentPage] = useState(1);
    const [expensesItemsPerPage, setExpensesItemsPerPage] = useState(10);
    const [dashboardListTab, setDashboardListTab] = useState('defaulters');

    // --- DRE DATA ---
    const dreData = useMemo(() => {
        // Simplified DRE aggregation based on dataByPeriod
        const months: string[] = Array.from(new Set(dataByPeriod.map((i: any) => i.dateObj ? format(i.dateObj, 'yyyy-MM') : '').filter(Boolean) as string[])).sort();

        const recipes: any = {};
        const expenses: any = {};
        const totalRecipes: any = {};
        const totalExpenses: any = {};
        const profit: any = {};
        let grandTotalRecipes = 0;
        let grandTotalExpenses = 0;
        let grandTotalProfit = 0;

        months.forEach(m => { totalRecipes[m] = 0; totalExpenses[m] = 0; profit[m] = 0; });

        dataByPeriod.forEach((item: any) => {
            if (item.status !== 'Pago') return; // Cash basis
            if (!item.dateObj) return;
            const month = format(item.dateObj, 'yyyy-MM');

            if (item.type === 'Entrada') {
                if (!recipes[item.cat]) recipes[item.cat] = {};
                recipes[item.cat][month] = (recipes[item.cat][month] || 0) + item.absVal;
                totalRecipes[month] += item.absVal;
                grandTotalRecipes += item.absVal;
            } else {
                if (!expenses[item.cat]) expenses[item.cat] = {};
                expenses[item.cat][month] = (expenses[item.cat][month] || 0) + item.absVal;
                totalExpenses[month] += item.absVal;
                grandTotalExpenses += item.absVal;
            }
        });

        months.forEach(m => {
            profit[m] = totalRecipes[m] - totalExpenses[m];
        });
        grandTotalProfit = grandTotalRecipes - grandTotalExpenses;

        return { months, recipes, expenses, totalRecipes, totalExpenses, profit, grandTotalRecipes, grandTotalExpenses, grandTotalProfit };
    }, [dataByPeriod]);

    // --- KPI & CHARTS ---
    const { stats, financialIndicators, currentBalanceToday, graphData, balanceEvolution, categoryChart, paymentMethodChart, growth } = useMemo(() => {

        // 1. Initialize Accumulators
        let entradaPago = 0;
        let entradaPendenteTotal = 0; // Pendente + Atrasado
        let entradaAtrasado = 0;

        let saidaPago = 0;
        let saidaPendenteTotal = 0; // Pendente + Atrasado
        let saidaAtrasado = 0;

        let sumMensalidadesPago = 0; // For Ticket Médio (Numerator)
        let sumMensalidadesLast3Months = 0; // For Stable Ticket Fallback


        // Inadimplência Calculation (Global - based on processedData)
        // Logic: (Total Pendente Vencido / Total Vencido (Pago+Pendente)) * 100
        // Source: Base_looker.csv (processedData) independent of filters
        let globalTotalVencido = 0;
        let globalTotalInadimplente = 0;
        let globalCountInadimplencia = 0;

        // Multi-period accumulators
        let curMonthVencido = 0;
        let curMonthInad = 0;
        let last3MonthsVencido = 0;
        let last3MonthsInad = 0;
        let last12MonthsVencido = 0;
        let last12MonthsInad = 0;

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0); // Midnight today

        const today = new Date();
        today.setHours(23, 59, 59, 999);

        // Period Boundaries
        const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const last3MonthsStart = new Date(today.getFullYear(), today.getMonth() - 3, 1);
        const last12MonthsStart = new Date(today.getFullYear(), today.getMonth() - 12, 1);

        processedData.forEach((item: any) => {
            if (item.type !== 'Entrada' || item.status === 'Cancelado' || !item.dateObj) return;

            // GLOBAL STRICT PAST DUE
            if (item.dateObj < startOfToday) {
                const val = item.absVal;
                // Denominator: All Entrada Vencida (Paid or Pending)
                globalTotalVencido += val;

                const isInad = (item.status === 'Pendente' || item.status === 'Atrasado');

                // Numerator: Status identified as Pendente (includes Atrasado)
                if (isInad) {
                    globalTotalInadimplente += val;
                    globalCountInadimplencia++;
                }

                // 1. Current Month (up to today - i.e. past due days in current month)
                if (item.dateObj >= currentMonthStart) {
                    curMonthVencido += val;
                    if (isInad) curMonthInad += val;
                }

                // 2. Last 3 Months (excluding current)
                // Range: [last3Start, currentMonthStart)
                if (item.dateObj >= last3MonthsStart && item.dateObj < currentMonthStart) {
                    last3MonthsVencido += val;
                    if (isInad) last3MonthsInad += val;
                }

                // 3. Last 12 Months (excluding current)
                // Range: [last12Start, currentMonthStart)
                if (item.dateObj >= last12MonthsStart && item.dateObj < currentMonthStart) {
                    last12MonthsVencido += val;
                    if (isInad) last12MonthsInad += val;
                }
            }

            // Stable Ticket Medio Calculation (Last 3 Months)
            // Use 'Paid' status and 'Mensalidade' category
            if (item.type === 'Entrada' && item.status === 'Pago' && item.dateObj) {
                const isMensalidade = (item.cat || '').toLowerCase().includes('mensalidade');
                if (isMensalidade && item.dateObj >= last3MonthsStart && item.dateObj < currentMonthStart) {
                    sumMensalidadesLast3Months += item.absVal;
                }
            }
        });

        let sumEntradaTotal = 0;
        let sumPendente = 0;

        // Filtered data for Graphs
        let graphSource = dataByPeriod;
        if (graphFilters.status !== 'Todos') {
            graphSource = graphSource.filter((i: any) => i.status === graphFilters.status);
        }
        if (graphFilters.search) {
            graphSource = graphSource.filter((i: any) => (i.desc || '').toLowerCase().includes(graphFilters.search.toLowerCase()));
        }

        const dailyBalance: any = {};
        const catMap: any = {};
        const payMap: any = {};

        graphSource.forEach((item: any) => {
            const val = item.absVal;

            if (item.type === 'Entrada') {
                sumEntradaTotal += val;

                if (item.status === 'Pago') {
                    entradaPago += val;
                    // Relaxed check for Ticket Medio in current period
                    if ((item.cat || '').toLowerCase().includes('mensalidade')) {
                        sumMensalidadesPago += val;
                    }
                    payMap[item.payment] = (payMap[item.payment] || 0) + val;
                } else if (item.status === 'Pendente') {
                    entradaPendenteTotal += val;
                    sumPendente += val;
                } else if (item.status === 'Atrasado') {
                    entradaPendenteTotal += val;
                    entradaAtrasado += val;
                }
            } else if (item.type === 'Saída') {
                if (item.status === 'Pago') {
                    saidaPago += val;
                    catMap[item.cat] = (catMap[item.cat] || 0) + val;
                } else if (item.status === 'Pendente') {
                    saidaPendenteTotal += val;
                } else if (item.status === 'Atrasado') {
                    saidaPendenteTotal += val;
                    saidaAtrasado += val;
                }
            }

            if (item.dateObj) {
                const day = format(item.dateObj, 'yyyy-MM-dd');
                if (!dailyBalance[day]) dailyBalance[day] = 0;
                if (item.status === 'Pago') {
                    dailyBalance[day] += (item.type === 'Entrada' ? val : -val);
                }
            }
        });

        // 2. Final KPI Calculations
        const entrada = entradaPago;
        const saida = saidaPago; // Cash Basis Exits
        const saldo = entrada - saida;

        // Inadimplência Global


        const inadimplencia = globalTotalVencido > 0
            ? (globalTotalInadimplente / globalTotalVencido) * 100
            : 0;
        const countInadimplencia = globalCountInadimplencia;

        const inadimplenciaCurrentMonth = curMonthVencido > 0 ? (curMonthInad / curMonthVencido) * 100 : 0;
        const inadimplenciaLast3Months = last3MonthsVencido > 0 ? (last3MonthsInad / last3MonthsVencido) * 100 : 0;
        const inadimplenciaLast12Months = last12MonthsVencido > 0 ? (last12MonthsInad / last12MonthsVencido) * 100 : 0;

        // Ticket Médio & Distribution (Using synchronized utils)
        const activeBaseStudents = studentsData.filter((s: any) => s.activeFlag === 1 || s.enrolledFlag === 1);
        const ticketMedio = calculateAverageTicket(activeBaseStudents);
        const ticketDistribution = calculateTicketDistribution(activeBaseStudents);
        const activeStudentsCount = activeBaseStudents.length;

        // Stable Monthly Ticket (Last 3 Months Average)
        const ticketMedioStable = activeStudentsCount > 0 && sumMensalidadesLast3Months > 0
            ? (sumMensalidadesLast3Months / 3) / activeStudentsCount
            : 0;

        const saudeFinanceira = entrada > 0 ? ((entrada - saida) / entrada) * 100 : 0;



        // 1. Initial Balance & Global Total (All-time context)
        const periodStartTs = startDate ? new Date(startDate + 'T00:00:00').getTime() : 0;
        const periodEndTs = endDate ? new Date(endDate + 'T23:59:59').getTime() : Infinity;

        let cumulativeRealized = 0;
        let cumulativeProjected = 0;
        let totalMoneyCalculated = 0; // True balance as of TODAY

        processedData.forEach((item: any) => {
            if (item.status === 'Cancelado' || item.type === 'Info' || !item.ts) return;
            const val = item.type === 'Entrada' ? item.absVal : -item.absVal;

            // Global Realized today
            if (item.status === 'Pago' && item.dateObj && item.dateObj <= today) {
                totalMoneyCalculated += val;
            }

            // Historical context for the chart
            if (item.ts < periodStartTs) {
                if (item.status === 'Pago') {
                    cumulativeRealized += val;
                    cumulativeProjected += val;
                } else if (item.status === 'Pendente' || item.status === 'Atrasado') {
                    cumulativeProjected += val;
                }
            }
        });

        // 2. Map day-to-day movements within the SELECTED range
        const periodRealized: Record<string, number> = {};
        const periodProjected: Record<string, number> = {};

        processedData.forEach((item: any) => {
            if (item.ts >= periodStartTs && item.ts <= periodEndTs && item.status !== 'Cancelado' && item.type !== 'Info' && item.dateObj) {
                const day = format(item.dateObj, 'yyyy-MM-dd');
                const val = item.type === 'Entrada' ? item.absVal : -item.absVal;

                if (item.status === 'Pago') {
                    periodRealized[day] = (periodRealized[day] || 0) + val;
                }
                periodProjected[day] = (periodProjected[day] || 0) + val;
            }
        });

        // 3. Generate smooth daily timeline for the chart
        const balanceEvolutionCumulative: any[] = [];
        const iter = new Date(periodStartTs);
        const endIter = new Date(periodEndTs > today.getTime() + (365 * 24 * 3600 * 1000) ? today.getTime() : periodEndTs); // Cap at 1 year ahead if range is too large

        // Safety break
        let safetyCount = 0;
        while (iter <= endIter && safetyCount < 730) {
            const dayKey = format(iter, 'yyyy-MM-dd');
            cumulativeRealized += (periodRealized[dayKey] || 0);
            cumulativeProjected += (periodProjected[dayKey] || 0);

            balanceEvolutionCumulative.push({
                date: format(iter, 'dd/MM'),
                realized: cumulativeRealized,
                projected: cumulativeProjected,
            });

            iter.setDate(iter.getDate() + 1);
            safetyCount++;
        }

        const categoryChart = Object.keys(catMap).map(k => ({ name: k, value: catMap[k] })).sort((a, b) => b.value - a.value).slice(0, 5);
        const paymentMethodChart = Object.keys(payMap).map(k => ({ name: k, value: payMap[k] })).sort((a, b) => b.value - a.value);

        // Graph Data (Monthly Bar Chart)
        const graphDataMap: any = {};
        graphSource.forEach((item: any) => {
            if (!item.dateObj) return;
            const monthKey = format(item.dateObj, 'yyyy-MM');
            if (!graphDataMap[monthKey]) {
                graphDataMap[monthKey] = { name: formatMonthLabel(monthKey), monthKey, entradaPago: 0, entradaPendente: 0, saidaPago: 0, saidaPendente: 0 };
            }

            if (item.type === 'Entrada') {
                if (item.status === 'Pago') graphDataMap[monthKey].entradaPago += item.absVal;
                else if (item.status === 'Pendente' || item.status === 'Atrasado') graphDataMap[monthKey].entradaPendente += item.absVal; // Combine Pending+Overdue for graph
            } else { // Saída
                if (item.status === 'Pago') graphDataMap[monthKey].saidaPago += item.absVal;
                else if (item.status === 'Pendente' || item.status === 'Atrasado') graphDataMap[monthKey].saidaPendente += item.absVal;
            }
        });

        const graphDataArray = Object.keys(graphDataMap).sort().map(key => graphDataMap[key]);

        // Financial Indicators
        const fixedCosts = dataByPeriod.filter((i: any) => i.classification === 'Fixa' && i.type === 'Saída' && i.status === 'Pago').reduce((a: any, b: any) => a + b.absVal, 0);
        const variableCosts = dataByPeriod.filter((i: any) => i.classification === 'Variável' && i.type === 'Saída' && i.status === 'Pago').reduce((a: any, b: any) => a + b.absVal, 0);
        const cm = entradaPago - variableCosts;
        const cmPercent = entradaPago > 0 ? (cm / entradaPago) * 100 : 0;
        const breakEven = cmPercent > 0 ? (fixedCosts / (cmPercent / 100)) : 0;

        // Use current ticket if available, otherwise fallback to stable (useful for short periods/start of month)

        const breakEvenStudents = (ticketMedio > 0 ? ticketMedio : ticketMedioStable) > 0
            ? Math.ceil(breakEven / (ticketMedio > 0 ? ticketMedio : ticketMedioStable))
            : 0;

        return {
            stats: {
                entrada,
                saida,
                saldo,
                pendente: entradaPendenteTotal, // Sub for Entrada (Pending+Overdue)
                atrasado: entradaAtrasado, // Value for Inadimplency Card (Amount Overdue)
                countInadimplencia,
                inadimplencia,
                inadimplenciaCurrentMonth,
                inadimplenciaLast3Months,
                inadimplenciaLast12Months,
                saudeFinanceira,
                ticketMedio,
                saidaPendente: saidaPendenteTotal // Sub for Saída (Pending+Overdue)
            },
            financialIndicators: { cmPercent, breakEven, breakEvenStudents, margemContrib: cm, margemContribPercent: cmPercent, ticketDistribution, ticketTotal: activeStudentsCount },
            currentBalanceToday: totalMoneyCalculated,
            graphData: graphDataArray,
            balanceEvolution: balanceEvolutionCumulative,
            categoryChart,
            paymentMethodChart,
            growth: { entrada: 0, saida: 0 }
        };
    }, [dataByPeriod, graphFilters, studentsData]);

    // --- ALERTS ---
    const alerts = useMemo(() => {
        const list: any[] = [];
        const today = new Date();
        // Check for overdue today/tomorrow
        processedData.forEach((item: any) => {
            if (item.status === 'Pendente' && item.dateObj) {
                const diff = (item.dateObj.getTime() - today.getTime()) / (1000 * 3600 * 24);
                if (diff >= 0 && diff <= 3) {
                    list.push({ id: item.id, message: `Vencimento próximo: ${item.desc} (${formatBRL(item.absVal, true, false)})` });
                }
            }
        });
        return list;
    }, [processedData]);

    // --- DASHBOARD LISTS ---
    const dashboardLists = useMemo(() => {
        const topDefaulters = studentsData
            .filter((s: any) => s.status === 'Inadimplente' || s.totalOverdue > 0)
            .sort((a: any, b: any) => b.totalOverdue - a.totalOverdue)
            .slice(0, 10);

        const nextPayments = processedData
            .filter((i: any) => i.status === 'Pendente' && i.type === 'Saída')
            .sort((a: any, b: any) => (a.ts || Infinity) - (b.ts || Infinity))
            .slice(0, 10);

        const lastReceipts = processedData
            .filter((i: any) => i.status === 'Pago' && i.type === 'Entrada')
            .sort((a: any, b: any) => (b.ts || 0) - (a.ts || 0)) // Newest first
            .slice(0, 10);

        return { topDefaulters, nextPayments, lastReceipts };
    }, [studentsData, processedData]);

    // --- EXPENSES DATA ---
    const { expensesTableData, uniqueExpenseOptions } = useMemo(() => {
        let filtered = processedData.filter((i: any) => i.type === 'Saída');
        if (startDate || endDate) {
            const startTs = startDate ? new Date(startDate + 'T00:00:00').getTime() : 0;
            const endTs = endDate ? new Date(endDate + 'T23:59:59').getTime() : Infinity;
            filtered = filtered.filter((i: any) => i.ts && i.ts >= startTs && i.ts <= endTs);
        }
        // Sub-tab filter
        const isFixed = expenseSubTab === 'fixed';
        filtered = filtered.filter((i: any) => isFixed ? i.classification === 'Fixa' : i.classification === 'Variável');

        // Dropdown Options
        const cats = Array.from(new Set(filtered.map((i: any) => i.cat))).sort();
        const payments = Array.from(new Set(filtered.map((i: any) => i.payment))).sort();

        // Component filters
        if (expenseFilters.category !== 'Todas') filtered = filtered.filter((i: any) => i.cat === expenseFilters.category);
        if (expenseFilters.payment !== 'Todos') filtered = filtered.filter((i: any) => i.payment === expenseFilters.payment);
        if (expenseFilters.status !== 'Todos') filtered = filtered.filter((i: any) => i.status === expenseFilters.status);
        if (graphFilters.search) filtered = filtered.filter((i: any) => i.desc.toLowerCase().includes(graphFilters.search.toLowerCase()));

        return {
            expensesTableData: {
                fixed: isFixed ? sortData(filtered, expSortConfig) : [],
                variable: !isFixed ? sortData(filtered, expSortConfig) : []
            },
            uniqueExpenseOptions: { cats, payments }
        };
    }, [processedData, startDate, endDate, expenseFilters, graphFilters.search, expenseSubTab, expSortConfig]);

    const handleApplyFilters = () => {
        // Logic mostly UI centric, moved to App or Component. 
        // But setting graphFilters is state here.
    };

    const handleClearFilters = () => { setGraphFilters({ search: '', status: 'Todos' }); };

    return {
        dreData,
        stats, financialIndicators, currentBalanceToday, graphData, balanceEvolution, categoryChart, paymentMethodChart, growth,
        alerts,
        dashboardLists,
        expensesTableData, uniqueExpenseOptions,
        graphFilters, setGraphFilters,
        expenseSubTab, setExpenseSubTab,
        expenseFilters, setExpenseFilters,
        expSortConfig, setExpSortConfig,
        expensesCurrentPage, setExpensesCurrentPage,
        expensesItemsPerPage, setExpensesItemsPerPage,
        dashboardListTab, setDashboardListTab,
        handleClearFilters
    };
};
