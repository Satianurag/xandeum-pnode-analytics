'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Download, FileJson, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';
import type { ExportFormat } from '@/lib/export-utils';

interface ExportButtonProps {
    onExport: (format: ExportFormat) => void | Promise<void>;
    disabled?: boolean;
    label?: string;
    className?: string;
}

export function ExportButton({
    onExport,
    disabled = false,
    label = 'Export',
    className = ''
}: ExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (format: ExportFormat) => {
        setIsExporting(true);
        try {
            await onExport(format);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={disabled || isExporting}
                    className={`gap-2 ${className}`}
                >
                    <Download className="w-4 h-4" aria-hidden="true" />
                    <span>{isExporting ? 'Exporting...' : label}</span>
                    <ChevronDown className="w-3 h-3 opacity-50" aria-hidden="true" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                    onClick={() => handleExport('csv')}
                    className="gap-2 cursor-pointer"
                >
                    <FileSpreadsheet className="w-4 h-4 text-green-400" aria-hidden="true" />
                    <span>Export as CSV</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => handleExport('json')}
                    className="gap-2 cursor-pointer"
                >
                    <FileJson className="w-4 h-4 text-blue-400" aria-hidden="true" />
                    <span>Export as JSON</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => handleExport('pdf')}
                    className="gap-2 cursor-pointer"
                >
                    <FileText className="w-4 h-4 text-red-400" aria-hidden="true" />
                    <span>Export as PDF</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
