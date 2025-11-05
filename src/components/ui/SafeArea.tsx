/**
 * 360° РАБОТА - ULTRA EDITION
 * SafeArea Component for Android
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { getStatusBarHeight, isAndroid } from '@/utils/platform';

interface SafeAreaProps {
  children: React.ReactNode;
  style?: ViewStyle;
  top?: boolean;
  bottom?: boolean;
}

export function SafeArea({ children, style, top = true, bottom = true }: SafeAreaProps) {
  const statusBarHeight = getStatusBarHeight();

  const containerStyle = [
    styles.container,
    top && isAndroid && { paddingTop: statusBarHeight },
    bottom && isAndroid && { paddingBottom: 16 },
    style,
  ];

  return <View style={containerStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
