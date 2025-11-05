/**
 * 360° РАБОТА - ULTRA EDITION
 * Chat Store
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Message {
  id: string;
  text: string;
  timestamp: Date;
  isOwn: boolean;
  read: boolean;
  attachments?: Array<{
    id: string;
    type: 'image' | 'file';
    url: string;
    name: string;
  }>;
}

export interface Conversation {
  id: string;
  employerName: string;
  employerId: string;
  vacancyTitle: string;
  vacancyId: string;
  lastMessage?: Message;
  unreadCount: number;
  messages: Message[];
}

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;

  // Actions
  createConversation: (conversation: Omit<Conversation, 'messages' | 'unreadCount'>) => void;
  getConversation: (conversationId: string) => Conversation | undefined;
  sendMessage: (conversationId: string, text: string, attachments?: Message['attachments']) => void;
  receiveMessage: (conversationId: string, message: Omit<Message, 'id' | 'isOwn' | 'read'>) => void;
  markConversationAsRead: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  setActiveConversation: (conversationId: string | null) => void;
  getTotalUnreadCount: () => number;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,

      createConversation: (conversation) => {
        set((state) => {
          // Check if conversation already exists
          const existing = state.conversations.find((c) => c.id === conversation.id);
          if (existing) return state;

          return {
            conversations: [
              ...state.conversations,
              {
                ...conversation,
                messages: [],
                unreadCount: 0,
              },
            ],
          };
        });
      },

      getConversation: (conversationId) => {
        return get().conversations.find((c) => c.id === conversationId);
      },

      sendMessage: (conversationId, text, attachments) => {
        const newMessage: Message = {
          id: Date.now().toString() + Math.random().toString(36).substring(7),
          text,
          timestamp: new Date(),
          isOwn: true,
          read: true,
          attachments,
        };

        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, newMessage],
                  lastMessage: newMessage,
                }
              : conv
          ),
        }));
      },

      receiveMessage: (conversationId, message) => {
        const newMessage: Message = {
          ...message,
          id: Date.now().toString() + Math.random().toString(36).substring(7),
          isOwn: false,
          read: false,
        };

        set((state) => {
          const isActiveConversation = state.activeConversationId === conversationId;

          return {
            conversations: state.conversations.map((conv) =>
              conv.id === conversationId
                ? {
                    ...conv,
                    messages: [...conv.messages, newMessage],
                    lastMessage: newMessage,
                    unreadCount: isActiveConversation ? conv.unreadCount : conv.unreadCount + 1,
                  }
                : conv
            ),
          };
        });
      },

      markConversationAsRead: (conversationId) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  unreadCount: 0,
                  messages: conv.messages.map((msg) => ({ ...msg, read: true })),
                }
              : conv
          ),
        }));
      },

      deleteConversation: (conversationId) => {
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== conversationId),
          activeConversationId:
            state.activeConversationId === conversationId ? null : state.activeConversationId,
        }));
      },

      setActiveConversation: (conversationId) => {
        set({ activeConversationId: conversationId });

        // Auto-mark as read when opening conversation
        if (conversationId) {
          get().markConversationAsRead(conversationId);
        }
      },

      getTotalUnreadCount: () => {
        return get().conversations.reduce((total, conv) => total + conv.unreadCount, 0);
      },
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        conversations: state.conversations,
      }),
    }
  )
);
