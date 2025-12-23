'use client';

import { useMemo, useEffect, useState } from 'react';
import type { PNode } from '@/types/pnode';

interface NetworkGraphProps {
  nodes: PNode[];
}

export function NetworkGraph({ nodes }: NetworkGraphProps) {
  const [animationOffset, setAnimationOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationOffset(prev => (prev + 0.5) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const { nodePositions, connections } = useMemo(() => {
    const centerX = 50;
    const centerY = 50;
    const maxRadius = 42;
    
    const positions = nodes.map((node, index) => {
      const tier = node.performance.tier;
      const baseRadius = tier === 'excellent' ? 15 : tier === 'good' ? 25 : tier === 'fair' ? 33 : 40;
      const radiusVariance = (Math.sin(index * 0.7) * 0.15) * baseRadius;
      const radius = baseRadius + radiusVariance;
      
      const goldenAngle = 137.508;
      const angle = (index * goldenAngle + animationOffset * 0.1) % 360;
      const angleRad = (angle * Math.PI) / 180;
      
      const x = centerX + radius * Math.cos(angleRad);
      const y = centerY + radius * Math.sin(angleRad);
      
      return { node, x, y, angle };
    });

    const conns: { from: { x: number; y: number }; to: { x: number; y: number }; strength: number }[] = [];
    
    const onlineNodes = positions.filter(p => p.node.status === 'online');
    for (let i = 0; i < Math.min(onlineNodes.length, 50); i++) {
      const from = onlineNodes[i];
      const nearestCount = Math.min(3, onlineNodes.length - 1);
      
      for (let j = 0; j < nearestCount; j++) {
        const toIdx = (i + j + 1) % onlineNodes.length;
        const to = onlineNodes[toIdx];
        
        conns.push({
          from: { x: from.x, y: from.y },
          to: { x: to.x, y: to.y },
          strength: Math.random() * 0.5 + 0.2,
        });
      }
    }

    return { nodePositions: positions, connections: conns };
  }, [nodes, animationOffset]);

  const stats = useMemo(() => ({
    online: nodes.filter(n => n.status === 'online').length,
    offline: nodes.filter(n => n.status === 'offline').length,
    degraded: nodes.filter(n => n.status === 'degraded').length,
  }), [nodes]);

  return (
    <div className="relative w-full h-full min-h-[300px] bg-background/30 rounded-lg overflow-hidden">
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="nodeGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="0.8" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00ff88" stopOpacity="0.4"/>
            <stop offset="50%" stopColor="#00ff88" stopOpacity="0.1"/>
            <stop offset="100%" stopColor="#00ff88" stopOpacity="0"/>
          </radialGradient>
          <linearGradient id="connectionGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00ff88" stopOpacity="0.1"/>
            <stop offset="50%" stopColor="#00ff88" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#00ff88" stopOpacity="0.1"/>
          </linearGradient>
        </defs>

        <circle cx="50" cy="50" r="45" fill="url(#centerGlow)" opacity="0.3"/>
        
        <g opacity="0.1" stroke="currentColor" strokeWidth="0.1" fill="none" strokeDasharray="1,2">
          <circle cx="50" cy="50" r="15"/>
          <circle cx="50" cy="50" r="25"/>
          <circle cx="50" cy="50" r="33"/>
          <circle cx="50" cy="50" r="40"/>
        </g>

        {connections.slice(0, 100).map((conn, i) => (
          <line
            key={`conn-${i}`}
            x1={conn.from.x}
            y1={conn.from.y}
            x2={conn.to.x}
            y2={conn.to.y}
            stroke="#00ff88"
            strokeWidth="0.15"
            opacity={conn.strength * 0.3}
          >
            <animate
              attributeName="opacity"
              values={`${conn.strength * 0.1};${conn.strength * 0.4};${conn.strength * 0.1}`}
              dur={`${2 + Math.random() * 2}s`}
              repeatCount="indefinite"
            />
          </line>
        ))}

        <g filter="url(#nodeGlow)">
          <circle cx="50" cy="50" r="4" fill="#00ff88" opacity="0.9">
            <animate
              attributeName="r"
              values="3.5;4.5;3.5"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <text x="50" y="52" textAnchor="middle" fontSize="2" fill="white" fontWeight="bold">
            HUB
          </text>
        </g>

        {nodePositions.map((pos, index) => {
          const { node, x, y } = pos;
          const color = node.status === 'online' ? '#22c55e' 
            : node.status === 'offline' ? '#ef4444' 
            : '#f59e0b';
          
          const size = node.performance.tier === 'excellent' ? 1.2 
            : node.performance.tier === 'good' ? 1 
            : node.performance.tier === 'fair' ? 0.8 
            : 0.6;

          return (
            <g key={node.id}>
              {node.status === 'online' && (
                <circle
                  cx={x}
                  cy={y}
                  r={size * 2}
                  fill={color}
                  opacity="0.2"
                >
                  <animate
                    attributeName="r"
                    values={`${size * 1.5};${size * 2.5};${size * 1.5}`}
                    dur={`${1.5 + (index % 10) * 0.1}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              <circle
                cx={x}
                cy={y}
                r={size}
                fill={color}
                filter="url(#nodeGlow)"
              />
            </g>
          );
        })}
      </svg>

      <div className="absolute top-3 left-3 space-y-1">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Network Topology</div>
        <div className="text-lg font-display text-primary">{nodes.length} Nodes</div>
      </div>
      
      <div className="absolute bottom-3 left-3 flex gap-4 text-[10px] uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
          <span className="text-muted-foreground">{stats.online} Online</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-yellow-500"/>
          <span className="text-muted-foreground">{stats.degraded} Degraded</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500"/>
          <span className="text-muted-foreground">{stats.offline} Offline</span>
        </div>
      </div>

      <div className="absolute bottom-3 right-3 text-[9px] text-muted-foreground/50 uppercase">
        Orbital View
      </div>
    </div>
  );
}
