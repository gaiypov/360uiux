/**
 * 360° РАБОТА - ULTRA EDITION
 * Pie Chart Component (Donut Style)
 * Optimized with React.memo
 */

import React, { memo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, typography, sizes } from '@/constants';

interface PieChartProps {
  data: Array<{ label: string; value: number; color: string }>;
  size?: number;
  strokeWidth?: number;
  showLegend?: boolean;
}

const PieChartComponent = ({
  data,
  size = 160,
  strokeWidth = 32,
  showLegend = true,
}: PieChartProps) => {
  const radius = (size - strokeWidth) / 2;
  const circleCircumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, item) => sum + item.value, 0);

  let currentAngle = -90; // Start from top

  const segments = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const strokeDashoffset = circleCircumference - (circleCircumference * percentage) / 100;
    const angle = currentAngle;
    currentAngle += (percentage / 100) * 360;

    return {
      ...item,
      percentage,
      strokeDashoffset,
      rotation: angle,
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(600)}>
        <Svg width={size} height={size}>
          <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
            {/* Background circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={colors.carbonGray}
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Data segments */}
            {segments.map((segment, index) => (
              <G key={index} rotation={segment.rotation} origin={`${size / 2}, ${size / 2}`}>
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={segment.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circleCircumference}
                  strokeDashoffset={segment.strokeDashoffset}
                  fill="none"
                  strokeLinecap="round"
                />
              </G>
            ))}
          </G>
        </Svg>

        {/* Center total */}
        <View style={[styles.centerLabel, { width: size, height: size }]}>
          <Text style={styles.totalValue}>{total}</Text>
          <Text style={styles.totalLabel}>Всего</Text>
        </View>
      </Animated.View>

      {/* Legend */}
      {showLegend && (
        <View style={styles.legend}>
          {segments.map((segment, index) => (
            <Animated.View
              key={index}
              entering={FadeIn.delay(index * 100).duration(400)}
              style={styles.legendItem}
            >
              <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
              <Text style={styles.legendLabel}>{segment.label}</Text>
              <Text style={styles.legendValue}>
                {segment.value} ({segment.percentage.toFixed(0)}%)
              </Text>
            </Animated.View>
          ))}
        </View>
      )}
    </View>
  );
};

/**
 * Memoized export - prevents re-renders when data doesn't change
 */
export const PieChart = memo(PieChartComponent);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalValue: {
    ...typography.numbersLarge,
    color: colors.softWhite,
  },
  totalLabel: {
    ...typography.caption,
    color: colors.chromeSilver,
  },
  legend: {
    marginTop: sizes.lg,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sizes.sm,
    paddingHorizontal: sizes.md,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: sizes.sm,
  },
  legendLabel: {
    ...typography.body,
    color: colors.chromeSilver,
    flex: 1,
  },
  legendValue: {
    ...typography.bodyMedium,
    color: colors.softWhite,
  },
});
