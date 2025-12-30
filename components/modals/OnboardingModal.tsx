import React from 'react';
import { Settings, Database, ArrowRight, Sparkles, Layout } from 'lucide-react';

interface OnboardingModalProps {
    isOpen: boolean;
    onConfigure: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onConfigure }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-500">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-500">
                <div className="relative p-10 text-center space-y-8">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-500/10 blur-[80px] rounded-full"></div>

                    <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-2xl shadow-violet-500/20 rotate-12 transition-transform hover:rotate-0 duration-500">
                            <Sparkles size={40} />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-400 rounded-xl flex items-center justify-center text-amber-950 shadow-lg animate-bounce">
                            <Settings size={18} />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                            Bem-vindo ao <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">KNN Dashboard</span>
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
                            Para começar a visualizar seus indicadores, precisamos conectar seu banco de dados.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 text-left">
                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                                <Database size={20} />
                            </div>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Conecte Google Sheets ou suba um CSV</span>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
                                <Layout size={20} />
                            </div>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Visualize faturamento, retenção e muito mais</span>
                        </div>
                    </div>

                    <button
                        onClick={onConfigure}
                        className="group relative w-full flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-lg font-black rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-violet-500/20"
                    >
                        Configurar Primeira Unidade
                        <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                    </button>

                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                        O processo leva menos de 1 minuto.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OnboardingModal;
