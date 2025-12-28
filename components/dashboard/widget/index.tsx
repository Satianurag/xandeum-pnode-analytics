"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TVNoise from "@/components/ui/tv-noise";
import Image from "next/image";
import { useLiveClock, useNetworkStats } from "@/hooks/use-pnode-data-query";

export default function Widget() {
  const { time, timezone } = useLiveClock();
  const { data: stats } = useNetworkStats();
  const [mounted, setMounted] = React.useState(false);
  const [showGif, setShowGif] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);

    // Defer GIF loading until after critical content is painted
    // Using requestIdleCallback for better performance, with setTimeout fallback
    const loadGif = () => setShowGif(true);

    if ('requestIdleCallback' in window) {
      // Load when browser is idle (best for performance)
      const idleId = window.requestIdleCallback(loadGif, { timeout: 3000 });
      return () => window.cancelIdleCallback(idleId);
    } else {
      // Fallback: load after 2 seconds
      const timeoutId = setTimeout(loadGif, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, []);

  const formatTime = (date: Date | null) => {
    if (!date) return "--:-- --";
    return date.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date | null) => {
    if (!date) return { dayOfWeek: "---", restOfDate: "---" };
    const dayOfWeek = date.toLocaleDateString("en-US", {
      weekday: "long",
    });
    const restOfDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return { dayOfWeek, restOfDate };
  };

  const dateInfo = formatDate(time);

  const networkStatus = stats
    ? `${stats.onlineNodes}/${stats.totalNodes} nodes`
    : 'Connecting...';

  return (
    <Card className="w-full aspect-[2] relative overflow-hidden">
      <TVNoise opacity={0.3} intensity={0.2} speed={40} />
      <CardContent className="bg-accent/30 flex-1 flex flex-col justify-between text-sm font-medium uppercase relative z-20">
        <div className="flex justify-between items-center">
          <span className="opacity-50">{mounted ? dateInfo.dayOfWeek : '---'}</span>
          <span>{mounted ? dateInfo.restOfDate : '---'}</span>
        </div>
        <div className="text-center">
          <div
            className="text-5xl font-display tabular-nums"
            style={{ minWidth: '8ch' }}
            suppressHydrationWarning
          >
            {mounted ? formatTime(time) : '--:-- --'}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="opacity-50 flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${stats && stats.networkHealth > 90 ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
            {networkStatus}
          </span>
          <span>{timezone.mounted ? timezone.city : "---"}</span>

          <Badge variant="secondary" className="bg-accent">
            {timezone.mounted ? timezone.offset : "---"}
          </Badge>
        </div>

        <div className="absolute inset-0 -z-[1]">
          {showGif && (
            <Image
              src="/assets/pc_blueprint.gif"
              alt=""
              width={250}
              height={250}
              className="size-full object-contain animate-in fade-in duration-500"
              loading="lazy"
              unoptimized
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
