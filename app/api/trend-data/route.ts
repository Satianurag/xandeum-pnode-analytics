import { NextResponse } from 'next/server';
import { redis, CACHE_KEYS } from '@/lib/redis';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const metric = searchParams.get('metric') || 'network_health';
        const period = searchParams.get('period') || '24h';

        // Determine how many records to fetch based on period
        let limit = 24;
        if (period === '7d') limit = 168;
        if (period === '30d') limit = 720;

        // Get history from Redis
        const historyData = await redis.lrange(CACHE_KEYS.NETWORK_HISTORY, 0, limit - 1);

        if (!historyData || historyData.length === 0) {
            return NextResponse.json([]);
        }

        // Map metric name to key in history object
        const metricMap: Record<string, string> = {
            'network_health': 'networkHealth',
            'response_time': 'avgResponseTime',
            'online_nodes': 'onlineNodes',
            'storage_used': 'storageUsedTB',
            'uptime': 'avgUptime'
        };

        const metricKey = metricMap[metric] || 'networkHealth';

        // Format data for charting
        const trendData = historyData.reverse().map((item: any) => {
            const parsed = typeof item === 'string' ? JSON.parse(item) : item;
            return {
                timestamp: parsed.timestamp,
                value: parsed[metricKey] || 0,
                label: new Date(parsed.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };
        });

        return NextResponse.json(trendData);
    } catch (error) {
        console.error('Trend data error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
