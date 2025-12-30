"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Notification } from '@/types/dashboard';

// API endpoint for notifications (server-side Redis access)
async function fetchNotifications(): Promise<Notification[]> {
    try {
        const res = await fetch('/api/notifications');
        if (!res.ok) {
            console.log('Notifications fetch failed, using defaults');
            return getDefaultNotifications();
        }
        return res.json();
    } catch (err) {
        console.log('Notifications fetch error:', err);
        return getDefaultNotifications();
    }
}

// Default notifications for fallback
function getDefaultNotifications(): Notification[] {
    return [
        {
            id: 'default-1',
            title: 'Welcome to the Xandeum pNode Dashboard',
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
}

async function markAsRead(id: string): Promise<void> {
    try {
        await fetch('/api/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'markRead', id })
        });
    } catch (err) {
        console.log('Mark as read failed:', err);
    }
}

async function deleteNotification(id: string): Promise<void> {
    try {
        await fetch('/api/notifications', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
    } catch (err) {
        console.log('Delete notification failed:', err);
    }
}

async function markAllAsRead(): Promise<void> {
    try {
        await fetch('/api/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'markAllRead' })
        });
    } catch (err) {
        console.log('Mark all as read failed:', err);
    }
}

// --- Hook ---

export function useNotifications() {
    const queryClient = useQueryClient();
    const notificationsKey = ['notifications'];

    // 1. Fetch Notifications with 5 minute cache
    const {
        data: notifications = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: notificationsKey,
        queryFn: fetchNotifications,
        staleTime: 5 * 60 * 1000, // 5 minutes cache
        refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    });

    // 2. Mutations
    const markReadMutation = useMutation({
        mutationFn: markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationsKey });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteNotification,
        onSuccess: () => {
            toast.success('Notification deleted');
            queryClient.invalidateQueries({ queryKey: notificationsKey });
        },
    });

    const markAllReadMutation = useMutation({
        mutationFn: markAllAsRead,
        onSuccess: () => {
            toast.success('All marked as read');
            queryClient.invalidateQueries({ queryKey: notificationsKey });
        },
    });

    // Derived state
    const unreadCount = notifications.filter((n) => !n.read).length;

    return {
        notifications,
        isLoading,
        error,
        unreadCount,
        markAsRead: (id: string) => markReadMutation.mutate(id),
        deleteNotification: (id: string) => deleteMutation.mutate(id),
        markAllAsRead: () => markAllReadMutation.mutate(),
    };
}
