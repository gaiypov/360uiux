/**
 * 360° РАБОТА - Video Upload Service
 * Upload videos to api.video
 * Security: API key fetched from backend, not hardcoded
 * P1 FIX: Added timeouts for all axios calls
 */

import axios from 'axios';
import { Platform } from 'react-native';

const API_BASE_URL = __DEV__
  ? 'http://localhost:5000/api/v1'
  : 'https://api.360rabota.ru/api/v1';

// API timeouts (P1 High fix)
const TIMEOUTS = {
  TOKEN_REQUEST: 10000,      // 10s for token requests
  VIDEO_METADATA: 15000,     // 15s for video metadata operations
  VIDEO_UPLOAD: 300000,      // 5 minutes for video uploads
};

interface VideoUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface VideoUploadResult {
  videoId: string;
  playerUrl: string;
  hlsUrl: string;
  thumbnailUrl: string;
  duration: number;
}

interface CreateVideoResponse {
  videoId: string;
  title: string;
  public: boolean;
  assets: {
    player: string;
    hls: string;
    thumbnail: string;
  };
}

interface UploadTokenResponse {
  token: string;
  expiresIn: number;
  message: string;
}

export class VideoUploadService {
  private static readonly API_VIDEO_BASE_URL = 'https://sandbox.api.video'; // Change to production URL
  private static uploadToken: string | null = null;
  private static tokenExpiresAt: number = 0;

  /**
   * Get upload token from backend
   * Security fix: Token is fetched from backend, not hardcoded in frontend
   */
  private static async getUploadToken(): Promise<string> {
    try {
      // Check if token is still valid (with 5 minute buffer)
      const now = Date.now();
      if (this.uploadToken && this.tokenExpiresAt > now + 5 * 60 * 1000) {
        return this.uploadToken;
      }

      // Fetch new token from backend
      console.log('🔑 Fetching upload token from backend...');
      const response = await axios.get<UploadTokenResponse>(`${API_BASE_URL}/video/upload-token`, {
        timeout: TIMEOUTS.TOKEN_REQUEST,
      });

      this.uploadToken = response.data.token;
      this.tokenExpiresAt = now + response.data.expiresIn * 1000;

      console.log('✅ Upload token received (expires in', response.data.expiresIn, 'seconds)');
      return this.uploadToken;
    } catch (error) {
      console.error('❌ Error fetching upload token:', error);
      throw new Error('Failed to get upload token. Please ensure you are logged in.');
    }
  }

  /**
   * Upload resume video to api.video
   * Architecture v3: Private videos with 2-view limit
   */
  static async uploadResumeVideo(
    videoPath: string,
    title: string,
    onProgress?: (progress: VideoUploadProgress) => void
  ): Promise<VideoUploadResult> {
    try {
      // Get upload token from backend (security fix)
      const token = await this.getUploadToken();

      // Step 1: Create video object in api.video
      const videoMetadata = await this.createVideo(title, {
        isPublic: false, // Private video (Architecture v3)
        description: 'Resume video for 360° РАБОТА',
        tags: ['resume', 'jobseeker'],
      }, token);

      console.log('Video created:', videoMetadata);

      // Step 2: Upload video file
      const uploadUrl = `${this.API_VIDEO_BASE_URL}/videos/${videoMetadata.videoId}/source`;
      const videoData = await this.prepareVideoFile(videoPath);

      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'ios' ? videoPath.replace('file://', '') : videoPath,
        type: 'video/mp4',
        name: 'resume-video.mp4',
      } as any);

