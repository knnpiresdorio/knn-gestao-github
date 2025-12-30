import { useState, useMemo } from 'react';
import { sortData, SortConfig } from '../utils/formatters';

export const useDatabaseData = (processedData: any[], startDate: string, endDate: string, tab: 'financial' | 'students') => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todos');
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
        if (tab === 'financial' && statusFilter !== 'Todos') {
            filtered = filtered.filter((i: any) => i.status === statusFilter);
        }
        return sortData(filtered, dbSortConfig);
    }, [processedData, startDate, endDate, searchTerm, statusFilter, dbSortConfig, tab]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return tableData.slice(start, start + itemsPerPage);
    }, [tableData, currentPage, itemsPerPage]);

    return {
        tableData,
        paginatedData,
        searchTerm, setSearchTerm,
        statusFilter, setStatusFilter,
        dbSortConfig, setDbSortConfig,
        currentPage, setCurrentPage,
        itemsPerPage, setItemsPerPage
    };
};
