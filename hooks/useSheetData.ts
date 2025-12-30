import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import { startOfDay, parseISO } from 'date-fns';
import { supabase } from '../lib/supabaseClient';

export interface SheetSettings {
    spreadsheetId: string;
    sheetName: string;
    geralSheetId?: string;
    geralSheetName?: string;
    dataSource?: 'google_sheets' | 'supabase' | 'csv';
    csvContent?: string;
    tenantId?: string;
}

interface SheetDataState {
    data: any[];
    geralData: any[];
    mergedData: any[];
    loading: boolean;
    error: string | null;
    lastUpdated: string | null;
}

const extractSpreadsheetId = (input: string) => {
    if (!input) return '';
    const match = input.match(/\/d\/([a-zA-Z0-9-_]+)/) || input.match(/id=([a-zA-Z0-9-_]+)/);
    return match ? match[1] : input;
};

export const useSheetData = (settings: SheetSettings, enabled: boolean = true) => {
    const [state, setState] = useState<SheetDataState>({
        data: [],
        geralData: [],
        mergedData: [],
        loading: false,
        error: null,
        lastUpdated: null,
    });

    const validateSheetExists = async (spreadsheetId: string, sheetName: string, label: string) => {
        if (!spreadsheetId || !sheetName) return;
        const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}&limit=0`;

        try {
            const response = await fetch(url);
            const text = await response.text();
            if (text.includes('"status":"error"') || text.includes('"reason":"invalid_query"')) {
                throw new Error(`A aba "${sheetName}" não foi encontrada na planilha ${label}. Verifique o nome exato.`);
            }
        } catch (err: any) {
            if (err.message.includes('A aba')) throw err;
        }
    };

    const fetchData = useCallback(async () => {
        const dataSource = settings.dataSource || 'google_sheets';

        // Skip fetch if requirements aren't met
        if (dataSource === 'google_sheets' && !settings.spreadsheetId) return;
        if (dataSource === 'csv' && !settings.csvContent) return;
        if (!enabled) return;

        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            let parsedBaseData: any[] = [];
            let parsedGeralData: any[] = [];

            if (dataSource === 'google_sheets') {
                const finalSpreadsheetId = extractSpreadsheetId(settings.spreadsheetId);
                const finalGeralId = extractSpreadsheetId(settings.geralSheetId || '');

                if (!finalSpreadsheetId) return;

                // 1. Validation
                await validateSheetExists(finalSpreadsheetId, settings.sheetName, 'Principal');
                if (finalGeralId && settings.geralSheetName) {
                    await validateSheetExists(finalGeralId, settings.geralSheetName, 'Geral');
                }

                // 2. Build URLs
                const baseUrl = `https://docs.google.com/spreadsheets/d/${finalSpreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(settings.sheetName)}`;
                const requests = [fetch(baseUrl).then(r => r.text())];

                if (finalGeralId && settings.geralSheetName) {
                    const geralUrl = `https://docs.google.com/spreadsheets/d/${finalGeralId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(settings.geralSheetName)}`;
                    requests.push(fetch(geralUrl).then(r => r.text()));
                }

                // 3. Parallel Fetch
                const results = await Promise.all(requests);
                const baseCsvText = results[0];
                const geralCsvText = results[1] || null;

                // 4. Validation & Parse
                if (baseCsvText.trim().startsWith('<!DOCTYPE html')) {
                    throw new Error('Erro de acesso à Planilha Principal. Verifique se:\n1. A planilha está "Pública para qualquer pessoa com o link".\n2. O ID da planilha está correto.');
                }

                const parseCsv = (csvText: string) => {
                    const result = Papa.parse(csvText, { header: true, skipEmptyLines: true });
                    return result.data;
                };

                parsedBaseData = parseCsv(baseCsvText);
                parsedGeralData = geralCsvText ? parseCsv(geralCsvText) : [];

            } else if (dataSource === 'supabase') {
                // Fetch from Supabase 'transactions' table
                let query = supabase.from('transactions').select('*');

                if (settings.tenantId) {
                    query = query.eq('tenant_id', settings.tenantId);
                }

                const { data, error } = await query;

                if (error) throw new Error(`Erro Supabase: ${error.message}`);
                parsedBaseData = data || [];

            } else if (dataSource === 'csv') {
                if (settings.csvContent) {
                    const result = Papa.parse(settings.csvContent, { header: true, skipEmptyLines: true });
                    parsedBaseData = result.data;
                }
            }

            const timestamp = new Date().toLocaleString('pt-BR');

            setState({
                data: parsedBaseData,
                geralData: parsedGeralData,
                mergedData: [...parsedBaseData, ...parsedGeralData],
                loading: false,
                error: null,
                lastUpdated: timestamp
            });

        } catch (err: any) {
            console.error("Erro no carregamento:", err);
            setState(prev => ({
                ...prev,
                loading: false,
                error: err.message || 'Erro desconhecido ao carregar dados.'
            }));
        }
    }, [settings, enabled]);

    // Efeito para carregar ao iniciar ou mudar configurações
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { ...state, refetch: fetchData };
};
