import React, { useMemo } from 'react';
import {
    GraduationCap, Search, ChevronDown, X, FileSearch, RefreshCw, ArrowUp, ArrowDown
} from 'lucide-react';
import { STATUS_STYLES, THEME_BG_COLORS } from '../../utils/constants';
import { SortConfig } from '../../utils/formatters';
import StudentsKpiGrid from '../students/StudentsKpiGrid';
import ScholarshipChart from '../students/ScholarshipChart';
import StudentProfileChart from '../students/StudentProfileChart';
import PaymentDayChart from '../students/PaymentDayChart';
import TablePagination from '../common/TablePagination';
import StatusBadge from '../common/StatusBadge';

interface StudentsPageProps {
    studentsData: any[];
    studentMetrics: any;
    retentionStats: any;
    scholarshipData: any[];
    studentProfileData: any[];
    paymentDayData: any[];
    loading: boolean;
    currentPage: number;
    setCurrentPage: (page: number) => void;
    itemsPerPage: number;
    setItemsPerPage: (items: number) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    studentFilters: { status: string, book?: string, period?: string, day?: string };
    setStudentFilters: (filters: any) => void;
    stuSortConfig: SortConfig[];
    setStuSortConfig: (config: SortConfig[]) => void;
    settings: any;
    formatBRL: (val: number, showCents: boolean, privacyMode: boolean) => string;
    handleSort: (key: string, currentConfig: SortConfig[], setConfig: (c: SortConfig[] | ((prev: SortConfig[]) => SortConfig[])) => void) => void;
    studentsScrollRef: React.RefObject<HTMLDivElement>;
    studentsTableTopRef: React.RefObject<HTMLDivElement>;
    uniqueOptions: { books: string[], periods: string[], days: string[] };
    totalDatasetCount: number;
}

