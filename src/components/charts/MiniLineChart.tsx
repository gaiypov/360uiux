/**
 * 360° РАБОТА - ULTRA EDITION
 * Mini Line Chart Component (Premium Style)
 * Optimized with React.memo
 */

import React, { memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { colors } from '@/constants';

interface MiniLineChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

const MiniLineChartComponent = ({
  data,
  width = Dimensions.get('window').width - 64,
  height = 120,
  color = colors.platinumSilver,
}: MiniLineChartProps) => {
  if (data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return { x, y };
  });

  // Create smooth path using quadratic curves
  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const controlX = (current.x + next.x) / 2;

    path += ` Q ${controlX} ${current.y}, ${next.x} ${next.y}`;
  }

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        <Defs>
          <SvgGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={colors.platinumSilver} stopOpacity="1" />
            <Stop offset="1" stopColor={colors.liquidSilver} stopOpacity="1" />
          </SvgGradient>
        </Defs>
        <Path
          d={path}
          stroke="url(#lineGradient)"
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
};

/**
 * Memoized export - prevents re-renders when data doesn't change
 */
export const MiniLineChart = memo(MiniLineChartComponent);

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
