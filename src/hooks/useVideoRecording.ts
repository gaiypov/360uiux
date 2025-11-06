/**
 * 360° РАБОТА - useVideoRecording Hook
 * Record video using camera for video messages
 */

import { useState, useCallback } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';

interface UseVideoRecordingResult {
  isRecording: boolean;
  videoUri: string | null;
  videoDuration: number;
  videoSize: number;
  startRecording: () => Promise<void>;
  selectFromGallery: () => Promise<void>;
  clearVideo: () => void;
  uploadVideo: () => Promise<{ videoId: string; videoUrl: string }>;
}

export function useVideoRecording(): UseVideoRecordingResult {
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoSize, setVideoSize] = useState(0);

  // Request camera permission (Android)
  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        return (
          granted['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.error('Error requesting camera permission:', err);
        return false;
      }
    }
    return true; // iOS handles permissions automatically
  };

  // Start recording video
  const startRecording = useCallback(async () => {
    try {
      // Request permission
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert(
          'Нет доступа',
          'Для записи видео необходим доступ к камере и микрофону',
          [{ text: 'OK' }]
        );
        return;
      }

      setIsRecording(true);

      // Launch camera
      const result = await launchCamera({
        mediaType: 'video',
        videoQuality: 'medium',
        durationLimit: 60, // 1 minute max
        saveToPhotos: false,
      });

      setIsRecording(false);

      if (result.didCancel) {
        console.log('User cancelled video recording');
        return;
      }

      if (result.errorCode) {
        console.error('Video recording error:', result.errorMessage);
        Alert.alert('Ошибка', 'Не удалось записать видео');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const video = result.assets[0];

        setVideoUri(video.uri || null);
        setVideoDuration(video.duration || 0);
        setVideoSize(video.fileSize || 0);

        console.log('✅ Video recorded:', {
          uri: video.uri,
          duration: video.duration,
          size: video.fileSize,
        });
      }
    } catch (error) {
      console.error('Error starting video recording:', error);
      setIsRecording(false);
      Alert.alert('Ошибка', 'Не удалось запустить камеру');
    }
  }, []);

  // Select video from gallery
  const selectFromGallery = useCallback(async () => {
    try {
      // Launch gallery
      const result = await launchImageLibrary({
        mediaType: 'video',
        selectionLimit: 1,
      });

      if (result.didCancel) {
        console.log('User cancelled video selection');
        return;
      }

      if (result.errorCode) {
        console.error('Video selection error:', result.errorMessage);
        Alert.alert('Ошибка', 'Не удалось выбрать видео');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const video = result.assets[0];

        // Check file size (max 100MB)
        if (video.fileSize && video.fileSize > 100 * 1024 * 1024) {
          Alert.alert(
            'Файл слишком большой',
            'Максимальный размер видео - 100MB'
          );
          return;
        }

        setVideoUri(video.uri || null);
        setVideoDuration(video.duration || 0);
        setVideoSize(video.fileSize || 0);

        console.log('✅ Video selected:', {
          uri: video.uri,
          duration: video.duration,
          size: video.fileSize,
        });
      }
    } catch (error) {
      console.error('Error selecting video:', error);
      Alert.alert('Ошибка', 'Не удалось выбрать видео');
    }
  }, []);

  // Clear video
  const clearVideo = useCallback(() => {
    setVideoUri(null);
    setVideoDuration(0);
    setVideoSize(0);
  }, []);

  // Upload video to server
  const uploadVideo = useCallback(async (): Promise<{ videoId: string; videoUrl: string }> => {
    if (!videoUri) {
      throw new Error('No video to upload');
    }

    try {
      // Read file as base64 or FormData
      const formData = new FormData();

      // Get file name
      const fileName = videoUri.split('/').pop() || 'video.mp4';

      formData.append('video', {
        uri: videoUri,
        type: 'video/mp4',
        name: fileName,
      } as any);

      // TODO: Replace with your API endpoint
      const response = await fetch('YOUR_API_URL/api/v1/uploads/video', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      console.log('✅ Video uploaded:', data);

      return {
        videoId: data.file.id,
        videoUrl: data.file.url,
      };
    } catch (error) {
      console.error('Error uploading video:', error);
      throw error;
    }
  }, [videoUri]);

  return {
    isRecording,
    videoUri,
    videoDuration,
    videoSize,
    startRecording,
    selectFromGallery,
    clearVideo,
    uploadVideo,
  };
}
