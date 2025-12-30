import React, { useMemo } from 'react';
import { TrendingUp, Download, DollarSign, Percent, Scale, Activity, Wallet, Info } from 'lucide-react';
import { formatBRL, formatPercent } from '../../utils/formatters';
import { THEME_BG_COLORS } from '../../utils/constants';

export interface FinancialEntry {
    id: string;
    label: string;
    value: number;
    type: 'input' | 'calculation';
    level: 0 | 1 | 2; // For indentation
    isDeduction?: boolean;
    highlight?: boolean;
}

export interface ProcessedRow extends FinancialEntry {
    av: number; // Vertical Analysis %
}

const ManagerialPnL = ({ data, settings }: { data: any[], settings: any }) => {
    // Calculation Engine
    const { rows, kpis } = useMemo(() => {
        // Aggregation Logic (using real data totals to populate the schema)
        const totals = {
            grossRevenue: 0,
            taxes: 0,
            returns: 0,
            cogs: 0,
            commissions: 0,
            freight: 0,
            fixedPersonnel: 0,
            fixedOperational: 0,
            marketing: 0,
            otherFixed: 0,
            depreciation: 0,
            amortization: 0,
            financialIncome: 0,
            financialExpenses: 0,
            incomeTax: 0
        };

        data.forEach(item => {
            const val = item.absVal || 0;

            if (item.type === 'Entrada') {
                totals.grossRevenue += val;
            } else {
                // Expense Logic
                const cat = (item.cat || '').toLowerCase();
                const desc = (item.desc || '').toLowerCase();

                if (cat.includes('imposto') || desc.includes('das') || desc.includes('iss')) {
                    totals.taxes += val;
                } else if (item.classification === 'Variável' || item.classification === 'Variavel') {
                    totals.cogs += val; // Default bucket for variable
                } else {
                    // Fixed Logic
                    if (cat.includes('pessoal') || cat.includes('salario') || cat.includes('prolabore')) {
                        totals.fixedPersonnel += val;
                    } else if (cat.includes('marketing') || cat.includes('publicidade')) {
                        totals.marketing += val;
                    } else if (cat.includes('financeiro') || cat.includes('juros') || cat.includes('banco')) {
                        totals.financialExpenses += val;
                    } else {
                        totals.fixedOperational += val;
                    }
                }
            }
        });

        // 1. Calculate Subtotals based on Schema
        const grossRevenue = totals.grossRevenue;
        const deductions = totals.taxes + totals.returns;
        const netRevenue = grossRevenue - deductions;
        const variableCosts = totals.cogs + totals.commissions + totals.freight;
        const contributionMargin = netRevenue - variableCosts;
        const fixedExpenses = totals.fixedPersonnel + totals.fixedOperational + totals.marketing + totals.otherFixed;
        const ebitda = contributionMargin - fixedExpenses;
        const da = totals.depreciation + totals.amortization;
        const ebit = ebitda - da;
        const financialResult = totals.financialIncome - totals.financialExpenses;
        const ebt = ebit + financialResult;
        const netProfit = ebt - totals.incomeTax;

        // --- NEW KPIs CALCULATION ---
        const cmPercent = netRevenue > 0 ? (contributionMargin / netRevenue) * 100 : 0;
        const cmRatio = netRevenue > 0 ? contributionMargin / netRevenue : 0;
        const breakEven = cmRatio > 0 ? fixedExpenses / cmRatio : 0;

        // 2. Define Structure
        const rawRows: FinancialEntry[] = [
            { id: '1', label: '(=) RECEITA BRUTA', value: grossRevenue, type: 'calculation', level: 0 },
            { id: '2', label: '(-) Impostos s/ Vendas', value: totals.taxes, type: 'input', level: 1, isDeduction: true },
            { id: '3', label: '(-) Devoluções e Abatimentos', value: totals.returns, type: 'input', level: 1, isDeduction: true },

            { id: '4', label: '(=) RECEITA LÍQUIDA', value: netRevenue, type: 'calculation', level: 0, highlight: true },

            { id: '5', label: '(-) CMV / CSP (Custos Variáveis)', value: totals.cogs, type: 'input', level: 1, isDeduction: true },
            { id: '6', label: '(-) Comissões', value: totals.commissions, type: 'input', level: 1, isDeduction: true },
            { id: '7', label: '(-) Fretes e Logística', value: totals.freight, type: 'input', level: 1, isDeduction: true },

            { id: '8', label: '(=) MARGEM DE CONTRIBUIÇÃO', value: contributionMargin, type: 'calculation', level: 0, highlight: true },

            { id: '9', label: '(-) Despesas com Pessoal (Fixas)', value: totals.fixedPersonnel, type: 'input', level: 1, isDeduction: true },
            { id: '10', label: '(-) Despesas Operacionais Fixas', value: totals.fixedOperational, type: 'input', level: 1, isDeduction: true },
            { id: '11', label: '(-) Marketing e Vendas', value: totals.marketing, type: 'input', level: 1, isDeduction: true },
            { id: '12', label: '(-) Outras Despesas Fixas', value: totals.otherFixed, type: 'input', level: 1, isDeduction: true },

            { id: '13', label: '(=) EBITDA (Lajida)', value: ebitda, type: 'calculation', level: 0, highlight: true },

            { id: '14', label: '(-) Depreciação', value: totals.depreciation, type: 'input', level: 1, isDeduction: true },
            { id: '15', label: '(-) Amortização', value: totals.amortization, type: 'input', level: 1, isDeduction: true },

            { id: '16', label: '(=) EBIT (Lajir)', value: ebit, type: 'calculation', level: 0 },

            { id: '17', label: '(+) Receitas Financeiras', value: totals.financialIncome, type: 'input', level: 1, isDeduction: false },
            { id: '18', label: '(-) Despesas Financeiras', value: totals.financialExpenses, type: 'input', level: 1, isDeduction: true },

            { id: '19', label: '(=) LAIR (Lucro Antes do IR)', value: ebt, type: 'calculation', level: 0 },

            { id: '20', label: '(-) IRPJ / CSLL', value: totals.incomeTax, type: 'input', level: 1, isDeduction: true },

            { id: '21', label: '(=) LUCRO / PREJUÍZO LÍQUIDO', value: netProfit, type: 'calculation', level: 0, highlight: true },
        ];

        const processedRows = rawRows.map((row) => ({
            ...row,
            av: netRevenue !== 0 ? row.value / netRevenue : 0,
        }));

        return {
            rows: processedRows,
            kpis: {
                cmPercent,
                breakEven
            }
        };
    }, [data]);

    const getRowStyles = (row: ProcessedRow) => {
        const isHeader = row.type === 'calculation';
        const isResult = row.highlight;
        let bgClass = 'hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150';
        let textClass = 'text-slate-600 dark:text-slate-300';
        let fontClass = 'font-normal';

        if (isHeader) {
            bgClass = 'bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150';
            textClass = 'text-slate-800 dark:text-slate-100';
            fontClass = 'font-bold';
        }

        if (isResult) {
            bgClass = 'bg-indigo-50/30 dark:bg-indigo-900/10 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20';
            textClass = 'text-slate-900 dark:text-white';
            fontClass = 'font-black text-xs uppercase tracking-wide';
        }

        const indentClass = row.level === 0 ? '' : row.level === 1 ? 'pl-8' : 'pl-12';
        return { bgClass, textClass, fontClass, indentClass };
    };

    const currentThemeBg = THEME_BG_COLORS[settings.themeColor] || 'bg-violet-600';

    // Helper for Top Cards
    const getRowValue = (id: string) => rows.find(r => r.id === id)?.value || 0;
    const getRowAv = (id: string) => rows.find(r => r.id === id)?.av || 0;

    return (
        <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 animate-in fade-in duration-300 h-full overflow-y-auto w-full">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${currentThemeBg} text-white shadow-lg transform -rotate-3`}>
                        <TrendingUp size={28} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">DRE Gerencial</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Modelo Margem de Contribuição e EBITDA</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                        <Download size={16} />
                        <span>Exportar PDF</span>
                    </button>
                </div>
            </div>

            {/* TOP CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                {[
                    {
                        label: 'Receita Líquida',
                        value: getRowValue('4'),
                        sub: 'Faturamento Real',
                        av: getRowAv('4'),
                        icon: DollarSign,
                        color: 'text-blue-600',
                        bg: 'bg-blue-50 dark:bg-blue-900/20'
                    },
                    {
                        label: 'Margem Contrib.',
                        value: kpis.cmPercent,
                        isPercent: true,
                        sub: 'Eficiência Operacional',
                        icon: Percent,
                        color: 'text-cyan-600',
                        bg: 'bg-cyan-50 dark:bg-cyan-900/20',
                        tooltip: 'Ideal acima de 30% em serviços. Indica quanto sobra da receita para pagar custos fixos.'
                    },
                    {
                        label: 'Ponto Equilíbrio',
                        value: kpis.breakEven,
                        sub: 'Meta Mínima',
                        icon: Scale,
                        color: 'text-amber-600',
                        bg: 'bg-amber-50 dark:bg-amber-900/20',
                        tooltip: 'Faturamento mínimo necessário para não ter prejuízo (Lucro Zero).'
                    },
                    {
                        label: 'EBITDA',
                        value: getRowValue('13'),
                        sub: 'Geração de Caixa',
                        av: getRowAv('13'),
                        icon: Activity,
                        color: 'text-indigo-600',
                        bg: 'bg-indigo-50 dark:bg-indigo-900/20'
                    },
                    {
                        label: 'Lucro Líquido',
                        value: getRowValue('21'),
                        sub: 'Resultado Final',
                        av: getRowAv('21'),
                        icon: Wallet,
                        color: 'text-emerald-600',
                        bg: 'bg-emerald-50 dark:bg-emerald-900/20'
                    }
                ].map((card, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-3 relative z-10">
                            <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{card.label}</h3>
                            <div className={`p-2 rounded-lg ${card.bg} ${card.color}`}><card.icon size={18} /></div>
                        </div>
                        <div className={`text-2xl font-black relative z-10 ${card.value >= 0 ? 'text-slate-800 dark:text-white' : 'text-rose-600 dark:text-rose-400'}`}>
                            {card.isPercent ? `${card.value.toFixed(1)}%` : formatBRL(card.value, settings.showCents, settings.privacyMode)}
                        </div>
                        <div className="text-xs text-slate-400 mt-1 relative z-10 font-medium">
                            {card.av !== undefined ? `Margem: ${formatPercent(card.av)}` : card.sub}
                        </div>

                        {card.tooltip && (
                            <div className="absolute bottom-3 right-3 z-20 group/info">
                                <Info size={14} className="text-slate-300 hover:text-slate-500 cursor-help transition-colors" />
                                <div className="absolute right-0 bottom-6 w-48 p-2 bg-slate-800 text-white text-[10px] leading-tight rounded-lg shadow-xl opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-50 border border-slate-700">
                                    {card.tooltip}
                                </div>
                            </div>
                        )}

                        <div className={`absolute -right-4 -bottom-4 opacity-[0.05] group-hover:scale-110 transition-transform duration-500 ${card.color.replace('text-', 'text-')}`}>
                            <card.icon size={100} />
                        </div>
                    </div>
                ))}
            </div>

            {/* TABLE */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-left">
                                <th className="py-4 px-6 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider w-1/2">Descrição</th>
                                <th className="py-4 px-6 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider text-right">Valor (R$)</th>
                                <th className="py-4 px-6 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider text-right w-32">AV %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {rows.map((row) => {
                                const styles = getRowStyles(row);
                                return (
                                    <tr key={row.id} className={styles.bgClass}>
                                        <td className={`py-3.5 px-6 ${styles.indentClass}`}>
                                            <span className={`${styles.textClass} ${styles.fontClass} block truncate`}>{row.label}</span>
                                        </td>
                                        <td className="py-3.5 px-6 text-right">
                                            <span className={`${styles.fontClass} ${row.highlight ? (row.value >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400') : 'text-slate-600 dark:text-slate-300'}`}>
                                                {formatBRL(row.value, settings.showCents, settings.privacyMode)}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <span className="text-slate-500 dark:text-slate-400 font-medium text-xs">{formatPercent(row.av)}</span>
                                                <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                                                    <div className={`h-full ${row.av > 0 ? 'bg-indigo-500' : 'bg-red-400'}`} style={{ width: `${Math.min(Math.abs(row.av * 100), 100)}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-4 border-t border-slate-200 dark:border-slate-800 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Info size={14} className="mt-0.5 text-indigo-500 shrink-0" />
                    <p>
                        <strong>Nota:</strong> A Análise Vertical (AV%) utiliza a <em>Receita Líquida</em> como base 100%.
                        Valores em <span className="text-emerald-600 dark:text-emerald-400 font-bold">Verde</span> indicam resultados positivos e em
                        <span className="text-red-600 dark:text-red-400 font-bold"> Vermelho</span> indicam prejuízo nas linhas de totalização.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ManagerialPnL;
