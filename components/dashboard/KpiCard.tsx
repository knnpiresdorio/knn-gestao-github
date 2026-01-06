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
            emerald: { text: 'text-emerald-400', bg: 'bg-emerald-900/20', ring: 'ring-emerald-500/20', ghost: 'text-emerald-500', shadow: 'shadow-[0_0_8px_rgba(16,185,129,0.3)]', highlightBg: 'bg-gradient-to-br from-emerald-600/20 to-slate-900/50 border-emerald-500/50 shadow-[0_8px_32px_-8px_rgba(16,185,129,0.3)]' },
            green: { text: 'text-emerald-400', bg: 'bg-emerald-900/20', ring: 'ring-emerald-500/20', ghost: 'text-emerald-500', shadow: 'shadow-[0_0_8px_rgba(16,185,129,0.3)]', highlightBg: 'bg-gradient-to-br from-emerald-600/20 to-slate-900/50 border-emerald-500/50 shadow-[0_8px_32px_-8px_rgba(16,185,129,0.3)]' },
            rose: { text: 'text-rose-400', bg: 'bg-rose-900/20', ring: 'ring-rose-500/20', ghost: 'text-rose-500', shadow: 'shadow-[0_0_8px_rgba(244,63,94,0.3)]', highlightBg: 'bg-gradient-to-br from-rose-600/20 to-slate-900/50 border-rose-500/50 shadow-[0_8px_32px_-8px_rgba(244,63,94,0.3)]' },
            red: { text: 'text-rose-400', bg: 'bg-rose-900/20', ring: 'ring-rose-500/20', ghost: 'text-rose-500', shadow: 'shadow-[0_0_8px_rgba(244,63,94,0.3)]', highlightBg: 'bg-gradient-to-br from-rose-600/20 to-slate-900/50 border-rose-500/50 shadow-[0_8px_32px_-8px_rgba(244,63,94,0.3)]' },
            blue: { text: 'text-blue-400', bg: 'bg-blue-900/20', ring: 'ring-blue-500/20', ghost: 'text-blue-500', shadow: 'shadow-[0_0_8px_rgba(59,130,246,0.3)]', highlightBg: 'bg-gradient-to-br from-blue-600/20 to-slate-900/50 border-blue-500/50 shadow-[0_8px_32px_-8px_rgba(59,130,246,0.3)]' },
            indigo: { text: 'text-indigo-400', bg: 'bg-indigo-900/20', ring: 'ring-indigo-500/20', ghost: 'text-indigo-500', shadow: 'shadow-[0_0_8px_rgba(99,102,241,0.3)]', highlightBg: 'bg-gradient-to-br from-indigo-600/20 to-slate-900/50 border-indigo-500/50 shadow-[0_8px_32px_-8px_rgba(99,102,241,0.3)]' },
            purple: { text: 'text-purple-400', bg: 'bg-purple-900/20', ring: 'ring-purple-500/20', ghost: 'text-purple-500', shadow: 'shadow-[0_0_8px_rgba(168,85,247,0.3)]', highlightBg: 'bg-gradient-to-br from-purple-600/20 to-slate-900/50 border-purple-500/50 shadow-[0_8px_32px_-8px_rgba(168,85,247,0.3)]' },
            cyan: { text: 'text-cyan-400', bg: 'bg-cyan-900/20', ring: 'ring-cyan-500/20', ghost: 'text-cyan-500', shadow: 'shadow-[0_0_8px_rgba(6,182,212,0.3)]', highlightBg: 'bg-gradient-to-br from-cyan-600/20 to-slate-900/50 border-cyan-500/50 shadow-[0_8px_32px_-8px_rgba(6,182,212,0.3)]' },
            amber: { text: 'text-amber-400', bg: 'bg-amber-900/20', ring: 'ring-amber-500/20', ghost: 'text-amber-500', shadow: 'shadow-[0_0_8px_rgba(245,158,11,0.3)]', highlightBg: 'bg-gradient-to-br from-amber-600/20 to-slate-900/50 border-amber-500/50 shadow-[0_8px_32px_-8px_rgba(245,158,11,0.3)]' },
            slate: { text: 'text-slate-400', bg: 'bg-slate-800', ring: 'ring-slate-500/20', ghost: 'text-slate-500', shadow: 'shadow-none', highlightBg: 'bg-slate-800 border-slate-700' }
        };
        return map[c] || map.blue;
    };

    const themeColors = getColorTheme(color);
    const bgClass = highlight ? themeColors.highlightBg : 'bg-slate-900/40 dark:bg-slate-900/40 border-white/10';

    if (loading) {
        return (
            <div className={`relative bg-slate-900/40 backdrop-blur-xl rounded-xl p-6 border border-white/5 shadow-2xl overflow-hidden min-h-[160px] ${className}`}>
                <div className="animate-pulse flex flex-col justify-between h-full">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-800" />
                            <div className="h-3 w-24 bg-slate-800 rounded" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="h-8 w-32 bg-slate-800 rounded" />
                        <div className="h-3 w-40 bg-slate-800 rounded" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`backdrop-blur-xl ${bgClass} rounded-xl p-6 border shadow-2xl relative group flex flex-col justify-between transition-all hover:bg-slate-900/60 hover:border-white/20 min-h-[160px] ${className}`}>
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
                        <div className={`p-2.5 rounded-xl ${themeColors.bg} ${themeColors.text} ring-1 ring-white/10 shadow-inner`}>
                            <Icon size={18} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-white text-xs uppercase tracking-widest leading-none">{label}</span>
                            {growth !== undefined && growth !== null && (
                                <div className={`flex items-center gap-0.5 text-[10px] font-bold mt-1 ${growth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
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
                                <Info size={14} className="text-slate-500 hover:text-slate-300 transition-colors cursor-help" />
                                <div className="absolute top-0 right-0 translate-x-2 -translate-y-full mb-3 w-56 p-3 bg-slate-800 backdrop-blur-md text-[10px] text-slate-200 rounded-xl opacity-0 group-hover/info:opacity-100 transition-all pointer-events-none z-[100] shadow-2xl border border-white/10 whitespace-normal leading-relaxed ring-1 ring-black/50">
                                    {tooltipText}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Value */}
                <div className="space-y-1 mt-2">
                    <h3 className="text-3xl font-black text-white tracking-tighter leading-tight break-words">
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
