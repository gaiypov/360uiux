/**
 * 360° РАБОТА - ULTRA EDITION
 * Pull to Refresh Component - Gesture Animation
 */

import React from 'react';
import { RefreshControl, RefreshControlProps } from 'react-native';
import { colors } from '@/constants';

interface PullToRefreshProps extends RefreshControlProps {
  refreshing: boolean;
  onRefresh: () => void;
}

export function PullToRefresh({
  refreshing,
  onRefresh,
  ...props
}: PullToRefreshProps) {
  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={colors.platinumSilver}
      colors={[colors.platinumSilver, colors.liquidSilver]}
      progressBackgroundColor={colors.carbonGray}
      {...props}
    />
  );
}
