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

  const bulletColor = health.healthScore >= 90 ? 'bg-green-500'
    : health.healthScore >= 70 ? 'bg-yellow-500'
      : 'bg-red-500';

  return (
    <div className="rounded-lg border-2 border-border overflow-hidden">
      <div className="px-4 py-2 border-b border-border bg-accent/20 flex items-center justify-between">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          Gossip Protocol Health
        </span>
        <span className={cn('text-lg font-display', healthColor)}>
          {health.healthScore.toFixed(0)}%
        </span>
      </div>

      <div className="grid grid-cols-2">
        {/* Total Peers */}
        <div className="border-r border-b border-border">
          <div className="flex items-center justify-between p-3 border-b border-border">
            <div className="flex items-center gap-2.5 font-semibold leading-none tracking-tight text-sm uppercase">
              <span className="size-2 rounded-full bg-primary" />
              Total Peers
            </div>
          </div>
          <div className="bg-accent p-3">
            <div className="text-2xl font-display">{health.totalPeers.toLocaleString()}</div>
            <p className="text-xs font-medium text-muted-foreground tracking-wide">connections</p>
          </div>
        </div>

        {/* Avg Peers/Node */}
        <div className="border-b border-border">
          <div className="flex items-center justify-between p-3 border-b border-border">
            <div className="flex items-center gap-2.5 font-semibold leading-none tracking-tight text-sm uppercase">
              <span className="size-2 rounded-full bg-primary" />
              Avg Peers/Node
            </div>
          </div>
          <div className="bg-accent p-3">
            <div className="text-2xl font-display">{health.avgPeersPerNode.toFixed(1)}</div>
            <p className="text-xs font-medium text-muted-foreground tracking-wide">per node</p>
          </div>
        </div>

        {/* Message Rate */}
        <div className="border-r border-border">
          <div className="flex items-center justify-between p-3 border-b border-border">
            <div className="flex items-center gap-2.5 font-semibold leading-none tracking-tight text-sm uppercase">
              <span className="size-2 rounded-full bg-primary" />
              Message Rate
            </div>
          </div>
          <div className="bg-accent p-3">
            <div className="text-2xl font-display">{health.messageRate.toLocaleString()}/s</div>
            <p className="text-xs font-medium text-muted-foreground tracking-wide">msgs/sec</p>
          </div>
        </div>

        {/* Network Latency */}
        <div>
          <div className="flex items-center justify-between p-3 border-b border-border">
            <div className="flex items-center gap-2.5 font-semibold leading-none tracking-tight text-sm uppercase">
              <span className="size-2 rounded-full bg-primary" />
              Network Latency
            </div>
          </div>
          <div className="bg-accent p-3">
            <div className="text-2xl font-display">{health.networkLatency.toFixed(0)}ms</div>
            <p className="text-xs font-medium text-muted-foreground tracking-wide">avg latency</p>
          </div>
        </div>
      </div>

      {health.partitions > 0 && (
        <div className="p-3 bg-yellow-500/10 border-t border-yellow-500/30">
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
