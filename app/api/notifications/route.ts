import { NextResponse } from 'next/server';
import { redis, CACHE_KEYS, CACHE_TTL } from '@/lib/redis';
import type { Notification } from '@/types/dashboard';

// Helper for safe JSON parsing (Upstash auto-parses)
function safeParseNotifications(data: any): Notification[] {
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') return JSON.parse(data);
    return [];
}

// GET - fetch notifications
export async function GET() {
    try {
        const cached = await redis.get(CACHE_KEYS.NOTIFICATIONS);

        if (cached) {
            const notifications = safeParseNotifications(cached);
            return NextResponse.json(notifications);
        }

        // Return default notifications if none exist
        const defaults: Notification[] = [
            {
                id: 'default-1',
                title: 'Welcome to pNode Analytics',
                message: 'Real-time monitoring is now active. Data refreshes every 5 minutes.',
                type: 'info',
                priority: 'low',
                read: false,
                timestamp: new Date().toISOString(),
            },
            {
                id: 'default-2',
                title: 'Network Connected',
                message: 'Successfully connected to Xandeum network via pRPC.',
                type: 'success',
                priority: 'low',
                read: true,
                timestamp: new Date(Date.now() - 3600 * 1000).toISOString(),
            },
        ];

        return NextResponse.json(defaults);
    } catch (err) {
        console.error('GET notifications error:', err);
        return NextResponse.json([], { status: 500 });
    }
}

// PATCH - mark as read
export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { action, id } = body;

        const cached = await redis.get(CACHE_KEYS.NOTIFICATIONS);
        if (!cached) {
            return NextResponse.json({ success: true });
        }

        let notifications: Notification[] = safeParseNotifications(cached);

        if (action === 'markRead' && id) {
            notifications = notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
            );
        } else if (action === 'markAllRead') {
            notifications = notifications.map(n => ({ ...n, read: true }));
        }

        await redis.set(CACHE_KEYS.NOTIFICATIONS, JSON.stringify(notifications), { ex: CACHE_TTL.NOTIFICATIONS });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('PATCH notifications error:', err);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

// DELETE - delete notification
export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const { id } = body;

        const cached = await redis.get(CACHE_KEYS.NOTIFICATIONS);
        if (!cached) {
            return NextResponse.json({ success: true });
        }

        let notifications: Notification[] = safeParseNotifications(cached);
        notifications = notifications.filter(n => n.id !== id);

        await redis.set(CACHE_KEYS.NOTIFICATIONS, JSON.stringify(notifications), { ex: CACHE_TTL.NOTIFICATIONS });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('DELETE notifications error:', err);
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
