/**
 * 360° РАБОТА - ULTRA EDITION
 * Empty State Component
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { GlassButton } from './GlassButton';
import { colors, typography, sizes } from '@/constants';

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  actionTitle?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionTitle,
  onAction,
}: EmptyStateProps) {
  return (
    <Animated.View entering={FadeIn.duration(500)} style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon name={icon} size={64} color={colors.liquidSilver} />
      </View>

      <Text style={styles.title}>{title}</Text>

      {description && <Text style={styles.description}>{description}</Text>}

      {actionTitle && onAction && (
        <GlassButton
          title={actionTitle}
          variant="secondary"
          onPress={onAction}
          style={styles.button}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: sizes.xl,
    paddingVertical: sizes.xxl * 2,
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
  description: {
    ...typography.body,
    color: colors.liquidSilver,
    textAlign: 'center',
    marginBottom: sizes.lg,
  },
  button: {
    marginTop: sizes.md,
    minWidth: 200,
  },
});
