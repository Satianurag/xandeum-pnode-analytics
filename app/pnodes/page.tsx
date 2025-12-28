
import { getClusterNodes } from "@/server/api/pnodes";
import PNodesPage from "./pnodes-client";

// Force dynamic rendering for Redis
export const dynamic = 'force-dynamic';

export default async function Page() {
    // Fetch data on the server
    const nodes = await getClusterNodes();

    return <PNodesPage initialNodes={nodes} />;
}
