/**
 * 360° РАБОТА - Chat Routes
 * Architecture v3: Chat endpoints для общения между соискателем и работодателем
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { ChatController } from '../controllers/ChatController';

const router = Router();

// ===================================
// CHAT ROUTES
// ===================================

/**
 * @route   GET /api/v1/chat/my-chats
 * @desc    Получить все чаты пользователя
 * @access  Private (Jobseeker or Employer)
 */
router.get('/my-chats', authMiddleware, ChatController.getMyChats);

/**
 * @route   GET /api/v1/chat/:applicationId/messages
 * @desc    Получить все сообщения в чате
 * @access  Private (Участники отклика)
 */
router.get('/:applicationId/messages', authMiddleware, ChatController.getMessages);

/**
 * @route   POST /api/v1/chat/:applicationId/messages
 * @desc    Отправить сообщение
 * @access  Private (Участники отклика)
 * @body    { messageType: 'text' | 'video' | 'voice' | 'image', content?: string, videoId?: string, audioUri?: string, imageUri?: string }
 */
router.post('/:applicationId/messages', authMiddleware, ChatController.sendMessage);

/**
 * @route   PUT /api/v1/chat/:applicationId/read
 * @desc    Отметить сообщения как прочитанные
 * @access  Private (Участники отклика)
 */
router.put('/:applicationId/read', authMiddleware, ChatController.markAsRead);

/**
 * @route   GET /api/v1/chat/:applicationId/unread-count
 * @desc    Получить количество непрочитанных сообщений
 * @access  Private (Участники отклика)
 */
router.get('/:applicationId/unread-count', authMiddleware, ChatController.getUnreadCount);

/**
 * @route   DELETE /api/v1/chat/messages/:messageId
 * @desc    Удалить сообщение
 * @access  Private (Автор сообщения)
 */
router.delete('/messages/:messageId', authMiddleware, ChatController.deleteMessage);

// ===================================
// ARCHITECTURE V3: VIDEO MESSAGE TRACKING
// ===================================

/**
 * @route   POST /api/v1/chat/messages/:messageId/track-view
 * @desc    Отследить просмотр видео в чате
 * @access  Private
 * Architecture v3: 2-view limit with auto-delete
 */
router.post('/messages/:messageId/track-view', authMiddleware, ChatController.trackVideoView);

/**
 * @route   GET /api/v1/chat/messages/:messageId/views
 * @desc    Получить количество оставшихся просмотров видео
 * @access  Private
 */
router.get('/messages/:messageId/views', authMiddleware, ChatController.getVideoViews);

export default router;
