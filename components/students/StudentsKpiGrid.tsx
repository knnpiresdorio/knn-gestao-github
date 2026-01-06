import React from 'react';
import { Users, UserMinus, DollarSign, TrendingDown, XCircle, UserX, Lock, Info, LucideIcon } from 'lucide-react';
import TicketMedioCard from '../dashboard/TicketMedioCard';
import KpiCard from '../dashboard/KpiCard'; // Import shared KpiCard
import { formatBRL } from '../../utils/formatters';

interface RetentionStat {
    currS1: number;
    prevS1: number;
    currS2: number;
    prevS2: number;
}

interface StudentsKpiGridProps {
    metrics: {
        activeBase: { active: number; enrolled: number; total: number };
        churnRate: { percentage: number; absolute: number; total: number };
        avgTicket: number;
        ticketDistribution: { label: string; value: number; percentage: number }[];
    };
    settings: {
        showCents: boolean;
        privacyMode: boolean;
        themeColor: string; // Ensure themeColor is in settings type if not inferred
    };
    retentionStats: {
        selectedYear: number;
        setRetentionYear: (year: number) => void;
        cancelado: RetentionStat;
        evadido: RetentionStat;
        trancado: RetentionStat;
    };
    loading?: boolean;
}

const StudentsKpiGrid: React.FC<StudentsKpiGridProps> = ({ metrics, settings, retentionStats, loading }) => {

    const renderComparativeRow = (label: string, stat: RetentionStat, reverseColors = false) => {
        const pctS1 = stat.prevS1 > 0 ? ((stat.currS1 - stat.prevS1) / stat.prevS1) * 100 : (stat.currS1 > 0 ? 100 : 0);
        const pctS2 = stat.prevS2 > 0 ? ((stat.currS2 - stat.prevS2) / stat.prevS2) * 100 : (stat.currS2 > 0 ? 100 : 0);

        const getColor = (pct: number) => {
            if (pct === 0) return 'text-slate-500';
            const isPositive = pct > 0; // Increase in value
            // If reverseColors is true (e.g. churn), increase is BAD (rose), decrease is GOOD (emerald)
            // If reverseColors is false (e.g. retention), increase is GOOD (emerald), decrease is BAD (rose)

            if (reverseColors) {
                return isPositive ? 'text-rose-500' : 'text-emerald-500';
            }
            return isPositive ? 'text-emerald-500' : 'text-rose-500';
        };

        return (
            <div className="flex flex-col gap-1 py-1">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{label}</span>
                </div>
                <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2 border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700 dark:text-slate-200">S1: {stat.currS1}</span>
                        <span className={`text-[10px] flex items-center ${getColor(pctS1)}`}>
                            {pctS1 !== 0 && (pctS1 > 0 ? <TrendingDown size={10} className="rotate-180 mr-0.5" /> : <TrendingDown size={10} className="mr-0.5" />)}
                            {pctS1 !== 0 ? `${Math.abs(pctS1).toFixed(0)}%` : '-'}
                        </span>
                    </div>
                    <div className="w-px h-3 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700 dark:text-slate-200">S2: {stat.currS2}</span>
                        <span className={`text-[10px] flex items-center ${getColor(pctS2)}`}>
                            {pctS2 !== 0 && (pctS2 > 0 ? <TrendingDown size={10} className="rotate-180 mr-0.5" /> : <TrendingDown size={10} className="mr-0.5" />)}
                            {pctS2 !== 0 ? `${Math.abs(pctS2).toFixed(0)}%` : '-'}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // Years for the selector - could be dynamic in future
    const availableYears = [2023, 2024, 2025, 2026];

    const renderYearSelector = (colorClass: string, activeBgClass: string) => (
        <div className="ml-auto flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 overflow-x-auto custom-scrollbar max-w-[120px] sm:max-w-none">
            {availableYears.map(y => (
                <button
                    key={y}
                    onClick={() => retentionStats.setRetentionYear(y)}
                    className={`px-2 py-0.5 text-[9px] font-bold rounded-md transition-all whitespace-nowrap snap-center ${retentionStats.selectedYear === y ? `bg-white dark:bg-slate-700 ${colorClass} shadow-sm` : 'text-slate-400 hover:text-slate-500'}`}
                >
                    {y}
                </button>
            ))}
        </div>
    );

    return (
        <div className="space-y-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {/* 1. Base Ativa (Refactored) */}
                <div className={`relative bg-app-card dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-2xl overflow-hidden flex flex-col justify-between group h-full min-h-[200px]`}>
                    {/* Background Decor */}
                    <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                        <div className={`absolute -left-4 -bottom-8 opacity-[0.05] transform -rotate-12 transition-transform group-hover:scale-110 group-hover:-rotate-6 text-blue-600 dark:text-blue-500`}>
                            <Users size={180} strokeWidth={1.5} />
                        </div>
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-blue-100 dark:bg-blue-900/20 blur-3xl -mr-8 -mt-8 opacity-50 transition-transform group-hover:scale-125 duration-700`}></div>
                    </div>

                    <div className="relative z-10 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 ring-1 ring-inset ring-blue-500/20 shadow-sm`}>
                                    <Users size={18} strokeWidth={2.5} />
                                </div>
                                <span className="font-bold text-slate-700 dark:text-white text-[12px] uppercase tracking-widest">Base Ativa</span>
                            </div>
                            <div className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors cursor-help" title="Resumo da base: Alunos em curso / Matrículas recentes / Total histórico.">
                                <Info size={16} />
                            </div>
                        </div>

                        <div className="mt-auto mb-2 relative z-10">
                            {/* Main Hero Value: Active Only */}
                            <h3 className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter drop-shadow-sm leading-none mb-1">
                                {metrics.activeBase.active}
                            </h3>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider opacity-80 mb-4">
                                Alunos Cursando
                            </p>

                            {/* Secondary Metrics Grid */}
                            <div className="flex items-center gap-4 border-t border-slate-100 dark:border-white/5 pt-3">
                                {/* Enrollments - Highlighted */}
                                <div className="flex flex-col">
                                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400 leading-tight">+{metrics.activeBase.enrolled}</span>
                                    <span className="text-[9px] text-slate-500 font-bold uppercase">Novas Matrículas</span>
                                </div>

                                <div className="w-px h-6 bg-slate-200 dark:bg-white/10"></div>

                                {/* Total Historical - Context */}
                                <div className="flex flex-col">
                                    <span className="text-lg font-bold text-slate-600 dark:text-slate-400 leading-tight">{metrics.activeBase.total}</span>
                                    <span className="text-[9px] text-slate-500 font-bold uppercase">Total Histórico</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Ticket Médio (Standard) */}
                <TicketMedioCard
                    activeStudents={metrics.activeBase.active}
                    metrics={{
                        ticketDistribution: metrics.ticketDistribution,
                        avgTicket: metrics.avgTicket
                    }}
                    value={metrics.avgTicket} // keeping for fallback if needed
                    distribution={metrics.ticketDistribution} // keeping for fallback
                    activeCount={metrics.activeBase.active} // keeping for fallback
                    defaultExpanded={true}
                    settings={settings}
                    formatBRL={formatBRL}
                    loading={loading}
                    // Removed col-span-2 to fit 4 col layout
                    allowChartToggle={false} // Force compact view or just simple view if desired, but retaining chart features
                />

                {/* 3. NEW: Perdas & Evasão (Consolidated) */}
                <div className={`relative bg-app-card dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-2xl overflow-hidden flex flex-col justify-between group h-full min-h-[200px]`}>
                    {/* Background Decor */}
                    <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                        <div className={`absolute -left-4 -bottom-8 opacity-[0.05] transform -rotate-12 transition-transform group-hover:scale-110 group-hover:-rotate-6 text-rose-600 dark:text-rose-500`}>
                            <UserMinus size={180} strokeWidth={1.5} />
                        </div>
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-rose-100 dark:bg-rose-900/20 blur-3xl -mr-8 -mt-8 opacity-50 transition-transform group-hover:scale-125 duration-700`}></div>
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2.5 rounded-xl bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 ring-1 ring-inset ring-rose-500/20 shadow-sm`}>
                                <UserMinus size={18} strokeWidth={2.5} />
                            </div>
                            <span className="font-bold text-slate-700 dark:text-white text-[12px] uppercase tracking-widest leading-none">Perdas &<br />Evasão</span>

                            {/* Year Selector Mini */}
                            {renderYearSelector('text-rose-500', '')}
                        </div>

                        <div className="mb-4">
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-4xl font-black text-rose-600 dark:text-rose-400 tracking-tighter drop-shadow-sm">
                                    {metrics.churnRate.percentage.toFixed(1)}%
                                </h3>
                                <span className="text-xs font-bold text-slate-500 uppercase">Taxa Geral</span>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1 opacity-80">
                                {metrics.churnRate.absolute} Alunos Perdidos (Total)
                            </p>
                        </div>

                        <div className="space-y-2 mt-auto">
                            {renderComparativeRow('Desistentes', retentionStats.cancelado, true)}
                            {renderComparativeRow('Evadidos', retentionStats.evadido, true)}
                        </div>
                    </div>
                </div>

                {/* 4. NEW: Trancamentos & Retenção (Consolidated) */}
                <div className={`relative bg-app-card dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-2xl overflow-hidden flex flex-col justify-between group h-full min-h-[200px]`}>
                    {/* Background Decor */}
                    <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                        <div className={`absolute -left-4 -bottom-8 opacity-[0.05] transform -rotate-12 transition-transform group-hover:scale-110 group-hover:-rotate-6 text-cyan-600 dark:text-cyan-500`}>
                            <Lock size={180} strokeWidth={1.5} />
                        </div>
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-cyan-100 dark:bg-cyan-900/20 blur-3xl -mr-8 -mt-8 opacity-50 transition-transform group-hover:scale-125 duration-700`}></div>
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2.5 rounded-xl bg-cyan-100 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 ring-1 ring-inset ring-cyan-500/20 shadow-sm`}>
                                <Lock size={18} strokeWidth={2.5} />
                            </div>
                            <span className="font-bold text-slate-700 dark:text-white text-[12px] uppercase tracking-widest">Trancamentos</span>

                            {/* Year Selector Mini */}
                            {renderYearSelector('text-cyan-500', '')}
                        </div>

                        <div className="mb-4">
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-4xl font-black text-cyan-600 dark:text-cyan-400 tracking-tighter drop-shadow-sm">
                                    {/* Calculating total locked for current view mostly for impact */}
                                    {retentionStats.trancado.currS1 + retentionStats.trancado.currS2}
                                </h3>
                                <span className="text-xs font-bold text-slate-500 uppercase">Trancados ({retentionStats.selectedYear})</span>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1 opacity-80">
                                Matrículas em Stand-by
                            </p>
                        </div>

                        <div className="space-y-2 mt-auto">
                            {renderComparativeRow('Trancamentos', retentionStats.trancado, true)}

                            {/* Extra Slot - Maybe New Enrollments? Or just spacing */}
                            <div className="flex flex-col gap-1 py-1 opacity-60">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Obs:</span>
                                </div>
                                <p className="text-[10px] leading-tight text-slate-500">
                                    Alunos trancados não contam para o cálculo de Evasão (Churn) até o cancelamento efetivo.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StudentsKpiGrid;
