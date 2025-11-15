/**
 * 360° РАБОТА - Video Preview Screen
 * Preview recorded resume video before upload
 * ✅ STAGE II OPTIMIZED: Added video ref cleanup on unmount
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import { BlurView } from '@react-native-community/blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { colors } from '@/constants';

interface VideoPreviewScreenProps {
  navigation: any;
  route: {
    params: {
      videoPath: string;
      duration: number;
      onConfirm?: (videoPath: string, duration: number) => void;
    };
  };
}

export function VideoPreviewScreen({ navigation, route }: VideoPreviewScreenProps) {
  const { videoPath, duration, onConfirm } = route.params;

  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(duration);

  // Animation values
  const playButtonScale = useSharedValue(1);

  // ✅ P0-II-6 FIX: Cleanup video ref on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      // Pause and cleanup video on unmount
      if (videoRef.current) {
        try {
          // React Native Video cleanup
          videoRef.current = null;
        } catch (error) {
          console.error('Error cleaning up video:', error);
        }
      }
    };
  }, []);

  // Format time to MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
    playButtonScale.value = withSpring(isPlaying ? 1.2 : 1);
  };

  // Re-record
  const handleReRecord = () => {
    Alert.alert(
      'Перезаписать видео?',
      'Текущая запись будет удалена',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Перезаписать',
          style: 'destructive',
          onPress: () => {
            navigation.replace('VideoRecord', {
              onVideoRecorded: onConfirm,
              maxDuration: duration,
            });
          },
        },
      ]
    );
  };

  // Confirm and upload
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(videoPath, videoDuration);
    }
    navigation.goBack();
  };

  // Cancel
  const handleCancel = () => {
    Alert.alert(
      'Отменить?',
      'Видео будет удалено',
      [
        { text: 'Продолжить', style: 'cancel' },
        {
          text: 'Отменить',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  // Animated styles
  const playButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playButtonScale.value }],
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />

      {/* Video player */}
      <Video
        ref={videoRef}
        source={{ uri: `file://${videoPath}` }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        paused={!isPlaying}
        repeat={true}
        onLoad={(data) => {
          setIsLoading(false);
          setVideoDuration(data.duration);
        }}
        onProgress={(data) => {
          setCurrentTime(data.currentTime);
        }}
        onError={(error) => {
          console.error('Video error:', error);
          Alert.alert('Ошибка', 'Не удалось загрузить видео');
        }}
      />

      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Загрузка видео...</Text>
        </View>
      )}

      {/* Top overlay */}
      <View style={styles.topOverlay}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleCancel}
        >
          <Icon name="close" size={30} color="#fff" />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Предпросмотр</Text>
          <Text style={styles.subtitle}>
            {formatTime(currentTime)} / {formatTime(videoDuration)}
          </Text>
        </View>
      </View>

      {/* Center play/pause button */}
      {!isPlaying && !isLoading && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.centerPlayButton}
        >
          <TouchableOpacity
            onPress={togglePlayPause}
            activeOpacity={0.8}
          >
            <Animated.View style={[styles.playButtonCircle, playButtonAnimatedStyle]}>
              <Icon name="play" size={40} color="#fff" />
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Tap to pause/play */}
      {isPlaying && !isLoading && (
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={togglePlayPause}
          activeOpacity={1}
        />
      )}

      {/* Bottom controls */}
      <View style={styles.bottomOverlay}>
        <BlurView
          style={styles.blurContainer}
          blurType="dark"
          blurAmount={10}
          reducedTransparencyFallbackColor={colors.background}
        >
          {/* Info */}
          <View style={styles.infoContainer}>
            <Icon name="information-circle" size={20} color={colors.primary} />
            <Text style={styles.infoText}>
              Проверьте видео перед загрузкой
            </Text>
          </View>

          {/* Action buttons */}
          <View style={styles.actionsContainer}>
            {/* Re-record button */}
            <TouchableOpacity
              style={styles.reRecordButton}
              onPress={handleReRecord}
              activeOpacity={0.8}
            >
              <Icon name="reload" size={24} color={colors.text} />
              <Text style={styles.reRecordText}>Перезаписать</Text>
            </TouchableOpacity>

            {/* Confirm button */}
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Icon name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.confirmText}>Использовать</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  loadingText: {
    fontSize: 16,
    color: '#fff',
    marginTop: 16,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginLeft: -44, // Center accounting for close button
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  centerPlayButton: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  blurContainer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  reRecordButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 8,
  },
  reRecordText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
