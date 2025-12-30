import React, { memo } from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { THEME_BG_COLORS } from '../../utils/constants';

export interface KpiCardProps {
    label: string;
    value: string | React.ReactNode;
    sub: React.ReactNode;
    icon: LucideIcon;
    color: string;
    highlight?: boolean;
    highlightColor?: string;
    coloredBorder?: boolean;
    theme: string;
    tooltipText?: string | React.ReactNode;
    growth?: number | null;
    settings?: any;
}

const KpiCard = memo(({ label, value, sub, icon: Icon, color, highlight, highlightColor, coloredBorder, theme, tooltipText, growth }: KpiCardProps) => {
    const colors: Record<string, string> = {
        emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
        green: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20', // Standardize Green to Emerald
        rose: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20',
        blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
        indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20',
        amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
        red: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20', // Standardize Red to Rose
        purple: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
        cyan: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20',
        slate: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20'
    };

    const borderColors: Record<string, string> = {
        emerald: 'border-emerald-400 dark:border-emerald-600',
        green: 'border-emerald-400 dark:border-emerald-600', // Standardize Green
        rose: 'border-rose-400 dark:border-rose-600',
        blue: 'border-blue-400 dark:border-blue-600',
        indigo: 'border-indigo-400 dark:border-indigo-600',
        amber: 'border-amber-400 dark:border-amber-600',
        red: 'border-rose-400 dark:border-rose-600', // Standardize Red
        purple: 'border-purple-400 dark:border-purple-600',
        cyan: 'border-cyan-400 dark:border-cyan-600',
        slate: 'border-slate-400 dark:border-slate-600'
    };

    const highlightBorderColors: Record<string, string> = {
        emerald: 'border-emerald-900 dark:border-emerald-500',
        green: 'border-emerald-900 dark:border-emerald-500',
        rose: 'border-rose-700 dark:border-rose-500',
        red: 'border-rose-700 dark:border-rose-500',
        blue: 'border-blue-700 dark:border-blue-500',
        indigo: 'border-indigo-700 dark:border-indigo-500',
        amber: 'border-amber-700 dark:border-amber-500',
        purple: 'border-purple-700 dark:border-purple-500',
        cyan: 'border-cyan-700 dark:border-cyan-500',
        slate: 'border-slate-700 dark:border-slate-500'
    };

    const highlightClass = highlightColor || THEME_BG_COLORS[theme] || 'bg-violet-600';
    const colorKey = colors[color] ? color : 'blue';
    const bgIconClass = highlight ? 'text-white' : colors[colorKey].split(' ')[0];

    // Choose border based on highlight state
    const highlightBorder = highlightBorderColors[colorKey] || 'border-transparent';
    const standardBorder = coloredBorder && borderColors[colorKey] ? `${borderColors[colorKey]} border-2` : 'border-slate-200 dark:border-slate-800';
    const borderClass = highlight ? highlightBorder : standardBorder;

    return (
        <div className={`relative overflow-hidden p-6 rounded-2xl border transition-all hover:shadow-lg group min-h-[140px] flex flex-col justify-between ${highlight ? `${highlightClass} text-white shadow-lg` : `bg-white dark:bg-slate-900 ${borderClass}`}`}>
            <div className={`absolute -left-6 -bottom-6 opacity-[0.07] transform -rotate-12 transition-transform group-hover:scale-110 group-hover:-rotate-6 ${bgIconClass}`}>
                <Icon size={160} strokeWidth={1.5} />
            </div>
            <div className="relative z-10 w-full">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col pr-8">
                        <div className="flex items-center gap-2 mb-2">
                            <p className={`text-xs font-bold uppercase tracking-wider ${highlight ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>{label}</p>
                            {growth !== undefined && growth !== null && (
                                <div className={`flex items-center gap-0.5 text-xs font-bold ${growth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                    {growth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                    {Math.abs(growth).toFixed(0)}%
                                </div>
                            )}
                        </div>
                        <h3 className={`text-2xl font-black tracking-tight ${highlight ? 'text-white' : 'text-slate-800 dark:text-white'}`}>{value}</h3>
                        <div className={`text-xs font-medium mt-1 ${typeof sub === 'string' ? 'flex items-center gap-1' : ''} ${highlight ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'}`}>{sub}</div>
                    </div>
                    <div className={`p-2.5 rounded-xl shadow-sm absolute top-0 right-0 ${highlight ? 'bg-white/20 text-white backdrop-blur-sm' : colors[colorKey]}`}>
                        <Icon size={22} />
                    </div>
                </div>
            </div>
            {tooltipText && (
                <div className="absolute bottom-4 right-4 z-20 group/info">
                    <Info size={16} className={`${highlight ? 'text-white/60 hover:text-white' : 'text-slate-400 hover:text-slate-600'} cursor-help transition-colors`} />
                    <div className="absolute right-0 bottom-8 w-64 p-3 bg-slate-800 text-white text-[11px] leading-relaxed rounded-xl shadow-xl opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-50 border border-slate-700">
                        {tooltipText}
                        <div className="absolute -bottom-1 right-1 w-2 h-2 bg-slate-800 rotate-45 border-b border-r border-slate-700"></div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default KpiCard;
