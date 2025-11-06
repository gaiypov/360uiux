/**
 * 360° РАБОТА - useVoiceRecording Hook
 * Record voice messages with waveform visualization
 */

import { useState, useCallback, useRef } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';

const audioRecorderPlayer = new AudioRecorderPlayer();

interface UseVoiceRecordingResult {
  isRecording: boolean;
  isPaused: boolean;
  recordingDuration: number;
  audioUri: string | null;
  waveform: number[];
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  pauseRecording: () => Promise<void>;
  resumeRecording: () => Promise<void>;
  clearRecording: () => void;
  uploadAudio: () => Promise<{ audioId: string; audioUrl: string }>;
}

export function useVoiceRecording(): UseVoiceRecordingResult {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [waveform, setWaveform] = useState<number[]>([]);

  const waveformInterval = useRef<NodeJS.Timeout | null>(null);

  // Request microphone permission (Android)
  const requestMicrophonePermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Доступ к микрофону',
            message: 'Для записи голосовых сообщений необходим доступ к микрофону',
            buttonNeutral: 'Спросить позже',
            buttonNegative: 'Отмена',
            buttonPositive: 'ОК',
          }
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('Error requesting microphone permission:', err);
        return false;
      }
    }
    return true; // iOS handles permissions automatically
  };

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      // Request permission
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        Alert.alert(
          'Нет доступа',
          'Для записи голосовых сообщений необходим доступ к микрофону',
          [{ text: 'OK' }]
        );
        return;
      }

      // Generate file path
      const audioPath = `${RNFS.CachesDirectoryPath}/voice_${Date.now()}.m4a`;

      // Start recording
      const result = await audioRecorderPlayer.startRecorder(audioPath);

      setIsRecording(true);
      setIsPaused(false);
      setAudioUri(result);
      setWaveform([]);

      console.log('✅ Recording started:', result);

      // Subscribe to recording updates
      audioRecorderPlayer.addRecordBackListener((e) => {
        setRecordingDuration(e.currentPosition);

        // Simulate waveform data (in production, use actual audio levels)
        // For real waveform, you'd need to access audio metering data
        const amplitude = 0.3 + Math.random() * 0.7; // Random amplitude between 0.3 and 1.0
        setWaveform((prev) => [...prev, amplitude].slice(-40)); // Keep last 40 samples
      });

      // Start waveform sampling
      waveformInterval.current = setInterval(() => {
        // Sample waveform every 100ms
        const amplitude = 0.3 + Math.random() * 0.7;
        setWaveform((prev) => [...prev, amplitude].slice(-40));
      }, 100);
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Ошибка', 'Не удалось начать запись');
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback(async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();

      // Clear waveform interval
      if (waveformInterval.current) {
        clearInterval(waveformInterval.current);
        waveformInterval.current = null;
      }

      setIsRecording(false);
      setIsPaused(false);

      console.log('✅ Recording stopped:', result);

      // Check if recording is too short
      if (recordingDuration < 1000) {
        Alert.alert(
          'Слишком короткое',
          'Голосовое сообщение должно быть не менее 1 секунды'
        );
        clearRecording();
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Ошибка', 'Не удалось остановить запись');
    }
  }, [recordingDuration]);

  // Pause recording
  const pauseRecording = useCallback(async () => {
    try {
      await audioRecorderPlayer.pauseRecorder();
      setIsPaused(true);

      // Clear waveform interval
      if (waveformInterval.current) {
        clearInterval(waveformInterval.current);
        waveformInterval.current = null;
      }

      console.log('⏸️ Recording paused');
    } catch (error) {
      console.error('Error pausing recording:', error);
    }
  }, []);

  // Resume recording
  const resumeRecording = useCallback(async () => {
    try {
      await audioRecorderPlayer.resumeRecorder();
      setIsPaused(false);

      // Restart waveform sampling
      waveformInterval.current = setInterval(() => {
        const amplitude = 0.3 + Math.random() * 0.7;
        setWaveform((prev) => [...prev, amplitude].slice(-40));
      }, 100);

      console.log('▶️ Recording resumed');
    } catch (error) {
      console.error('Error resuming recording:', error);
    }
  }, []);

  // Clear recording
  const clearRecording = useCallback(() => {
    // Delete file if exists
    if (audioUri) {
      RNFS.unlink(audioUri).catch((err) => {
        console.error('Error deleting audio file:', err);
      });
    }

    setAudioUri(null);
    setRecordingDuration(0);
    setWaveform([]);
    setIsRecording(false);
    setIsPaused(false);

    // Clear waveform interval
    if (waveformInterval.current) {
      clearInterval(waveformInterval.current);
      waveformInterval.current = null;
    }
  }, [audioUri]);

  // Upload audio to server
  const uploadAudio = useCallback(async (): Promise<{ audioId: string; audioUrl: string }> => {
    if (!audioUri) {
      throw new Error('No audio to upload');
    }

    try {
      // Prepare FormData
      const formData = new FormData();

      const fileName = audioUri.split('/').pop() || 'voice.m4a';

      formData.append('audio', {
        uri: audioUri,
        type: 'audio/m4a',
        name: fileName,
      } as any);

      formData.append('duration', Math.floor(recordingDuration / 1000).toString());

      // Add waveform data
      formData.append('waveform', JSON.stringify(waveform));

      // TODO: Replace with your API endpoint
      const response = await fetch('YOUR_API_URL/api/v1/uploads/voice', {
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

      console.log('✅ Audio uploaded:', data);

      return {
        audioId: data.file.id,
        audioUrl: data.file.url,
      };
    } catch (error) {
      console.error('Error uploading audio:', error);
      throw error;
    }
  }, [audioUri, recordingDuration, waveform]);

  return {
    isRecording,
    isPaused,
    recordingDuration,
    audioUri,
    waveform,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
    uploadAudio,
  };
}
