import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
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
  Info, Layers, Shield, XCircle,
  Receipt, AlertTriangle, Table, Bell, Clock, UserX, LucideIcon, Lock, ArrowUp, ArrowDown,
  Download, Percent, Scale, GraduationCap, FileSearch, LogOut, Upload, ChevronDown, Loader2
} from 'lucide-react';
import AlertsModal from './components/AlertsModal';
import Sidebar from './components/layout/Sidebar';
import DashboardPage from './components/pages/DashboardPage';
import StudentsPage from './components/pages/StudentsPage';
import ExpensesPage from './components/pages/ExpensesPage';
import DrePage from './components/pages/DrePage';
import DatabasePage from './components/pages/DatabasePage';
import SettingsPage from './components/pages/SettingsPage';
import SystemAlert from './components/common/SystemAlert';
import DetailsModal from './components/modals/DetailsModal';
import OnboardingModal from './components/modals/OnboardingModal';
import { SystemMessage } from './types/system';






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
  // --- STATE ---
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = useMemo(() => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'dashboard';
    if (path === '/students') return 'students';
    if (path === '/expenses') return 'expenses';
    if (path === '/dre') return 'dre';
    if (path === '/dre-gerencial') return 'dre_gerencial';
    if (path === '/database') return 'database';
    if (path === '/settings') return 'configuracoes';
    return 'dashboard';
  }, [location.pathname]);

  const handleSetActiveTab = (tab: string) => {
    switch (tab) {
      case 'dashboard': navigate('/'); break;
      case 'students': navigate('/students'); break;
      case 'expenses': navigate('/expenses'); break;
      case 'dre': navigate('/dre'); break;
      case 'dre_gerencial': navigate('/dre-gerencial'); break;
      case 'database': navigate('/database'); break;
      case 'configuracoes': navigate('/settings'); break;
      default: navigate('/');
    }
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAlertPopupOpen, setIsAlertPopupOpen] = useState(false);
  const [dbTab, setDbTab] = useState<'financial' | 'students'>('financial');
  const [selectedSystemMessage, setSelectedSystemMessage] = useState<SystemMessage | null>(null);

  // --- CUSTOM HOOKS ---
  const {
    settings, setSettings, formSettings, setFormSettings, tenants,
    processedData, dataByPeriod, startDate, setStartDate, endDate, setEndDate,
    activeFilter, setActiveFilter, resetDates, loading, needsSetup, lastUpdated, refreshData, messages,
    addTenant, updateTenant, deleteTenant
  } = useAppData();

  const {
    studentsData, studentMetrics, retentionStats, scholarshipData, studentProfileData, paymentDayData,
    searchTerm: studentSearch, setSearchTerm: setStudentSearch,
    studentFilters, setStudentFilters,
    stuSortConfig, setStuSortConfig,
    currentPage: studentsPage, setCurrentPage: setStudentsPage,
    itemsPerPage: studentsItems, setItemsPerPage: setStudentsItems,
    uniqueOptions: studentOptions,
    totalStudentsCount
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
    categoryFilter, setCategoryFilter,
    accountFilter, setAccountFilter,
    paymentMethodFilter, setPaymentMethodFilter,
    dbSortConfig, setDbSortConfig,
    currentPage: dbPage, setCurrentPage: setDbPage,
    itemsPerPage: dbItems, setItemsPerPage: setDbItems,
    financialsTotals,
    uniqueOptions: dbUniqueOptions,
    handleApplyFilters
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
      if (!file.name.toLowerCase().endsWith('.csv')) {
        alert('Erro: O arquivo deve estar no formato .csv');
        e.target.value = ''; // Reset input
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (field === 'base') {
          setFormSettings(prev => ({ ...prev, csvContent: content }));
        } else {
          setFormSettings(prev => ({ ...prev, csvGeralContent: content }));
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


  const handleQuickFilter = (status: string) => {
    handleSetActiveTab('database');
    setDbStatus(status);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className={`${settings.darkMode ? 'dark' : ''} flex h-screen bg-app-bg dark:bg-slate-950 font-sans text-text-primary dark:text-slate-100 overflow-hidden transition-colors duration-300`}>
      <style>{` .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.5); border-radius: 9999px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(107, 114, 128, 0.8); } .dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(75, 85, 99, 0.5); } .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(107, 114, 128, 0.8); } `}</style>

      {/* SIDEBAR */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
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
        <header className="h-16 bg-app-ui dark:bg-slate-900 border-b border-transparent dark:border-slate-800 flex items-center justify-between px-8 shadow-sm z-10 transition-colors duration-300 shrink-0">
          <div className="flex items-center gap-4">
            {/* BREADCRUMBS */}
            <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-slate-400">
              <span className="text-text-secondary hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300 transition-colors cursor-pointer" onClick={() => handleSetActiveTab('dashboard')}>
                KNN Gestão
              </span>
              <ChevronRight size={14} />
              <span className="font-bold text-text-primary dark:text-white capitalize">
                {activeTab === 'dashboard' ? 'Dashboard'
                  : activeTab === 'database' ? 'Base de Dados'
                    : activeTab === 'dre_gerencial' ? 'DRE Gerencial'
                      : activeTab === 'dre' ? 'DRE Contábil'
                        : activeTab === 'expenses' ? 'Controle de Despesas'
                          : activeTab === 'students' ? 'Alunos & Matrículas'
                            : 'Configurações'}
              </span>
            </div>

            {/* LAST UPDATED */}
            {['dashboard', 'database', 'dre', 'expenses', 'students', 'configuracoes', 'dre_gerencial'].includes(activeTab) && lastUpdated && (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 text-xs font-medium text-text-secondary dark:text-slate-500 bg-app-ui dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-full">
                  <Clock size={12} />
                  <span>Atualizado em: <strong>{lastUpdated}</strong></span>
                </div>

                {activeTab === 'dre_gerencial' && (
                  <div className="hidden md:flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-3 py-1.5 rounded-full">
                    <AlertTriangle size={12} />
                    <span>Aviso: Dados Gerenciais</span>
                  </div>
                )}
              </div>
            )}

            {/* ALERTS */}
            {['dashboard', 'database', 'dre', 'expenses', 'students', 'configuracoes'].includes(activeTab) && alerts.length > 0 && (
              <button
                onClick={() => setIsAlertPopupOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-semantic-warning-bg dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-full animate-pulse hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
              >
                <AlertTriangle size={14} className="text-semantic-warning-text dark:text-amber-400" />
                <span className="text-xs font-bold text-semantic-warning-text dark:text-amber-400">
                  {alerts.length} Vencimentos Próximos
                </span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button onClick={() => setSettings(s => ({ ...s, privacyMode: !s.privacyMode }))} className="p-2 text-text-secondary hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-app-ui dark:hover:bg-slate-800 rounded-lg transition-all" title={settings.privacyMode ? "Mostrar Valores" : "Ocultar Valores"}>{settings.privacyMode ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              <button onClick={() => setSettings(s => ({ ...s, darkMode: !s.darkMode }))} className="p-2 text-text-secondary hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-app-ui dark:hover:bg-slate-800 rounded-lg transition-all" title={settings.darkMode ? "Modo Claro" : "Modo Escuro"}>{settings.darkMode ? <Moon size={18} /> : <Sun size={18} />}</button>
              <button onClick={refreshData} disabled={loading} className={`p-2 rounded-lg transition-all ${loading ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 cursor-wait' : 'text-text-secondary hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-app-ui dark:hover:bg-slate-800'}`} title="Atualizar Dados">
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
            <div className="w-8 h-8 rounded-full bg-app-ui dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-text-secondary dark:text-slate-400">K</div>
          </div>
        </header>

        {/* System Messages Section */}
        {messages && messages.length > 0 && (
          <div className="px-6 md:px-8 py-4 bg-app-bg dark:bg-slate-950 flex flex-col gap-3">
            {messages.map(msg => (
              <SystemAlert
                key={msg.id}
                message={msg}
                onOpenDetails={setSelectedSystemMessage}
              />
            ))}
          </div>
        )}

        <div className="flex-1 overflow-hidden relative flex flex-col bg-app-bg dark:bg-slate-950 transition-colors">
          <Routes>
            <Route path="/" element={
              <DashboardPage
                stats={stats}
                financialIndicators={financialIndicators}
                settings={settings}
                loading={loading} // Pass loading state
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
                onQuickFilter={handleQuickFilter}
              />
            } />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />

            <Route path="/students" element={
              <StudentsPage
                studentsData={studentsData}
                studentMetrics={studentMetrics}
                retentionStats={retentionStats}
                scholarshipData={scholarshipData}
                studentProfileData={studentProfileData}
                paymentDayData={paymentDayData}
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
                totalDatasetCount={totalStudentsCount}
              />
            } />

            <Route path="/expenses" element={
              <ExpensesPage
                expensesTableData={expensesTableData}
                uniqueExpenseOptions={uniqueExpenseOptions}
                loading={loading}
                currentPage={expensesCurrentPage}
                setCurrentPage={setExpensesCurrentPage}
                itemsPerPage={expensesItemsPerPage}
                setItemsPerPage={setExpensesItemsPerPage}
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
            } />

            <Route path="/dre" element={
              <DrePage
                dreData={dreData}
                settings={settings}
                formatBRL={formatBRL}
              />
            } />

            <Route path="/dre-gerencial" element={<ManagerialPnL data={dataByPeriod} settings={settings} />} />

            <Route path="/database" element={
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
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                accountFilter={accountFilter}
                setAccountFilter={setAccountFilter}
                paymentMethodFilter={paymentMethodFilter}
                setPaymentMethodFilter={setPaymentMethodFilter}
                startDate={startDate}
                endDate={endDate}
                processedData={processedData}
                dbSortConfig={dbSortConfig}
                setDbSortConfig={setDbSortConfig}
                handleSort={handleSort}
                formatBRL={formatBRL}
                settings={settings}
                handleApplyFilters={handleApplyFilters}
                dbTab={dbTab}
                setDbTab={setDbTab}
                financialsTotals={financialsTotals}
                uniqueOptions={dbUniqueOptions}
              />
            } />

            <Route path="/settings" element={
              <SettingsPage
                settings={settings}
                setSettings={setSettings}
                formSettings={formSettings}
                setFormSettings={setFormSettings}
                loading={loading}
                tenants={tenants}
                handleCsvUpload={handleCsvUpload}
                onAddTenant={addTenant}
                onUpdateTenant={updateTenant}
                onDeleteTenant={deleteTenant}
              />
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>


        </div>
      </main >

      {selectedSystemMessage && (
        <DetailsModal
          message={selectedSystemMessage}
          onClose={() => setSelectedSystemMessage(null)}
        />
      )}

      {/* Moved AlertsModal here to ensure it's on top of everything and not clipped by header/tables */}
      <AlertsModal
        isOpen={isAlertPopupOpen}
        onClose={() => setIsAlertPopupOpen(false)}
        alerts={alerts}
      />

      <OnboardingModal
        isOpen={needsSetup && activeTab !== 'configuracoes'}
        onConfigure={() => handleSetActiveTab('configuracoes')}
      />
    </div >
  );
};
export default App;