/**
 * Metric Definitions
 * Educational content explaining all dashboard metrics for tooltips
 */

// ============================================================
// X-SCORE METRICS
// ============================================================

export const xScoreDefinitions = {
    overall: {
        label: 'Overall X-Score',
        description: 'A composite score (0-100) that represents the overall health and performance of a pNode, calculated from multiple factors including throughput, latency, uptime, and gossip health.',
        formula: 'Weighted average of: Storage Throughput (25%), Data Availability Latency (25%), Uptime (25%), Gossip Health (15%), Peer Connectivity (10%)',
    },
    storageThroughput: {
        label: 'Storage Throughput',
        description: 'Measures the node\'s ability to read and write data efficiently. Higher throughput indicates better performance for storage operations.',
        unit: 'MB/s',
    },
    dataAvailabilityLatency: {
        label: 'Data Availability Latency',
        description: 'The time it takes for a node to make stored data available for retrieval. Lower latency scores higher.',
        unit: 'ms',
    },
    uptime: {
        label: 'Uptime Score',
        description: 'Percentage of time the node has been online and responsive over the measurement period. Target: 99.9%+',
        unit: '%',
    },
    gossipHealth: {
        label: 'Gossip Health',
        description: 'Measures the node\'s participation in the gossip protocol network, including peer discovery, message propagation, and network synchronization.',
        unit: 'score',
    },
    grade: {
        label: 'Performance Grade',
        description: 'Letter grade based on overall X-Score: S (95+), A (85+), B (70+), C (50+), D (30+), F (<30)',
    },
};

// ============================================================
// NETWORK STATS
// ============================================================

export const networkStatsDefinitions = {
    totalNodes: {
        label: 'Total Nodes',
        description: 'Total number of pNodes registered in the Xandeum network, regardless of their current status.',
    },
    onlineNodes: {
        label: 'Online Nodes',
        description: 'Number of pNodes currently active and responding to network requests.',
    },
    offlineNodes: {
        label: 'Offline Nodes',
        description: 'Number of pNodes that are not responding. These may be undergoing maintenance or experiencing issues.',
    },
    degradedNodes: {
        label: 'Degraded Nodes',
        description: 'Nodes that are online but experiencing performance issues such as high latency or reduced throughput.',
    },
    networkHealth: {
        label: 'Network Health',
        description: 'Percentage of nodes that are online and performing well. Calculated as: (Online Nodes / Total Nodes) × 100.',
        unit: '%',
    },
    averageUptime: {
        label: 'Average Uptime',
        description: 'Mean uptime percentage across all online nodes in the network.',
        unit: '%',
    },
    averageResponseTime: {
        label: 'Average Response Time',
        description: 'Mean network latency across all online nodes. Lower is better.',
        unit: 'ms',
    },
    totalStorageCapacity: {
        label: 'Total Storage Capacity',
        description: 'Combined storage capacity of all pNodes in the network.',
        unit: 'TB',
    },
    totalStorageUsed: {
        label: 'Storage Used',
        description: 'Total storage currently being utilized across all pNodes.',
        unit: 'TB',
    },
    gossipMessages24h: {
        label: 'Gossip Messages (24h)',
        description: 'Total number of gossip protocol messages exchanged in the last 24 hours. Higher numbers indicate an active, healthy network.',
    },
};

// ============================================================
// NODE METRICS
// ============================================================

export const nodeMetricsDefinitions = {
    pubkey: {
        label: 'Public Key',
        description: 'The unique cryptographic identifier for this pNode on the Xandeum network.',
    },
    status: {
        label: 'Status',
        description: 'Current operational state: Online (active), Offline (not responding), or Degraded (experiencing issues).',
    },
    credits: {
        label: 'Pod Credits',
        description: 'A reliability metric from the Pod Credits API. Higher credits indicate consistent uptime and good performance. Credits are earned by maintaining node availability.',
    },
    creditsRank: {
        label: 'Credits Rank',
        description: 'This node\'s position among all pNodes when sorted by credits. Lower rank = better performance.',
    },
    uptime: {
        label: 'Uptime',
        description: 'Percentage of time this node has been available and responsive over the last 30 days.',
        unit: '%',
    },
    responseTime: {
        label: 'Response Time / Latency',
        description: 'Average time for the node to respond to network requests. Lower values indicate better performance.',
        unit: 'ms',
    },
    performanceScore: {
        label: 'Performance Score',
        description: 'A 0-100 score based on credits, uptime, latency, and other factors. Determines performance tier.',
    },
    performanceTier: {
        label: 'Performance Tier',
        description: 'Excellent (80+), Good (60-79), Fair (30-59), Poor (<30). Based on the performance score.',
    },
};

// ============================================================
// STAKING METRICS
// ============================================================

