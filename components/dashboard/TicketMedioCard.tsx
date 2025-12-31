import React from 'react';
import { DollarSign, Info } from 'lucide-react';
import { formatBRL } from '../../utils/formatters';

interface TicketMedioCardProps {
    value: number;
    distribution: { label: string; value: number; percentage: number }[];
    activeCount: number;
    showChart?: boolean;
    settings: {
        showCents: boolean;
        privacyMode: boolean;
    };
    className?: string;
}

const TicketMedioCard: React.FC<TicketMedioCardProps> = ({
    value,
    distribution,
    activeCount,
    showChart = false,
    settings,
    className = ""
}) => {
    return (
        <div className={`backdrop-blur-xl bg-slate-900/40 dark:bg-slate-900/40 rounded-3xl p-6 border border-white/10 shadow-2xl relative group flex flex-col transition-all hover:bg-slate-900/60 hover:border-white/20 ${showChart ? 'lg:col-span-2' : ''} ${className}`}>

            {/* Background Decoration Layer - Ghost Symbol */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                <div className="absolute -left-4 -bottom-8 opacity-[0.05] transform -rotate-12 transition-transform group-hover:scale-110 group-hover:-rotate-6 text-emerald-500">
                    <DollarSign size={180} strokeWidth={1.5} />
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl -mr-8 -mt-8 transition-transform group-hover:scale-125 duration-700"></div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center gap-6 h-full w-full relative z-10">
                {/* Main Content (Left Side) */}
                <div className="flex-1 flex flex-col justify-between h-full min-h-[100px]">
                    <div className="flex items-center justify-between mb-6 w-full">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-emerald-900/20 text-emerald-400 ring-1 ring-white/10 shadow-inner">
                                <DollarSign size={18} strokeWidth={2.5} />
                            </div>
                            <span className="font-bold text-white text-xs uppercase tracking-widest">Ticket Médio</span>
                        </div>

                        <div className="group/info relative">
                            <Info size={14} className="text-slate-500 hover:text-slate-300 transition-colors cursor-help" />
                            <div className="absolute top-0 right-0 translate-x-2 -translate-y-full mb-3 w-56 p-3 bg-slate-800 backdrop-blur-md text-[10px] text-slate-200 rounded-xl opacity-0 group-hover/info:opacity-100 transition-all pointer-events-none z-[100] shadow-2xl border border-white/10 whitespace-normal leading-relaxed ring-1 ring-black/50">
                                <p className="font-bold text-white mb-1 uppercase tracking-tight">Sobre este indicador</p>
                                Média do valor teórico mensal apenas dos alunos com status 'Ativo'. Baseado nos contratos vigentes.
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-3xl font-black text-white tracking-tighter leading-none mb-1">
                            {formatBRL(value, settings.showCents, settings.privacyMode)}
                        </h3>
                        {!showChart ? (
                            <div className="flex items-center gap-1.5 mt-2">
                                <span className="text-[11px] font-black text-white">{activeCount}</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter whitespace-nowrap">Alunos Ativos & Matriculados</span>
                            </div>
                        ) : (
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">Receita por Aluno Ativo</p>
                        )}
                    </div>
                </div>

                {/* Distribution Chart (Right Side) - Optional */}
                {showChart && (
                    <div className="lg:w-1/2 w-full lg:pl-6 lg:border-l lg:border-white/5 space-y-3">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Distribuição de Valores</span>
                            <span className="text-[9px] font-bold text-white bg-white/5 px-2 py-0.5 rounded-full ring-1 ring-white/10">{activeCount} Ativos</span>
                        </div>
                        <div className="space-y-2">
                            {distribution.map((item, idx) => (
                                <div key={idx} className="space-y-1">
                                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-tighter">
                                        <span className="text-slate-400">{item.label}</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-white">{item.value}</span>
                                            <span className="text-slate-500 font-medium">({item.percentage.toFixed(0)}%)</span>
                                        </div>
                                    </div>
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden ring-1 ring-white/5">
                                        <div
                                            className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                                            style={{ width: `${item.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketMedioCard;
