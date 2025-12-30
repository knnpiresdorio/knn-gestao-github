import React, { memo } from 'react';
import { LucideIcon, ChevronRight } from 'lucide-react';
import { THEME_BG_COLORS } from '../../utils/constants';

interface MenuItemProps {
    icon: LucideIcon;
    label: string;
    active: boolean;
    onClick: () => void;
    collapsed: boolean;
    theme: string;
}

const MenuItem = memo(({ icon: Icon, label, active, onClick, collapsed, theme }: MenuItemProps) => {
    const activeClass = THEME_BG_COLORS[theme] || 'bg-violet-600';
    return (
        <div onClick={onClick} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all mb-1 ${active ? `${activeClass} text-white shadow-lg ${collapsed ? '' : 'translate-x-1'}` : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white hover:translate-x-1'} ${collapsed ? 'justify-center px-0' : ''}`} title={collapsed ? label : ''}>
            <Icon size={18} />
            {!collapsed && <span className="text-sm font-medium whitespace-nowrap">{label}</span>}
            {active && !collapsed && <ChevronRight size={14} className="ml-auto opacity-50" />}
        </div>
    );
});

export default MenuItem;
