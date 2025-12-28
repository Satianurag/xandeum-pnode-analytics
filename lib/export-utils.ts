/**
 * Data Export Utilities
 * Provides secure and performant CSV, JSON, and PDF export functionality
 * Dec 2025 Standard: Uses Web Workers for serialization and @react-pdf/renderer for PDFs
 */

import { saveAs } from 'file-saver';
import { pdf } from '@react-pdf/renderer';
import { createElement } from 'react';
import type { PNode, PerformanceHistory } from '@/types/pnode';
import { ExportPDFDocument } from '@/components/dashboard/export-button/PDFDocument';

export type ExportFormat = 'csv' | 'json' | 'pdf';

interface ColumnDefinition<T> {
    key: keyof T | string;
    header: string;
    formatter?: (value: unknown, row: T) => string;
}

// ============================================================
// COLUMN DEFINITIONS
// ============================================================

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

export const performanceHistoryColumns: ColumnDefinition<PerformanceHistory>[] = [
    { key: 'timestamp', header: 'Timestamp', formatter: (v) => new Date(String(v)).toLocaleString() },
    { key: 'totalNodes', header: 'Total Nodes' },
    { key: 'onlineNodes', header: 'Online Nodes' },
    { key: 'avgResponseTime', header: 'Avg Response (ms)', formatter: (v) => Number(v).toFixed(1) },
    { key: 'storageUsedTB', header: 'Storage Used (TB)', formatter: (v) => Number(v).toFixed(2) },
    { key: 'gossipMessages', header: 'Gossip Messages', formatter: (v) => Number(v).toLocaleString() },
];

// ============================================================
// INTERNAL HELPERS
// ============================================================

function getNestedValue<T>(obj: T, path: string): unknown {
    return path.split('.').reduce((acc: unknown, part) => {
        if (acc && typeof acc === 'object' && part in acc) {
            return (acc as Record<string, unknown>)[part];
        }
        return undefined;
    }, obj);
}

/**
 * Pre-processes data by applying formatters.
 * This ensures the Worker/PDF receives simple, flat string/number data.
 */
function prepareDataForExport<T>(data: T[], columns: ColumnDefinition<T>[]) {
    return data.map(row => {
        const processedRow: Record<string, string | number | null> = {};
        columns.forEach(col => {
            const rawValue = getNestedValue(row, col.key as string);
            const value = col.formatter
                ? col.formatter(rawValue, row)
                : (rawValue as string | number | null);
            processedRow[col.key as string] = value;
        });
        return processedRow;
    });
}

/**
 * Handles CSV and JSON export using a Web Worker
 */
async function exportWithWorker(
    data: any[],
    columns: ColumnDefinition<any>[],
    format: 'csv' | 'json',
    filename: string
) {
    if (typeof Worker === 'undefined') {
        alert('Web Workers are not supported in this browser.');
        return;
    }

    const worker = new Worker(new URL('./workers/export.worker.ts', import.meta.url));

    return new Promise<void>((resolve, reject) => {
        worker.onmessage = (e) => {
            const { type, result, error } = e.data;
            if (type === 'success') {
                const mimeType = format === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json';
                const blob = new Blob([result], { type: mimeType });
                saveAs(blob, `${filename}.${format}`);
                worker.terminate();
                resolve();
            } else {
                worker.terminate();
                reject(new Error(error || 'Export failed'));
            }
        };

        worker.onerror = (err) => {
            worker.terminate();
            reject(err);
        };

        worker.postMessage({
            type: format,
            data: prepareDataForExport(data, columns),
            columns: columns.map(c => ({ key: c.key as string, header: c.header })) // Strip functions
        });
    });
}

/**
 * Handles PDF export using @react-pdf/renderer
 */
async function exportToPDF(
    data: any[],
    columns: ColumnDefinition<any>[],
    filename: string,
    title: string
) {
    const processedData = prepareDataForExport(data, columns);
    // Remove complex keys for the PDF component props, it just needs key string
    const simpleColumns = columns.map(c => ({ header: c.header, key: c.key as string }));

    const doc = createElement(ExportPDFDocument, {
        data: processedData,
        columns: simpleColumns,
        title
    });

    const blob = await pdf(doc).toBlob();
    saveAs(blob, `${filename}.pdf`);
}

// ============================================================
// EXPORT FUNCTIONS
// ============================================================

export async function exportPNodes(
    nodes: PNode[],
    format: ExportFormat,
    filename: string = 'xandeum-pnodes'
): Promise<void> {
    const timestamp = new Date().toISOString().split('T')[0];
    const fullFilename = `${filename}-${timestamp}`;

    try {
        if (format === 'pdf') {
            await exportToPDF(nodes, pNodeColumns, fullFilename, 'Xandeum pNodes Export');
        } else {
            await exportWithWorker(nodes, pNodeColumns, format, fullFilename);
        }
    } catch (error) {
        console.error('Export failed:', error);
        throw error;
    }
}

export async function exportPerformanceHistory(
    history: PerformanceHistory[],
    format: ExportFormat,
    filename: string = 'xandeum-analytics'
): Promise<void> {
    const timestamp = new Date().toISOString().split('T')[0];
    const fullFilename = `${filename}-${timestamp}`;

    try {
        if (format === 'pdf') {
            await exportToPDF(history, performanceHistoryColumns, fullFilename, 'Xandeum Analytics Export');
        } else {
            await exportWithWorker(history, performanceHistoryColumns, format, fullFilename);
        }
    } catch (error) {
        console.error('Export failed:', error);
        throw error;
    }
}
