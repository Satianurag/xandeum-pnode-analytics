'use client';

import DashboardPageLayout from "@/components/dashboard/layout";
import GlobeIcon from "@/components/icons/globe";
import { usePNodes, useGossipHealth, useStorageDistribution } from "@/hooks/use-pnode-data-query";
import { LeafletMap } from "@/components/dashboard/leaflet-map";
import { GossipHealthPanel, StorageDistributionPanel } from "@/components/dashboard/gossip-health";
import { Skeleton } from "@/components/ui/skeleton";

function LoadingState() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-[350px] rounded-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    </div>
  );
}

export default function NetworkPage() {
  const { data: nodes, isLoading: nodesLoading, dataUpdatedAt } = usePNodes();
  const { data: gossipHealth, isLoading: gossipLoading } = useGossipHealth();
  const { data: distribution, isLoading: distLoading } = useStorageDistribution();

  const isLoading = nodesLoading || gossipLoading || distLoading;

  if (isLoading && !nodes) {
    return (
      <DashboardPageLayout header={{ title: "Topology", description: "Loading...", icon: GlobeIcon }}>
        <LoadingState />
      </DashboardPageLayout>
    );
  }

  const onlineNodes = nodes?.filter(n => n.status === 'online') || [];
  const totalMessages = nodes?.reduce((acc, n) => acc + n.gossip.messagesReceived + n.gossip.messagesSent, 0) || 0;
  const avgPeers = onlineNodes.length > 0
    ? onlineNodes.reduce((acc, n) => acc + n.gossip.peersConnected, 0) / onlineNodes.length
    : 0;

  return (
    <DashboardPageLayout
      header={{
        title: "Topology",
        description: `Gossip network • ${dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : 'Connecting...'}`,
        icon: GlobeIcon,
      }}
    >
      <div className="rounded-lg border-2 border-border overflow-hidden mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {/* Active Nodes */}
          <div className="border-r border-b lg:border-b-0 border-border">
            <div className="flex items-center justify-between p-3 border-b border-border">
              <div className="flex items-center gap-2.5 font-semibold leading-none tracking-tight text-sm uppercase">
                <span className="size-2 rounded-full bg-green-500" />
                Active Nodes
              </div>
            </div>
            <div className="bg-accent p-3">
              <div className="text-3xl font-display text-green-400">{onlineNodes.length}</div>
              <p className="text-xs font-medium text-muted-foreground tracking-wide">of {nodes?.length || 0} total</p>
            </div>
          </div>

          {/* Avg Peers */}
          <div className="border-b lg:border-b-0 lg:border-r border-border">
            <div className="flex items-center justify-between p-3 border-b border-border">
              <div className="flex items-center gap-2.5 font-semibold leading-none tracking-tight text-sm uppercase">
                <span className="size-2 rounded-full bg-primary" />
                Avg Peers
              </div>
            </div>
            <div className="bg-accent p-3">
              <div className="text-3xl font-display">{avgPeers.toFixed(1)}</div>
              <p className="text-xs font-medium text-muted-foreground tracking-wide">connections per node</p>
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
              <div className="text-3xl font-display">{gossipHealth?.messageRate.toLocaleString()}</div>
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
              <div className="text-3xl font-display">{gossipHealth?.networkLatency.toFixed(0)}ms</div>
              <p className="text-xs font-medium text-muted-foreground tracking-wide">avg propagation</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border-2 border-border overflow-hidden">
        <div className="px-4 py-2 border-b border-border bg-accent/20 flex items-center justify-between">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Network Topology - Gossip Protocol
          </span>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-muted-foreground">Herrenberg Protocol Active</span>
          </div>
        </div>
        <div className="h-[400px]">
          {nodes && <LeafletMap nodes={nodes} />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {gossipHealth && <GossipHealthPanel health={gossipHealth} />}
        {distribution && <StorageDistributionPanel distribution={distribution} />}
      </div>

      <div className="rounded-lg border-2 border-border overflow-hidden">
        <div className="px-4 py-2 border-b border-border bg-accent/20">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Peer Connection Distribution
          </span>
        </div>
        <div className="p-4 space-y-3">
          {[
            { label: '50+ peers', min: 50, max: Infinity, color: 'bg-green-500', bullet: 'bg-green-500' },
            { label: '30-50 peers', min: 30, max: 50, color: 'bg-blue-500', bullet: 'bg-blue-500' },
            { label: '15-30 peers', min: 15, max: 30, color: 'bg-yellow-500', bullet: 'bg-yellow-500' },
            { label: '< 15 peers', min: 0, max: 15, color: 'bg-red-500', bullet: 'bg-red-500' },
          ].map(({ label, min, max, color, bullet }) => {
            const count = onlineNodes.filter(n =>
              n.gossip.peersConnected >= min && n.gossip.peersConnected < max
            ).length;
            const percentage = onlineNodes.length > 0 ? (count / onlineNodes.length) * 100 : 0;

            return (
              <div key={label} className="flex items-center gap-3">
                <div className="flex items-center gap-2 w-28">
                  <span className={`size-2 rounded-full ${bullet}`} />
                  <span className="text-xs font-medium uppercase">{label}</span>
                </div>
                <div className="flex-1 h-3 bg-accent rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${percentage}%` }} />
                </div>
                <div className="w-20 text-right text-xs font-mono">{count} nodes</div>
                <div className="w-12 text-right text-xs text-muted-foreground">{percentage.toFixed(0)}%</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border-2 border-border overflow-hidden">
        <div className="px-4 py-2 border-b border-border bg-accent/20">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Gossip Message Flow (Last Hour)
          </span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {/* Total Messages */}
          <div className="border-r border-b lg:border-b-0 border-border">
            <div className="flex items-center justify-between p-3 border-b border-border">
              <div className="flex items-center gap-2.5 font-semibold leading-none tracking-tight text-sm uppercase">
                <span className="size-2 rounded-full bg-primary" />
                Total Messages
              </div>
            </div>
            <div className="bg-accent p-3">
              <div className="text-3xl font-display text-primary">{(totalMessages / 1000000).toFixed(1)}M</div>
              <p className="text-xs font-medium text-muted-foreground tracking-wide">messages processed</p>
            </div>
          </div>

          {/* Total Connections */}
          <div className="border-b lg:border-b-0 lg:border-r border-border">
            <div className="flex items-center justify-between p-3 border-b border-border">
              <div className="flex items-center gap-2.5 font-semibold leading-none tracking-tight text-sm uppercase">
                <span className="size-2 rounded-full bg-primary" />
                Total Connections
              </div>
            </div>
            <div className="bg-accent p-3">
              <div className="text-3xl font-display">{gossipHealth?.totalPeers.toLocaleString()}</div>
              <p className="text-xs font-medium text-muted-foreground tracking-wide">peer connections</p>
            </div>
          </div>

          {/* Network Partitions */}
          <div className="border-r border-border">
            <div className="flex items-center justify-between p-3 border-b border-border">
              <div className="flex items-center gap-2.5 font-semibold leading-none tracking-tight text-sm uppercase">
                <span className={`size-2 rounded-full ${gossipHealth?.partitions ? 'bg-yellow-500' : 'bg-green-500'}`} />
                Network Partitions
              </div>
            </div>
            <div className="bg-accent p-3">
              <div className="text-3xl font-display">{gossipHealth?.partitions || 0}</div>
              <p className="text-xs font-medium text-muted-foreground tracking-wide">detected splits</p>
            </div>
          </div>

          {/* Gossip Health */}
          <div>
            <div className="flex items-center justify-between p-3 border-b border-border">
              <div className="flex items-center gap-2.5 font-semibold leading-none tracking-tight text-sm uppercase">
                <span className="size-2 rounded-full bg-green-500" />
                Gossip Health
              </div>
            </div>
            <div className="bg-accent p-3">
              <div className="text-3xl font-display text-green-400">{gossipHealth?.healthScore.toFixed(0)}%</div>
              <p className="text-xs font-medium text-muted-foreground tracking-wide">protocol health</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardPageLayout>
  );
}
