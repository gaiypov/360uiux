/**
 * 360° РАБОТА - Chat Service
 * Architecture v3: Чат между соискателем и работодателем
 */
export type ChatSenderType = 'jobseeker' | 'employer' | 'system';
export type ChatMessageType = 'text' | 'video' | 'system';
interface CreateMessageParams {
    applicationId: string;
    senderId: string;
    senderType: ChatSenderType;
    messageType: ChatMessageType;
    content?: string;
    videoId?: string;
}
interface ChatMessage {
    id: string;
    application_id: string;
    sender_id: string;
    sender_type: ChatSenderType;
    message_type: ChatMessageType;
    content?: string;
    video_id?: string;
    is_read: boolean;
    read_at?: Date;
    created_at: Date;
    updated_at: Date;
}
export declare class ChatService {
    /**
     * Создать сообщение в чате
     */
    createMessage(params: CreateMessageParams): Promise<ChatMessage>;
    /**
     * Получить все сообщения для отклика
     */
    getMessages(applicationId: string, userId: string): Promise<ChatMessage[]>;
    /**
     * Отметить сообщения как прочитанные
     */
    markAsRead(applicationId: string, senderType: ChatSenderType): Promise<void>;
    /**
     * Получить количество непрочитанных сообщений
     */
    getUnreadCount(applicationId: string, userType: ChatSenderType): Promise<number>;
    /**
     * Создать системное сообщение
     * (например, "Соискатель откликнулся на вакансию")
     */
    createSystemMessage(applicationId: string, content: string): Promise<ChatMessage>;
    /**
     * Создать сообщение с видео-резюме
     * Architecture v3: Автоматически при создании отклика
     */
    createVideoMessage(applicationId: string, senderId: string, videoId: string): Promise<ChatMessage>;
    /**
     * Получить последнее сообщение для отклика
     */
    getLastMessage(applicationId: string): Promise<ChatMessage | null>;
    /**
     * Получить все чаты для пользователя
     * (список откликов с последними сообщениями)
     */
    getUserChats(userId: string, userRole: 'jobseeker' | 'employer'): Promise<any[]>;
    /**
     * Удалить сообщение (только свои)
     */
    deleteMessage(messageId: string, userId: string): Promise<void>;
    /**
     * WebSocket notification (TODO)
     * Currently unused - will be used when WebSocket is implemented
     */
    private sendWebSocketNotification;
}
export declare const chatService: ChatService;
export {};
//# sourceMappingURL=ChatService.d.ts.map