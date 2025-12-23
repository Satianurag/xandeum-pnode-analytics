'use client';

import type { PNode } from '@/types/pnode';
import { cn } from '@/lib/utils';

interface LeaderboardProps {
  nodes: PNode[];
  onNodeSelect?: (node: PNode) => void;
}

export function PerformanceLeaderboard({ nodes, onNodeSelect }: LeaderboardProps) {
  const sortedNodes = [...nodes]
    .filter(n => n.status === 'online')
    .sort((a, b) => b.performance.score - a.performance.score)
    .slice(0, 10);

  const getTierBadge = (tier: PNode['performance']['tier'], rank: number) => {
    const styles = {
      excellent: 'bg-green-500/20 text-green-400 border-green-500/50',
      good: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      fair: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      poor: 'bg-red-500/20 text-red-400 border-red-500/50',
    };

    return (
      <span className={cn(
        'px-2 py-0.5 rounded border text-xs uppercase',
        styles[tier]
      )}>
        {tier}
      </span>
    );
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'text-yellow-400 bg-yellow-500/10';
    if (rank === 2) return 'text-slate-300 bg-slate-500/10';
    if (rank === 3) return 'text-amber-600 bg-amber-500/10';
    return 'text-muted-foreground bg-accent/30';
  };

  return (
    <div className="p-4 rounded-lg border-2 border-border">
      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
        Performance Leaderboard
      </div>

      <div className="space-y-2">
        {sortedNodes.map((node, index) => {
          const rank = index + 1;
          return (
            <div
              key={node.id}
              onClick={() => onNodeSelect?.(node)}
              className="flex items-center gap-3 p-3 rounded-lg bg-accent/20 hover:bg-accent/40 cursor-pointer transition-colors"
            >
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center font-display text-lg',
                getRankStyle(rank)
              )}>
                {rank}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">
                    {node.pubkey.slice(0, 8)}...{node.pubkey.slice(-4)}
                  </span>
                  {getTierBadge(node.performance.tier, rank)}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {node.location?.city}, {node.location?.country}
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-mono text-primary">
                  {node.performance.score.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {node.uptime.toFixed(1)}% uptime
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MetricsComparison({ nodes }: { nodes: PNode[] }) {
  const onlineNodes = nodes.filter(n => n.status === 'online');
  
  const avgScore = onlineNodes.reduce((acc, n) => acc + n.performance.score, 0) / onlineNodes.length;
  const avgUptime = onlineNodes.reduce((acc, n) => acc + n.uptime, 0) / onlineNodes.length;
  const avgLatency = onlineNodes.reduce((acc, n) => acc + n.metrics.responseTimeMs, 0) / onlineNodes.length;
  const avgCpu = onlineNodes.reduce((acc, n) => acc + n.metrics.cpuPercent, 0) / onlineNodes.length;
  
  const topNodes = [...onlineNodes].sort((a, b) => b.performance.score - a.performance.score).slice(0, 10);
  const topAvgScore = topNodes.reduce((acc, n) => acc + n.performance.score, 0) / topNodes.length;
  const topAvgLatency = topNodes.reduce((acc, n) => acc + n.metrics.responseTimeMs, 0) / topNodes.length;

  const metrics = [
    { label: 'Network Avg Score', value: avgScore.toFixed(1), benchmark: topAvgScore.toFixed(1), unit: '' },
    { label: 'Network Avg Uptime', value: avgUptime.toFixed(1), benchmark: '99.5', unit: '%' },
    { label: 'Network Avg Latency', value: avgLatency.toFixed(0), benchmark: topAvgLatency.toFixed(0), unit: 'ms' },
    { label: 'Network Avg CPU', value: avgCpu.toFixed(1), benchmark: '40.0', unit: '%' },
  ];

  return (
    <div className="p-4 rounded-lg border-2 border-border">
      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
        Network vs Top 10 Comparison
      </div>

      <div className="space-y-4">
        {metrics.map((metric) => {
          const current = parseFloat(metric.value);
          const benchmark = parseFloat(metric.benchmark);
          const ratio = Math.min(100, (current / benchmark) * 100);
          
          return (
            <div key={metric.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">{metric.label}</span>
                <span className="font-mono">{metric.value}{metric.unit}</span>
              </div>
              <div className="h-2 bg-accent rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${ratio}%` }}
                />
              </div>
              <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                <span>0</span>
                <span className="text-primary">Top 10: {metric.benchmark}{metric.unit}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
