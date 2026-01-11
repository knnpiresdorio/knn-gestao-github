import React, { useState, useMemo, useEffect } from 'react';
import {
    Users, DollarSign, TrendingUp, TrendingDown, Activity,
    Target, Calculator, Save
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, Cell
} from 'recharts';

interface Scenario {
    id: string;
    name: string;
    isSystem?: boolean;
    isBase?: boolean; // The "Current" column
    params: {
        students: number;
        ticket: number;
        delinquency: number; // percentage (0-100)
        variableCosts: number; // percentage (0-100)
        fixedCosts: number;
    };
}

interface ProjectionsPageProps {
    currentStats: {
        activeStudents: number;
        ticketMedio: number;
        inadimplencia: number;
        fixedCosts: number; // Monthly average estimate
        variableCostsPercent: number; // Estimate
    };
    settings: any;
    formatBRL: (value: number) => string;
}

const ProjectionsPage: React.FC<ProjectionsPageProps> = ({ currentStats, settings, formatBRL }) => {

    // -- State --
    const [horizon, setHorizon] = useState<6 | 12>(12);
    const [activeScenarioId, setActiveScenarioId] = useState<string>('scenario-1');

    const [scenarios, setScenarios] = useState<Scenario[]>([
        {
            id: 'current',
            name: 'Atual',
            isBase: true,
            params: {
                students: currentStats.activeStudents || 0,
                ticket: currentStats.ticketMedio || 0,
                delinquency: currentStats.inadimplencia || 0,
                variableCosts: currentStats.variableCostsPercent || 0,
                fixedCosts: currentStats.fixedCosts || 0,
            }
        },
        {
            id: 'system',
            name: 'Projeção do Sistema',
            isSystem: true,
            params: {
                students: Math.round((currentStats.activeStudents || 0) * 1.05), // +5% growth
                ticket: (currentStats.ticketMedio || 0) * 1.02, // +2% inflation
                delinquency: currentStats.inadimplencia || 0,
                variableCosts: currentStats.variableCostsPercent || 0,
                fixedCosts: (currentStats.fixedCosts || 0) * 1.02, // +2% inflation
            }
        },
        {
            id: 'scenario-1',
            name: 'Cenário 1',
            params: {
                students: Math.round((currentStats.activeStudents || 0) * 1.1),
                ticket: currentStats.ticketMedio || 0,
                delinquency: currentStats.inadimplencia || 0,
                variableCosts: currentStats.variableCostsPercent || 0,
                fixedCosts: currentStats.fixedCosts || 0,
            }
        },
        {
            id: 'scenario-2',
            name: 'Cenário 2',
            params: {
                students: Math.round((currentStats.activeStudents || 0) * 1.2),
                ticket: (currentStats.ticketMedio || 0) * 1.05,
                delinquency: Math.max(0, (currentStats.inadimplencia || 0) - 2),
                variableCosts: currentStats.variableCostsPercent || 0,
                fixedCosts: (currentStats.fixedCosts || 0) * 1.05,
            }
        }
    ]);

    // Update effect if props change (loading data late)
    useEffect(() => {
        setScenarios(prev => prev.map(s => {
            if (s.isBase) {
                return {
                    ...s,
                    params: {
                        students: currentStats.activeStudents || 0,
                        ticket: currentStats.ticketMedio || 0,
                        delinquency: currentStats.inadimplencia || 0,
                        variableCosts: currentStats.variableCostsPercent || 0,
                        fixedCosts: currentStats.fixedCosts || 0,
                    }
                };
            }
            return s;
        }));
    }, [currentStats]);

    const handleParamChange = (scenarioId: string, field: keyof Scenario['params'], value: number) => {
        setScenarios(prev => prev.map(s => {
            if (s.id === scenarioId) {
                return { ...s, params: { ...s.params, [field]: value } };
            }
            return s;
        }));
    };

    // -- Calculations --
    const calculateResult = (params: Scenario['params']) => {
        const grossRevenue = params.students * params.ticket;
        const taxes = grossRevenue * 0.06; // Estimated 6% tax
        const delinquencyLoss = grossRevenue * (params.delinquency / 100);
        const effectiveRevenue = grossRevenue - delinquencyLoss - taxes;

        // Variable costs as % of effective revenue (simplified) or per student
        // Assuming variableCosts param is a % of Gross Revenue
        const variableExpenses = grossRevenue * (params.variableCosts / 100);

        const contributionMargin = effectiveRevenue - variableExpenses;
        const ebitda = contributionMargin - params.fixedCosts;
        const netProfit = ebitda; // Simplified

        return {
            grossRevenue,
            taxes,
            variableExpenses,
            contributionMargin,
            fixedCosts: params.fixedCosts,
            ebitda,
            netProfit,
            marginPercent: grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0
        };
    };

    const results = useMemo(() => {
        return scenarios.map(s => ({ ...s, result: calculateResult(s.params) }));
    }, [scenarios]);

    // -- Charts Data --
    const barChartData = results.map(r => ({
        name: r.name,
        Lucro: r.result.netProfit,
        Faturamento: r.result.grossRevenue
    }));

    const generateLineData = () => {
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].slice(0, horizon);
        return months.map((m, idx) => {
            const item: any = { name: m };
            results.forEach(r => {
                // Simple linear growth simulation
                const monthlyGrowth = 1 + (idx * 0.01); // 1% growth per month cumulative
                item[r.name] = r.result.grossRevenue * monthlyGrowth;
            });
            return item;
        });
    };
    const lineChartData = useMemo(() => generateLineData(), [results, horizon]);

    // -- Render Helpers --
    const activeParams = scenarios.find(s => s.id === activeScenarioId)?.params || scenarios[2].params;

    const renderComparisonRow = (
        label: string,
        getValue: (r: any) => number,
        format: (v: number) => string,
        invertColor: boolean = false
    ) => (
        <div className="grid grid-cols-5 gap-4 py-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors items-center">
            <div className="font-medium text-slate-600 dark:text-slate-400 pl-4">{label}</div>
            {results.map((r, idx) => {
                const val = getValue(r.result);
                const baseVal = getValue(results[0].result);
                const diff = idx === 0 ? 0 : ((val - baseVal) / baseVal) * 100;
                const isPositive = diff > 0;
                const colorClass = idx === 0 ? 'text-slate-700 dark:text-slate-200' :
                    (isPositive ? (!invertColor ? 'text-emerald-500' : 'text-rose-500') : (!invertColor ? 'text-rose-500' : 'text-emerald-500'));

                return (
                    <div key={r.id} className={`text-right font-bold flex flex-col items-end pr-4 ${idx === 1 ? 'bg-violet-50/50 dark:bg-violet-900/10 rounded-lg -my-2 py-2' : ''}`}>
                        <span className={idx === 1 ? 'text-violet-600 dark:text-violet-400' : 'text-slate-800 dark:text-white'}>
                            {format(val)}
                        </span>
                        {idx !== 0 && (
                            <span className={`text-[10px] flex items-center ${colorClass}`}>
                                {isPositive ? <TrendingUp size={10} className="mr-1" /> : <TrendingDown size={10} className="mr-1" />}
                                {Math.abs(diff).toFixed(1)}%
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="flex flex-col gap-6 p-6 md:p-8 overflow-y-auto custom-scrollbar h-full">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Projeções Financeiras</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Simule cenários e planeje o futuro da sua escola</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium text-sm">
                        <Save size={16} /> Salvar Cenário
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 shadow-lg shadow-violet-500/25 transition-all font-bold text-sm">
                        <Calculator size={16} /> Nova Simulação
                    </button>
                </div>
            </div>

            {/* CONTROLS */}
            <div className="bg-app-card dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-lg">
                            <Target size={20} />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-lg">Painel de Controle de Cenários</h3>
                    </div>

                    <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
                        <span className={`px-3 py-1 rounded-md text-xs font-bold cursor-pointer transition-all ${activeScenarioId === 'scenario-1' ? 'bg-white dark:bg-slate-700 shadow text-violet-600' : 'text-slate-500'}`} onClick={() => setActiveScenarioId('scenario-1')}>Cenário 1</span>
                        <span className={`px-3 py-1 rounded-md text-xs font-bold cursor-pointer transition-all ${activeScenarioId === 'scenario-2' ? 'bg-white dark:bg-slate-700 shadow text-violet-600' : 'text-slate-500'}`} onClick={() => setActiveScenarioId('scenario-2')}>Cenário 2</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Active Scenario Inputs */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">Quantidade de Alunos</label>
                        <div className="relative group">
                            <Users className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-violet-500 transition-colors" size={16} />
                            <input
                                type="number"
                                value={activeParams.students}
                                onChange={(e) => handleParamChange(activeScenarioId, 'students', Number(e.target.value))}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all font-bold text-slate-700 dark:text-slate-200"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">Ticket Médio (R$)</label>
                        <div className="relative group">
                            <DollarSign className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                            <input
                                type="number"
                                value={activeParams.ticket}
                                onChange={(e) => handleParamChange(activeScenarioId, 'ticket', Number(e.target.value))}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-bold text-slate-700 dark:text-slate-200"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">Inadimplência (%)</label>
                        <div className="relative group">
                            <TrendingDown className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={16} />
                            <input
                                type="number"
                                value={activeParams.delinquency}
                                onChange={(e) => handleParamChange(activeScenarioId, 'delinquency', Number(e.target.value))}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all font-bold text-slate-700 dark:text-slate-200"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">Gastos Variáveis (%)</label>
                        <div className="relative group">
                            <Activity className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                            <input
                                type="number"
                                value={activeParams.variableCosts}
                                onChange={(e) => handleParamChange(activeScenarioId, 'variableCosts', Number(e.target.value))}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-slate-700 dark:text-slate-200"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* COMPARISON GRID */}
            <div className="bg-app-card dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="grid grid-cols-5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 py-4">
                    <div className="px-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Métrica (Mensal)</div>
                    {results.map((r, i) => (
                        <div key={r.id} className={`px-4 font-bold text-xs uppercase tracking-wider text-right ${i === 1 ? 'text-violet-500' : 'text-slate-500 dark:text-slate-400'}`}>
                            {r.name}
                            {r.isSystem && <span className="block text-[9px] opacity-70 normal-case">Baseado em histórico</span>}
                            {r.isBase && <span className="block text-[9px] opacity-70 normal-case">Dados atuais</span>}
                        </div>
                    ))}
                </div>

                <div>
                    {renderComparisonRow('Faturamento Bruto', (r) => r.grossRevenue, (v) => formatBRL(v))}
                    {renderComparisonRow('Impostos (Est. 6%)', (r) => r.taxes, (v) => formatBRL(v), true)}
                    {renderComparisonRow('Custos Variáveis', (r) => r.variableExpenses, (v) => formatBRL(v), true)}
                    {renderComparisonRow('Margem de Contrib.', (r) => r.contributionMargin, (v) => formatBRL(v))}
                    {renderComparisonRow('Custos Fixos', (r) => r.fixedCosts, (v) => formatBRL(v), true)}
                    {renderComparisonRow('EBITDA', (r) => r.ebitda, (v) => formatBRL(v))}
                    <div className="grid grid-cols-5 gap-4 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 items-center">
                        <div className="font-bold text-slate-800 dark:text-white pl-4 text-sm uppercase">Lucro Líquido</div>
                        {results.map((r, idx) => {
                            const val = r.result.netProfit;
                            const baseVal = results[0].result.netProfit;
                            const diff = idx === 0 ? 0 : ((val - baseVal) / baseVal) * 100;
                            return (
                                <div key={r.id} className="text-right pr-4">
                                    <span className={`text-lg font-black ${idx === 1 ? 'text-violet-600 dark:text-violet-400' : (val >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600')}`}>
                                        {formatBRL(val)}
                                    </span>
                                    {idx !== 0 && (
                                        <div className={`text-xs font-bold ${diff >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
                <div className="bg-app-card dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-6">Comparativo de Lucro Líquido</h3>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                    formatter={(value: number) => formatBRL(value)}
                                />
                                <Bar dataKey="Lucro" radius={[6, 6, 0, 0]}>
                                    {barChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : index === 1 ? '#8b5cf6' : index === 2 ? '#10b981' : '#f43f5e'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-app-card dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-800 dark:text-white">Evolução de Faturamento (12 Meses)</h3>
                        <div className="flex gap-2 text-xs">
                            <span className="flex items-center gap-1 text-slate-400"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Atual</span>
                            <span className="flex items-center gap-1 text-slate-400"><div className="w-2 h-2 rounded-full bg-violet-500"></div> Sistema</span>
                            <span className="flex items-center gap-1 text-slate-400"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Cen 1</span>
                        </div>
                    </div>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={lineChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                                    formatter={(value: number) => formatBRL(value)}
                                />
                                <Line type="monotone" dataKey="Atual" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="Projeção do Sistema" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="Cenário 1" stroke="#10b981" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="Cenário 2" stroke="#f43f5e" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectionsPage;
