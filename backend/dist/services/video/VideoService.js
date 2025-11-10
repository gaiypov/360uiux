"use strict";
/**
 * 360° РАБОТА - Video Service Abstraction
 * Единый интерфейс для всех видео-провайдеров
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.videoService = exports.VideoService = void 0;
const video_config_1 = require("../../config/video.config");
const ApiVideoProvider_1 = require("./ApiVideoProvider");
const YandexVideoProvider_1 = require("./YandexVideoProvider");
/**
 * Фабрика видео-провайдеров
 * Выбирает провайдера из конфигурации и предоставляет единый интерфейс
 */
class VideoService {
    constructor() {
        // Валидировать конфигурацию
        (0, video_config_1.validateVideoConfig)();
        // Выбрать провайдера
        const providerType = video_config_1.videoConfig.provider;
        switch (providerType) {
            case 'api.video':
                this.provider = new ApiVideoProvider_1.ApiVideoProvider();
                break;
            case 'yandex':
                this.provider = new YandexVideoProvider_1.YandexVideoProvider();
                break;
            default:
                throw new Error(`Unknown video provider: ${providerType}`);
        }
        console.log(`✅ Video service initialized with provider: ${providerType}`);
    }
    /**
     * Singleton pattern - один экземпляр на всё приложение
     */
    static getInstance() {
        if (!VideoService.instance) {
            VideoService.instance = new VideoService();
        }
        return VideoService.instance;
    }
    /**
     * Загрузить видео (прокси к провайдеру)
     */
    async uploadVideo(params) {
        console.log(`📹 Uploading video: ${params.fileName} (${params.metadata.type})`);
        const result = await this.provider.uploadVideo(params);
        console.log(`✅ Video uploaded: ${result.videoId}`);
        return result;
    }
    /**
     * Удалить видео (прокси к провайдеру)
     */
    async deleteVideo(videoId) {
        console.log(`🗑️  Deleting video: ${videoId}`);
        await this.provider.deleteVideo(videoId);
        console.log(`✅ Video deleted: ${videoId}`);
    }
    /**
     * Получить статистику (прокси к провайдеру)
     */
    async getVideoStats(videoId) {
        if (this.provider.getVideoStats) {
            return await this.provider.getVideoStats(videoId);
        }
        // Дефолтные значения если провайдер не поддерживает статистику
        return { views: 0, duration: 0, completion: 0 };
    }
    /**
     * Получить информацию о видео (прокси к провайдеру)
     */
    async getVideoInfo(videoId) {
        if (this.provider.getVideoInfo) {
            return await this.provider.getVideoInfo(videoId);
        }
        throw new Error('getVideoInfo is not supported by current provider');
    }
    /**
     * Получить текущего провайдера (для отладки)
     */
    getProviderType() {
        return video_config_1.videoConfig.provider;
    }
}
exports.VideoService = VideoService;
// Экспорт singleton instance
exports.videoService = VideoService.getInstance();
//# sourceMappingURL=VideoService.js.map