/**
 * Data Export Utilities
 * Provides CSV, JSON, and PDF export functionality for dashboard data
 */

import type { PNode, NetworkStats, PerformanceHistory, StakingStats } from '@/types/pnode';

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export type ExportFormat = 'csv' | 'json' | 'pdf';

interface ExportOptions {
    filename: string;
    format: ExportFormat;
}

interface ColumnDefinition<T> {
    key: keyof T | string;
    header: string;
    formatter?: (value: unknown, row: T) => string;
}

// ============================================================
// CSV EXPORT
// ============================================================

/**
 * Escape CSV value - handles commas, quotes, and newlines
 */
function escapeCSV(value: unknown): string {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

/**
 * Get nested property value from object
 */
function getNestedValue<T>(obj: T, path: string): unknown {
    return path.split('.').reduce((acc: unknown, part) => {
        if (acc && typeof acc === 'object' && part in acc) {
            return (acc as Record<string, unknown>)[part];
        }
        return undefined;
    }, obj);
}

/**
 * Export data array to CSV format
 */
export function exportToCSV<T extends Record<string, unknown>>(
    data: T[],
    columns: ColumnDefinition<T>[],
    options: ExportOptions
): void {
    // Build header row
    const headers = columns.map(col => escapeCSV(col.header)).join(',');

    // Build data rows
    const rows = data.map(row => {
        return columns.map(col => {
            const value = getNestedValue(row, col.key as string);
            const formatted = col.formatter ? col.formatter(value, row) : value;
            return escapeCSV(formatted);
        }).join(',');
    });

    const csvContent = [headers, ...rows].join('\n');
    downloadFile(csvContent, `${options.filename}.csv`, 'text/csv;charset=utf-8;');
}

// ============================================================
// JSON EXPORT
// ============================================================

/**
 * Export data to formatted JSON
 */
export function exportToJSON<T>(
    data: T[],
    options: ExportOptions
): void {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, `${options.filename}.json`, 'application/json');
}

// ============================================================
// PDF EXPORT (Print-based)
// ============================================================

/**
 * Export data to PDF using browser print functionality
 */
