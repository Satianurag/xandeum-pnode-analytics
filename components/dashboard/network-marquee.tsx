'use client';

import { useState, useEffect } from 'react';
import { useNetworkStats } from '@/hooks/use-pnode-data-query';
import { cn } from '@/lib/utils';

interface MarqueeItemProps {
    label: string;
    value: string;
    valueClassName?: string;
}

function MarqueeItem({ label, value, valueClassName }: MarqueeItemProps) {
    return (
        <span className="inline-flex items-center gap-1.5 px-3 whitespace-nowrap">
            <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">
                {label}
            </span>
            <span className={cn("text-[10px] font-mono text-muted-foreground/70", valueClassName)}>
                {value}
            </span>
        </span>
    );
}

interface XandPrice {
    price: number;
}

async function fetchXandPrice(): Promise<XandPrice | null> {
    try {
        // Use local API route to fetch XAND price (proxies to Jupiter API)
        const response = await fetch('/api/xand-price');
        if (!response.ok) return null;

        const data = await response.json();
        if (!data.price) return null;

        return {
            price: data.price,
        };
    } catch (error) {
        console.error('Failed to fetch XAND price:', error);
        return null;
    }
}


export function NetworkMarquee() {
    const { data: stats } = useNetworkStats();
    const [isPaused, setIsPaused] = useState(false);
    const [xandPrice, setXandPrice] = useState<XandPrice | null>(null);

    // Fetch XAND price on mount and every 60 seconds
    useEffect(() => {
        fetchXandPrice().then(setXandPrice);
        const interval = setInterval(() => {
            fetchXandPrice().then(setXandPrice);
        }, 60000); // Refresh every 60 seconds
        return () => clearInterval(interval);
    }, []);

    const formatPrice = (price: number) => {
        if (price < 0.0001) return `$${price.toExponential(2)}`;
        if (price < 0.01) return `$${price.toFixed(6)}`;
        if (price < 1) return `$${price.toFixed(4)}`;
        return `$${price.toFixed(2)}`;
    };

    const marqueeItems = stats ? [
        // XAND Price Ticker - First item for visibility
        ...(xandPrice ? [{
            label: 'XAND',
            value: formatPrice(xandPrice.price),
            valueClassName: 'text-purple-400 font-semibold'
        }] : []),
        { label: 'NODES ONLINE', value: `${stats.onlineNodes}/${stats.totalNodes}` },
        { label: 'NETWORK HEALTH', value: `${stats.networkHealth.toFixed(1)}%` },
        { label: 'AVG RESPONSE', value: `${stats.averageResponseTime.toFixed(0)}ms` },
        { label: 'STORAGE USED', value: `${stats.totalStorageUsedTB.toFixed(1)}TB` },
        { label: 'STORAGE CAPACITY', value: `${stats.totalStorageCapacityTB.toFixed(1)}TB` },
        { label: 'GOSSIP MSGS 24H', value: `${(stats.gossipMessages24h / 1_000_000).toFixed(1)}M` },
        { label: 'OFFLINE NODES', value: stats.offlineNodes.toString() },
    ] : [
        { label: 'NETWORK', value: 'Connecting to Xandeum nodes...' },
        { label: 'SYSTEM', value: 'Initializing metrics engine...' }
    ];

    return (
        <div
            className="fixed bottom-0 left-0 right-0 h-6 bg-background/90 border-t border-border/20 backdrop-blur-sm z-40"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="h-full flex items-center overflow-hidden">
                <div
                    className={cn(
                        "flex items-center h-full",
                        !isPaused && "animate-marquee"
                    )}
                    style={{
                        animationDuration: '60s',
                        animationIterationCount: 'infinite',
                        animationTimingFunction: 'linear',
                    }}
                >
                    {/* Three sets for seamless loop */}
                    {[1, 2, 3].map((set) => (
                        <div key={set} className="flex items-center">
                            {marqueeItems.map((item, idx) => (
                                <MarqueeItem
                                    key={`set${set}-${idx}`}
                                    label={item.label}
                                    value={item.value}
                                    valueClassName={'valueClassName' in item ? item.valueClassName : undefined}
                                />
                            ))}
                            <span className="px-2 text-muted-foreground/20">•</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
