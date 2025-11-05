/**
 * 360° РАБОТА - ULTRA EDITION
 * Metal Icon Component with Premium Gradients
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { metalGradients, colors, sizes } from '@/constants';

type MetalVariant = 'platinum' | 'chrome' | 'steel' | 'carbon' | 'obsidian';
type MetalSize = 'small' | 'medium' | 'large' | 'xlarge';

interface MetalIconProps {
  name: string;
  variant?: MetalVariant;
  size?: MetalSize;
  glow?: boolean;
  style?: ViewStyle;
}

const SIZE_MAP = {
  small: {
    container: 40,
    icon: 20,
  },
  medium: {
    container: 56,
    icon: 28,
  },
  large: {
    container: 72,
    icon: 36,
  },
  xlarge: {
    container: 96,
    icon: 48,
  },
};

export function MetalIcon({
  name,
  variant = 'chrome',
  size = 'medium',
  glow = true,
  style,
}: MetalIconProps) {
  const dimensions = SIZE_MAP[size];
  const gradient = metalGradients[variant];

  return (
    <View style={[styles.wrapper, style]}>
      {/* Glowing ring */}
      {glow && (
        <View
          style={[
            styles.glowRing,
            {
              width: dimensions.container + 8,
              height: dimensions.container + 8,
              borderRadius: (dimensions.container + 8) / 2,
            },
          ]}
        />
      )}

      {/* Metal gradient container */}
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.container,
          {
            width: dimensions.container,
            height: dimensions.container,
            borderRadius: dimensions.container / 2,
          },
        ]}
      >
        {/* Dark overlay for icon contrast */}
        <View style={styles.iconBackground}>
          <Icon
            name={name}
            size={dimensions.icon}
            color={variant === 'platinum' || variant === 'chrome' ? colors.graphiteBlack : colors.softWhite}
          />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    backgroundColor: colors.platinumSilver,
    opacity: 0.15,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconBackground: {
    width: '70%',
    height: '70%',
    borderRadius: 9999,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
