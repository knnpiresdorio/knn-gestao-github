export const normalizeName = (name: string): string => {
    if (!name) return '';
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .trim();
};

export const cleanTransactionDescription = (description: string): string => {
    if (!description) return '';
    // Removes pattern like " 1/6", " 1/6[1]", " 12/12" from the end of string
    // Also handles cases where there might be spaces around matching parts
    return description
        .replace(/\s\d+\/\d+(\[\d+\])?$/, '') // Matches " 1/6" or " 1/6[1]" at end
        .trim();
};

export const mergeTransactionAndStudentData = (
    transactions: Record<string, string>[],
    students: Record<string, string>[]
) => {
    // 1. Create a map of normalized student names to student objects for O(1) lookup
    const studentMap = new Map<string, Record<string, string>>();

    students.forEach((student) => {
        const rawName = student['nome_completo_aluno'];
        if (rawName) {
            const normalized = normalizeName(rawName);
            // Handle duplicates if necessary, currently overwriting with last found
            studentMap.set(normalized, student);
        }
    });

    // 2. Iterate over transactions and look up student details
    return transactions.map((transaction) => {
        const description = transaction['descricao'];
        const type = transaction['categoria'];

        // Only attempt matching for relevant transaction types if needed, 
        // but user asked to merge info generally.

        const cleanedName = cleanTransactionDescription(description);
        const normalizedName = normalizeName(cleanedName);

        const studentMatch = studentMap.get(normalizedName);

        return {
            ...transaction,
            _merged_student_found: !!studentMatch,
            ...(studentMatch || {}) // Spread matching student data into transaction
        };
    });
};
