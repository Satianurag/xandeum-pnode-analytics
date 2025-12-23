'use client';

import { useState, useMemo } from 'react';
import DashboardPageLayout from "@/components/dashboard/layout";
import ServerIcon from "@/components/icons/server";
import { usePNodes } from "@/hooks/use-pnode-data";
import { NodeSearch } from "@/components/dashboard/node-search";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { PNode } from "@/types/pnode";

function LoadingState() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 rounded-lg" />
      <Skeleton className="h-96 rounded-lg" />
    </div>
  );
}

export default function PNodesPage() {
  const { data: nodes, loading, lastUpdated } = usePNodes();
  const [filteredNodes, setFilteredNodes] = useState<PNode[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'score' | 'uptime' | 'latency' | 'storage'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const displayNodes = useMemo(() => {
    const toSort = filteredNodes.length > 0 ? filteredNodes : (nodes || []);
    return [...toSort].sort((a, b) => {
      let aVal = 0, bVal = 0;
      switch (sortBy) {
        case 'score': aVal = a.performance.score; bVal = b.performance.score; break;
        case 'uptime': aVal = a.uptime; bVal = b.uptime; break;
        case 'latency': aVal = a.metrics.responseTimeMs; bVal = b.metrics.responseTimeMs; break;
        case 'storage': aVal = a.metrics.storageCapacityGB; bVal = b.metrics.storageCapacityGB; break;
      }
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });
  }, [filteredNodes, nodes, sortBy, sortOrder]);

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const toggleSelect = (nodeId: string) => {
    setSelectedNodes(prev => 
      prev.includes(nodeId) ? prev.filter(id => id !== nodeId) : [...prev, nodeId].slice(-3)
    );
  };

  if (loading && !nodes) {
    return (
      <DashboardPageLayout header={{ title: "pNodes", description: "Loading...", icon: ServerIcon }}>
        <LoadingState />
      </DashboardPageLayout>
    );
  }

  const comparedNodes = nodes?.filter(n => selectedNodes.includes(n.id)) || [];

  return (
    <DashboardPageLayout
      header={{
        title: "pNodes",
        description: `${nodes?.length || 0} nodes in network`,
        icon: ServerIcon,
      }}
    >
      {nodes && (
        <NodeSearch 
          nodes={nodes} 
          onFilterChange={setFilteredNodes}
        />
      )}

      {comparedNodes.length >= 2 && (
        <div className="rounded-lg border-2 border-primary/50 p-4 bg-primary/5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-display uppercase">Compare Nodes ({comparedNodes.length})</span>
            <Button size="sm" variant="ghost" onClick={() => setSelectedNodes([])}>Clear</Button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {comparedNodes.map(node => (
              <div key={node.id} className="p-3 rounded-lg bg-background border border-border">
                <div className="font-mono text-sm truncate mb-2">{node.pubkey.slice(0, 16)}...</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Score</span>
                    <span className="font-mono text-primary">{node.performance.score.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uptime</span>
                    <span className="font-mono">{node.uptime.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Latency</span>
                    <span className="font-mono">{node.metrics.responseTimeMs.toFixed(0)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Storage</span>
                    <span className="font-mono">{(node.metrics.storageCapacityGB / 1000).toFixed(1)}TB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Peers</span>
                    <span className="font-mono">{node.gossip.peersConnected}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Commission</span>
                    <span className="font-mono">{node.staking?.commission || 0}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border-2 border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-accent/20 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground w-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-border"
                    checked={selectedNodes.length > 0}
                    onChange={() => setSelectedNodes([])}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Node</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Location</th>
                <th 
                  className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-primary"
                  onClick={() => toggleSort('score')}
                >
                  Score {sortBy === 'score' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-primary"
                  onClick={() => toggleSort('uptime')}
                >
                  Uptime {sortBy === 'uptime' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-primary"
                  onClick={() => toggleSort('latency')}
                >
                  Latency {sortBy === 'latency' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-primary"
                  onClick={() => toggleSort('storage')}
                >
                  Storage {sortBy === 'storage' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Version</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Peers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayNodes.slice(0, 50).map((node) => (
                <tr 
                  key={node.id} 
                  className={`hover:bg-accent/10 transition-colors ${selectedNodes.includes(node.id) ? 'bg-primary/10' : ''}`}
                >
                  <td className="px-4 py-3">
                    <input 
                      type="checkbox" 
                      className="rounded border-border"
                      checked={selectedNodes.includes(node.id)}
                      onChange={() => toggleSelect(node.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs truncate max-w-[150px]" title={node.pubkey}>
                      {node.pubkey.slice(0, 12)}...
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs ${
                      node.status === 'online' ? 'bg-green-500/20 text-green-400' :
                      node.status === 'offline' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        node.status === 'online' ? 'bg-green-400 animate-pulse' :
                        node.status === 'offline' ? 'bg-red-400' :
                        'bg-yellow-400'
                      }`}/>
                      {node.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div>{node.location?.city}</div>
                    <div className="text-muted-foreground">{node.location?.countryCode}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-mono ${
                      node.performance.tier === 'excellent' ? 'text-green-400' :
                      node.performance.tier === 'good' ? 'text-blue-400' :
                      node.performance.tier === 'fair' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {node.performance.score.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{node.uptime.toFixed(1)}%</td>
                  <td className="px-4 py-3 font-mono text-xs">{node.metrics.responseTimeMs.toFixed(0)}ms</td>
                  <td className="px-4 py-3 font-mono text-xs">{(node.metrics.storageCapacityGB / 1000).toFixed(1)}TB</td>
                  <td className="px-4 py-3 font-mono text-xs">{node.version}</td>
                  <td className="px-4 py-3 font-mono text-xs">{node.gossip.peersConnected}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {displayNodes.length > 50 && (
          <div className="px-4 py-3 border-t border-border bg-accent/10 text-center text-sm text-muted-foreground">
            Showing 50 of {displayNodes.length} nodes
          </div>
        )}
      </div>
    </DashboardPageLayout>
  );
}
