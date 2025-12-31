import React from 'react';
import { Users, UserMinus, DollarSign, TrendingDown, XCircle, UserX, Lock, Info, LucideIcon } from 'lucide-react';
import TicketMedioCard from '../dashboard/TicketMedioCard';
import { formatBRL } from '../../utils/formatters';

interface KpiCardProps {
    title: string;
    value: string | number;
    subtext?: string;
    icon: LucideIcon;
    color: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, subtext, icon: Icon, color }) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{value}</h3>
            {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-${color}-100 dark:bg-${color}-900/20 text-${color}-600 dark:text-${color}-400`}>
            <Icon size={24} />
        </div>
    </div>
);

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
    };
    retentionStats: {
        selectedYear: number;
        setRetentionYear: (year: number) => void;
        cancelado: RetentionStat;
        evadido: RetentionStat;
        trancado: RetentionStat;
    };
}

const StudentsKpiGrid: React.FC<StudentsKpiGridProps> = ({ metrics, settings, retentionStats }) => {

    const renderRetentionCard = (title: string, icon: LucideIcon, color: string, key: 'cancelado' | 'evadido' | 'trancado') => {
        const Icon = icon;
        const stat = retentionStats[key];
        const pctS1 = stat.prevS1 > 0 ? ((stat.currS1 - stat.prevS1) / stat.prevS1) * 100 : (stat.currS1 > 0 ? 100 : 0);
        const pctS2 = stat.prevS2 > 0 ? ((stat.currS2 - stat.prevS2) / stat.prevS2) * 100 : (stat.currS2 > 0 ? 100 : 0);

        interface ThemeColors {
            bg: string;
            text: string;
            iconBg: string;
            icon: string;
        }

        const getColors = (c: string): ThemeColors => {
            const map: Record<string, ThemeColors> = {
                slate: { bg: 'bg-[#1e293b]', text: 'text-slate-200', iconBg: 'bg-slate-800/50', icon: 'text-slate-400' },
                purple: { bg: 'bg-[#1e293b]', text: 'text-purple-200', iconBg: 'bg-purple-900/20', icon: 'text-purple-400' },
                cyan: { bg: 'bg-[#1e293b]', text: 'text-cyan-200', iconBg: 'bg-cyan-900/20', icon: 'text-cyan-400' },
                blue: { bg: 'bg-[#1e293b]', text: 'text-blue-200', iconBg: 'bg-blue-900/20', icon: 'text-blue-400' },
                rose: { bg: 'bg-[#1e293b]', text: 'text-rose-200', iconBg: 'bg-rose-900/20', icon: 'text-rose-400' },
                emerald: { bg: 'bg-[#1e293b]', text: 'text-emerald-200', iconBg: 'bg-emerald-900/20', icon: 'text-emerald-400' }
            };
            return map[c] || map.slate;
        };

        const theme = getColors(color);

        return (
            <div key={key} className="bg-[#020617] dark:bg-[#020617] rounded-3xl p-6 border border-slate-800 shadow-xl relative group">
                {/* Background Decoration Layer (Clipped) */}
                <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500 opacity-[0.03] rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 duration-700`}></div>
                </div>

                <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className={`p-2.5 rounded-xl ${theme.iconBg} ${theme.icon} ring-1 ring-white/5`}>
                        <Icon size={18} strokeWidth={2.5} />
                    </div>
                    <span className="font-bold text-white text-[10px] uppercase tracking-widest">{title}</span>
                </div>

                <div className="space-y-6 relative z-10">
                    <div className="flex items-center justify-between pb-4 border-b border-white/5">
                        <div className="space-y-1">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">1º Semestre ({retentionStats.selectedYear})</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-white">{stat.currS1}</span>
                                <span className="text-[10px] text-slate-500 font-medium italic">vs {stat.prevS1}</span>
                            </div>
                        </div>
                        {stat.prevS1 > 0 ? (
                            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${pctS1 <= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'} ring-1 ring-white/5`}>
                                {pctS1 <= 0 ? <TrendingDown size={10} /> : <TrendingDown size={10} className="rotate-180" />}
                                {Math.abs(pctS1).toFixed(0)}%
                            </div>
                        ) : stat.currS1 > 0 ? (
                            <div className="px-2.5 py-1 rounded-full text-[9px] font-black bg-blue-500/10 text-blue-400 ring-1 ring-white/5 uppercase tracking-tighter">
                                Nova Entrada
                            </div>
                        ) : (
                            <div className="text-[10px] text-slate-600 font-bold uppercase">Estável</div>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">2º Semestre ({retentionStats.selectedYear})</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-white">{stat.currS2}</span>
                                <span className="text-[10px] text-slate-500 font-medium italic">vs {stat.prevS2}</span>
                            </div>
                        </div>
                        {stat.prevS2 > 0 ? (
                            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${pctS2 <= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'} ring-1 ring-white/5`}>
                                {pctS2 <= 0 ? <TrendingDown size={10} /> : <TrendingDown size={10} className="rotate-180" />}
                                {Math.abs(pctS2).toFixed(0)}%
                            </div>
                        ) : stat.currS2 > 0 ? (
                            <div className="px-2.5 py-1 rounded-full text-[9px] font-black bg-blue-500/10 text-blue-400 ring-1 ring-white/5 uppercase tracking-tighter">
                                Nova Entrada
                            </div>
                        ) : (
                            <div className="text-[10px] text-slate-600 font-bold uppercase">Estável</div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderSummaryCard = (title: string, value: string | number, sub: string, icon: LucideIcon, color: string, info?: string, extra?: React.ReactNode) => {
        interface ThemeColors {
            bg: string;
            text: string;
            iconBg: string;
            icon: string;
        }

        const getColors = (c: string): ThemeColors => {
            const map: Record<string, ThemeColors> = {
                blue: { bg: 'bg-[#1e293b]', text: 'text-blue-200', iconBg: 'bg-blue-900/20', icon: 'text-blue-400' },
                rose: { bg: 'bg-[#1e293b]', text: 'text-rose-200', iconBg: 'bg-rose-900/20', icon: 'text-rose-400' },
                emerald: { bg: 'bg-[#1e293b]', text: 'text-emerald-200', iconBg: 'bg-emerald-900/20', icon: 'text-emerald-400' }
            };
            return map[c] || map.blue;
        };
        const theme = getColors(color);
        const Icon = icon;

        return (
            <div key={title} className={`backdrop-blur-xl bg-slate-900/40 dark:bg-slate-900/40 rounded-3xl p-6 border border-white/10 shadow-2xl relative group flex flex-col transition-all hover:bg-slate-900/60 hover:border-white/20 ${extra ? 'lg:col-span-2' : ''}`}>
                <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/10 blur-3xl -mr-8 -mt-8 transition-transform group-hover:scale-125 duration-700`}></div>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center gap-6 h-full w-full">
                    <div className="flex-1 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between mb-6 relative z-10 w-full">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl ${theme.iconBg} ${theme.icon} ring-1 ring-white/10`}>
                                    <Icon size={18} strokeWidth={2.5} />
                                </div>
                                <span className="font-bold text-white text-[10px] uppercase tracking-widest">{title}</span>
                            </div>
                            {info && (
                                <div className="group/info relative">
                                    <Info size={14} className="text-slate-500 hover:text-slate-300 transition-colors cursor-help" />
                                    <div className="absolute top-0 right-0 translate-x-2 -translate-y-full mb-3 w-56 p-3 bg-slate-800 backdrop-blur-md text-[10px] text-slate-200 rounded-xl opacity-0 group-hover/info:opacity-100 transition-all pointer-events-none z-[100] shadow-2xl border border-white/10 whitespace-normal leading-relaxed ring-1 ring-black/50">
                                        <p className="font-bold text-white mb-1 uppercase tracking-tight">Sobre este indicador</p>
                                        {info}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative z-10 space-y-1">
                            <h3 className="text-3xl font-black text-white tracking-tighter leading-none mb-1">{value}</h3>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">{sub}</p>
                        </div>
                    </div>

                    {extra && (
                        <div className="lg:w-1/2 w-full relative z-10 lg:pl-6 lg:border-l lg:border-white/5">
                            {extra}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {renderSummaryCard(
                    'Base Ativa',
                    `${metrics.activeBase.active} / ${metrics.activeBase.enrolled} / ${metrics.activeBase.total}`,
                    "Ativos / Matrículas / Total",
                    Users,
                    'blue',
                    "Resumo da base: Alunos em curso / Matrículas recentes / Total histórico."
                )}
                {renderSummaryCard(
                    'Taxa de Evasão (Churn)',
                    `${metrics.churnRate.percentage.toFixed(1)}%`,
                    `${metrics.churnRate.absolute} Alunos (Desistentes+Evadidos)`,
                    UserMinus,
                    'rose',
                    "Perdas sobre o total histórico (Ativos + Matrículas + Concluídos + Perdas)."
                )}
                <TicketMedioCard
                    value={metrics.avgTicket}
                    distribution={metrics.ticketDistribution}
                    activeCount={metrics.activeBase.active}
                    showChart={true}
                    settings={settings}
                />
            </div>

            <div className="backdrop-blur-xl bg-slate-900/40 dark:bg-slate-900/40 rounded-3xl shadow-2xl border border-white/10 p-8 relative overflow-hidden">
                {/* Background glow effect */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 opacity-50"></div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 relative z-10">
                    <h3 className="text-xl font-bold text-white tracking-tight">Indicadores de Retenção (Comparativo Anual)</h3>

                    {/* Year Selector */}
                    <div className="flex items-center gap-3 bg-slate-800/50 p-1.5 rounded-2xl ring-1 ring-white/10">
                        {[2023, 2024, 2025, 2026].map(year => (
                            <button
                                key={year}
                                onClick={() => retentionStats.setRetentionYear(year)}
                                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${retentionStats.selectedYear === year
                                    ? 'bg-violet-600 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
                            >
                                {year}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    {renderRetentionCard('Desistentes', XCircle, 'slate', 'cancelado')}
                    {renderRetentionCard('Evadidos', UserX, 'purple', 'evadido')}
                    {renderRetentionCard('Trancados', Lock, 'cyan', 'trancado')}
                </div>
            </div>
        </div>
    );
};

export default StudentsKpiGrid;
