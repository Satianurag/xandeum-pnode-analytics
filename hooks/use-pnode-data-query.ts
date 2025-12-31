import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PNode, NetworkStats, PerformanceHistory, GossipHealth, GossipEvent, StorageDistribution, EpochInfo, EpochHistory, StakingStats, DecentralizationMetrics, VersionInfo, HealthScoreBreakdown, TrendData, ExabyteProjection, CommissionHistory, PeerRanking, SuperminorityInfo, CensorshipResistanceScore, XScore } from '@/types/pnode';
import React, { useEffect, useState } from 'react';
import { REFRESH_INTERVAL } from '@/lib/pnode-api';

// ============================================================================
// BASE QUERY CONFIGURATION - Prevents shell loading on tab switch
// ============================================================================
// CRITICAL: These options ensure cached data is used immediately on navigation
// instead of showing loading skeletons while refetching.
const BASE_QUERY_OPTIONS = {
    // NOTE: 'always' means it will fetch on mount if no data exists, but use cache if data exists
    // This was previously 'false' which broke initial data loading when cache was empty
    refetchOnMount: true,       // Fetch on mount when cache is empty
    refetchOnWindowFocus: false, // Don't refetch on tab focus (prevents flash)
    refetchOnReconnect: true,   // Refetch on network reconnect
    staleTime: 5 * 60 * 1000,   // 5 minutes - data considered fresh
    gcTime: 10 * 60 * 1000,     // 10 minutes - keep in cache longer
} as const;

// Generic fetcher for unified API with priority support
async function fetchApi<T>(params: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`/api/pnode-data?${params}`, init);
    if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
    }
    return res.json();
}

export function usePNodes(initialData?: any) {
    return useQuery({
        queryKey: ['pnodes'],
        queryFn: () => fetchApi<PNode[]>('type=cluster-nodes', { priority: 'high' } as RequestInit),
        initialData,
        ...BASE_QUERY_OPTIONS,
        staleTime: 60000, // 1 minute - data refresh
        refetchInterval: REFRESH_INTERVAL, // Periodic updates
    });
}

export function useNetworkStats(initialData?: any) {
    return useQuery({
        queryKey: ['network-stats'],
        queryFn: () => fetchApi<NetworkStats>('type=network-stats', { priority: 'high' } as RequestInit),
        initialData,
        ...BASE_QUERY_OPTIONS,
        staleTime: 60000, // 1 minute - data refresh  
        refetchInterval: REFRESH_INTERVAL, // Periodic updates
    });
}

export function usePerformanceHistory(period: '24h' | '7d' | '30d' = '24h', initialData?: any) {
    return useQuery({
        queryKey: ['performance-history', period],
        queryFn: () => fetchApi<PerformanceHistory[]>(`type=performance-history&period=${period}`),
        initialData,
        ...BASE_QUERY_OPTIONS,
        staleTime: 2 * 60 * 1000,
        refetchInterval: REFRESH_INTERVAL,
    });
}

export function useGossipEvents() {
    return useQuery({
        queryKey: ['gossip-events'],
        queryFn: () => fetchApi<GossipEvent[]>('type=network-events'),
        ...BASE_QUERY_OPTIONS,
        refetchInterval: 60000,
    });
}

export function useGossipHealth() {
    return useQuery({
        queryKey: ['gossip-health'],
        queryFn: () => fetchApi<GossipHealth>('type=gossip-health'),
        ...BASE_QUERY_OPTIONS,
        staleTime: 60000,
        refetchInterval: REFRESH_INTERVAL,
    });
}

export function useStorageDistribution() {
    return useQuery({
        queryKey: ['storage-distribution'],
        queryFn: () => fetchApi<StorageDistribution[]>('type=storage-distribution'),
        ...BASE_QUERY_OPTIONS,
        staleTime: 60000,
        refetchInterval: REFRESH_INTERVAL,
    });
}

export function useXScore(nodeId?: string) {
    return useQuery({
        queryKey: ['x-score', nodeId],
        queryFn: () => fetchApi<XScore>(`type=x-score${nodeId ? `&nodeId=${nodeId}` : ''}`),
        ...BASE_QUERY_OPTIONS,
        refetchInterval: REFRESH_INTERVAL,
    });
}

export function useEpochInfo() {
    return useQuery({
        queryKey: ['epoch-info'],
        queryFn: () => fetchApi<EpochInfo>('type=epoch-info'),
        ...BASE_QUERY_OPTIONS,
        staleTime: Infinity,
    });
}

export function useEpochHistory() {
    return useQuery({
        queryKey: ['epoch-history'],
        queryFn: () => fetchApi<EpochHistory[]>('type=epoch-history'),
        ...BASE_QUERY_OPTIONS,
        refetchInterval: REFRESH_INTERVAL,
    });
}

export function useStakingStats() {
    return useQuery({
        queryKey: ['staking-stats'],
        queryFn: () => fetchApi<StakingStats>('type=staking-stats'),
        ...BASE_QUERY_OPTIONS,
        refetchInterval: REFRESH_INTERVAL,
    });
}

export function useDecentralizationMetrics() {
    return useQuery({
        queryKey: ['decentralization-metrics'],
        queryFn: () => fetchApi<DecentralizationMetrics>('type=decentralization-metrics'),
        ...BASE_QUERY_OPTIONS,
        refetchInterval: REFRESH_INTERVAL,
    });
}