const StudentsPage: React.FC<StudentsPageProps> = ({
    studentsData,
    studentMetrics,
    retentionStats,
    scholarshipData,
    studentProfileData,
    paymentDayData,
    loading,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    searchTerm,
    setSearchTerm,
    studentFilters,
    setStudentFilters,
    stuSortConfig,
    setStuSortConfig,
    settings,
    formatBRL,
    handleSort,
    studentsScrollRef,
    studentsTableTopRef,
    uniqueOptions,
    totalDatasetCount
}) => {
    const [activeTab, setActiveTab] = React.useState<'dashboard' | 'list'>('dashboard');

    const currentThemeBg = THEME_BG_COLORS[settings.themeColor] || 'bg-slate-900';

    // Calculate Status Totals for the Summary Bar
    const statusTotals = useMemo(() => {
        const totals: Record<string, number> = {};
        studentsData.forEach((student: any) => {
            const s = student.status || 'Outros';
            // Summing Pending and Overdue for Financial Volume of the status
            const val = (student.totalPending || 0) + (student.totalOverdue || 0);
            totals[s] = (totals[s] || 0) + val;
        });
        return totals;
    }, [studentsData]);

    const getStatusStyle = (status: string) => STATUS_STYLES[status] || STATUS_STYLES['Default'];

    const renderSortableHeader = (label: string, key: string, align: 'left' | 'center' | 'right' = 'left') => {
        const index = stuSortConfig.findIndex(s => s.key === key);
        return (
            <th className={`px-6 py-4 font-semibold text-xs uppercase tracking-wider cursor-pointer select-none group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'}`} onClick={() => handleSort(key, stuSortConfig, setStuSortConfig)}>
                <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'}`}>
                    {label}
                    <div className="flex flex-col items-center justify-center w-3">
                        {index >= 0 ? (stuSortConfig[index].direction === 'asc' ? <ArrowUp size={12} className="text-slate-800 dark:text-white" /> : <ArrowDown size={12} className="text-slate-800 dark:text-white" />) : (<ArrowUp size={12} className="text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />)}
                    </div>
                    {index >= 0 && stuSortConfig.length > 1 && (<span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 w-3 h-3 rounded-full flex items-center justify-center">{index + 1}</span>)}
                </div>
            </th>
        );
    };

    return (
        <div ref={studentsScrollRef} className="p-6 md:p-8 space-y-6 animate-in fade-in duration-300 h-full overflow-y-auto pb-20 custom-scrollbar">
            {/* HEADER - MATCH DASHBOARD STYLE */}
            {/* HEADER - COMPACT LAYOUT */}
            <div className="flex items-center gap-3 mb-2 shrink-0">
                <div className={`w-10 h-10 rounded-lg ${currentThemeBg} flex items-center justify-center text-white shadow-lg`}>
                    <GraduationCap size={20} />
                </div>
                <div className="flex flex-col">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">Alunos & Matrículas</h2>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Gestão financeira por aluno e acompanhamento de parcelas.</p>
                </div>
            </div>

            {/* MAIN CONTENT CONTAINER */}
            <div className="bg-app-card dark:bg-slate-900 rounded-xl shadow-sm border border-transparent dark:border-slate-800 p-6 shrink-0 z-10">

                {/* TABS NAVIGATION */}
                <div className="flex items-center gap-8 border-b border-slate-100 dark:border-slate-700 mb-6">
                    <button
                        onClick={() => { setActiveTab('dashboard'); setCurrentPage(1); }}
                        className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'dashboard' ? 'text-violet-600 dark:text-violet-400 border-violet-600 dark:border-violet-400' : 'text-slate-500 border-transparent hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Dashboard de Indicadores
                    </button>
                    <button
                        onClick={() => { setActiveTab('list'); setCurrentPage(1); }}
                        className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'list' ? 'text-violet-600 dark:text-violet-400 border-violet-600 dark:border-violet-400' : 'text-slate-500 border-transparent hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Lista Gerencial de Alunos
                    </button>
                </div>

                {activeTab === 'dashboard' ? (
                    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                        {/* STUDENT KPIS */}
                        <StudentsKpiGrid metrics={studentMetrics} settings={settings} retentionStats={retentionStats} loading={loading} />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
                            <ScholarshipChart data={scholarshipData} settings={settings} />
                            <StudentProfileChart data={studentProfileData} />
                            <PaymentDayChart data={paymentDayData} settings={settings} />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                        {/* FILTERS SECTION - Redesigned to match premium UI */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 shrink-0 space-y-6">
                            {/* ROW 1: Search & Main Status */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                <div className="lg:col-span-4 space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block ml-1 flex items-center gap-2">
                                        <Search size={14} className="text-slate-400" /> Buscar Aluno
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            placeholder="Nome do aluno..."
                                            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all shadow-sm"
                                            value={searchTerm}
                                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                        />
                                        {searchTerm && (
                                            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="lg:col-span-8 space-y-2">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase block ml-1">Situação</label>
                                        <button
                                            onClick={() => { setSearchTerm(''); setStudentFilters({ status: 'Todos' }); setCurrentPage(1); }}
                                            className="text-[10px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors uppercase tracking-tight"
                                        >
                                            <RefreshCw size={10} /> Limpar
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { id: 'Todos', label: 'Todos' },
                                            { id: 'Ativo', label: 'Ativo' },
                                            { id: 'Matriculado', label: 'Matriculado' },
                                            { id: 'Concluído', label: 'Concluído' },
                                            { id: 'Desistente', label: 'Desistente' },
                                            { id: 'Evadido', label: 'Evadido' },
                                            { id: 'Trancado', label: 'Trancado' },
                                            { id: 'Outros', label: 'Outros' }
                                        ].map(st => (
                                            <button
                                                key={st.id}
                                                onClick={() => { setStudentFilters((s: any) => ({ ...s, status: st.id })); setCurrentPage(1); }}
                                                className={`flex-1 sm:flex-none px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all uppercase text-center border ${studentFilters.status === st.id
                                                    ? 'bg-slate-800 dark:bg-slate-700 text-white border-slate-800 dark:border-slate-700 shadow-lg'
                                                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                    }`}
                                            >
                                                {st.label}
                                            </button>
                                        ))}

                                        <div className="flex items-center gap-1.5 ml-auto pl-4 border-l border-slate-200 dark:border-slate-800 hidden xl:flex">
                                            <span className="text-[12px] font-black text-slate-700 dark:text-slate-200">{studentsData.length}</span>
                                            <span className="text-[12px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tighter whitespace-nowrap">de {totalDatasetCount} Registros</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ROW 2: Segment Filters & Totals */}
                            <div className="flex flex-col xl:flex-row gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block ml-1">Livro / Estágio</label>
                                        <div className="relative">
                                            <select value={studentFilters.book || 'Todos'} onChange={(e) => { setStudentFilters((s: any) => ({ ...s, book: e.target.value })); setCurrentPage(1); }} className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white appearance-none cursor-pointer shadow-sm">
                                                <option value="Todos">Todos</option>
                                                {uniqueOptions?.books.map(b => <option key={b} value={b}>{b}</option>)}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><ChevronDown size={16} /></div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block ml-1">Período de Contrato</label>
                                        <div className="relative">
                                            <select value={studentFilters.period || 'Todos'} onChange={(e) => { setStudentFilters((s: any) => ({ ...s, period: e.target.value })); setCurrentPage(1); }} className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white appearance-none cursor-pointer shadow-sm">
                                                <option value="Todos">Todos</option>
                                                {uniqueOptions?.periods.map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><ChevronDown size={16} /></div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block ml-1">Dia do Vencimento</label>
                                        <div className="relative">
                                            <select value={studentFilters.day || 'Todos'} onChange={(e) => { setStudentFilters((s: any) => ({ ...s, day: e.target.value })); setCurrentPage(1); }} className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white appearance-none cursor-pointer shadow-sm">
                                                <option value="Todos">Todos</option>
                                                {uniqueOptions?.days.map(d => <option key={d} value={d}>Dia {d}</option>)}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><ChevronDown size={16} /></div>
                                        </div>
                                    </div>
                                </div>

                                {/* TOTALS DISPLAY - MATCH DATABASE PAGE STYLE */}
                                {statusTotals && (
                                    <div className="flex-none xl:w-auto w-full flex flex-col justify-end">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block ml-1">Resumo Financeiro (Aberto + Atrasado)</label>
                                        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 flex gap-4 overflow-x-auto custom-scrollbar h-[44px] items-center">
                                            {Object.entries(statusTotals).sort((a, b) => b[1] - a[1]).map(([status, total]) => {
                                                if (total === 0) return null;

                                                let colorClass = '';
                                                const s = status.toLowerCase();

                                                if (['cancelado', 'trancado', 'evadido', 'desistente', 'outros'].includes(s)) {
                                                    colorClass = 'text-slate-500 dark:text-slate-400';
                                                } else if (['inadimplente', 'atrasado'].includes(s)) {
                                                    colorClass = 'text-amber-500 dark:text-amber-400';
                                                } else {
                                                    // Ativo, Matriculado, Concluído -> Green
                                                    colorClass = 'text-emerald-600 dark:text-emerald-400';
                                                }

                                                return (
                                                    <div key={status} className="flex flex-col px-2 min-w-[80px] border-r border-slate-200 dark:border-slate-800 last:border-0 justify-center">
                                                        <span className="text-[8px] font-bold text-slate-400 uppercase truncate leading-none mb-0.5">{status}</span>
                                                        <span className={`text-xs font-bold whitespace-nowrap leading-none ${colorClass}`}>
                                                            {formatBRL(total, settings.showCents, settings.privacyMode)}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* TABLE CARD - MATCH DATABASE PAGE */}
                        <div ref={studentsTableTopRef} className="bg-white dark:bg-slate-900 rounded-b-2xl shadow-sm border-x border-b border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[600px] mb-20">
                            {/* TABLE HEADER COUNT - REDESIGNED */}
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/10">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500"></div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Registros Detalhados</span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{studentsData.length} registros ativos na visualização</span>
                            </div>

                            <div className="overflow-auto custom-scrollbar flex-1 relative">
                                {loading ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 z-20 backdrop-blur-sm">
                                        <RefreshCw size={32} className="text-blue-500 animate-spin mb-3" />
                                        <span className="text-sm font-medium text-slate-500">Carregando alunos...</span>
                                    </div>
                                ) : (
                                    <table className="w-full text-left text-sm whitespace-nowrap relative">
                                        <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-sm">
                                            <tr>
                                                {renderSortableHeader('Nome do Aluno', 'name')}
                                                {renderSortableHeader('Situação', 'status', 'center')}
                                                <th className="px-6 py-4 font-semibold text-center text-xs uppercase tracking-wider">Categoria</th>
                                                <th className="px-6 py-4 font-semibold text-center text-xs uppercase tracking-wider">Contrato</th>
                                                {renderSortableHeader('Total Pago', 'totalPaid', 'right')}
                                                {renderSortableHeader('Em Aberto', 'totalPending', 'right')}
                                                {renderSortableHeader('Atrasado', 'totalOverdue', 'right')}
                                                <th className="px-6 py-4 font-semibold text-center"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {studentsData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).length > 0 ? studentsData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((student: any) => {
                                                const style = getStatusStyle(student.status);

                                                return (
                                                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                                        <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-200">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${style.bg} ${style.text}`}>{student.name.substring(0, 2).toUpperCase()}</div>
                                                                <div className="flex flex-col">
                                                                    <span className="" title={student.name}>{student.name}</span>

                                                                    {student.responsible && (
                                                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 italic mb-0.5" title="Responsável">Resp: {student.responsible}</span>
                                                                    )}

                                                                    <span className="text-[10px] text-slate-400 font-normal flex items-center gap-1" title={student.externalId ? "ID da Planilha" : "ID Interno"}>
                                                                        {student.cpf && <span className="font-mono text-slate-500">CPF: {student.cpf} <span className="text-slate-300 mx-1">|</span></span>}
                                                                        ID: <span className="font-mono text-slate-500">{student.externalId || student.id}</span>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${style.bg} ${style.text}`}>
                                                                {student.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center text-xs font-bold text-slate-600 dark:text-slate-400">{student.book || '-'}</td>
                                                        <td className="px-6 py-4 text-center text-xs font-bold text-slate-600 dark:text-slate-400">{student.period || '-'}</td>
                                                        <td className="px-6 py-4 text-right font-medium text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">{formatBRL(student.totalPaid, settings.showCents, settings.privacyMode)}</td>
                                                        <td className="px-6 py-4 text-right font-medium text-slate-600 dark:text-slate-400 font-mono tracking-tight">{formatBRL(student.totalPending, settings.showCents, settings.privacyMode)}</td>
                                                        <td className="px-6 py-4 text-right font-bold text-rose-600 dark:text-rose-400 font-mono tracking-tight">{formatBRL(student.totalOverdue, settings.showCents, settings.privacyMode)}</td>
                                                        <td className="px-6 py-4 text-center">
                                                            {/* Actions if needed */}
                                                        </td>
                                                    </tr>
                                                );
                                            }) : <tr><td colSpan={8} className="p-12 text-center text-slate-400 flex flex-col items-center justify-center w-full min-h-[300px]"><FileSearch size={48} className="mb-4 opacity-30" /><span>Nenhum aluno encontrado.</span></td></tr>}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            {/* FOOTER PAGINATION */}
                            <TablePagination
                                currentPage={currentPage}
                                totalPages={Math.ceil(studentsData.length / itemsPerPage)}
                                itemsPerPage={itemsPerPage}
                                totalItems={studentsData.length}
                                onPageChange={setCurrentPage}
                                onItemsPerPageChange={(items) => { setItemsPerPage(items); setCurrentPage(1); }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentsPage;
