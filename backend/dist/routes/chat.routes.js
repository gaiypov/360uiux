"use strict";
/**
 * 360° РАБОТА - Chat Routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * Получить список чатов
 * GET /api/v1/chats
 */
router.get('/', auth_1.authMiddleware, async (_req, res) => {
    res.json({ message: 'List chats endpoint - Coming soon' });
});
/**
 * Получить чат по ID
 * GET /api/v1/chats/:id
 */
router.get('/:id', auth_1.authMiddleware, async (_req, res) => {
    res.json({ message: 'Get chat endpoint - Coming soon' });
});
/**
 * Отправить сообщение
 * POST /api/v1/chats/:id/messages
 */
router.post('/:id/messages', auth_1.authMiddleware, async (_req, res) => {
    res.json({ message: 'Send message endpoint - Coming soon' });
});
exports.default = router;
//# sourceMappingURL=chat.routes.js.map