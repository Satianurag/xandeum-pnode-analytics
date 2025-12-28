
import { getClusterNodes } from "@/server/api/pnodes";
import { getPerformanceHistory } from "@/server/api/network";
import PerformanceClient from "./performance-client";

// Force dynamic rendering for Redis
export const dynamic = 'force-dynamic';

export default async function Page() {
  // Fetch data on the server (Redis cache)
  const [nodes, history] = await Promise.all([
    getClusterNodes(),
    getPerformanceHistory('24h'),
  ]);

  return <PerformanceClient initialNodes={nodes} initialHistory={history} />;
}
