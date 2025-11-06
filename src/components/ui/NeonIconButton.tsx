/**
 * 360° РАБОТА - ULTRA EDITION
 * Premium Icon Button Component
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, View, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, sizes } from '@/constants';

interface NeonIconButtonProps {
  icon: string;
  onPress: () => void;
  active?: boolean;
  size?: number;
  style?: ViewStyle;
  iconColor?: string;
}

export function NeonIconButton({
  icon,
  onPress,
  active = false,
  size = 24,
  style,
  iconColor,
}: NeonIconButtonProps) {
  const buttonSize = size * 2.33; // 56px for default 24px icon

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 },
        active && styles.active,
        style,
      ]}
      activeOpacity={0.7}
    >
      <Icon
        name={icon}
        size={size}
        color={iconColor || (active ? colors.platinumSilver : colors.chromeSilver)}
      />
      {active && (
        <View
          style={[
            styles.glowRing,
            {
              width: buttonSize + 8,
              height: buttonSize + 8,
              borderRadius: (buttonSize + 8) / 2,
            },
          ]}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.glassBackground,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  active: {
    backgroundColor: 'rgba(232, 232, 237, 0.12)',
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.platinumSilver,
    shadowColor: colors.platinumSilver,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    shadowOpacity: 0.4,
    elevation: 8,
  },
});
