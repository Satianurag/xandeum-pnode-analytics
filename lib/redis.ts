/**
 * Upstash Redis Client
 * Used for caching pNodes, network stats, chat messages, and notifications
 */

import { Redis } from '@upstash/redis';

// Create Redis client using environment variables
export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Helper to check if Redis is properly configured
export const isRedisConfigured = () => {
    return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
};

// Cache keys
export const CACHE_KEYS = {
    PNODES: 'pnodes:all',
    NETWORK_STATS: 'network:stats',
    NETWORK_HISTORY: 'network:history',
    CHAT_MESSAGES: (conversationId: string) => `chat:messages:${conversationId}`,
    NOTIFICATIONS: 'notifications:all',
} as const;

// Cache durations in seconds
export const CACHE_TTL = {
    PNODES: 300, // 5 minutes
    NETWORK_STATS: 300, // 5 minutes
    CHAT_MESSAGES: 60 * 60 * 24 * 7, // 7 days
    NOTIFICATIONS: 60 * 60 * 24, // 1 day
} as const;
