import { NextResponse } from 'next/server';
import { redis, CACHE_KEYS } from '@/lib/redis';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || '24h';

        // Determine how many records to fetch based on period
        let limit = 24;
        if (period === '7d') limit = 168;
        if (period === '30d') limit = 720;

        // Fetch historical data from Redis
        const historyData = await redis.lrange(CACHE_KEYS.NETWORK_HISTORY, 0, limit - 1);

        if (!historyData || historyData.length === 0) {
            return NextResponse.json({
                current: 0,
                previous: 0,
                trend: 0,
                trendPercent: 0,
                allTimeHigh: 0,
                allTimeLow: 0,
                history: []
            });
        }

        // Parse the data
        const parsedData = historyData.map((item: any) => {
            try {
                return typeof item === 'string' ? JSON.parse(item) : item;
            } catch (error) {
                console.warn('Skipping malformed history item:', item);
                return null;
            }
        }).filter((item: any) => item !== null);

        // Get current network stats for health
        const currentStats = await redis.get(CACHE_KEYS.NETWORK_STATS) as string | null;
        let currentHealth = 0;
        if (currentStats) {
            const parsed = JSON.parse(currentStats);
            currentHealth = parsed.networkHealth || 0;
        }

        // Calculate trends
        const healthScores = parsedData.map((d: any) => {
            // Calculate health from onlineNodes / totalNodes
            const health = d.totalNodes > 0 ? (d.onlineNodes / d.totalNodes) * 100 : 0;
            return health;
        });

        const current = currentHealth || healthScores[0] || 0;
        const previous = healthScores.length > 0 ? healthScores[0] : current;
        const trend = current - previous;
        const trendPercent = previous > 0 ? ((current - previous) / previous) * 100 : 0;

        const allTimeHigh = Math.max(...healthScores, current);
        const allTimeLow = Math.min(...healthScores.filter((h: number) => h > 0), current);

        // Format history for charting
        const history = parsedData.reverse().map((d: any) => ({
            timestamp: d.timestamp,
            value: d.totalNodes > 0 ? (d.onlineNodes / d.totalNodes) * 100 : 0
        }));

        return NextResponse.json({
            current,
            previous,
            trend,
            trendPercent,
            allTimeHigh: allTimeHigh || current,
            allTimeLow: allTimeLow || current,
            history
        });
    } catch (error) {
        console.error('Health trends error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
