/**
 * 360° РАБОТА - ULTRA EDITION
 * Video Record Screen
 * Запись видео с камеры
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, useMicrophonePermission } from 'react-native-vision-camera';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { colors, metalGradients, typography, sizes } from '@/constants';
import { haptics } from '@/utils/haptics';

interface Props {
  route: {
    params: {
      type: 'vacancy' | 'resume';
      vacancyId?: string;
      onVideoRecorded: (videoPath: string) => void;
    };
  };
  navigation: any;
}

export function VideoRecordScreen({ route, navigation }: Props) {
  const { type, vacancyId, onVideoRecorded } = route.params;

  const camera = useRef<Camera>(null);
  const device = useCameraDevice('front'); // Фронтальная камера для селфи-видео
  const { hasPermission: hasCameraPermission, requestPermission: requestCameraPermission } = useCameraPermission();
  const { hasPermission: hasMicrophonePermission, requestPermission: requestMicrophonePermission } = useMicrophonePermission();

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);

  const MAX_DURATION = 60; // Максимум 60 секунд

  /**
   * Запросить разрешения
   */
  useEffect(() => {
    const checkPermissions = async () => {
      if (!hasCameraPermission) {
        await requestCameraPermission();
      }
      if (!hasMicrophonePermission) {
        await requestMicrophonePermission();
      }
    };

    checkPermissions();
  }, []);

  /**
   * Таймер записи
   */
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => {
          if (prev >= MAX_DURATION) {
            // Автоматическая остановка при достижении лимита
            handleStopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setRecordingDuration(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  /**
   * Начать запись
   */
  const handleStartRecording = async () => {
    try {
      if (!camera.current) return;

      haptics.medium();
      setIsRecording(true);

      await camera.current.startRecording({
        onRecordingFinished: (video) => {
          console.log('📹 Video recorded:', video.path);
          setIsRecording(false);
          onVideoRecorded(video.path);
          navigation.goBack();
        },
        onRecordingError: (error) => {
          console.error('❌ Recording error:', error);
          haptics.error();
          setIsRecording(false);
          Alert.alert('Ошибка', 'Не удалось записать видео');
        },
      });
    } catch (error) {
      console.error('Start recording error:', error);
      haptics.error();
      Alert.alert('Ошибка', 'Не удалось начать запись');
    }
  };

  /**
   * Остановить запись
   */
  const handleStopRecording = async () => {
    try {
      if (!camera.current) return;

      haptics.medium();
      await camera.current.stopRecording();
      setIsRecording(false);
    } catch (error) {
      console.error('Stop recording error:', error);
    }
  };

  /**
   * Закрыть экран
   */
  const handleClose = () => {
    if (isRecording) {
      Alert.alert(
        'Остановить запись?',
        'Вы действительно хотите отменить запись видео?',
        [
          { text: 'Продолжить запись', style: 'cancel' },
          {
            text: 'Остановить',
            style: 'destructive',
            onPress: async () => {
              await handleStopRecording();
              navigation.goBack();
            },
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  /**
   * Форматировать время
   */
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Проверка разрешений
  if (!hasCameraPermission || !hasMicrophonePermission) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />
        <View style={styles.centerContent}>
          <Icon name="camera-off" size={64} color={colors.chromeSilver} />
          <Text style={styles.permissionText}>
            Для записи видео необходимо{'\n'}разрешение на камеру и микрофон
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={async () => {
            await requestCameraPermission();
            await requestMicrophonePermission();
          }}>
            <LinearGradient
              colors={metalGradients.platinum}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>РАЗРЕШИТЬ</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Камера не найдена</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Камера */}
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        video={true}
        audio={true}
        onInitialized={() => {
          console.log('📹 Camera initialized');
          setCameraReady(true);
        }}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Icon name="close" size={28} color={colors.softWhite} />
          </TouchableOpacity>

          <Text style={styles.titleText}>
            {type === 'vacancy' ? 'Видео вакансии' : 'Видеорезюме'}
          </Text>

          <View style={styles.placeholder} />
        </Animated.View>

        {/* Recording indicator */}
        {isRecording && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>REC {formatTime(recordingDuration)}</Text>
            <Text style={styles.maxDurationText}>/ {formatTime(MAX_DURATION)}</Text>
          </Animated.View>
        )}

        {/* Controls */}
        <Animated.View entering={FadeIn.delay(200)} style={styles.controls}>
          {!isRecording ? (
            <>
              <Text style={styles.hintText}>
                Максимальная длительность: {MAX_DURATION} сек
              </Text>
              <TouchableOpacity
                style={styles.recordButton}
                onPress={handleStartRecording}
                disabled={!cameraReady}
              >
                <LinearGradient
                  colors={metalGradients.platinum}
                  style={styles.recordButtonGradient}
                >
                  <View style={styles.recordButtonInner}>
                    <Icon name="circle" size={40} color={colors.error} />
                  </View>
                </LinearGradient>
                <Text style={styles.recordButtonText}>Начать запись</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.stopButton}
              onPress={handleStopRecording}
            >
              <LinearGradient
                colors={[colors.error, '#c0392b']}
                style={styles.stopButtonGradient}
              >
                <Icon name="stop" size={32} color={colors.softWhite} />
              </LinearGradient>
              <Text style={styles.stopButtonText}>Остановить</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBlack,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: sizes.xl,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sizes.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: sizes.lg,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    ...typography.h2,
    color: colors.softWhite,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  placeholder: {
    width: 44,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: sizes.lg,
    paddingVertical: sizes.sm,
    borderRadius: sizes.radiusLarge,
    alignSelf: 'center',
    marginTop: sizes.lg,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.error,
    marginRight: sizes.sm,
  },
  recordingText: {
    ...typography.h3,
    color: colors.softWhite,
    fontWeight: '700',
  },
  maxDurationText: {
    ...typography.body,
    color: colors.chromeSilver,
    marginLeft: sizes.xs,
  },
  controls: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: sizes.lg,
  },
  hintText: {
    ...typography.body,
    color: colors.softWhite,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  recordButton: {
    alignItems: 'center',
    gap: sizes.sm,
  },
  recordButtonGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.graphiteBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonText: {
    ...typography.bodyMedium,
    color: colors.softWhite,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  stopButton: {
    alignItems: 'center',
    gap: sizes.sm,
  },
  stopButtonGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButtonText: {
    ...typography.bodyMedium,
    color: colors.softWhite,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  permissionText: {
    ...typography.h3,
    color: colors.chromeSilver,
    textAlign: 'center',
    marginTop: sizes.xl,
    marginBottom: sizes.xxl,
    lineHeight: 28,
  },
  permissionButton: {
    borderRadius: sizes.radiusLarge,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingHorizontal: sizes.xxl,
    paddingVertical: sizes.md + 2,
  },
  buttonText: {
    ...typography.h3,
    color: colors.graphiteBlack,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});
