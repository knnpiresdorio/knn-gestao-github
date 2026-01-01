import React from 'react';
import { Database, Calendar, Search, BarChart2, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';
import TablePagination from '../common/TablePagination';
import StatusBadge from '../common/StatusBadge';
import CategoryBadge from '../common/CategoryBadge';
import { SortConfig } from '../../utils/formatters';
import { THEME_BG_COLORS } from '../../utils/constants';

interface DatabasePageProps {
    tableData: any[]; // For length count
    paginatedData: any[]; // For display
    itemsPerPage: number;
    setItemsPerPage: (val: number) => void;
    currentPage: number;
    setCurrentPage: (val: number) => void;
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    statusFilter: string;
    setStatusFilter: (val: string) => void;
    startDate: string;
    endDate: string;
    processedData: any[]; // For total count
    dbSortConfig: SortConfig[];
    setDbSortConfig: any; // Dispatch<SetStateAction<SortConfig[]>>
    handleSort: (key: string, config: SortConfig[], setSort: any) => void;
    formatBRL: (val: number, showCents: boolean, privacyMode: boolean) => string;
    settings: any;
    handleApplyFilters: () => void;
    dbTab: 'financial' | 'students';
    setDbTab: (tab: 'financial' | 'students') => void;
    categoryFilter?: string;
    setCategoryFilter?: (val: string) => void;
    accountFilter?: string;
    setAccountFilter?: (val: string) => void;
    paymentMethodFilter?: string;
    setPaymentMethodFilter?: (val: string) => void;
    financialsTotals?: Record<string, number>;
    uniqueOptions?: { categories: string[], accounts: string[], paymentMethods: string[] };
}

const DatabasePage: React.FC<DatabasePageProps> = ({
    tableData,
    paginatedData,
    itemsPerPage,
    setItemsPerPage,
    currentPage,
    setCurrentPage,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    startDate,
    endDate,
    processedData,
    dbSortConfig,
    setDbSortConfig,
    handleSort,
    formatBRL,
    settings,
    handleApplyFilters,

    dbTab,
    setDbTab,
    categoryFilter,
    setCategoryFilter,
    accountFilter,
    setAccountFilter,
    paymentMethodFilter,
    setPaymentMethodFilter,
    financialsTotals,
    uniqueOptions
}) => {
    const currentThemeBg = THEME_BG_COLORS[settings.themeColor] || 'bg-violet-600';

    // Calculate total count for the active dataset
    const totalDatasetCount = React.useMemo(() => {
        if (dbTab === 'financial') {
            return processedData.filter(i => i.source !== 'geral').length;
        }
        return processedData.filter(i => i.source === 'geral').length;
    }, [processedData, dbTab]);

    const hasActiveFilters = React.useMemo(() => {
        return (
            searchTerm !== '' ||
            statusFilter !== 'Todos' ||
            (categoryFilter && categoryFilter !== 'Todas') ||
            (accountFilter && accountFilter !== 'Todas') ||
            (paymentMethodFilter && paymentMethodFilter !== 'Todas')
        );
    }, [searchTerm, statusFilter, categoryFilter, accountFilter, paymentMethodFilter]);

    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('Todos');
        if (setCategoryFilter) setCategoryFilter('Todas');
        if (setAccountFilter) setAccountFilter('Todas');
        if (setPaymentMethodFilter) setPaymentMethodFilter('Todas');
        setCurrentPage(1);
    };

    const renderSortableHeader = (label: string, key: string, sortConfig: SortConfig[], setSort: any, align: string = 'left') => {
        const sortItem = sortConfig.find(s => s.key === key);
        const index = sortConfig.findIndex(s => s.key === key);
        return (
            <th className={`px-3 py-3 cursor-pointer select-none group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'}`} onClick={() => handleSort(key, sortConfig, setSort)}>
                <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'}`}>
                    {label}
                    <div className="flex flex-col items-center justify-center w-3">
                        {sortItem ? (sortItem.direction === 'asc' ? <ArrowUp size={12} className="text-slate-800 dark:text-white" /> : <ArrowDown size={12} className="text-slate-800 dark:text-white" />) : (<ArrowUp size={12} className="text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />)}
                    </div>
                    {index >= 0 && sortConfig.length > 1 && (<span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 w-3 h-3 rounded-full flex items-center justify-center">{index + 1}</span>)}
                </div>
            </th>
        );
    };

    return (
        <div className="p-6 md:p-8 flex flex-col gap-4 h-full animate-in fade-in duration-300">
            {/* HEADER - MATCH DASHBOARD STYLE */}
            {/* HEADER - COMPACT LAYOUT */}
            <div className="flex items-center gap-3 mb-2 shrink-0">
                <div className={`w-10 h-10 rounded-lg ${currentThemeBg} flex items-center justify-center text-white shadow-lg`}>
                    <Database size={20} />
                </div>
                <div className="flex flex-col">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">Base de Dados</h2>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Visualize, busque e filtre todas as transações da planilha.</p>
                </div>
            </div>

            {/* CONTROLS CARD */}
            <div className="bg-white dark:bg-slate-900 rounded-t-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 shrink-0 z-10">
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full xl:w-auto mb-8">
                    <div className="flex flex-col w-full sm:w-auto text-center sm:text-left">
                        {/* Contador de Registros */}
                        <div className="flex flex-col">
                            <div className="flex items-baseline justify-center sm:justify-start gap-2">
                                <span className="font-bold text-slate-800 dark:text-white text-3xl">{tableData.length}</span>
                                <span className="text-sm font-medium text-slate-500">de {totalDatasetCount}</span>
                                <span className="text-[10px] uppercase font-bold text-slate-400">Registros Exibidos</span>
                            </div>
                        </div>

                        {/* Indicador de Filtro de Data (azul pequeno) */}
                        {(startDate || endDate) && (
                            <span className="text-[10px] text-blue-500 font-medium mt-0.5 flex items-center justify-center sm:justify-start gap-1">
                                <Calendar size={8} /> Filtro de Data Ativo
                            </span>
                        )}
                    </div>

                    {/* Divisória Vertical */}
                    <div className="h-px w-full sm:w-px sm:h-8 bg-slate-200 dark:bg-slate-700 block"></div>

                    {/* Botão de Ação Roxo */}
                    <button onClick={handleApplyFilters} className={`w-full sm:w-auto flex justify-center items-center gap-2 bg-violet-600 hover:opacity-90 text-white px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all shadow-md hover:-translate-y-0.5`}>
                        <BarChart2 size={16} /> Aplicar Filtro no Dashboard
                    </button>
                </div>

                {/* TABS */}
                <div className="flex items-center gap-8 border-b border-slate-200 dark:border-slate-700 mb-6">
                    <button
                        onClick={() => { setDbTab('financial'); setCurrentPage(1); }}
                        className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${dbTab === 'financial' ? 'text-violet-600 dark:text-violet-400 border-violet-600 dark:border-violet-400' : 'text-slate-500 border-transparent hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Transações Financeiras
                    </button>
                    <button
                        onClick={() => { setDbTab('students'); setCurrentPage(1); }}
                        className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${dbTab === 'students' ? 'text-violet-600 dark:text-violet-400 border-violet-600 dark:border-violet-400' : 'text-slate-500 border-transparent hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Base de Alunos (Geral)
                    </button>
                </div>

                {/* SEARCH & FILTERS ROW */}
                {/* SEARCH & FILTERS ROW */}
                <div className="flex flex-col gap-6">
                    {/* TOP ROW: Search + Main Filters */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-5 relative">
                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block ml-1">Buscar</label>
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Ex: Mensalidade, João..."
                                    className="pl-10 pr-4 py-2.5 w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all shadow-sm"
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                />
                            </div>
                        </div>

                        {dbTab === 'financial' && (
                            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-300">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block ml-1">Categoria</label>
                                    <select
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all shadow-sm"
                                        value={categoryFilter || 'Todas'}
                                        onChange={(e) => setCategoryFilter && setCategoryFilter(e.target.value)}
                                    >
                                        <option value="Todas">Todas</option>
                                        {uniqueOptions?.categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block ml-1">Conta Bancária</label>
                                    <select
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all shadow-sm"
                                        value={accountFilter || 'Todas'}
                                        onChange={(e) => setAccountFilter && setAccountFilter(e.target.value)}
                                    >
                                        <option value="Todas">Todas</option>
                                        {uniqueOptions?.accounts.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block ml-1">Forma Pag.</label>
                                    <select
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all shadow-sm"
                                        value={paymentMethodFilter || 'Todas'}
                                        onChange={(e) => setPaymentMethodFilter && setPaymentMethodFilter(e.target.value)}
                                    >
                                        <option value="Todas">Todas</option>
                                        {uniqueOptions?.paymentMethods.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* STATUS FILTER ROW */}
                    {dbTab === 'financial' && (
                        <div className="animate-in fade-in duration-300">
                            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-end">
                                <div className="flex-1 w-full lg:w-auto">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block ml-1">Filtrar por Status</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Todos', 'Pago', 'Pendente', 'Atrasado', 'Cancelado'].map(st => (
                                            <button
                                                key={st}
                                                onClick={() => { setStatusFilter(st); setCurrentPage(1); }}
                                                className={`flex-1 sm:flex-none px-3 py-2.5 rounded-xl text-[10px] sm:text-[11px] font-bold transition-all uppercase text-center border ${statusFilter === st
                                                    ? 'bg-slate-800 dark:bg-slate-700 text-white border-slate-800 dark:border-slate-700 shadow-lg'
                                                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                    }`}
                                            >
                                                {st}
                                            </button>
                                        ))}

                                        {hasActiveFilters && (
                                            <button
                                                onClick={handleClearFilters}
                                                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[10px] font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all uppercase border border-transparent whitespace-nowrap"
                                            >
                                                <RotateCcw size={14} /> LIMPAR
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* TOTALS DISPLAY */}
                                {financialsTotals && (
                                    <div className="flex-shrink-0 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex gap-4 overflow-x-auto custom-scrollbar max-w-full">
                                        {Object.entries(financialsTotals).sort((a, b) => b[1] - a[1]).map(([status, total]) => {
                                            if (total === 0) return null;

                                            let colorClass = '';
                                            const s = status.toLowerCase();

                                            if (['cancelado', 'trancado', 'evadido'].includes(s)) {
                                                colorClass = 'text-slate-500 dark:text-slate-400';
                                            } else if (['atrasado', 'pendente', 'não pago', 'nao pago'].includes(s)) {
                                                colorClass = 'text-amber-500 dark:text-amber-400';
                                            } else {
                                                // Default for 'Pago' or others: Green if positive, Red if negative
                                                colorClass = total > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400';
                                            }

                                            return (
                                                <div key={status} className="flex flex-col px-2 min-w-[100px] border-r border-slate-200 dark:border-slate-800 last:border-0">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase truncate">{status}</span>
                                                    <span className={`text-sm font-bold whitespace-nowrap ${colorClass}`}>
                                                        {formatBRL(total, settings.showCents, settings.privacyMode)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                        {Object.keys(financialsTotals).length === 0 && <span className="text-xs text-slate-400 italic px-2">Sem dados para somar</span>}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* DATA TABLE */}
            <div className="bg-white dark:bg-slate-900 border-b border-x border-slate-200 dark:border-slate-800 rounded-b-2xl overflow-hidden flex flex-col flex-1 min-h-0 relative">
                <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-sm uppercase text-xs tracking-wider">
                            <tr>
                                {dbTab === 'financial' ? (
                                    <>
                                        {renderSortableHeader('Vencimento', 'ts', dbSortConfig, setDbSortConfig)}
                                        {renderSortableHeader('Descrição / Responsável', 'desc', dbSortConfig, setDbSortConfig)}
                                        {renderSortableHeader('Categoria', 'cat', dbSortConfig, setDbSortConfig)}
                                        {renderSortableHeader('Conta', 'account', dbSortConfig, setDbSortConfig)}
                                        {renderSortableHeader('Forma Pag.', 'payment', dbSortConfig, setDbSortConfig)}
                                        {renderSortableHeader('Valor', 'absVal', dbSortConfig, setDbSortConfig, 'right')}
                                        {renderSortableHeader('Status', 'status', dbSortConfig, setDbSortConfig, 'center')}
                                    </>
                                ) : (
                                    <>
                                        {renderSortableHeader('ID', 'id', dbSortConfig, setDbSortConfig)}
                                        {renderSortableHeader('Aluno', 'nome_completo_aluno', dbSortConfig, setDbSortConfig)}
                                        {renderSortableHeader('Responsável', 'nome_responsavel_financeiro', dbSortConfig, setDbSortConfig)}
                                        {renderSortableHeader('Telefone', 'telefone_contato', dbSortConfig, setDbSortConfig)}
                                        {renderSortableHeader('Data Matrícula', 'data_matricula', dbSortConfig, setDbSortConfig)}
                                        {renderSortableHeader('Valor Contrato', 'valor_contrato', dbSortConfig, setDbSortConfig, 'right')}
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {paginatedData.length > 0 ? paginatedData.map((item: any) => {
                                if (dbTab === 'financial') {
                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                            <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">{item.date}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-700 dark:text-slate-200 text-xs mb-0.5">{item.desc}</span>
                                                    {item.resp && <span className="text-[10px] text-slate-400">{item.resp}</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <CategoryBadge category={item.cat} />
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-500">{item.account}</td>
                                            <td className="px-6 py-4 text-xs text-slate-500">{item.payment}</td>
                                            <td className={`px-6 py-4 text-right font-bold font-mono tracking-tight ${item.type === 'Entrada' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                {item.type === 'Saída' ? '-' : '+'}{formatBRL(item.absVal, settings.showCents, settings.privacyMode)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <StatusBadge status={item.status} />
                                            </td>
                                        </tr>
                                    );
                                } else {
                                    // STUDENTS RENDERING
                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                            <td className="px-6 py-4 font-mono text-xs text-slate-500">{item['id'] || '-'}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-700 dark:text-slate-200 text-xs mb-0.5">{item['nome_completo_aluno'] || item.desc}</span>
                                                    {item['livro'] && <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 rounded inline-block w-fit">{item['livro']}</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                                                {item['nome_responsavel_financeiro'] || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                                                {item['telefone_contato'] || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                                                {item['data_matricula'] || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-xs text-slate-600 dark:text-slate-300">
                                                {item['valor_contrato'] ? `R$ ${item['valor_contrato']}` : '-'}
                                            </td>
                                        </tr>
                                    );
                                }
                            }) : (
                                <tr><td colSpan={dbTab === 'financial' ? 7 : 6} className="p-16 text-center text-slate-400 flex flex-col items-center justify-center opacity-50"><Database size={48} className="mb-4 text-slate-300" /><span>Nenhum registro encontrado.</span></td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION FOOTER */}
                <TablePagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(tableData.length / itemsPerPage)}
                    itemsPerPage={itemsPerPage}
                    totalItems={tableData.length}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={(items) => { setItemsPerPage(items); setCurrentPage(1); }}
                />
            </div>
        </div>
    );
};

export default DatabasePage;
