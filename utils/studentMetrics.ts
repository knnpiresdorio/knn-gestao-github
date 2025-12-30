import { parseCurrency } from './formatters';

export const calculateActiveBase = (students: any[]) => {
    const active = students.filter(s =>
        s.status === 'Ativo' || s.status === 'Inadimplente'
    ).length;
    return { active, total: students.length };
};

export const calculateChurnRate = (students: any[]) => {
    const { active } = calculateActiveBase(students);
    const churned = students.filter(s =>
        s.status === 'Desistente' || s.status === 'Evadido' || s.status === 'Cancelado'
    ).length;

    const total = active + churned;
    if (total === 0) return 0;

    return (churned / total) * 100;
};

export const calculateAverageTicket = (students: any[]) => {
    const activeStudents = students.filter(s =>
        s.status === 'Ativo' || s.status === 'Inadimplente'
    );

    if (activeStudents.length === 0) return 0;

    const totalValue = activeStudents.reduce((acc, curr) => {
        // Assuming 'valor_atual' is the column name based on user request.
        // Need to handle potential currency formatting if it comes as string "R$ 100,00"
        const val = typeof curr.valor_atual === 'number'
            ? curr.valor_atual
            : parseCurrency(curr.valor_atual || '0');
        return acc + val;
    }, 0);

    return totalValue / activeStudents.length;
};

export const calculateScholarshipImpact = (students: any[]) => {
    // Distribution of scholarships
    // Group by ranges: 0%, 1-10%, 11-30%, 31-50%, >50%
    const ranges = {
        '0%': 0,
        '1-10%': 0,
        '11-30%': 0,
        '31-50%': 0,
        '>50%': 0
    };

    students.forEach(s => {
        // Assuming 'bolsa' is a percentage string like "10%" or number
        let val = 0;
        if (typeof s.bolsa === 'string') {
            val = parseFloat(s.bolsa.replace('%', '').replace(',', '.')) || 0;
        } else {
            val = s.bolsa || 0;
        }

        if (val === 0) ranges['0%']++;
        else if (val <= 10) ranges['1-10%']++;
        else if (val <= 30) ranges['11-30%']++;
        else if (val <= 50) ranges['31-50%']++;
        else ranges['>50%']++;
    });

    return Object.entries(ranges).map(([name, value]) => ({ name, value }));
};

export const calculateStudentProfile = (students: any[]) => {
    // By Book (Level)
    const byBook: Record<string, number> = {};
    students.forEach(s => {
        // Determine level from 'livro' or 'estagio'
        const book = s.livro || s.estagio || 'Não Informado';
        byBook[book] = (byBook[book] || 0) + 1;
    });

    // Top 5 books + others
    const sortedBooks = Object.entries(byBook)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, value]) => ({ name, value }));

    return sortedBooks;
};