export function useVersionDistribution() {
    return useQuery({
        queryKey: ['version-distribution'],
        queryFn: () => fetchApi<VersionInfo[]>('type=version-distribution'),
        ...BASE_QUERY_OPTIONS,
        refetchInterval: REFRESH_INTERVAL,
    });
}

export function useHealthScoreBreakdown() {
    return useQuery({
        queryKey: ['health-score-breakdown'],
        queryFn: () => fetchApi<HealthScoreBreakdown>('type=health-score-breakdown'),
        ...BASE_QUERY_OPTIONS,
        refetchInterval: REFRESH_INTERVAL,
    });
}

export function useTrendData(metric: string, period: string) {
    return useQuery({
        queryKey: ['trend-data', metric, period],
        queryFn: () => fetchApi<TrendData>(`type=trend-data&metric=${metric}&period=${period}`),
        ...BASE_QUERY_OPTIONS,
        refetchInterval: REFRESH_INTERVAL,
    });
}

export function useExabyteProjection(timeframe: string, customNodeCount?: number) {
    return useQuery({
        queryKey: ['exabyte-projection', timeframe, customNodeCount],
        queryFn: () => fetchApi<ExabyteProjection>(`type=exabyte-projection&timeframe=${timeframe}${customNodeCount ? `&customNodeCount=${customNodeCount}` : ''}`),
        ...BASE_QUERY_OPTIONS,
        refetchInterval: REFRESH_INTERVAL,
    });
}

export function useCommissionHistory(nodeId: string) {
    return useQuery({
        queryKey: ['commission-history', nodeId],
        queryFn: () => fetchApi<CommissionHistory>(`type=commission-history&nodeId=${nodeId}`),
        ...BASE_QUERY_OPTIONS,
        refetchInterval: REFRESH_INTERVAL,
    });
}

export function useHealthTrends(period: string = '24h') {
    return useQuery({
        queryKey: ['health-trends', period],
        queryFn: async () => {
            const res = await fetch(`/api/health-trends?period=${period}`);
            if (!res.ok) throw new Error('Failed to fetch health trends');
            return res.json();
        },
        ...BASE_QUERY_OPTIONS,
        refetchInterval: REFRESH_INTERVAL,
    });
}

export function useSlashingEvents() {
    return useQuery({
        queryKey: ['slashing-events'],
        queryFn: () => fetchApi<any[]>('type=slashing-events'),
        ...BASE_QUERY_OPTIONS,
        refetchInterval: REFRESH_INTERVAL,
    });
}

export function usePeerRankings() {
    return useQuery({
        queryKey: ['peer-rankings'],
        queryFn: () => fetchApi<PeerRanking[]>('type=peer-rankings'),
        ...BASE_QUERY_OPTIONS,
        refetchInterval: REFRESH_INTERVAL,
    });
}

export function useSuperminorityInfo() {
    return useQuery({
        queryKey: ['superminority-info'],
        queryFn: () => fetchApi<SuperminorityInfo>('type=superminority-info'),
        ...BASE_QUERY_OPTIONS,
        refetchInterval: REFRESH_INTERVAL,
    });
}

export function useCensorshipResistanceScore() {
    return useQuery({
        queryKey: ['censorship-resistance-score'],
        queryFn: () => fetchApi<CensorshipResistanceScore>('type=censorship-resistance'),
        ...BASE_QUERY_OPTIONS,
        refetchInterval: REFRESH_INTERVAL,
    });
}

export function useConnectionStatus() {
    const { isLoading, isError, data, dataUpdatedAt } = useNetworkStats();

    // If we have data, we are connected, even if we are currently refetching.
    // Transition to 'connected' as soon as data arrives or loading completes.
    const isActuallyConnecting = isLoading && !data;

    return {
        status: isActuallyConnecting ? 'connecting' : (isError && !data) ? 'disconnected' : 'connected',
        lastCheck: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
    };
}

export function useUserTimezone() {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    let name = 'UTC';
    let city = 'UTC';
    let offset = 'UTC+0';

    if (mounted && typeof window !== 'undefined') {
        try {
            name = Intl.DateTimeFormat().resolvedOptions().timeZone;
            city = name.split('/').pop()?.replace(/_/g, ' ') || 'UTC';

            const now = new Date();
            const offsetMinutes = now.getTimezoneOffset();
            const offsetHours = -(offsetMinutes / 60);
            const sign = offsetHours >= 0 ? '+' : '-';
            const absHours = Math.floor(Math.abs(offsetHours));
            const absMinutes = Math.abs(offsetMinutes % 60);

            offset = `UTC${sign}${absHours}${absMinutes > 0 ? ':' + absMinutes.toString().padStart(2, '0') : ''}`;
        } catch (e) {
            console.error('Error calculating timezone:', e);
        }
    }

    return { name, offset, city, mounted };
}

export function useLiveClock() {
    const [time, setTime] = React.useState<Date | null>(null);
    const [mounted, setMounted] = React.useState(false);
    const timezone = useUserTimezone();
    React.useEffect(() => {
        setMounted(true);
        setTime(new Date());
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);
    return { time, timezone, mounted };
}
