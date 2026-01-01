import React, { useState } from 'react';
import { X, Building2, Table, FileText, Save, Loader2, Link2 } from 'lucide-react';

interface AddUnitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (tenant: any) => Promise<void>;
    initialData?: any;
}

const AddUnitModal: React.FC<AddUnitModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        spreadsheet_id: '',
        sheet_name: 'Base_looker',
        geral_sheet_id: '',
        geral_sheet_name: 'Geral',
        theme_color: 'violet'
    });

    React.useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                spreadsheet_id: initialData.spreadsheet_id || '',
                sheet_name: initialData.sheet_name || 'Base_looker',
                geral_sheet_id: initialData.geral_sheet_id || '',
                geral_sheet_name: initialData.geral_sheet_name || 'Geral',
                theme_color: initialData.theme_color || 'violet'
            });
        } else {
            setFormData({
                name: '',
                spreadsheet_id: '',
                sheet_name: 'Base_looker',
                geral_sheet_id: '',
                geral_sheet_name: 'Geral',
                theme_color: 'violet'
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error: any) {
            alert('Erro ao salvar unidade: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-violet-100 dark:bg-violet-900/30 text-violet-600 rounded-xl">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                {initialData ? 'Editar Unidade' : 'Adicionar Nova Unidade'}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {initialData ? `Editando configurações de ${initialData.name}` : 'Configure os acessos às planilhas do Google.'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Unit Name */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Building2 size={12} /> Nome da Unidade
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="Ex: KNN Pires do Rio"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 dark:text-white transition-all font-medium"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Financial Base */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Base Principal Financeiro</h4>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">ID da Planilha</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Link2 size={14} /></div>
                                    <input
                                        required
                                        type="text"
                                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-[13px] font-mono outline-none focus:border-blue-500 dark:text-slate-300"
                                        value={formData.spreadsheet_id}
                                        onChange={(e) => setFormData({ ...formData, spreadsheet_id: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Nome da Aba</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Table size={14} /></div>
                                    <input
                                        required
                                        type="text"
                                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-[13px] font-mono outline-none focus:border-blue-500 dark:text-slate-300"
                                        value={formData.sheet_name}
                                        onChange={(e) => setFormData({ ...formData, sheet_name: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Students Base */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Base Geral Alunos</h4>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">ID da Planilha (Geral)</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Link2 size={14} /></div>
                                    <input
                                        required
                                        type="text"
                                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-[13px] font-mono outline-none focus:border-purple-500 dark:text-slate-300"
                                        value={formData.geral_sheet_id}
                                        onChange={(e) => setFormData({ ...formData, geral_sheet_id: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Nome da Aba (Geral)</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Table size={14} /></div>
                                    <input
                                        required
                                        type="text"
                                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-[13px] font-mono outline-none focus:border-purple-500 dark:text-slate-300"
                                        value={formData.geral_sheet_name}
                                        onChange={(e) => setFormData({ ...formData, geral_sheet_name: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>



                    {/* Footer */}
                    <div className="pt-6 flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.name || !formData.spreadsheet_id}
                            className="flex items-center gap-2 px-8 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {initialData ? 'Atualizar Unidade' : 'Salvar Unidade'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUnitModal;
