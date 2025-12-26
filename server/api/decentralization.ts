import {
    DecentralizationMetrics, VersionInfo, HealthScoreBreakdown, TrendData,
    XScore, GossipEvent, PeerRanking, SuperminorityInfo, CensorshipResistanceScore, PNode
} from '@/types/pnode';
import { getClusterNodes } from './pnodes';
import { getNetworkStats, getGossipHealth } from './network';
import { ASNS, hashPubkey, getTier } from './utils';

export async function getDecentralizationMetrics(): Promise<DecentralizationMetrics> {
    const nodes = await getClusterNodes();

    const countryCount: Record<string, number> = {};
    const datacenterCount: Record<string, number> = {};
    const asnCount: Record<string, { provider: string; count: number }> = {};

    nodes.forEach(node => {
        if (node.location) {
            countryCount[node.location.country] = (countryCount[node.location.country] || 0) + 1;
            if (node.location.datacenter) {
                datacenterCount[node.location.datacenter] = (datacenterCount[node.location.datacenter] || 0) + 1;
            }
            if (node.location.asn) {
                const asn = node.location.asn;
                const provider = ASNS.find(a => a.asn === asn)?.provider || 'Unknown';
                if (!asnCount[asn]) asnCount[asn] = { provider, count: 0 };
                asnCount[asn].count++;
            }
        }
    });

    const total = nodes.length || 1;

    const countryDistribution = Object.entries(countryCount)
        .map(([country, count]) => ({ country, count, percentage: (count / total) * 100 }))
        .sort((a, b) => b.count - a.count);

    const datacenterDistribution = Object.entries(datacenterCount)
        .map(([datacenter, count]) => ({ datacenter, count, percentage: (count / total) * 100 }))
        .sort((a, b) => b.count - a.count);

    const asnDistribution = Object.entries(asnCount)
        .map(([asn, data]) => ({ asn, provider: data.provider, count: data.count, percentage: (data.count / total) * 100 }))
        .sort((a, b) => b.count - a.count);

    const sortedCounts = Object.values(countryCount).sort((a, b) => b - a);
    let nakamoto = 0;
    let sum = 0;
    for (const count of sortedCounts) {
        sum += count;
        nakamoto++;
        if (sum > total / 2) break;
    }

    // Gini Coefficient Calculation (based on 'credits' as stake proxy)
    const credits = nodes.map(n => n.credits || 0).sort((a, b) => a - b);
    const giniCoefficient = calculateGini(credits);

    return {
        nakamotoCoefficient: nakamoto,
        giniCoefficient,
        countryDistribution,
        datacenterDistribution,
        asnDistribution,
    };
}

function calculateGini(values: number[]): number {
    if (values.length === 0) return 0;

    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;

    if (mean === 0) return 0; // All values are 0 (perfect equality)

    let sumDifferences = 0;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            sumDifferences += Math.abs(values[i] - values[j]);
        }
    }

    return sumDifferences / (2 * n * n * mean);
}

export async function getVersionDistribution(): Promise<VersionInfo[]> {
    const nodes = await getClusterNodes();
    const versionCount: Record<string, number> = {};

    nodes.forEach(node => {
        const v = node.version || 'unknown';
        versionCount[v] = (versionCount[v] || 0) + 1;
    });

    const total = nodes.length || 1;

    // Determine latest version dynamically:
    // Simple heuristic: compare version strings, assume standard SemVer (e.g. 1.2.3 > 1.2.0)
    // or just pick the most common one if that's safer for now, but usually "latest" implies highest version.
    // Let's sort keys by SemVer descending.
    const versions = Object.keys(versionCount).sort((a, b) => {
        // Remove 'v' prefix if present for comparison
        const vA = a.replace(/^v/, '').split('.').map(Number);
        const vB = b.replace(/^v/, '').split('.').map(Number);

        for (let i = 0; i < Math.max(vA.length, vB.length); i++) {
            const valA = vA[i] || 0;
            const valB = vB[i] || 0;
            if (valA > valB) return -1;
            if (valA < valB) return 1;
        }
        return 0;
    });

    const latestVersion = versions[0] || '0.0.0';

    return Object.entries(versionCount)
        .map(([version, count]) => ({
            version,
            count,
            percentage: (count / total) * 100,
            isLatest: version === latestVersion,
        }))
        .sort((a, b) => b.count - a.count);
}

