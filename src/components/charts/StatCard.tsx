/**
 * 360° РАБОТА - Revolut Ultra Edition
 * Stat Card Component
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GlassCard } from '@/components/ui';
import { colors, typography, sizes } from '@/constants';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down';
  index?: number;
}

export function StatCard({
  icon,
  label,
  value,
  change,
  trend,
  index = 0,
}: StatCardProps) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
      <GlassCard style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Icon name={icon} size={24} color={colors.ultraViolet} />
          </View>
          {change !== undefined && (
            <View
              style={[
                styles.changeBadge,
                {
                  backgroundColor:
                    trend === 'up'
                      ? 'rgba(0, 214, 111, 0.15)'
                      : 'rgba(255, 71, 87, 0.15)',
                },
              ]}
            >
              <Icon
                name={trend === 'up' ? 'trending-up' : 'trending-down'}
                size={14}
                color={trend === 'up' ? colors.success : colors.error}
              />
              <Text
                style={[
                  styles.changeText,
                  { color: trend === 'up' ? colors.success : colors.error },
                ]}
              >
                {Math.abs(change)}%
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: sizes.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(142, 127, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: sizes.sm,
    paddingVertical: 4,
    borderRadius: sizes.radiusSmall,
  },
  changeText: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 12,
  },
  label: {
    ...typography.caption,
    color: colors.liquidSilver,
    marginBottom: sizes.xs,
  },
  value: {
    ...typography.h1,
    fontSize: 32,
    color: colors.softWhite,
  },
});