export const stakingDefinitions = {
    commission: {
        label: 'Commission',
        description: 'Percentage of staking rewards the validator takes as a fee before distributing to delegators. Lower is generally better for delegators.',
        unit: '%',
    },
    apy: {
        label: 'APY (Annual Percentage Yield)',
        description: 'Estimated annual return on staked tokens, after accounting for commission. This is an estimate based on recent performance.',
        unit: '%',
    },
    delegatedStake: {
        label: 'Delegated Stake',
        description: 'Total amount of tokens delegated to this validator by stakers.',
        unit: 'SOL',
    },
    activatedStake: {
        label: 'Activated Stake',
        description: 'Amount of delegated stake that is currently active and earning rewards.',
        unit: 'SOL',
    },
    skipRate: {
        label: 'Skip Rate',
        description: 'Percentage of blocks this validator was supposed to produce but missed. Lower is better. High skip rates may indicate reliability issues.',
        unit: '%',
    },
    voteCredits: {
        label: 'Vote Credits',
        description: 'Credits earned by the validator for participating in consensus voting. More credits = better participation.',
    },
};

// ============================================================
// DECENTRALIZATION METRICS
// ============================================================

export const decentralizationDefinitions = {
    nakamotoCoefficient: {
        label: 'Nakamoto Coefficient',
        description: 'The minimum number of entities that would need to collude to compromise the network. Higher is better for decentralization.',
    },
    giniCoefficient: {
        label: 'Gini Coefficient',
        description: 'A measure of stake distribution inequality (0-1). Lower values indicate more equal distribution of stake among validators.',
    },
    superminority: {
        label: 'Superminority',
        description: 'The smallest set of validators that collectively control >33% of stake, giving them the power to halt consensus.',
    },
    countryDistribution: {
        label: 'Geographic Distribution',
        description: 'How nodes are distributed across different countries. More diverse distribution improves censorship resistance.',
    },
    datacenterDistribution: {
        label: 'Datacenter Distribution',
        description: 'Distribution of nodes across hosting providers. Concentration in few datacenters is a centralization risk.',
    },
    asnDistribution: {
        label: 'ASN Distribution',
        description: 'Distribution of nodes by Autonomous System Number (network provider). Diverse ASNs improve network resilience.',
    },
};

// ============================================================
// GOSSIP PROTOCOL
// ============================================================

export const gossipDefinitions = {
    peersConnected: {
        label: 'Connected Peers',
        description: 'Number of other pNodes this node is directly connected to for gossip communication.',
    },
    messagesReceived: {
        label: 'Messages Received',
        description: 'Total gossip protocol messages received from peers. Includes heartbeats, data sync, and peer discovery.',
    },
    messagesSent: {
        label: 'Messages Sent',
        description: 'Total gossip protocol messages sent to peers.',
    },
    messageRate: {
        label: 'Message Rate',
        description: 'Average number of gossip messages processed per hour.',
        unit: 'msgs/hr',
    },
    networkLatency: {
        label: 'Network Latency',
        description: 'Average time for gossip messages to propagate between nodes.',
        unit: 'ms',
    },
    healthScore: {
        label: 'Gossip Health Score',
        description: 'Overall measure of gossip protocol performance (0-100). Factors in peer count, message rate, and latency.',
    },
};

// ============================================================
// EPOCH INFO
// ============================================================

export const epochDefinitions = {
    currentEpoch: {
        label: 'Current Epoch',
        description: 'The current epoch number. An epoch is a fixed time period during which validator assignments remain constant.',
    },
    epochProgress: {
        label: 'Epoch Progress',
        description: 'Percentage of the current epoch that has elapsed.',
        unit: '%',
    },
    slotsCompleted: {
        label: 'Slots Completed',
        description: 'Number of slots processed in the current epoch. Each slot is an opportunity for a block to be produced.',
    },
    blocksProduced: {
        label: 'Blocks Produced',
        description: 'Total number of blocks successfully produced in this epoch.',
    },
    skipRate: {
        label: 'Epoch Skip Rate',
        description: 'Percentage of slots where no block was produced. Lower is better.',
        unit: '%',
    },
};

// ============================================================
// HELPER FUNCTION
// ============================================================

export type MetricCategory =
    | 'xScore'
    | 'networkStats'
    | 'nodeMetrics'
    | 'staking'
    | 'decentralization'
    | 'gossip'
    | 'epoch';

export function getMetricDefinition(category: MetricCategory, key: string) {
    const categories = {
        xScore: xScoreDefinitions,
        networkStats: networkStatsDefinitions,
        nodeMetrics: nodeMetricsDefinitions,
        staking: stakingDefinitions,
        decentralization: decentralizationDefinitions,
        gossip: gossipDefinitions,
        epoch: epochDefinitions,
    };

    return categories[category]?.[key as keyof typeof categories[typeof category]] || null;
}
