/**
 * 360° РАБОТА - Video Provider Configuration
 * Переключаемые провайдеры: api.video ⟷ Yandex Cloud Video
 */
export declare const videoConfig: {
    provider: "api.video" | "yandex";
    apiVideo: {
        apiKey: string;
        environment: "production";
    };
    yandex: {
        accessKeyId: string;
        secretAccessKey: string;
        bucket: string;
        region: string;
        iamToken: string;
    };
};
export declare function validateVideoConfig(): void;
//# sourceMappingURL=video.config.d.ts.map