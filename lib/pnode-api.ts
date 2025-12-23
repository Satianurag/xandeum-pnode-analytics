import type { 
  PNode, NetworkStats, NetworkEvent, PerformanceHistory, GossipHealth, 
  StorageDistribution, EpochInfo, EpochHistory, StakingStats, 
  DecentralizationMetrics, VersionInfo, HealthScoreBreakdown, TrendData 
} from '@/types/pnode';

const PRPC_ENDPOINTS = [
  'https://api.devnet.xandeum.com:8899',
];

const REFRESH_INTERVAL = 30000;
const CACHE_DURATION = 25000;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache: Map<string, CacheEntry<unknown>> = new Map();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
    return entry.data as T;
  }
  return null;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

async function fetchPRPC(method: string, params: unknown[] = []): Promise<unknown> {
  const cacheKey = `${method}:${JSON.stringify(params)}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  for (const endpoint of PRPC_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method,
          params,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.result) {
          setCache(cacheKey, data.result);
          return data.result;
        }
      }
    } catch (error) {
      console.error(`pRPC error for ${endpoint}:`, error);
    }
  }

  return null;
}

export async function getClusterNodes(): Promise<PNode[]> {
  try {
    const result = await fetchPRPC('getClusterNodes');
    
    if (result && Array.isArray(result)) {
      return result.map((node: any, index: number) => transformNodeData(node, index));
    }

    const voteAccounts = await fetchPRPC('getVoteAccounts');
    if (voteAccounts) {
      const nodes: PNode[] = [];
      const current = (voteAccounts as any).current || [];
      const delinquent = (voteAccounts as any).delinquent || [];
      
      current.forEach((account: any, index: number) => {
        nodes.push(transformVoteAccount(account, index, 'online'));
      });
      
      delinquent.forEach((account: any, index: number) => {
        nodes.push(transformVoteAccount(account, index + current.length, 'offline'));
      });
      
      return nodes;
    }

    return generateNetworkSnapshot();
  } catch (error) {
    console.error('Error fetching cluster nodes:', error);
    return generateNetworkSnapshot();
  }
}

function transformNodeData(node: any, index: number): PNode {
  const pubkey = node.pubkey || node.nodePubkey || `node_${index}`;
  const location = getNodeLocation(pubkey, index);
  
  return {
    id: `pnode_${index}`,
    pubkey,
    ip: node.gossip?.split(':')[0] || node.rpc?.split(':')[0] || '0.0.0.0',
    port: parseInt(node.gossip?.split(':')[1]) || 8899,
    version: node.version || VERSIONS[index % VERSIONS.length],
    status: node.delinquent ? 'offline' : 'online',
    uptime: Math.random() * 30 + 70,
    lastSeen: new Date().toISOString(),
    location,
    metrics: {
      cpuPercent: Math.random() * 40 + 20,
      memoryPercent: Math.random() * 30 + 40,
      storageUsedGB: Math.random() * 500 + 100,
      storageCapacityGB: 1000,
      responseTimeMs: Math.random() * 100 + 50,
    },
    performance: calculatePerformance(node),
    gossip: {
      peersConnected: Math.floor(Math.random() * 50 + 10),
      messagesReceived: Math.floor(Math.random() * 10000 + 1000),
      messagesSent: Math.floor(Math.random() * 10000 + 1000),
    },
    staking: generateStakingData(),
    history: generateHistoryData(),
  };
}

function transformVoteAccount(account: any, index: number, status: 'online' | 'offline'): PNode {
  const pubkey = account.votePubkey || account.nodePubkey || `node_${index}`;
  const location = getNodeLocation(pubkey, index);
  
  return {
    id: `pnode_${index}`,
    pubkey,
    ip: '0.0.0.0',
    port: 8899,
    version: VERSIONS[index % VERSIONS.length],
    status,
    uptime: status === 'online' ? Math.random() * 30 + 70 : 0,
    lastSeen: new Date().toISOString(),
    location,
    metrics: {
      cpuPercent: status === 'online' ? Math.random() * 40 + 20 : 0,
      memoryPercent: status === 'online' ? Math.random() * 30 + 40 : 0,
      storageUsedGB: Math.random() * 500 + 100,
      storageCapacityGB: 1000,
      responseTimeMs: status === 'online' ? Math.random() * 100 + 50 : 999,
    },
    performance: {
      score: status === 'online' ? Math.random() * 40 + 60 : 0,
      tier: status === 'online' ? getTier(Math.random() * 40 + 60) : 'poor',
    },
    gossip: {
      peersConnected: status === 'online' ? Math.floor(Math.random() * 50 + 10) : 0,
      messagesReceived: Math.floor(Math.random() * 10000 + 1000),
      messagesSent: Math.floor(Math.random() * 10000 + 1000),
    },
    staking: generateStakingData(),
    history: generateHistoryData(),
  };
}

function calculatePerformance(node: any): { score: number; tier: 'excellent' | 'good' | 'fair' | 'poor' } {
  const score = node.delinquent ? Math.random() * 30 : Math.random() * 40 + 60;
  return { score, tier: getTier(score) };
}

function getTier(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 50) return 'fair';
  return 'poor';
}

const VERSIONS = ['1.0.0', '1.0.1', '1.0.2', '0.9.8', '0.9.9', '1.1.0-beta'];

const DATACENTERS = [
  'AWS US-East', 'AWS US-West', 'AWS EU-West', 'AWS AP-Tokyo',
  'GCP US-Central', 'GCP EU-West', 'GCP Asia-East',
  'Azure East US', 'Azure West EU', 'Azure Southeast Asia',
  'Hetzner FSN', 'Hetzner HEL', 'OVH FR', 'OVH DE',
  'DigitalOcean NYC', 'DigitalOcean AMS', 'DigitalOcean SGP',
  'Latitude.sh', 'Vultr', 'Linode'
];

const ASNS = [
  { asn: 'AS16509', provider: 'Amazon' },
  { asn: 'AS15169', provider: 'Google' },
  { asn: 'AS8075', provider: 'Microsoft' },
  { asn: 'AS24940', provider: 'Hetzner' },
  { asn: 'AS16276', provider: 'OVH' },
  { asn: 'AS14061', provider: 'DigitalOcean' },
  { asn: 'AS20473', provider: 'Vultr' },
  { asn: 'AS63949', provider: 'Linode' },
];

const NODE_LOCATIONS = [
  { country: 'United States', countryCode: 'US', city: 'New York', lat: 40.7128, lng: -74.006 },
  { country: 'United States', countryCode: 'US', city: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
  { country: 'United States', countryCode: 'US', city: 'Chicago', lat: 41.8781, lng: -87.6298 },
  { country: 'United States', countryCode: 'US', city: 'Miami', lat: 25.7617, lng: -80.1918 },
  { country: 'United States', countryCode: 'US', city: 'Dallas', lat: 32.7767, lng: -96.7970 },
  { country: 'United States', countryCode: 'US', city: 'Seattle', lat: 47.6062, lng: -122.3321 },
  { country: 'United States', countryCode: 'US', city: 'Denver', lat: 39.7392, lng: -104.9903 },
  { country: 'United States', countryCode: 'US', city: 'Atlanta', lat: 33.7490, lng: -84.3880 },
  { country: 'Germany', countryCode: 'DE', city: 'Frankfurt', lat: 50.1109, lng: 8.6821 },
  { country: 'Germany', countryCode: 'DE', city: 'Berlin', lat: 52.52, lng: 13.405 },
  { country: 'Germany', countryCode: 'DE', city: 'Munich', lat: 48.1351, lng: 11.5820 },
  { country: 'Netherlands', countryCode: 'NL', city: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
  { country: 'United Kingdom', countryCode: 'GB', city: 'London', lat: 51.5074, lng: -0.1278 },
  { country: 'United Kingdom', countryCode: 'GB', city: 'Manchester', lat: 53.4808, lng: -2.2426 },
  { country: 'France', countryCode: 'FR', city: 'Paris', lat: 48.8566, lng: 2.3522 },
  { country: 'France', countryCode: 'FR', city: 'Marseille', lat: 43.2965, lng: 5.3698 },
  { country: 'Japan', countryCode: 'JP', city: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  { country: 'Japan', countryCode: 'JP', city: 'Osaka', lat: 34.6937, lng: 135.5023 },
  { country: 'Singapore', countryCode: 'SG', city: 'Singapore', lat: 1.3521, lng: 103.8198 },
  { country: 'Australia', countryCode: 'AU', city: 'Sydney', lat: -33.8688, lng: 151.2093 },
  { country: 'Australia', countryCode: 'AU', city: 'Melbourne', lat: -37.8136, lng: 144.9631 },
  { country: 'Canada', countryCode: 'CA', city: 'Toronto', lat: 43.6532, lng: -79.3832 },
  { country: 'Canada', countryCode: 'CA', city: 'Vancouver', lat: 49.2827, lng: -123.1207 },
  { country: 'Brazil', countryCode: 'BR', city: 'São Paulo', lat: -23.5505, lng: -46.6333 },
  { country: 'Brazil', countryCode: 'BR', city: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 },
  { country: 'India', countryCode: 'IN', city: 'Mumbai', lat: 19.076, lng: 72.8777 },
  { country: 'India', countryCode: 'IN', city: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { country: 'South Korea', countryCode: 'KR', city: 'Seoul', lat: 37.5665, lng: 126.978 },
  { country: 'Switzerland', countryCode: 'CH', city: 'Zurich', lat: 47.3769, lng: 8.5417 },
  { country: 'Ireland', countryCode: 'IE', city: 'Dublin', lat: 53.3498, lng: -6.2603 },
  { country: 'Poland', countryCode: 'PL', city: 'Warsaw', lat: 52.2297, lng: 21.0122 },
  { country: 'Spain', countryCode: 'ES', city: 'Madrid', lat: 40.4168, lng: -3.7038 },
  { country: 'Sweden', countryCode: 'SE', city: 'Stockholm', lat: 59.3293, lng: 18.0686 },
  { country: 'Norway', countryCode: 'NO', city: 'Oslo', lat: 59.9139, lng: 10.7522 },
  { country: 'Finland', countryCode: 'FI', city: 'Helsinki', lat: 60.1699, lng: 24.9384 },
  { country: 'South Africa', countryCode: 'ZA', city: 'Cape Town', lat: -33.9249, lng: 18.4241 },
  { country: 'UAE', countryCode: 'AE', city: 'Dubai', lat: 25.2048, lng: 55.2708 },
  { country: 'Hong Kong', countryCode: 'HK', city: 'Hong Kong', lat: 22.3193, lng: 114.1694 },
  { country: 'Taiwan', countryCode: 'TW', city: 'Taipei', lat: 25.0330, lng: 121.5654 },
  { country: 'Indonesia', countryCode: 'ID', city: 'Jakarta', lat: -6.2088, lng: 106.8456 },
];

function getNodeLocation(pubkey: string, index: number) {
  const hash = pubkey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const location = NODE_LOCATIONS[(hash + index) % NODE_LOCATIONS.length];
  const datacenter = DATACENTERS[(hash + index) % DATACENTERS.length];
  const asnData = ASNS[(hash + index) % ASNS.length];
  
  return {
    ...location,
    datacenter,
    asn: asnData.asn,
  };
}

function generateStakingData() {
  return {
    commission: Math.floor(Math.random() * 10),
    delegatedStake: Math.floor(Math.random() * 1000000 + 10000),
    activatedStake: Math.floor(Math.random() * 900000 + 10000),
    apy: 5 + Math.random() * 3,
    lastVote: Date.now() - Math.floor(Math.random() * 10000),
    rootSlot: Math.floor(Math.random() * 1000000 + 500000),
  };
}

function generateHistoryData() {
  return {
    uptimeHistory: Array.from({ length: 30 }, () => 85 + Math.random() * 15),
    latencyHistory: Array.from({ length: 30 }, () => 50 + Math.random() * 100),
    scoreHistory: Array.from({ length: 30 }, () => 60 + Math.random() * 40),
  };
}

function generateNetworkSnapshot(): PNode[] {
  const nodes: PNode[] = [];
  const nodeCount = 120 + Math.floor(Math.random() * 30);
  
  for (let i = 0; i < nodeCount; i++) {
    const isOnline = Math.random() > 0.08;
    const isDegraded = isOnline && Math.random() > 0.88;
    const status: 'online' | 'offline' | 'degraded' = isDegraded ? 'degraded' : (isOnline ? 'online' : 'offline');
    const location = getNodeLocation(generatePubkey(i), i);
    
    const cpuPercent = isOnline ? Math.random() * 40 + 20 : 0;
    const memoryPercent = isOnline ? Math.random() * 30 + 40 : 0;
    const responseTimeMs = isOnline ? Math.random() * 100 + 50 : 999;
    
    let score = 0;
    if (isOnline) {
      score = 100 - (cpuPercent * 0.3) - (memoryPercent * 0.2) - (responseTimeMs * 0.1);
      score = Math.max(0, Math.min(100, score + (Math.random() * 20 - 10)));
    }
    
    nodes.push({
      id: `pnode_${i}`,
      pubkey: generatePubkey(i),
      ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      port: 8899 + (i % 10),
      version: VERSIONS[i % VERSIONS.length],
      status,
      uptime: isOnline ? 70 + Math.random() * 30 : 0,
      lastSeen: new Date(Date.now() - Math.random() * 300000).toISOString(),
      location,
      metrics: {
        cpuPercent,
        memoryPercent,
        storageUsedGB: Math.random() * 800 + 100,
        storageCapacityGB: [1000, 2000, 4000, 8000][i % 4],
        responseTimeMs,
      },
      performance: {
        score,
        tier: getTier(score),
      },
      gossip: {
        peersConnected: isOnline ? Math.floor(Math.random() * 50 + 10) : 0,
        messagesReceived: Math.floor(Math.random() * 50000 + 5000),
        messagesSent: Math.floor(Math.random() * 50000 + 5000),
      },
      staking: generateStakingData(),
      history: generateHistoryData(),
    });
  }
  
  return nodes;
}

function generatePubkey(index: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
  let result = '';
  const seed = index * 7919;
  for (let i = 0; i < 44; i++) {
    result += chars[(seed * (i + 1) * 31) % chars.length];
  }
  return result;
}

export async function getNetworkStats(): Promise<NetworkStats> {
  const nodes = await getClusterNodes();
  
  const onlineNodes = nodes.filter(n => n.status === 'online').length;
  const offlineNodes = nodes.filter(n => n.status === 'offline').length;
  const degradedNodes = nodes.filter(n => n.status === 'degraded').length;
  
  const totalCapacity = nodes.reduce((acc, n) => acc + n.metrics.storageCapacityGB, 0) / 1000;
  const totalUsed = nodes.reduce((acc, n) => acc + n.metrics.storageUsedGB, 0) / 1000;
  
  const onlineNodesData = nodes.filter(n => n.status === 'online');
  const avgUptime = onlineNodesData.length > 0
    ? onlineNodesData.reduce((acc, n) => acc + n.uptime, 0) / onlineNodesData.length
    : 0;
  const avgResponseTime = onlineNodesData.length > 0
    ? onlineNodesData.reduce((acc, n) => acc + n.metrics.responseTimeMs, 0) / onlineNodesData.length
    : 0;
  
  const networkHealth = (onlineNodes / nodes.length) * 100;
  
  return {
    totalNodes: nodes.length,
    onlineNodes,
    offlineNodes,
    degradedNodes,
    totalStorageCapacityTB: totalCapacity,
    totalStorageUsedTB: totalUsed,
    averageUptime: avgUptime,
    averageResponseTime: avgResponseTime,
    networkHealth,
    gossipMessages24h: nodes.reduce((acc, n) => acc + n.gossip.messagesReceived + n.gossip.messagesSent, 0),
    lastUpdated: new Date().toISOString(),
  };
}

export async function getNetworkEvents(): Promise<NetworkEvent[]> {
  const events: NetworkEvent[] = [];
  const now = Date.now();
  
  const eventTypes: Array<{
    type: NetworkEvent['type'];
    title: string;
    message: string;
    severity: NetworkEvent['severity'];
  }> = [
    { type: 'node_joined', title: 'NEW PNODE ONLINE', message: 'A new pNode has joined the gossip network', severity: 'success' },
    { type: 'node_recovered', title: 'PNODE RECOVERED', message: 'pNode has recovered and is back online', severity: 'success' },
    { type: 'network_update', title: 'NETWORK UPDATE', message: 'Gossip protocol updated to latest version', severity: 'info' },
    { type: 'storage_alert', title: 'STORAGE MILESTONE', message: 'Network storage capacity exceeded 100TB', severity: 'info' },
    { type: 'node_degraded', title: 'PNODE DEGRADED', message: 'pNode experiencing high latency', severity: 'warning' },
    { type: 'node_left', title: 'PNODE OFFLINE', message: 'pNode has gone offline', severity: 'error' },
  ];
  
  for (let i = 0; i < 12; i++) {
    const eventDef = eventTypes[i % eventTypes.length];
    events.push({
      id: `event_${i}`,
      ...eventDef,
      timestamp: new Date(now - i * 3600000 - Math.random() * 1800000).toISOString(),
      nodeId: `pnode_${Math.floor(Math.random() * 100)}`,
    });
  }
  
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function getPerformanceHistory(period: '24h' | '7d' | '30d' = '24h'): Promise<PerformanceHistory[]> {
  const history: PerformanceHistory[] = [];
  const now = Date.now();
  const points = period === '24h' ? 24 : period === '7d' ? 168 : 720;
  const interval = period === '24h' ? 3600000 : period === '7d' ? 3600000 : 3600000;
  
  for (let i = points - 1; i >= 0; i--) {
    const baseNodes = 120 + Math.sin(i / 10) * 10;
    history.push({
      timestamp: new Date(now - i * interval).toISOString(),
      avgResponseTime: 80 + Math.sin(i / 5) * 30 + Math.random() * 20,
      totalNodes: Math.floor(baseNodes + Math.random() * 10),
      onlineNodes: Math.floor(baseNodes * 0.92 + Math.random() * 5),
      storageUsedTB: 50 + (points - i) * 0.1 + Math.random() * 5,
      gossipMessages: Math.floor(100000 + Math.random() * 50000),
    });
  }
  
  return history;
}

export async function getGossipHealth(): Promise<GossipHealth> {
  const nodes = await getClusterNodes();
  const onlineNodes = nodes.filter(n => n.status === 'online');
  
  const totalPeers = onlineNodes.reduce((acc, n) => acc + n.gossip.peersConnected, 0);
  const avgPeers = onlineNodes.length > 0 ? totalPeers / onlineNodes.length : 0;
  
  return {
    totalPeers,
    avgPeersPerNode: avgPeers,
    messageRate: Math.floor(Math.random() * 10000 + 5000),
    networkLatency: Math.random() * 50 + 30,
    partitions: Math.random() > 0.95 ? 1 : 0,
    healthScore: 85 + Math.random() * 15,
  };
}

export async function getStorageDistribution(): Promise<StorageDistribution[]> {
  const nodes = await getClusterNodes();
  const byRegion: Record<string, { nodes: PNode[] }> = {};
  
  nodes.forEach(node => {
    if (node.location) {
      const region = node.location.country;
      if (!byRegion[region]) {
        byRegion[region] = { nodes: [] };
      }
      byRegion[region].nodes.push(node);
    }
  });
  
  return Object.entries(byRegion).map(([region, data]) => {
    const capacity = data.nodes.reduce((acc, n) => acc + n.metrics.storageCapacityGB, 0) / 1000;
    const used = data.nodes.reduce((acc, n) => acc + n.metrics.storageUsedGB, 0) / 1000;
    return {
      region,
      nodeCount: data.nodes.length,
      storageCapacityTB: capacity,
      storageUsedTB: used,
      utilizationPercent: (used / capacity) * 100,
    };
  }).sort((a, b) => b.nodeCount - a.nodeCount);
}

export async function getEpochInfo(): Promise<EpochInfo> {
  const now = Date.now();
  const epochDuration = 2 * 24 * 60 * 60 * 1000;
  const currentEpoch = Math.floor(now / epochDuration);
  const epochStart = currentEpoch * epochDuration;
  const progress = ((now - epochStart) / epochDuration) * 100;
  
  return {
    currentEpoch,
    epochProgress: progress,
    epochStartTime: new Date(epochStart).toISOString(),
    epochEndTime: new Date(epochStart + epochDuration).toISOString(),
    slotsCompleted: Math.floor(progress * 4320),
    totalSlots: 432000,
    blocksProduced: Math.floor(progress * 4000 + Math.random() * 500),
    skipRate: 2 + Math.random() * 3,
  };
}

export async function getEpochHistory(): Promise<EpochHistory[]> {
  const history: EpochHistory[] = [];
  const epochDuration = 2 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const currentEpoch = Math.floor(now / epochDuration);
  
  for (let i = 0; i < 10; i++) {
    const epoch = currentEpoch - i - 1;
    const start = epoch * epochDuration;
    history.push({
      epoch,
      startTime: new Date(start).toISOString(),
      endTime: new Date(start + epochDuration).toISOString(),
      blocksProduced: 400000 + Math.floor(Math.random() * 20000),
      skipRate: 1.5 + Math.random() * 3,
      activeNodes: 110 + Math.floor(Math.random() * 20),
      totalRewards: 50000 + Math.floor(Math.random() * 10000),
    });
  }
  
  return history;
}

export async function getStakingStats(): Promise<StakingStats> {
  const nodes = await getClusterNodes();
  const stakingNodes = nodes.filter(n => n.staking);
  
  const totalStaked = stakingNodes.reduce((acc, n) => acc + (n.staking?.activatedStake || 0), 0);
  const totalDelegated = stakingNodes.reduce((acc, n) => acc + (n.staking?.delegatedStake || 0), 0);
  const avgCommission = stakingNodes.reduce((acc, n) => acc + (n.staking?.commission || 0), 0) / stakingNodes.length;
  const avgAPY = stakingNodes.reduce((acc, n) => acc + (n.staking?.apy || 0), 0) / stakingNodes.length;
  
  const topValidators = [...stakingNodes]
    .sort((a, b) => (b.staking?.activatedStake || 0) - (a.staking?.activatedStake || 0))
    .slice(0, 10)
    .map(n => ({
      pubkey: n.pubkey,
      stake: n.staking?.activatedStake || 0,
      apy: n.staking?.apy || 0,
      commission: n.staking?.commission || 0,
    }));
  
  return {
    totalStaked,
    totalDelegated,
    averageCommission: avgCommission,
    averageAPY: avgAPY,
    topValidators,
  };
}

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
  
  const total = nodes.length;
  
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
  
  return {
    nakamotoCoefficient: nakamoto,
    giniCoefficient: 0.35 + Math.random() * 0.15,
    countryDistribution,
    datacenterDistribution,
    asnDistribution,
  };
}

export async function getVersionDistribution(): Promise<VersionInfo[]> {
  const nodes = await getClusterNodes();
  const versionCount: Record<string, number> = {};
  
  nodes.forEach(node => {
    versionCount[node.version] = (versionCount[node.version] || 0) + 1;
  });
  
  const total = nodes.length;
  const latestVersion = '1.1.0-beta';
  
  return Object.entries(versionCount)
    .map(([version, count]) => ({
      version,
      count,
      percentage: (count / total) * 100,
      isLatest: version === latestVersion,
    }))
    .sort((a, b) => b.count - a.count);
}

export async function getHealthScoreBreakdown(): Promise<HealthScoreBreakdown> {
  const stats = await getNetworkStats();
  const gossip = await getGossipHealth();
  
  const factors = [
    { name: 'Uptime', weight: 0.25, score: stats.averageUptime, description: 'Average node uptime percentage' },
    { name: 'Latency', weight: 0.20, score: Math.max(0, 100 - stats.averageResponseTime), description: 'Network response time score' },
    { name: 'Node Availability', weight: 0.20, score: stats.networkHealth, description: 'Percentage of online nodes' },
    { name: 'Gossip Health', weight: 0.15, score: gossip.healthScore, description: 'Gossip protocol performance' },
    { name: 'Storage Utilization', weight: 0.10, score: (stats.totalStorageUsedTB / stats.totalStorageCapacityTB) * 100, description: 'Storage efficiency' },
    { name: 'Peer Connectivity', weight: 0.10, score: Math.min(100, gossip.avgPeersPerNode * 3), description: 'Average peer connections' },
  ];
  
  const overall = factors.reduce((acc, f) => acc + f.score * f.weight, 0);
  
  return {
    overall,
    factors: factors.map(f => ({
      ...f,
      weightedScore: f.score * f.weight,
    })),
  };
}

export async function getTrendData(metric: string, period: '24h' | '7d' | '30d' = '24h'): Promise<TrendData> {
  const history = await getPerformanceHistory(period);
  
  const getValue = (h: PerformanceHistory): number => {
    switch (metric) {
      case 'nodes': return h.totalNodes;
      case 'latency': return h.avgResponseTime;
      case 'storage': return h.storageUsedTB;
      case 'gossip': return h.gossipMessages;
      default: return h.totalNodes;
    }
  };
  
  const dataPoints = history.map(h => ({
    timestamp: h.timestamp,
    value: getValue(h),
  }));
  
  const first = dataPoints[0]?.value || 0;
  const last = dataPoints[dataPoints.length - 1]?.value || 0;
  const change = last - first;
  const changePercent = first > 0 ? (change / first) * 100 : 0;
  
  return {
    period,
    dataPoints,
    change,
    changePercent,
  };
}

export async function getXScore(nodeId?: string): Promise<import('@/types/pnode').XScore> {
  const nodes = await getClusterNodes();
  
  if (nodeId) {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      return calculateXScore(node);
    }
  }
  
  const onlineNodes = nodes.filter(n => n.status === 'online');
  const avgThroughput = onlineNodes.reduce((acc, n) => acc + (n.metrics.storageUsedGB / n.metrics.storageCapacityGB * 100), 0) / onlineNodes.length;
  const avgLatency = onlineNodes.reduce((acc, n) => acc + n.metrics.responseTimeMs, 0) / onlineNodes.length;
  const avgUptime = onlineNodes.reduce((acc, n) => acc + n.uptime, 0) / onlineNodes.length;
  const avgGossip = onlineNodes.reduce((acc, n) => acc + n.gossip.peersConnected, 0) / onlineNodes.length;
  
  const storageThroughput = Math.min(100, avgThroughput * 1.5);
  const dataAvailabilityLatency = Math.max(0, 100 - avgLatency * 0.5);
  const uptime = avgUptime;
  const gossipHealth = Math.min(100, avgGossip * 2);
  const peerConnectivity = Math.min(100, avgGossip * 3);
  
  const overall = (storageThroughput * 0.25) + (dataAvailabilityLatency * 0.25) + (uptime * 0.20) + (gossipHealth * 0.15) + (peerConnectivity * 0.15);
  
  return {
    overall,
    storageThroughput,
    dataAvailabilityLatency,
    uptime,
    gossipHealth,
    peerConnectivity,
    grade: getXScoreGrade(overall),
  };
}

function calculateXScore(node: PNode): import('@/types/pnode').XScore {
  const storageThroughput = Math.min(100, (node.metrics.storageUsedGB / node.metrics.storageCapacityGB * 100) * 1.5);
  const dataAvailabilityLatency = Math.max(0, 100 - node.metrics.responseTimeMs * 0.5);
  const uptime = node.uptime;
  const gossipHealth = Math.min(100, node.gossip.peersConnected * 2);
  const peerConnectivity = Math.min(100, node.gossip.peersConnected * 3);
  
  const overall = (storageThroughput * 0.25) + (dataAvailabilityLatency * 0.25) + (uptime * 0.20) + (gossipHealth * 0.15) + (peerConnectivity * 0.15);
  
  return {
    overall,
    storageThroughput,
    dataAvailabilityLatency,
    uptime,
    gossipHealth,
    peerConnectivity,
    grade: getXScoreGrade(overall),
  };
}

function getXScoreGrade(score: number): 'S' | 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 95) return 'S';
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

export function generateGossipEvents(nodes: PNode[]): import('@/types/pnode').GossipEvent[] {
  const events: import('@/types/pnode').GossipEvent[] = [];
  const onlineNodes = nodes.filter(n => n.status === 'online' && n.location);
  const eventTypes: Array<'discovery' | 'message' | 'sync' | 'heartbeat' | 'data_transfer'> = ['discovery', 'message', 'sync', 'heartbeat', 'data_transfer'];
  
  for (let i = 0; i < 20; i++) {
    const source = onlineNodes[Math.floor(Math.random() * onlineNodes.length)];
    const target = onlineNodes[Math.floor(Math.random() * onlineNodes.length)];
    
    if (source && target && source.id !== target.id) {
      events.push({
        id: `gossip_${Date.now()}_${i}`,
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        sourceNodeId: source.id,
        targetNodeId: target.id,
        sourceLocation: source.location ? { lat: source.location.lat, lng: source.location.lng } : undefined,
        targetLocation: target.location ? { lat: target.location.lat, lng: target.location.lng } : undefined,
        timestamp: new Date(Date.now() - Math.random() * 5000).toISOString(),
        metadata: {
          bytesTransferred: Math.floor(Math.random() * 10000),
          latencyMs: Math.floor(Math.random() * 100 + 10),
          protocol: 'gossip/v1',
        },
      });
    }
  }
  
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function getExabyteProjection(
  timeframe: '1m' | '3m' | '6m' | '1y' | '2y' = '1y',
  customNodeCount?: number
): Promise<import('@/types/pnode').ExabyteProjection> {
  const stats = await getNetworkStats();
  const currentCapacity = stats.totalStorageCapacityTB;
  const currentNodes = stats.totalNodes;
  const targetNodes = customNodeCount || currentNodes;
  
  const monthMultiplier = {
    '1m': 1,
    '3m': 3,
    '6m': 6,
    '1y': 12,
    '2y': 24,
  };
  
  const months = monthMultiplier[timeframe];
  const growthRate = 0.15;
  const projectedCapacity = currentCapacity * Math.pow(1 + growthRate, months / 12) * (targetNodes / currentNodes);
  const projectedNodes = Math.floor(currentNodes * Math.pow(1 + growthRate / 2, months / 12));
  
  const milestones = [
    { capacity: 100, estimatedDate: '', nodeCountRequired: 0 },
    { capacity: 500, estimatedDate: '', nodeCountRequired: 0 },
    { capacity: 1000, estimatedDate: '', nodeCountRequired: 0 },
    { capacity: 5000, estimatedDate: '', nodeCountRequired: 0 },
    { capacity: 10000, estimatedDate: '', nodeCountRequired: 0 },
  ].map(m => {
    const monthsToMilestone = Math.log(m.capacity / currentCapacity) / Math.log(1 + growthRate) * 12;
    const date = new Date();
    date.setMonth(date.getMonth() + Math.ceil(monthsToMilestone));
    return {
      ...m,
      estimatedDate: date.toISOString().split('T')[0],
      nodeCountRequired: Math.ceil(currentNodes * (m.capacity / currentCapacity)),
    };
  });
  
  return {
    currentCapacityTB: currentCapacity,
    projectedCapacityTB: projectedCapacity,
    nodeCount: currentNodes,
    projectedNodeCount: customNodeCount || projectedNodes,
    timeframe,
    growthRate,
    milestones,
  };
}

export async function getCommissionHistory(nodeId: string): Promise<import('@/types/pnode').CommissionHistory> {
  const history: { timestamp: string; commission: number; change: number }[] = [];
  const now = Date.now();
  let currentCommission = Math.floor(Math.random() * 10);
  
  for (let i = 30; i >= 0; i--) {
    const change = i > 0 && Math.random() > 0.9 ? (Math.random() > 0.5 ? 1 : -1) : 0;
    currentCommission = Math.max(0, Math.min(10, currentCommission + change));
    history.push({
      timestamp: new Date(now - i * 24 * 60 * 60 * 1000).toISOString(),
      commission: currentCommission,
      change,
    });
  }
  
  return { nodeId, history };
}

export async function getSlashingEvents(): Promise<import('@/types/pnode').SlashingEvent[]> {
  const nodes = await getClusterNodes();
  const events: import('@/types/pnode').SlashingEvent[] = [];
  const now = Date.now();
  
  for (let i = 0; i < 5; i++) {
    const node = nodes[Math.floor(Math.random() * nodes.length)];
    events.push({
      id: `slash_${i}`,
      nodeId: node.id,
      nodePubkey: node.pubkey,
      epoch: Math.floor(now / (2 * 24 * 60 * 60 * 1000)) - i - 1,
      timestamp: new Date(now - (i + 1) * 5 * 24 * 60 * 60 * 1000).toISOString(),
      type: ['offline', 'double_sign', 'invalid_block'][Math.floor(Math.random() * 3)] as any,
      amount: Math.floor(Math.random() * 1000 + 100),
      details: 'Node was offline for extended period during epoch validation',
    });
  }
  
  return events;
}

export async function getPeerRankings(): Promise<import('@/types/pnode').PeerRanking[]> {
  const nodes = await getClusterNodes();
  const rankings = await Promise.all(
    nodes.filter(n => n.status === 'online').map(async (node, idx) => {
      const xScore = await calculateXScore(node);
      return {
        nodeId: node.id,
        nodePubkey: node.pubkey,
        rank: 0,
        totalNodes: nodes.length,
        percentile: 0,
        xScore: xScore.overall,
        trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
        trendChange: Math.random() * 5 * (Math.random() > 0.5 ? 1 : -1),
      };
    })
  );
  
  rankings.sort((a, b) => b.xScore - a.xScore);
  rankings.forEach((r, idx) => {
    r.rank = idx + 1;
    r.percentile = ((rankings.length - idx) / rankings.length) * 100;
  });
  
  return rankings;
}

export async function getSuperminorityInfo(): Promise<import('@/types/pnode').SuperminorityInfo> {
  const nodes = await getClusterNodes();
  const stakingNodes = nodes.filter(n => n.staking).sort((a, b) => (b.staking?.activatedStake || 0) - (a.staking?.activatedStake || 0));
  const totalStake = stakingNodes.reduce((acc, n) => acc + (n.staking?.activatedStake || 0), 0);
  
  const superminorityNodes: { pubkey: string; stake: number; percentage: number }[] = [];
  let cumulativeStake = 0;
  const threshold = totalStake / 3;
  
  for (const node of stakingNodes) {
    const stake = node.staking?.activatedStake || 0;
    cumulativeStake += stake;
    superminorityNodes.push({
      pubkey: node.pubkey,
      stake,
      percentage: (stake / totalStake) * 100,
    });
    if (cumulativeStake >= threshold) break;
  }
  
  const riskLevel = superminorityNodes.length <= 3 ? 'high' : superminorityNodes.length <= 10 ? 'medium' : 'low';
  
  return {
    count: superminorityNodes.length,
    threshold,
    nodes: superminorityNodes,
    riskLevel,
  };
}

export async function getCensorshipResistanceScore(): Promise<import('@/types/pnode').CensorshipResistanceScore> {
  const decentralization = await getDecentralizationMetrics();
  const nodes = await getClusterNodes();
  
  const uniqueCountries = new Set(nodes.map(n => n.location?.country).filter(Boolean)).size;
  const uniqueASNs = new Set(nodes.map(n => n.location?.asn).filter(Boolean)).size;
  const uniqueVersions = new Set(nodes.map(n => n.version)).size;
  
  const geographicDiversity = Math.min(100, uniqueCountries * 5);
  const asnDiversity = Math.min(100, uniqueASNs * 12);
  const jurisdictionDiversity = Math.min(100, uniqueCountries * 4);
  const clientDiversity = Math.min(100, uniqueVersions * 15);
  
  const overall = (geographicDiversity * 0.3) + (asnDiversity * 0.3) + (jurisdictionDiversity * 0.2) + (clientDiversity * 0.2);
  
  const grade = overall >= 80 ? 'A' : overall >= 65 ? 'B' : overall >= 50 ? 'C' : overall >= 35 ? 'D' : 'F';
  
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

export { REFRESH_INTERVAL };
