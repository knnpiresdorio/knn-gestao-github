import React from 'react';
import {
    LayoutDashboard, GraduationCap, Wallet, Layers, Table, Database, Settings, LogOut,
    TrendingUp, ChevronLeft, ChevronRight, CalendarDays, RotateCcw, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import MenuItem from './MenuItem';
import { THEME_BG_COLORS } from '../../utils/constants';

interface SidebarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    settings: any;
    startDate: string;
    setStartDate: (date: string) => void;
    endDate: string;
    setEndDate: (date: string) => void;
    activeFilter: string;
    setActiveFilter: (filter: string) => void;
    resetDates: () => void;
    setFilterPeriod: (type: string) => void;
    signOut: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    isSidebarOpen,
    setIsSidebarOpen,
    activeTab,
    setActiveTab,
    settings,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    activeFilter,
    setActiveFilter,
    resetDates,
    setFilterPeriod,
    signOut
}) => {
    const currentThemeBg = THEME_BG_COLORS[settings.themeColor] || 'bg-violet-600';

    return (
        <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-app-ui dark:bg-slate-900 border-r border-transparent dark:border-slate-800 flex flex-col z-20 transition-all duration-500 ease-in-out flex-shrink-0 relative`}>
            <div className={`h-20 flex items-center ${isSidebarOpen ? 'px-6' : 'justify-center'} border-b border-white/50 dark:border-slate-800/50`}>
                {isSidebarOpen ? (
                    <div className="flex items-center gap-3 animate-in fade-in duration-300">
                        <div className={`${currentThemeBg} p-2.5 rounded-xl shadow-lg shadow-${settings.themeColor}-500/20 text-white transform hover:scale-105 transition-transform`}>
                            <TrendingUp size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg tracking-tight text-text-primary dark:text-white leading-none">{settings.schoolName}</h1>
                            <span className="text-[10px] font-bold text-text-secondary dark:text-slate-400 uppercase tracking-widest">Painel Financeiro</span>
                        </div>
                    </div>
                ) : (
                    <div className={`${currentThemeBg} p-2.5 rounded-xl shadow-lg text-white`}>
                        <TrendingUp size={24} />
                    </div>
                )}
            </div>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="absolute -right-3 top-24 w-6 h-6 bg-app-ui dark:bg-slate-800 border-none shadow-md rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary dark:hover:text-slate-200 z-30 transition-all">
                {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
                <Link to="/" className="block">
                    <MenuItem icon={LayoutDashboard} label="Dashboard Geral" active={activeTab === 'dashboard'} collapsed={!isSidebarOpen} onClick={() => { }} theme={settings.themeColor} />
                </Link>
                <Link to="/students" className="block">
                    <MenuItem icon={GraduationCap} label="Alunos & Matriculas" active={activeTab === 'students'} collapsed={!isSidebarOpen} onClick={() => { }} theme={settings.themeColor} />
                </Link>
                <Link to="/expenses" className="block">
                    <MenuItem icon={Wallet} label="Controle Despesas" active={activeTab === 'expenses'} collapsed={!isSidebarOpen} onClick={() => { }} theme={settings.themeColor} />
                </Link>
                <Link to="/dre-gerencial" className="block">
                    <MenuItem icon={Layers} label="DRE Gerencial" active={activeTab === 'dre_gerencial'} collapsed={!isSidebarOpen} onClick={() => { }} theme={settings.themeColor} />
                </Link>
                <Link to="/dre" className="block">
                    <MenuItem icon={Table} label="DRE Contábil" active={activeTab === 'dre'} collapsed={!isSidebarOpen} onClick={() => { }} theme={settings.themeColor} />
                </Link>
                <Link to="/database" className="block">
                    <MenuItem icon={Database} label="Base de Dados" active={activeTab === 'database'} collapsed={!isSidebarOpen} onClick={() => { }} theme={settings.themeColor} />
                </Link>




                <div className="my-6 mx-2 border-t border-slate-100 dark:border-slate-800/50"></div>

                {activeTab !== 'students' && (
                    isSidebarOpen ? (
                        <div className="bg-app-ui dark:bg-slate-800/40 rounded-xl p-4 border border-slate-100 dark:border-slate-800/50 animate-in slide-in-from-left-2 duration-300">
                            <div className="flex items-center gap-2 mb-4 text-text-secondary dark:text-slate-400">
                                <CalendarDays size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider">Período de Análise</span>
                            </div>
                            <div className="space-y-3 mb-4">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-[10px] font-bold text-slate-400 uppercase">De</span></div>
                                    <input type="date" className="w-full bg-app-card dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-lg py-2.5 pl-8 pr-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" value={startDate} onChange={(e) => { setStartDate(e.target.value); setActiveFilter(''); }} />
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-[10px] font-bold text-slate-400 uppercase">Até</span></div>
                                    <input type="date" className="w-full bg-app-card dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-lg py-2.5 pl-9 pr-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" value={endDate} onChange={(e) => { setEndDate(e.target.value); setActiveFilter(''); }} />
                                </div>
                            </div>
                            <label className="text-[9px] font-bold text-slate-400 uppercase mb-2 block ml-1">Filtros Rápidos</label>
                            <div className="flex items-center bg-app-card dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-1 mb-2">
                                <button onClick={() => setFilterPeriod('last_3_months')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeFilter === 'last_3_months' ? 'bg-app-ui dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>-3 Meses</button>
                                <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1"></div>
                                <button onClick={() => setFilterPeriod('current_month')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeFilter === 'current_month' ? 'bg-app-ui dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>Mês Atual</button>
                                <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1"></div>
                                <button onClick={() => setFilterPeriod('next_3_months')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeFilter === 'next_3_months' ? 'bg-app-ui dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>+3 Meses</button>
                            </div>
                            <label className="text-[9px] font-bold text-slate-400 uppercase mb-2 block ml-1">Visão Anual</label>
                            <div className="flex items-center bg-app-card dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-1 mb-4">
                                <button onClick={() => setFilterPeriod('last_year')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeFilter === 'last_year' ? 'bg-app-ui dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>Ant.</button>
                                <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1"></div>
                                <button onClick={() => setFilterPeriod('current_year')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeFilter === 'current_year' ? 'bg-app-ui dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>Atual</button>
                                <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1"></div>
                                <button onClick={() => setFilterPeriod('next_year')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeFilter === 'next_year' ? 'bg-app-ui dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>Próx.</button>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-700/50 mt-4">
                                <button onClick={resetDates} className="text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 transition-colors"><RotateCcw size={10} /> Padrão</button>
                                <button onClick={() => { setStartDate(''); setEndDate(''); setActiveFilter(''); }} className="text-[10px] font-bold text-rose-400 hover:text-rose-600 flex items-center gap-1 transition-colors"><X size={10} /> Limpar</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4 py-4 animate-in fade-in duration-300 delay-150">
                            <div className="w-8 h-8 rounded-full bg-app-ui dark:bg-slate-800 flex items-center justify-center text-slate-400" title="Filtros de Data"><CalendarDays size={16} /></div>
                        </div>
                    )
                )}
            </nav>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-app-card dark:bg-slate-900/50 space-y-2">
                <Link to="/settings" className="block">
                    <MenuItem icon={Settings} label="Configurações" active={activeTab === 'configuracoes'} collapsed={!isSidebarOpen} onClick={() => { }} theme={settings.themeColor} />
                </Link>
                <button onClick={signOut} className="w-full group relative flex items-center justify-center gap-2 bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-900/20 text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden">
                    <LogOut size={18} /><span>Sair</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
