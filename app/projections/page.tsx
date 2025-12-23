'use client';

import { useState } from 'react';
import DashboardPageLayout from "@/components/dashboard/layout";
import { useExabyteProjection, useNetworkStats } from "@/hooks/use-pnode-data";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

const TrendingUpIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <polyline points="16 7 22 7 22 13"/>
  </svg>
);

export default function ProjectionsPage() {
  const [timeframe, setTimeframe] = useState<'1m' | '3m' | '6m' | '1y' | '2y'>('1y');
  const [nodeMultiplier, setNodeMultiplier] = useState(1);
  const { data: stats } = useNetworkStats();
  const customNodeCount = stats ? Math.floor(stats.totalNodes * nodeMultiplier) : undefined;
  const { data: projection, loading } = useExabyteProjection(timeframe, customNodeCount);

  const timeframeOptions = [
    { value: '1m', label: '1 Month' },
    { value: '3m', label: '3 Months' },
    { value: '6m', label: '6 Months' },
    { value: '1y', label: '1 Year' },
    { value: '2y', label: '2 Years' },
  ];

  const generateProjectionData = () => {
    if (!projection) return [];
    
    const data = [];
    const months = timeframe === '1m' ? 1 : timeframe === '3m' ? 3 : timeframe === '6m' ? 6 : timeframe === '1y' ? 12 : 24;
    
    for (let i = 0; i <= months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      const progress = i / months;
      const capacity = projection.currentCapacityTB + (projection.projectedCapacityTB - projection.currentCapacityTB) * progress;
      const nodes = projection.nodeCount + (projection.projectedNodeCount - projection.nodeCount) * progress;
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        capacity: Math.round(capacity),
        nodes: Math.round(nodes),
      });
    }
    
    return data;
  };

  const projectionData = generateProjectionData();

  if (loading) {
    return (
      <DashboardPageLayout
        header={{
          title: "Exabyte Projections",
          description: "Loading...",
          icon: TrendingUpIcon,
        }}
      >
        <div className="space-y-6">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
      </DashboardPageLayout>
    );
  }

  return (
    <DashboardPageLayout
      header={{
        title: "Exabyte Projections",
        description: "Path to Exabytes - Storage Growth Simulator",
        icon: TrendingUpIcon,
      }}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-lg border-2 border-border p-4">
          <div className="text-xs text-muted-foreground uppercase">Current Capacity</div>
          <div className="text-2xl font-display text-primary">{projection?.currentCapacityTB.toFixed(1)} TB</div>
        </div>
        <div className="rounded-lg border-2 border-border p-4">
          <div className="text-xs text-muted-foreground uppercase">Projected Capacity</div>
          <div className="text-2xl font-display text-green-400">{projection?.projectedCapacityTB.toFixed(1)} TB</div>
        </div>
        <div className="rounded-lg border-2 border-border p-4">
          <div className="text-xs text-muted-foreground uppercase">Current Nodes</div>
          <div className="text-2xl font-display text-primary">{projection?.nodeCount}</div>
        </div>
        <div className="rounded-lg border-2 border-border p-4">
          <div className="text-xs text-muted-foreground uppercase">Projected Nodes</div>
          <div className="text-2xl font-display text-cyan-400">{projection?.projectedNodeCount}</div>
        </div>
      </div>

      <div className="rounded-lg border-2 border-border p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-display text-lg">Growth Simulator</h3>
            <p className="text-sm text-muted-foreground">Adjust node count to see projected capacity</p>
          </div>
          <div className="flex gap-2">
            {timeframeOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setTimeframe(opt.value as any)}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  timeframe === opt.value 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-accent/20 hover:bg-accent/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Node Multiplier</span>
            <span className="font-mono text-primary">{nodeMultiplier.toFixed(1)}x ({customNodeCount} nodes)</span>
          </div>
          <Slider
            value={[nodeMultiplier]}
            onValueChange={([val]) => setNodeMultiplier(val)}
            min={0.5}
            max={10}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0.5x</span>
            <span>5x</span>
            <span>10x</span>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectionData}>
              <defs>
                <linearGradient id="capacityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00ff88" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a2e',
                  border: '1px solid #333',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="capacity"
                stroke="#00ff88"
                strokeWidth={2}
                fill="url(#capacityGradient)"
                name="Capacity (TB)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border-2 border-border p-4">
        <h3 className="font-display text-lg mb-4">Storage Milestones</h3>
        <div className="space-y-3">
          {projection?.milestones.map((milestone, idx) => {
            const isPassed = projection.currentCapacityTB >= milestone.capacity;
            const isNext = !isPassed && (idx === 0 || projection.milestones[idx - 1].capacity <= projection.currentCapacityTB);
            
            return (
              <div 
                key={milestone.capacity}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  isPassed 
                    ? 'bg-green-500/10 border-green-500/40' 
                    : isNext 
                      ? 'bg-primary/10 border-primary/40' 
                      : 'bg-accent/10 border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isPassed ? 'bg-green-500/20 text-green-400' : 'bg-accent/20 text-muted-foreground'
                  }`}>
                    {isPassed ? '✓' : idx + 1}
                  </div>
                  <div>
                    <div className="font-display">
                      {milestone.capacity >= 1000 
                        ? `${(milestone.capacity / 1000).toFixed(1)} PB` 
                        : `${milestone.capacity} TB`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {milestone.nodeCountRequired.toLocaleString()} nodes required
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm ${isPassed ? 'text-green-400' : 'text-muted-foreground'}`}>
                    {isPassed ? 'Achieved' : milestone.estimatedDate}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardPageLayout>
  );
}
