/**
 * 360° РАБОТА - WebSocket Service
 * Real-time messaging with Socket.IO
 */

import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SecureStorage, SECURE_STORAGE_KEYS, migrateFromAsyncStorage } from '../utils/SecureStorage';

// Legacy AsyncStorage key (for migration)
const LEGACY_ACCESS_TOKEN_KEY = '@360rabota:access_token';

interface MessageData {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  type: 'text' | 'video' | 'system';
  timestamp: string;
  videoId?: string;
  videoUrl?: string;
  viewsRemaining?: number;
}

interface TypingData {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

interface MessageDeliveredData {
  messageId: string;
  conversationId: string;
  deliveredAt: string;
}

interface MessageReadData {
  messageId: string;
  conversationId: string;
  readAt: string;
}

interface VideoViewData {
  videoId: string;
  conversationId: string;
  viewsRemaining: number;
  viewedAt: string;
}

interface VideoDeletedData {
  videoId: string;
  conversationId: string;
  messageId: string;
  deletedAt: string;
}

type EventCallback = (...args: any[]) => void;

export class WebSocketService {
  private static instance: WebSocketService;
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private userId: string | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private eventCallbacks: Map<string, Set<EventCallback>> = new Map();

  private constructor() {}

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  /**
   * Connect to WebSocket server
   */
  async connect(userId: string): Promise<void> {
    try {
      this.userId = userId;

      // Get auth token from SecureStorage
      let token = await SecureStorage.getItem(SECURE_STORAGE_KEYS.ACCESS_TOKEN);

      // Migration: If not found in SecureStorage, check legacy AsyncStorage
      if (!token) {
        console.log('🔄 Migrating WebSocket token from AsyncStorage to SecureStorage...');
        const migrated = await migrateFromAsyncStorage(
          AsyncStorage,
          LEGACY_ACCESS_TOKEN_KEY,
          SECURE_STORAGE_KEYS.ACCESS_TOKEN
        );
        if (migrated) {
          token = await SecureStorage.getItem(SECURE_STORAGE_KEYS.ACCESS_TOKEN);
        }
      }

      if (!token) {
        throw new Error('No auth token found');
      }

      // Connect to WebSocket server
      const WS_URL = process.env.WS_URL || 'http://localhost:5000';

      this.socket = io(WS_URL, {
        auth: {
          token,
          userId,
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
        timeout: 10000,
      });

      // Setup event listeners
      this.setupEventListeners();

      console.log('📡 WebSocket connecting...');
    } catch (error) {
      console.error('❌ Error connecting to WebSocket:', error);
      throw error;
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      console.log('📡 WebSocket disconnecting...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connection:success');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      this.isConnected = false;
      this.emit('connection:lost', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      this.reconnectAttempts++;
      this.emit('connection:error', error);

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.emit('connection:failed');
      }
    });

    // Message events
    this.socket.on('message:new', (data: MessageData) => {
      console.log('📨 New message received:', data);
      this.emit('message:received', data);
    });

    this.socket.on('message:delivered', (data: MessageDeliveredData) => {
      console.log('✓ Message delivered:', data);
      this.emit('message:delivered', data);
    });

    this.socket.on('message:read', (data: MessageReadData) => {
      console.log('✓✓ Message read:', data);
      this.emit('message:read', data);
    });

    // Typing indicators
    this.socket.on('typing:start', (data: TypingData) => {
      console.log('✍️ User typing:', data);
      this.emit('typing:start', data);
    });

    this.socket.on('typing:stop', (data: TypingData) => {
      console.log('✍️ User stopped typing:', data);
      this.emit('typing:stop', data);
    });

    // Conversation events
    this.socket.on('conversation:updated', (data: any) => {
      console.log('🔄 Conversation updated:', data);
      this.emit('conversation:updated', data);
    });

    // Video events
    this.socket.on('video:viewed', (data: VideoViewData) => {
      console.log('👁️ Video viewed:', data);
      this.emit('video:viewed', data);
    });

    this.socket.on('video:deleted', (data: VideoDeletedData) => {
      console.log('🗑️ Video deleted:', data);
      this.emit('video:deleted', data);
    });
  }

  /**
   * Send a message
   */
  sendMessage(data: {
    conversationId: string;
    text: string;
    type?: 'text' | 'video' | 'system';
    videoId?: string;
    videoUrl?: string;
  }): void {
    if (!this.socket || !this.isConnected) {
      console.error('WebSocket not connected');
      return;
    }

    console.log('📤 Sending message:', data);

    this.socket.emit('message:send', {
      ...data,
      senderId: this.userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Mark message as delivered
   */
  markAsDelivered(messageId: string, conversationId: string): void {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('message:delivered', {
      messageId,
      conversationId,
      userId: this.userId,
    });
  }

  /**
   * Mark message as read
   */
  markAsRead(messageId: string, conversationId: string): void {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('message:read', {
      messageId,
      conversationId,
      userId: this.userId,
    });
  }

  /**
   * Mark conversation as read
   */
  markConversationAsRead(conversationId: string): void {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('conversation:read', {
      conversationId,
      userId: this.userId,
    });
  }

  /**
   * Send typing indicator
   */
  sendTyping(conversationId: string, isTyping: boolean): void {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('typing', {
      conversationId,
      userId: this.userId,
      isTyping,
    });
  }

  /**
   * Join conversation room
   */
  joinConversation(conversationId: string): void {
    if (!this.socket || !this.isConnected) return;

    console.log('🔗 Joining conversation:', conversationId);
    this.socket.emit('conversation:join', {
      conversationId,
      userId: this.userId,
    });
  }

  /**
   * Leave conversation room
   */
  leaveConversation(conversationId: string): void {
    if (!this.socket || !this.isConnected) return;

    console.log('🔗 Leaving conversation:', conversationId);
    this.socket.emit('conversation:leave', {
      conversationId,
      userId: this.userId,
    });
  }

  /**
   * Track video view
   */
  trackVideoView(videoId: string, conversationId: string, messageId: string): void {
    if (!this.socket || !this.isConnected) return;

    console.log('👁️ Tracking video view:', videoId);
    this.socket.emit('video:track', {
      videoId,
      conversationId,
      messageId,
      userId: this.userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Notify video deletion
   */
  notifyVideoDeleted(videoId: string, conversationId: string, messageId: string): void {
    if (!this.socket || !this.isConnected) return;

    console.log('🗑️ Notifying video deleted:', videoId);
    this.socket.emit('video:delete', {
      videoId,
      conversationId,
      messageId,
      userId: this.userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Subscribe to event
   */
  on(event: string, callback: EventCallback): void {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, new Set());
    }
    this.eventCallbacks.get(event)!.add(callback);
  }

  /**
   * Unsubscribe from event
   */
  off(event: string, callback: EventCallback): void {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  /**
   * Emit event to subscribers
   */
  private emit(event: string, ...args: any[]): void {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event callback for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Check if connected
   */
  isSocketConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Get user ID
   */
  getUserId(): string | null {
    return this.userId;
  }
}

// Export singleton instance
export const wsService = WebSocketService.getInstance();
