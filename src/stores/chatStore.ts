/**
 * 360° РАБОТА - ULTRA EDITION
 * Chat Store with WebSocket Integration
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { wsService } from '../services/WebSocketService';
import { notificationService } from '../services/NotificationService';

export type MessageType = 'text' | 'video' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface Message {
  id: string;
  type: MessageType; // Architecture v3: text | video | system
  text: string;
  timestamp: Date;
  isOwn: boolean;
  read: boolean;
  status?: MessageStatus; // Message delivery status
  videoId?: string; // Architecture v3: For video messages
  videoUrl?: string;
  viewsRemaining?: number;
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
  isTyping?: boolean; // WebSocket: Typing indicator
  typingUserName?: string;
}

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isConnected: boolean;

  // Actions
  createConversation: (conversation: Omit<Conversation, 'messages' | 'unreadCount'>) => void;
  getConversation: (conversationId: string) => Conversation | undefined;
  sendMessage: (
    conversationId: string,
    text: string,
    type?: MessageType,
    videoId?: string,
    videoUrl?: string,
    attachments?: Message['attachments']
  ) => void;
  receiveMessage: (conversationId: string, message: Omit<Message, 'isOwn' | 'read'>) => void;
  updateMessageStatus: (messageId: string, status: MessageStatus) => void;
  markConversationAsRead: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  setActiveConversation: (conversationId: string | null) => void;
  getTotalUnreadCount: () => number;

  // WebSocket actions
  connectWebSocket: (userId: string) => Promise<void>;
  disconnectWebSocket: () => void;
  setTypingIndicator: (conversationId: string, isTyping: boolean, userName?: string) => void;
  sendTypingIndicator: (conversationId: string, isTyping: boolean) => void;

  // Video actions
  updateVideoViewsRemaining: (videoId: string, viewsRemaining: number) => void;
  markVideoAsDeleted: (videoId: string, messageId: string) => void;

  // Notification actions
  updateBadgeCount: () => Promise<void>;
}

// Badge update tracking to prevent race conditions
let badgeUpdatePending = false;

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      isConnected: false,

      // WebSocket: Connect
      connectWebSocket: async (userId: string) => {
        try {
          await wsService.connect(userId);
          set({ isConnected: true });

          // Initialize notification service
          await notificationService.initialize();

          // Update badge count
          await get().updateBadgeCount();

          // Setup WebSocket event listeners
          wsService.on('message:received', (data: any) => {
            get().receiveMessage(data.conversationId, {
              id: data.id,
              type: data.type,
              text: data.text,
              timestamp: new Date(data.timestamp),
              status: 'delivered',
              videoId: data.videoId,
              videoUrl: data.videoUrl,
              viewsRemaining: data.viewsRemaining,
            });
          });

          wsService.on('message:delivered', (data: any) => {
            get().updateMessageStatus(data.messageId, 'delivered');
          });

          wsService.on('message:read', (data: any) => {
            get().updateMessageStatus(data.messageId, 'read');
          });

          wsService.on('typing:start', (data: any) => {
            get().setTypingIndicator(data.conversationId, true, data.userName);
          });

          wsService.on('typing:stop', (data: any) => {
            get().setTypingIndicator(data.conversationId, false);
          });

          wsService.on('connection:lost', () => {
            set({ isConnected: false });
          });

          wsService.on('connection:success', () => {
            set({ isConnected: true });
          });

          // Video events
          wsService.on('video:viewed', (data: any) => {
            console.log('👁️ Video viewed event:', data);
            get().updateVideoViewsRemaining(data.videoId, data.viewsRemaining);
          });

          wsService.on('video:deleted', (data: any) => {
            console.log('🗑️ Video deleted event:', data);
            get().markVideoAsDeleted(data.videoId, data.messageId);
          });

          console.log('✅ Chat store connected to WebSocket');
        } catch (error) {
          console.error('Error connecting to WebSocket:', error);
          set({ isConnected: false });
        }
      },

      // WebSocket: Disconnect
      disconnectWebSocket: () => {
        wsService.disconnect();
        set({ isConnected: false });
      },

      // WebSocket: Send typing indicator
      sendTypingIndicator: (conversationId: string, isTyping: boolean) => {
        wsService.sendTyping(conversationId, isTyping);
      },

      // WebSocket: Set typing indicator
      setTypingIndicator: (conversationId: string, isTyping: boolean, userName?: string) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  isTyping,
                  typingUserName: userName,
                }
              : conv
          ),
        }));
      },

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

      sendMessage: (conversationId, text, type = 'text', videoId, videoUrl, attachments) => {
        const newMessage: Message = {
          id: Date.now().toString() + Math.random().toString(36).substring(7),
          type, // Architecture v3
          text,
          timestamp: new Date(),
          isOwn: true,
          read: true,
          status: 'sending',
          videoId, // Architecture v3
          videoUrl,
          attachments,
        };

        // Add message to store
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

        // Send via WebSocket
        if (get().isConnected) {
          wsService.sendMessage({
            conversationId,
            text,
            type,
            videoId,
            videoUrl,
          });

          // Update status to sent
          setTimeout(() => {
            get().updateMessageStatus(newMessage.id, 'sent');
          }, 100);
        } else {
          // Update status to failed if not connected
          setTimeout(() => {
            get().updateMessageStatus(newMessage.id, 'failed');
          }, 100);
        }
      },

      // Update message status
      updateMessageStatus: (messageId: string, status: MessageStatus) => {
        set((state) => ({
          conversations: state.conversations.map((conv) => ({
            ...conv,
            messages: conv.messages.map((msg) =>
              msg.id === messageId
                ? { ...msg, status }
                : msg
            ),
          })),
        }));
      },

      receiveMessage: (conversationId, message) => {
        // Use existing message ID from WebSocket or generate new one
        const newMessage: Message = {
          ...message,
          id: message.id || Date.now().toString() + Math.random().toString(36).substring(7),
          isOwn: false,
          read: false,
        };

        set((state) => {
          const isActiveConversation = state.activeConversationId === conversationId;

          // Mark as read immediately if conversation is active
          if (isActiveConversation && get().isConnected) {
            wsService.markAsRead(newMessage.id, conversationId);
          }

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

        // Update badge count
        get().updateBadgeCount();
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

        // Update badge count
        get().updateBadgeCount();

        // Clear notification for this conversation
        notificationService.cancelNotification(conversationId);
      },

      deleteConversation: (conversationId) => {
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== conversationId),
          activeConversationId:
            state.activeConversationId === conversationId ? null : state.activeConversationId,
        }));
      },

      setActiveConversation: (conversationId) => {
        const prevConversationId = get().activeConversationId;

        // Leave previous conversation room
        if (prevConversationId && get().isConnected) {
          wsService.leaveConversation(prevConversationId);
        }

        set({ activeConversationId: conversationId });

        // Join new conversation room and mark as read
        if (conversationId) {
          if (get().isConnected) {
            wsService.joinConversation(conversationId);
            wsService.markConversationAsRead(conversationId);
          }
          get().markConversationAsRead(conversationId);
        }
      },

      getTotalUnreadCount: () => {
        return get().conversations.reduce((total, conv) => total + conv.unreadCount, 0);
      },

      // Video: Update views remaining for a video message
      updateVideoViewsRemaining: (videoId: string, viewsRemaining: number) => {
        set((state) => ({
          conversations: state.conversations.map((conv) => ({
            ...conv,
            messages: conv.messages.map((msg) =>
              msg.videoId === videoId
                ? { ...msg, viewsRemaining }
                : msg
            ),
          })),
        }));
      },

      // Video: Mark video as deleted
      markVideoAsDeleted: (videoId: string, messageId: string) => {
        set((state) => ({
          conversations: state.conversations.map((conv) => ({
            ...conv,
            messages: conv.messages.map((msg) =>
              msg.videoId === videoId || msg.id === messageId
                ? { ...msg, viewsRemaining: 0 }
                : msg
            ),
          })),
        }));
      },

      // Notification: Update badge count
      updateBadgeCount: async () => {
        // Prevent race conditions - skip if update already pending
        if (badgeUpdatePending) {
          console.log('📱 Badge update already pending, skipping...');
          return;
        }

        badgeUpdatePending = true;

        try {
          const totalUnread = get().getTotalUnreadCount();
          await notificationService.setBadgeCount(totalUnread);
          console.log('📱 Badge count updated:', totalUnread);
        } catch (error) {
          console.error('❌ Error updating badge count:', error);
        } finally {
          badgeUpdatePending = false;
        }
      },
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        conversations: state.conversations,
        // Don't persist WebSocket connection state
      }),
    }
  )
);
