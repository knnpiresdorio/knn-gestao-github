import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabaseClient';
import { useSheetData } from './useSheetData';
import { DEFAULT_CONFIG } from '../utils/constants';
import { parseCurrency, toTitleCase } from '../utils/formatters';
import { parseDateString, getDefaultDates } from '../utils/dates';
import { parseISO } from 'date-fns';

export const useAppData = () => {
    // --- AUTH & SETTINGS ---
    const { tenant, loading: authLoading } = useAuthStore();
    const [settings, setSettings] = useState({ ...DEFAULT_CONFIG, csvContent: '', csvGeralContent: '' });
    const [formSettings, setFormSettings] = useState({ ...DEFAULT_CONFIG, csvContent: '', csvGeralContent: '' });

    // Update settings when tenant loads
    useEffect(() => {
        if (tenant) {
            const newSettings = {
                ...DEFAULT_CONFIG,
                spreadsheetId: tenant.spreadsheet_id,
                sheetName: tenant.sheet_name || DEFAULT_CONFIG.sheetName,
                geralSheetId: tenant.geral_sheet_id || DEFAULT_CONFIG.geralSheetId,
                geralSheetName: tenant.geral_sheet_name || DEFAULT_CONFIG.geralSheetName,
                schoolName: tenant.name,
                themeColor: tenant.theme_color || DEFAULT_CONFIG.themeColor,
                tenantId: tenant.id
            };
            setSettings(newSettings);
            setFormSettings(newSettings);
        }
    }, [tenant]);

    // Fetch available tenants
    const [tenants, setTenants] = useState<any[]>([]);

    const fetchTenants = async () => {
        const { data } = await supabase.from('tenants').select('*').order('name');
        if (data) setTenants(data);
    };

    useEffect(() => {
        fetchTenants();
    }, []);

    const addTenant = async (newTenant: any) => {
        const { data, error } = await supabase
            .from('tenants')
            .insert([newTenant])
            .select();

        if (error) throw error;

        if (data && data.length > 0) {
            setTenants(prev => [...prev, data[0]]);
        }

        await fetchTenants();
        return data?.[0];
    };

    const updateTenant = async (id: string, updatedData: any) => {
        try {
            const { data, error } = await supabase
                .from('tenants')
                .update(updatedData)
                .eq('id', id)
                .select();

            if (error) throw error;

            if (data && data.length > 0) {
                const updatedTenant = data[0];
                setTenants(prev => prev.map(t => String(t.id) === String(id) ? updatedTenant : t));

                // If we updated the currently selected tenant, update the settings
                if (String(settings.tenantId) === String(id)) {
                    setSettings(prev => ({
                        ...prev,
                        spreadsheetId: updatedTenant.spreadsheet_id,
                        sheetName: updatedTenant.sheet_name || DEFAULT_CONFIG.sheetName,
                        geralSheetId: updatedTenant.geral_sheet_id || DEFAULT_CONFIG.geralSheetId,
                        geralSheetName: updatedTenant.geral_sheet_name || DEFAULT_CONFIG.geralSheetName,
                        schoolName: updatedTenant.name,
                        themeColor: updatedTenant.theme_color || DEFAULT_CONFIG.themeColor
                    }));
                    setFormSettings(prev => ({
                        ...prev,
                        spreadsheetId: updatedTenant.spreadsheet_id,
                        sheetName: updatedTenant.sheet_name || DEFAULT_CONFIG.sheetName,
                        geralSheetId: updatedTenant.geral_sheet_id || DEFAULT_CONFIG.geralSheetId,
                        geralSheetName: updatedTenant.geral_sheet_name || DEFAULT_CONFIG.geralSheetName,
                        schoolName: updatedTenant.name,
                        themeColor: updatedTenant.theme_color || DEFAULT_CONFIG.themeColor
                    }));
                }
            }

            await fetchTenants();
            return data?.[0];
        } catch (err: any) {
            console.error('Error updating tenant:', err);
            throw err;
        }
    };

    const deleteTenant = async (id: string) => {
        try {
            const { error } = await supabase
                .from('tenants')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Update local state immediately
            setTenants(prev => prev.filter(t => String(t.id) !== String(id)));

            // If we deleted the current tenant, clear settings
            if (String(settings.tenantId) === String(id)) {
                const emptySettings = { ...DEFAULT_CONFIG, csvContent: '', csvGeralContent: '' };
                setSettings(emptySettings);
                setFormSettings(emptySettings);
            } else if (String(formSettings.tenantId) === String(id)) {
                // If we deleted the unit currently selected in the form dropdown
                setFormSettings(prev => ({ ...prev, tenantId: '' }));
            }

            await fetchTenants();
        } catch (err: any) {
            console.error('Error deleting tenant:', err);
            throw err;
        }
    };

    // Auto-sync settings (Active & Form) when tenants array changes
    useEffect(() => {
        if (tenants.length === 0) return;

        // Auto-select first tenant if none selected
        if (!settings.tenantId && settings.dataSource === 'google_sheets') {
            const firstTenant = tenants[0];
            const newSettings = {
                ...settings,
                spreadsheetId: firstTenant.spreadsheet_id,
                sheetName: firstTenant.sheet_name || DEFAULT_CONFIG.sheetName,
                geralSheetId: firstTenant.geral_sheet_id || DEFAULT_CONFIG.geralSheetId,
                geralSheetName: firstTenant.geral_sheet_name || DEFAULT_CONFIG.geralSheetName,
                schoolName: firstTenant.name,
                themeColor: firstTenant.theme_color || DEFAULT_CONFIG.themeColor,
                tenantId: firstTenant.id
            };
            setSettings(newSettings);
            setFormSettings(newSettings);
            return;
        }

        // 1. Sync Active Settings
        if (settings.tenantId) {
            const activeTenant = tenants.find(t => String(t.id) === String(settings.tenantId));
            if (activeTenant) {
                const refreshed = {
                    ...settings,
                    spreadsheetId: activeTenant.spreadsheet_id,
                    sheetName: activeTenant.sheet_name || DEFAULT_CONFIG.sheetName,
                    geralSheetId: activeTenant.geral_sheet_id || DEFAULT_CONFIG.geralSheetId,
                    geralSheetName: activeTenant.geral_sheet_name || DEFAULT_CONFIG.geralSheetName,
                    schoolName: activeTenant.name,
                    themeColor: activeTenant.theme_color || DEFAULT_CONFIG.themeColor,
                };
                if (JSON.stringify(refreshed) !== JSON.stringify(settings)) {
                    setSettings(refreshed);
                }
            }
        }

        // 2. Sync Form Settings (dropdown selection)
        if (formSettings.tenantId) {
            const selectedTenant = tenants.find(t => String(t.id) === String(formSettings.tenantId));
            if (selectedTenant) {
                const refreshed = {
                    ...formSettings,
                    spreadsheetId: selectedTenant.spreadsheet_id,
                    sheetName: selectedTenant.sheet_name || DEFAULT_CONFIG.sheetName,
                    geralSheetId: selectedTenant.geral_sheet_id || DEFAULT_CONFIG.geralSheetId,
                    geralSheetName: selectedTenant.geral_sheet_name || DEFAULT_CONFIG.geralSheetName,
                    schoolName: selectedTenant.name,
                    themeColor: selectedTenant.theme_color || DEFAULT_CONFIG.themeColor,
                };
                if (JSON.stringify(refreshed) !== JSON.stringify(formSettings)) {
                    setFormSettings(refreshed);
                }
            }
        }
    }, [tenants, settings, formSettings, settings.dataSource]);

    // --- DATA FETCHING ---
    const needsSetup = useMemo(() => {
        if (settings.dataSource === 'csv') {
            return !settings.csvContent;
        }
        return !settings.spreadsheetId || !settings.tenantId;
    }, [settings]);

    const { data: baseData, geralData, loading: dataLoading, messages, lastUpdated, refetch } = useSheetData(settings, !authLoading && !needsSetup);

    const rawData = useMemo(() => {
        const base = (baseData || []).map((r: any) => ({ ...r, source: 'base' }));
        const geral = (geralData || []).map((r: any) => ({ ...r, source: 'geral' }));
        return [...base, ...geral];
    }, [baseData, geralData]);

    // --- DATE FILTERS ---
    const defaultDates = getDefaultDates();
    const [startDate, setStartDate] = useState(defaultDates.start);
    const [endDate, setEndDate] = useState(defaultDates.end);
    const [activeFilter, setActiveFilter] = useState(''); // 'hoje', 'ontem', etc. helper state

    const resetDates = () => {
        const def = getDefaultDates();
        setStartDate(def.start);
        setEndDate(def.end);
        setActiveFilter('');
    };

    const setFilterPeriod = (period: string) => {
        setActiveFilter(period);
        // Logic for setting specific dates can be moved here or kept in Sidebar, 
        // but usually Sidebar handles the UI logic for buttons. 
        // We'll expose setStartDate/setEndDate directly.
    };

    // --- DATA PROCESSING (Normalization) ---
    const processedData = useMemo(() => {
        if (!rawData || !Array.isArray(rawData)) return [];

        return rawData.map((item: any, index: number) => {
            const rawDate = item['Data_Vencimento'] || item['data_vencimento'] || item['Data_venc'] || '';
            const rawDesc = item['Descrição'] || item['descricao'] || item['Descricao'] || '';
            const rawResp = item['Responsável'] || item['responsavel'] || item['Responsavel'] || '';
            const rawCat = item['Categoria'] || item['categoria'] || '';
            const rawStatus = item['Status'] || item['status'] || ''; // Changed from 'Pendente' to ''
            // Default type: If 'geral' source (Student Registry), default to 'Info', else 'Saída'
            const rawType = item['Tipo'] || item['tipo'] || (item.source === 'geral' ? 'Info' : 'Saída');
            const rawPayment = item['Forma_Pag'] || item['forma_pag'] || 'Outros';
            const rawAccount = item['Conta'] || item['conta'] || 'Geral';
            const rawValLiq = item['Valor_Liq'] || item['valor_liq'] || item['Liquido'] || '0';
            const rawValBruto = item['Valor_Bruto'] || item['valor_bruto'] || item['Bruto'] || rawValLiq;
            // Handle boolean text from sheets
            const rawIsVar = item['is_Variavel'] || item['is_variavel'] || '';
            const rawClass = item['Classificação'] || item['Classificacao'] || '';
            const rawDateExec = item['Data_Pagamento'] || item['data_exec'] || item['Data_Baixa'] || item['Data_Exec'] || '-';
            const rawObs = item['Observacao'] || item['observacao'] || '';

            const val = parseCurrency(rawValLiq);
            const dateObj = parseDateString(rawDate);

            // Parse Payment Date if available
            let dateExecObj: Date | null = null;
            if (rawDateExec && rawDateExec !== '-' && rawDateExec.trim() !== '') {
                dateExecObj = parseDateString(rawDateExec);
            }

            let cleanCat = rawCat.replace(/^(REC|DSP) - /g, '').trim();
            cleanCat = toTitleCase(cleanCat);
            const cleanPayment = toTitleCase(rawPayment);

            let classification = 'Variável';
            const isVarUpper = String(rawIsVar).toUpperCase();
            if (isVarUpper === 'FALSE' || isVarUpper === '0') { classification = 'Fixa'; }
            else if (isVarUpper === 'TRUE' || isVarUpper === '1') { classification = 'Variável'; }
            else if (rawClass) { classification = rawClass; }

            return {
                id: `row-${index}`,
                ...item,
                date: rawDate,
                dateObj: dateObj,
                ts: dateObj ? dateObj.getTime() : 0,
                desc: rawDesc,
                resp: rawResp,
                cat: cleanCat,
                status: rawStatus,
                type: rawType,
                payment: cleanPayment,
                account: rawAccount,
                val: val,
                absVal: Math.abs(val),
                grossVal: Math.abs(parseCurrency(rawValBruto)),
                classification: classification,
                dateExec: rawDateExec,
                dateExecObj: dateExecObj,
                obs: rawObs
            };
        }).filter(r => (r.date && r.desc) || r.source === 'geral');
    }, [rawData]);

    const dataByPeriod = useMemo(() => {
        if (!startDate && !endDate) return processedData;
        const startTs = startDate ? parseISO(startDate).setHours(0, 0, 0, 0) : 0;
        const endTs = endDate ? parseISO(endDate).setHours(23, 59, 59, 999) : Infinity;
        return processedData.filter(i => { if (!i.ts) return false; return i.ts >= startTs && i.ts <= endTs; });
    }, [processedData, startDate, endDate]);

    const dataLoadingCombined = authLoading || dataLoading;

    return {
        settings, setSettings,
        formSettings, setFormSettings,
        tenants,
        processedData,
        dataByPeriod,
        startDate, setStartDate,
        endDate, setEndDate,
        activeFilter, setActiveFilter,
        resetDates,
        loading: dataLoadingCombined,
        needsSetup,
        lastUpdated,
        refreshData: refetch,
        messages,
        rawData,
        addTenant,
        updateTenant,
        deleteTenant,
        refreshTenants: fetchTenants
    };
};
