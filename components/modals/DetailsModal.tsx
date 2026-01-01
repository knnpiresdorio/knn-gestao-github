import React from 'react';
import { X, AlertCircle, AlertTriangle, Info, CheckCircle2, Copy, Send, Mail } from 'lucide-react';
import { SystemMessage } from '../../types/system';

interface DetailsModalProps {
    message: SystemMessage | null;
    onClose: () => void;
}

const DetailsModal: React.FC<DetailsModalProps> = ({ message, onClose }) => {
    if (!message) return null;

    const configs = {
        error: { icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10', title: 'Erro do Sistema' },
        warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', title: 'Aviso do Sistema' },
        success: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', title: 'Sucesso' },
        info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', title: 'Informação' }
    };

    const config = configs[message.type];
    const Icon = config.icon;

    const handleCopyDetails = () => {
        if (message.details || message.description) {
            navigator.clipboard.writeText(message.details || message.description);
            // Optionally add a toast here
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className={`px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between ${config.bg}`}>
                    <div className="flex items-center gap-3">
                        <Icon size={20} className={config.color} />
                        <h3 className="font-bold text-slate-900 dark:text-white">{message.title || config.title}</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {message.description}
                        </p>
                    </div>

                    {message.details && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detalhes Técnicos</label>
                                <button
                                    onClick={handleCopyDetails}
                                    className="flex items-center gap-1 text-[10px] font-bold text-blue-500 hover:text-blue-600 transition-colors uppercase"
                                >
                                    <Copy size={12} /> Copiar Detalhes
                                </button>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl">
                                <pre className="text-xs font-mono text-slate-500 dark:text-slate-400 whitespace-pre-wrap break-all max-h-40 overflow-y-auto custom-scrollbar">
                                    {message.details}
                                </pre>
                            </div>
                        </div>
                    )}

                    {/* Admin Contact Section */}
                    {message.type === 'error' && (
                        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl p-4">
                            <div className="flex gap-3">
                                <div className="p-2 bg-blue-500 rounded-lg text-white h-fit">
                                    <Mail size={16} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100">Contate o Administrador</h4>
                                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                                        Se este erro persistir, por favor envie os detalhes acima ao administrador do sistema para que possamos resolvê-lo o mais rápido possível.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        Fechar
                    </button>
                    {message.type === 'error' && (
                        <button
                            onClick={() => window.open('mailto:admin@exemplo.com?subject=Erro no Sistema KNN&body=' + encodeURIComponent(message.details || ''))}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-all flex items-center gap-2"
                        >
                            <Send size={16} /> Enviar p/ Admin
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DetailsModal;