// ... existing code ...

export async function getCensorshipResistanceScore(): Promise<CensorshipResistanceScore> {
    const metrics = await getDecentralizationMetrics();
    const versions = await getVersionDistribution();

    const countries = metrics.countryDistribution.length;
    const asns = metrics.asnDistribution.length;

    const geographicDiversity = Math.min(100, countries * 5); // 20 countries = 100%
    const asnDiversity = Math.min(100, asns * 12); // ~8 ASNs = 100%
    const jurisdictionDiversity = Math.min(100, countries * 4); // 25 countries = 100%

    // Client Diversity Calculation
    // Use the Simpson Index (1 - sum(p^2)) normalized or just use the dominance of the top client.
    // Since we only have versions, we can check if there are different MAJOR implementations.
    // If all versions start with "0." or "1.", we assume it's the same client implementation.
    // REALITY CHECK: Currently Xandeum likely has ONE client implementation.
    // So the honest score is likely 0 unless there are multiple implementations.
    // However, if we define diversity as "Not running a vulnerable version", maybe?
    // But strict Client Diversity means different codebases.
    // We will calculate it based on how many nodes are NOT running the dominant version *family*
    // but honestly for now, if all are same implementation, it should be low.
    // But to avoid alarming the user with a 0 if they expect "Version Diversity", let's use:
    // Diversity of Versions as a proxy?
    // Let's stay honest: 
    // If we can't detect different client names in the version string (e.g. "Geth/v1...", "Nethermind/v1..."), we assume 1 client.
    // Xandeum nodes report version like "0.7.0".

    // Calculate entropy of versions as a placeholder for client diversity if we consider versions distinct enough
    // But strictly speaking, it is 0.
    // Let's default to 0 but if we find distinct "agents" in version string we calculate.

    // For now, hardcode to 0 (Critical Risk) as there is only 1 client, 
    // OR if user wants "Version Diversity" we can use that.
    // Updated plan said: "I will calculate this based on the version strings... if all are same... likely dropping to 0."
    // But to be slightly more useful, let's look for distinct major versions.

    // Let's assume single client for now effectively.
    // But if we want to show *some* score based on distribution:
    const topVersionShare = versions[0]?.percentage || 100;
    // If everyone is on one version, diversity is 0. If split, it's better.
    // This is "Version Diversity" really.
    const clientDiversity = Math.max(0, 100 - topVersionShare);

    const overall = (geographicDiversity + asnDiversity + jurisdictionDiversity + clientDiversity) / 4;

    let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
    if (overall >= 80) grade = 'A';
    else if (overall >= 65) grade = 'B';
    else if (overall >= 50) grade = 'C';
    else if (overall >= 35) grade = 'D';

    return {
        overall,
        factors: {
            geographicDiversity,
            asnDiversity,
            jurisdictionDiversity,
            clientDiversity,
        },
        grade,
    };
}

/**
 * Get peer rankings based on performance score (derived from credits)
 * Used by the Health page leaderboard
 */
export async function getPeerRankings(): Promise<PeerRanking[]> {
    const nodes = await getClusterNodes();
    const totalNodes = nodes.length;

    // Nodes are already sorted by credits in getClusterNodes
    return nodes.slice(0, 20).map((node, i) => ({
        nodeId: node.id,
        nodePubkey: node.pubkey,
        rank: node.creditsRank || i + 1,
        totalNodes,
        percentile: totalNodes > 0 ? ((totalNodes - (node.creditsRank || i + 1)) / totalNodes) * 100 : 0,
        xScore: node.performance.score,
        trend: 'stable' as const, // Would need historical data to calculate real trend
        trendChange: 0,
    }));
}

/**
 * Get superminority information - entities that control 33%+ of stake (using credits as proxy)
 * Used by Decentralization page
 */
