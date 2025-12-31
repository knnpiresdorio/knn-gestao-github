import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CHART_COLORS } from '../../utils/constants';
import { formatBRL } from '../../utils/formatters';

interface PaymentDayChartProps {
    data: { name: string; count: number; value: number }[];
    settings?: { showCents: boolean; privacyMode: boolean };
}

const PaymentDayChart: React.FC<PaymentDayChartProps> = ({ data, settings }) => {
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 h-full flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Dias de Pagamento</h3>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-4 -mt-3 ml-1">Alunos Ativos e Matriculados</p>
            <div className="flex-1 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                            dy={10}
                            interval={0}
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                        <Tooltip
                            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const d = payload[0].payload;
                                    return (
                                        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl backdrop-blur-md">
                                            <p className="text-[11px] font-black text-white uppercase tracking-wider mb-2 border-b border-white/10 pb-1">{d.name}</p>
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between gap-4">
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase">Alunos:</span>
                                                    <span className="text-xs font-black text-blue-400">{d.count}</span>
                                                </div>
                                                <div className="flex items-center justify-between gap-4">
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase">Valor Total:</span>
                                                    <span className="text-xs font-black text-emerald-400">{formatBRL(d.value, settings?.showCents ?? true, settings?.privacyMode ?? false)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PaymentDayChart;
