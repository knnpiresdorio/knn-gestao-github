import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, ComposedChart, AreaChart, Area, ReferenceLine
} from 'recharts';
import {
  TrendingUp, Wallet, AlertCircle,
  Calendar, Search, RefreshCw, ExternalLink, ArrowUpRight, ArrowDownRight,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, BarChart2, CreditCard, Activity,
  LayoutDashboard, Settings, Check, RotateCcw, X, CalendarDays,
  Save, Eye, EyeOff, Moon, Sun, Palette, DollarSign,
  Info, Layers, Database, Shield, XCircle,
  Receipt, AlertTriangle, Table, Bell, Clock, UserX, LucideIcon, Lock, ArrowUp, ArrowDown,
  Download, Percent, Scale, GraduationCap, FileSearch, LogOut, Upload, FileText, ChevronDown, FileSpreadsheet
} from 'lucide-react';
import AlertsModal from './components/AlertsModal';
import Sidebar from './components/layout/Sidebar';
import DashboardPage from './components/pages/DashboardPage';
import StudentsPage from './components/pages/StudentsPage';
import ExpensesPage from './components/pages/ExpensesPage';
import DrePage from './components/pages/DrePage';
import DatabasePage from './components/pages/DatabasePage';
import SettingsPage from './components/pages/SettingsPage';






import KpiCard from './components/dashboard/KpiCard';
import MenuItem from './components/layout/MenuItem';
import ManagerialPnL from './components/reports/ManagerialPnL';
import { CustomBarTooltip, CustomPieTooltip, CustomBarLabel, CustomTooltip } from './components/charts/CustomTooltips';
import { format } from 'date-fns';
import { useAppData } from './hooks/useAppData';
import { useStudentsData } from './hooks/useStudentsData';
import { useFinancialData } from './hooks/useFinancialData';
import { useDatabaseData } from './hooks/useDatabaseData';
import { useAuthStore } from './stores/authStore';
import LoginPage from './components/auth/LoginPage';
import { formatBRL, sortData, SortConfig } from './utils/formatters';
import { formatMonthLabel, formatDateDisplay } from './utils/dates';
import { THEME_BG_COLORS, STATUS_STYLES } from './utils/constants';

