/**
 * 360° РАБОТА - Resume Video Player
 * Architecture v3: Private videos with 2-view limit
 */

import React, { useState, useRef } from 'react';
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
import { wsService } from '@/services/WebSocketService';

const { width } = Dimensions.get('window');

interface ResumeVideoPlayerProps {
  videoId: string;
  videoUrl: string;
  thumbnailUrl?: string;
  viewsRemaining: number;
  applicationId?: string;
  conversationId?: string;
  messageId?: string;
  onViewCountUpdate?: (newCount: number) => void;
  onVideoDeleted?: () => void;
}

export function ResumeVideoPlayer({
  videoId,
  videoUrl,
  thumbnailUrl,
  viewsRemaining: initialViewsRemaining,
  applicationId,
  conversationId,
  messageId,
  onViewCountUpdate,
  onVideoDeleted,
}: ResumeVideoPlayerProps) {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [viewsRemaining, setViewsRemaining] = useState(initialViewsRemaining);
  const [isDeleted, setIsDeleted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Animation values
  const playButtonScale = useSharedValue(1);

  // Check if video is available to watch
  const canWatch = viewsRemaining > 0 && !isDeleted;

  // Handle play button press
  const handlePlay = async () => {
    if (!canWatch) {
      Alert.alert(
        'Лимит просмотров исчерпан',
        'Это видео-резюме больше недоступно для просмотра.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!hasStartedPlaying) {
      // First time playing - track view
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
      // Call API to track view
      const result = await api.trackResumeVideoView(videoId, {
        applicationId,
        conversationId,
      });

      const newViewsRemaining = result.viewsRemaining;
      setViewsRemaining(newViewsRemaining);

      // Emit WebSocket event for real-time tracking
      if (conversationId && messageId) {
        wsService.trackVideoView(videoId, conversationId, messageId);
      }

      // Notify parent component
      if (onViewCountUpdate) {
        onViewCountUpdate(newViewsRemaining);
      }

      // Architecture v3: Auto-delete after reaching 0 views
      if (newViewsRemaining <= 0 || result.autoDeleted) {
        setTimeout(() => {
          handleAutoDelete();
        }, 2000); // Give 2 seconds to finish watching
      }

      console.log('✅ Video view tracked:', {
        videoId,
        applicationId,
        conversationId,
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
    }
  };

  // Auto-delete video after 2 views
  const handleAutoDelete = () => {
    setIsDeleted(true);
    setIsPlaying(false);

    // Emit WebSocket event for video deletion
    if (conversationId && messageId) {
      wsService.notifyVideoDeleted(videoId, conversationId, messageId);
    }

    Alert.alert(
      'Видео удалено',
      'Это видео-резюме было автоматически удалено после 2 просмотров в соответствии с политикой конфиденциальности.',
      [{ text: 'Понятно' }]
    );

    if (onVideoDeleted) {
      onVideoDeleted();
    }

    console.log('🗑️ Video auto-deleted:', videoId);
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
      <View style={styles.container}>
        <View style={styles.deletedContainer}>
          <Icon name="lock-off" size={64} color={colors.error} />
          <Text style={styles.deletedTitle}>Видео удалено</Text>
          <Text style={styles.deletedText}>
            Это видео было автоматически удалено{'\n'}
            после достижения лимита просмотров
          </Text>
        </View>
      </View>
    );
  }

  // If no views remaining but not deleted yet
  if (!canWatch) {
    return (
      <View style={styles.container}>
        <View style={styles.lockedContainer}>
          <Icon name="lock" size={64} color={colors.chromeSilver} />
          <Text style={styles.lockedTitle}>Лимит просмотров исчерпан</Text>
          <Text style={styles.lockedText}>
            Вы просмотрели это видео максимальное{'\n'}
            количество раз (2 просмотра)
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
          <ActivityIndicator size="large" color={colors.primary} />
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
              <Icon name="play" size={48} color="#fff" />
            </View>
          </Animated.View>
        )}

        {/* Top overlay with info */}
        <View style={styles.topOverlay}>
          <View style={styles.viewsRemainingBadge}>
            <Icon name="eye" size={16} color="#fff" />
            <Text style={styles.viewsRemainingText}>
              {viewsRemaining} {viewsRemaining === 1 ? 'просмотр' : 'просмотра'}
            </Text>
          </View>

          <View style={styles.privateBadge}>
            <Icon name="shield-lock" size={14} color="#fff" />
            <Text style={styles.privateBadgeText}>Приватное</Text>
          </View>
        </View>

        {/* Bottom overlay with progress */}
        {isPlaying && (
          <Animated.View
            entering={FadeIn.duration(200)}
            style={styles.bottomOverlay}
          >
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(currentTime / duration) * 100}%` },
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

      {/* Warning if last view */}
      {viewsRemaining === 1 && !hasStartedPlaying && (
        <Animated.View
          entering={FadeIn.duration(300)}
          style={styles.warningBanner}
        >
          <Icon name="alert" size={20} color={colors.warning} />
          <Text style={styles.warningText}>
            Последний просмотр! Видео будет удалено после просмотра.
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.carbonGray,
    borderRadius: sizes.radiusMedium,
    overflow: 'hidden',
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: sizes.sm,
  },
  viewsRemainingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: sizes.sm,
    paddingVertical: sizes.xs,
    borderRadius: sizes.radiusSmall,
    gap: 4,
  },
  viewsRemainingText: {
    ...typography.caption,
    color: '#fff',
    fontWeight: '600',
  },
  privateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: sizes.sm,
    paddingVertical: sizes.xs,
    borderRadius: sizes.radiusSmall,
    gap: 4,
  },
  privateBadgeText: {
    ...typography.caption,
    color: '#fff',
    fontSize: 11,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: sizes.sm,
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: sizes.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    ...typography.micro,
    color: '#fff',
  },
  warningBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(251, 191, 36, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: sizes.sm,
    gap: sizes.xs,
  },
  warningText: {
    ...typography.caption,
    color: colors.graphiteBlack,
    fontWeight: '600',
    flex: 1,
  },
  // Deleted state
  deletedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: sizes.lg,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  deletedTitle: {
    ...typography.h3,
    color: colors.error,
    marginTop: sizes.md,
    marginBottom: sizes.sm,
  },
  deletedText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Locked state
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: sizes.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  lockedTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: sizes.md,
    marginBottom: sizes.sm,
  },
  lockedText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
