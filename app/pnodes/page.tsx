import { Suspense } from 'react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getClusterNodes } from "@/server/api/pnodes";
import PNodesPage from "./pnodes-client";
import DashboardPageLayout from "@/components/dashboard/layout";
import ServerIcon from "@/components/icons/server";
import { Skeleton } from "@/components/ui/skeleton";

// Force dynamic rendering for Redis
export const dynamic = 'force-dynamic';

// Loading skeleton
function PNodesSkeleton() {
    return (
        <DashboardPageLayout
            header={{
                title: "pNode Directory",
                description: "Loading...",
                icon: ServerIcon,
            }}
        >
            <div className="space-y-6">
                <Skeleton className="h-10 w-64 rounded-lg" />
                <Skeleton className="h-[500px] rounded-lg" />
            </div>
        </DashboardPageLayout>
    );
}

// Server-side data fetching with React Query prefetch
async function PNodesWithData() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
            },
        },
    });

    await queryClient.prefetchQuery({
        queryKey: ['pnodes'],
        queryFn: getClusterNodes,
    });

    const nodes = queryClient.getQueryData(['pnodes']) as any[] | null;

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <PNodesPage initialNodes={nodes} />
        </HydrationBoundary>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<PNodesSkeleton />}>
            <PNodesWithData />
        </Suspense>
    );
}
