import React from 'react';
import { formatBRL } from '../../utils/formatters';

export const CustomBarTooltip = ({ active, payload, label, settings }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const totalEntrada = (data.entradaPago || 0) + (data.entradaPendente || 0);
        const totalSaida = (data.saidaPago || 0) + (data.saidaPendente || 0);

        return (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-xl text-xs z-50">
                <p className="font-bold text-slate-800 dark:text-white mb-2">{label}</p>
                {payload.map((entry: any, index: number) => {
                    let percent = 0;
                    const val = entry.value || 0;
                    if (entry.dataKey === 'entradaPago' || entry.dataKey === 'entradaPendente') {
                        percent = totalEntrada > 0 ? (val / totalEntrada) * 100 : 0;
                    } else if (entry.dataKey === 'saidaPago' || entry.dataKey === 'saidaPendente') {
                        percent = totalSaida > 0 ? (val / totalSaida) * 100 : 0;
                    }
                    return (
                        <div key={index} className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.stroke || entry.fill }} />
                            <span className="text-slate-500 dark:text-slate-400 capitalize">
                                {entry.name}: <span className="font-bold text-slate-700 dark:text-slate-200">{formatBRL(val, settings.showCents, settings.privacyMode)}</span>
                                <span className="text-[10px] text-slate-400 ml-1">({percent.toFixed(1)}%)</span>
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    }
    return null;
};

export const CustomPieTooltip = ({ active, payload, settings }: any) => {
    if (active && payload && payload.length) {
        const entry = payload[0];
        return (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-xl text-xs z-50">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.payload.fill || entry.color }} />
                    <span className="text-slate-500 dark:text-slate-400 font-medium">{entry.name}</span>
                </div>
                <div className="mt-1 font-bold text-slate-800 dark:text-white pl-4">
                    {formatBRL(entry.value, settings.showCents, settings.privacyMode)}
                </div>
            </div>
        );
    }
    return null;
};

export const CustomBarLabel = (props: any, type: string) => {
    if (!props || !props.payload) return null;
    const { x, y, width, height, value, payload } = props;

    if (!value || isNaN(value) || height < 15 || isNaN(x) || isNaN(y)) return null;

    const entradaPago = parseFloat(payload.entradaPago) || 0;
    const entradaPendente = parseFloat(payload.entradaPendente) || 0;
    const saidaPago = parseFloat(payload.saidaPago) || 0;
    const saidaPendente = parseFloat(payload.saidaPendente) || 0;

    let total = 0;
    if (type === 'in') {
        total = entradaPago + entradaPendente;
    } else {
        total = saidaPago + saidaPendente;
    }

    if (total === 0) return null;

    const percent = Math.round((value / total) * 100);
    if (percent <= 5) return null;

    return (
        <text
            x={x + width / 2}
            y={y + height / 2}
            fill="#fff"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={10}
            fontWeight="bold"
            style={{ pointerEvents: 'none', textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}
        >
            {percent}%
        </text>
    );
};

export const CustomTooltip = ({ active, payload, label, settings }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-xl text-xs z-50">
                <p className="font-bold text-slate-800 dark:text-white mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.stroke || entry.fill }} />
                        <span className="text-slate-500 dark:text-slate-400 capitalize">
                            {entry.name}: <span className="font-bold text-slate-700 dark:text-slate-200">{formatBRL(entry.value, settings.showCents, settings.privacyMode)}</span>
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};
