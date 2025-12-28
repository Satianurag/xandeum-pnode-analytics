import { Suspense } from 'react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getHealthScoreBreakdown, getPeerRankings } from "@/server/api/decentralization";
import { getNetworkStats } from "@/server/api/network";
import { getClusterNodes } from "@/server/api/pnodes";
import HealthClient from "./health-client";
import DashboardPageLayout from "@/components/dashboard/layout";
import { Skeleton } from "@/components/ui/skeleton";

// Force dynamic rendering for Redis
export const dynamic = 'force-dynamic';

const HeartPulseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
  </svg>
);

// Loading skeleton
function HealthSkeleton() {
  return (
    <DashboardPageLayout
      header={{
        title: "Health Score",
        description: "Loading...",
        icon: HeartPulseIcon,
      }}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-[300px] rounded-lg" />
      </div>
    </DashboardPageLayout>
  );
}

// Server-side data fetching with React Query prefetch
async function HealthWithData() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });

  // Prefetch all health data in parallel
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ['health-score-breakdown'],
      queryFn: getHealthScoreBreakdown,
    }),
    queryClient.prefetchQuery({
      queryKey: ['network-stats'],
      queryFn: getNetworkStats,
    }),
    queryClient.prefetchQuery({
      queryKey: ['pnodes'],
      queryFn: getClusterNodes,
    }),
    queryClient.prefetchQuery({
      queryKey: ['peer-rankings'],
      queryFn: getPeerRankings,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HealthClient />
    </HydrationBoundary>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<HealthSkeleton />}>
      <HealthWithData />
    </Suspense>
  );
}
