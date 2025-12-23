'use client';

import DashboardPageLayout from "@/components/dashboard/layout";
import { useVersionDistribution, usePNodes } from "@/hooks/use-pnode-data";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';

const LayersIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
  </svg>
);

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
      </div>
      <Skeleton className="h-80 rounded-lg" />
    </div>
  );
}

const COLORS = ['#00ff88', '#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

export default function VersionsPage() {
  const { data: versions, loading: versionsLoading } = useVersionDistribution();
  const { data: nodes, loading: nodesLoading } = usePNodes();

  const isLoading = versionsLoading || nodesLoading;

  if (isLoading && !versions) {
    return (
      <DashboardPageLayout header={{ title: "Versions", description: "Loading...", icon: LayersIcon }}>
        <LoadingState />
      </DashboardPageLayout>
    );
  }

  const latestVersion = versions?.find(v => v.isLatest);
  const outdatedCount = versions?.filter(v => !v.isLatest).reduce((acc, v) => acc + v.count, 0) || 0;
  const totalNodes = nodes?.length || 0;
  const latestPercentage = latestVersion ? latestVersion.percentage : 0;

  const pieData = versions?.map((v, i) => ({
    name: v.version,
    value: v.count,
    color: v.isLatest ? '#00ff88' : COLORS[(i + 1) % COLORS.length],
    isLatest: v.isLatest,
  })) || [];

  const nodesByVersion = versions?.map(v => ({
    version: v.version,
    nodes: nodes?.filter(n => n.version === v.version) || [],
    isLatest: v.isLatest,
  })) || [];

  return (
    <DashboardPageLayout
      header={{
        title: "Versions",
        description: "Node software distribution",
        icon: LayersIcon,
      }}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border-2 border-primary/50 bg-primary/5">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Latest Version</div>
          <div className="text-2xl font-display text-primary font-mono">{latestVersion?.version || '-'}</div>
          <div className="text-xs text-muted-foreground mt-1">current release</div>
        </div>
        <div className="p-4 rounded-lg border-2 border-green-500/30 bg-green-500/5">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">On Latest</div>
          <div className="text-3xl font-display text-green-400">{latestVersion?.count || 0}</div>
          <div className="text-xs text-muted-foreground mt-1">{latestPercentage.toFixed(1)}% of network</div>
        </div>
        <div className="p-4 rounded-lg border-2 border-yellow-500/30 bg-yellow-500/5">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Outdated</div>
          <div className="text-3xl font-display text-yellow-400">{outdatedCount}</div>
          <div className="text-xs text-muted-foreground mt-1">need upgrade</div>
        </div>
        <div className="p-4 rounded-lg border-2 border-border">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Versions Active</div>
          <div className="text-3xl font-display">{versions?.length || 0}</div>
          <div className="text-xs text-muted-foreground mt-1">in network</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border-2 border-border overflow-hidden">
          <div className="px-4 py-2 border-b border-border bg-accent/20">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Version Distribution
            </span>
          </div>
          <div className="p-4 h-[300px] flex items-center">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value, name) => [`${Number(value)} nodes (${((Number(value) / totalNodes) * 100).toFixed(1)}%)`, String(name)]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-2 pl-4">
              {pieData.map((v) => (
                <div key={v.name} className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: v.color }} />
                  <span className="flex-1 font-mono">{v.name}</span>
                  {v.isLatest && <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">LATEST</span>}
                  <span className="text-muted-foreground">{v.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-lg border-2 border-border overflow-hidden">
          <div className="px-4 py-2 border-b border-border bg-accent/20">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Upgrade Progress
            </span>
          </div>
          <div className="p-4 space-y-4">
            <div className="text-center py-4">
              <div className="text-5xl font-display text-primary">{latestPercentage.toFixed(0)}%</div>
              <div className="text-sm text-muted-foreground mt-1">on latest version</div>
            </div>
            <div className="h-4 bg-accent rounded-full overflow-hidden flex">
              <div className="h-full bg-green-500" style={{ width: `${latestPercentage}%` }} />
              <div className="h-full bg-yellow-500" style={{ width: `${100 - latestPercentage}%` }} />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{latestVersion?.count || 0} nodes on {latestVersion?.version}</span>
              <span>{outdatedCount} nodes need upgrade</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border-2 border-border overflow-hidden">
        <div className="px-4 py-2 border-b border-border bg-accent/20">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Version Details
          </span>
        </div>
        <div className="divide-y divide-border">
          {versions?.map((v) => (
            <div key={v.version} className="px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-lg text-primary">v{v.version}</span>
                  {v.isLatest && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                      LATEST
                    </span>
                  )}
                  {!v.isLatest && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                      OUTDATED
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-mono">{v.count} nodes</div>
                  <div className="text-xs text-muted-foreground">{v.percentage.toFixed(1)}%</div>
                </div>
              </div>
              <div className="h-2 bg-accent rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${v.isLatest ? 'bg-green-500' : 'bg-yellow-500'}`}
                  style={{ width: `${v.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border-2 border-border p-4">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
          Upgrade Recommendations
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-accent/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${latestPercentage > 80 ? 'bg-green-500' : latestPercentage > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} />
              <span className="text-sm font-medium">Network Health</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {latestPercentage > 80 
                ? 'Excellent! Most nodes are running the latest version.'
                : latestPercentage > 50
                ? 'Good progress, but more nodes should upgrade to ensure consistency.'
                : 'Action needed: Many nodes are running outdated software.'}
            </p>
          </div>
          <div className="p-4 bg-accent/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm font-medium">Next Steps</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {outdatedCount > 0 
                ? `${outdatedCount} nodes should upgrade to v${latestVersion?.version} for optimal performance and security.`
                : 'All nodes are up to date! Monitor for new releases.'}
            </p>
          </div>
        </div>
      </div>
    </DashboardPageLayout>
  );
}
