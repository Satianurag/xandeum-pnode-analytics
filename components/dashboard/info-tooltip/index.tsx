'use client';

import { Info } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface InfoTooltipProps {
    content: string;
    title?: string;
    className?: string;
    side?: 'top' | 'right' | 'bottom' | 'left';
}

/**
 * InfoTooltip - A small info icon that shows explanatory content on hover
 * Used to provide educational context for dashboard metrics
 */
export function InfoTooltip({
    content,
    title,
    className = '',
    side = 'top'
}: InfoTooltipProps) {
    return (
        <TooltipProvider delayDuration={300}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        type="button"
                        className={`inline-flex items-center justify-center text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-full ${className}`}
                        aria-label={`Info: ${title || content.slice(0, 50)}`}
                    >
                        <Info className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                </TooltipTrigger>
                <TooltipContent
                    side={side}
                    className="max-w-xs text-sm"
                    sideOffset={5}
                >
                    {title && (
                        <div className="font-semibold mb-1">{title}</div>
                    )}
                    <p className="text-muted-foreground">{content}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

interface MetricLabelProps {
    label: string;
    tooltip?: string;
    tooltipTitle?: string;
    className?: string;
}

/**
 * MetricLabel - A label with an optional info tooltip
 * Common pattern for stat cards and metric displays
 */
export function MetricLabel({
    label,
    tooltip,
    tooltipTitle,
    className = ''
}: MetricLabelProps) {
    return (
        <div className={`flex items-center gap-1.5 ${className}`}>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
                {label}
            </span>
            {tooltip && (
                <InfoTooltip content={tooltip} title={tooltipTitle} />
            )}
        </div>
    );
}
