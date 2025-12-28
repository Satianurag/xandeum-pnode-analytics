import { Suspense } from 'react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getClusterNodes } from "@/server/api/pnodes";
import { getGossipHealth, getStorageDistribution } from "@/server/api/network";
import NetworkClient from "./network-client";
import DashboardPageLayout from "@/components/dashboard/layout";
import GlobeIcon from "@/components/icons/globe";
import { Skeleton } from "@/components/ui/skeleton";

// Force dynamic rendering for Redis
export const dynamic = 'force-dynamic';

// Loading skeleton
function NetworkSkeleton() {
  return (
    <DashboardPageLayout
      header={{
        title: "Topology",
        description: "Loading...",
        icon: GlobeIcon,
      }}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-[400px] rounded-lg" />
      </div>
    </DashboardPageLayout>
  );
}

// Server-side data fetching with React Query prefetch
async function NetworkWithData() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });

  // Prefetch all network data in parallel
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ['pnodes'],
      queryFn: getClusterNodes,
    }),
    queryClient.prefetchQuery({
      queryKey: ['gossip-health'],
      queryFn: getGossipHealth,
    }),
    queryClient.prefetchQuery({
      queryKey: ['storage-distribution'],
      queryFn: getStorageDistribution,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NetworkClient />
    </HydrationBoundary>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<NetworkSkeleton />}>
      <NetworkWithData />
    </Suspense>
  );
}
