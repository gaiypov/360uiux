/**
 * 360° РАБОТА - Video Upload Service
 * Upload videos to api.video
 */

import axios from 'axios';
import { Platform } from 'react-native';

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

export class VideoUploadService {
  private static readonly API_BASE_URL = 'https://sandbox.api.video'; // Change to production URL
  private static readonly API_KEY = process.env.API_VIDEO_KEY || 'YOUR_API_VIDEO_KEY';

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
      // Step 1: Create video object in api.video
      const videoMetadata = await this.createVideo(title, {
        isPublic: false, // Private video (Architecture v3)
        description: 'Resume video for 360° РАБОТА',
        tags: ['resume', 'jobseeker'],
      });

      console.log('Video created:', videoMetadata);

      // Step 2: Upload video file
      const uploadUrl = `${this.API_BASE_URL}/videos/${videoMetadata.videoId}/source`;
      const videoData = await this.prepareVideoFile(videoPath);

      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'ios' ? videoPath.replace('file://', '') : videoPath,
        type: 'video/mp4',
        name: 'resume-video.mp4',
      } as any);

      const response = await axios.post(uploadUrl, formData, {
        headers: {
          Authorization: `Bearer ${this.API_KEY}`,
          'Content-Type': 'multipart/form-data',
        },
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
      // Step 1: Create video object in api.video
      const videoMetadata = await this.createVideo(title, {
        isPublic: true, // Public video
        description,
        tags: ['vacancy', 'employer'],
      });

      console.log('Vacancy video created:', videoMetadata);

      // Step 2: Upload video file
      const uploadUrl = `${this.API_BASE_URL}/videos/${videoMetadata.videoId}/source`;

      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'ios' ? videoPath.replace('file://', '') : videoPath,
        type: 'video/mp4',
        name: 'vacancy-video.mp4',
      } as any);

      const response = await axios.post(uploadUrl, formData, {
        headers: {
          Authorization: `Bearer ${this.API_KEY}`,
          'Content-Type': 'multipart/form-data',
        },
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
    }
  ): Promise<CreateVideoResponse> {
    try {
      const response = await axios.post(
        `${this.API_BASE_URL}/videos`,
        {
          title,
          public: options.isPublic,
          description: options.description,
          tags: options.tags,
          mp4Support: true, // Enable MP4 download
        },
        {
          headers: {
            Authorization: `Bearer ${this.API_KEY}`,
            'Content-Type': 'application/json',
          },
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
      await axios.delete(`${this.API_BASE_URL}/videos/${videoId}`, {
        headers: {
          Authorization: `Bearer ${this.API_KEY}`,
        },
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
      const response = await axios.get(`${this.API_BASE_URL}/videos/${videoId}`, {
        headers: {
          Authorization: `Bearer ${this.API_KEY}`,
        },
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
      await axios.patch(
        `${this.API_BASE_URL}/videos/${videoId}`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${this.API_KEY}`,
            'Content-Type': 'application/json',
          },
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
