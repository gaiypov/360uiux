/**
 * 360° РАБОТА - Video Record Screen
 * Record resume video with camera
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useMicrophonePermission,
} from 'react-native-vision-camera';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '@/constants';

const { width, height } = Dimensions.get('window');

interface VideoRecordScreenProps {
  navigation: any;
  route: {
    params?: {
      onVideoRecorded?: (videoPath: string, duration: number) => void;
      maxDuration?: number; // in seconds
    };
  };
}

export function VideoRecordScreen({ navigation, route }: VideoRecordScreenProps) {
  const camera = useRef<Camera>(null);
  const device = useCameraDevice('front');
  const { hasPermission: hasCameraPermission, requestPermission: requestCameraPermission } = useCameraPermission();
  const { hasPermission: hasMicrophonePermission, requestPermission: requestMicrophonePermission } = useMicrophonePermission();

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const maxDuration = route.params?.maxDuration || 120; // 2 minutes default
  const onVideoRecorded = route.params?.onVideoRecorded;

  // Animation values
  const recordButtonScale = useSharedValue(1);
  const recordingIndicatorOpacity = useSharedValue(0);
  const timerScale = useSharedValue(0);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => {
          const newDuration = prev + 1;

          // Auto-stop at max duration
          if (newDuration >= maxDuration) {
            handleStopRecording();
            return maxDuration;
          }

          return newDuration;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, isPaused, maxDuration]);

  // Request permissions on mount
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

  // Format duration to MM:SS
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start recording
  const handleStartRecording = useCallback(async () => {
    if (!camera.current) {
      Alert.alert('Ошибка', 'Камера не готова');
      return;
    }

    try {
      setIsRecording(true);
      setRecordingDuration(0);

      // Animate recording indicator
      recordingIndicatorOpacity.value = withRepeat(
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      timerScale.value = withSpring(1);
      recordButtonScale.value = withSpring(0.8);

      await camera.current.startRecording({
        onRecordingFinished: (video) => {
          console.log('Recording finished:', video.path);

          // Navigate to preview screen
          navigation.replace('VideoPreview', {
            videoPath: video.path,
            duration: recordingDuration,
            onConfirm: onVideoRecorded,
          });
        },
        onRecordingError: (error) => {
          console.error('Recording error:', error);
          Alert.alert('Ошибка записи', error.message);
          resetRecordingState();
        },
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Ошибка', 'Не удалось начать запись');
      resetRecordingState();
    }
  }, [navigation, onVideoRecorded, recordingDuration]);

  // Stop recording
  const handleStopRecording = useCallback(async () => {
    if (!camera.current || !isRecording) return;

    try {
      await camera.current.stopRecording();
      resetRecordingState();
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Ошибка', 'Не удалось остановить запись');
      resetRecordingState();
    }
  }, [isRecording]);

  // Reset recording state
  const resetRecordingState = () => {
    setIsRecording(false);
    setIsPaused(false);
    recordingIndicatorOpacity.value = withTiming(0);
    timerScale.value = withTiming(0);
    recordButtonScale.value = withSpring(1);
  };

  // Cancel recording
  const handleCancel = () => {
    if (isRecording) {
      Alert.alert(
        'Отменить запись?',
        'Видео будет удалено',
        [
          { text: 'Продолжить запись', style: 'cancel' },
          {
            text: 'Отменить',
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

  // Animated styles
  const recordButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: recordButtonScale.value }],
  }));

  const recordingIndicatorAnimatedStyle = useAnimatedStyle(() => ({
    opacity: recordingIndicatorOpacity.value,
  }));

  const timerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: timerScale.value }],
    opacity: timerScale.value,
  }));

  // Loading or no permission
  if (!hasCameraPermission || !hasMicrophonePermission) {
    return (
      <View style={styles.permissionContainer}>
        <Icon name="videocam-off" size={80} color={colors.error} />
        <Text style={styles.permissionTitle}>Нужны разрешения</Text>
        <Text style={styles.permissionText}>
          Для записи видео-резюме нужен доступ к камере и микрофону
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={async () => {
            await requestCameraPermission();
            await requestMicrophonePermission();
          }}
        >
          <Text style={styles.permissionButtonText}>Разрешить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.permissionContainer}>
        <Icon name="videocam-off" size={80} color={colors.error} />
        <Text style={styles.permissionTitle}>Камера не найдена</Text>
        <Text style={styles.permissionText}>
          Не удалось обнаружить камеру на устройстве
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Camera */}
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        video={true}
        audio={true}
        photoQualityBalance="speed"
      />

      {/* Top overlay */}
      <View style={styles.topOverlay}>
        {/* Cancel button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
        >
          <Icon name="close" size={30} color="#fff" />
        </TouchableOpacity>

        {/* Recording indicator */}
        {isRecording && (
          <Animated.View style={[styles.recordingIndicator, recordingIndicatorAnimatedStyle]}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>REC</Text>
          </Animated.View>
        )}
      </View>

      {/* Timer */}
      <Animated.View style={[styles.timerContainer, timerAnimatedStyle]}>
        <Text style={styles.timerText}>{formatDuration(recordingDuration)}</Text>
        <Text style={styles.timerMaxText}>/ {formatDuration(maxDuration)}</Text>
      </Animated.View>

      {/* Bottom controls */}
      <View style={styles.bottomOverlay}>
        {/* Recording tips */}
        {!isRecording && (
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>💡 Советы для записи:</Text>
            <Text style={styles.tipsText}>• Хорошее освещение</Text>
            <Text style={styles.tipsText}>• Камера на уровне глаз</Text>
            <Text style={styles.tipsText}>• Расскажите о своих навыках</Text>
            <Text style={styles.tipsText}>• Будьте естественны</Text>
          </View>
        )}

        {/* Record button */}
        <View style={styles.controlsContainer}>
          {!isRecording ? (
            <TouchableOpacity
              onPress={handleStartRecording}
              activeOpacity={0.8}
            >
              <Animated.View style={[styles.recordButton, recordButtonAnimatedStyle]}>
                <View style={styles.recordButtonInner} />
              </Animated.View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleStopRecording}
              activeOpacity={0.8}
            >
              <Animated.View style={[styles.stopButton, recordButtonAnimatedStyle]}>
                <View style={styles.stopButtonInner} />
              </Animated.View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  cancelButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 6,
  },
  recordingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  timerContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 80,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  timerText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  timerMaxText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 4,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  tipsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  controlsContainer: {
    alignItems: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  recordButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.error,
  },
  stopButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  stopButtonInner: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
});
