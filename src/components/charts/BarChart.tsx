/**
 * 360° РАБОТА - ULTRA EDITION
 * Bar Chart Component
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { colors, metalGradients, typography, sizes } from '@/constants';

interface BarChartProps {
  data: Array<{ label: string; value: number }>;
  maxValue?: number;
  height?: number;
  showValues?: boolean;
}

export function BarChart({
  data,
  maxValue,
  height = 200,
  showValues = true,
}: BarChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value));

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.barsContainer}>
        {data.map((item, index) => {
          const barHeight = (item.value / max) * (height - 60);

          return (
            <View key={index} style={styles.barWrapper}>
              <Animated.View
                entering={FadeInUp.delay(index * 100).duration(600)}
                style={[styles.barContainer, { height: barHeight }]}
              >
                <LinearGradient
                  colors={metalGradients.platinum}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.bar}
                >
                  {showValues && barHeight > 30 && (
                    <Text style={styles.barValue}>{item.value}</Text>
                  )}
                </LinearGradient>
              </Animated.View>
              <Text style={styles.label} numberOfLines={1}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: '100%',
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  barContainer: {
    width: '100%',
    justifyContent: 'flex-end',
    marginBottom: sizes.sm,
  },
  bar: {
    width: '100%',
    height: '100%',
    borderRadius: sizes.radiusSmall,
    alignItems: 'center',
    paddingTop: sizes.xs,
  },
  barValue: {
    ...typography.caption,
    color: colors.graphiteBlack,
    fontWeight: '600',
  },
  label: {
    ...typography.micro,
    color: colors.chromeSilver,
    textAlign: 'center',
    marginTop: sizes.xs,
  },
});
