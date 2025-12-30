import { parse, format, startOfMonth, endOfMonth, subMonths, addMonths, isValid, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const parseDateString = (dateStr: any): Date | null => {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const cleanStr = dateStr.trim();

    // Try dd/MM/yyyy
    let date = parse(cleanStr, 'dd/MM/yyyy', new Date());

    // Fallback/Safety check if valid
    if (!isValid(date)) {
        // Try yyyy-MM-dd
        date = parseISO(cleanStr);
    }

    return isValid(date) ? date : null;
};

export const formatDateDisplay = (isoDate: string) => {
    if (!isoDate) return 'Todo o Período';
    const date = parseISO(isoDate);
    if (!isValid(date)) return isoDate;
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
};

export const getDefaultDates = () => {
    const now = new Date();
    // 6 months back, 7 months forward (total range ~13 months centered)
    const start = startOfMonth(subMonths(now, 6));
    const end = endOfMonth(addMonths(now, 7));

    const formatDateISO = (d: Date) => format(d, 'yyyy-MM-dd');

    return { start: formatDateISO(start), end: formatDateISO(end) };
};

export const formatMonthLabel = (isoMonth: string) => {
    const [year, month] = isoMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    if (!isValid(date)) return isoMonth;
    return format(date, 'MMM yy', { locale: ptBR }).replace('.', '');
};


