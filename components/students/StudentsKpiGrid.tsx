import React from 'react';
import { Users, UserMinus, DollarSign, TrendingDown, XCircle, UserX, Lock } from 'lucide-react';
import { formatBRL } from '../../utils/formatters';

interface KpiCardProps {
    title: string;
    value: string | number;
    subtext?: string;
    icon: any;
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

interface StudentsKpiGridProps {
    metrics: {
        activeBase: { active: number; total: number } | number;
        churnRate: number;
        avgTicket: number;
    };
    settings: any;
    retentionStats: any;
}

const StudentsKpiGrid: React.FC<StudentsKpiGridProps> = ({ metrics, settings, retentionStats }) => {

    const renderRetentionCard = (title: string, icon: any, color: string, key: 'cancelado' | 'evadido' | 'trancado') => {
        const stat = retentionStats[key];
        const pctS1 = stat.prevS1 > 0 ? ((stat.currS1 - stat.prevS1) / stat.prevS1) * 100 : (stat.currS1 > 0 ? 100 : 0);
        const pctS2 = stat.prevS2 > 0 ? ((stat.currS2 - stat.prevS2) / stat.prevS2) * 100 : (stat.currS2 > 0 ? 100 : 0);

        const getColors = (c: string) => {
            const map: any = {
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
            <div key={key} className="bg-[#020617] dark:bg-[#020617] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden group">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500 opacity-[0.03] rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 duration-700`}></div>

                {/* Header */}
                <div className="flex items-center gap-3 mb-8 relative z-10">
                    <div className={`p-2.5 rounded-xl ${theme.iconBg} ${theme.icon} ring-1 ring-white/5`}>
                        {React.createElement(icon, { size: 18, strokeWidth: 2.5 })}
                    </div>
                    <span className="font-bold text-white text-xs uppercase tracking-widest">{title}</span>
                </div>

                <div className="space-y-6 relative z-10">
                    {/* Semester 1 */}
                    <div className="flex justify-between items-end pb-4 border-b border-slate-800/50 dashed">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">1º Semestre ({retentionStats.currentYear})</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-white">{stat.currS1}</span>
                                <span className="text-xs text-slate-500 font-medium font-mono">vs {stat.prevS1}</span>
                            </div>
                        </div>
                        <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${pctS1 > 0 ? 'text-rose-400 bg-rose-950/30' : pctS1 < 0 ? 'text-emerald-400 bg-emerald-950/30' : 'text-slate-400 bg-slate-800/50'}`}>
                            {pctS1 !== 0 && (pctS1 > 0 ? <TrendingDown size={10} className="rotate-180" /> : <TrendingDown size={10} />)}
                            {Math.abs(pctS1).toFixed(0)}%
                        </div>
                    </div>

                    {/* Semester 2 */}
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">2º Semestre ({retentionStats.currentYear})</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-white">{stat.currS2}</span>
                                <span className="text-xs text-slate-500 font-medium font-mono">vs {stat.prevS2}</span>
                            </div>
                        </div>
                        <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${pctS2 > 0 ? 'text-rose-400 bg-rose-950/30' : pctS2 < 0 ? 'text-emerald-400 bg-emerald-950/30' : 'text-slate-400 bg-slate-800/50'}`}>
                            {pctS2 !== 0 && (pctS2 > 0 ? <TrendingDown size={10} className="rotate-180" /> : <TrendingDown size={10} />)}
                            {Math.abs(pctS2).toFixed(0)}%
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderSummaryCard = (title: string, value: string | number, sub: string, icon: any, color: string) => {
        const getColors = (c: string) => {
            const map: any = {
                blue: { bg: 'bg-[#1e293b]', text: 'text-blue-200', iconBg: 'bg-blue-900/20', icon: 'text-blue-400' },
                rose: { bg: 'bg-[#1e293b]', text: 'text-rose-200', iconBg: 'bg-rose-900/20', icon: 'text-rose-400' },
                emerald: { bg: 'bg-[#1e293b]', text: 'text-emerald-200', iconBg: 'bg-emerald-900/20', icon: 'text-emerald-400' }
            };
            return map[c] || map.blue;
        };
        const theme = getColors(color);

        return (
            <div key={title} className="bg-[#020617] dark:bg-[#020617] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden group flex flex-col justify-between">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500 opacity-[0.03] rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 duration-700`}></div>

                <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className={`p-2.5 rounded-xl ${theme.iconBg} ${theme.icon} ring-1 ring-white/5`}>
                        {React.createElement(icon, { size: 18, strokeWidth: 2.5 })}
                    </div>
                    <span className="font-bold text-white text-xs uppercase tracking-widest">{title}</span>
                </div>

                <div className="relative z-10">
                    <h3 className="text-3xl font-black text-white mb-1">{value}</h3>
                    <p className="text-xs text-slate-500 font-medium">{sub}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {renderSummaryCard(
                    'Base Ativa',
                    typeof metrics.activeBase === 'object' ? `${metrics.activeBase.active} / ${metrics.activeBase.total}` : metrics.activeBase,
                    'Ativos / Matriculados',
                    Users,
                    'blue'
                )}
                {renderSummaryCard('Taxa de Evasão (Churn)', `${metrics.churnRate.toFixed(1)}%`, 'Desistentes/Evadidos vs Total', UserMinus, 'rose')}
                {renderSummaryCard('Ticket Médio', formatBRL(metrics.avgTicket, settings.showCents, settings.privacyMode), 'Média de Valor Atual', DollarSign, 'emerald')}
            </div>

            <div className="bg-[#0f172a] dark:bg-[#0f172a] rounded-3xl shadow-xl border border-slate-800 p-8 relative overflow-hidden">
                {/* Background glow effect */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 opacity-50"></div>

                <div className="flex items-center gap-4 mb-8 relative z-10">
                    <h3 className="text-xl font-bold text-white tracking-tight">Indicadores de Retenção (Comparativo Anual)</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    {renderRetentionCard('Cancelados', XCircle, 'slate', 'cancelado')}
                    {renderRetentionCard('Evadidos', UserX, 'purple', 'evadido')}
                    {renderRetentionCard('Trancados', Lock, 'cyan', 'trancado')}
                </div>
            </div>
        </div>
    );
};

export default StudentsKpiGrid;
