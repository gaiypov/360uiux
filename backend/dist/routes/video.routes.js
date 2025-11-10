"use strict";
/**
 * 360° РАБОТА - Video Routes
 * Роуты для работы с видео (вакансии и резюме)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_1 = require("../middleware/auth");
const VacancyVideoController_1 = require("../controllers/VacancyVideoController");
const ResumeVideoController_1 = require("../controllers/ResumeVideoController");
const router = (0, express_1.Router)();
// Настройка multer для загрузки видео в память
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 500 * 1024 * 1024, // 500MB max file size
    },
    fileFilter: (_req, file, cb) => {
        // Проверка типа файла
        const allowedMimeTypes = [
            'video/mp4',
            'video/quicktime', // MOV
            'video/x-msvideo', // AVI
            'video/webm',
            'video/x-matroska', // MKV
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only video files are allowed.'));
        }
    },
});
// ===================================
// VACANCY VIDEO ROUTES (Работодатели)
// ===================================
/**
 * @route   POST /api/v1/vacancies/:vacancyId/video
 * @desc    Загрузить видео для вакансии
 * @access  Private (Employer only)
 */
router.post('/vacancies/:vacancyId/video', auth_1.authMiddleware, auth_1.requireEmployer, upload.single('video'), VacancyVideoController_1.VacancyVideoController.uploadVideo);
/**
 * @route   GET /api/v1/vacancies/:vacancyId/video
 * @desc    Получить видео вакансии
 * @access  Public
 */
router.get('/vacancies/:vacancyId/video', VacancyVideoController_1.VacancyVideoController.getVideo);
/**
 * @route   DELETE /api/v1/vacancies/:vacancyId/video
 * @desc    Удалить видео вакансии
 * @access  Private (Employer only, owner)
 */
router.delete('/vacancies/:vacancyId/video', auth_1.authMiddleware, auth_1.requireEmployer, VacancyVideoController_1.VacancyVideoController.deleteVideo);
/**
 * @route   PUT /api/v1/vacancies/:vacancyId/video
 * @desc    Заменить видео вакансии
 * @access  Private (Employer only, owner)
 */
router.put('/vacancies/:vacancyId/video', auth_1.authMiddleware, auth_1.requireEmployer, upload.single('video'), VacancyVideoController_1.VacancyVideoController.replaceVideo);
/**
 * @route   GET /api/v1/vacancies/:vacancyId/video/stats
 * @desc    Получить статистику видео вакансии
 * @access  Private (Employer only, owner)
 */
router.get('/vacancies/:vacancyId/video/stats', auth_1.authMiddleware, auth_1.requireEmployer, VacancyVideoController_1.VacancyVideoController.getVideoStats);
// ===================================
// RESUME VIDEO ROUTES (Соискатели)
// ===================================
/**
 * @route   POST /api/v1/resumes/video
 * @desc    Загрузить видеорезюме
 * @access  Private (Job Seeker only)
 */
router.post('/resumes/video', auth_1.authMiddleware, upload.single('video'), ResumeVideoController_1.ResumeVideoController.uploadVideo);
/**
 * @route   GET /api/v1/resumes/video/me
 * @desc    Получить своё видеорезюме
 * @access  Private (Job Seeker only)
 */
router.get('/resumes/video/me', auth_1.authMiddleware, ResumeVideoController_1.ResumeVideoController.getMyVideo);
/**
 * @route   GET /api/v1/resumes/video/stats
 * @desc    Получить статистику своего видеорезюме
 * @access  Private (Job Seeker only)
 */
router.get('/resumes/video/stats', auth_1.authMiddleware, ResumeVideoController_1.ResumeVideoController.getVideoStats);
/**
 * @route   GET /api/v1/resumes/video/:userId
 * @desc    Получить видеорезюме соискателя
 * @access  Private (Employer only or owner)
 */
router.get('/resumes/video/:userId', auth_1.authMiddleware, ResumeVideoController_1.ResumeVideoController.getUserVideo);
/**
 * @route   DELETE /api/v1/resumes/video
 * @desc    Удалить своё видеорезюме
 * @access  Private (Job Seeker only)
 */
router.delete('/resumes/video', auth_1.authMiddleware, ResumeVideoController_1.ResumeVideoController.deleteVideo);
/**
 * @route   PATCH /api/v1/resumes/video
 * @desc    Обновить метаданные видеорезюме
 * @access  Private (Job Seeker only)
 */
router.patch('/resumes/video', auth_1.authMiddleware, ResumeVideoController_1.ResumeVideoController.updateVideoMetadata);
// Обработка ошибок multer
router.use((error, _req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File too large',
                message: 'Video file size must not exceed 500MB',
            });
        }
        return res.status(400).json({
            error: 'File upload error',
            message: error.message,
        });
    }
    if (error) {
        return res.status(400).json({
            error: 'Bad request',
            message: error.message,
        });
    }
    next();
});
exports.default = router;
//# sourceMappingURL=video.routes.js.map