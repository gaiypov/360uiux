/**
 * 360° РАБОТА - ULTRA EDITION
 * Resume Video Player Component
 *
 * Architecture v3: Приватный видеоплеер с лимитом 2 просмотра
 *
 * Features:
 * - 2-view limit per employer
 * - Secure time-limited URLs (5 min)
 * - Blur/lock screen when limit exceeded
 * - View counter display
 * - Download protection
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import Video from 'react-native-video';
import { BlurView } from '@react-native-community/blur';
import { colors, metalGradients, typography, sizes } from '@/constants';
import { apiService } from '@/services/api.service';
import { useToastStore } from '@/stores';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ResumeVideoPlayerProps {
  videoId: string;
  applicationId: string;
  thumbnailUrl?: string;
  onViewLimitExceeded?: () => void;
  onError?: (error: string) => void;
}

interface ViewLimitStatus {
  can_view: boolean;
  views_left: number;
  total_views: number;
}

export function ResumeVideoPlayer({
  videoId,
  applicationId,
  thumbnailUrl,
  onViewLimitExceeded,
  onError,
}: ResumeVideoPlayerProps) {
  const { showToast } = useToastStore();

  const [loading, setLoading] = useState(true);
  const [viewStatus, setViewStatus] = useState<ViewLimitStatus | null>(null);
  const [secureUrl, setSecureUrl] = useState<string | null>(null);
  const [urlExpiresAt, setUrlExpiresAt] = useState<Date | null>(null);
  const [playing, setPlaying] = useState(false);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<Video>(null);
  const urlRefreshTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    checkViewLimitAndLoadVideo();

    return () => {
      if (urlRefreshTimer.current) {
        clearTimeout(urlRefreshTimer.current);
      }
    };
  }, [videoId, applicationId]);

  useEffect(() => {
    // Auto-refresh URL before it expires
    if (urlExpiresAt && secureUrl) {
      const timeUntilExpiry = urlExpiresAt.getTime() - Date.now();
      const refreshTime = Math.max(timeUntilExpiry - 60000, 30000); // Refresh 1 min before expiry or after 30 sec

      urlRefreshTimer.current = setTimeout(() => {
        refreshSecureUrl();
      }, refreshTime);
    }
  }, [urlExpiresAt]);

  const checkViewLimitAndLoadVideo = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check view limit
      // TODO: API call
      // const status = await apiService.checkVideoViewLimit(videoId, applicationId);

      // Mock response
      await new Promise((resolve) => setTimeout(resolve, 500));
      const status: ViewLimitStatus = {
        can_view: true,
        views_left: 2,
        total_views: 0,
      };

      setViewStatus(status);

      if (!status.can_view) {
        setError('Лимит просмотров исчерпан');
        onViewLimitExceeded?.();
        return;
      }

      // Get secure URL
      await fetchSecureUrl();
    } catch (err: any) {
      console.error('Error checking view limit:', err);
      setError(err.message || 'Ошибка загрузки видео');
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSecureUrl = async () => {
    try {
      // TODO: API call
      // const response = await apiService.getSecureResumeVideoUrl(videoId, applicationId);

      // Mock response
      await new Promise((resolve) => setTimeout(resolve, 300));
      const response = {
        url: 'https://example.com/video.m3u8', // Replace with actual HLS URL
        expires_at: new Date(Date.now() + 5 * 60 * 1000),
        views_remaining: 2,
      };

      setSecureUrl(response.url);
      setUrlExpiresAt(response.expires_at);

      // Update view status
      if (viewStatus) {
        setViewStatus({
          ...viewStatus,
          views_left: response.views_remaining,
        });
      }
    } catch (err: any) {
      console.error('Error fetching secure URL:', err);
      throw err;
    }
  };

  const refreshSecureUrl = async () => {
    try {
      console.log('Refreshing secure URL...');
      await fetchSecureUrl();
    } catch (err) {
      console.error('Failed to refresh URL:', err);
      // Don't show error to user, video will continue with old URL
    }
  };

  const handlePlay = () => {
    if (!viewStatus?.can_view) {
      showToast('error', 'Лимит просмотров исчерпан');
      return;
    }

    setPlaying(true);

    if (!hasStartedPlaying) {
      setHasStartedPlaying(true);
      // View count incremented on backend when secure URL was fetched
      showToast(
        'info',
        `Осталось ${viewStatus.views_left - 1} просмотр${viewStatus.views_left - 1 === 1 ? '' : 'а'}`
      );
    }
  };

  const handlePause = () => {
    setPlaying(false);
  };

  const handleError = (err: any) => {
    console.error('Video playback error:', err);
    setError('Ошибка воспроизведения');
    onError?.('Ошибка воспроизведения видео');
  };

  // Render: Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.platinumSilver} />
          <Text style={styles.loadingText}>Загрузка видео...</Text>
        </View>
      </View>
    );
  }

  // Render: Error or view limit exceeded
  if (error || !viewStatus?.can_view) {
    return (
      <View style={styles.container}>
        <BlurView
          style={styles.blurContainer}
          blurType="dark"
          blurAmount={20}
          reducedTransparencyFallbackColor={colors.graphiteGray}
        >
          <Icon name="lock" size={64} color={colors.liquidSilver} />
          <Text style={styles.errorTitle}>
            {viewStatus && !viewStatus.can_view
              ? 'Видео недоступно'
              : 'Ошибка загрузки'}
          </Text>
          <Text style={styles.errorText}>
            {error ||
              'Вы исчерпали лимит просмотров этого видео (макс. 2 просмотра)'}
          </Text>

          {viewStatus && (
            <View style={styles.viewCounter}>
              <Icon name="eye-off" size={20} color={colors.liquidSilver} />
              <Text style={styles.viewCounterText}>
                Просмотрено: {viewStatus.total_views}/2
              </Text>
            </View>
          )}
        </BlurView>
      </View>
    );
  }

  // Render: Video player
  return (
    <View style={styles.container}>
      {secureUrl ? (
        <>
          <Video
            ref={videoRef}
            source={{ uri: secureUrl }}
            style={styles.video}
            controls={true}
            paused={!playing}
            resizeMode="contain"
            onError={handleError}
            onLoad={() => console.log('Video loaded')}
            poster={thumbnailUrl}
            // Security: Prevent downloads/screenshots (platform dependent)
            allowsExternalPlayback={false}
            playInBackground={false}
          />

          {/* View Counter Overlay */}
          <View style={styles.viewCounterOverlay}>
            <LinearGradient
              colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.3)']}
              style={styles.viewCounterGradient}
            >
              <Icon name="eye" size={16} color={colors.softWhite} />
              <Text style={styles.viewCounterOverlayText}>
                {viewStatus.views_left} {viewStatus.views_left === 1 ? 'просмотр' : 'просмотра'} осталось
              </Text>
            </LinearGradient>
          </View>

          {/* Play Button Overlay (when paused) */}
          {!playing && (
            <TouchableOpacity
              style={styles.playOverlay}
              onPress={handlePlay}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={metalGradients.platinum}
                style={styles.playButton}
              >
                <Icon name="play" size={48} color={colors.primaryBlack} />
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Privacy Notice */}
          <View style={styles.privacyNotice}>
            <Icon name="shield-lock" size={14} color={colors.liquidSilver} />
            <Text style={styles.privacyText}>
              Приватное видео • Защищено от скачивания
            </Text>
          </View>
        </>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.platinumSilver} />
          <Text style={styles.loadingText}>Подготовка видео...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.primaryBlack,
    borderRadius: sizes.radiusMedium,
    overflow: 'hidden',
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: sizes.md,
  },
  loadingText: {
    ...typography.caption,
    color: colors.liquidSilver,
  },
  blurContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: sizes.xl,
    gap: sizes.md,
  },
  errorTitle: {
    ...typography.h3,
    color: colors.softWhite,
    textAlign: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.liquidSilver,
    textAlign: 'center',
  },
  viewCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.sm,
    marginTop: sizes.md,
    paddingHorizontal: sizes.md,
    paddingVertical: sizes.sm,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: sizes.radiusMedium,
  },
  viewCounterText: {
    ...typography.caption,
    color: colors.liquidSilver,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  viewCounterOverlay: {
    position: 'absolute',
    top: sizes.sm,
    right: sizes.sm,
    borderRadius: sizes.radiusMedium,
    overflow: 'hidden',
  },
  viewCounterGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.xs,
    paddingHorizontal: sizes.md,
    paddingVertical: sizes.sm,
  },
  viewCounterOverlayText: {
    ...typography.caption,
    color: colors.softWhite,
    fontWeight: '600',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  privacyNotice: {
    position: 'absolute',
    bottom: sizes.sm,
    left: sizes.sm,
    right: sizes.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.xs,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: sizes.sm,
    paddingVertical: sizes.xs,
    borderRadius: sizes.radiusSmall,
  },
  privacyText: {
    ...typography.micro,
    color: colors.liquidSilver,
  },
});
