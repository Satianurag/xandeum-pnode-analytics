
import { getClusterNodes } from "@/server/api/pnodes";
import { getNetworkStats } from "@/server/api/network";
import DashboardOverview from "./dashboard-client";

// Force dynamic rendering for Redis
export const dynamic = 'force-dynamic';

export default async function Page() {
    // Fetch data on the server (Redis cache)
    const [nodes, stats] = await Promise.all([
        getClusterNodes(),
        getNetworkStats()
    ]);

    return <DashboardOverview initialNodes={nodes} initialStats={stats} />;
}