const App = () => {
  // --- HELPERS ---
  // formatMonthLabel is now imported from utils

  // --- STATE ---
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAlertPopupOpen, setIsAlertPopupOpen] = useState(false);
  const [dbTab, setDbTab] = useState<'financial' | 'students'>('financial');

  // --- CUSTOM HOOKS ---
  const {
    settings, setSettings, formSettings, setFormSettings, tenants,
    processedData, dataByPeriod, startDate, setStartDate, endDate, setEndDate,
    activeFilter, setActiveFilter, resetDates, loading, lastUpdated, refreshData, error
  } = useAppData();

  const {
    studentsData, studentMetrics, retentionStats, scholarshipData, studentProfileData,
    searchTerm: studentSearch, setSearchTerm: setStudentSearch,
    studentFilters, setStudentFilters,
    stuSortConfig, setStuSortConfig,
    currentPage: studentsPage, setCurrentPage: setStudentsPage,
    itemsPerPage: studentsItems, setItemsPerPage: setStudentsItems,
    uniqueOptions: studentOptions
  } = useStudentsData(processedData);

  const {
    dreData, stats, financialIndicators, graphData, balanceEvolution, categoryChart, paymentMethodChart, growth, currentBalanceToday,
    alerts, dashboardLists,
    expensesTableData, uniqueExpenseOptions,
    graphFilters, setGraphFilters,
    expenseSubTab, setExpenseSubTab,
    expenseFilters, setExpenseFilters,
    expSortConfig, setExpSortConfig,
    expensesCurrentPage, setExpensesCurrentPage,
    expensesItemsPerPage, setExpensesItemsPerPage,
    dashboardListTab, setDashboardListTab,
    handleClearFilters
  } = useFinancialData(processedData, dataByPeriod, studentsData, startDate, endDate);

  const {
    tableData, paginatedData,
    searchTerm: dbSearch, setSearchTerm: setDbSearch,
    statusFilter: dbStatus, setStatusFilter: setDbStatus,
    dbSortConfig, setDbSortConfig,
    currentPage: dbPage, setCurrentPage: setDbPage,
    itemsPerPage: dbItems, setItemsPerPage: setDbItems
  } = useDatabaseData(processedData, startDate, endDate, dbTab);

  const { user, loading: authLoading, signOut, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // --- REFS ---
  const studentsScrollRef = useRef<HTMLDivElement>(null);
  const expensesScrollRef = useRef<HTMLDivElement>(null);
  const studentsTableTopRef = useRef<HTMLDivElement>(null);
  const expensesTableTopRef = useRef<HTMLDivElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to top on page change
  useEffect(() => {
    if (activeTab === 'students' && studentsTableTopRef.current) {
      studentsTableTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [studentsPage]);

  useEffect(() => {
    if (activeTab === 'expenses' && expensesTableTopRef.current) {
      expensesTableTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [expensesCurrentPage]);


  /* ACTIONS_BLOCK */
  /* ACTIONS_BLOCK */
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'base' | 'geral') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (field === 'base') {
          setFormSettings(prev => ({ ...prev, csvContent: content }));
        }
      };
      reader.readAsText(file);
    }
  };

  const setFilterPeriod = (type: string) => {
    setActiveFilter(type);
    const now = new Date();
    let start, end;
    const fmt = (d: Date) => d.toISOString().split('T')[0];
    if (type === 'last_3_months') { start = new Date(now.getFullYear(), now.getMonth() - 3, 1); end = new Date(now.getFullYear(), now.getMonth(), 0); }
    else if (type === 'next_3_months') { start = new Date(now.getFullYear(), now.getMonth() + 1, 1); end = new Date(now.getFullYear(), now.getMonth() + 4, 0); }
    else if (type === 'current_year') { start = new Date(now.getFullYear(), 0, 1); end = new Date(now.getFullYear(), 11, 31); }
    else if (type === 'last_year') { start = new Date(now.getFullYear() - 1, 0, 1); end = new Date(now.getFullYear() - 1, 11, 31); }
    else if (type === 'next_year') { start = new Date(now.getFullYear() + 1, 0, 1); end = new Date(now.getFullYear() + 1, 11, 31); }
    else if (type === 'current_month') { start = new Date(now.getFullYear(), now.getMonth(), 1); end = new Date(now.getFullYear(), now.getMonth() + 1, 0); }
    if (start && end) { setStartDate(fmt(start)); setEndDate(fmt(end)); }
  };


  const periodLabel = (!startDate && !endDate) ? 'Todo o Período' : `${formatDateDisplay(startDate)} até ${formatDateDisplay(endDate)}`;
  const currentThemeBg = THEME_BG_COLORS[settings.themeColor] || 'bg-violet-600';
  const getStatusStyle = (status: string) => STATUS_STYLES[status] || STATUS_STYLES['Default'];

  // Helper function to render data source badge
  const getSourceBadge = () => {
    const source = (settings as any).dataSource || 'google_sheets';

    const styles: any = {
      google_sheets: { icon: FileSpreadsheet, color: 'text-emerald-600 dark:text-emerald-400', label: 'Planilha Conectada' },
      supabase: { icon: Database, color: 'text-cyan-600 dark:text-cyan-400', label: 'Banco Supabase' },
      csv: { icon: FileText, color: 'text-blue-600 dark:text-blue-400', label: 'Arquivo CSV' }
    };

    const current = styles[source] || styles.google_sheets;
    const Icon = current.icon;

    return (
      <div className="hidden md:flex items-center gap-2 text-xs font-medium bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-full transition-colors order-first">
        <Icon size={12} className={current.color} />
        <span className={current.color}>{current.label}</span>
      </div>
    );
  };

  const handleSort = (key: string, currentSort: SortConfig[], setSort: (s: SortConfig[] | ((prev: SortConfig[]) => SortConfig[])) => void) => {
    setSort((prev: SortConfig[]) => {
      const existingIndex = prev.findIndex(s => s.key === key);
      if (existingIndex >= 0) {
        const newSort = [...prev];
        if (newSort[existingIndex].direction === 'asc') { newSort[existingIndex] = { ...newSort[existingIndex], direction: 'desc' }; }
        else { newSort.splice(existingIndex, 1); }
        return newSort;
      } else {
        const newSort: SortConfig[] = [...prev, { key, direction: 'asc' }];
        if (newSort.length > 3) newSort.shift();
        return newSort;
      }
    });
  };



  // --- RENDER GUARDS ---
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-500 animate-pulse">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  // Not Logged In
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className={`${settings.darkMode ? 'dark' : ''} flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-300`}>
      <style>{` .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.5); border-radius: 9999px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(107, 114, 128, 0.8); } .dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(75, 85, 99, 0.5); } .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(107, 114, 128, 0.8); } `}</style>

      {/* SIDEBAR */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        resetDates={resetDates}
        setFilterPeriod={setFilterPeriod}
        signOut={signOut}
      />

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shadow-sm z-10 transition-colors duration-300 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-900 dark:text-white capitalize">{activeTab === 'dre' ? 'DRE' : activeTab === 'database' ? 'Base de Dados' : activeTab === 'expenses' ? 'Despesas' : activeTab === 'students' ? 'Alunos' : activeTab}</span>
              <ChevronRight size={14} />
              <span className={`font-bold text-${settings.themeColor}-600 dark:text-${settings.themeColor}-400`}>{settings.sheetName}</span>
            </div>

            {['dashboard', 'database', 'dre', 'expenses', 'students', 'configuracoes'].includes(activeTab) && (
              <>
                {getSourceBadge()}
                <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-full">
                  <Database size={12} />
                  <span>Analisando <strong>{graphData.length}</strong> de <strong>{processedData.length}</strong></span>
                </div>
                {lastUpdated && (
                  <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-full">
                    <Clock size={12} />
                    <span>Atualizado em: <strong>{lastUpdated}</strong></span>
                  </div>
                )}
              </>
            )}

            {['dashboard', 'database', 'dre', 'expenses', 'students', 'configuracoes'].includes(activeTab) && alerts.length > 0 && (
              <>
                <button
                  onClick={() => setIsAlertPopupOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-full animate-pulse hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                >
                  <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                    {alerts.length} Vencimentos Próximos
                  </span>
                </button>

                <AlertsModal
                  isOpen={isAlertPopupOpen}
                  onClose={() => setIsAlertPopupOpen(false)}
                  alerts={alerts}
                />
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button onClick={() => setSettings(s => ({ ...s, privacyMode: !s.privacyMode }))} className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all" title={settings.privacyMode ? "Mostrar Valores" : "Ocultar Valores"}>{settings.privacyMode ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              <button onClick={() => setSettings(s => ({ ...s, darkMode: !s.darkMode }))} className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all" title={settings.darkMode ? "Modo Claro" : "Modo Escuro"}>{settings.darkMode ? <Moon size={18} /> : <Sun size={18} />}</button>
              <button onClick={refreshData} disabled={loading} className={`p-2 rounded-lg transition-all ${loading ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 cursor-wait' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`} title="Atualizar Dados">
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
            {error && <div className="text-rose-600 dark:text-rose-400 text-xs font-bold bg-rose-50 dark:bg-rose-900/30 px-3 py-1 rounded-full flex items-center gap-1 border border-rose-100 dark:border-rose-800"><AlertCircle size={12} /> {error}</div>}
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400">K</div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative flex flex-col p-6 md:p-8 bg-slate-50 dark:bg-slate-950 transition-colors">
          {activeTab === 'dashboard' && (
            <DashboardPage
              stats={stats}
              financialIndicators={financialIndicators}
              settings={settings}
              growth={growth}
              graphData={graphData}
              periodLabel={periodLabel}
              currentBalanceToday={currentBalanceToday}
              balanceEvolution={balanceEvolution}
              categoryChart={categoryChart}
              paymentMethodChart={paymentMethodChart}
              dashboardListTab={dashboardListTab}
              setDashboardListTab={setDashboardListTab}
              dashboardLists={dashboardLists}
              formatBRL={formatBRL}
              graphFilters={graphFilters}
              onClearFilters={handleClearFilters}
            />
          )}


          {activeTab === 'students' && (
            <StudentsPage
              studentsData={studentsData}
              studentMetrics={studentMetrics}
              retentionStats={retentionStats}
              scholarshipData={scholarshipData}
              studentProfileData={studentProfileData}
              loading={loading}
              currentPage={studentsPage}
              setCurrentPage={setStudentsPage}
              itemsPerPage={studentsItems}
              setItemsPerPage={setStudentsItems}
              searchTerm={studentSearch}
              setSearchTerm={setStudentSearch}
              studentFilters={studentFilters}
              setStudentFilters={setStudentFilters}
              stuSortConfig={stuSortConfig}
              setStuSortConfig={setStuSortConfig}
              settings={settings}
              formatBRL={formatBRL}
              handleSort={handleSort}
              studentsScrollRef={studentsScrollRef}
              studentsTableTopRef={studentsTableTopRef}
              uniqueOptions={studentOptions}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesPage
              expensesTableData={expensesTableData}
              uniqueExpenseOptions={uniqueExpenseOptions}
              loading={loading}
              expensesCurrentPage={expensesCurrentPage}
              setExpensesCurrentPage={setExpensesCurrentPage}
              expensesItemsPerPage={expensesItemsPerPage}
              setExpensesItemsPerPage={setExpensesItemsPerPage}
              expenseFilters={expenseFilters}
              setExpenseFilters={setExpenseFilters}
              expenseSubTab={expenseSubTab}
              setExpenseSubTab={setExpenseSubTab}
              expSortConfig={expSortConfig}
              setExpSortConfig={setExpSortConfig}
              searchTerm={graphFilters.search}
              setSearchTerm={(term) => setGraphFilters(f => ({ ...f, search: term }))}
              settings={settings}
              formatBRL={formatBRL}
              handleSort={handleSort}
              expensesScrollRef={expensesScrollRef}
              expensesTableTopRef={expensesTableTopRef}
            />
          )}

          {activeTab === 'dre' && (
            <DrePage
              dreData={dreData}
              settings={settings}
              formatBRL={formatBRL}
            />
          )}

          {activeTab === 'dre_gerencial' && <ManagerialPnL data={dataByPeriod} settings={settings} />}

          {activeTab === 'database' && (
            <DatabasePage
              tableData={tableData}
              paginatedData={paginatedData}
              itemsPerPage={dbItems}
              setItemsPerPage={setDbItems}
              currentPage={dbPage}
              setCurrentPage={setDbPage}
              searchTerm={dbSearch}
              setSearchTerm={setDbSearch}
              statusFilter={dbStatus}
              setStatusFilter={setDbStatus}
              startDate={startDate}
              endDate={endDate}
              processedData={processedData}
              dbSortConfig={dbSortConfig}
              setDbSortConfig={setDbSortConfig}
              handleSort={sortData as any}
              formatBRL={formatBRL}
              settings={settings}
              handleApplyFilters={() => {
                setGraphFilters({ search: dbSearch, status: dbStatus });
                setActiveTab('dashboard');
              }}
              dbTab={dbTab}
              setDbTab={setDbTab}
            />
          )}

          {activeTab === 'configuracoes' && (
            <SettingsPage
              settings={settings}
              setSettings={setSettings}
              formSettings={formSettings}
              setFormSettings={setFormSettings}
              loading={loading}
              tenants={tenants}
              handleCsvUpload={handleCsvUpload}
            />
          )}


        </div>
      </main >
    </div >
  );
};
export default App;