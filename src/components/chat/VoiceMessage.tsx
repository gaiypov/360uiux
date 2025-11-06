/**
 * 360° РАБОТА - Voice Message Component
 * Voice messages with waveform visualization
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { colors, typography, sizes } from '@/constants';
import { haptics } from '@/utils/haptics';

const audioRecorderPlayer = new AudioRecorderPlayer();

interface VoiceMessageProps {
  audioUrl: string;
  duration: number; // in seconds
  waveform?: number[]; // Array of amplitudes [0.2, 0.5, 0.8, ...]
  isSender: boolean;
}

export function VoiceMessage({
  audioUrl,
  duration,
  waveform = [],
  isSender,
}: VoiceMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [currentDuration, setCurrentDuration] = useState(duration * 1000); // convert to ms

  // Animation value for playing indicator
  const playingScale = useSharedValue(1);

  useEffect(() => {
    // Subscribe to playback updates
    audioRecorderPlayer.addPlayBackListener((e) => {
      setCurrentPosition(e.currentPosition);
      setCurrentDuration(e.duration);

      // Check if playback finished
      if (e.currentPosition >= e.duration && e.duration > 0) {
        stopPlayback();
      }
    });

    return () => {
      // Cleanup
      audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      // Animate playing indicator
      playingScale.value = withRepeat(
        withTiming(1.2, { duration: 500 }),
        -1,
        true
      );
    } else {
      playingScale.value = withTiming(1, { duration: 200 });
    }
  }, [isPlaying]);

  const handlePlay = async () => {
    try {
      haptics.light();

      if (isPlaying) {
        // Pause
        await audioRecorderPlayer.pausePlayer();
        setIsPlaying(false);
      } else {
        // Play
        setIsLoading(true);

        // Check if we're resuming or starting fresh
        if (currentPosition > 0 && currentPosition < currentDuration) {
          // Resume
          await audioRecorderPlayer.resumePlayer();
        } else {
          // Start from beginning
          await audioRecorderPlayer.startPlayer(audioUrl);
        }

        setIsPlaying(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsLoading(false);
      Alert.alert('Ошибка', 'Не удалось воспроизвести аудио');
    }
  };

  const stopPlayback = async () => {
    await audioRecorderPlayer.stopPlayer();
    setIsPlaying(false);
    setCurrentPosition(0);
  };

  // Format time
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercentage =
    currentDuration > 0 ? (currentPosition / currentDuration) * 100 : 0;

  // Animated style for playing indicator
  const playingIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playingScale.value }],
  }));

  return (
    <View style={[styles.container, isSender && styles.senderContainer]}>
      {/* Play/Pause Button */}
      <TouchableOpacity
        style={[styles.playButton, isSender && styles.senderPlayButton]}
        onPress={handlePlay}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Icon
              name={isPlaying ? 'pause' : 'play'}
              size={24}
              color="#fff"
            />
            {isPlaying && (
              <Animated.View
                style={[styles.playingIndicator, playingIndicatorStyle]}
              />
            )}
          </>
        )}
      </TouchableOpacity>

      {/* Waveform and Time */}
      <View style={styles.contentContainer}>
        {/* Waveform */}
        <View style={styles.waveformContainer}>
          {waveform.length > 0 ? (
            <Waveform
              waveform={waveform}
              progress={progressPercentage}
              color={isSender ? colors.primary : colors.chromeSilver}
            />
          ) : (
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progressPercentage}%`,
                    backgroundColor: isSender ? colors.primary : colors.chromeSilver,
                  },
                ]}
              />
            </View>
          )}
        </View>

        {/* Time */}
        <Text style={[styles.timeText, isSender && styles.senderTimeText]}>
          {isPlaying
            ? formatTime(currentPosition)
            : formatTime(duration * 1000)}
        </Text>
      </View>

      {/* Microphone icon for sender */}
      {isSender && (
        <View style={styles.micIcon}>
          <Icon name="microphone" size={16} color={colors.textSecondary} />
        </View>
      )}
    </View>
  );
}

// Waveform visualization component
function Waveform({
  waveform,
  progress,
  color,
}: {
  waveform: number[];
  progress: number;
  color: string;
}) {
  const maxBars = 40;
  const bars = waveform.slice(0, maxBars);

  return (
    <View style={styles.waveform}>
      {bars.map((amplitude, index) => {
        const height = Math.max(amplitude * 100, 10); // Min height 10%
        const isPlayed = (index / bars.length) * 100 < progress;

        return (
          <View
            key={index}
            style={[
              styles.waveformBar,
              {
                height: `${height}%`,
                backgroundColor: isPlayed ? color : colors.textTertiary,
                opacity: isPlayed ? 1 : 0.3,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: sizes.radiusMedium,
    padding: sizes.sm,
    maxWidth: '75%',
    gap: sizes.sm,
  },
  senderContainer: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primaryLight,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.chromeSilver,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  senderPlayButton: {
    backgroundColor: colors.primary,
  },
  playingIndicator: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  contentContainer: {
    flex: 1,
    gap: 4,
  },
  waveformContainer: {
    height: 30,
    justifyContent: 'center',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    gap: 2,
  },
  waveformBar: {
    flex: 1,
    borderRadius: 2,
    minHeight: 4,
  },
  progressBar: {
    height: 3,
    backgroundColor: colors.textTertiary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  timeText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  senderTimeText: {
    color: colors.text,
  },
  micIcon: {
    marginLeft: sizes.xs,
  },
});
