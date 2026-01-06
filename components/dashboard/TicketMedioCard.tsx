import React, { useState } from 'react';
import { DollarSign, BarChart2 } from 'lucide-react';
import { formatBRL } from '../../utils/formatters';

interface TicketMedioCardProps {
    activeStudents: number;
    metrics: any; // Contains ticketDistribution, avgTicket
    settings: any;
    formatBRL: (val: number, showCents: boolean, privacyMode: boolean) => string;
    loading?: boolean;
    // New Props
    allowQuarterlyView?: boolean;
    quarterlyData?: { label: string, value: number }[];
    currentQuarterValue?: number;
    allowChartToggle?: boolean; // New prop to control chart button visibility
    defaultExpanded?: boolean; // New prop to force expanded view by default
    // Optional props for compatibility if needed, though we are using specific ones above
    value?: number;
    distribution?: any[];
    activeCount?: number;
    showChart?: boolean;
    className?: string; // Add className to props
}


const TicketMedioCard: React.FC<TicketMedioCardProps> = ({
    activeStudents,
    metrics,
    settings,
    loading,
    allowQuarterlyView,
    quarterlyData,
    currentQuarterValue,
    allowChartToggle = true, // Default to true (Students page behavior)
    defaultExpanded = false,
    // Fallbacks
    value,
    distribution,
    activeCount,
    className = ""
}) => {
    const [showChart, setShowChart] = useState(defaultExpanded);
    // If allowQuarterlyView is true (Dashboard), default to 'quarterly'. Otherwise 'current'.
    const [viewMode, setViewMode] = useState<'current' | 'quarterly'>(allowQuarterlyView ? 'quarterly' : 'current');

    // Resolve data sources
    const distributionData = metrics?.ticketDistribution || distribution || [];
    const studentCount = activeStudents || activeCount || 0;
    const standardValue = metrics?.avgTicket || value || 0;

    // Theme Constants - Updated for Light/Dark Mode
    const cardBg = 'bg-app-card dark:bg-slate-900 backdrop-blur-xl';
    const accentColor = 'text-emerald-600 dark:text-emerald-400';
    const accentBg = 'bg-emerald-100 dark:bg-emerald-900/20';

    const valueToDisplay = viewMode === 'quarterly' && currentQuarterValue
        ? currentQuarterValue
        : standardValue;

    const labelToDisplay = viewMode === 'quarterly'
        ? 'Ticket Médio'
        : 'Ticket Médio';

    return (
        <div className={`relative ${cardBg} rounded-xl p-6 border border-transparent dark:border-white/10 shadow-sm dark:shadow-2xl overflow-hidden flex flex-col justify-between min-h-[200px] group ${className}`}>

            {/* Background Decoration Layer - Ghost Icon (Matched to KpiCard) */}
            <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                <div className={`absolute -left-4 -bottom-8 opacity-[0.05] transform -rotate-12 transition-transform group-hover:scale-110 group-hover:-rotate-6 text-emerald-600 dark:text-emerald-500`}>
                    <DollarSign size={180} strokeWidth={1.5} />
                </div>
                <div className={`absolute top-0 right-0 w-32 h-32 bg-emerald-100 dark:bg-emerald-900/20 blur-3xl -mr-8 -mt-8 opacity-50 transition-transform group-hover:scale-125 duration-700`}></div>
            </div>

            {loading ? (
                <div className="animate-pulse space-y-3 mt-4">
                    <div className="flex justify-between">
                        <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                        <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    </div>
                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded mt-4" />
                    <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded mt-2" />
                    <div className="flex gap-2 mt-8">
                        <div className="h-16 flex-1 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                        <div className="h-16 flex-1 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                        <div className="h-16 flex-1 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                        <div className="h-16 flex-1 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    </div>
                </div>
            ) : (
                <>
                    {/* Header Controls (Always visible but styled differently in wide mode) */}
                    {!showChart && (
                        <div className="relative z-10 flex justify-between items-center mb-2">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl ${accentBg} ${accentColor} ring-1 ring-inset ring-emerald-500/20 shadow-sm`}>
                                    <DollarSign size={18} strokeWidth={2.5} />
                                </div>
                                <span className="font-bold text-slate-700 dark:text-white text-[12px] uppercase tracking-widest">{labelToDisplay}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                {allowQuarterlyView && (
                                    <div className="mr-1">
                                        <div className="bg-emerald-500 text-white border border-emerald-500 font-bold text-[9px] px-2 py-0.5 rounded-full cursor-default shadow-sm">
                                            Visão Trimestral
                                        </div>
                                    </div>
                                )}

                                {allowChartToggle && (
                                    <button
                                        onClick={() => setShowChart(!showChart)}
                                        className={`p-2 rounded-lg transition-colors ${showChart ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                        title={showChart ? "Ver Valores" : "Ver Distribuição"}
                                    >
                                        <BarChart2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* CONTENT SWITCHER */}
                    {showChart ? (
                        /* MODE 2: COMPLETE DISTRIBUTION VIEW (Side-by-Side Layout) */
                        <div className="animate-in fade-in zoom-in duration-300 flex flex-col h-full">
                            {/* Wide Header */}
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-xl ${accentBg} ${accentColor} ring-1 ring-inset ring-emerald-500/20 shadow-sm`}>
                                        <DollarSign size={18} strokeWidth={2.5} />
                                    </div>
                                    <span className="font-bold text-slate-700 dark:text-white text-[12px] uppercase tracking-widest">TICKET MÉDIO</span>
                                </div>
                                {!defaultExpanded && (
                                    <button
                                        onClick={() => setShowChart(false)}
                                        className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 transition-colors"
                                        title="Voltar"
                                    >
                                        <BarChart2 size={16} />
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-col gap-4 h-full relative z-10">
                                {/* TOP: Values (Compact) */}
                                <div className="flex items-end justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                                    <div>
                                        <h3 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter drop-shadow-sm leading-none">
                                            {formatBRL(standardValue, settings.showCents, settings.privacyMode)}
                                        </h3>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1 opacity-80">
                                            Receita por Aluno Ativo
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{studentCount}</span>
                                        <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase">Matrículas</p>
                                    </div>
                                </div>

                                {/* BOTTOM: Distribution Bars */}
                                <div className="flex-1 flex flex-col justify-evenly space-y-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[9px] font-bold text-slate-500 uppercase">Distribuição de Valores</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                                        {distributionData.map((d: any, idx: number) => (
                                            <div key={idx} className="flex flex-col gap-1 relative group w-full">
                                                <div className="flex justify-between items-end text-[10px]">
                                                    <span className="text-slate-600 dark:text-slate-300 font-bold truncate pr-2">{d.label}</span>
                                                    <span className="text-slate-800 dark:text-white font-bold whitespace-nowrap">{d.value} <span className="text-slate-400 dark:text-slate-500 font-normal text-[9px]">({d.percentage.toFixed(0)}%)</span></span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out group-hover:bg-emerald-400 relative"
                                                        style={{ width: `${d.percentage}%` }}
                                                    >
                                                        {/* Glow effect */}
                                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-4 bg-emerald-400 blur-sm opacity-50" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* MODE 1: VERTICAL QUARTERLY VIEW (Standard Layout) */
                        <div className="flex-1 flex flex-col relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Main Value */}
                            <div className="mb-4 mt-2">
                                <h3 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter drop-shadow-sm">
                                    {formatBRL(valueToDisplay, settings.showCents, settings.privacyMode)}
                                </h3>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1 opacity-80">
                                    {studentCount} Alunos Ativos & Matriculados
                                </p>
                            </div>

                            {/* Quarterly Grid */}
                            <div className="mt-auto">
                                {viewMode === 'quarterly' && quarterlyData && quarterlyData.length > 0 ? (
                                    <div className="grid grid-cols-4 gap-2">
                                        {quarterlyData.map((q: any) => (
                                            <div key={q.label} className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/40 p-2 rounded-xl border border-slate-200 dark:border-white/5 hover:border-emerald-500/30 hover:bg-white dark:hover:bg-slate-800/60 transition-all group shadow-sm dark:shadow-none">
                                                <span className="text-[9px] text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 font-bold uppercase transition-colors">{q.label}</span>
                                                <span className="text-[11px] text-slate-700 dark:text-white font-bold leading-tight mt-0.5">{formatBRL(q.value, false, settings.privacyMode)}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    /* Fallback/Empty State for 'Current' view if needed, usually just space */
                                    <div className="h-14 w-full" />
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default TicketMedioCard;

