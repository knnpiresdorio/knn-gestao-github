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
        const months: string[] = Array.from(new Set(dataByPeriod.map((i: any) => {
            // For Date List: Use Payment Date if Paid, else Due Date
            if (i.status === 'Pago' && i.dateExecObj) return format(i.dateExecObj, 'yyyy-MM');
            return i.dateObj ? format(i.dateObj, 'yyyy-MM') : '';
        }).filter(Boolean) as string[])).sort();

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

            // For Cash Basis DRE: Use Payment Date (dateExecObj) if available, fallback to Due Date
            const targetDate = item.dateExecObj || item.dateObj;
            if (!targetDate) return;

            const month = format(targetDate, 'yyyy-MM');

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
    const {
        stats,
        financialIndicators,
        currentBalanceToday,
        graphData,
        balanceEvolution,
        balanceEvolutionBiweekly,
        balanceEvolutionMonthly,
        categoryChart,
        paymentMethodChart,
        growth
    } = useMemo(() => {

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

        // Rolling 30 Days for "Atual" Inadimplencia (avoids 0% at start of month)
        const last30DaysStart = new Date(today);
        last30DaysStart.setDate(today.getDate() - 30);

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

                // 1. Current Snapshot (Last 30 Days) - Previously was Calendar Month
                if (item.dateObj >= last30DaysStart) {
                    curMonthVencido += val;
                    if (isInad) curMonthInad += val;
                }

                // 2. Last 3 Months (Rolling - includes current month up to today)
                if (item.dateObj >= last3MonthsStart) {
                    last3MonthsVencido += val;
                    if (isInad) last3MonthsInad += val;
                }

                // 3. Last 12 Months (Rolling - includes current month up to today)
                if (item.dateObj >= last12MonthsStart) {
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

            // For Daily Timeline: Use Payment Date if Paid
            const targetDate = (item.status === 'Pago' && item.dateExecObj) ? item.dateExecObj : item.dateObj;

            if (targetDate) {
                const day = format(targetDate, 'yyyy-MM-dd');
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
        // If NO startDate is provided (All time view), find the earliest data point to start the chart
        let effectiveStartTs = startDate ? new Date(startDate + 'T00:00:00').getTime() : 0;

        if (!startDate && processedData.length > 0) {
            const minTs = Math.min(...processedData.filter((i: any) => i.ts > 0).map((i: any) => i.ts));
            if (minTs !== Infinity) {
                effectiveStartTs = minTs;
            }
        }

        const periodStartTs = effectiveStartTs;
        const periodEndTs = endDate ? new Date(endDate + 'T23:59:59').getTime() : Infinity;

        let cumulativeRealized = 0;
        let cumulativeProjected = 0;
        let totalMoneyCalculated = 0; // True balance as of TODAY

        processedData.forEach((item: any) => {
            if (item.status === 'Cancelado' || item.type === 'Info' || !item.ts) return;
            const val = item.type === 'Entrada' ? item.absVal : -item.absVal;

            // Global Realized today
            // Use dateExecObj for comparison if Paid
            const itemDate = (item.status === 'Pago' && item.dateExecObj) ? item.dateExecObj : item.dateObj;

            if (item.status === 'Pago' && itemDate && itemDate <= today) {
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
            // Timeline Mapping: Use Payment Date if Paid
            const effectiveDate = (item.status === 'Pago' && item.dateExecObj) ? item.dateExecObj : (item.ts ? new Date(item.ts) : null);
            const effectiveTs = effectiveDate ? effectiveDate.getTime() : 0;

            if (effectiveTs >= periodStartTs && effectiveTs <= periodEndTs && item.status !== 'Cancelado' && item.type !== 'Info' && effectiveDate) {
                const day = format(effectiveDate, 'yyyy-MM-dd');
                const val = item.type === 'Entrada' ? item.absVal : -item.absVal;

                if (item.status === 'Pago') {
                    periodRealized[day] = (periodRealized[day] || 0) + val;
                }
                periodProjected[day] = (periodProjected[day] || 0) + val;
            }
        });

        // 3. Generate smooth daily timeline for the chart
        const balanceEvolutionCumulative: any[] = [];
        const balanceEvolutionBiweekly: any[] = [];
        const balanceEvolutionMonthly: any[] = [];

        // Default to 1 year ahead strictly as per user request
        const defaultFuture = today.getTime() + (365 * 24 * 3600 * 1000);
        const autoEndTs = defaultFuture;

        const iter = new Date(periodStartTs);
        // If specific endDate is filtered, use it. Else use auto-extended future date.
        const targetEndTs = endDate ? periodEndTs : autoEndTs;

        const endIter = new Date(targetEndTs);

        // Safety break - 5 Years (approx 1830 days)
        let safetyCount = 0;

        // Helper to check if a date is in the future (after today)
        const isFuture = (d: Date) => d > today;

        let cumRealized = cumulativeRealized;
        let cumProjected = cumulativeProjected;

        while (iter <= endIter && safetyCount < 1830) {
            const dayKey = format(iter, 'yyyy-MM-dd');
            cumRealized += (periodRealized[dayKey] || 0);
            cumProjected += (periodProjected[dayKey] || 0);

            const iterIsFuture = isFuture(iter);
            const dayOfMonth = iter.getDate();

            // Daily (Original)
            balanceEvolutionCumulative.push({
                date: format(iter, 'dd/MM/yy'),
                realized: iterIsFuture ? null : cumRealized,
                projected: cumProjected,
            });

            // Bi-weekly (1st and 15th)
            if (dayOfMonth === 1 || dayOfMonth === 15) {
                balanceEvolutionBiweekly.push({
                    date: format(iter, 'dd/MM/yy'),
                    realized: iterIsFuture ? null : cumRealized,
                    projected: cumProjected,
                });
            }

            // Monthly (1st)
            if (dayOfMonth === 1) {
                balanceEvolutionMonthly.push({
                    date: format(iter, 'dd/MM/yy'),
                    realized: iterIsFuture ? null : cumRealized,
                    projected: cumProjected,
                });
            }

            iter.setDate(iter.getDate() + 1);
            safetyCount++;
        }

        const categoryChart = Object.keys(catMap).map(k => ({ name: k, value: catMap[k] })).sort((a, b) => b.value - a.value).slice(0, 5);
        const paymentMethodChart = Object.keys(payMap).map(k => ({ name: k, value: payMap[k] })).sort((a, b) => b.value - a.value);

        // Graph Data (Monthly Bar Chart)
        const graphDataMap: any = {};
        graphSource.forEach((item: any) => {
            // For Monthly Bar Graph: Use Payment Date if Paid (Cash View)
            const targetDate = (item.status === 'Pago' && item.dateExecObj) ? item.dateExecObj : item.dateObj;
            if (!targetDate) return;

            const monthKey = format(targetDate, 'yyyy-MM');
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

        // --- NEW: QUARTERLY BREAK-EVEN & TICKET CALCS ---

        // 1. Define Quarter Ranges
        const qToday = new Date();
        qToday.setHours(23, 59, 59, 999);
        const currentQuarterStart = new Date(qToday);
        currentQuarterStart.setDate(currentQuarterStart.getDate() - 90); // Last 90 Days approach as per request "Trimestral" often implies rolling interval for stability

        const prevQuarterEnd = new Date(currentQuarterStart);
        prevQuarterEnd.setDate(prevQuarterEnd.getDate() - 1);
        const prevQuarterStart = new Date(prevQuarterEnd);
        prevQuarterStart.setDate(prevQuarterStart.getDate() - 90);

        // 2. Helper to calc metrics for a specific range
        const calcQuarterMetrics = (start: Date, end: Date) => {
            let qFixed = 0;
            let qVar = 0;
            let qRev = 0;

            processedData.forEach((item: any) => {
                // Quarterly Break Even: Use Payment Date
                const targetDate = item.dateExecObj || item.dateObj;
                if (item.status === 'Pago' && targetDate && targetDate >= start && targetDate <= end) {
                    if (item.type === 'Entrada') {
                        qRev += item.absVal;
                    } else if (item.type === 'Saída') {
                        if (item.classification === 'Fixa') qFixed += item.absVal;
                        else if (item.classification === 'Variável') qVar += item.absVal;
                    }
                }
            });

            // Quarterly Average (Monthly view) -> Divide by 3
            const avgFixed = qFixed / 3;
            const avgRev = qRev / 3;
            const avgVar = qVar / 3;

            const qCmPercent = avgRev > 0 ? ((avgRev - avgVar) / avgRev) * 100 : 0;
            const qBreakEven = qCmPercent > 0 ? (avgFixed / (qCmPercent / 100)) : 0;

            return qBreakEven;
        };

        const breakEvenQuarterly = calcQuarterMetrics(currentQuarterStart, qToday);
        const breakEvenQuarterlyPrev = calcQuarterMetrics(prevQuarterStart, prevQuarterEnd);

        // Students needed based on CURRENT Active Ticket (Global)
        const breakEvenQuarterlyStudents = ticketMedio > 0 ? Math.ceil(breakEvenQuarterly / ticketMedio) : 0;


        // 3. Quarterly Ticket Medio (Calendar Quarters of Current Year or Filtered Year)
        const currentYearNum = endDate ? new Date(endDate).getFullYear() : qToday.getFullYear();
        const quarterlyTickets = [];
        let ticketMedioQuarterlyCurrent = 0;

        for (let q = 1; q <= 4; q++) {
            const qStart = new Date(currentYearNum, (q - 1) * 3, 1);
            const qEnd = new Date(currentYearNum, q * 3, 0, 23, 59, 59); // Last day of quarter

            // Removed the break for future quarters so all 4 always display

            let qRevenue = 0;
            let qActiveCount = 0; // Approximation: count distinct students paying in this period? 
            // Better: Average ticket = Total Revenue (Tuition) / Count of Payments? 
            // Or Avg Ticket = Sum(Active Students each month) / 3? 
            // "Ticket Medio" usually = Faturamento / Numero de Vendas (ou Alunos Pagantes)

            // Let's use: Sum of Tuition Payments / Count of Tuition Payments
            let tuitionSum = 0;
            let tuitionCount = 0;

            processedData.forEach((item: any) => {
                // Modified: Include 'Pendente' and 'Atrasado' for projection
                if (item.type === 'Entrada' && ['Pago', 'Pendente', 'Atrasado'].includes(item.status) && item.dateObj && item.dateObj >= qStart && item.dateObj <= qEnd) {
                    if ((item.cat || '').toLowerCase().includes('mensalidade')) {
                        tuitionSum += item.absVal;
                        tuitionCount++;
                    }
                }
            });

            const qAvg = tuitionCount > 0 ? tuitionSum / tuitionCount : 0;

            if (qAvg > 0) {
                quarterlyTickets.push({ label: `Q${q}`, value: qAvg });
            }

            // If this is the current running quarter (by date)
            if (qToday >= qStart && qToday <= qEnd) {
                ticketMedioQuarterlyCurrent = qAvg;
            }
        }

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
                saidaPendente: saidaPendenteTotal, // Sub for Saída (Pending+Overdue)
                saidaAtrasado: saidaAtrasado // New field
            },
            financialIndicators: {
                cmPercent,
                breakEven,
                breakEvenStudents, // Uses current ticket or stable fallback
                margemContrib: cm,
                margemContribPercent: cmPercent,
                ticketDistribution,
                ticketTotal: activeStudentsCount,

                // --- NEW QUARTERLY METRICS ---
                breakEvenQuarterly,
                breakEvenQuarterlyPrev,
                breakEvenQuarterlyStudents,

                quarterlyTickets, // { label: 'Q1', value: 123 }
                ticketMedioQuarterlyCurrent
            },
            currentBalanceToday: totalMoneyCalculated,
            graphData: graphDataArray,
            balanceEvolution: balanceEvolutionCumulative,
            balanceEvolutionBiweekly,
            balanceEvolutionMonthly,
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
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        const topDefaulters = studentsData
            .filter((s: any) => s.status === 'Inadimplente' || s.totalOverdue > 0)
            .sort((a: any, b: any) => b.totalOverdue - a.totalOverdue)
            .slice(0, 10);

        const nextPayments = processedData
            .filter((i: any) => i.status === 'Pendente' && i.type === 'Saída')
            .sort((a: any, b: any) => (a.ts || Infinity) - (b.ts || Infinity))
            .slice(0, 10);

        const lastReceipts = processedData
            .filter((i: any) => {
                if (i.status !== 'Pago' || i.type !== 'Entrada') return false;

                // Parse Data Pagamento (dateExec)
                let execTs = i.ts || 0;
                if (i.dateExec && i.dateExec !== '-') {
                    const parts = i.dateExec.split('/');
                    if (parts.length === 3) execTs = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime();
                }

                return execTs <= today.getTime();
            })
            .sort((a: any, b: any) => {
                let tsA = a.ts || 0;
                if (a.dateExec && a.dateExec !== '-') {
                    const parts = a.dateExec.split('/');
                    if (parts.length === 3) tsA = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime();
                }

                let tsB = b.ts || 0;
                if (b.dateExec && b.dateExec !== '-') {
                    const parts = b.dateExec.split('/');
                    if (parts.length === 3) tsB = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime();
                }

                return tsB - tsA; // Newest first
            })
            .slice(0, 10);

        return { topDefaulters, nextPayments, lastReceipts };
    }, [studentsData, processedData]);

    // --- EXPENSES DATA ---
    const { expensesTableData, uniqueExpenseOptions, expensesTotals } = useMemo(() => {
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

        // Calculate totals for currently filtered view
        const expensesTotals: Record<string, number> = {};
        filtered.forEach((item: any) => {
            const status = item.status || 'Outros';
            expensesTotals[status] = (expensesTotals[status] || 0) + item.absVal;
        });

        return {
            expensesTableData: {
                fixed: isFixed ? sortData(filtered, expSortConfig) : [],
                variable: !isFixed ? sortData(filtered, expSortConfig) : []
            },
            uniqueExpenseOptions: { cats, payments },
            expensesTotals
        };
    }, [processedData, startDate, endDate, expenseFilters, graphFilters.search, expenseSubTab, expSortConfig]);

    const handleApplyFilters = () => {
        // Logic mostly UI centric, moved to App or Component. 
        // But setting graphFilters is state here.
    };

    const handleClearFilters = () => { setGraphFilters({ search: '', status: 'Todos' }); };

    return {
        dreData,
        stats,
        financialIndicators,
        currentBalanceToday,
        graphData,
        balanceEvolution,
        balanceEvolutionBiweekly,
        balanceEvolutionMonthly,
        categoryChart,
        paymentMethodChart,
        growth,
        alerts,
        dashboardLists,
        expensesTableData, uniqueExpenseOptions, expensesTotals,
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
