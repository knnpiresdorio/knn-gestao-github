import React from 'react';
import {
    GraduationCap, Search, ChevronDown, X, FileSearch, RefreshCw, ArrowUp, ArrowDown
} from 'lucide-react';
import { STATUS_STYLES, THEME_BG_COLORS } from '../../utils/constants';
import StudentsKpiGrid from '../students/StudentsKpiGrid';
import ScholarshipChart from '../students/ScholarshipChart';
import StudentProfileChart from '../students/StudentProfileChart';
import TablePagination from '../common/TablePagination';
import StatusBadge from '../common/StatusBadge';

interface StudentsPageProps {
    studentsData: any[];
    studentMetrics: any;
    retentionStats: any;
    scholarshipData: any[];
    studentProfileData: any[];
    loading: boolean;
    currentPage: number;
    setCurrentPage: (page: number) => void;
    itemsPerPage: number;
    setItemsPerPage: (items: number) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    studentFilters: { status: string, book?: string, period?: string, day?: string };
    setStudentFilters: (filters: any) => void; // Using any or specific type if available
    stuSortConfig: any[];
    setStuSortConfig: (config: any[]) => void;
    settings: any;
    formatBRL: (val: number, showCents: boolean, privacyMode: boolean) => string;
    handleSort: (key: string, currentConfig: any[], setConfig: (c: any[]) => void) => void;
    studentsScrollRef: React.RefObject<HTMLDivElement>;
    studentsTableTopRef: React.RefObject<HTMLDivElement>;
    uniqueOptions: { books: string[], periods: string[], days: string[] };
}

const StudentsPage: React.FC<StudentsPageProps> = ({
    studentsData,
    studentMetrics,
    retentionStats,
    scholarshipData,
    studentProfileData,
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
    uniqueOptions
}) => {

    const currentThemeBg = THEME_BG_COLORS[settings.themeColor] || 'bg-slate-900';

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
        <div ref={studentsScrollRef} className="space-y-6 animate-in fade-in duration-300 h-full overflow-y-auto pb-20 custom-scrollbar">
            {/* HEADER */}
            <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${currentThemeBg} flex items-center justify-center text-white shadow-lg`}>
                        <GraduationCap size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Alunos & Matrículas</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Gestão financeira por aluno e acompanhamento de parcelas.</p>
                    </div>
                </div>
            </div>

            {/* FILTERS SECTION */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 shrink-0 space-y-6">

                {/* ROW 1: Search & Main Status */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Search - Standard width */}
                    <div className="md:col-span-8 space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Buscar Aluno</label>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input type="text" placeholder="Nome do aluno..." className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:text-white transition-all shadow-sm" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                        </div>
                    </div>

                    {/* Status & Clear - Side by side */}
                    <div className="md:col-span-4 space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Situação Financeira</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <select value={studentFilters.status} onChange={(e) => { setStudentFilters((s: any) => ({ ...s, status: e.target.value })); setCurrentPage(1); }} className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:text-white appearance-none transition-all shadow-sm cursor-pointer">
                                    <option value="Todos">Todos</option>
                                    <option value="Ativo">Ativo</option>
                                    <option value="Inadimplente">Inadimplente</option>
                                    <option value="Cancelado">Cancelado</option>
                                    <option value="Evadido">Evadido</option>
                                    <option value="Trancado">Trancado</option>
                                    <option value="Concluído">Concluído</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><ChevronDown size={16} /></div>
                            </div>
                            <button
                                onClick={() => { setSearchTerm(''); setStudentFilters({ status: 'Todos' }); setCurrentPage(1); }}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                            >
                                <X size={14} /> Limpar
                            </button>
                        </div>
                    </div>
                </div>

                {/* ROW 2: Segment Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                    {/* BOOK FILTER */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Livro / Estágio</label>
                        <div className="relative">
                            <select value={studentFilters.book || 'Todos'} onChange={(e) => { setStudentFilters((s: any) => ({ ...s, book: e.target.value })); setCurrentPage(1); }} className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:text-white appearance-none cursor-pointer shadow-sm">
                                <option value="Todos">Todos</option>
                                {uniqueOptions?.books.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><ChevronDown size={16} /></div>
                        </div>
                    </div>

                    {/* PERIOD FILTER */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Período de Contrato</label>
                        <div className="relative">
                            <select value={studentFilters.period || 'Todos'} onChange={(e) => { setStudentFilters((s: any) => ({ ...s, period: e.target.value })); setCurrentPage(1); }} className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:text-white appearance-none cursor-pointer shadow-sm">
                                <option value="Todos">Todos</option>
                                {uniqueOptions?.periods.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><ChevronDown size={16} /></div>
                        </div>
                    </div>

                    {/* PAYMENT DAY FILTER */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dia do Vencimento</label>
                        <div className="relative">
                            <select value={studentFilters.day || 'Todos'} onChange={(e) => { setStudentFilters((s: any) => ({ ...s, day: e.target.value })); setCurrentPage(1); }} className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:text-white appearance-none cursor-pointer shadow-sm">
                                <option value="Todos">Todos</option>
                                {uniqueOptions?.days.map(d => <option key={d} value={d}>Dia {d}</option>)}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><ChevronDown size={16} /></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* STUDENT KPIS */}
            <StudentsKpiGrid metrics={studentMetrics} settings={settings} retentionStats={retentionStats} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <ScholarshipChart data={scholarshipData} />
                <StudentProfileChart data={studentProfileData} />
            </div>

            {/* TABLE CARD */}
            <div ref={studentsTableTopRef} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[600px]">
                {/* TABLE HEADER COUNT */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
                    <div className="flex item-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 mt-2"></div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lista de Alunos</span>
                    </div>
                    <span className="text-xs font-bold text-slate-500">{studentsData.length} alunos</span>
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
                                    // Safe parcel count logic or fallback
                                    const currentP = student.currentInstallment || '-';
                                    const totalP = student.totalInstallments || (student.installments ? student.installments.length : '-');
                                    const parcelText = (currentP !== '-' && totalP !== '-') ? `Parc. ${currentP}/${totalP}` : '-';

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
    );
};

export default StudentsPage;
