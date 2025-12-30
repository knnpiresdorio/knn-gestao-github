import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import { startOfDay, parseISO } from 'date-fns';
import { supabase } from '../lib/supabaseClient';
import { SystemMessage } from '../types/system';

export interface SheetSettings {
    spreadsheetId: string;
    sheetName: string;
    geralSheetId?: string;
    geralSheetName?: string;
    dataSource?: 'google_sheets' | 'csv';
    csvContent?: string;
    csvGeralContent?: string;
    tenantId?: string;
}

interface SheetDataState {
    data: any[];
    geralData: any[];
    mergedData: any[];
    loading: boolean;
    messages: SystemMessage[];
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
        messages: [],
        lastUpdated: null,
    });

    const validateSheetExists = async (spreadsheetId: string, sheetName: string, label: string) => {
        if (!spreadsheetId || !sheetName) return;
        const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}&limit=0`;

        try {
            const response = await fetch(url);
            const text = await response.text();
            if (text.includes('"status":"error"') || text.includes('"reason":"invalid_query"')) {
                const error = new Error(`A aba "${sheetName}" não foi encontrada.`);
                (error as any).details = `Verifique se o nome da aba "${sheetName}" está escrito exatamente como na planilha ${label}.`;
                throw error;
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

        setState(prev => ({ ...prev, loading: true, messages: [] }));

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


            } else if (dataSource === 'csv') {
                if (settings.csvContent) {
                    const result = Papa.parse(settings.csvContent, { header: true, skipEmptyLines: true });
                    parsedBaseData = result.data;
                }
                if (settings.csvGeralContent) {
                    const result = Papa.parse(settings.csvGeralContent, { header: true, skipEmptyLines: true });
                    parsedGeralData = result.data;
                }
            }

            const timestamp = new Date().toLocaleString('pt-BR');

            setState({
                data: parsedBaseData,
                geralData: parsedGeralData,
                mergedData: [...parsedBaseData, ...parsedGeralData],
                loading: false,
                messages: [],
                lastUpdated: timestamp
            });

        } catch (err: any) {
            console.error("Erro no carregamento:", err);
            const newMessage: SystemMessage = {
                id: `err-${Date.now()}`,
                type: 'error',
                title: 'Erro no Carregamento',
                description: err.message || 'Houve um problema ao sincronizar os dados.',
                details: err.details || err.stack || JSON.stringify(err, null, 2)
            };
            setState(prev => ({
                ...prev,
                loading: false,
                messages: [newMessage]
            }));
        }
    }, [settings, enabled]);

    // Efeito para carregar ao iniciar ou mudar configurações
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { ...state, refetch: fetchData, error: state.messages[0]?.description || null };
};
