import React from 'react';
import {
    Wallet, Search, ChevronDown, X, ArrowUp, ArrowDown
} from 'lucide-react';
import { STATUS_STYLES, THEME_BG_COLORS } from '../../utils/constants';
import StatusBadge from '../common/StatusBadge';
import TablePagination from '../common/TablePagination';
import { formatDateDisplay } from '../../utils/dates';

interface ExpensesPageProps {
    expenseSubTab: string;
    setExpenseSubTab: (tab: string) => void;
    settings: any;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    expenseFilters: { category: string; payment: string; status: string };
    setExpenseFilters: (filters: any) => void;
    uniqueExpenseOptions: { cats: string[]; payments: string[] };
    expensesTableData: any;
    currentPage: number;
    setCurrentPage: (page: number) => void;
    itemsPerPage: number;
    setItemsPerPage: (items: number) => void;
    expSortConfig: any[];
    setExpSortConfig: (config: any[]) => void;
    formatBRL: (val: number, showCents: boolean, privacyMode: boolean) => string;
    handleSort: (key: string, currentConfig: any[], setConfig: (c: any[]) => void) => void;
    expensesScrollRef: React.RefObject<HTMLDivElement>;
    expensesTableTopRef: React.RefObject<HTMLDivElement>;
}

const ExpensesPage: React.FC<ExpensesPageProps> = ({
    expenseSubTab,
    setExpenseSubTab,
    settings,
    searchTerm,
    setSearchTerm,
    expenseFilters,
    setExpenseFilters,
    uniqueExpenseOptions,
    expensesTableData,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    expSortConfig,
    setExpSortConfig,
    formatBRL,
    handleSort,
    expensesScrollRef,
    expensesTableTopRef
}) => {

    const currentThemeBg = THEME_BG_COLORS[settings.themeColor] || 'bg-slate-900';

    const getStatusStyle = (status: string) => STATUS_STYLES[status] || STATUS_STYLES['Default'];

    const renderSortableHeader = (label: string, key: string, align: 'left' | 'center' | 'right' = 'left') => {
        const index = expSortConfig.findIndex(s => s.key === key);
        return (
            <th className={`px-6 py-4 font-semibold text-xs uppercase tracking-wider cursor-pointer select-none group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'}`} onClick={() => handleSort(key, expSortConfig, setExpSortConfig)}>
                <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'}`}>
                    {label}
                    <div className="flex flex-col items-center justify-center w-3">
                        {index >= 0 ? (expSortConfig[index].direction === 'asc' ? <ArrowUp size={12} className="text-slate-800 dark:text-white" /> : <ArrowDown size={12} className="text-slate-800 dark:text-white" />) : (<ArrowUp size={12} className="text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />)}
                    </div>
                    {index >= 0 && expSortConfig.length > 1 && (<span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 w-3 h-3 rounded-full flex items-center justify-center">{index + 1}</span>)}
                </div>
            </th>
        );
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-300">
            {/* HEADER */}
            <div className="flex items-center gap-4 mb-6 shrink-0">
                <div className={`w-12 h-12 rounded-xl ${currentThemeBg} flex items-center justify-center text-white shadow-lg`}>
                    <Wallet size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Controle de Despesas</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Controle detalhado de despesas fixas e variáveis.</p>
                </div>
            </div>

            {/* FILTERS & TABS */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-6 shrink-0">
                {/* Filter Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Buscar</label>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Descrição, Responsável..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:text-white transition-all shadow-sm"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Categoria</label>
                        <div className="relative">
                            <select className="w-full pl-3 pr-8 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:text-white appearance-none cursor-pointer" value={expenseFilters.category} onChange={(e) => { setExpenseFilters((s: any) => ({ ...s, category: e.target.value })); setCurrentPage(1); }}>
                                <option value="Todas">Todas as Categorias</option>
                                {uniqueExpenseOptions.cats.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Forma de Pagamento</label>
                        <div className="relative">
                            <select className="w-full pl-3 pr-8 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:text-white appearance-none cursor-pointer" value={expenseFilters.payment} onChange={(e) => { setExpenseFilters((s: any) => ({ ...s, payment: e.target.value })); setCurrentPage(1); }}>
                                <option value="Todos">Todas as Formas</option>
                                {uniqueExpenseOptions.payments.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <select className="w-full pl-3 pr-8 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:text-white appearance-none cursor-pointer" value={expenseFilters.status} onChange={(e) => { setExpenseFilters((s: any) => ({ ...s, status: e.target.value })); setCurrentPage(1); }}>
                                    <option value="Todos">Todos os Status</option>
                                    <option value="Pago">Pago</option>
                                    <option value="Pendente">Pendente</option>
                                    <option value="Atrasado">Atrasado</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                            <button
                                onClick={() => { setSearchTerm(''); setExpenseFilters({ category: 'Todas', payment: 'Todos', status: 'Todos' }); setCurrentPage(1); }}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                            >
                                <X size={14} /> Limpar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-8 border-b border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => { setExpenseSubTab('fixed'); setCurrentPage(1); }}
                        className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${expenseSubTab === 'fixed' ? 'text-violet-600 dark:text-violet-400 border-violet-600 dark:border-violet-400' : 'text-slate-500 border-transparent hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Todas Fixas
                    </button>
                    <button
                        onClick={() => { setExpenseSubTab('variable'); setCurrentPage(1); }}
                        className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${expenseSubTab === 'variable' ? 'text-violet-600 dark:text-violet-400 border-violet-600 dark:border-violet-400' : 'text-slate-500 border-transparent hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Todas Variáveis
                    </button>
                </div>
            </div>

            {/* TABLE */}
            <div ref={expensesTableTopRef} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col flex-1 min-h-0">
                {/* Table Header Row with Count */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{expenseSubTab === 'fixed' ? 'Despesas Fixas' : 'Despesas Variáveis'}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-500">{(expensesTableData[expenseSubTab] || []).length} registros</span>
                </div>

                <div ref={expensesScrollRef} className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-sm">
                            <tr>
                                {renderSortableHeader('Status', 'status', 'center')}
                                {renderSortableHeader('Descrição', 'desc')}
                                {renderSortableHeader('Categoria', 'cat')}
                                {renderSortableHeader('Vencimento', 'ts')}
                                {renderSortableHeader('Pagamento', 'dateExec')}
                                {renderSortableHeader('Valor Bruto', 'grossVal', 'right')}
                                {renderSortableHeader('Valor Líq.', 'absVal', 'right')}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {(expensesTableData[expenseSubTab] || []).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item: any) => {
                                return (
                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 text-center">
                                            <StatusBadge status={item.status} />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-200 text-xs">{item.desc}</td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">{item.cat}</td>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">{item.date}</td>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">{item.dateExec !== '-' ? formatDateDisplay(item.dateExec) : '-'}</td>
                                        <td className="px-6 py-4 text-right font-mono text-xs text-slate-500 dark:text-slate-400">{formatBRL(item.grossVal, settings.showCents, settings.privacyMode)}</td>
                                        <td className="px-6 py-4 text-right font-mono font-bold text-rose-600 dark:text-rose-400 tracking-tight">{formatBRL(item.absVal, settings.showCents, settings.privacyMode)}</td>
                                    </tr>
                                );
                            })}
                            {(expensesTableData[expenseSubTab] || []).length === 0 && (
                                <tr><td colSpan={7} className="p-12 text-center text-slate-400">Nenhuma despesa encontrada.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <TablePagination
                    currentPage={currentPage}
                    totalPages={Math.ceil((expensesTableData[expenseSubTab] || []).length / itemsPerPage)}
                    itemsPerPage={itemsPerPage}
                    totalItems={(expensesTableData[expenseSubTab] || []).length}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={(items) => { setItemsPerPage(items); setCurrentPage(1); }}
                />
            </div>
        </div>
    );
};

export default ExpensesPage;
