import React from 'react';
import {
    Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, ComposedChart, AreaChart, Area, ReferenceLine
} from 'recharts';
import {
    ArrowUpRight, ArrowDownRight, Wallet, Percent, Scale, AlertTriangle, Receipt, Activity,
    Calendar, DollarSign, CreditCard, Bell, BarChart2, Gauge // Added Gauge
} from 'lucide-react';

import KpiCard from '../dashboard/KpiCard';
import { CustomBarTooltip, CustomPieTooltip, CustomBarLabel, CustomTooltip } from '../charts/CustomTooltips';
import { CHART_COLORS, THEME_BG_COLORS } from '../../utils/constants'; // Added THEME_BG_COLORS


interface DashboardPageProps {
    stats: any;
    financialIndicators: any;

    settings: any;
    growth: any;
    graphData: any[];
    periodLabel: string;
    currentBalanceToday: number;
    balanceEvolution: any[];
    categoryChart: any[];
    paymentMethodChart: any[];
    dashboardListTab: string;
    setDashboardListTab: (tab: string) => void;
    dashboardLists: any;
    formatBRL: (val: number, showCents: boolean, privacyMode: boolean) => string;
    graphFilters: any;
    onClearFilters: () => void;
}


const DashboardPage: React.FC<DashboardPageProps> = ({
    stats,
    financialIndicators,
    settings,

    growth,
    graphData,
    periodLabel,
    currentBalanceToday,
    balanceEvolution,
    categoryChart,
    paymentMethodChart,
    dashboardListTab,
    setDashboardListTab,
    dashboardLists,
    formatBRL,
    graphFilters,
    onClearFilters
}) => {
    const isGraphFiltered = (graphFilters.status !== 'all' && graphFilters.status !== 'Todos') || graphFilters.search !== '';
    const currentThemeBg = THEME_BG_COLORS[settings.themeColor] || 'bg-slate-900';

    return (
        <div className="space-y-6 animate-in fade-in duration-500 h-full overflow-y-auto pb-20 custom-scrollbar">
            {isGraphFiltered && (
                <div className={`${currentThemeBg} text-white px-4 py-3 rounded-xl flex items-center justify-between shadow-lg`}>
                    <div className="flex items-center gap-2 text-sm font-medium"><BarChart2 size={18} /><span>Filtro Ativo: <strong>{graphFilters.status}</strong> {graphFilters.search && `+ "${graphFilters.search}"`}</span></div>
                    <button onClick={onClearFilters} className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg text-xs font-bold transition-colors">Limpar</button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard label="Entradas (Pagas)" value={formatBRL(stats.entrada, settings.showCents, settings.privacyMode)} sub={`Pendente + Atrasado: ${formatBRL(stats.pendente, settings.showCents, settings.privacyMode)}`} icon={ArrowUpRight} color="emerald" highlight highlightColor="bg-emerald-600 dark:bg-emerald-700" theme={settings.themeColor} tooltipText="Total de receitas que foram efetivamente recebidas no período." growth={growth.entrada} />
                <KpiCard label="Saídas (Pagas)" value={formatBRL(stats.saida, settings.showCents, settings.privacyMode)} sub={`Pendente + Atrasado: ${formatBRL(stats.saidaPendente || 0, settings.showCents, settings.privacyMode)}`} icon={ArrowDownRight} color="rose" highlight highlightColor="bg-rose-600 dark:bg-rose-700" theme={settings.themeColor} tooltipText="Total de despesas pagas. Subtítulo mostra despesas não pagas." growth={growth.saida} />
                <KpiCard label="Saldo Líquido" value={formatBRL(stats.saldo, settings.showCents, settings.privacyMode)} sub="Entradas Pagas - Saídas Pagas" icon={Wallet} color="blue" highlight theme={settings.themeColor} tooltipText="Diferença entre entradas recebidas e saídas pagas no período." />
                <KpiCard
                    label="Saúde Financeira"
                    value={
                        <div className="flex items-baseline gap-2">
                            {stats.saudeFinanceira.toFixed(1)}%
                            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                                ({formatBRL(stats.saldo, settings.showCents, settings.privacyMode)})
                            </span>
                        </div>
                    }
                    sub={
                        <div className="flex flex-col leading-tight mt-1">
                            <span className="text-[10px] sm:text-xs font-medium opacity-90">
                                {stats.saudeFinanceira > 25 ? 'Altamente Eficiente' : stats.saudeFinanceira > 10 ? 'Operação Saudável' : 'Alerta Crítico'}
                            </span>
                        </div>
                    }
                    icon={Activity}
                    color={stats.saudeFinanceira > 25 ? 'emerald' : stats.saudeFinanceira > 10 ? 'amber' : 'red'}
                    theme={settings.themeColor}
                    tooltipText={
                        <div className="space-y-1 pt-1">
                            <div className="flex items-start gap-2 text-[10px]">
                                <span className="text-emerald-400 font-bold whitespace-nowrap">&gt; 25%:</span>
                                <span>Altamente eficiente.</span>
                            </div>
                            <div className="flex items-start gap-2 text-[10px]">
                                <span className="text-amber-400 font-bold whitespace-nowrap">10-25%:</span>
                                <span>Saudável.</span>
                            </div>
                            <div className="flex items-start gap-2 text-[10px]">
                                <span className="text-rose-400 font-bold whitespace-nowrap">&lt; 10%:</span>
                                <span>Crítico.</span>
                            </div>
                        </div>
                    }
                />

                <KpiCard
                    label="Margem de Contribuição"
                    value={`${financialIndicators.margemContribPercent.toFixed(1)}%`}
                    sub={formatBRL(financialIndicators.margemContrib, settings.showCents, settings.privacyMode)}
                    icon={Gauge}
                    color={financialIndicators.margemContribPercent > 50 ? 'emerald' : financialIndicators.margemContribPercent > 30 ? 'amber' : 'red'}
                    theme={settings.themeColor}
                    tooltipText="Percentual da receita que sobra após pagar os custos variáveis. Ideal > 30%."
                />

                <KpiCard
                    label="Ponto de Equilíbrio"
                    value={formatBRL(financialIndicators.breakEven, settings.showCents, settings.privacyMode)}
                    sub={
                        <div className="flex flex-col gap-2 w-full mt-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 dark:text-slate-400">
                                    Necessários: <strong className="text-slate-700 dark:text-white">{financialIndicators.breakEvenStudents} Alunos</strong>
                                </span>
                            </div>

                            <div className="flex gap-3 items-start">
                                <div className="flex-1 flex flex-col gap-1">
                                    <div className="relative w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        {/* Marker at 100% (50% position) */}
                                        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-900/10 dark:bg-white/20 z-10"></div>
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${stats.entrada >= financialIndicators.breakEven ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                            style={{ width: `${Math.min(((stats.entrada / (financialIndicators.breakEven || 1)) * 100) / 2, 100)}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                                        <span>0%</span>
                                        <span className="text-center">100%</span>
                                        <span className="text-right">200%</span>
                                    </div>
                                </div>
                                <span className={`text-xs font-black leading-none ${stats.entrada >= financialIndicators.breakEven ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                                    {((stats.entrada / (financialIndicators.breakEven || 1)) * 100).toFixed(0)}%
                                </span>
                            </div>
                        </div>
                    }
                    icon={Scale}
                    color={stats.entrada >= financialIndicators.breakEven ? 'emerald' : 'rose'}
                    theme={settings.themeColor}
                    tooltipText="Faturamento e alunos necessários para cobrir todos os custos (Lucro Zero)."
                />

                <KpiCard
                    label="Inadimplência"
                    value=""
                    sub={
                        <div className="flex flex-col w-full mt-0 gap-4">
                            <div className="grid grid-cols-4 w-full divide-x divide-slate-200 dark:divide-slate-700/50">
                                <div className="flex flex-col items-center justify-end px-1">
                                    <span className="text-lg sm:text-xl xl:text-2xl font-black text-slate-800 dark:text-white leading-none mb-1 truncate">{stats.inadimplenciaCurrentMonth.toFixed(1)}%</span>
                                    <span className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-400">Atual</span>
                                </div>
                                <div className="flex flex-col items-center justify-end px-1">
                                    <span className="text-xs sm:text-sm font-bold leading-none mb-1 text-slate-600 dark:text-slate-300 truncate">{stats.inadimplenciaLast3Months.toFixed(1)}%</span>
                                    <span className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-400 text-center">3 M</span>
                                </div>
                                <div className="flex flex-col items-center justify-end px-1">
                                    <span className="text-xs sm:text-sm font-bold leading-none mb-1 text-slate-600 dark:text-slate-300 truncate">{stats.inadimplenciaLast12Months.toFixed(1)}%</span>
                                    <span className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-400 text-center">12 M</span>
                                </div>
                                <div className="flex flex-col items-center justify-end px-1">
                                    <span className="text-xs sm:text-sm font-bold leading-none mb-1 text-slate-600 dark:text-slate-300 truncate">{stats.inadimplencia.toFixed(1)}%</span>
                                    <span className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-400 text-center">Geral</span>
                                </div>
                            </div>
                            <span className="font-bold text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 w-full text-center border-t border-slate-100 dark:border-slate-800 pt-2 truncate">
                                {stats.countInadimplencia} parcelas atrasadas (geral)
                            </span>
                        </div>
                    }
                    icon={AlertTriangle}
                    color={stats.inadimplencia <= 5 ? 'emerald' : stats.inadimplencia <= 10 ? 'amber' : 'red'}
                    theme={settings.themeColor}
                    settings={settings}
                    tooltipText="Inadimplência: Geral / Mês Atual / Últimos 3 Meses / Últimos 12 Meses"
                />
                <KpiCard
                    label="Ticket Médio"
                    value={formatBRL(stats.ticketMedio, settings.showCents, settings.privacyMode)}
                    sub={
                        <div className="flex flex-col gap-3 w-full mt-3">
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                Base: <strong className="text-slate-700 dark:text-white">{financialIndicators.ticketDistribution?.total || 0} Alunos Ativos</strong>
                            </span>

                            <div className="space-y-2">
                                {[
                                    { label: 'Até R$ 250', val: financialIndicators.ticketDistribution?.upto250 || 0, color: 'bg-slate-400' },
                                    { label: 'R$ 251 - 350', val: financialIndicators.ticketDistribution?.range251to350 || 0, color: 'bg-purple-400' },
                                    { label: 'R$ 351 - 450', val: financialIndicators.ticketDistribution?.range351to450 || 0, color: 'bg-purple-500' },
                                    { label: '> R$ 450', val: financialIndicators.ticketDistribution?.above450 || 0, color: 'bg-purple-600' }
                                ].map((item, idx) => {
                                    const total = financialIndicators.ticketDistribution?.total || 1;
                                    const pct = (item.val / total) * 100;
                                    return (
                                        <div key={idx} className="flex flex-col gap-0.5">
                                            <div className="flex justify-between items-end text-[10px]">
                                                <span className="text-slate-500 dark:text-slate-400 font-medium">{item.label}</span>
                                                <div className="flex items-center gap-1">
                                                    <span className="font-bold text-slate-700 dark:text-slate-200">{item.val}</span>
                                                    <span className="text-slate-400">({pct.toFixed(0)}%)</span>
                                                </div>
                                            </div>
                                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    }
                    icon={Receipt}
                    color="purple"
                    theme={settings.themeColor}
                    settings={settings}
                    tooltipText="Valor médio dos contratos ativos e distribuição por faixa de preço."
                />

            </div>

            <div className="flex flex-col gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                    <div className="flex flex-col mb-6">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">Fluxo de Caixa Mensal</h3>
                        <span className="text-xs text-slate-400 font-normal mt-1 flex items-center gap-1"><Calendar size={12} /> {periodLabel}</span>
                    </div>
                    <div className="h-72">
                        <div className="flex-1 h-full min-w-0">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <ComposedChart data={graphData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={settings.darkMode ? '#334155' : '#f1f5f9'} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: settings.darkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: settings.darkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                                    <Tooltip content={<CustomBarTooltip settings={settings} />} cursor={{ fill: settings.darkMode ? '#1e293b' : '#f8fafc' }} />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar name="Entr. Pagas" dataKey="entradaPago" stackId="in" fill="#10b981" fillOpacity={1} radius={[0, 0, 0, 0]} barSize={24} label={(p: any) => CustomBarLabel(p, 'in')} />
                                    <Bar name="Entr. Pendentes" dataKey="entradaPendente" stackId="in" fill="#10b981" fillOpacity={0.4} radius={[4, 4, 0, 0]} barSize={24} label={(p: any) => CustomBarLabel(p, 'in')} />
                                    <Bar name="Saídas Pagas" dataKey="saidaPago" stackId="out" fill="#f43f5e" fillOpacity={1} radius={[0, 0, 0, 0]} barSize={24} label={(p: any) => CustomBarLabel(p, 'out')} />
                                    <Bar name="Saídas Pendentes" dataKey="saidaPendente" stackId="out" fill="#f43f5e" fillOpacity={0.4} radius={[4, 4, 0, 0]} barSize={24} label={(p: any) => CustomBarLabel(p, 'out')} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors relative">
                    <div className="absolute top-6 right-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md rounded-xl p-3 flex flex-col items-end z-10">
                        <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><DollarSign size={10} /> Saldo Hoje</div>
                        <div className={`text-lg font-black ${currentBalanceToday >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{formatBRL(currentBalanceToday, settings.showCents, settings.privacyMode)}</div>
                    </div>
                    <div className="flex flex-col mb-6">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2"><Activity size={18} className="text-blue-500" /> Evolução do Saldo</h3>
                        <span className="text-xs text-slate-400 font-normal mt-1 flex items-center gap-1"><Calendar size={12} /> {periodLabel}</span>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <AreaChart data={balanceEvolution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0.5" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="0.5" stopColor="#f43f5e" stopOpacity={0.2} />
                                    </linearGradient>
                                    <linearGradient id="splitStroke" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0.5" stopColor="#10b981" stopOpacity={1} />
                                        <stop offset="0.5" stopColor="#f43f5e" stopOpacity={1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={settings.darkMode ? '#334155' : '#e2e8f0'} />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: settings.darkMode ? '#94a3b8' : '#64748b', fontSize: 11 }} minTickGap={30} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: settings.darkMode ? '#94a3b8' : '#64748b', fontSize: 11 }} tickFormatter={(val: any) => `R$${val / 1000}k`} />
                                <Tooltip content={<CustomTooltip settings={settings} />} />
                                <ReferenceLine y={0} stroke={settings.darkMode ? '#64748b' : '#94a3b8'} strokeDasharray="3 3" />
                                <Area type="monotone" dataKey="projected" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" fill="transparent" name="Projetado" />
                                <Area type="monotone" dataKey="realized" stroke="url(#splitStroke)" fill="url(#splitColor)" strokeWidth={2} activeDot={{ r: 6, strokeWidth: 0 }} name="Realizado" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Top Despesas</h3>
                    <div className="h-64 flex items-center">
                        <div className="flex-1 h-full min-w-0">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <PieChart>
                                    <Pie data={categoryChart} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {categoryChart.map((entry, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip content={<CustomPieTooltip settings={settings} />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-48 space-y-3 overflow-y-auto max-h-56 pr-2 custom-scrollbar text-xs">
                            {categoryChart.map((cat, i) => {
                                const total = categoryChart.reduce((a, b) => a + b.value, 0);
                                const percent = total > 0 ? ((cat.value / total) * 100).toFixed(1) : 0;
                                return (
                                    <div key={i} className="flex justify-between items-center group p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                        <div className="flex items-center gap-3 truncate max-w-[65%]">
                                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                                            <span className="truncate text-slate-600 dark:text-slate-300 font-medium text-xs" title={cat.name}>{cat.name}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="font-bold text-slate-800 dark:text-white text-xs">{formatBRL(cat.value, settings.showCents, settings.privacyMode)}</span>
                                            <span className="text-[10px] font-medium text-slate-400">{percent}%</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2"><CreditCard size={18} className="text-purple-500" /> Formas de Pagamento</h3>
                    <div className="h-64 flex items-center">
                        <div className="flex-1 h-full min-w-0">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <PieChart>
                                    <Pie data={paymentMethodChart} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {paymentMethodChart.map((entry, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[(index + 3) % CHART_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip content={<CustomPieTooltip settings={settings} />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-48 space-y-3 overflow-y-auto max-h-56 pr-2 custom-scrollbar text-xs">
                            {paymentMethodChart.map((pm, i) => {
                                const total = paymentMethodChart.reduce((a, b) => a + b.value, 0);
                                const percent = total > 0 ? ((pm.value / total) * 100).toFixed(1) : 0;
                                return (
                                    <div key={i} className="flex justify-between items-center group p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                        <div className="flex items-center gap-3 truncate max-w-[65%]">
                                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[(i + 3) % CHART_COLORS.length] }} />
                                            <span className="truncate text-slate-600 dark:text-slate-300 font-medium text-xs" title={pm.name}>{pm.name}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="font-bold text-slate-800 dark:text-white text-xs">{formatBRL(pm.value, settings.showCents, settings.privacyMode)}</span>
                                            <span className="text-[10px] font-medium text-slate-400">{percent}%</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>


            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 overflow-hidden flex flex-col">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                            <Bell size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Destaques Financeiros</h3>
                    </div>
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
                        <button onClick={() => setDashboardListTab('defaulters')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${dashboardListTab === 'defaulters' ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Top 10 Inadimplentes</button>
                        <button onClick={() => setDashboardListTab('next_payments')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${dashboardListTab === 'next_payments' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Próx. 10 Pagamentos</button>
                        <button onClick={() => setDashboardListTab('last_receipts')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${dashboardListTab === 'last_receipts' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Últimos 10 Receb.</button>
                    </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-4 py-3 font-semibold">{dashboardListTab === 'defaulters' ? 'Responsável / Aluno' : 'Descrição'}</th>
                                <th className="px-4 py-3 font-semibold">{dashboardListTab === 'defaulters' ? 'Vencimento (Antigo)' : dashboardListTab === 'next_payments' ? 'Vencimento' : 'Data Pagamento'}</th>
                                <th className="px-4 py-3 font-semibold text-right">Valor</th>
                                <th className="px-4 py-3 font-semibold text-center">{dashboardListTab === 'defaulters' ? 'Tempo (Máx)' : dashboardListTab === 'next_payments' ? 'Status' : 'Vencimento Original'}</th>
                                <th className="px-4 py-3 font-semibold text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {dashboardListTab === 'defaulters' && (
                                dashboardLists.topDefaulters.length > 0 ? dashboardLists.topDefaulters.map((item: any, i: number) => (
                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{item.name}</td>
                                        <td className="px-4 py-3 text-slate-500 font-mono text-xs"><span className="text-[10px] uppercase font-bold mr-1 text-slate-400">Desde</span>{item.nextDueDateStr || '-'}</td>
                                        <td className="px-4 py-3 text-right font-bold text-rose-600">{formatBRL(item.totalOverdue, settings.showCents, settings.privacyMode)}</td>
                                        <td className="px-4 py-3 text-center text-xs"><span className="px-2 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 rounded-md font-bold">{item.nextDue ? Math.ceil(Math.abs(new Date().getTime() - item.nextDue) / (1000 * 60 * 60 * 24 * 7)) + ' sem.' : '-'}</span></td>
                                        <td className="px-4 py-3 text-center"><span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold ${item.status === 'Evadido' ? 'bg-purple-100 text-purple-700' : 'bg-rose-100 text-rose-700'}`}>{item.status}</span></td>
                                    </tr>
                                )) : <tr><td colSpan={5} className="p-8 text-center text-slate-400">Nenhum inadimplente encontrado.</td></tr>
                            )}
                            {dashboardListTab === 'next_payments' && (
                                dashboardLists.nextPayments.length > 0 ? dashboardLists.nextPayments.map((item: any, i: number) => (
                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200 max-w-[250px] truncate" title={item.desc}>{item.desc}</td>
                                        <td className="px-4 py-3 text-slate-500 font-mono text-xs">{item.date}</td>
                                        <td className="px-4 py-3 text-right font-bold text-rose-500 dark:text-rose-400">{formatBRL(item.absVal, settings.showCents, settings.privacyMode)}</td>
                                        <td className="px-4 py-3 text-center text-xs"><span className="px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-md font-bold">Pendente</span></td>
                                        <td className="px-4 py-3 text-center"><span className="inline-flex px-2 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">A Pagar</span></td>
                                    </tr>
                                )) : <tr><td colSpan={5} className="p-8 text-center text-slate-400">Nenhuma despesa pendente encontrada.</td></tr>
                            )}
                            {dashboardListTab === 'last_receipts' && (
                                dashboardLists.lastReceipts.length > 0 ? dashboardLists.lastReceipts.map((item: any, i: number) => (
                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200 max-w-[250px] truncate" title={item.desc}>{item.desc}</td>
                                        <td className="px-4 py-3 text-slate-500 font-mono text-xs">{item.dateExec !== '-' ? item.dateExec : item.date}</td>
                                        <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{formatBRL(item.absVal, settings.showCents, settings.privacyMode)}</td>
                                        <td className="px-4 py-3 text-center text-xs text-slate-500">{item.date}</td>
                                        <td className="px-4 py-3 text-center"><span className="inline-flex px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Recebido</span></td>
                                    </tr>
                                )) : <tr><td colSpan={5} className="p-8 text-center text-slate-400">Nenhum recebimento recente encontrado.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default DashboardPage;
