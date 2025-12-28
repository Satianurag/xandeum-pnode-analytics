import { NextResponse } from 'next/server';
import { redis, CACHE_KEYS, CACHE_TTL } from '@/lib/redis';

// Base conversation structure
const BASE_CONVERSATIONS = [
    { id: 'krimson-chat', participants: [{ id: 'krimson', name: 'KRIMSON', username: '@KRIMSON', avatar: '/avatars/user_krimson.png', isOnline: true }] },
    { id: 'mati-chat', participants: [{ id: 'mati', name: 'MATI', username: '@MATI', avatar: '/avatars/user_mati.png', isOnline: false }] },
    { id: 'pek-chat', participants: [{ id: 'pek', name: 'PEK', username: '@PEK', avatar: '/avatars/user_pek.png', isOnline: true }] },
    { id: 'v0-chat', participants: [{ id: 'v0', name: 'V0', username: '@V0', avatar: '/avatars/user_krimson.png', isOnline: false }] },
    { id: 'rampant-chat', participants: [{ id: 'rampant', name: 'RAMPANT', username: '@RAMPANT.WORKS', avatar: '/avatars/user_mati.png', isOnline: false }] },
];

// GET - fetch conversations with messages
export async function GET() {
    try {
        const conversations = await Promise.all(
            BASE_CONVERSATIONS.map(async (conv) => {
                try {
                    const messages = await redis.lrange(CACHE_KEYS.CHAT_MESSAGES(conv.id), 0, 99);
                    const chatMessages = messages.map((msg: any) => {
                        const parsed = typeof msg === 'string' ? JSON.parse(msg) : msg;
                        return {
                            id: parsed.id,
                            content: parsed.content,
                            timestamp: parsed.timestamp,
                            senderId: parsed.senderId || parsed.sender_id,
                        };
                    });

                    return {
                        ...conv,
                        messages: chatMessages,
                        lastMessage: chatMessages.length > 0 ? chatMessages[chatMessages.length - 1] : undefined,
                        unreadCount: 0
                    };
                } catch {
                    return { ...conv, messages: [], unreadCount: 0, lastMessage: undefined };
                }
            })
        );

        return NextResponse.json(conversations);
    } catch (err) {
        console.error('GET chat error:', err);
        return NextResponse.json(BASE_CONVERSATIONS.map(c => ({ ...c, messages: [], unreadCount: 0 })));
    }
}

// POST - send a message
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { conversationId, content, senderId } = body;

        if (!conversationId || !content || !senderId) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const message = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            content,
            senderId,
            timestamp: new Date().toISOString()
        };

        await redis.rpush(CACHE_KEYS.CHAT_MESSAGES(conversationId), JSON.stringify(message));
        await redis.expire(CACHE_KEYS.CHAT_MESSAGES(conversationId), CACHE_TTL.CHAT_MESSAGES);

        return NextResponse.json({ success: true, message });
    } catch (err) {
        console.error('POST chat error:', err);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}
