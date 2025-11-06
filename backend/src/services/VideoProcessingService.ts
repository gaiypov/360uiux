/**
 * 360° РАБОТА - Video Processing Service
 *
 * Сервис для обработки и валидации видео перед загрузкой
 * Architecture v3: Validation, compression, metadata extraction
 */

import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  fps: number;
  codec: string;
  bitrate: number;
  size: number;
  format: string;
}

interface ProcessingOptions {
  maxSize?: number; // MB
  maxDuration?: number; // seconds
  requiresCompression?: boolean;
  extractThumbnail?: boolean;
}

interface ProcessingResult {
  success: boolean;
  processedFile?: Buffer;
  thumbnail?: Buffer;
  metadata: VideoMetadata;
  compressed: boolean;
  originalSize: number;
  processedSize: number;
  error?: string;
}

class VideoProcessingService {
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(os.tmpdir(), '360rabota-video-processing');
    this.initTempDir();
  }

  /**
   * Создать временную директорию
   */
  private async initTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
      console.log('✅ Video processing temp directory initialized');
    } catch (error) {
      console.error('Failed to create temp directory:', error);
    }
  }

  /**
   * Обработать видео
   */
  async processVideo(
    videoBuffer: Buffer,
    fileName: string,
    options: ProcessingOptions = {}
  ): Promise<ProcessingResult> {
    const {
      maxSize = 100, // 100MB по умолчанию
      maxDuration = 60, // 1 минута по умолчанию
      requiresCompression = false,
      extractThumbnail = true,
    } = options;

    const tempInputPath = path.join(
      this.tempDir,
      `input-${crypto.randomBytes(8).toString('hex')}-${fileName}`
    );
    const tempOutputPath = path.join(
      this.tempDir,
      `output-${crypto.randomBytes(8).toString('hex')}.mp4`
    );
    const tempThumbnailPath = path.join(
      this.tempDir,
      `thumb-${crypto.randomBytes(8).toString('hex')}.jpg`
    );

    try {
      // 1. Сохранить входной файл
      await fs.writeFile(tempInputPath, videoBuffer);
      const originalSize = videoBuffer.length;
      console.log(`📹 Processing video: ${fileName} (${this.formatBytes(originalSize)})`);

      // 2. Извлечь метаданные
      const metadata = await this.extractMetadata(tempInputPath);
      console.log(`📊 Video metadata:`, metadata);

      // 3. Валидация
      const validation = this.validateVideo(metadata, { maxSize, maxDuration });
      if (!validation.valid) {
        return {
          success: false,
          metadata,
          compressed: false,
          originalSize,
          processedSize: originalSize,
          error: validation.error,
        };
      }

      // 4. Определить нужна ли компрессия
      const needsCompression =
        requiresCompression || originalSize > maxSize * 1024 * 1024;

      let processedBuffer: Buffer;
      let compressed = false;

      if (needsCompression) {
        console.log('🗜️  Video requires compression');
        processedBuffer = await this.compressVideo(
          tempInputPath,
          tempOutputPath,
          metadata
        );
        compressed = true;
      } else {
        console.log('✅ Video does not require compression');
        processedBuffer = videoBuffer;
      }

      // 5. Извлечь thumbnail
      let thumbnailBuffer: Buffer | undefined;
      if (extractThumbnail) {
        console.log('🖼️  Extracting thumbnail...');
        thumbnailBuffer = await this.extractThumbnail(
          compressed ? tempOutputPath : tempInputPath,
          tempThumbnailPath
        );
        console.log(`✅ Thumbnail extracted (${this.formatBytes(thumbnailBuffer.length)})`);
      }

      // Очистка
      await this.cleanup([
        tempInputPath,
        compressed ? tempOutputPath : null,
        extractThumbnail ? tempThumbnailPath : null,
      ]);

      return {
        success: true,
        processedFile: processedBuffer,
        thumbnail: thumbnailBuffer,
        metadata,
        compressed,
        originalSize,
        processedSize: processedBuffer.length,
      };
    } catch (error: any) {
      console.error('❌ Video processing error:', error);

      // Очистка при ошибке
      await this.cleanup([tempInputPath, tempOutputPath, tempThumbnailPath]);

      throw new Error(`Video processing failed: ${error.message}`);
    }
  }

  /**
   * Извлечь метаданные видео
   */
  private async extractMetadata(filePath: string): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(new Error(`Failed to extract metadata: ${err.message}`));
          return;
        }

        const videoStream = metadata.streams.find((s) => s.codec_type === 'video');
        if (!videoStream) {
          reject(new Error('No video stream found'));
          return;
        }

        const fileSize = metadata.format.size || 0;

        resolve({
          duration: metadata.format.duration || 0,
          width: videoStream.width || 0,
          height: videoStream.height || 0,
          fps: this.parseFps(videoStream.r_frame_rate),
          codec: videoStream.codec_name || 'unknown',
          bitrate: metadata.format.bit_rate || 0,
          size: fileSize,
          format: metadata.format.format_name || 'unknown',
        });
      });
    });
  }

  /**
   * Валидировать видео
   */
  private validateVideo(
    metadata: VideoMetadata,
    options: { maxSize: number; maxDuration: number }
  ): { valid: boolean; error?: string } {
    // Проверка размера
    const sizeMB = metadata.size / (1024 * 1024);
    if (sizeMB > options.maxSize * 2) {
      // Позволяем 2x maxSize для compression
      return {
        valid: false,
        error: `Video size ${sizeMB.toFixed(2)}MB exceeds maximum ${options.maxSize * 2}MB`,
      };
    }

    // Проверка длительности
    if (metadata.duration > options.maxDuration) {
      return {
        valid: false,
        error: `Video duration ${metadata.duration.toFixed(2)}s exceeds maximum ${options.maxDuration}s`,
      };
    }

    // Проверка разрешения (максимум Full HD)
    if (metadata.width > 1920 || metadata.height > 1080) {
      return {
        valid: false,
        error: `Video resolution ${metadata.width}x${metadata.height} exceeds maximum 1920x1080`,
      };
    }

    return { valid: true };
  }

  /**
   * Сжать видео
   */
  private async compressVideo(
    inputPath: string,
    outputPath: string,
    metadata: VideoMetadata
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      // Определить целевой bitrate (меньше оригинала на 40%)
      const targetBitrate = Math.floor((metadata.bitrate * 0.6) / 1000);

      console.log(`🗜️  Compressing video: ${metadata.bitrate / 1000}kbps -> ${targetBitrate}kbps`);

      ffmpeg(inputPath)
        .videoCodec('libx264') // H.264 codec
        .videoBitrate(targetBitrate) // Target bitrate
        .audioCodec('aac') // AAC audio
        .audioBitrate('128k') // 128kbps audio
        .outputOptions([
          '-preset fast', // Быстрая кодировка
          '-movflags +faststart', // Web-optimized
          '-crf 23', // Quality (18-28, lower = better)
        ])
        .output(outputPath)
        .on('start', (cmd) => {
          console.log('🎬 FFmpeg command:', cmd);
        })
        .on('progress', (progress) => {
          console.log(`⏳ Processing: ${progress.percent?.toFixed(1)}%`);
        })
        .on('end', async () => {
          try {
            const compressedBuffer = await fs.readFile(outputPath);
            console.log(`✅ Compressed: ${this.formatBytes(compressedBuffer.length)}`);
            resolve(compressedBuffer);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (err) => {
          reject(new Error(`FFmpeg compression failed: ${err.message}`));
        })
        .run();
    });
  }

  /**
   * Извлечь thumbnail из видео
   */
  private async extractThumbnail(
    videoPath: string,
    outputPath: string
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: ['1'], // 1 секунда
          filename: path.basename(outputPath),
          folder: path.dirname(outputPath),
          size: '640x360', // Размер thumbnail
        })
        .on('end', async () => {
          try {
            const thumbnailBuffer = await fs.readFile(outputPath);
            resolve(thumbnailBuffer);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (err) => {
          reject(new Error(`Thumbnail extraction failed: ${err.message}`));
        });
    });
  }

  /**
   * Парсинг FPS из строки (например "30/1")
   */
  private parseFps(fpsString: string | undefined): number {
    if (!fpsString) return 0;

    const parts = fpsString.split('/');
    if (parts.length === 2) {
      const numerator = parseInt(parts[0]);
      const denominator = parseInt(parts[1]);
      return numerator / denominator;
    }

    return parseInt(fpsString);
  }

  /**
   * Форматировать размер в читаемый вид
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * Очистить временные файлы
   */
  private async cleanup(filePaths: (string | null)[]) {
    for (const filePath of filePaths) {
      if (!filePath) continue;

      try {
        await fs.unlink(filePath);
      } catch (error) {
        // Игнорировать ошибки удаления
      }
    }
  }
}

export const videoProcessingService = new VideoProcessingService();
