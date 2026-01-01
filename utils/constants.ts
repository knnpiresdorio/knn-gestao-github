
export const DEFAULT_CONFIG = {
    spreadsheetId: '',
    sheetName: '',
    geralSheetId: '',
    geralSheetName: '',
    schoolName: '',
    darkMode: true,
    showCents: true,
    privacyMode: false,
    themeColor: 'violet',
    dataSource: 'google_sheets' as 'google_sheets' | 'csv', // 'google_sheets' | 'csv'
    tenantId: '',
    csvContent: '',
    csvGeralContent: ''
};

export const THEME_BG_COLORS: Record<string, string> = {
    violet: 'bg-violet-600',
    blue: 'bg-blue-600',
    emerald: 'bg-emerald-600',
    rose: 'bg-rose-600',
    amber: 'bg-amber-600'
};

export const CHART_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'];

export const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
    'Pago': { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
    'Pendente': { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
    'Atrasado': { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-400', dot: 'bg-rose-500' },
    'Desistente': { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-500 dark:text-slate-400', dot: 'bg-slate-400' },
    'Evadido': { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500' },
    'Trancado': { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-400', dot: 'bg-cyan-500' },
    'Ativo': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
    'Inadimplente/Ativo': { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-400', dot: 'bg-rose-500' },
    'Inadimplente/Matriculado': { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-400', dot: 'bg-rose-500' },
    'Concluído': { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-700 dark:text-teal-400', dot: 'bg-teal-500' },
    'Matriculado': { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400', dot: 'bg-indigo-500' },
    'Outros': { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', dot: 'bg-slate-400' },
    'Default': { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', dot: 'bg-slate-400' }
};
