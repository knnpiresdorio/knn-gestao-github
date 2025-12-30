import React, { useState } from 'react';
import {
    Settings, Database, Table, FileText, ChevronDown, ExternalLink, RefreshCw,
    Palette, DollarSign, Eye, EyeOff, Moon, Check, Upload, Download, FileSpreadsheet
} from 'lucide-react';
import { DEFAULT_CONFIG, THEME_BG_COLORS } from '../../utils/constants';

interface SettingsPageProps {
    settings: any;
    setSettings: (settings: any) => void;
    formSettings: any;
    setFormSettings: any; // Dispatch<SetStateAction<any>>
    loading: boolean;
    tenants: any[];
    handleCsvUpload: (e: React.ChangeEvent<HTMLInputElement>, field: 'base' | 'geral') => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({
    settings,
    setSettings,
    formSettings,
    setFormSettings,
    loading,
    tenants,
    handleCsvUpload
}) => {
    const currentThemeBg = THEME_BG_COLORS[settings.themeColor] || 'bg-violet-600';

    return (
        <div className="w-full h-full animate-in fade-in duration-300 flex flex-col">
            <div className="flex items-center justify-between mb-8 shrink-0">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${currentThemeBg} flex items-center justify-center text-white shadow-lg`}>
                        <Settings size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Configurações do Sistema</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie a conexão de dados e preferências visuais.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 overflow-auto custom-scrollbar pb-20">
                {/* FONTE DE DADOS (Main Column) */}
                <div className="xl:col-span-2">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 h-full">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-8 flex items-center gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg"><Database size={20} /></div>
                            <div>
                                <span className="block">Fonte de Dados</span>
                                <span className="text-xs font-normal text-slate-500 block mt-0.5">Conecte sua planilha Google Sheets.</span>
                            </div>
                        </h3>

                        <div className="space-y-6">
                            {/* SOURCE SELECTOR */}
                            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
                                <button onClick={() => setFormSettings((s: any) => ({ ...s, dataSource: 'google_sheets' }))} className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${formSettings.dataSource === 'google_sheets' ? 'bg-white dark:bg-slate-700 text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                    <Table size={14} /> Planilhas
                                </button>
                                <button onClick={() => setFormSettings((s: any) => ({ ...s, dataSource: 'supabase' }))} className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${formSettings.dataSource === 'supabase' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                    <Database size={14} /> Supabase
                                </button>
                                <button onClick={() => setFormSettings((s: any) => ({ ...s, dataSource: 'csv' }))} className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${formSettings.dataSource === 'csv' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                    <FileText size={14} /> CSV
                                </button>
                            </div>

                            {/* GOOGLE SHEETS INPUTS */}
                            {formSettings.dataSource === 'google_sheets' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">

                                    {/* TENANT SELECTOR */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Selecionar Unidade (Preenchimento Automático)</label>
                                        <div className="relative">
                                            <select
                                                className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:text-white appearance-none cursor-pointer"
                                                onChange={(e) => {
                                                    const selected = tenants.find(t => t.id === e.target.value);
                                                    if (selected) {
                                                        setFormSettings((s: any) => ({
                                                            ...s,
                                                            spreadsheetId: selected.spreadsheet_id,
                                                            sheetName: selected.sheet_name || DEFAULT_CONFIG.sheetName,
                                                            geralSheetId: selected.geral_sheet_id || DEFAULT_CONFIG.geralSheetId,
                                                            geralSheetName: selected.geral_sheet_name || DEFAULT_CONFIG.geralSheetName,
                                                            schoolName: selected.name,
                                                            themeColor: selected.theme_color || DEFAULT_CONFIG.themeColor
                                                        }));
                                                    }
                                                }}
                                            >
                                                <option value="">Selecione uma unidade...</option>
                                                {tenants.map(t => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><ChevronDown size={16} /></div>
                                        </div>
                                    </div>

                                    <div className="h-px bg-slate-100 dark:bg-slate-800"></div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Base Principal Financeiro</h4>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">ID da Planilha</label>
                                            <div className="relative">
                                                <input type="text" className="w-full text-sm font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-600 dark:text-slate-300 transition-all" value={formSettings.spreadsheetId} onChange={(e) => setFormSettings((s: any) => ({ ...s, spreadsheetId: e.target.value }))} />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><ExternalLink size={16} /></div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Nome da Aba</label>
                                                <input type="text" className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-600 dark:text-slate-300 transition-all font-mono" value={formSettings.sheetName} onChange={(e) => setFormSettings((s: any) => ({ ...s, sheetName: e.target.value }))} />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Nome da Empresa</label>
                                                <input type="text" className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-600 dark:text-slate-300 transition-all" value={formSettings.schoolName} onChange={(e) => setFormSettings((s: any) => ({ ...s, schoolName: e.target.value }))} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Base Geral Alunos</h4>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">ID da Planilha (Geral)</label>
                                            <div className="relative">
                                                <input type="text" className="w-full text-sm font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 text-slate-600 dark:text-slate-300 transition-all" value={formSettings.geralSheetId} onChange={(e) => setFormSettings((s: any) => ({ ...s, geralSheetId: e.target.value }))} />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><ExternalLink size={16} /></div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Nome da Aba (Geral)</label>
                                            <input type="text" className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 text-slate-600 dark:text-slate-300 transition-all font-mono" value={formSettings.geralSheetName} onChange={(e) => setFormSettings((s: any) => ({ ...s, geralSheetName: e.target.value }))} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SUPABASE INFO */}
                            {formSettings.dataSource === 'supabase' && (
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-300">
                                    <Database size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">Supabase Database</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto">Em breve sua aplicação estará conectada diretamente ao banco de dados Supabase para maior performance e segurança.</p>
                                </div>
                            )}

                            {/* CSV INFO */}
                            {formSettings.dataSource === 'csv' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <label className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 transition-colors cursor-pointer group text-center relative">
                                            <input type="file" accept=".csv" className="hidden" onChange={(e) => handleCsvUpload(e, 'base')} />
                                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform"><Upload size={18} /></div>
                                            <h5 className="text-xs font-bold text-slate-700 dark:text-slate-200">Base Principal CSV</h5>
                                            <p className="text-[10px] text-slate-400 mt-1">{formSettings.csvContent ? 'Arquivo Selecionado' : 'Clique para selecionar'}</p>
                                        </label>

                                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-600 transition-colors cursor-pointer group text-center opacity-50 pointer-events-none" title="Em breve">
                                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform"><Upload size={18} /></div>
                                            <h5 className="text-xs font-bold text-slate-700 dark:text-slate-200">Base Geral CSV</h5>
                                            <p className="text-[10px] text-slate-400 mt-1">Em breve</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 justify-center">
                                        <button className="text-[10px] text-blue-600 hover:underline flex items-center gap-1"><Download size={12} /> Modelo Base Principal</button>
                                        <button className="text-[10px] text-purple-600 hover:underline flex items-center gap-1"><Download size={12} /> Modelo Base Geral</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 flex justify-end transform translate-y-2">
                            <button
                                onClick={() => {
                                    setSettings(formSettings);
                                    alert('Configurações salvas! O sistema irá recarregar os dados agora.');
                                }}
                                className="flex items-center gap-2 px-6 py-3 bg-slate-800 dark:bg-slate-700 text-white text-sm font-bold rounded-xl hover:bg-slate-900 dark:hover:bg-slate-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-wait"
                                disabled={loading}
                            >
                                {loading ? <RefreshCw size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                                {loading ? 'Carregando...' : 'Salvar e Conectar'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* VISUAL & THEME (Side Column) */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg"><Palette size={20} /></div>
                            <div>
                                <span className="block">Interface e Visual</span>
                                <span className="text-xs font-normal text-slate-500 block mt-0.5">Personalize sua experiência de uso.</span>
                            </div>
                        </h3>
                        <div className="space-y-4">
                            {/* Centavos */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg"><DollarSign size={18} /></div>
                                    <div>
                                        <span className="block text-sm font-bold text-slate-700 dark:text-slate-200">Centavos</span>
                                        <span className="block text-xs text-slate-400">Exibir casas decimais</span>
                                    </div>
                                </div>
                                <button onClick={() => setFormSettings((s: any) => ({ ...s, showCents: !s.showCents }))} className={`w-11 h-6 rounded-full transition-colors relative ${formSettings.showCents ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formSettings.showCents ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                </button>
                            </div>

                            {/* Privacidade */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg"><EyeOff size={18} /></div>
                                    <div>
                                        <span className="block text-sm font-bold text-slate-700 dark:text-slate-200">Privacidade</span>
                                        <span className="block text-xs text-slate-400">Ocultar valores</span>
                                    </div>
                                </div>
                                <button onClick={() => setFormSettings((s: any) => ({ ...s, privacyMode: !s.privacyMode }))} className={`w-11 h-6 rounded-full transition-colors relative ${formSettings.privacyMode ? 'bg-slate-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formSettings.privacyMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                </button>
                            </div>

                            {/* Dark Mode */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg"><Moon size={18} /></div>
                                    <div>
                                        <span className="block text-sm font-bold text-slate-700 dark:text-slate-200">Modo Escuro</span>
                                        <span className="block text-xs text-slate-400">Alternar tema visual do sistema</span>
                                    </div>
                                </div>
                                <button onClick={() => setFormSettings((s: any) => ({ ...s, darkMode: !s.darkMode }))} className={`w-11 h-6 rounded-full transition-colors relative ${formSettings.darkMode ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formSettings.darkMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                </button>
                            </div>

                            {/* Separator */}
                            <div className="h-px bg-slate-100 dark:bg-slate-800 my-4"></div>

                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Cor de Destaque</label>
                            <div className="flex gap-2 justify-between">
                                {['blue', 'violet', 'emerald', 'rose', 'amber'].map(color => (
                                    <button key={color} onClick={() => setFormSettings((s: any) => ({ ...s, themeColor: color }))} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${formSettings.themeColor === color ? `bg-${color}-500 text-white shadow-lg shadow-${color}-500/40 ring-2 ring-offset-2 ring-${color}-500 dark:ring-offset-slate-900` : `bg-${color}-100 dark:bg-${color}-900/20 text-${color}-500 hover:bg-${color}-200`}`}>
                                        {formSettings.themeColor === color && <Check size={14} strokeWidth={3} />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
