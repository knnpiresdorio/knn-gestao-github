import React, { useState } from 'react';
import {
    Settings, Database, Table, FileText, ChevronDown, ExternalLink, RefreshCw,
    Palette, DollarSign, Eye, EyeOff, Moon, Check, Upload, Download, FileSpreadsheet, Plus, Trash2, AlertTriangle
} from 'lucide-react';
import { DEFAULT_CONFIG, THEME_BG_COLORS } from '../../utils/constants';
import AddUnitModal from '../modals/AddUnitModal';

interface SettingsPageProps {
    settings: any;
    setSettings: (settings: any) => void;
    formSettings: any;
    setFormSettings: any; // Dispatch<SetStateAction<any>>
    loading: boolean;
    tenants: any[];
    handleCsvUpload: (e: React.ChangeEvent<HTMLInputElement>, field: 'base' | 'geral') => void;
    onAddTenant?: (tenant: any) => Promise<void>;
    onUpdateTenant?: (id: string, tenant: any) => Promise<void>;
    onDeleteTenant?: (id: string) => Promise<void>;
}

const SettingsPage: React.FC<SettingsPageProps> = ({
    settings,
    setSettings,
    formSettings,
    setFormSettings,
    loading,
    tenants,
    handleCsvUpload,
    onAddTenant,
    onUpdateTenant,
    onDeleteTenant
}) => {
    const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState<any>(null);
    const [deletingUnit, setDeletingUnit] = useState<any>(null);
    const currentThemeBg = THEME_BG_COLORS[settings.themeColor] || 'bg-violet-600';

    return (
        <div className="p-6 md:p-8 w-full h-full animate-in fade-in duration-300 flex flex-col gap-4">
            {/* COMPACT HEADER */}
            <div className="flex items-center gap-3 mb-2 shrink-0">
                <div className={`w-10 h-10 rounded-lg ${currentThemeBg} flex items-center justify-center text-white shadow-lg`}>
                    <Settings size={20} />
                </div>
                <div className="flex flex-col">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">Configurações do Sistema</h2>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Gerencie a conexão de dados e preferências visuais.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 overflow-auto custom-scrollbar pb-20">
                {/* FONTE DE DADOS (Main Column) */}
                <div className="xl:col-span-2">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 h-full">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-8 flex items-center gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg"><Database size={20} /></div>
                            <div>
                                <span className="block">Fonte de Dados</span>
                                <span className="text-xs font-normal text-slate-500 block mt-0.5">
                                    {formSettings.dataSource === 'google_sheets'
                                        ? 'Conecte sua planilha Google Sheets em tempo real.'
                                        : 'Carregue arquivos locais para análise rápida.'}
                                </span>
                            </div>
                        </h3>

                        <div className="space-y-6">
                            {/* SOURCE SELECTOR */}
                            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
                                <button onClick={() => setFormSettings((s: any) => ({ ...s, dataSource: 'google_sheets' }))} className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${formSettings.dataSource === 'google_sheets' ? 'bg-white dark:bg-slate-700 text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                    <Table size={14} /> Google Sheets
                                </button>
                                <button onClick={() => setFormSettings((s: any) => ({ ...s, dataSource: 'csv' }))} className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${formSettings.dataSource === 'csv' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                    <FileText size={14} /> CSV
                                </button>
                            </div>

                            {/* GOOGLE SHEETS INPUTS */}
                            {formSettings.dataSource === 'google_sheets' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">

                                    {/* TENANT SELECTOR - Only for Google Sheets */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Selecionar Unidade (Preenchimento Automático)</label>
                                            <div className="flex items-center gap-2">
                                                {formSettings.tenantId && (
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            onClick={() => {
                                                                const unit = tenants.find(t => String(t.id) === String(formSettings.tenantId));
                                                                if (unit) {
                                                                    setEditingUnit(unit);
                                                                    setIsAddUnitModalOpen(true);
                                                                }
                                                            }}
                                                            className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-bold transition-all border border-blue-100 dark:border-blue-900/30"
                                                        >
                                                            <Settings size={12} /> Editar Unidade
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                const unit = tenants.find(t => String(t.id) === String(formSettings.tenantId));
                                                                if (unit) {
                                                                    setDeletingUnit(unit);
                                                                    setIsDeleteModalOpen(true);
                                                                }
                                                            }}
                                                            className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg text-[10px] font-bold transition-all border border-rose-100 dark:border-rose-900/30"
                                                            title="Excluir Unidade"
                                                        >
                                                            <Trash2 size={12} /> Excluir Unidade
                                                        </button>
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        setEditingUnit(null);
                                                        setIsAddUnitModalOpen(true);
                                                    }}
                                                    className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-bold transition-all border border-emerald-100 dark:border-emerald-900/30"
                                                >
                                                    <Plus size={12} /> Adicionar Unidade
                                                </button>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <select
                                                className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:text-white appearance-none cursor-pointer"
                                                value={formSettings.tenantId || ''}
                                                onChange={(e) => {
                                                    const selected = tenants.find(t => String(t.id) === String(e.target.value));
                                                    if (selected) {
                                                        setFormSettings((s: any) => ({
                                                            ...s,
                                                            spreadsheetId: selected.spreadsheet_id,
                                                            sheetName: selected.sheet_name || DEFAULT_CONFIG.sheetName,
                                                            geralSheetId: selected.geral_sheet_id || DEFAULT_CONFIG.geralSheetId,
                                                            geralSheetName: selected.geral_sheet_name || DEFAULT_CONFIG.geralSheetName,
                                                            schoolName: selected.name,
                                                            themeColor: selected.theme_color || DEFAULT_CONFIG.themeColor,
                                                            tenantId: selected.id
                                                        }));
                                                    } else {
                                                        setFormSettings((s: any) => ({ ...s, tenantId: '' }));
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
                                            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 flex items-center gap-2">
                                                ID da Planilha <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[9px] lowercase font-normal">automático</span>
                                            </label>
                                            <div className="relative group/field">
                                                <input
                                                    type="text"
                                                    readOnly
                                                    className="w-full text-sm font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none text-slate-400 dark:text-slate-500 transition-all cursor-not-allowed"
                                                    value={formSettings.spreadsheetId}
                                                    placeholder="Selecione uma unidade acima..."
                                                />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300"><ExternalLink size={16} /></div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Nome da Aba</label>
                                                <input
                                                    type="text"
                                                    readOnly
                                                    className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none text-slate-400 dark:text-slate-500 transition-all font-mono cursor-not-allowed"
                                                    value={formSettings.sheetName}
                                                    placeholder="Automático"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Nome da Empresa</label>
                                                <input
                                                    type="text"
                                                    readOnly
                                                    className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none text-slate-400 dark:text-slate-500 transition-all cursor-not-allowed"
                                                    value={formSettings.schoolName}
                                                    placeholder="Automático"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Base Geral Alunos</h4>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 flex items-center gap-2">
                                                ID da Planilha (Geral) <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[9px] lowercase font-normal">automático</span>
                                            </label>
                                            <div className="relative group/field">
                                                <input
                                                    type="text"
                                                    readOnly
                                                    className="w-full text-sm font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none text-slate-400 dark:text-slate-500 transition-all cursor-not-allowed"
                                                    value={formSettings.geralSheetId}
                                                    placeholder="Selecione uma unidade acima..."
                                                />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300"><ExternalLink size={16} /></div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Nome da Aba (Geral)</label>
                                            <input
                                                type="text"
                                                readOnly
                                                className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none text-slate-400 dark:text-slate-500 transition-all font-mono cursor-not-allowed"
                                                value={formSettings.geralSheetName}
                                                placeholder="Automático"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}


                            {/* CSV INFO */}
                            {formSettings.dataSource === 'csv' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <label className={`bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border-2 border-dashed transition-colors cursor-pointer group text-center relative ${formSettings.csvContent ? 'border-blue-500 bg-blue-50/10' : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600'}`}>
                                            <input type="file" accept=".csv" className="hidden" onChange={(e) => handleCsvUpload(e, 'base')} />
                                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                                {formSettings.csvContent ? <Check size={18} /> : <Upload size={18} />}
                                            </div>
                                            <h5 className="text-xs font-bold text-slate-700 dark:text-slate-200">Base Principal CSV</h5>
                                            <p className="text-[10px] text-slate-400 mt-1">{formSettings.csvContent ? 'Arquivo Selecionado' : 'Clique para selecionar'}</p>
                                        </label>

                                        <label className={`bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border-2 border-dashed transition-colors cursor-pointer group text-center relative ${formSettings.csvGeralContent ? 'border-purple-500 bg-purple-50/10' : 'border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-600'}`}>
                                            <input type="file" accept=".csv" className="hidden" onChange={(e) => handleCsvUpload(e, 'geral')} />
                                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                                {formSettings.csvGeralContent ? <Check size={18} /> : <Upload size={18} />}
                                            </div>
                                            <h5 className="text-xs font-bold text-slate-700 dark:text-slate-200">Base Geral CSV</h5>
                                            <p className="text-[10px] text-slate-400 mt-1">{formSettings.csvGeralContent ? 'Arquivo Selecionado' : 'Clique para selecionar'}</p>
                                        </label>
                                    </div>

                                    <div className="flex gap-4 justify-center">
                                        <a
                                            href="/files/modeloBasePrincipal_FluxodeCaixa_EntradasSaidas_KNN.xlsx"
                                            download
                                            className="text-[10px] text-blue-600 hover:underline flex items-center gap-1"
                                        >
                                            <Download size={12} /> Modelo Base Principal
                                        </a>
                                        <a
                                            href="/files/modeloBaseGeral_AlunoInfo_KNN.xlsx"
                                            download
                                            className="text-[10px] text-purple-600 hover:underline flex items-center gap-1"
                                        >
                                            <Download size={12} /> Modelo Base Geral
                                        </a>
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
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
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
                                <button onClick={() => setSettings((s: any) => ({ ...s, showCents: !s.showCents }))} className={`w-11 h-6 rounded-full transition-colors relative ${settings.showCents ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.showCents ? 'translate-x-5' : 'translate-x-0'}`}></div>
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
                                <button onClick={() => setSettings((s: any) => ({ ...s, privacyMode: !s.privacyMode }))} className={`w-11 h-6 rounded-full transition-colors relative ${settings.privacyMode ? 'bg-slate-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.privacyMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
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
                                <button onClick={() => setSettings((s: any) => ({ ...s, darkMode: !s.darkMode }))} className={`w-11 h-6 rounded-full transition-colors relative ${settings.darkMode ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.darkMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                </button>
                            </div>


                        </div>
                    </div>
                </div>
            </div>
            <AddUnitModal
                isOpen={isAddUnitModalOpen}
                initialData={editingUnit}
                onClose={() => setIsAddUnitModalOpen(false)}
                onSave={async (data) => {
                    if (editingUnit) {
                        if (onUpdateTenant) await onUpdateTenant(editingUnit.id, data);
                    } else {
                        if (onAddTenant) await onAddTenant(data);
                    }
                }}
            />
            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && deletingUnit && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 text-center space-y-6">
                            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
                                <AlertTriangle size={32} />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Excluir Unidade?</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Esta ação não pode ser desfeita. Todas as configurações da unidade <span className="font-bold text-slate-700 dark:text-slate-200">"{deletingUnit.name}"</span> serão removidas.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        setIsDeleteModalOpen(false);
                                        setDeletingUnit(null);
                                    }}
                                    className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-sans"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={async () => {
                                        if (onDeleteTenant) {
                                            try {
                                                await onDeleteTenant(deletingUnit.id);
                                                setIsDeleteModalOpen(false);
                                                setDeletingUnit(null);
                                                alert('Unidade excluída com sucesso.');
                                            } catch (error: any) {
                                                alert('Erro ao excluir unidade: ' + error.message);
                                            }
                                        }
                                    }}
                                    className="flex-1 px-6 py-3 bg-rose-600 text-white text-sm font-bold rounded-xl hover:bg-rose-700 transition-all font-sans shadow-lg shadow-rose-500/20"
                                >
                                    Confirmar Exclusão
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;
