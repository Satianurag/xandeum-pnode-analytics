"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bullet } from "@/components/ui/bullet";
import { AnimatePresence, motion } from "framer-motion";
import { useNetworkEvents } from "@/hooks/use-pnode-data";
import type { NetworkEvent } from "@/types/pnode";
import { cn } from "@/lib/utils";

interface NetworkEventItemProps {
  event: NetworkEvent;
  onDismiss: (id: string) => void;
}

function NetworkEventItem({ event, onDismiss }: NetworkEventItemProps) {
  const severityStyles = {
    info: 'border-l-blue-500 bg-blue-500/5',
    success: 'border-l-green-500 bg-green-500/5',
    warning: 'border-l-yellow-500 bg-yellow-500/5',
    error: 'border-l-red-500 bg-red-500/5',
  };

  const severityIcons = {
    info: '📡',
    success: '✅',
    warning: '⚠️',
    error: '🔴',
  };

  const timeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className={cn(
      'p-3 rounded-lg border-l-4 transition-all hover:opacity-80',
      severityStyles[event.severity]
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">{severityIcons[event.severity]}</span>
            <span className="text-xs font-medium uppercase tracking-wider truncate">
              {event.title}
            </span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {event.message}
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <span>{timeAgo(event.timestamp)}</span>
            {event.nodeId && (
              <>
                <span>•</span>
                <span className="font-mono">{event.nodeId}</span>
              </>
            )}
          </div>
        </div>
        <button
          onClick={() => onDismiss(event.id)}
          className="text-muted-foreground hover:text-foreground transition-colors text-xs"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default function Notifications() {
  const { data: events, loading } = useNetworkEvents();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  const visibleEvents = events?.filter(e => !dismissedIds.has(e.id)) || [];
  const displayedEvents = showAll ? visibleEvents : visibleEvents.slice(0, 4);

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set([...prev, id]));
  };

  const clearAll = () => {
    if (events) {
      setDismissedIds(new Set(events.map(e => e.id)));
    }
  };

  const unreadCount = visibleEvents.filter(e => 
    e.severity === 'warning' || e.severity === 'error'
  ).length;

  return (
    <Card className="h-full">
      <CardHeader className="flex items-center justify-between pl-3 pr-1">
        <CardTitle className="flex items-center gap-2.5 text-sm font-medium uppercase">
          {unreadCount > 0 ? (
            <Badge variant="destructive">{unreadCount}</Badge>
          ) : (
            <Bullet />
          )}
          Network Events
        </CardTitle>
        {visibleEvents.length > 0 && (
          <Button
            className="opacity-50 hover:opacity-100 uppercase"
            size="sm"
            variant="ghost"
            onClick={clearAll}
          >
            Clear All
          </Button>
        )}
      </CardHeader>

      <CardContent className="bg-accent p-1.5 overflow-hidden">
        <div className="space-y-2">
          {loading && !events && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
              <p className="text-xs text-muted-foreground mt-2">Loading events...</p>
            </div>
          )}

          <AnimatePresence initial={false} mode="popLayout">
            {displayedEvents.map((event) => (
              <motion.div
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                key={event.id}
              >
                <NetworkEventItem
                  event={event}
                  onDismiss={handleDismiss}
                />
              </motion.div>
            ))}

            {!loading && visibleEvents.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  No network events
                </p>
              </div>
            )}

            {visibleEvents.length > 4 && (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAll(!showAll)}
                  className="w-full"
                >
                  {showAll ? "Show Less" : `Show All (${visibleEvents.length})`}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
