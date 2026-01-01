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

    // Theme Constants
    const cardBg = 'bg-[#020617]';
    const accentColor = 'text-emerald-400';
    const accentBg = 'bg-emerald-900/20';

    const valueToDisplay = viewMode === 'quarterly' && currentQuarterValue
        ? currentQuarterValue
        : standardValue;

    const labelToDisplay = viewMode === 'quarterly'
        ? 'Ticket Médio'
        : 'Ticket Médio';

    return (
        <div className={`relative ${cardBg} rounded-xl p-6 border border-slate-800 shadow-2xl overflow-hidden flex flex-col justify-between min-h-[200px] ${className}`}>

            {/* Background Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                <DollarSign size={180} strokeWidth={1} />
            </div>

            {loading ? (
                <div className="animate-pulse space-y-3 mt-4">
                    <div className="flex justify-between">
                        <div className="h-10 w-10 bg-slate-800 rounded-xl" />
                        <div className="h-8 w-8 bg-slate-800 rounded-lg" />
                    </div>
                    <div className="h-4 w-32 bg-slate-800 rounded mt-4" />
                    <div className="h-10 w-48 bg-slate-800 rounded mt-2" />
                    <div className="flex gap-2 mt-8">
                        <div className="h-16 flex-1 bg-slate-800 rounded-lg" />
                        <div className="h-16 flex-1 bg-slate-800 rounded-lg" />
                        <div className="h-16 flex-1 bg-slate-800 rounded-lg" />
                        <div className="h-16 flex-1 bg-slate-800 rounded-lg" />
                    </div>
                </div>
            ) : (
                <>
                    {/* Header Controls (Always visible but styled differently in wide mode) */}
                    {!showChart && (
                        <div className="relative z-10 flex justify-between items-center mb-2">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl ${accentBg} ${accentColor} ring-1 ring-white/10 shadow-inner`}>
                                    <DollarSign size={18} strokeWidth={2.5} />
                                </div>
                                <span className="font-bold text-white text-[12px] uppercase tracking-widest">{labelToDisplay}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                {allowQuarterlyView && (
                                    <div className="mr-1">
                                        <div className="bg-emerald-500 text-white border border-emerald-500 font-bold text-[9px] px-2 py-0.5 rounded-full cursor-default">
                                            Visão Trimestral
                                        </div>
                                    </div>
                                )}

                                {allowChartToggle && (
                                    <button
                                        onClick={() => setShowChart(!showChart)}
                                        className={`p-2 rounded-lg transition-colors ${showChart ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-white/5 text-slate-500'}`}
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
                                    <div className={`p-2.5 rounded-xl ${accentBg} ${accentColor} ring-1 ring-white/10 shadow-inner`}>
                                        <DollarSign size={18} strokeWidth={2.5} />
                                    </div>
                                    <span className="font-bold text-white text-[12px] uppercase tracking-widest">TICKET MÉDIO</span>
                                </div>
                                {!defaultExpanded && (
                                    <button
                                        onClick={() => setShowChart(false)}
                                        className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                                        title="Voltar"
                                    >
                                        <BarChart2 size={16} />
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-col md:flex-row gap-6 h-full">
                                {/* LEFT: Values */}
                                <div className="flex flex-col justify-center min-w-[200px]">
                                    <h3 className="text-5xl font-black text-white tracking-tighter drop-shadow-sm mb-1">
                                        {formatBRL(standardValue, settings.showCents, settings.privacyMode)}
                                    </h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider opacity-80">
                                        Receita por Aluno Ativo <br />
                                        <span className="text-emerald-500">{studentCount} Alunos Matrículados</span>
                                    </p>
                                </div>

                                {/* RIGHT: Distribution Bars */}
                                <div className="flex-1 flex flex-col justify-center space-y-3 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[9px] font-bold text-slate-500 uppercase">Distribuição de Valores</span>
                                        <span className="text-[9px] font-bold text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded-full">{studentCount} Ativos</span>
                                    </div>
                                    {distributionData.map((d: any, idx: number) => (
                                        <div key={idx} className="flex flex-col gap-1 relative group w-full">
                                            <div className="flex justify-between items-end text-[10px]">
                                                <span className="text-slate-300 font-bold">{d.label}</span>
                                                <span className="text-white font-bold">{d.value} <span className="text-slate-500 font-normal text-[9px]">({d.percentage.toFixed(0)}%)</span></span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
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
                    ) : (
                        /* MODE 1: VERTICAL QUARTERLY VIEW (Standard Layout) */
                        <div className="flex-1 flex flex-col relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Main Value */}
                            <div className="mb-4 mt-2">
                                <h3 className="text-4xl font-black text-white tracking-tighter drop-shadow-sm">
                                    {formatBRL(valueToDisplay, settings.showCents, settings.privacyMode)}
                                </h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 opacity-80">
                                    {studentCount} Alunos Ativos & Matriculados
                                </p>
                            </div>

                            {/* Quarterly Grid */}
                            <div className="mt-auto">
                                {viewMode === 'quarterly' && quarterlyData && quarterlyData.length > 0 ? (
                                    <div className="grid grid-cols-4 gap-2">
                                        {quarterlyData.map((q: any) => (
                                            <div key={q.label} className="flex flex-col items-center justify-center bg-slate-900/40 p-2 rounded-xl border border-white/5 hover:border-emerald-500/30 hover:bg-slate-800/60 transition-all group">
                                                <span className="text-[9px] text-slate-500 group-hover:text-emerald-400 font-bold uppercase transition-colors">{q.label}</span>
                                                <span className="text-[11px] text-white font-bold leading-tight mt-0.5">{formatBRL(q.value, false, settings.privacyMode)}</span>
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

