'use client';

import { Suspense, lazy, useState, useEffect } from 'react';
import DashboardPageLayout from "@/components/dashboard/layout";
import { Bullet } from "@/components/ui/bullet";
import BracketsIcon from "@/components/icons/brackets";
import GearIcon from "@/components/icons/gear";
import ProcessorIcon from "@/components/icons/proccesor";
import BoomIcon from "@/components/icons/boom";
import TrophyIcon from "@/components/icons/trophy";
import ServerIcon from "@/components/icons/server";
import AtomIcon from "@/components/icons/atom";
import GlobeIcon from "@/components/icons/globe";
import { usePNodes, useNetworkStats, usePerformanceHistory, useGossipEvents, useXScore } from "@/hooks/use-pnode-data-query";
import DashboardStat from "@/components/dashboard/stat";
import { NetworkChart } from "@/components/dashboard/network-chart";
import { InfoTooltip } from "@/components/dashboard/info-tooltip";
import { Skeleton } from "@/components/ui/skeleton";

import { LeafletMap } from "@/components/dashboard/leaflet-map";

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-lg" />
      <Skeleton className="h-80 rounded-lg" />
    </div>
  );
}

export default function DashboardOverview({
  initialNodes,
  initialStats
}: {
  initialNodes: any[] | null;
  initialStats: any | null;
}) {
  const { data: nodes, isLoading: nodesLoading, dataUpdatedAt } = usePNodes(initialNodes);
  const { data: stats, isLoading: statsLoading } = useNetworkStats(initialStats);
  const { data: history, isLoading: historyLoading } = usePerformanceHistory();
  const { data: gossipEvents } = useGossipEvents();
  const { data: xScore } = useXScore();


  const isLoading = nodesLoading || statsLoading || historyLoading;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const lastUpdatedText = mounted && dataUpdatedAt
    ? `Last updated ${new Date(dataUpdatedAt).toLocaleTimeString()}`
    : 'Connecting...';

  if (isLoading && !nodes) {
    return (
      <DashboardPageLayout
        header={{
          title: "Dashboard",
          description: "Loading...",
          icon: BracketsIcon,
        }}
      >
        <LoadingState />
      </DashboardPageLayout>
    );
  }

  return (
    <DashboardPageLayout
      header={{
        title: "Dashboard",
        description: lastUpdatedText,
        icon: BracketsIcon,
      }}
    >
      {/* Stats with arrows - exactly like reference */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <DashboardStat
          label="TOTAL PNODES"
          value={stats?.totalNodes?.toString() || "0"}
          description={`${stats?.onlineNodes || 0} ONLINE`}
          icon={GearIcon}
          intent="positive"
          direction="up"
        />
        <DashboardStat
          label="NETWORK HEALTH"
          value={`${stats?.networkHealth?.toFixed(1) || "0"}%`}
          description={stats?.degradedNodes && stats.degradedNodes > 0 ? `${stats.degradedNodes} DEGRADED` : "ALL SYSTEMS NORMAL"}
          icon={ProcessorIcon}
          intent="negative"
          direction="down"
        />
        <DashboardStat
          label="AVG RESPONSE"
          value={`${stats?.averageResponseTime?.toFixed(0) || "0"}ms`}
          description="NETWORK LATENCY"
          icon={BoomIcon}
          intent={stats?.averageResponseTime && stats.averageResponseTime < 100 ? "positive" : "neutral"}
          tag={stats?.averageResponseTime && stats.averageResponseTime < 100 ? "FAST" : undefined}
        />
      </div>

      {xScore && (
        <div className="rounded-lg border-2 border-border overflow-hidden mb-6">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {/* Network X-Score */}
            <div className="border-r border-b lg:border-b-0 border-border">
              <div className="flex items-center justify-between p-3 border-b border-border">
                <div className="flex items-center gap-2.5 font-semibold leading-none tracking-tight text-sm uppercase">
                  <Bullet variant={
                    xScore.grade === 'S' || xScore.grade === 'A' ? "success" :
                      xScore.grade === 'B' ? "warning" : "destructive"
                  } />
                  Network X-Score
                </div>
                <TrophyIcon className="size-4 text-muted-foreground" />
              </div>
              <div className="bg-accent p-3">
                <div className="text-3xl font-display">{xScore.grade}</div>
                <p className="text-xs font-medium text-muted-foreground tracking-wide">SCORE: {xScore.overall.toFixed(1)}</p>
              </div>
            </div>

            {/* Throughput */}
            <div className="border-b lg:border-b-0 lg:border-r border-border">
              <div className="flex items-center justify-between p-3 border-b border-border">
                <div className="flex items-center gap-2.5 font-semibold leading-none tracking-tight text-sm uppercase">
                  <Bullet variant="success" />
                  Throughput
                </div>
                <ServerIcon className="size-4 text-muted-foreground" />
              </div>
              <div className="bg-accent p-3">
                <div className="text-3xl font-display">{xScore.storageThroughput.toFixed(1)}</div>
                <p className="text-xs font-medium text-muted-foreground tracking-wide">STORAGE OPS</p>
              </div>
            </div>

            {/* Data Latency */}
            <div className="border-r border-border">
              <div className="flex items-center justify-between p-3 border-b border-border">
                <div className="flex items-center gap-2.5 font-semibold leading-none tracking-tight text-sm uppercase">
                  <Bullet variant="success" />
                  Data Latency
                </div>
                <AtomIcon className="size-4 text-muted-foreground" />
              </div>
              <div className="bg-accent p-3">
                <div className="text-3xl font-display">{xScore.dataAvailabilityLatency.toFixed(1)}</div>
                <p className="text-xs font-medium text-muted-foreground tracking-wide">AVAILABILITY</p>
              </div>
            </div>

            {/* Gossip Health */}
            <div>
              <div className="flex items-center justify-between p-3 border-b border-border">
                <div className="flex items-center gap-2.5 font-semibold leading-none tracking-tight text-sm uppercase">
                  <Bullet variant="success" />
                  Gossip Health
                </div>
                <GlobeIcon className="size-4 text-muted-foreground" />
              </div>
              <div className="bg-accent p-3">
                <div className="text-3xl font-display">{xScore.gossipHealth.toFixed(1)}</div>
                <p className="text-xs font-medium text-muted-foreground tracking-wide">PROTOCOL SYNC</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border-2 border-border overflow-hidden">
        <div className="px-4 py-2 border-b border-border bg-accent/20 flex items-center justify-between">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Network Map
          </span>
          <span className="text-xs text-primary">
            {nodes?.filter((n: any) => n.status === 'online').length || 0} nodes online
          </span>
        </div>
        <div className="h-[400px]">
          {nodes && <LeafletMap nodes={nodes} />}
        </div>
      </div>

      <div className="rounded-lg border-2 border-border overflow-hidden">
        <div className="px-4 py-2 border-b border-border bg-accent/20 flex items-center justify-between">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Network Performance (24h)
          </span>
          <span className="text-xs text-muted-foreground">
            {stats?.gossipMessages24h.toLocaleString()} gossip messages
          </span>
        </div>
        <div className="p-4">
          {history && <NetworkChart data={history} />}
        </div>
      </div>

      {/* Top Performing pNodes removed as requested */}
    </DashboardPageLayout>
  );
}
