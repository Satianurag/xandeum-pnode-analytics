'use client';

import dynamic from 'next/dynamic';
import type { PNode } from '@/types/pnode';

interface LeafletMapProps {
    nodes: PNode[];
}

// Dynamically import with SSR disabled to prevent \"Map container already initialized\" errors
const MapContent = dynamic(
    () => import('./map-content').then((mod) => mod.MapContent),
    {
        ssr: false,
        loading: () => (
            <div
                className="w-full h-full flex items-center justify-center bg-accent/50 rounded-lg"
                style={{ minHeight: '300px', aspectRatio: '16/9' }}
            >
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
        ),
    }
);

export function LeafletMap({ nodes }: LeafletMapProps) {
    return <MapContent nodes={nodes} />;
}
