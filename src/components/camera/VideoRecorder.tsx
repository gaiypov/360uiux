/**
 * 360° РАБОТА - Professional Video Recorder
 * Using react-native-vision-camera for high-quality video recording
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
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
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '@/constants';
import { haptics } from '@/utils/haptics';

interface VideoRecorderProps {
  onVideoRecorded: (videoPath: string) => void;
  maxDuration?: number; // in seconds
  cameraPosition?: 'front' | 'back';
}

export const VideoRecorder: React.FC<VideoRecorderProps> = ({
  onVideoRecorded,
  maxDuration = 180, // 3 minutes default
  cameraPosition = 'front',
}) => {
  const camera = useRef<Camera>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [cameraFacing, setCameraFacing] = useState<'front' | 'back'>(cameraPosition);

  const { hasPermission: hasCameraPermission, requestPermission: requestCameraPermission } =
    useCameraPermission();
  const { hasPermission: hasMicPermission, requestPermission: requestMicPermission } =
    useMicrophonePermission();

  const device = useCameraDevice(cameraFacing);

  // Animation values
  const recordButtonScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);

  useEffect(() => {
    // Request permissions on mount
    if (!hasCameraPermission) {
      requestCameraPermission();
    }
    if (!hasMicPermission) {
      requestMicPermission();
    }
  }, []);

  useEffect(() => {
    // Recording timer
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);
    } else {
      setRecordingTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, maxDuration]);

  const startRecording = useCallback(async () => {
    if (!camera.current || !device) return;

    try {
      haptics.heavy();
      setIsRecording(true);

      // Start pulse animation
      pulseOpacity.value = withRepeat(
        withTiming(1, { duration: 1000 }),
        -1,
        true
      );
      recordButtonScale.value = withSpring(1.3);

      camera.current.startRecording({
        flash: 'off',
        onRecordingFinished: (video) => {
          console.log('✅ Video recorded:', video.path);
          onVideoRecorded(video.path);
          setIsRecording(false);
          recordButtonScale.value = withSpring(1);
          pulseOpacity.value = 0;
        },
        onRecordingError: (error) => {
          console.error('❌ Recording error:', error);
          setIsRecording(false);
          haptics.error();
          recordButtonScale.value = withSpring(1);
          pulseOpacity.value = 0;
        },
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsRecording(false);
      haptics.error();
    }
  }, [device, onVideoRecorded]);

  const stopRecording = useCallback(async () => {
    if (!camera.current) return;

    try {
      haptics.success();
      await camera.current.stopRecording();
      setIsRecording(false);
      recordButtonScale.value = withSpring(1);
      pulseOpacity.value = 0;
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  }, []);

  const toggleCamera = useCallback(() => {
    haptics.light();
    setCameraFacing((prev) => (prev === 'front' ? 'back' : 'front'));
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Animated styles
  const recordButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: recordButtonScale.value }],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  if (!hasCameraPermission || !hasMicPermission) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Icon name="camera-off" size={64} color={colors.chromeSilver} />
          <Text style={styles.permissionText}>
            Требуется доступ к камере и микрофону
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={() => {
              requestCameraPermission();
              requestMicPermission();
            }}
          >
            <Text style={styles.permissionButtonText}>Предоставить доступ</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.platinumSilver} />
        <Text style={styles.loadingText}>Загрузка камеры...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera */}
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        video={true}
        audio={true}
        preset="high"
      />

      {/* Recording indicator */}
      {isRecording && (
        <Animated.View style={[styles.recordingIndicator, pulseAnimatedStyle]}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>REC {formatTime(recordingTime)}</Text>
        </Animated.View>
      )}

      {/* Time limit indicator */}
      <View style={styles.timeLimitContainer}>
        <Text style={styles.timeLimitText}>
          Макс. {maxDuration}s
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Flip camera button */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={toggleCamera}
          disabled={isRecording}
        >
          <Icon
            name="camera-flip"
            size={32}
            color={isRecording ? colors.graphiteSilver : colors.softWhite}
          />
        </TouchableOpacity>

        {/* Record button */}
        <Animated.View style={recordButtonAnimatedStyle}>
          <TouchableOpacity
            style={styles.recordButton}
            onPress={isRecording ? stopRecording : startRecording}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.recordButtonInner,
                isRecording && styles.recordButtonInnerRecording,
              ]}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Placeholder for symmetry */}
        <View style={styles.controlButton} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBlack,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    color: colors.chromeSilver,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: colors.platinumSilver,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryBlack,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.chromeSilver,
  },
  recordingIndicator: {
    position: 'absolute',
    top: 60,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.softWhite,
    marginRight: 8,
  },
  recordingText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.softWhite,
  },
  timeLimitContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timeLimitText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.softWhite,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  controlButton: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.softWhite,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primaryBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF0000',
  },
  recordButtonInnerRecording: {
    width: 32,
    height: 32,
    borderRadius: 4,
  },
});
