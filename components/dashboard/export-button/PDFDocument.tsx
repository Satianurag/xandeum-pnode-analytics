import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register a nice font if possible, or use standard ones
// Font.register({ family: 'Roboto', src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/Roboto-Regular.ttf' });

const styles = StyleSheet.create({
    page: {
        padding: 30,
        backgroundColor: '#ffffff', // PDFs usually look better on white for printing
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#111',
        paddingBottom: 10,
    },
    title: {
        fontSize: 24,
        marginBottom: 5,
        color: '#0f0f1a', // Dark blue from the app theme
    },
    subtitle: {
        fontSize: 10,
        color: '#666',
    },
    table: {
        display: 'flex',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderColor: '#bfbfbf',
    },
    tableRow: {
        margin: 'auto',
        flexDirection: 'row',
    },
    tableColHeader: {
        width: '100%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderColor: '#bfbfbf',
        backgroundColor: '#f0f0f0',
    },
    tableCol: {
        width: '100%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderColor: '#bfbfbf',
    },
    tableCellHeader: {
        margin: 5,
        fontSize: 10,
        fontWeight: 'bold',
    },
    tableCell: {
        margin: 5,
        fontSize: 8,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        fontSize: 8,
        color: 'grey',
    },
});

interface ExportPDFDocumentProps {
    data: any[];
    columns: { header: string; key: string }[]; // Simple column definition
    title?: string;
}

export const ExportPDFDocument = ({ data, columns, title = 'Data Export' }: ExportPDFDocumentProps) => (
    <Document>
        <Page size="A4" style={styles.page} orientation="landscape">
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>Generated on {new Date().toLocaleString()}</Text>
            </View>

            <View style={styles.table}>
                {/* Table Header */}
                <View style={styles.tableRow}>
                    {columns.map((col, i) => (
                        <View key={i} style={[styles.tableColHeader, { width: `${100 / columns.length}%` }]}>
                            <Text style={styles.tableCellHeader}>{col.header}</Text>
                        </View>
                    ))}
                </View>

                {/* Table Rows */}
                {data.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.tableRow}>
                        {columns.map((col, colIndex) => (
                            <View key={colIndex} style={[styles.tableCol, { width: `${100 / columns.length}%` }]}>
                                <Text style={styles.tableCell}>
                                    {row[col.key] !== undefined && row[col.key] !== null ? String(row[col.key]) : ''}
                                </Text>
                            </View>
                        ))}
                    </View>
                ))}
            </View>

            <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
                `Page ${pageNumber} of ${totalPages} - Xandeum pNode Analytics`
            )} fixed />
        </Page>
    </Document>
);
