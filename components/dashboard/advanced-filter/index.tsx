'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Filter, X, Search, SlidersHorizontal, ChevronDown, Save } from 'lucide-react';
import type { PNode } from '@/types/pnode';

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export interface FilterState {
    query: string;
    status: string[];
    countries: string[];
    performanceTiers: string[];
    minScore: number;
    maxScore: number;
    minUptime: number;
    maxLatency: number;
}

export const defaultFilters: FilterState = {
    query: '',
    status: [],
    countries: [],
    performanceTiers: [],
    minScore: 0,
    maxScore: 100,
    minUptime: 0,
    maxLatency: 500,
};

interface AdvancedFilterProps {
    nodes: PNode[];
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    onClear: () => void;
}

// ============================================================
// FILTER CHIP COMPONENT
// ============================================================

function FilterChip({
    label,
    onRemove
}: {
    label: string;
    onRemove: () => void
}) {
    return (
        <Badge
            variant="secondary"
            className="gap-1 cursor-pointer hover:bg-destructive/20"
            onClick={onRemove}
        >
            {label}
            <X className="w-3 h-3" aria-hidden="true" />
        </Badge>
    );
}

// ============================================================
// MULTI-SELECT DROPDOWN
// ============================================================

interface MultiSelectProps {
    label: string;
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
}

