import React from 'react';
import { STATUS_STYLES } from '../../utils/constants';

interface StatusBadgeProps {
    status: string;
    className?: string; // Allow overriding/adding classes if needed
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
    const style = STATUS_STYLES[status] || STATUS_STYLES['Default'];
    const label = status === '' ? 'Sem Status' : status;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${style.bg} ${style.text} ${className}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
            {label}
        </span>
    );
};

export default StatusBadge;
