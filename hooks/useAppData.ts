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
    const [settings, setSettings] = useState({ ...DEFAULT_CONFIG, csvContent: '' });
    const [formSettings, setFormSettings] = useState({ ...DEFAULT_CONFIG, csvContent: '' });

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
    useEffect(() => {
        const fetchTenants = async () => {
            const { data } = await supabase.from('tenants').select('*').order('name');
            if (data) setTenants(data);
        };
        fetchTenants();
    }, []);

    // --- DATA FETCHING ---
    const { data: baseData, geralData, loading: dataLoading, error, lastUpdated, refetch } = useSheetData(settings, !authLoading);

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
            const rawStatus = item['Status'] || item['status'] || 'Pendente';
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
        lastUpdated,
        refreshData: refetch,
        error,
        rawData
    };
};
