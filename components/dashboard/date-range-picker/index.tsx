'use client';

import { useState } from 'react';
import { format, subDays, subMonths, startOfDay, endOfDay } from 'date-fns';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export type PresetRange = '24h' | '7d' | '30d' | '90d' | 'custom';

export interface DateRangeValue {
    from: Date;
    to: Date;
    preset: PresetRange;
}

interface DateRangePickerProps {
    value: DateRangeValue;
    onChange: (value: DateRangeValue) => void;
    className?: string;
}

// ============================================================
// PRESET RANGES
// ============================================================

const presets: Array<{ label: string; value: PresetRange; getRange: () => { from: Date; to: Date } }> = [
    {
        label: 'Last 24 Hours',
        value: '24h',
        getRange: () => ({ from: subDays(new Date(), 1), to: new Date() }),
    },
    {
        label: 'Last 7 Days',
        value: '7d',
        getRange: () => ({ from: subDays(new Date(), 7), to: new Date() }),
    },
    {
        label: 'Last 30 Days',
        value: '30d',
        getRange: () => ({ from: subDays(new Date(), 30), to: new Date() }),
    },
    {
        label: 'Last 90 Days',
        value: '90d',
        getRange: () => ({ from: subDays(new Date(), 90), to: new Date() }),
    },
];

// ============================================================
// DATE RANGE PICKER COMPONENT
// ============================================================

export function DateRangePicker({
    value,
    onChange,
    className
}: DateRangePickerProps) {
    const [open, setOpen] = useState(false);
    const [calendarDate, setCalendarDate] = useState<DateRange | undefined>({
        from: value.from,
        to: value.to,
    });

    const handlePresetSelect = (preset: typeof presets[number]) => {
        const range = preset.getRange();
        onChange({
            from: range.from,
            to: range.to,
            preset: preset.value,
        });
        setCalendarDate({ from: range.from, to: range.to });
        setOpen(false);
    };

    const handleCalendarSelect = (range: DateRange | undefined) => {
        setCalendarDate(range);
        if (range?.from && range?.to) {
            onChange({
                from: startOfDay(range.from),
                to: endOfDay(range.to),
                preset: 'custom',
            });
        }
    };

    const formatDisplayValue = () => {
        if (value.preset !== 'custom') {
            const preset = presets.find(p => p.value === value.preset);
            return preset?.label || 'Select range';
        }
        return `${format(value.from, 'MMM d, yyyy')} - ${format(value.to, 'MMM d, yyyy')}`;
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                        'justify-start text-left font-normal gap-2',
                        !value && 'text-muted-foreground',
                        className
                    )}
                >
                    <CalendarIcon className="h-4 w-4" aria-hidden="true" />
                    <span className="truncate">{formatDisplayValue()}</span>
                    <ChevronDown className="h-3 w-3 opacity-50 ml-auto" aria-hidden="true" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <div className="flex">
                    {/* Presets */}
                    <div className="border-r border-border p-2 space-y-1">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider px-2 py-1">
                            Quick Select
                        </div>
                        {presets.map((preset) => (
                            <button
                                key={preset.value}
                                onClick={() => handlePresetSelect(preset)}
                                className={cn(
                                    'w-full text-left px-3 py-2 text-sm rounded-md transition-colors',
                                    value.preset === preset.value
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-accent'
                                )}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>

                    {/* Calendar */}
                    <div className="p-3">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider px-2 py-1 mb-2">
                            Custom Range
                        </div>
                        <Calendar
                            mode="range"
                            selected={calendarDate}
                            onSelect={handleCalendarSelect}
                            numberOfMonths={2}
                            defaultMonth={subMonths(new Date(), 1)}
                            disabled={{ after: new Date() }}
                        />
                        {calendarDate?.from && calendarDate?.to && (
                            <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">
                                    {format(calendarDate.from, 'MMM d')} - {format(calendarDate.to, 'MMM d, yyyy')}
                                </span>
                                <Button
                                    size="sm"
                                    onClick={() => setOpen(false)}
                                >
                                    Apply
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

// ============================================================
// HELPER: Get initial date range value
// ============================================================

export function getDefaultDateRange(preset: PresetRange = '7d'): DateRangeValue {
    const presetConfig = presets.find(p => p.value === preset) || presets[1];
    const range = presetConfig.getRange();
    return {
        from: range.from,
        to: range.to,
        preset: presetConfig.value,
    };
}
