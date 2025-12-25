"use client";

import * as React from "react";
import { XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bullet } from "@/components/ui/bullet";
import type { PerformanceHistory } from "@/types/pnode";

type TimePeriod = "1h" | "6h" | "24h";

const chartConfig = {
  nodes: {
    label: "Nodes",
    color: "var(--chart-1)",
  },
  latency: {
    label: "Latency",
    color: "var(--chart-2)",
  },
  storage: {
    label: "Storage",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

interface NetworkChartProps {
  data: PerformanceHistory[];
}

export function NetworkChart({ data }: NetworkChartProps) {
  const [activeTab, setActiveTab] = React.useState<TimePeriod>("24h");

  const handleTabChange = (value: string) => {
    if (value === "1h" || value === "6h" || value === "24h") {
      setActiveTab(value as TimePeriod);
    }
  };

  // Filter data based on time period
  const getFilteredData = (period: TimePeriod) => {
    const now = Date.now();
    const hours = period === "1h" ? 1 : period === "6h" ? 6 : 24;
    const cutoff = now - hours * 60 * 60 * 1000;

    return data
      .filter(item => new Date(item.timestamp).getTime() > cutoff)
      .map(item => ({
        date: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        nodes: item.onlineNodes,
        latency: item.avgResponseTime,
        storage: item.storageUsedTB,
      }));
  };

  const formatYAxisValue = (value: number) => {
    if (value === 0) return "";
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  const renderChart = (chartData: ReturnType<typeof getFilteredData>) => {
    return (
      <div className="bg-accent rounded-lg p-3">
        <ChartContainer className="md:aspect-[3/1] w-full" config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: -12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <defs>
              <linearGradient id="fillNodes" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-nodes)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-nodes)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillLatency" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-latency)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-latency)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillStorage" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-storage)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-storage)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              horizontal={false}
              strokeDasharray="8 8"
              strokeWidth={2}
              stroke="var(--muted-foreground)"
              opacity={0.3}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={12}
              strokeWidth={1.5}
              className="uppercase text-sm fill-muted-foreground"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={0}
              tickCount={6}
              className="text-sm fill-muted-foreground"
              tickFormatter={formatYAxisValue}
              domain={[0, "dataMax"]}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  className="min-w-[200px] px-4 py-3"
                />
              }
            />
            <Area
              dataKey="nodes"
              type="linear"
              fill="none"
              stroke="var(--color-nodes)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Area
              dataKey="latency"
              type="linear"
              fill="none"
              stroke="var(--color-latency)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Area
              dataKey="storage"
              type="linear"
              fill="none"
              stroke="var(--color-storage)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    );
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="max-md:gap-4"
    >
      <div className="flex items-center justify-between mb-4 max-md:contents">
        <TabsList className="max-md:w-full">
          <TabsTrigger value="1h">1H</TabsTrigger>
          <TabsTrigger value="6h">6H</TabsTrigger>
          <TabsTrigger value="24h">24H</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-6 max-md:order-1">
          {Object.entries(chartConfig).map(([key, value]) => (
            <ChartLegend key={key} label={value.label} color={value.color} />
          ))}
        </div>
      </div>
      <TabsContent value="1h" className="space-y-4">
        {renderChart(getFilteredData("1h"))}
      </TabsContent>
      <TabsContent value="6h" className="space-y-4">
        {renderChart(getFilteredData("6h"))}
      </TabsContent>
      <TabsContent value="24h" className="space-y-4">
        {renderChart(getFilteredData("24h"))}
      </TabsContent>
    </Tabs>
  );
}

export const ChartLegend = ({
  label,
  color,
}: {
  label: string;
  color: string;
}) => {
  return (
    <div className="flex items-center gap-2 uppercase">
      <Bullet style={{ backgroundColor: color }} className="rotate-45" />
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
};
