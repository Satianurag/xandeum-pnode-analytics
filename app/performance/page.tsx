import { Suspense } from 'react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getClusterNodes } from "@/server/api/pnodes";
import { getPerformanceHistory } from "@/server/api/network";
import PerformanceClient from "./performance-client";
import DashboardPageLayout from "@/components/dashboard/layout";
import TrophyIcon from "@/components/icons/trophy";
import { Skeleton } from "@/components/ui/skeleton";

// Force dynamic rendering for Redis
export const dynamic = 'force-dynamic';

// Loading skeleton for performance page
function PerformanceSkeleton() {
  return (
    <DashboardPageLayout
      header={{
        title: "Performance",
        description: "Loading...",
        icon: TrophyIcon,
      }}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-[400px] rounded-lg" />
      </div>
    </DashboardPageLayout>
  );
}

// Server-side data fetching with React Query prefetch
async function PerformanceWithData() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });

  // Prefetch all performance data in parallel
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ['pnodes'],
      queryFn: getClusterNodes,
    }),
    queryClient.prefetchQuery({
      queryKey: ['performance-history', '24h'],
      queryFn: () => getPerformanceHistory('24h'),
    }),
  ]);

  // Get data for initial render
  const nodes = queryClient.getQueryData(['pnodes']) as any[] | null;
  const history = queryClient.getQueryData(['performance-history', '24h']) as any[] | null;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PerformanceClient initialNodes={nodes} initialHistory={history} />
    </HydrationBoundary>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<PerformanceSkeleton />}>
      <PerformanceWithData />
    </Suspense>
  );
}
