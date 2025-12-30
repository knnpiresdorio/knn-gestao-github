import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, ExternalLink, X } from 'lucide-react';
import { SystemMessage } from '../../types/system';

interface SystemAlertProps {
    message: SystemMessage;
    onClose?: () => void;
    onOpenDetails?: (message: SystemMessage) => void;
}

const SystemAlert: React.FC<SystemAlertProps> = ({ message, onClose, onOpenDetails }) => {
    const configs = {
        error: {
            bg: 'bg-rose-50 dark:bg-rose-500/10',
            border: 'border-rose-200 dark:border-rose-500/20',
            accent: 'bg-rose-500',
            icon: AlertCircle,
            iconColor: 'text-rose-500',
            titleColor: 'text-rose-900 dark:text-rose-100',
            descColor: 'text-rose-700 dark:text-rose-300',
            linkColor: 'text-rose-600 dark:text-rose-400',
            tagBg: 'bg-rose-100 dark:bg-rose-500/20',
            tagText: 'text-rose-600 dark:text-rose-400'
        },
        warning: {
            bg: 'bg-amber-50 dark:bg-amber-500/10',
            border: 'border-amber-200 dark:border-amber-500/20',
            accent: 'bg-amber-500',
            icon: AlertTriangle,
            iconColor: 'text-amber-500',
            titleColor: 'text-amber-900 dark:text-amber-100',
            descColor: 'text-amber-700 dark:text-amber-300',
            linkColor: 'text-amber-600 dark:text-amber-400',
            tagBg: 'bg-amber-100 dark:bg-amber-500/20',
            tagText: 'text-amber-600 dark:text-amber-400'
        },
        success: {
            bg: 'bg-emerald-50 dark:bg-emerald-500/10',
            border: 'border-emerald-200 dark:border-emerald-500/20',
            accent: 'bg-emerald-500',
            icon: CheckCircle2,
            iconColor: 'text-emerald-500',
            titleColor: 'text-emerald-900 dark:text-emerald-100',
            descColor: 'text-emerald-700 dark:text-emerald-300',
            linkColor: 'text-emerald-600 dark:text-emerald-400',
            tagBg: 'bg-emerald-100 dark:bg-emerald-500/20',
            tagText: 'text-emerald-600 dark:text-emerald-400'
        },
        info: {
            bg: 'bg-blue-50 dark:bg-blue-500/10',
            border: 'border-blue-200 dark:border-blue-500/20',
            accent: 'bg-blue-500',
            icon: Info,
            iconColor: 'text-blue-500',
            titleColor: 'text-blue-900 dark:text-blue-100',
            descColor: 'text-blue-700 dark:text-blue-300',
            linkColor: 'text-blue-600 dark:text-blue-400',
            tagBg: 'bg-blue-100 dark:bg-blue-500/20',
            tagText: 'text-blue-600 dark:text-blue-400'
        }
    };

    const config = configs[message.type];
    const Icon = config.icon;

    return (
        <div className={`relative flex flex-col md:flex-row gap-4 p-5 rounded-xl border-l-4 ${config.bg} ${config.border} border-l-${message.type}-500 shadow-sm animate-in slide-in-from-top-2 duration-300`}>
            {/* Visual Accent from Reference Image */}
            <div className={`absolute left-[-4px] top-0 bottom-0 w-1 ${config.accent} rounded-l-xl`}></div>

            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <Icon size={18} className={config.iconColor} />
                    <h4 className={`font-bold text-sm ${config.titleColor}`}>{message.title}</h4>
                </div>

                <p className={`text-xs ${config.descColor} mb-4 leading-relaxed max-w-2xl`}>
                    {message.description}
                </p>

                <div className="flex flex-wrap items-center gap-3">
                    {onOpenDetails && (
                        <button
                            onClick={() => onOpenDetails(message)}
                            className={`flex items-center gap-1.5 text-xs font-bold ${config.linkColor} hover:underline transition-all`}
                        >
                            Ler mais <ExternalLink size={14} />
                        </button>
                    )}

                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${config.tagBg} ${config.tagText}`}>
                            {message.type === 'error' ? 'Erro' : message.type === 'warning' ? 'Aviso' : message.type === 'success' ? 'Sucesso' : 'Info'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            Padrão
                        </span>
                    </div>

                    <div className="flex-1 md:hidden"></div>

                    {message.type === 'info' ? (
                        <button
                            onClick={onClose}
                            className={`text-xs font-bold ${config.linkColor} hover:underline transition-all`}
                        >
                            Dismiss
                        </button>
                    ) : (
                        <button
                            onClick={() => onOpenDetails?.(message)}
                            className={`text-xs font-bold ${config.linkColor} hover:underline transition-all ml-auto md:ml-0`}
                        >
                            See
                        </button>
                    )}
                </div>
            </div>

            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                    <X size={16} />
                </button>
            )}
        </div>
    );
};

export default SystemAlert;
