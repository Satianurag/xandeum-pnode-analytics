import { NextResponse } from 'next/server';
import { getClusterNodes } from '@/server/api/pnodes';

export async function GET() {
    try {
        const nodes = await getClusterNodes();

        // Sample one node to inspect actual data
        const sampleNode = nodes[0];

        return NextResponse.json({
            totalNodes: nodes.length,
            sampleNode: sampleNode,
            dataAvailable: {
                hasStaking: !!sampleNode?.staking && Object.values(sampleNode.staking).some(v => v !== 0),
                hasGossip: !!sampleNode?.gossip && Object.values(sampleNode.gossip).some(v => v !== 0),
                hasLocation: !!sampleNode?.location && sampleNode.location.country !== 'Unknown',
                hasMetrics: !!sampleNode?.metrics,
                hasPerformance: !!sampleNode?.performance,
                hasCredits: !!sampleNode?.credits,
            }
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
