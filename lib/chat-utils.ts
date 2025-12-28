import type { ChatConversation, ChatMessage, ChatUser } from "@/types/chat";

// Default user for demo/testing when no wallet connected
const DEFAULT_USER: ChatUser = {
    id: "joyboy",
    name: "JOYBOY",
    username: "@JOYBOY",
    avatar: "/avatars/user_joyboy.png",
    isOnline: true,
};

// Get current user - uses default for backwards compatibility
export const getCurrentUser = (): ChatUser => DEFAULT_USER;

// Truncate address helper (moved here to avoid circular import)
export function truncateAddress(address: string, chars = 6): string {
    if (!address) return '';
    if (address.length <= chars * 2) return address;
    return `${address.slice(0, chars)}...${address.slice(-4)}`;
}

// Get user based on connected wallet
export const getConnectedUser = (walletPubkey: string | null): ChatUser => {
    if (!walletPubkey) {
        return DEFAULT_USER;
    }

    const truncated = truncateAddress(walletPubkey, 4);
    return {
        id: walletPubkey,
        name: truncated.toUpperCase(),
        username: `@${truncated}`,
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${walletPubkey}`,
        isOnline: true,
    };
};

export const mapProfileToChatUser = (profile: any): ChatUser => ({
    id: profile.id,
    name: profile.name,
    username: profile.username,
    avatar: profile.avatar,
    isOnline: profile.is_online
});

export const mapMessageToChatMessage = (msg: any, currentUserId: string): ChatMessage => ({
    id: msg.id,
    content: msg.content,
    timestamp: msg.timestamp,
    senderId: msg.senderId || msg.sender_id,
    isFromCurrentUser: (msg.senderId || msg.sender_id) === currentUserId,
});

// Fetch conversations from API route (server-side Redis)
export const fetchConversations = async (): Promise<ChatConversation[]> => {
    try {
        const currentUser = getCurrentUser();
        const res = await fetch('/api/chat');

        if (!res.ok) {
            console.error('Failed to fetch conversations');
            return [];
        }

        const conversations = await res.json();

        // Add isFromCurrentUser to each message
        return conversations.map((conv: any) => ({
            ...conv,
            messages: conv.messages.map((msg: any) => mapMessageToChatMessage(msg, currentUser.id)),
        }));
    } catch (err) {
        console.error('Failed to fetch conversations:', err);
        return [];
    }
};

// Send message via API route (server-side Redis)
export const sendMessage = async (content: string, conversationId: string, senderId: string) => {
    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversationId, content, senderId })
        });

        if (!res.ok) {
            throw new Error('Failed to send message');
        }

        console.log(`Message sent to ${conversationId}`);
    } catch (err) {
        console.error('Error sending message:', err);
        throw err;
    }
};
