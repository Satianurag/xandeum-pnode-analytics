'use client';

import { useEffect, useState, useRef } from 'react';
import { useGossipEvents } from '@/hooks/use-pnode-data-query';
import type { GossipEvent } from '@/types/pnode';
import { cn } from '@/lib/utils';

// Muted, subtle colors matching reference aesthetic
const eventTypeColors: Record<GossipEvent['type'], string> = {
  discovery: 'text-muted-foreground',
  message: 'text-muted-foreground',
  sync: 'text-muted-foreground',
  heartbeat: 'text-muted-foreground',
  data_transfer: 'text-muted-foreground',
};

const eventTypeLabels: Record<GossipEvent['type'], string> = {
  discovery: 'DISC',
  message: 'MSG',
  sync: 'SYNC',
  heartbeat: 'HB',
  data_transfer: 'TX',
};

interface PulseEventProps {
  event: GossipEvent;
}

function PulseEvent({ event }: PulseEventProps) {
  const sourceId = (event.sourceNodeId || '').replace('pnode_', '').slice(0, 4) || '....';
  const targetId = (event.targetNodeId || '').replace('pnode_', '').slice(0, 4) || '....';

  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap px-2 text-xs text-muted-foreground/70">
      <span className="font-mono opacity-50">{eventTypeLabels[event.type]}</span>
      <span className="opacity-40">•</span>
      <span className="font-mono">{sourceId}→{targetId}</span>
    </span>
  );
}

export function LiveNetworkPulse() {
  const { data: events } = useGossipEvents();
  const [displayEvents, setDisplayEvents] = useState<GossipEvent[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (events && events.length > 0) {
      setDisplayEvents(prev => {
        const newEvents = [...events.slice(0, 5), ...prev];
        return newEvents.slice(0, 20);
      });
    }
  }, [events]);

  return (
    <div
      className="w-full h-6 bg-background/50 border-t border-border/30 backdrop-blur-sm mt-6 mb-8"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="h-full flex items-center">
        <div className="flex-shrink-0 px-2 h-full flex items-center gap-1.5 border-r border-border/30">
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-pulse" />
          <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">
            GOSSIP
          </span>
        </div>

        <div className="flex-1 overflow-hidden">
          <div
            className={cn(
              "flex items-center h-full",
              !isPaused && "animate-marquee"
            )}
            style={{
              animationDuration: '40s',
              animationIterationCount: 'infinite',
              animationTimingFunction: 'linear',
            }}
          >
            {displayEvents.map((event, idx) => (
              <PulseEvent key={`${event.id}_${idx}`} event={event} />
            ))}
            {displayEvents.length === 0 && (
              <span className="text-[10px] text-muted-foreground/40 px-2">
                ...
              </span>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 px-2 h-full flex items-center border-l border-border/30">
          <span className="text-[10px] text-muted-foreground/40">
            {displayEvents.length}
          </span>
        </div>
      </div>
    </div>
  );
}
