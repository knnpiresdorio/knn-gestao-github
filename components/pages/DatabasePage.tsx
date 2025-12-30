import React from 'react';
import { Database, Calendar, Search, BarChart2, ArrowUp, ArrowDown } from 'lucide-react';
import TablePagination from '../common/TablePagination';
import StatusBadge from '../common/StatusBadge';
import CategoryBadge from '../common/CategoryBadge';
import { SortConfig } from '../../utils/formatters';

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
    setDbTab
}) => {

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
        <div className="flex flex-col h-full animate-in fade-in duration-300">
            {/* HEADER - NEW DESIGN */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6 flex-shrink-0">
                <div className="flex items-center gap-4">
                    {/* Ícone Roxo (Database) */}
                    <div className={`p-3 rounded-xl bg-violet-600 text-white shadow-lg transform -rotate-3`}>
                        <Database size={28} />
                    </div>
                    {/* Textos */}
                    <div>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Base de Dados</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Visualize, busque e filtre todas as transações da planilha.</p>
                    </div>
                </div>
            </div>

            {/* CONTROLS CARD */}
            <div className="bg-white dark:bg-slate-900 rounded-t-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 shrink-0 z-10">
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full xl:w-auto mb-8">
                    <div className="flex flex-col w-full sm:w-auto text-center sm:text-left">
                        {/* Contador de Registros */}
                        <div className="flex items-baseline justify-center sm:justify-start gap-1">
                            <span className="font-bold text-slate-800 dark:text-white text-2xl">{tableData.length}</span>
                            <span className="text-sm font-medium text-slate-500">de {processedData.length}</span>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Registros Exibidos</span>

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
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-4 relative">
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

                    <div className="lg:col-span-8">
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block ml-1">Filtrar por Status</label>
                        <div className="flex flex-wrap gap-2">
                            {['Todos', 'Pago', 'Pendente', 'Atrasado', 'Cancelado', 'Evadido', 'Trancado'].map(st => (
                                <button
                                    key={st}
                                    onClick={() => { setStatusFilter(st); setCurrentPage(1); }}
                                    className={`flex-1 sm:flex-none px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all uppercase text-center border ${statusFilter === st
                                        ? 'bg-slate-800 dark:bg-slate-700 text-white border-slate-800 dark:border-slate-700 shadow-lg' // Estilo Ativo
                                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800' // Estilo Inativo
                                        }`}
                                >
                                    {st}
                                </button>
                            ))}
                        </div>
                    </div>
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
                                        {renderSortableHeader('Situação', 'status', dbSortConfig, setDbSortConfig, 'center')}
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
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${item.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                    item.status === 'Inadimplente' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                                                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                    }`}>
                                                    {item.status || item['situacao_contrato'] || 'Indefinido'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                }
                            }) : (
                                <tr><td colSpan={7} className="p-16 text-center text-slate-400 flex flex-col items-center justify-center opacity-50"><Database size={48} className="mb-4 text-slate-300" /><span>Nenhum registro encontrado.</span></td></tr>
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