export function exportToPDF<T extends Record<string, unknown>>(
    data: T[],
    columns: ColumnDefinition<T>[],
    options: ExportOptions & { title?: string }
): void {
    // Create a new window with printable content
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Please allow popups to export PDF');
        return;
    }

    const tableRows = data.map(row => {
        const cells = columns.map(col => {
            const value = getNestedValue(row, col.key as string);
            const formatted = col.formatter ? col.formatter(value, row) : String(value ?? '');
            return `<td style="padding: 8px; border: 1px solid #333;">${formatted}</td>`;
        }).join('');
        return `<tr>${cells}</tr>`;
    }).join('');

    const tableHeaders = columns.map(col =>
        `<th style="padding: 8px; border: 1px solid #333; background: #1a1a2e; color: #fff;">${col.header}</th>`
    ).join('');

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${options.title || options.filename}</title>
      <style>
        body {
          font-family: 'Roboto Mono', monospace;
          background: #0f0f1a;
          color: #e0e0e0;
          padding: 20px;
        }
        h1 {
          color: #8b5cf6;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        .meta {
          color: #888;
          margin-bottom: 20px;
          font-size: 12px;
        }
        @media print {
          body { background: white; color: black; }
          th { background: #f0f0f0 !important; color: black !important; }
        }
      </style>
    </head>
    <body>
      <h1>${options.title || 'Xandeum pNode Analytics Export'}</h1>
      <div class="meta">
        Generated: ${new Date().toLocaleString()}<br/>
        Total Records: ${data.length}
      </div>
      <table>
        <thead><tr>${tableHeaders}</tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() { window.close(); };
        };
      </script>
    </body>
    </html>
  `;

    printWindow.document.write(html);
    printWindow.document.close();
}

// ============================================================
// FILE DOWNLOAD HELPER
// ============================================================

/**
 * Trigger file download in browser
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

// ============================================================
// PNODE EXPORT CONFIGURATIONS
// ============================================================

/**
 * Column definitions for pNode data export
 */
export const pNodeColumns: ColumnDefinition<PNode>[] = [
    { key: 'pubkey', header: 'Public Key' },
    { key: 'status', header: 'Status' },
    { key: 'performance.score', header: 'Score', formatter: (v) => Number(v).toFixed(1) },
    { key: 'performance.tier', header: 'Tier' },
    { key: 'uptime', header: 'Uptime (%)', formatter: (v) => Number(v).toFixed(1) },
    { key: 'metrics.responseTimeMs', header: 'Latency (ms)', formatter: (v) => Number(v).toFixed(0) },
    { key: 'metrics.storageCapacityGB', header: 'Storage (GB)', formatter: (v) => Number(v).toFixed(0) },
    { key: 'metrics.storageUsedGB', header: 'Used (GB)', formatter: (v) => Number(v).toFixed(0) },
    { key: 'location.city', header: 'City' },
    { key: 'location.country', header: 'Country' },
    { key: 'location.countryCode', header: 'Country Code' },
    { key: 'version', header: 'Version' },
    { key: 'gossip.peersConnected', header: 'Peers' },
    { key: 'staking.commission', header: 'Commission (%)', formatter: (v) => v !== undefined ? String(v) : 'N/A' },
    { key: 'staking.apy', header: 'APY (%)', formatter: (v) => v !== undefined ? Number(v).toFixed(2) : 'N/A' },
    { key: 'credits', header: 'Credits', formatter: (v) => v !== undefined ? Number(v).toLocaleString() : 'N/A' },
    { key: 'creditsRank', header: 'Rank', formatter: (v) => v !== undefined ? String(v) : 'N/A' },
];

/**
 * Export pNodes data
 */
export function exportPNodes(
    nodes: PNode[],
    format: ExportFormat,
    filename: string = 'xandeum-pnodes'
): void {
    const timestamp = new Date().toISOString().split('T')[0];
    const fullFilename = `${filename}-${timestamp}`;

    switch (format) {
        case 'csv':
            exportToCSV(nodes as unknown as Record<string, unknown>[], pNodeColumns as unknown as ColumnDefinition<Record<string, unknown>>[], { filename: fullFilename, format });
            break;
        case 'json':
            exportToJSON(nodes, { filename: fullFilename, format });
            break;
        case 'pdf':
            exportToPDF(nodes as unknown as Record<string, unknown>[], pNodeColumns as unknown as ColumnDefinition<Record<string, unknown>>[], { filename: fullFilename, format, title: 'Xandeum pNodes Export' });
            break;
    }
}

/**
 * Column definitions for analytics/performance history
 */
export const performanceHistoryColumns: ColumnDefinition<PerformanceHistory>[] = [
    { key: 'timestamp', header: 'Timestamp', formatter: (v) => new Date(String(v)).toLocaleString() },
    { key: 'totalNodes', header: 'Total Nodes' },
    { key: 'onlineNodes', header: 'Online Nodes' },
    { key: 'avgResponseTime', header: 'Avg Response (ms)', formatter: (v) => Number(v).toFixed(1) },
    { key: 'storageUsedTB', header: 'Storage Used (TB)', formatter: (v) => Number(v).toFixed(2) },
    { key: 'gossipMessages', header: 'Gossip Messages', formatter: (v) => Number(v).toLocaleString() },
];

/**
 * Export performance history data
 */
export function exportPerformanceHistory(
    history: PerformanceHistory[],
    format: ExportFormat,
    filename: string = 'xandeum-analytics'
): void {
    const timestamp = new Date().toISOString().split('T')[0];
    const fullFilename = `${filename}-${timestamp}`;

    switch (format) {
        case 'csv':
            exportToCSV(history as unknown as Record<string, unknown>[], performanceHistoryColumns as unknown as ColumnDefinition<Record<string, unknown>>[], { filename: fullFilename, format });
            break;
        case 'json':
            exportToJSON(history, { filename: fullFilename, format });
            break;
        case 'pdf':
            exportToPDF(history as unknown as Record<string, unknown>[], performanceHistoryColumns as unknown as ColumnDefinition<Record<string, unknown>>[], { filename: fullFilename, format, title: 'Xandeum Analytics Export' });
            break;
    }
}
