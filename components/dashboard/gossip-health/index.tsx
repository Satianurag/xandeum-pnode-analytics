'use client';

import type { GossipHealth, StorageDistribution } from '@/types/pnode';
import { cn } from '@/lib/utils';

interface GossipHealthProps {
  health: GossipHealth;
}

export function GossipHealthPanel({ health }: GossipHealthProps) {
  const healthColor = health.healthScore >= 90 ? 'text-green-500' 
    : health.healthScore >= 70 ? 'text-yellow-500' 
    : 'text-red-500';

  return (
    <div className="p-4 rounded-lg border-2 border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">
          Gossip Protocol Health
        </div>
        <div className={cn('text-2xl font-display', healthColor)}>
          {health.healthScore.toFixed(0)}%
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-accent/30 rounded p-3">
          <div className="text-xs text-muted-foreground uppercase">Total Peers</div>
          <div className="text-xl font-mono">{health.totalPeers.toLocaleString()}</div>
        </div>
        <div className="bg-accent/30 rounded p-3">
          <div className="text-xs text-muted-foreground uppercase">Avg Peers/Node</div>
          <div className="text-xl font-mono">{health.avgPeersPerNode.toFixed(1)}</div>
        </div>
        <div className="bg-accent/30 rounded p-3">
          <div className="text-xs text-muted-foreground uppercase">Message Rate</div>
          <div className="text-xl font-mono">{health.messageRate.toLocaleString()}/s</div>
        </div>
        <div className="bg-accent/30 rounded p-3">
          <div className="text-xs text-muted-foreground uppercase">Network Latency</div>
          <div className="text-xl font-mono">{health.networkLatency.toFixed(0)}ms</div>
        </div>
      </div>

      {health.partitions > 0 && (
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
          <div className="text-xs text-yellow-500 uppercase font-medium">
            ⚠ {health.partitions} Network Partition{health.partitions > 1 ? 's' : ''} Detected
          </div>
        </div>
      )}
    </div>
  );
}

interface StorageDistributionProps {
  distribution: StorageDistribution[];
}

export function StorageDistributionPanel({ distribution }: StorageDistributionProps) {
  const maxNodes = Math.max(...distribution.map(d => d.nodeCount));

  return (
    <div className="p-4 rounded-lg border-2 border-border">
      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
        Storage Distribution by Region
      </div>

      <div className="space-y-3">
        {distribution.slice(0, 8).map((region) => (
          <div key={region.region} className="flex items-center gap-3">
            <div className="w-24 text-xs truncate">{region.region}</div>
            <div className="flex-1 h-2 bg-accent rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(region.nodeCount / maxNodes) * 100}%` }}
              />
            </div>
            <div className="w-20 text-right text-xs font-mono">
              {region.nodeCount} nodes
            </div>
            <div className="w-16 text-right text-xs text-muted-foreground">
              {region.storageUsedTB.toFixed(1)} TB
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
        {distribution.length} regions • {distribution.reduce((acc, d) => acc + d.nodeCount, 0)} total nodes
      </div>
    </div>
  );
}
