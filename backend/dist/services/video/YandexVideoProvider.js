"use strict";
/**
 * 360° РАБОТА - Yandex Cloud Video Provider
 * https://cloud.yandex.ru/services/cloud-video
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.YandexVideoProvider = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const axios_1 = __importDefault(require("axios"));
const video_config_1 = require("../../config/video.config");
class YandexVideoProvider {
    constructor() {
        this.yandexApiUrl = 'https://video.api.cloud.yandex.net/video/v1';
        const { accessKeyId, secretAccessKey, bucket, region } = video_config_1.videoConfig.yandex;
        if (!accessKeyId || !secretAccessKey) {
            throw new Error('Yandex Cloud credentials are required');
        }
        this.bucket = bucket;
        // Инициализация S3 клиента для Yandex Object Storage
        this.s3 = new aws_sdk_1.default.S3({
            endpoint: 'https://storage.yandexcloud.net',
            accessKeyId,
            secretAccessKey,
            region,
            s3ForcePathStyle: true,
            signatureVersion: 'v4',
        });
        console.log('✅ Yandex Cloud Video provider initialized');
    }
    /**
     * Загрузить видео в Yandex Cloud
     */
    async uploadVideo(params) {
        try {
            // 1. Загрузить оригинальное видео в Object Storage
            const objectKey = `originals/${params.metadata.type}/${params.metadata.userId}/${Date.now()}-${params.fileName}`;
            console.log(`📹 Yandex: Uploading to Object Storage: ${objectKey}`);
            const uploadResult = await this.s3
                .upload({
                Bucket: this.bucket,
                Key: objectKey,
                Body: params.file,
                ContentType: 'video/mp4',
                Metadata: {
                    type: params.metadata.type,
                    userId: params.metadata.userId,
                    title: params.metadata.title,
                    uploadedAt: new Date().toISOString(),
                },
            })
                .promise();
            console.log(`✅ Yandex: Uploaded to ${uploadResult.Location}`);
            // 2. Запустить транскодинг
            const outputPrefix = `transcoded/${params.metadata.type}/${params.metadata.userId}/${Date.now()}`;
            const transcodingJob = await this.startTranscoding({
                inputUrl: uploadResult.Location,
                outputPrefix,
            });
            console.log(`🎬 Yandex: Transcoding started, job ID: ${transcodingJob.id}`);
            // 3. Дождаться завершения транскодинга
            const result = await this.waitForTranscoding(transcodingJob.id);
            return {
                videoId: transcodingJob.id,
                playerUrl: result.hlsUrl, // Можно обернуть в custom player
                hlsUrl: result.hlsUrl,
                thumbnailUrl: result.thumbnailUrl,
                duration: result.duration,
            };
        }
        catch (error) {
            console.error('❌ Yandex upload error:', error);
            throw new Error(`Yandex Cloud upload failed: ${error.message}`);
        }
    }
    /**
     * Запустить транскодинг через Yandex Video API
     */
    async startTranscoding(params) {
        try {
            const response = await axios_1.default.post(`${this.yandexApiUrl}/jobs`, {
                input: {
                    url: params.inputUrl,
                },
                output: {
                    bucket: this.bucket,
                    keyPrefix: params.outputPrefix,
                },
                settings: {
                    // HLS профили для adaptive streaming
                    profiles: [
                        {
                            name: 'fullhd',
                            resolution: '1920x1080',
                            bitrate: 5000,
                            codec: 'h264',
                        },
                        {
                            name: 'hd',
                            resolution: '1280x720',
                            bitrate: 2500,
                            codec: 'h264',
                        },
                        {
                            name: 'sd',
                            resolution: '854x480',
                            bitrate: 1000,
                            codec: 'h264',
                        },
                    ],
                    generateThumbnail: true,
                    thumbnailTime: 1, // Секунда для превью
                },
            }, {
                headers: {
                    Authorization: `Bearer ${video_config_1.videoConfig.yandex.iamToken}`,
                    'Content-Type': 'application/json',
                },
            });
            return {
                id: response.data.id,
                status: response.data.status,
            };
        }
        catch (error) {
            console.error('❌ Yandex transcoding start error:', error);
            throw new Error(`Failed to start transcoding: ${error.message}`);
        }
    }
    /**
     * Дождаться завершения транскодинга
     */
    async waitForTranscoding(jobId, maxRetries = 60) {
        for (let i = 0; i < maxRetries; i++) {
            const status = await this.getJobStatus(jobId);
            if (status.status === 'COMPLETED') {
                // Получить ссылки на результаты
                const hlsUrl = `https://storage.yandexcloud.net/${this.bucket}/${status.output?.keyPrefix}/master.m3u8`;
                const thumbnailUrl = `https://storage.yandexcloud.net/${this.bucket}/${status.output?.keyPrefix}/thumbnail.jpg`;
                return {
                    hlsUrl,
                    thumbnailUrl,
                    duration: status.metadata?.duration,
                };
            }
            if (status.status === 'FAILED') {
                throw new Error(`Transcoding failed: ${status.error}`);
            }
            console.log(`⏳ Yandex: Transcoding in progress (${i + 1}/${maxRetries})...`);
            // Подождать 10 секунд перед следующей проверкой
            await new Promise((resolve) => setTimeout(resolve, 10000));
        }
        throw new Error('Transcoding timeout (10 minutes)');
    }
    /**
     * Получить статус транскодинга
     */
    async getJobStatus(jobId) {
        try {
            const response = await axios_1.default.get(`${this.yandexApiUrl}/jobs/${jobId}`, {
                headers: {
                    Authorization: `Bearer ${video_config_1.videoConfig.yandex.iamToken}`,
                },
            });
            return response.data;
        }
        catch (error) {
            console.error('❌ Yandex job status error:', error);
            throw new Error(`Failed to get job status: ${error.message}`);
        }
    }
    /**
     * Удалить видео из Yandex Cloud
     */
    async deleteVideo(videoId) {
        try {
            // Удалить job
            await axios_1.default.delete(`${this.yandexApiUrl}/jobs/${videoId}`, {
                headers: {
                    Authorization: `Bearer ${video_config_1.videoConfig.yandex.iamToken}`,
                },
            });
            console.log(`✅ Yandex: Video ${videoId} deleted`);
        }
        catch (error) {
            console.error('❌ Yandex delete error:', error);
            throw new Error(`Yandex Cloud delete failed: ${error.message}`);
        }
    }
    /**
     * Получить статистику (Yandex Cloud Video не предоставляет встроенную аналитику)
     */
    async getVideoStats(_videoId) {
        // Yandex Cloud Video не предоставляет аналитику просмотров
        // Можно интегрировать с Yandex Metrica
        return {
            views: 0,
            duration: 0,
            completion: 0,
        };
    }
    /**
     * Получить информацию о видео
     */
    async getVideoInfo(videoId) {
        try {
            const job = await this.getJobStatus(videoId);
            return {
                videoId: job.id,
                title: 'Yandex Cloud Video',
                status: job.status === 'COMPLETED' ? 'ready' : 'processing',
                playerUrl: `https://storage.yandexcloud.net/${this.bucket}/${job.output?.keyPrefix}/master.m3u8`,
                thumbnailUrl: `https://storage.yandexcloud.net/${this.bucket}/${job.output?.keyPrefix}/thumbnail.jpg`,
            };
        }
        catch (error) {
            console.error('❌ Yandex getInfo error:', error);
            throw new Error(`Yandex Cloud getInfo failed: ${error.message}`);
        }
    }
}
exports.YandexVideoProvider = YandexVideoProvider;
//# sourceMappingURL=YandexVideoProvider.js.map