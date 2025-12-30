/**
 * Upstash Redis Client
 * Used for caching pNodes, network stats, chat messages, and notifications
 */

import { Redis } from '@upstash/redis';

// Helper to check if Redis is properly configured
export const isRedisConfigured = () => {
    return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
};

type RedisClient = {
    get<T = unknown>(key: string): Promise<T | null>;
    set(key: string, value: unknown, opts?: { ex?: number }): Promise<unknown>;
    del(...keys: string[]): Promise<number>;
    lrange<T = unknown>(key: string, start: number, stop: number): Promise<T[]>;
    rpush(key: string, ...values: string[]): Promise<number>;
    lpush(key: string, ...values: string[]): Promise<number>;
    ltrim(key: string, start: number, stop: number): Promise<unknown>;
    expire(key: string, seconds: number): Promise<number>;
};

class NoopRedis implements RedisClient {
    async get<T = unknown>(_key: string): Promise<T | null> {
        return null;
    }
    async set(_key: string, _value: unknown, _opts?: { ex?: number }): Promise<unknown> {
        return null;
    }
    async del(..._keys: string[]): Promise<number> {
        return 0;
    }
    async lrange<T = unknown>(_key: string, _start: number, _stop: number): Promise<T[]> {
        return [];
    }
    async rpush(_key: string, ..._values: string[]): Promise<number> {
        return 0;
    }
    async lpush(_key: string, ..._values: string[]): Promise<number> {
        return 0;
    }
    async ltrim(_key: string, _start: number, _stop: number): Promise<unknown> {
        return null;
    }
    async expire(_key: string, _seconds: number): Promise<number> {
        return 0;
    }
}

// Create Redis client using environment variables
export const redis: RedisClient = isRedisConfigured()
    ? (new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL as string,
        token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
    }) as unknown as RedisClient)
    : new NoopRedis();

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
