import { Suspense } from 'react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getClusterNodes } from "@/server/api/pnodes";
import { getNetworkStats, getPerformanceHistory } from "@/server/api/network";
import { getXScore } from "@/server/api/decentralization";
import DashboardOverview from "./dashboard-client";
import DashboardPageLayout from "@/components/dashboard/layout";
import BracketsIcon from "@/components/icons/brackets";
import { Skeleton } from "@/components/ui/skeleton";

// ═══════════════════════════════════════════════════════════════════════════
// 🚀 STREAMING SSR with React Query Hydration
// Benefits:
// - Zero loading spinners on first render (data pre-fetched on server)
// - Instant navigation with prefetched cache
// - Progressive rendering with Suspense boundaries
// ═══════════════════════════════════════════════════════════════════════════

// Force dynamic rendering for Redis integration
export const dynamic = 'force-dynamic';

// Dashboard loading skeleton
function DashboardSkeleton() {
    return (
        <DashboardPageLayout
            header={{
                title: "Dashboard",
                description: "Loading...",
                icon: BracketsIcon,
            }}
        >
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-28 rounded-lg" />
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-lg" />
                    ))}
                </div>
                <Skeleton className="h-[400px] rounded-lg" />
                <Skeleton className="h-64 rounded-lg" />
            </div>
        </DashboardPageLayout>
    );
}

// Server-side data fetching with React Query prefetch
async function DashboardWithData() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000, // 1 minute
            },
        },
    });

    // Prefetch all dashboard data in parallel
    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: ['pnodes'],
            queryFn: getClusterNodes,
        }),
        queryClient.prefetchQuery({
            queryKey: ['network-stats'],
            queryFn: getNetworkStats,
        }),
        queryClient.prefetchQuery({
            queryKey: ['performance-history', '24h'],
            queryFn: () => getPerformanceHistory('24h'),
        }),
        queryClient.prefetchQuery({
            queryKey: ['x-score', undefined],
            queryFn: () => getXScore(),
        }),
    ]);

    // Get data for initial render
    const nodes = queryClient.getQueryData(['pnodes']) as any[] | null;
    const stats = queryClient.getQueryData(['network-stats']) as any | null;

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <DashboardOverview initialNodes={nodes} initialStats={stats} />
        </HydrationBoundary>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <DashboardWithData />
        </Suspense>
    );
}
