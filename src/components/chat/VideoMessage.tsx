/**
 * 360° РАБОТА - Video Message Component
 * Architecture v3: Video messages in chat with 2-view limit and auto-delete
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, typography, sizes } from '@/constants';
import { haptics } from '@/utils/haptics';
import { api } from '@/services/api';

const { width } = Dimensions.get('window');
const VIDEO_WIDTH = width * 0.7;

interface VideoMessageProps {
  messageId: string;
  videoUrl: string;
  thumbnailUrl?: string;
  viewsRemaining: number;
  isSender: boolean;
  duration?: number;
  onViewCountUpdate?: (newCount: number) => void;
  onVideoDeleted?: () => void;
}

export function VideoMessage({
  messageId,
  videoUrl,
  thumbnailUrl,
  viewsRemaining: initialViewsRemaining,
  isSender,
  duration: videoDuration,
  onViewCountUpdate,
  onVideoDeleted,
}: VideoMessageProps) {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [viewsRemaining, setViewsRemaining] = useState(initialViewsRemaining);
  const [isDeleted, setIsDeleted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(videoDuration || 0);

  // Animation values
  const playButtonScale = useSharedValue(1);

  // Sync props with state
  useEffect(() => {
    setViewsRemaining(initialViewsRemaining);
  }, [initialViewsRemaining]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isPlaying) {
        setIsPlaying(false);
      }
    };
  }, [isPlaying]);

  // Check if video is available to watch
  const canWatch = viewsRemaining > 0 && !isDeleted;

  // Handle play button press
  const handlePlay = async () => {
    if (!canWatch) {
      Alert.alert(
        'Видео недоступно',
        'Это видео было удалено после достижения лимита просмотров.',
        [{ text: 'OK' }]
      );
      return;
    }

    // If not sender and haven't started playing yet, track view
    if (!isSender && !hasStartedPlaying) {
      await trackView();
      setHasStartedPlaying(true);
    }

    haptics.light();
    setIsPlaying(true);
    playButtonScale.value = withSpring(0);
  };

  // Handle pause
  const handlePause = () => {
    haptics.light();
    setIsPlaying(false);
    playButtonScale.value = withSpring(1);
  };

  // Track video view
  const trackView = async () => {
    try {
      setIsLoading(true);

      // Call API to track view
      const result = await api.post(`/chat/messages/${messageId}/track-view`);

      const newViewsRemaining = result.data.viewsRemaining;
      setViewsRemaining(newViewsRemaining);

      // Notify parent component
      if (onViewCountUpdate) {
        onViewCountUpdate(newViewsRemaining);
      }

      // Check if auto-deleted
      if (result.data.autoDeleted) {
        setTimeout(() => {
          handleAutoDelete();
        }, 2000); // Give 2 seconds to finish watching
      }

      console.log('✅ Video view tracked:', {
        messageId,
        viewsRemaining: newViewsRemaining,
      });
    } catch (error) {
      console.error('❌ Error tracking video view:', error);
      // Still allow viewing even if tracking fails
      const newViewsRemaining = viewsRemaining - 1;
      setViewsRemaining(newViewsRemaining);

      if (onViewCountUpdate) {
        onViewCountUpdate(newViewsRemaining);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-delete video after 2 views
  const handleAutoDelete = () => {
    setIsDeleted(true);
    setIsPlaying(false);

    Alert.alert(
      'Видео удалено',
      'Это видео было автоматически удалено после 2 просмотров.',
      [{ text: 'Понятно' }]
    );

    if (onVideoDeleted) {
      onVideoDeleted();
    }

    console.log('🗑️ Video auto-deleted:', messageId);
  };

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Animated styles
  const playButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playButtonScale.value }],
    opacity: playButtonScale.value,
  }));

  // If deleted, show deleted state
  if (isDeleted) {
    return (
      <View style={[styles.container, isSender && styles.senderContainer]}>
        <View style={styles.deletedContainer}>
          <Icon name="movie-off" size={32} color={colors.textSecondary} />
          <Text style={styles.deletedText}>Видео удалено</Text>
        </View>
      </View>
    );
  }

  // If no views remaining but not deleted yet
  if (!canWatch && !isSender) {
    return (
      <View style={[styles.container, isSender && styles.senderContainer]}>
        <View style={styles.lockedContainer}>
          <Icon name="lock" size={32} color={colors.textSecondary} />
          <Text style={styles.lockedText}>Лимит просмотров исчерпан</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isSender && styles.senderContainer]}>
      {/* Video Player */}
      <Video
        ref={videoRef}
        source={{ uri: videoUrl }}
        style={styles.video}
        resizeMode="cover"
        paused={!isPlaying}
        onLoad={(data) => {
          setIsLoading(false);
          setDuration(data.duration);
        }}
        onProgress={(data) => {
          setCurrentTime(data.currentTime);
        }}
        onEnd={() => {
          setIsPlaying(false);
          playButtonScale.value = withSpring(1);
        }}
        onError={(error) => {
          console.error('Video error:', error);
          setIsLoading(false);
          Alert.alert('Ошибка', 'Не удалось загрузить видео');
        }}
        poster={thumbnailUrl}
        posterResizeMode="cover"
      />

      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#fff" />
        </View>
      )}

      {/* Play/Pause overlay */}
      <TouchableOpacity
        style={styles.overlay}
        onPress={isPlaying ? handlePause : handlePlay}
        activeOpacity={1}
      >
        {!isPlaying && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={[styles.playButtonContainer, playButtonAnimatedStyle]}
          >
            <View style={styles.playButton}>
              <Icon name="play" size={32} color="#fff" />
            </View>
          </Animated.View>
        )}

        {/* Views badge (only show for sender or if not viewed yet) */}
        {(isSender || !hasStartedPlaying) && (
          <View style={styles.topOverlay}>
            <View style={styles.viewsBadge}>
              <Icon name="eye" size={12} color="#fff" />
              <Text style={styles.viewsText}>
                {viewsRemaining}/2
              </Text>
            </View>
          </View>
        )}

        {/* Bottom overlay with progress */}
        {isPlaying && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.bottomOverlay}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' },
                ]}
              />
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </Animated.View>
        )}
      </TouchableOpacity>

      {/* Duration badge when not playing */}
      {!isPlaying && duration > 0 && (
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{formatTime(duration)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: VIDEO_WIDTH,
    aspectRatio: 16 / 9,
    backgroundColor: colors.carbonGray,
    borderRadius: sizes.radiusMedium,
    overflow: 'hidden',
    marginVertical: sizes.xs,
  },
  senderContainer: {
    alignSelf: 'flex-end',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  playButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  topOverlay: {
    position: 'absolute',
    top: sizes.xs,
    right: sizes.xs,
  },
  viewsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: sizes.xs,
    paddingVertical: 4,
    borderRadius: sizes.radiusSmall,
    gap: 4,
  },
  viewsText: {
    ...typography.caption,
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: sizes.xs,
  },
  progressBar: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    ...typography.micro,
    color: '#fff',
    fontSize: 10,
  },
  durationBadge: {
    position: 'absolute',
    bottom: sizes.xs,
    right: sizes.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: sizes.xs,
    paddingVertical: 4,
    borderRadius: sizes.radiusSmall,
  },
  durationText: {
    ...typography.caption,
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  // Deleted state
  deletedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  deletedText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: sizes.xs,
  },
  // Locked state
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  lockedText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: sizes.xs,
  },
});
