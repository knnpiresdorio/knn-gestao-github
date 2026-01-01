import { useState, useMemo } from 'react';
import { sortData, SortConfig } from '../utils/formatters';

export const useDatabaseData = (processedData: any[], startDate: string, endDate: string, tab: 'financial' | 'students') => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [categoryFilter, setCategoryFilter] = useState('Todas');
    const [accountFilter, setAccountFilter] = useState('Todas');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('Todas');
    const [dbSortConfig, setDbSortConfig] = useState<SortConfig[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);

    const tableData = useMemo(() => {
        let filtered = processedData || [];

        if (tab === 'financial') {
            // Financial: Filter by date and exclude Geral
            // Although 'Geral' is usually identifying students, let's strictly check source
            // Actually, existing logic relied on date filters to implicitly filter. 
            // We should be explicit:
            filtered = filtered.filter((i: any) => i.source !== 'geral');

            if (startDate || endDate) {
                const startTs = startDate ? new Date(startDate + 'T00:00:00').getTime() : 0;
                const endTs = endDate ? new Date(endDate + 'T23:59:59').getTime() : Infinity;
                filtered = filtered.filter((i: any) => i.ts >= startTs && i.ts <= endTs);
            }
        } else {
            // Students: Include ONLY 'geral'
            filtered = filtered.filter((i: any) => i.source === 'geral');
            // DATE FILTER IGNORED FOR STUDENTS REGISTRY
        }

        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            filtered = filtered.filter((i: any) =>
                (i.desc && i.desc.toString().toLowerCase().includes(lower)) ||
                (i.resp && i.resp.toString().toLowerCase().includes(lower)) ||
                (i.nome_completo_aluno && i.nome_completo_aluno.toString().toLowerCase().includes(lower))
            );
        }
        if (tab === 'financial') {
            if (statusFilter !== 'Todos') {
                filtered = filtered.filter((i: any) => i.status === statusFilter);
            }
            if (categoryFilter !== 'Todas') {
                filtered = filtered.filter((i: any) => i.cat === categoryFilter);
            }
            if (accountFilter !== 'Todas') {
                filtered = filtered.filter((i: any) => i.account === accountFilter);
            }
            if (paymentMethodFilter !== 'Todas') {
                filtered = filtered.filter((i: any) => i.payment === paymentMethodFilter);
            }
        }
        return sortData(filtered, dbSortConfig);
    }, [processedData, startDate, endDate, searchTerm, statusFilter, categoryFilter, accountFilter, paymentMethodFilter, dbSortConfig, tab]);

    // Calculate totals based on the filtered tableData
    const financialsTotals = useMemo(() => {
        if (tab !== 'financial') return {};

        const totals: Record<string, number> = {};

        tableData.forEach((item: any) => {
            // Only sum financial items (though logic above already filters them, good to be safe/explicit if logic changes)
            const val = item.absVal || 0;
            const type = item.type; // 'Entrada' or 'Saída'
            const status = item.status || 'Outros';

            // Use a signed value for the total sum? Or absolute? 
            // Ideally we want to see "Total Received", "Total Paid", etc.
            // But the request asked for "total sum of values, separated by status".
            // Let's store positive values and we can handle display logic later (green/red).

            if (!totals[status]) totals[status] = 0;

            // If it's an expense (Saída), usually we view it as a negative flow, but for a "Total Value" sum of a status like "Atrasado",
            // we probably want to know the volume of money. 
            // Let's sum absolute values here and maybe distinguish Entrada/Saída in UI if needed, 
            // OR just sum everything. 
            // However, mixing Input/Output in "Pago" might cancel each other out if we use signs.
            // Usually filters are applied to specific views. 
            // Let's actually sum by Status AND Type if possible, or just Sum.
            // Simpler: Just sum the absolute value per status to show "Volume moved/pending".

            // Wait, if I have "Pago", I have "Paid Expenses" and "Received Revenues".
            // Summing them might be weird (Revenue - Expense = Profit). 
            // User likely wants "Sum of values". 
            // Let's stick to signed sum?
            // "mostrar a somatória total dos valores" -> usually implies flow.
            // Let's do Signed Sum. Entrada is positive, Saída is negative.

            const sign = type === 'Saída' ? -1 : 1;
            totals[status] += (val * sign);
        });

        return totals;
    }, [tableData, tab]);

    // Extract unique options for dropdowns based on current data context (or potentially all data?)
    // Usually better to show options available in the current date range at least.
    const uniqueOptions = useMemo(() => {
        // We get unique values from the *date-filtered* but *not yet attribute-filtered* data 
        // to avoid options disappearing too aggressively? 
        // Or just use the raw tableData? Using tableData makes detailed drilling harder.
        // Let's matches other pages: use the data filtered by date/search but BEFORE column filters?
        // For simplicity and standard behavior in this app, let's use the full processed list filtered by date (first stage of memo).
        // But extracting that intermediate state is hard without splitting the memo.
        // Let's just use `tableData` for now (cascading filters), or all processedData (global options).
        // Cascading is usually better user experience.

        const cats = new Set<string>();
        const accs = new Set<string>();
        const pays = new Set<string>();

        tableData.forEach((i: any) => {
            if (i.cat) cats.add(i.cat);
            if (i.account) accs.add(i.account);
            if (i.payment) pays.add(i.payment);
        });

        return {
            categories: Array.from(cats).sort(),
            accounts: Array.from(accs).sort(),
            paymentMethods: Array.from(pays).sort()
        };
    }, [tableData]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return tableData.slice(start, start + itemsPerPage);
    }, [tableData, currentPage, itemsPerPage]);

    const handleApplyFilters = () => {
        // Placeholder for filter application logic if needed in future
    };

    return {
        tableData,
        paginatedData,
        searchTerm, setSearchTerm,
        statusFilter, setStatusFilter,
        categoryFilter, setCategoryFilter,
        accountFilter, setAccountFilter,
        paymentMethodFilter, setPaymentMethodFilter,
        dbSortConfig, setDbSortConfig,
        currentPage, setCurrentPage,
        itemsPerPage, setItemsPerPage,
        financialsTotals,
        uniqueOptions,
        handleApplyFilters
    };
};
