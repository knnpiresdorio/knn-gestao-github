import { parseCurrency } from './formatters';

export const calculateActiveBase = (students: any[]) => {
    const active = students.filter(s => s.activeFlag === 1).length;
    const enrolled = students.filter(s => s.enrolledFlag === 1).length;
    return { active, enrolled, total: students.length };
};

export const calculateChurnRate = (students: any[]) => {
    const { active, enrolled } = calculateActiveBase(students);
    const finished = students.filter(s => s.finishedFlag === 1).length;
    const churned = students.filter(s => s.churnFlag === 1).length;

    // Denominator should include everyone who entered the base and either is still there, finished, or churned.
    const totalDenom = active + enrolled + finished + churned;
    if (totalDenom === 0) return { percentage: 0, absolute: 0, total: 0 };

    return {
        percentage: (churned / totalDenom) * 100,
        absolute: churned,
        total: totalDenom
    };
};

export const calculateAverageTicket = (students: any[]) => {
    const activeStudents = students.filter(s => s.activeFlag === 1);

    if (activeStudents.length === 0) return 0;

    const totalValue = activeStudents.reduce((acc, curr) => {
        // Use 'valor_atual' from Base Geral if available, otherwise fallback
        const rawVal = curr.valor_atual || curr['valor_atual'] || curr.currentValue || 0;
        const val = typeof rawVal === 'number'
            ? rawVal
            : parseCurrency(String(rawVal || '0'));
        return acc + val;
    }, 0);

    return totalValue / activeStudents.length;
};

export const calculateTicketDistribution = (students: any[]) => {
    const activeStudents = students.filter(s => s.activeFlag === 1);
    const counts = {
        under250: 0,
        between251And350: 0,
        between351And450: 0,
        over450: 0
    };

    activeStudents.forEach(s => {
        const rawVal = s.valor_atual || s['valor_atual'] || s.currentValue || 0;
        const val = typeof rawVal === 'number' ? rawVal : parseCurrency(String(rawVal || '0'));

        if (val <= 250) counts.under250++;
        else if (val <= 350) counts.between251And350++;
        else if (val <= 450) counts.between351And450++;
        else counts.over450++;
    });

    const total = activeStudents.length || 1;
    return [
        { label: 'Até R$ 250', value: counts.under250, percentage: (counts.under250 / total) * 100 },
        { label: 'R$ 251 - 350', value: counts.between251And350, percentage: (counts.between251And350 / total) * 100 },
        { label: 'R$ 351 - 450', value: counts.between351And450, percentage: (counts.between351And450 / total) * 100 },
        { label: '> R$ 450', value: counts.over450, percentage: (counts.over450 / total) * 100 },
    ];
};

export const calculateScholarshipImpact = (students: any[]) => {
    // Generate all 5% tiers from 0 to 100
    const tiers: string[] = [];
    for (let i = 0; i <= 100; i += 5) {
        tiers.push(`${i}%`);
    }

    const counts: Record<string, number> = {};
    const values: Record<string, number> = {};

    // Initialize
    tiers.forEach(t => {
        counts[t] = 0;
        values[t] = 0;
    });

    students.forEach(s => {
        let val = 0;
        if (typeof s.bolsa === 'string') {
            val = parseFloat(s.bolsa.replace('%', '').replace(',', '.')) || 0;
        } else {
            val = s.bolsa || 0;
        }

        const rawPayVal = s.valor_atual || s['valor_atual'] || s.currentValue || 0;
        const payVal = typeof rawPayVal === 'number' ? rawPayVal : parseCurrency(String(rawPayVal || '0'));

        // Snap to nearest 5%
        let snapped = Math.round(val / 5) * 5;
        // Clamp to 0-100
        if (snapped < 0) snapped = 0;
        if (snapped > 100) snapped = 100;

        const percentageStr = `${snapped}%`;

        // Safety check - should always be true since we initialized all 5% steps
        if (counts.hasOwnProperty(percentageStr)) {
            counts[percentageStr]++;
            values[percentageStr] += payVal;
        } else {
            // Fallback for weird edge cases, though snapped logic should cover it
            // Create bucket if missing (unlikely with 0-100 loop)
            counts[percentageStr] = 1;
            values[percentageStr] = payVal;
            // Add to tiers list so it shows up in chart if it wasn't there
            if (!tiers.includes(percentageStr)) tiers.push(percentageStr);
        }
    });

    // Sort tiers numerically to ensure chart order is correct
    const sortedTiers = tiers.sort((a, b) => parseInt(a) - parseInt(b));

    // Return the mapped data
    // We intentionally include all tiers (even 0 value) to maintain the linear scale appearance on the chart if desired,
    // or filter them. Based on user feedback about "missing data", showing all 5% increments is safer.
    return sortedTiers.map(name => ({
        name,
        value: counts[name] || 0,
        totalValue: values[name] || 0
    }));
};

export const calculateStudentProfile = (students: any[]) => {
    // By Book (Level)
    const byBook: Record<string, number> = {};
    students.forEach(s => {
        // Determine level from 'livro' or 'estagio'
        const book = s.livro || s.estagio || 'Não Informado';
        byBook[book] = (byBook[book] || 0) + 1;
    });

    return Object.entries(byBook)
        .sort(([, a], [, b]) => b - a)
        .map(([name, value]) => ({ name, value }));
};

export const calculatePaymentDayDistribution = (students: any[]) => {
    const byDay: Record<string, { count: number; value: number }> = {};

    students.forEach(s => {
        const day = String(s.dia_pagamento || s.paymentDay || 'Outros');
        if (!byDay[day]) byDay[day] = { count: 0, value: 0 };

        const rawVal = s.valor_atual || s['valor_atual'] || s.currentValue || 0;
        const val = typeof rawVal === 'number' ? rawVal : parseCurrency(String(rawVal || '0'));

        byDay[day].count += 1;
        byDay[day].value += val;
    });

    return Object.entries(byDay)
        .map(([name, stats]) => ({
            name: name === 'Outros' ? 'Outros' : `Dia ${name}`,
            count: stats.count,
            value: stats.value,
            // Sort helper
            sortKey: name === 'Outros' ? 99 : parseInt(name) || 0
        }))
        .sort((a, b) => a.sortKey - b.sortKey);
};
