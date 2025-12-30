import React from 'react';
import { Table } from 'lucide-react';

interface DrePageProps {
    dreData: any; // Ideally this should be a proper type
    settings: any;
    formatBRL: (val: number, showCents: boolean, privacyMode: boolean) => string;
}

const DrePage: React.FC<DrePageProps> = ({ dreData, settings, formatBRL }) => {
    return (
        <div className="flex flex-col h-full animate-in fade-in duration-300">
            {/* HEADER */}
            <div className="flex items-center gap-4 mb-6 shrink-0">
                <div className={`w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/20`}>
                    <Table size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Demonstração do Resultado Contábil</h2>
                    <p className="text-sm text-slate-400">Análise detalhada de receitas e despesas por competência/caixa.</p>
                </div>
            </div>

            <div className="bg-[#0b101a] rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col flex-1 min-h-0 relative">
                {/* Custom Scrollbar Container */}
                <div className="overflow-auto custom-scrollbar flex-1 relative">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="bg-[#0b101a] text-slate-400 font-bold uppercase text-[10px] tracking-wider sticky top-0 z-30">
                            <tr>
                                {/* Header: Descrição */}
                                <th className="px-6 py-5 sticky left-0 bg-[#0b101a] z-30 border-b border-slate-800 text-slate-300 min-w-[200px]">Descrição</th>

                                {/* Header: Months */}
                                {dreData.months.map((m: any) => {
                                    const [year, month] = m.split('-');
                                    const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
                                    const label = dateObj.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '').toUpperCase().replace(' ', ' DE ');
                                    return <th key={m} className="px-6 py-5 text-right border-b border-slate-800 min-w-[140px] font-bold text-slate-400">{label}</th>
                                })}

                                {/* Header: Total */}
                                <th className="px-6 py-5 text-right font-black text-white bg-[#0b101a] sticky right-0 z-30 border-b border-slate-800 min-w-[160px] shadow-[-10px_0_20px_-5px_rgba(0,0,0,0.8)]">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/30">

                            {/* === RECEITAS === */}
                            <tr className="bg-[#0b101a]">
                                <td className="px-6 py-4 sticky left-0 bg-[#0b101a] z-20 font-bold text-[#10b981] uppercase text-[11px] tracking-widest pt-8">RECEITAS OPERACIONAIS</td>
                                {dreData.months.map((m: any) => <td key={m} className="px-6 py-4 bg-[#0b101a]"></td>)}
                                <td className="px-6 py-4 sticky right-0 bg-[#0b101a] z-20 shadow-[-10px_0_20px_-5px_rgba(0,0,0,0.8)]"></td>
                            </tr>
                            {Object.keys(dreData.recipes).sort().map((cat, idx) => (
                                <tr key={cat} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-3 font-medium text-slate-300 sticky left-0 bg-[#0b101a] group-hover:bg-[#111827] z-20 transition-colors text-xs">{cat}</td>
                                    {dreData.months.map((m: any) => <td key={m} className="px-6 py-3 text-right font-mono text-xs text-slate-400 group-hover:text-slate-200 transition-colors">{formatBRL(dreData.recipes[cat][m] || 0, settings.showCents, settings.privacyMode)}</td>)}
                                    <td className="px-6 py-3 text-right font-bold text-[#10b981] sticky right-0 bg-[#0b101a] group-hover:bg-[#111827] z-20 shadow-[-10px_0_20px_-5px_rgba(0,0,0,0.8)] font-mono text-xs border-l border-slate-800/50">{formatBRL(Object.values(dreData.recipes[cat]).reduce((a: any, b: any) => a + b, 0), settings.showCents, settings.privacyMode)}</td>
                                </tr>
                            ))}

                            {/* TOTAL RECEITAS ROW */}
                            <tr className="bg-[#062c23]">
                                <td className="px-6 py-4 sticky left-0 bg-[#062c23] z-20 font-bold text-[#34d399] uppercase text-xs border-y border-[#059669]/30">(=) Total Receitas</td>
                                {dreData.months.map((m: any) => <td key={m} className="px-6 py-4 text-right font-bold text-[#34d399] font-mono text-xs border-y border-[#059669]/30">{formatBRL(dreData.totalRecipes[m], settings.showCents, settings.privacyMode)}</td>)}
                                <td className="px-6 py-4 text-right font-black text-[#34d399] sticky right-0 bg-[#062c23] z-20 shadow-[-10px_0_20px_-5px_rgba(0,0,0,0.8)] font-mono text-xs border-y border-[#059669]/30">{formatBRL(dreData.grandTotalRecipes, settings.showCents, settings.privacyMode)}</td>
                            </tr>


                            {/* === DESPESAS === */}
                            <tr className="bg-[#0b101a]">
                                <td className="px-6 py-4 sticky left-0 bg-[#0b101a] z-20 font-bold text-[#f43f5e] uppercase text-[11px] tracking-widest pt-10">DESPESAS OPERACIONAIS</td>
                                {dreData.months.map((m: any) => <td key={m} className="px-6 py-4 bg-[#0b101a]"></td>)}
                                <td className="px-6 py-4 sticky right-0 bg-[#0b101a] z-20 shadow-[-10px_0_20px_-5px_rgba(0,0,0,0.8)]"></td>
                            </tr>
                            {Object.keys(dreData.expenses).sort().map((cat, idx) => (
                                <tr key={cat} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-3 font-medium text-slate-300 sticky left-0 bg-[#0b101a] group-hover:bg-[#111827] z-20 transition-colors text-xs">{cat}</td>
                                    {dreData.months.map((m: any) => <td key={m} className="px-6 py-3 text-right font-mono text-xs text-slate-400 group-hover:text-slate-200 transition-colors">{formatBRL(dreData.expenses[cat][m] || 0, settings.showCents, settings.privacyMode)}</td>)}
                                    <td className="px-6 py-3 text-right font-bold text-[#f43f5e] sticky right-0 bg-[#0b101a] group-hover:bg-[#111827] z-20 shadow-[-10px_0_20px_-5px_rgba(0,0,0,0.8)] font-mono text-xs border-l border-slate-800/50">{formatBRL(Object.values(dreData.expenses[cat]).reduce((a: any, b: any) => a + b, 0), settings.showCents, settings.privacyMode)}</td>
                                </tr>
                            ))}

                            {/* TOTAL DESPESAS ROW */}
                            <tr className="bg-[#2a0a12]">
                                <td className="px-6 py-4 sticky left-0 bg-[#2a0a12] z-20 font-bold text-[#fb7185] uppercase text-xs border-y border-[#e11d48]/30">(=) Total Despesas</td>
                                {dreData.months.map((m: any) => <td key={m} className="px-6 py-4 text-right font-bold text-[#fb7185] font-mono text-xs border-y border-[#e11d48]/30">{formatBRL(dreData.totalExpenses[m], settings.showCents, settings.privacyMode)}</td>)}
                                <td className="px-6 py-4 text-right font-black text-[#fb7185] sticky right-0 bg-[#2a0a12] z-20 shadow-[-10px_0_20px_-5px_rgba(0,0,0,0.8)] font-mono text-xs border-y border-[#e11d48]/30">{formatBRL(dreData.grandTotalExpenses, settings.showCents, settings.privacyMode)}</td>
                            </tr>

                            {/* RESULTADO LÍQUIDO */}
                            <tr className="bg-[#0b101a] h-4"></tr> {/* Spacer */}
                            <tr>
                                <td className="px-6 py-5 sticky left-0 bg-[#020617] z-20 font-black text-white uppercase text-sm tracking-wider border-t border-b border-slate-800 shadow-[0_-5px_15px_rgba(0,0,0,0.3)]">(=) RESULTADO LÍQUIDO</td>
                                {dreData.months.map((m: any) => <td key={m} className={`px-6 py-5 text-right font-black font-mono text-sm border-t border-b border-slate-800 bg-[#020617] ${dreData.profit[m] >= 0 ? 'text-[#34d399]' : 'text-[#f43f5e]'}`}>{formatBRL(dreData.profit[m], settings.showCents, settings.privacyMode)}</td>)}
                                <td className={`px-6 py-5 text-right font-black sticky right-0 bg-[#020617] z-20 shadow-[-10px_0_20px_-5px_rgba(0,0,0,0.8)] font-mono text-base border-t border-b border-slate-800 ${dreData.grandTotalProfit >= 0 ? 'text-[#34d399]' : 'text-[#f43f5e]'}`}>{formatBRL(dreData.grandTotalProfit, settings.showCents, settings.privacyMode)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DrePage;
