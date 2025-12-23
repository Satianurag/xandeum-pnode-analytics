'use client';

import { useState, useEffect, useMemo } from 'react';
import type { PNode, GossipEvent } from '@/types/pnode';

interface Globe3DProps {
  nodes: PNode[];
  gossipEvents?: GossipEvent[];
}

function Globe2DFallback({ nodes, gossipEvents }: Globe3DProps) {
  const onlineNodes = nodes.filter(n => n.status === 'online' && n.location);
  const [animationOffset, setAnimationOffset] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationOffset(prev => (prev + 0.02) % (Math.PI * 2));
    }, 50);
    return () => clearInterval(interval);
  }, []);
  
  const nodePositions = useMemo(() => {
    return onlineNodes.slice(0, 40).map((node, i) => {
      const baseAngle = (i / Math.min(onlineNodes.length, 40)) * Math.PI * 2;
      const radius = 100 + (Math.sin(baseAngle * 3) * 20);
      return {
        id: node.id,
        x: 140 + Math.cos(baseAngle) * radius,
        y: 140 + Math.sin(baseAngle) * radius,
        status: node.status,
      };
    });
  }, [onlineNodes]);
  
  return (
    <div className="w-full h-full bg-black/50 rounded-lg p-4 overflow-hidden relative min-h-[300px]">
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="relative w-[280px] h-[280px] rounded-full border-2 border-primary/30"
          style={{ transform: `rotate(${animationOffset * 10}deg)` }}
        >
          <div className="absolute inset-4 rounded-full border border-primary/20" />
          <div className="absolute inset-8 rounded-full border border-primary/10" />
          <div className="absolute inset-12 rounded-full border border-primary/5" />
          
          {nodePositions.map((node, i) => (
            <div
              key={node.id}
              className={`absolute w-2.5 h-2.5 rounded-full ${
                node.status === 'online' ? 'bg-green-400' : 
                node.status === 'degraded' ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{
                left: node.x - 5,
                top: node.y - 5,
                opacity: 0.7 + Math.sin(animationOffset + i * 0.5) * 0.3,
                transform: `scale(${0.8 + Math.sin(animationOffset + i * 0.3) * 0.2})`,
              }}
            />
          ))}
          
          <div 
            className="absolute inset-0 flex items-center justify-center flex-col"
            style={{ transform: `rotate(${-animationOffset * 10}deg)` }}
          >
            <div className="text-4xl font-display text-primary">{onlineNodes.length}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">ONLINE NODES</div>
          </div>
        </div>
      </div>
      
      {gossipEvents && gossipEvents.length > 0 && (
        <div className="absolute top-4 right-4 bg-black/60 rounded px-2 py-1">
          <div className="text-xs text-primary animate-pulse">
            {gossipEvents.length} gossip events
          </div>
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 text-xs text-muted-foreground">
        Network Visualization
      </div>
    </div>
  );
}

export function Globe3D({ nodes, gossipEvents }: Globe3DProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black/50 rounded-lg min-h-[300px]">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  return <Globe2DFallback nodes={nodes} gossipEvents={gossipEvents} />;
}
