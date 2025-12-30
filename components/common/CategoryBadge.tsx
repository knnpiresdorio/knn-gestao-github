import React from 'react';

interface CategoryBadgeProps {
    category: string;
    className?: string;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, className = '' }) => {
    return (
        <span className={`inline-flex px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide border border-slate-200 dark:border-slate-700 ${className}`}>
            {category}
        </span>
    );
};

export default CategoryBadge;
