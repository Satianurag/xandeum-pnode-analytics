'use client';

import { useMemo } from 'react';
import type { PNode } from '@/types/pnode';

interface WorldMapProps {
  nodes: PNode[];
}

export function WorldMap({ nodes }: WorldMapProps) {
  const nodeMarkers = useMemo(() => {
    const grouped: Record<string, { lat: number; lng: number; nodes: PNode[] }> = {};
    
    nodes.forEach(node => {
      if (node.location) {
        const key = `${node.location.lat.toFixed(1)},${node.location.lng.toFixed(1)}`;
        if (!grouped[key]) {
          grouped[key] = { lat: node.location.lat, lng: node.location.lng, nodes: [] };
        }
        grouped[key].nodes.push(node);
      }
    });
    
    return Object.values(grouped);
  }, [nodes]);

  const latLngToXY = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * 100;
    const latRad = (lat * Math.PI) / 180;
    const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
    const y = 50 - (mercN / Math.PI) * 50;
    return { x: Math.max(2, Math.min(98, x)), y: Math.max(5, Math.min(95, y)) };
  };

  return (
    <div className="relative w-full h-full min-h-[200px] bg-background/50 rounded-lg overflow-hidden">
      <svg 
        viewBox="0 0 100 60" 
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <radialGradient id="nodeGlowOnline" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="1"/>
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="nodeGlowOffline" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="1"/>
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="nodeGlowDegraded" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="1"/>
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/>
          </radialGradient>
        </defs>

        <rect width="100" height="60" fill="transparent"/>
        
        <g opacity="0.15" stroke="currentColor" strokeWidth="0.1">
          {[...Array(7)].map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 10} x2="100" y2={i * 10} />
          ))}
          {[...Array(11)].map((_, i) => (
            <line key={`v${i}`} x1={i * 10} y1="0" x2={i * 10} y2="60" />
          ))}
        </g>

        <g opacity="0.3" stroke="currentColor" strokeWidth="0.15" fill="none">
          <ellipse cx="50" cy="30" rx="48" ry="28"/>
          <path d="M 10 10 Q 25 20 30 35 Q 35 50 20 55"/>
          <path d="M 35 8 Q 40 25 38 40 Q 36 50 45 55"/>
          <path d="M 55 5 Q 60 20 65 35 Q 70 45 60 58"/>
          <path d="M 70 8 Q 75 18 80 28 Q 85 40 75 50"/>
          <path d="M 88 12 Q 92 25 90 40"/>
        </g>

        {nodeMarkers.map((marker, index) => {
          const { x, y } = latLngToXY(marker.lat, marker.lng);
          const onlineCount = marker.nodes.filter(n => n.status === 'online').length;
          const offlineCount = marker.nodes.filter(n => n.status === 'offline').length;
          const degradedCount = marker.nodes.filter(n => n.status === 'degraded').length;
          
          let primaryStatus: 'online' | 'offline' | 'degraded' = 'online';
          if (offlineCount > onlineCount && offlineCount > degradedCount) primaryStatus = 'offline';
          else if (degradedCount > onlineCount) primaryStatus = 'degraded';
          
          const size = Math.min(2.5, 0.8 + marker.nodes.length * 0.3);
          const glowId = primaryStatus === 'online' ? 'nodeGlowOnline' 
            : primaryStatus === 'offline' ? 'nodeGlowOffline' 
            : 'nodeGlowDegraded';
          
          const color = primaryStatus === 'online' ? '#22c55e' 
            : primaryStatus === 'offline' ? '#ef4444' 
            : '#f59e0b';

          return (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r={size * 2}
                fill={`url(#${glowId})`}
                opacity="0.4"
              >
                <animate
                  attributeName="opacity"
                  values="0.2;0.5;0.2"
                  dur={`${2 + Math.random()}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="r"
                  values={`${size * 1.5};${size * 2.5};${size * 1.5}`}
                  dur={`${2 + Math.random()}s`}
                  repeatCount="indefinite"
                />
              </circle>
              
              <circle
                cx={x}
                cy={y}
                r={size}
                fill={color}
                filter="url(#glow)"
              >
                {primaryStatus === 'online' && (
                  <animate
                    attributeName="opacity"
                    values="0.7;1;0.7"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                )}
              </circle>
              
              {marker.nodes.length > 1 && (
                <text
                  x={x}
                  y={y + 0.4}
                  textAnchor="middle"
                  fontSize="1.2"
                  fill="white"
                  fontWeight="bold"
                >
                  {marker.nodes.length}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      
      <div className="absolute bottom-2 left-2 flex gap-3 text-[10px] uppercase tracking-wider">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
          <span className="text-muted-foreground">Online</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-yellow-500"/>
          <span className="text-muted-foreground">Degraded</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500"/>
          <span className="text-muted-foreground">Offline</span>
        </div>
      </div>
    </div>
  );
}
