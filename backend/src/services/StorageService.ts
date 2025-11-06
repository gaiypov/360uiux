/**
 * 360° РАБОТА - Storage Service
 * Загрузка файлов в Yandex Object Storage (voice, images)
 */

import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { videoConfig } from '../config/video.config';

export type FileType = 'voice' | 'image';

interface UploadParams {
  file: Buffer;
  fileName: string;
  fileType: FileType;
  userId: string;
  mimeType: string;
}

interface UploadResult {
  fileId: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
}

export class StorageService {
  private s3: AWS.S3;
  private bucket: string;

  constructor() {
    const { accessKeyId, secretAccessKey, bucket, region } = videoConfig.yandex;

    if (!accessKeyId || !secretAccessKey) {
      throw new Error('Yandex Cloud credentials are required');
    }

    this.bucket = bucket;

    // Инициализация S3 клиента для Yandex Object Storage
    this.s3 = new AWS.S3({
      endpoint: 'https://storage.yandexcloud.net',
      accessKeyId,
      secretAccessKey,
      region,
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
    });

    console.log('✅ Storage service initialized (Yandex Object Storage)');
  }

  /**
   * Загрузить голосовое сообщение
   */
  async uploadVoice(params: {
    file: Buffer;
    fileName: string;
    userId: string;
    mimeType: string;
  }): Promise<UploadResult> {
    try {
      const fileId = uuidv4();
      const ext = this.getExtension(params.fileName);
      const objectKey = `voice/${params.userId}/${fileId}${ext}`;

      console.log(`🎤 Uploading voice message: ${objectKey}`);

      const uploadResult = await this.s3
        .upload({
          Bucket: this.bucket,
          Key: objectKey,
          Body: params.file,
          ContentType: params.mimeType,
          ACL: 'public-read', // Публичный доступ для воспроизведения
          Metadata: {
            type: 'voice',
            userId: params.userId,
            uploadedAt: new Date().toISOString(),
          },
        })
        .promise();

      console.log(`✅ Voice uploaded: ${uploadResult.Location}`);

      return {
        fileId,
        url: uploadResult.Location,
        size: params.file.length,
      };
    } catch (error: any) {
      console.error('❌ Voice upload error:', error);
      throw new Error(`Failed to upload voice: ${error.message}`);
    }
  }

  /**
   * Загрузить изображение
   */
  async uploadImage(params: {
    file: Buffer;
    fileName: string;
    userId: string;
    mimeType: string;
  }): Promise<UploadResult> {
    try {
      const fileId = uuidv4();
      const ext = this.getExtension(params.fileName);
      const objectKey = `images/${params.userId}/${fileId}${ext}`;

      console.log(`📷 Uploading image: ${objectKey}`);

      const uploadResult = await this.s3
        .upload({
          Bucket: this.bucket,
          Key: objectKey,
          Body: params.file,
          ContentType: params.mimeType,
          ACL: 'public-read', // Публичный доступ
          Metadata: {
            type: 'image',
            userId: params.userId,
            uploadedAt: new Date().toISOString(),
          },
        })
        .promise();

      console.log(`✅ Image uploaded: ${uploadResult.Location}`);

      // TODO: Создать thumbnail для больших изображений
      // const thumbnailUrl = await this.createThumbnail(uploadResult.Location);

      return {
        fileId,
        url: uploadResult.Location,
        size: params.file.length,
      };
    } catch (error: any) {
      console.error('❌ Image upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  /**
   * Удалить файл из хранилища
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Извлечь ключ из URL
      const key = this.extractKeyFromUrl(fileUrl);

      if (!key) {
        throw new Error('Invalid file URL');
      }

      console.log(`🗑️ Deleting file: ${key}`);

      await this.s3
        .deleteObject({
          Bucket: this.bucket,
          Key: key,
        })
        .promise();

      console.log(`✅ File deleted: ${key}`);
    } catch (error: any) {
      console.error('❌ File delete error:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Получить расширение файла
   */
  private getExtension(fileName: string): string {
    const match = fileName.match(/\.[^.]+$/);
    return match ? match[0] : '';
  }

  /**
   * Извлечь ключ из URL
   */
  private extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      // Формат: https://storage.yandexcloud.net/bucket/key
      const pathParts = urlObj.pathname.split('/');
      // Пропустить пустой первый элемент и bucket
      return pathParts.slice(2).join('/');
    } catch (error) {
      return null;
    }
  }

  /**
   * Создать thumbnail для изображения (TODO)
   */
  private async createThumbnail(imageUrl: string): Promise<string> {
    // TODO: Implement image resizing with sharp
    // 1. Download image
    // 2. Resize to thumbnail (e.g., 300x300)
    // 3. Upload thumbnail
    // 4. Return thumbnail URL
    return imageUrl; // Placeholder
  }
}

// Singleton export
export const storageService = new StorageService();
