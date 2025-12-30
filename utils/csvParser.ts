
export const parseCSVLine = (line: string): string[] => {
    const values: string[] = [];
    let current = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (i < line.length - 1 && line[i + 1] === '"') { current += '"'; i++; } else { inQuote = !inQuote; }
        } else if (char === ',' && !inQuote) {
            values.push(current.trim().replace(/^"|"$/g, ''));
            current = '';
        } else { current += char; }
    }
    values.push(current.trim().replace(/^"|"$/g, ''));
    return values;
};

export const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return [];
    const headers = parseCSVLine(lines[0]);
    return lines.slice(1).map(line => {
        const values = parseCSVLine(line);
        return headers.reduce((acc, header, idx) => {
            acc[header] = values[idx] || '';
            return acc;
        }, {} as Record<string, string>);
    });
};
