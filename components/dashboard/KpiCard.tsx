import React, { memo } from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { THEME_BG_COLORS } from '../../utils/constants';

export interface KpiCardProps {
    label: string;
    value: string | React.ReactNode;
    sub?: React.ReactNode;
    icon: LucideIcon;
    color: string;
    highlight?: boolean;
    highlightColor?: string;
    coloredBorder?: boolean;
    theme: string;
    tooltipText?: string | React.ReactNode;
    growth?: number | null;
    settings?: any;
    className?: string; // Allow external layout overrides
    loading?: boolean;
    subElement?: React.ReactNode;
    headerAction?: React.ReactNode;
}

const KpiCard = memo(({ label, value, sub, subElement, headerAction, icon: Icon, color, highlight, highlightColor, coloredBorder, theme, tooltipText, growth, className = "", loading }: KpiCardProps) => {

    // Enhanced color mapping for the premium look (matching TicketMedioCard logic)
    const getColorTheme = (c: string) => {
        const map: Record<string, { text: string, bg: string, ring: string, ghost: string, shadow: string, highlightBg: string }> = {
            emerald: { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/20', ring: 'ring-emerald-500/20', ghost: 'text-emerald-500/20 dark:text-emerald-500', shadow: 'shadow-[0_0_8px_rgba(16,185,129,0.3)]', highlightBg: 'bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-600/20 dark:to-slate-900/50 border-emerald-200 dark:border-emerald-500/50 shadow-emerald-500/10 dark:shadow-[0_8px_32px_-8px_rgba(16,185,129,0.3)]' },
            green: { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/20', ring: 'ring-emerald-500/20', ghost: 'text-emerald-500/20 dark:text-emerald-500', shadow: 'shadow-[0_0_8px_rgba(16,185,129,0.3)]', highlightBg: 'bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-600/20 dark:to-slate-900/50 border-emerald-200 dark:border-emerald-500/50 shadow-emerald-500/10 dark:shadow-[0_8px_32px_-8px_rgba(16,185,129,0.3)]' },
            rose: { text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/20', ring: 'ring-rose-500/20', ghost: 'text-rose-500/20 dark:text-rose-500', shadow: 'shadow-[0_0_8px_rgba(244,63,94,0.3)]', highlightBg: 'bg-gradient-to-br from-rose-50 to-white dark:from-rose-600/20 dark:to-slate-900/50 border-rose-200 dark:border-rose-500/50 shadow-rose-500/10 dark:shadow-[0_8px_32px_-8px_rgba(244,63,94,0.3)]' },
            red: { text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/20', ring: 'ring-rose-500/20', ghost: 'text-rose-500/20 dark:text-rose-500', shadow: 'shadow-[0_0_8px_rgba(244,63,94,0.3)]', highlightBg: 'bg-gradient-to-br from-rose-50 to-white dark:from-rose-600/20 dark:to-slate-900/50 border-rose-200 dark:border-rose-500/50 shadow-rose-500/10 dark:shadow-[0_8px_32px_-8px_rgba(244,63,94,0.3)]' },
            blue: { text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/20', ring: 'ring-blue-500/20', ghost: 'text-blue-500/20 dark:text-blue-500', shadow: 'shadow-[0_0_8px_rgba(59,130,246,0.3)]', highlightBg: 'bg-gradient-to-br from-blue-50 to-white dark:from-blue-600/20 dark:to-slate-900/50 border-blue-200 dark:border-blue-500/50 shadow-blue-500/10 dark:shadow-[0_8px_32px_-8px_rgba(59,130,246,0.3)]' },
            indigo: { text: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/20', ring: 'ring-indigo-500/20', ghost: 'text-indigo-500/20 dark:text-indigo-500', shadow: 'shadow-[0_0_8px_rgba(99,102,241,0.3)]', highlightBg: 'bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-600/20 dark:to-slate-900/50 border-indigo-200 dark:border-indigo-500/50 shadow-indigo-500/10 dark:shadow-[0_8px_32px_-8px_rgba(99,102,241,0.3)]' },
            purple: { text: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/20', ring: 'ring-purple-500/20', ghost: 'text-purple-500/20 dark:text-purple-500', shadow: 'shadow-[0_0_8px_rgba(168,85,247,0.3)]', highlightBg: 'bg-gradient-to-br from-purple-50 to-white dark:from-purple-600/20 dark:to-slate-900/50 border-purple-200 dark:border-purple-500/50 shadow-purple-500/10 dark:shadow-[0_8px_32px_-8px_rgba(168,85,247,0.3)]' },
            cyan: { text: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-100 dark:bg-cyan-900/20', ring: 'ring-cyan-500/20', ghost: 'text-cyan-500/20 dark:text-cyan-500', shadow: 'shadow-[0_0_8px_rgba(6,182,212,0.3)]', highlightBg: 'bg-gradient-to-br from-cyan-50 to-white dark:from-cyan-600/20 dark:to-slate-900/50 border-cyan-200 dark:border-cyan-500/50 shadow-cyan-500/10 dark:shadow-[0_8px_32px_-8px_rgba(6,182,212,0.3)]' },
            amber: { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/20', ring: 'ring-amber-500/20', ghost: 'text-amber-500/20 dark:text-amber-500', shadow: 'shadow-[0_0_8px_rgba(245,158,11,0.3)]', highlightBg: 'bg-gradient-to-br from-amber-50 to-white dark:from-amber-600/20 dark:to-slate-900/50 border-amber-200 dark:border-amber-500/50 shadow-amber-500/10 dark:shadow-[0_8px_32px_-8px_rgba(245,158,11,0.3)]' },
            slate: { text: 'text-slate-600 dark:text-slate-400', bg: 'bg-white dark:bg-slate-800', ring: 'ring-slate-500/20', ghost: 'text-slate-500', shadow: 'shadow-none', highlightBg: 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700' }
        };
        return map[c] || map.blue;
    };

    const themeColors = getColorTheme(color);
    const bgClass = highlight ? themeColors.highlightBg : 'bg-app-card dark:bg-slate-900 border-transparent dark:border-white/10';

    if (loading) {
        return (
            <div className={`relative bg-app-card dark:bg-slate-900 backdrop-blur-xl rounded-xl p-6 border border-transparent dark:border-white/5 shadow-sm dark:shadow-2xl overflow-hidden min-h-[160px] ${className}`}>
                <div className="animate-pulse flex flex-col justify-between h-full">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
                            <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                        <div className="h-3 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`backdrop-blur-xl ${bgClass} rounded-xl p-6 border shadow-sm dark:shadow-2xl relative group flex flex-col justify-between transition-all hover:shadow-md min-h-[160px] ${className}`}>
            {/* Background Decoration Layer - Ghost Icon */}
            <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                <div className={`absolute -left-4 -bottom-8 opacity-[0.05] transform -rotate-12 transition-transform group-hover:scale-110 group-hover:-rotate-6 ${themeColors.ghost}`}>
                    <Icon size={180} strokeWidth={1.5} />
                </div>
                <div className={`absolute top-0 right-0 w-32 h-32 ${themeColors.bg} blur-3xl -mr-8 -mt-8 opacity-50 transition-transform group-hover:scale-125 duration-700`}></div>
            </div>

            <div className="relative z-10 w-full h-full flex flex-col justify-between">
                {/* Header: Icon + Label + Info */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${themeColors.bg} ${themeColors.text} ring-1 ring-inset ${themeColors.ring} shadow-sm`}>
                            <Icon size={18} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-700 dark:text-white text-xs uppercase tracking-widest leading-none">{label}</span>
                            {growth !== undefined && growth !== null && (
                                <div className={`flex items-center gap-0.5 text-[10px] font-bold mt-1 ${growth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                    {growth >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                    {Math.abs(growth).toFixed(1)}%
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Header Action */}
                        {headerAction && (
                            <div className="z-20 relative">
                                {headerAction}
                            </div>
                        )}

                        {tooltipText && (
                            <div className="group/info relative">
                                <Info size={14} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-help" />
                                <div className="absolute top-0 right-0 translate-x-2 -translate-y-full mb-3 w-56 p-3 bg-white dark:bg-slate-800 backdrop-blur-md text-[10px] text-slate-600 dark:text-slate-200 rounded-xl opacity-0 group-hover/info:opacity-100 transition-all pointer-events-none z-[100] shadow-xl dark:shadow-2xl border border-slate-200 dark:border-white/10 whitespace-normal leading-relaxed ring-1 ring-black/5">
                                    {tooltipText}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Value */}
                <div className="space-y-1 mt-2">
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter leading-tight break-words">
                        {value}
                    </h3>
                    {sub && (
                        <div className="text-[11px] text-slate-400 font-bold uppercase tracking-tight opacity-80 mt-1">
                            {sub}
                        </div>
                    )}
                    {subElement && (
                        <div className="mt-2 text-[10px]">
                            {subElement}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default KpiCard;
