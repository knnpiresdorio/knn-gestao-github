import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface AlertsModalProps {
    isOpen: boolean;
    onClose: () => void;
    alerts: { id: string; message: string }[];
}

const AlertsModal: React.FC<AlertsModalProps> = ({ isOpen, onClose, alerts }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-amber-50 dark:bg-amber-900/10">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                        <AlertTriangle size={20} />
                        <h3 className="font-bold text-lg">Alertas de Vencimento</h3>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-full transition-colors text-slate-500 dark:text-slate-400">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {alerts.length > 0 ? (
                        <div className="space-y-3">
                            {alerts.map((alert) => (
                                <div key={alert.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0"></div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{alert.message}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-8 text-center text-slate-400">
                            <p>Nenhum alerta pendente.</p>
                        </div>
                    )}
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
                    <button onClick={onClose} className="w-full py-2.5 bg-slate-800 dark:bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors">
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlertsModal;