      const response = await axios.post(uploadUrl, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: TIMEOUTS.VIDEO_UPLOAD,
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentage = (progressEvent.loaded / progressEvent.total) * 100;
            onProgress({
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage,
            });
          }
        },
      });

      console.log('Video uploaded:', response.data);

      // Step 3: Return result
      return {
        videoId: videoMetadata.videoId,
        playerUrl: videoMetadata.assets.player,
        hlsUrl: videoMetadata.assets.hls,
        thumbnailUrl: videoMetadata.assets.thumbnail,
        duration: response.data.duration || 0,
      };
    } catch (error) {
      console.error('Error uploading video:', error);
      throw new Error(
        `Failed to upload video: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Upload vacancy video to api.video
   * Public video for vacancy feed
   */
  static async uploadVacancyVideo(
    videoPath: string,
    title: string,
    description: string,
    onProgress?: (progress: VideoUploadProgress) => void
  ): Promise<VideoUploadResult> {
    try {
      // Get upload token from backend (security fix)
      const token = await this.getUploadToken();

      // Step 1: Create video object in api.video
      const videoMetadata = await this.createVideo(title, {
        isPublic: true, // Public video
        description,
        tags: ['vacancy', 'employer'],
      }, token);

      console.log('Vacancy video created:', videoMetadata);

      // Step 2: Upload video file
      const uploadUrl = `${this.API_VIDEO_BASE_URL}/videos/${videoMetadata.videoId}/source`;

      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'ios' ? videoPath.replace('file://', '') : videoPath,
        type: 'video/mp4',
        name: 'vacancy-video.mp4',
      } as any);

      const response = await axios.post(uploadUrl, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: TIMEOUTS.VIDEO_UPLOAD,
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentage = (progressEvent.loaded / progressEvent.total) * 100;
            onProgress({
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage,
            });
          }
        },
      });

      console.log('Vacancy video uploaded:', response.data);

      return {
        videoId: videoMetadata.videoId,
        playerUrl: videoMetadata.assets.player,
        hlsUrl: videoMetadata.assets.hls,
        thumbnailUrl: videoMetadata.assets.thumbnail,
        duration: response.data.duration || 0,
      };
    } catch (error) {
      console.error('Error uploading vacancy video:', error);
      throw new Error(
        `Failed to upload vacancy video: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Create video object in api.video
   */
  private static async createVideo(
    title: string,
    options: {
      isPublic: boolean;
      description?: string;
      tags?: string[];
    },
    token: string
  ): Promise<CreateVideoResponse> {
    try {
      const response = await axios.post(
        `${this.API_VIDEO_BASE_URL}/videos`,
        {
          title,
          public: options.isPublic,
          description: options.description,
          tags: options.tags,
          mp4Support: true, // Enable MP4 download
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: TIMEOUTS.VIDEO_METADATA,
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error creating video:', error);
      throw new Error(
        `Failed to create video: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Prepare video file for upload
   * Note: File existence is checked by FormData during upload
   */
  private static async prepareVideoFile(videoPath: string): Promise<any> {
    try {
      console.log('Preparing video file for upload:', videoPath);

      // Return basic file info
      // Actual file validation happens during upload
      return {
        path: videoPath,
      };
    } catch (error) {
      console.error('Error preparing video file:', error);
      throw error;
    }
  }

  /**
   * Delete video from api.video
   */
  static async deleteVideo(videoId: string): Promise<void> {
    try {
      // Get upload token from backend (security fix)
      const token = await this.getUploadToken();

      await axios.delete(`${this.API_VIDEO_BASE_URL}/videos/${videoId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: TIMEOUTS.VIDEO_METADATA,
      });

      console.log('Video deleted:', videoId);
    } catch (error) {
      console.error('Error deleting video:', error);
      throw new Error(
        `Failed to delete video: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get video details from api.video
   */
  static async getVideoDetails(videoId: string): Promise<any> {
    try {
      // Get upload token from backend (security fix)
      const token = await this.getUploadToken();

      const response = await axios.get(`${this.API_VIDEO_BASE_URL}/videos/${videoId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: TIMEOUTS.VIDEO_METADATA,
      });

      return response.data;
    } catch (error) {
      console.error('Error getting video details:', error);
      throw new Error(
        `Failed to get video details: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Update video metadata
   */
  static async updateVideoMetadata(
    videoId: string,
    updates: {
      title?: string;
      description?: string;
      tags?: string[];
    }
  ): Promise<void> {
    try {
      // Get upload token from backend (security fix)
      const token = await this.getUploadToken();

      await axios.patch(
        `${this.API_VIDEO_BASE_URL}/videos/${videoId}`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: TIMEOUTS.VIDEO_METADATA,
        }
      );

      console.log('Video metadata updated:', videoId);
    } catch (error) {
      console.error('Error updating video metadata:', error);
      throw new Error(
        `Failed to update video metadata: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Format bytes to human-readable size
   */
  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
