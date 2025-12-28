import { Suspense } from 'react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getDecentralizationMetrics, getVersionDistribution, getSuperminorityInfo, getCensorshipResistanceScore } from "@/server/api/decentralization";
import { getClusterNodes } from "@/server/api/pnodes";
import DecentralizationClient from "./decentralization-client";
import DashboardPageLayout from "@/components/dashboard/layout";
import { Skeleton } from "@/components/ui/skeleton";

// Force dynamic rendering for Redis
export const dynamic = 'force-dynamic';

const NetworkIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="3" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <circle cx="6" cy="19" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="12" y1="12" x2="6" y2="16" />
    <line x1="12" y1="12" x2="18" y2="16" />
  </svg>
);

// Loading skeleton
function DecentralizationSkeleton() {
  return (
    <DashboardPageLayout
      header={{
        title: "Decentralization",
        description: "Loading...",
        icon: NetworkIcon,
      }}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-[300px] rounded-lg" />
      </div>
    </DashboardPageLayout>
  );
}

// Server-side data fetching with React Query prefetch
async function DecentralizationWithData() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });

  // Prefetch all decentralization data in parallel  
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ['decentralization-metrics'],
      queryFn: getDecentralizationMetrics,
    }),
    queryClient.prefetchQuery({
      queryKey: ['pnodes'],
      queryFn: getClusterNodes,
    }),
    queryClient.prefetchQuery({
      queryKey: ['version-distribution'],
      queryFn: getVersionDistribution,
    }),
    queryClient.prefetchQuery({
      queryKey: ['superminority-info'],
      queryFn: getSuperminorityInfo,
    }),
    queryClient.prefetchQuery({
      queryKey: ['censorship-resistance-score'],
      queryFn: getCensorshipResistanceScore,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DecentralizationClient />
    </HydrationBoundary>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<DecentralizationSkeleton />}>
      <DecentralizationWithData />
    </Suspense>
  );
}
