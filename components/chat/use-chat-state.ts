import { create } from "zustand";
import type { ChatState, ChatMessage, ChatConversation } from "@/types/chat";
import { getCurrentUser, fetchConversations, sendMessage as sendChatMessage } from "@/lib/chat-utils";


type ChatComponentState = {
  state: ChatState;
  activeConversation?: string;
};

interface ChatStore {
  // State
  chatState: ChatComponentState;
  conversations: ChatConversation[];
  newMessage: string;
  isInitialized: boolean;

  // Actions
  setChatState: (state: ChatComponentState) => void;
  setConversations: (conversations: ChatConversation[]) => void;
  setNewMessage: (message: string) => void;
  handleSendMessage: () => void;
  openConversation: (conversationId: string) => void;
  openConversationWithUser: (userId: string, userName: string, userAvatar?: string) => void;
  goBack: () => void;
  toggleExpanded: () => void;
  initializeChat: () => void;
  refreshConversations: () => void;
}

const chatStore = create<ChatStore>((set, get) => ({
  // Initial state
  chatState: {
    state: "collapsed",
  },
  conversations: [],
  newMessage: "",
  isInitialized: false,

  // Actions
  setChatState: (chatState) => set({ chatState }),

  setConversations: (conversations) => set({ conversations }),

  setNewMessage: (newMessage) => set({ newMessage }),

  refreshConversations: async () => {
    const conversations = await fetchConversations();
    set({ conversations });
  },

  initializeChat: async () => {
    const { isInitialized } = get();
    if (isInitialized) return;

    set({ isInitialized: true });

    // Initial Fetch from Redis
    const conversations = await fetchConversations();
    set({ conversations });

    // Set up polling for new messages (every 5 seconds)
    // Poll for new messages every 5 seconds
    setInterval(async () => {
      const updatedConversations = await fetchConversations();
      set({ conversations: updatedConversations });
    }, 5000);
  },

  handleSendMessage: async () => {
    const { newMessage, conversations, chatState, refreshConversations } = get();
    const activeConvId = chatState.activeConversation;
    const activeConv = conversations.find(c => c.id === activeConvId);

    if (!newMessage.trim() || !activeConv) return;

    const currentUser = getCurrentUser();
    const content = newMessage.trim();

    // Optimistic UI update
    const optimisticMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      content,
      timestamp: new Date().toISOString(),
      senderId: currentUser.id,
      isFromCurrentUser: true,
    };

    const updatedConversations = conversations.map(c => {
      if (c.id === activeConvId) {
        return {
          ...c,
          messages: [...c.messages, optimisticMessage],
          lastMessage: optimisticMessage,
        };
      }
      return c;
    });

    set({ conversations: updatedConversations, newMessage: "" });

    // Actually send to Redis
    try {
      await sendChatMessage(content, activeConv.id, currentUser.id);
    } catch (err) {
      console.error('Failed to send message:', err);
      // Revert optimistic update on error
      refreshConversations();
    }
  },

  openConversation: (conversationId) => {
    const { conversations } = get();

    set({
      chatState: { state: "conversation", activeConversation: conversationId },
    });

    // Mark conversation as read
    const updatedConversations = conversations.map((conv) =>
      conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
    );

    set({ conversations: updatedConversations });
  },

  goBack: () => {
    const { chatState } = get();
    if (chatState.state === "conversation") {
      set({ chatState: { state: "expanded" } });
    } else {
      set({ chatState: { state: "collapsed" } });
    }
  },

  openConversationWithUser: (userId: string, userName: string, userAvatar?: string) => {
    const { conversations } = get();

    // Check if conversation already exists
    const existing = conversations.find(c =>
      c.participants.some(p => p.id === userId)
    );

    if (existing) {
      set({
        chatState: { state: "conversation", activeConversation: existing.id }
      });
      return;
    }

    // Create new optimistic conversation
    const newId = `dm-${Date.now()}`;

    const newConversation: ChatConversation = {
      id: newId,
      participants: [
        {
          id: userId,
          name: userName,
          username: `@${userName.toLowerCase().replace(/\s+/g, '')}`,
          avatar: userAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${userId}`,
          isOnline: Math.random() > 0.5
        }
      ],
      messages: [],
      unreadCount: 0,
      lastMessage: undefined
    };

    set({
      conversations: [...conversations, newConversation],
      chatState: { state: "conversation", activeConversation: newId }
    });
  },

  toggleExpanded: () => {
    const { chatState } = get();
    set({
      chatState: {
        state: chatState.state === "collapsed" ? "expanded" : "collapsed",
      },
    });
  },
}));

// Hook with computed values using selectors
export const useChatState = () => {
  const chatState = chatStore((state) => state.chatState);
  const conversations = chatStore((state) => state.conversations);
  const newMessage = chatStore((state) => state.newMessage);
  const setChatState = chatStore((state) => state.setChatState);
  const setConversations = chatStore((state) => state.setConversations);
  const setNewMessage = chatStore((state) => state.setNewMessage);
  const handleSendMessage = chatStore((state) => state.handleSendMessage);
  const openConversation = chatStore((state) => state.openConversation);
  const openConversationWithUser = chatStore((state) => state.openConversationWithUser);
  const goBack = chatStore((state) => state.goBack);
  const toggleExpanded = chatStore((state) => state.toggleExpanded);
  const initializeChat = chatStore((state) => state.initializeChat);

  // Computed values
  const totalUnreadCount = conversations.reduce(
    (total, conv) => total + conv.unreadCount,
    0
  );

  const activeConversation = conversations.find(
    (conv) => conv.id === chatState.activeConversation
  );

  return {
    chatState,
    conversations,
    newMessage,
    totalUnreadCount,
    activeConversation,
    setChatState,
    setConversations,
    setNewMessage,
    handleSendMessage,
    openConversation,
    openConversationWithUser,
    goBack,
    toggleExpanded,
    initializeChat,
  };
};
