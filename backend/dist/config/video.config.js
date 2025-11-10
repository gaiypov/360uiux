"use strict";
/**
 * 360° РАБОТА - Video Provider Configuration
 * Переключаемые провайдеры: api.video ⟷ Yandex Cloud Video
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.videoConfig = void 0;
exports.validateVideoConfig = validateVideoConfig;
exports.videoConfig = {
    // Выбрать провайдера: 'api.video' | 'yandex'
    provider: (process.env.VIDEO_PROVIDER || 'api.video'),
    // api.video
    apiVideo: {
        apiKey: process.env.API_VIDEO_KEY || '',
        environment: 'production',
    },
    // Yandex Cloud Video
    yandex: {
        accessKeyId: process.env.YANDEX_ACCESS_KEY || '',
        secretAccessKey: process.env.YANDEX_SECRET_KEY || '',
        bucket: process.env.YANDEX_VIDEO_BUCKET || 'vacancy-videos',
        region: 'ru-central1',
        iamToken: process.env.YANDEX_IAM_TOKEN || '',
    },
};
// Валидация конфигурации
function validateVideoConfig() {
    const { provider, apiVideo, yandex } = exports.videoConfig;
    if (provider === 'api.video') {
        if (!apiVideo.apiKey) {
            throw new Error('API_VIDEO_KEY is required when VIDEO_PROVIDER=api.video');
        }
    }
    else if (provider === 'yandex') {
        if (!yandex.accessKeyId || !yandex.secretAccessKey || !yandex.iamToken) {
            throw new Error('Yandex Cloud credentials are required when VIDEO_PROVIDER=yandex');
        }
    }
    else {
        throw new Error(`Unknown video provider: ${provider}. Must be 'api.video' or 'yandex'`);
    }
    console.log(`📹 Video provider configured: ${provider}`);
}
//# sourceMappingURL=video.config.js.map