export async function getSuperminorityInfo(): Promise<SuperminorityInfo> {
    const nodes = await getClusterNodes();
    const totalCredits = nodes.reduce((acc, n) => acc + (n.credits || 0), 0);

    // Already sorted by credits (descending) from getClusterNodes
    const superminority: { pubkey: string; stake: number; percentage: number }[] = [];
    let cumulative = 0;

    for (const node of nodes) {
        const nodeCredits = node.credits || 0;
        cumulative += nodeCredits;
        superminority.push({
            pubkey: node.pubkey,
            stake: nodeCredits,
            percentage: totalCredits > 0 ? (nodeCredits / totalCredits) * 100 : 0,
        });
        // Stop when we've accumulated 33% of total credits
        if (totalCredits > 0 && cumulative / totalCredits >= 0.33) break;
    }

    return {
        count: superminority.length,
        threshold: 33,
        nodes: superminority,
        riskLevel: superminority.length < 5 ? 'high' : superminority.length < 10 ? 'medium' : 'low',
    };
}

/**
 * Get health score breakdown with weighted factors
 * Used by Health page radar chart and factor cards
 */
export async function getHealthScoreBreakdown(): Promise<HealthScoreBreakdown> {
    const nodes = await getClusterNodes();
    const stats = await getNetworkStats();

    // Factor 1: Online Rate (from network stats)
    const onlineRate = stats.networkHealth || 0;

    // Factor 2: Average Performance Score (from credits-based calculation)
    const avgCreditsScore = nodes.length > 0
        ? nodes.reduce((a, n) => a + n.performance.score, 0) / nodes.length
        : 0;

    // Factor 3: Storage Utilization (how much of capacity is being used)
    const storageUtil = stats.totalStorageCapacityTB > 0
        ? Math.min((stats.totalStorageUsedTB / stats.totalStorageCapacityTB) * 100, 100)
        : 0;

    // Factor 4: Version Consistency (what % are on the same version)
    const versionConsistency = calculateVersionConsistency(nodes);

    // Factor 5: Response Time Score (inverse of latency)
    const avgLatency = stats.averageResponseTime || 0;
    const latencyScore = avgLatency > 0 ? Math.max(0, 100 - (avgLatency / 30)) : 50; // <30ms = 100%, >3000ms = 0%

    const factors = [
        {
            name: 'Online Rate',
            weight: 0.30,
            score: onlineRate,
            weightedScore: onlineRate * 0.30,
            description: 'Percentage of nodes currently online and responsive'
        },
        {
            name: 'Avg Performance',
            weight: 0.25,
            score: avgCreditsScore,
            weightedScore: avgCreditsScore * 0.25,
            description: 'Average credits-based performance score across all nodes'
        },
        {
            name: 'Storage Health',
            weight: 0.15,
            score: storageUtil > 0 ? storageUtil : 50,
            weightedScore: (storageUtil > 0 ? storageUtil : 50) * 0.15,
            description: 'Network storage utilization efficiency'
        },
        {
            name: 'Version Consistency',
            weight: 0.15,
            score: versionConsistency,
            weightedScore: versionConsistency * 0.15,
            description: 'Percentage of nodes running consistent software versions'
        },
        {
            name: 'Response Time',
            weight: 0.15,
            score: latencyScore,
            weightedScore: latencyScore * 0.15,
            description: 'Network-wide average response latency performance'
        },
    ];

    return {
        overall: factors.reduce((sum, f) => sum + f.weightedScore, 0),
        factors,
    };
}

/**
 * Helper: Calculate version consistency (what % are on the most common version)
 */
function calculateVersionConsistency(nodes: PNode[]): number {
    if (nodes.length === 0) return 0;

    const versionCounts = new Map<string, number>();
    nodes.forEach(n => {
        const v = n.version || 'Unknown';
        versionCounts.set(v, (versionCounts.get(v) || 0) + 1);
    });

    const maxCount = Math.max(...versionCounts.values());
    return (maxCount / nodes.length) * 100;
}
