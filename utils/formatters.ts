import { useState, useEffect } from 'react';

// --- Types ---
export interface CsvRecord {
    [key: string]: string | undefined;
}

export interface SortConfig {
    key: string;
    direction: 'asc' | 'desc';
}

// --- Hooks ---
export const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

// --- Formatters ---
export const parseCurrency = (val: any): number => {
    if (val === undefined || val === null || val === '') return 0;
    if (typeof val === 'number') return isFinite(val) ? val : 0;
    try {
        const clean = String(val).replace(/[^0-9,-]/g, '').replace(',', '.');
        const num = parseFloat(clean);
        return isFinite(num) ? num : 0;
    } catch (e) { return 0; }
};

export const toTitleCase = (str: string) => {
    return str.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
};

export const formatBRL = (v: any, showCents = true, privacyMode = false) => {
    if (privacyMode) return 'R$ ••••';
    const safeValue = (typeof v === 'number' && isFinite(v)) ? v : 0;
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency', currency: 'BRL',
        minimumFractionDigits: showCents ? 2 : 0, maximumFractionDigits: showCents ? 2 : 0
    }).format(safeValue);
};

export const formatPercent = (value: number) => {
    if (isNaN(value) || !isFinite(value)) return '0,0%';
    return new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);
};

// --- Sorting ---
export const sortData = (data: any[], config: SortConfig[]) => {
    if (!config.length) return data;
    return [...data].sort((a, b) => {
        for (const { key, direction } of config) {
            let comparison = 0;
            let valA = a[key];
            let valB = b[key];

            if (key === 'ts') {
                valA = valA || 0;
                valB = valB || 0;
                comparison = valA - valB;
            } else if (typeof valA === 'string' && typeof valB === 'string') {
                comparison = valA.localeCompare(valB);
            } else if (typeof valA === 'number' && typeof valB === 'number') {
                comparison = valA - valB;
            } else {
                comparison = String(valA || '').localeCompare(String(valB || ''));
            }

            if (direction === 'desc') comparison *= -1;
            if (comparison !== 0) return comparison;
        }
        return 0;
    });
};
