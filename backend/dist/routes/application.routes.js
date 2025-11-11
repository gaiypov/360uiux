"use strict";
/**
 * 360° РАБОТА - Application Routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const ApplicationController_1 = require("../controllers/ApplicationController");
const router = (0, express_1.Router)();
/**
 * Создать отклик
 * POST /api/v1/applications
 */
router.post('/', auth_1.authMiddleware, auth_1.requireJobSeeker, ApplicationController_1.ApplicationController.createApplication);
/**
 * Получить мои отклики
 * GET /api/v1/applications/my
 */
router.get('/my', auth_1.authMiddleware, ApplicationController_1.ApplicationController.getMyApplications);
/**
 * Получить отклики на вакансию (для работодателя)
 * GET /api/v1/applications/vacancy/:vacancyId
 */
router.get('/vacancy/:vacancyId', auth_1.authMiddleware, auth_1.requireEmployer, ApplicationController_1.ApplicationController.getVacancyApplications);
/**
 * Обновить статус отклика (для работодателя)
 * PUT /api/v1/applications/:id/status
 */
router.put('/:id/status', auth_1.authMiddleware, auth_1.requireEmployer, ApplicationController_1.ApplicationController.updateStatus);
/**
 * Получить отклик по ID
 * GET /api/v1/applications/:id
 */
router.get('/:id', auth_1.authMiddleware, ApplicationController_1.ApplicationController.getApplication);
/**
 * Получить защищенный URL для просмотра видео-резюме (для работодателя)
 * POST /api/v1/applications/:id/video-url
 */
router.post('/:id/video-url', auth_1.authMiddleware, auth_1.requireEmployer, ApplicationController_1.ApplicationController.getVideoUrl);
/**
 * Удалить отклик
 * DELETE /api/v1/applications/:id
 */
router.delete('/:id', auth_1.authMiddleware, auth_1.requireJobSeeker, ApplicationController_1.ApplicationController.deleteApplication);
exports.default = router;
//# sourceMappingURL=application.routes.js.map