/**
 * 360° РАБОТА - Video Provider Configuration
 * Переключаемые провайдеры: api.video ⟷ Yandex Cloud Video
 */

export const videoConfig = {
  // Выбрать провайдера: 'api.video' | 'yandex'
  provider: (process.env.VIDEO_PROVIDER || 'api.video') as 'api.video' | 'yandex',

  // api.video
  apiVideo: {
    apiKey: process.env.API_VIDEO_KEY || '',
    environment: 'production' as const,
  },

  // Yandex Cloud Video
  yandex: {
    accessKeyId: process.env.YANDEX_ACCESS_KEY || '',
    secretAccessKey: process.env.YANDEX_SECRET_KEY || '',
    bucket: process.env.YANDEX_VIDEO_BUCKET || 'vacancy-videos',
    region: 'ru-central1',
    iamToken: process.env.YANDEX_IAM_TOKEN || '',
    baseUrl: process.env.YANDEX_VIDEO_BASE_URL || `https://${process.env.YANDEX_VIDEO_BUCKET || 'vacancy-videos'}.storage.yandexcloud.net`,
    callbackUrl: process.env.YANDEX_CALLBACK_URL || `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/v1/video/yandex-callback`,
  },
};

// Валидация конфигурации
export function validateVideoConfig(): void {
  const { provider, apiVideo, yandex } = videoConfig;

  if (provider === 'api.video') {
    if (!apiVideo.apiKey) {
      throw new Error('API_VIDEO_KEY is required when VIDEO_PROVIDER=api.video');
    }
  } else if (provider === 'yandex') {
    if (!yandex.accessKeyId || !yandex.secretAccessKey || !yandex.iamToken) {
      throw new Error('Yandex Cloud credentials are required when VIDEO_PROVIDER=yandex');
    }
  } else {
    throw new Error(`Unknown video provider: ${provider}. Must be 'api.video' or 'yandex'`);
  }

  console.log(`📹 Video provider configured: ${provider}`);
}
