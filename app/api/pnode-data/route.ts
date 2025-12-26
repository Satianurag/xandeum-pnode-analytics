import { NextRequest, NextResponse } from 'next/server';
import * as decentralization from '@/server/api/decentralization';
import * as network from '@/server/api/network';
import * as economics from '@/server/api/economics';
import * as pnodes from '@/server/api/pnodes';

/**
 * Unified API endpoint for pNode data
 * Handles all data types requested by client-side hooks
 */
export async function GET(request: NextRequest) {
    const type = request.nextUrl.searchParams.get('type');
    const period = request.nextUrl.searchParams.get('period') as '24h' | '7d' | '30d' || '24h';
    const metric = request.nextUrl.searchParams.get('metric') || 'nodes';
    const nodeId = request.nextUrl.searchParams.get('nodeId') || undefined;
    const timeframe = request.nextUrl.searchParams.get('timeframe') as '1m' | '3m' | '6m' | '1y' | '2y' || '1y';
    const customNodeCount = request.nextUrl.searchParams.get('customNodeCount')
        ? parseInt(request.nextUrl.searchParams.get('customNodeCount')!, 10)
        : undefined;

    try {
        switch (type) {
            // Network data
            case 'network-stats':
                return NextResponse.json(await network.getNetworkStats());

            case 'network-events':
                return NextResponse.json(await network.getNetworkEvents());

            case 'network-tps':
                return NextResponse.json(await network.calculateNetworkTPS());

            case 'performance-history':
                return NextResponse.json(await network.getPerformanceHistory(period));

            case 'gossip-health':
                return NextResponse.json(await network.getGossipHealth());

            case 'storage-distribution':
                return NextResponse.json(await network.getStorageDistribution());

            // Decentralization data
            case 'decentralization-metrics':
                return NextResponse.json(await decentralization.getDecentralizationMetrics());

            case 'version-distribution':
                return NextResponse.json(await decentralization.getVersionDistribution());

            case 'health-score-breakdown':
                return NextResponse.json(await decentralization.getHealthScoreBreakdown());

            case 'peer-rankings':
                return NextResponse.json(await decentralization.getPeerRankings());

            case 'superminority-info':
                return NextResponse.json(await decentralization.getSuperminorityInfo());

            case 'censorship-resistance':
                return NextResponse.json(await decentralization.getCensorshipResistanceScore());

            case 'x-score':
                return NextResponse.json(await decentralization.getXScore(nodeId));

            case 'trend-data':
                return NextResponse.json(await decentralization.getTrendData(metric, period));

            // Economics data
            case 'epoch-info':
                return NextResponse.json(await economics.getEpochInfo());

            case 'epoch-history':
                return NextResponse.json(await economics.getEpochHistory());

            case 'staking-stats':
                return NextResponse.json(await economics.getStakingStats());

            case 'exabyte-projection':
                return NextResponse.json(await economics.getExabyteProjection(timeframe, customNodeCount));

            case 'commission-history':
                if (!nodeId) {
                    return NextResponse.json({ error: 'nodeId required' }, { status: 400 });
                }
                return NextResponse.json(await economics.getCommissionHistory(nodeId));

            case 'slashing-events':
                return NextResponse.json(await economics.getSlashingEvents());

            // pNode data
            case 'cluster-nodes':
                return NextResponse.json(await pnodes.getClusterNodes());

            default:
                return NextResponse.json(
                    { error: `Unknown type: ${type}. Available: network-stats, network-events, performance-history, gossip-health, storage-distribution, decentralization-metrics, version-distribution, health-score-breakdown, peer-rankings, superminority-info, censorship-resistance, x-score, trend-data, epoch-info, epoch-history, staking-stats, exabyte-projection, commission-history, slashing-events, cluster-nodes` },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error(`API Error (type=${type}):`, error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
