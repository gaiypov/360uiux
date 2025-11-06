/**
 * 360° РАБОТА - ULTRA EDITION
 * Error View Component
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { GlassButton, GlassCard } from './';
import { colors, typography, sizes } from '@/constants';

interface ErrorViewProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryTitle?: string;
}

export function ErrorView({
  title = 'Что-то пошло не так',
  message = 'Произошла ошибка. Попробуйте еще раз.',
  onRetry,
  retryTitle = 'ПОВТОРИТЬ',
}: ErrorViewProps) {
  return (
    <Animated.View entering={FadeIn.duration(500)} style={styles.container}>
      <GlassCard style={styles.card}>
        <View style={styles.iconContainer}>
          <Icon name="alert-circle-outline" size={64} color={colors.error} />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        {onRetry && (
          <GlassButton
            title={retryTitle}
            variant="primary"
            onPress={onRetry}
            style={styles.button}
          />
        )}
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: sizes.lg,
  },
  card: {
    alignItems: 'center',
    paddingVertical: sizes.xl,
    maxWidth: 400,
  },
  iconContainer: {
    marginBottom: sizes.lg,
  },
  title: {
    ...typography.h2,
    fontSize: 22,
    color: colors.softWhite,
    textAlign: 'center',
    marginBottom: sizes.sm,
  },
  message: {
    ...typography.body,
    color: colors.liquidSilver,
    textAlign: 'center',
    marginBottom: sizes.lg,
  },
  button: {
    minWidth: 200,
  },
});
