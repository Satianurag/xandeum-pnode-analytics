
const escapeCSV = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

self.onmessage = (e: MessageEvent) => {
    const { type, data, columns } = e.data;

    try {
        if (type === 'json') {
            const jsonString = JSON.stringify(data, null, 2);
            self.postMessage({ type: 'success', result: jsonString });
        } else if (type === 'csv') {
            if (!columns) throw new Error('Columns definition required for CSV export');

            // Build header
            const headers = columns.map((c: any) => escapeCSV(c.header)).join(',');

            // Build rows
            const rows = data.map((row: any) => {
                return columns.map((col: any) => {
                    // We expect data to be already flattened/pre-processed or match the key
                    // But to be safe and simple, we blindly access row[col.key] 
                    // or assume the caller passed flattened objects.
                    // Let's assume the caller passes fully prepared objects where keys match.
                    return escapeCSV(row[col.key]);
                }).join(',');
            }).join('\n');

            const csvContent = `${headers}\n${rows}`;
            self.postMessage({ type: 'success', result: csvContent });
        }
    } catch (error) {
        self.postMessage({ type: 'error', error: String(error) });
    }
};