function MultiSelect({
    label,
    options,
    selected,
    onChange,
    placeholder = 'Select...'
}: MultiSelectProps) {
    const [open, setOpen] = useState(false);

    const toggleOption = (option: string) => {
        if (selected.includes(option)) {
            onChange(selected.filter(s => s !== option));
        } else {
            onChange([...selected, option]);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="justify-between min-w-[140px]"
                >
                    <span className="truncate">
                        {selected.length > 0 ? `${label} (${selected.length})` : placeholder}
                    </span>
                    <ChevronDown className="w-4 h-4 opacity-50" aria-hidden="true" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="start">
                <div className="space-y-1 max-h-60 overflow-y-auto">
                    {options.map(option => (
                        <button
                            key={option}
                            onClick={() => toggleOption(option)}
                            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${selected.includes(option)
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-accent'
                                }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
                {selected.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => onChange([])}
                    >
                        Clear
                    </Button>
                )}
            </PopoverContent>
        </Popover>
    );
}

// ============================================================
// MAIN ADVANCED FILTER COMPONENT
// ============================================================

export function AdvancedFilter({
    nodes,
    filters,
    onFilterChange,
    onClear,
}: AdvancedFilterProps) {
    // Extract unique values from nodes for filter options
    const statusOptions = ['online', 'offline', 'degraded'];
    const tierOptions = ['excellent', 'good', 'fair', 'poor'];

    const countryOptions = useMemo(() => {
        const countries = new Set<string>();
        nodes.forEach(n => {
            if (n.location?.country) countries.add(n.location.country);
        });
        return Array.from(countries).sort();
    }, [nodes]);

    // Count active filters
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.query) count++;
        if (filters.status.length > 0) count++;
        if (filters.countries.length > 0) count++;
        if (filters.performanceTiers.length > 0) count++;
        if (filters.minScore > 0) count++;
        if (filters.maxScore < 100) count++;
        if (filters.minUptime > 0) count++;
        if (filters.maxLatency < 500) count++;
        return count;
    }, [filters]);

    // Generate filter chips
    const filterChips = useMemo(() => {
        const chips: Array<{ label: string; onRemove: () => void }> = [];

        if (filters.query) {
            chips.push({
                label: `Search: ${filters.query}`,
                onRemove: () => onFilterChange({ ...filters, query: '' }),
            });
        }

        filters.status.forEach(s => {
            chips.push({
                label: s,
                onRemove: () => onFilterChange({
                    ...filters,
                    status: filters.status.filter(x => x !== s)
                }),
            });
        });

        filters.countries.forEach(c => {
            chips.push({
                label: c,
                onRemove: () => onFilterChange({
                    ...filters,
                    countries: filters.countries.filter(x => x !== c)
                }),
            });
        });

        filters.performanceTiers.forEach(t => {
            chips.push({
                label: t,
                onRemove: () => onFilterChange({
                    ...filters,
                    performanceTiers: filters.performanceTiers.filter(x => x !== t)
                }),
            });
        });

        if (filters.minScore > 0 || filters.maxScore < 100) {
            chips.push({
                label: `Score: ${filters.minScore}-${filters.maxScore}`,
                onRemove: () => onFilterChange({ ...filters, minScore: 0, maxScore: 100 }),
            });
        }

        if (filters.minUptime > 0) {
            chips.push({
                label: `Uptime ≥ ${filters.minUptime}%`,
                onRemove: () => onFilterChange({ ...filters, minUptime: 0 }),
            });
        }

        if (filters.maxLatency < 500) {
            chips.push({
                label: `Latency ≤ ${filters.maxLatency}ms`,
                onRemove: () => onFilterChange({ ...filters, maxLatency: 500 }),
            });
        }

        return chips;
    }, [filters, onFilterChange]);

    return (
        <div className="space-y-4">
            {/* Quick Filter Bar */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Search Input */}
                <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by pubkey, IP, or location..."
                        value={filters.query}
                        onChange={(e) => onFilterChange({ ...filters, query: e.target.value })}
                        className="pl-10"
                    />
                </div>

                {/* Quick Dropdowns */}
                <MultiSelect
                    label="Status"
                    options={statusOptions}
                    selected={filters.status}
                    onChange={(status) => onFilterChange({ ...filters, status })}
                    placeholder="Status"
                />

                <MultiSelect
                    label="Country"
                    options={countryOptions}
                    selected={filters.countries}
                    onChange={(countries) => onFilterChange({ ...filters, countries })}
                    placeholder="Country"
                />

                <MultiSelect
                    label="Tier"
                    options={tierOptions}
                    selected={filters.performanceTiers}
                    onChange={(performanceTiers) => onFilterChange({ ...filters, performanceTiers })}
                    placeholder="Tier"
                />

                {/* Advanced Filters Sheet */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                            <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
                            Advanced
                            {activeFilterCount > 0 && (
                                <Badge variant="secondary" className="ml-1">
                                    {activeFilterCount}
                                </Badge>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Advanced Filters</SheetTitle>
                            <SheetDescription>
                                Fine-tune your search with precise criteria
                            </SheetDescription>
                        </SheetHeader>
                        <div className="mt-6 space-y-6">
                            {/* Score Range */}
                            <div className="space-y-3">
                                <Label>Performance Score Range</Label>
                                <div className="px-2">
                                    <Slider
                                        value={[filters.minScore, filters.maxScore]}
                                        min={0}
                                        max={100}
                                        step={5}
                                        onValueChange={([min, max]) =>
                                            onFilterChange({ ...filters, minScore: min, maxScore: max })
                                        }
                                    />
                                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                                        <span>{filters.minScore}</span>
                                        <span>{filters.maxScore}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Min Uptime */}
                            <div className="space-y-3">
                                <Label>Minimum Uptime (%)</Label>
                                <div className="px-2">
                                    <Slider
                                        value={[filters.minUptime]}
                                        min={0}
                                        max={100}
                                        step={5}
                                        onValueChange={([value]) =>
                                            onFilterChange({ ...filters, minUptime: value })
                                        }
                                    />
                                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                                        <span>0%</span>
                                        <span className="font-medium text-primary">{filters.minUptime}%</span>
                                        <span>100%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Max Latency */}
                            <div className="space-y-3">
                                <Label>Maximum Latency (ms)</Label>
                                <div className="px-2">
                                    <Slider
                                        value={[filters.maxLatency]}
                                        min={0}
                                        max={500}
                                        step={25}
                                        onValueChange={([value]) =>
                                            onFilterChange({ ...filters, maxLatency: value })
                                        }
                                    />
                                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                                        <span>0ms</span>
                                        <span className="font-medium text-primary">{filters.maxLatency}ms</span>
                                        <span>500ms</span>
                                    </div>
                                </div>
                            </div>

                            {/* Clear All Button */}
                            <Button
                                variant="outline"
                                className="w-full mt-6"
                                onClick={onClear}
                            >
                                <X className="w-4 h-4 mr-2" />
                                Clear All Filters
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Clear Button */}
                {activeFilterCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClear}
                        className="text-muted-foreground"
                    >
                        <X className="w-4 h-4 mr-1" />
                        Clear
                    </Button>
                )}
            </div>

            {/* Active Filter Chips */}
            {filterChips.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {filterChips.map((chip, i) => (
                        <FilterChip key={i} label={chip.label} onRemove={chip.onRemove} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ============================================================
// FILTER LOGIC - Apply filters to node array
// ============================================================

export function applyFilters(nodes: PNode[], filters: FilterState): PNode[] {
    return nodes.filter(node => {
        // Text search
        if (filters.query) {
            const query = filters.query.toLowerCase();
            const matchesQuery =
                node.pubkey.toLowerCase().includes(query) ||
                node.ip.toLowerCase().includes(query) ||
                node.location?.city?.toLowerCase().includes(query) ||
                node.location?.country?.toLowerCase().includes(query);
            if (!matchesQuery) return false;
        }

        // Status filter
        if (filters.status.length > 0 && !filters.status.includes(node.status)) {
            return false;
        }

        // Country filter
        if (filters.countries.length > 0 && node.location?.country) {
            if (!filters.countries.includes(node.location.country)) return false;
        }

        // Tier filter
        if (filters.performanceTiers.length > 0) {
            if (!filters.performanceTiers.includes(node.performance.tier)) return false;
        }

        // Score range
        if (node.performance.score < filters.minScore ||
            node.performance.score > filters.maxScore) {
            return false;
        }

        // Minimum uptime
        if (node.uptime < filters.minUptime) {
            return false;
        }

        // Maximum latency
        if (node.metrics.responseTimeMs > filters.maxLatency) {
            return false;
        }

        return true;
    });
}
