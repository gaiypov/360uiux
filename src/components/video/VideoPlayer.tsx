/**
 * 360° РАБОТА - ULTRA EDITION
 * Optimized Video Player Component
 *
 * Features:
 * - Expo-av for full Expo compatibility
 * - Smart preloading (N+1 while playing N)
 * - Memory cleanup (unload when not needed)
 * - Sound isolation (only active video plays sound)
 * - Optimized re-renders with React.memo
 */

import React, { useRef, useEffect, useState, useCallback, memo } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { colors } from '@/constants';

interface VideoPlayerProps {
  videoUrl: string;
  isActive: boolean;
  shouldPreload?: boolean;
  shouldRender?: boolean;
  onLoad?: () => void;
  onError?: (error: string) => void;
  testID?: string;
}

/**
 * Video Player Component with smart loading and memory management
 */
const VideoPlayerComponent = ({
  videoUrl,
  isActive,
  shouldPreload = false,
  shouldRender = true,
  onLoad,
  onError,
  testID,
}: VideoPlayerProps) => {
  const videoRef = useRef<Video>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  /**
   * Load and configure video when component mounts or when preload is triggered
   * FIX: Added isCancelled flag to prevent race conditions and state updates on unmounted component
   */
  useEffect(() => {
    let isCancelled = false;

    if (!shouldRender) {
      // Unload video to free memory
      if (videoRef.current && isLoaded) {
        videoRef.current.unloadAsync().catch((e) => {
          console.warn('Error unloading video:', e);
        });
        if (!isCancelled) {
          setIsLoaded(false);
        }
      }
      return;
    }

    // Load video if should render
    const loadVideo = async () => {
      if (!videoRef.current || isLoaded || isCancelled) return;

      try {
        if (!isCancelled) {
          setIsLoading(true);
          setHasError(false);
        }

        // Load the video with initial configuration
        await videoRef.current.loadAsync(
          { uri: videoUrl },
          {
            shouldPlay: false, // Don't autoplay, wait for isActive
            isLooping: true,
            isMuted: !isActive, // Mute if not active (sound isolation)
            volume: isActive ? 1.0 : 0.0,
            progressUpdateIntervalMillis: 500,
          },
          false // Don't download to cache immediately
        );

        // Only update state if component is still mounted
        if (!isCancelled) {
          setIsLoaded(true);
          setIsLoading(false);
          onLoad?.();
          console.log(`✅ Video loaded: ${videoUrl.substring(0, 50)}...`);
        }
      } catch (error) {
        // Only update state if component is still mounted
        if (!isCancelled) {
          console.error('❌ Error loading video:', error);
          setHasError(true);
          setIsLoading(false);
          onError?.(error instanceof Error ? error.message : 'Unknown error');
        }
      }
    };

    loadVideo();

    // Cleanup: Cancel any pending state updates if effect re-runs or component unmounts
    return () => {
      isCancelled = true;
    };
  }, [videoUrl, shouldRender, isLoaded, onLoad, onError, isActive]);

  /**
   * Control playback based on isActive state
   * FIX: Added isCancelled flag to prevent race conditions when rapidly changing isActive
   */
  useEffect(() => {
    if (!videoRef.current || !isLoaded) return;

    let isCancelled = false;

    const updatePlayback = async () => {
      // Check if still valid before async operations
      if (isCancelled || !videoRef.current) return;

      try {
        if (isActive) {
          // Active video: play with sound from beginning
          if (!isCancelled) await videoRef.current!.setIsMutedAsync(false);
          if (!isCancelled) await videoRef.current!.setVolumeAsync(1.0);
          if (!isCancelled) await videoRef.current!.setPositionAsync(0);
          if (!isCancelled) await videoRef.current!.playAsync();
          if (!isCancelled) console.log('▶️  Video playing (active)');
        } else {
          // Inactive video: pause and mute (sound isolation)
          if (!isCancelled) await videoRef.current!.pauseAsync();
          if (!isCancelled) await videoRef.current!.setIsMutedAsync(true);
          if (!isCancelled) await videoRef.current!.setVolumeAsync(0.0);
          if (!isCancelled) console.log('⏸️  Video paused (inactive)');
        }
      } catch (error) {
        if (!isCancelled) {
          console.warn('Error updating playback state:', error);
        }
      }
    };

    updatePlayback();

    // Cleanup: Cancel pending operations if isActive changes or component unmounts
    return () => {
      isCancelled = true;
    };
  }, [isActive, isLoaded]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (videoRef.current && isLoaded) {
        videoRef.current.unloadAsync().catch((e) => {
          console.warn('Error unloading video on unmount:', e);
        });
      }
    };
  }, [isLoaded]);

  /**
   * Handle playback status updates
   */
  const handlePlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      // Video is loaded and ready
      if (status.didJustFinish && isActive) {
        // Loop completed - replay will happen automatically due to isLooping: true
        console.log('🔄 Video loop completed');
      }

      if (status.isBuffering) {
        setIsLoading(true);
      } else {
        setIsLoading(false);
      }
    } else {
      // Video is not loaded or encountered an error
      if (status.error) {
        console.error('❌ Video playback error:', status.error);
        setHasError(true);
        setIsLoading(false);
        onError?.(status.error);
      }
    }
  }, [isActive, onError]);

  // Don't render if not in viewport window
  if (!shouldRender) {
    return null;
  }

  return (
    <View style={styles.container} testID={testID}>
      {/* Video Component */}
      <Video
        ref={videoRef}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        useNativeControls={false}
        shouldPlay={false} // Controlled by useEffect
      />

      {/* Loading Indicator */}
      {isLoading && !hasError && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.platinumSilver} />
        </View>
      )}

      {/* Error State */}
      {hasError && (
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <ActivityIndicator size="small" color={colors.liquidSilver} />
          </View>
        </View>
      )}
    </View>
  );
};

/**
 * Memoized export with optimized comparison
 * Only re-render when these props change:
 * - videoUrl (new video)
 * - isActive (playback state)
 * - shouldPreload (preload trigger)
 * - shouldRender (visibility in viewport)
 */
export const VideoPlayer = memo(
  VideoPlayerComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.videoUrl === nextProps.videoUrl &&
      prevProps.isActive === nextProps.isActive &&
      prevProps.shouldPreload === nextProps.shouldPreload &&
      prevProps.shouldRender === nextProps.shouldRender
    );
  }
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primaryBlack,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 2, 4, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primaryBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
