/**
 * 360° РАБОТА - MainFeedHeader Component
 * Header with logo and search button
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, sizes, typography } from '@/constants';

interface MainFeedHeaderProps {
  onSearchPress: () => void;
}

export function MainFeedHeader({ onSearchPress }: MainFeedHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      {/* Логотип */}
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>🎯</Text>
        <Text style={styles.title}>360° РАБОТА</Text>
      </View>

      {/* Кнопка поиска */}
      <TouchableOpacity
        onPress={onSearchPress}
        style={styles.searchButton}
        activeOpacity={0.7}
      >
        <Icon name="magnify" size={24} color={colors.softWhite} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: sizes.md,
    paddingBottom: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Полупрозрачный
    zIndex: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontSize: 28,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.softWhite,
    letterSpacing: 0.5,
  },
  searchButton: {
    padding: 8,
    borderRadius: 20,
  },
});
