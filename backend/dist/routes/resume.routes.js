"use strict";
/**
 * 360° РАБОТА - Resume Routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const ResumeController_1 = require("../controllers/ResumeController");
const router = (0, express_1.Router)();
/**
 * Получить все мои резюме
 * GET /api/v1/resumes/my
 */
router.get('/my', auth_1.authMiddleware, auth_1.requireJobSeeker, ResumeController_1.ResumeController.getMyResumes);
/**
 * Получить моё видео-резюме
 * GET /api/v1/resumes/video/my
 */
router.get('/video/my', auth_1.authMiddleware, auth_1.requireJobSeeker, ResumeController_1.ResumeController.getMyResumeVideo);
/**
 * Создать резюме
 * POST /api/v1/resumes
 */
router.post('/', auth_1.authMiddleware, auth_1.requireJobSeeker, ResumeController_1.ResumeController.createResume);
/**
 * Получить резюме по ID
 * GET /api/v1/resumes/:id
 */
router.get('/:id', auth_1.authMiddleware, auth_1.requireJobSeeker, ResumeController_1.ResumeController.getResume);
/**
 * Обновить резюме
 * PUT /api/v1/resumes/:id
 */
router.put('/:id', auth_1.authMiddleware, auth_1.requireJobSeeker, ResumeController_1.ResumeController.updateResume);
/**
 * Удалить резюме
 * DELETE /api/v1/resumes/:id
 */
router.delete('/:id', auth_1.authMiddleware, auth_1.requireJobSeeker, ResumeController_1.ResumeController.deleteResume);
exports.default = router;
//# sourceMappingURL=resume.routes.js.map