/**
 * 360° РАБОТА - ULTRA EDITION
 * Video Player Screen
 * Просмотр видео
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import Slider from '@react-native-community/slider';
import { colors, typography, sizes } from '@/constants';
import { haptics } from '@/utils/haptics';

interface Props {
  route: {
    params: {
      videoUrl: string;
      title?: string;
      thumbnail?: string;
      type?: 'vacancy' | 'resume';
    };
  };
  navigation: any;
}

export function VideoPlayerScreen({ route, navigation }: Props) {
  const { videoUrl, title, type } = route.params;

  const videoRef = useRef<Video>(null);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  /**
   * Форматировать время
   */
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Переключить паузу
   */
  const togglePause = () => {
    haptics.light();
    setPaused(!paused);
  };

  /**
   * Показать/скрыть контролы
   */
  const toggleControls = () => {
    setControlsVisible(!controlsVisible);
  };

  /**
   * Перемотка
   */
  const handleSeek = (value: number) => {
    videoRef.current?.seek(value);
  };

  /**
   * Обработка загрузки
   */
  const handleLoad = (data: any) => {
    setDuration(data.duration);
    setLoading(false);
  };

  /**
   * Обработка прогресса
   */
  const handleProgress = (data: any) => {
    setCurrentTime(data.currentTime);
  };

  /**
   * Обработка окончания
   */
  const handleEnd = () => {
    setPaused(true);
    videoRef.current?.seek(0);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
        hidden={fullscreen}
      />

      {/* Video Player */}
      <TouchableOpacity
        style={styles.videoContainer}
        activeOpacity={1}
        onPress={toggleControls}
      >
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          style={styles.video}
          paused={paused}
          resizeMode="contain"
          onLoad={handleLoad}
          onProgress={handleProgress}
          onEnd={handleEnd}
          onError={(error) => {
            console.error('Video error:', error);
            setLoading(false);
          }}
        />

        {/* Loading */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.platinumSilver} />
            <Text style={styles.loadingText}>Загрузка видео...</Text>
          </View>
        )}

        {/* Controls Overlay */}
        {controlsVisible && !loading && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.controlsOverlay}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Icon name="arrow-left" size={28} color={colors.softWhite} />
              </TouchableOpacity>

              {title && <Text style={styles.titleText}>{title}</Text>}

              <View style={styles.placeholder} />
            </View>

            {/* Play/Pause Center Button */}
            <View style={styles.centerControls}>
              <TouchableOpacity onPress={togglePause} style={styles.playButton}>
                <Icon
                  name={paused ? 'play-circle' : 'pause-circle'}
                  size={80}
                  color={colors.softWhite}
                />
              </TouchableOpacity>
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={duration}
                  value={currentTime}
                  onSlidingComplete={handleSeek}
                  minimumTrackTintColor={colors.platinumSilver}
                  maximumTrackTintColor={colors.slateGray}
                  thumbTintColor={colors.platinumSilver}
                />
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  onPress={() => {
                    const newTime = Math.max(0, currentTime - 10);
                    handleSeek(newTime);
                  }}
                  style={styles.actionButton}
                >
                  <Icon name="rewind-10" size={32} color={colors.softWhite} />
                </TouchableOpacity>

                <TouchableOpacity onPress={togglePause} style={styles.actionButton}>
                  <Icon
                    name={paused ? 'play' : 'pause'}
                    size={40}
                    color={colors.softWhite}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    const newTime = Math.min(duration, currentTime + 10);
                    handleSeek(newTime);
                  }}
                  style={styles.actionButton}
                >
                  <Icon name="fast-forward-10" size={32} color={colors.softWhite} />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBlack,
  },
  videoContainer: {
    flex: 1,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primaryBlack,
    alignItems: 'center',
    justifyContent: 'center',
    gap: sizes.lg,
  },
  loadingText: {
    ...typography.body,
    color: colors.chromeSilver,
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sizes.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: sizes.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    ...typography.h3,
    color: colors.softWhite,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: sizes.md,
  },
  placeholder: {
    width: 44,
  },
  centerControls: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    opacity: 0.9,
  },
  bottomControls: {
    paddingHorizontal: sizes.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    gap: sizes.md,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.sm,
  },
  timeText: {
    ...typography.caption,
    color: colors.softWhite,
    minWidth: 40,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sizes.xxl,
  },
  actionButton: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
