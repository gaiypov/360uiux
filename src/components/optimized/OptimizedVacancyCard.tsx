/**
 * 360° РАБОТА - Optimized Vacancy Card
 * With React.memo and performance optimizations
 */

import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography, sizes } from '@/constants';

interface OptimizedVacancyCardProps {
  vacancy: {
    id: string;
    title: string;
    company_name: string;
    city: string;
    salary_min: number;
    salary_max: number;
    description: string;
    logo_url?: string;
  };
  onPress?: (id: string) => void;
  onLike?: (id: string) => void;
  onShare?: (id: string) => void;
  isLiked?: boolean;
}

// Memoized component - only re-renders when props change
export const OptimizedVacancyCard = React.memo<OptimizedVacancyCardProps>(
  ({ vacancy, onPress, onLike, onShare, isLiked }) => {
    // Memoize formatted salary to avoid recalculation
    const formattedSalary = useMemo(() => {
      const min = vacancy.salary_min.toLocaleString('ru-RU');
      const max = vacancy.salary_max.toLocaleString('ru-RU');
      return `${min} - ${max} ₽`;
    }, [vacancy.salary_min, vacancy.salary_max]);

    // Memoize description preview
    const descriptionPreview = useMemo(() => {
      return vacancy.description.length > 100
        ? vacancy.description.substring(0, 100) + '...'
        : vacancy.description;
    }, [vacancy.description]);

    // Callback handlers to prevent re-creation on every render
    const handlePress = useCallback(() => {
      onPress?.(vacancy.id);
    }, [onPress, vacancy.id]);

    const handleLike = useCallback(() => {
      onLike?.(vacancy.id);
    }, [onLike, vacancy.id]);

    const handleShare = useCallback(() => {
      onShare?.(vacancy.id);
    }, [onShare, vacancy.id]);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <View style={styles.header}>
          {/* Company Logo */}
          {vacancy.logo_url ? (
            <FastImage
              source={{ uri: vacancy.logo_url }}
              style={styles.logo}
              resizeMode={FastImage.resizeMode.cover}
            />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Icon name="office-building" size={24} color={colors.platinumSilver} />
            </View>
          )}

          {/* Company Info */}
          <View style={styles.companyInfo}>
            <Text style={styles.title} numberOfLines={1}>
              {vacancy.title}
            </Text>
            <Text style={styles.company} numberOfLines={1}>
              {vacancy.company_name}
            </Text>
          </View>

          {/* Like Button */}
          <TouchableOpacity
            style={styles.likeButton}
            onPress={handleLike}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon
              name={isLiked ? 'heart' : 'heart-outline'}
              size={24}
              color={isLiked ? '#FF453A' : colors.chromeSilver}
            />
          </TouchableOpacity>
        </View>

        {/* Details */}
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Icon name="map-marker" size={16} color={colors.chromeSilver} />
            <Text style={styles.detailText}>{vacancy.city}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="cash" size={16} color={colors.chromeSilver} />
            <Text style={styles.detailText}>{formattedSalary}</Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.description} numberOfLines={2}>
          {descriptionPreview}
        </Text>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handlePress}>
            <Icon name="eye" size={20} color={colors.platinumSilver} />
            <Text style={styles.actionText}>Подробнее</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Icon name="share-variant" size={20} color={colors.platinumSilver} />
            <Text style={styles.actionText}>Поделиться</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  },
  // Custom comparison function for better control
  (prevProps, nextProps) => {
    return (
      prevProps.vacancy.id === nextProps.vacancy.id &&
      prevProps.isLiked === nextProps.isLiked &&
      prevProps.vacancy.title === nextProps.vacancy.title &&
      prevProps.vacancy.salary_min === nextProps.vacancy.salary_min &&
      prevProps.vacancy.salary_max === nextProps.vacancy.salary_max
    );
  }
);

OptimizedVacancyCard.displayName = 'OptimizedVacancyCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(28, 28, 30, 0.7)',
    borderRadius: sizes.radiusLarge,
    padding: sizes.md,
    marginBottom: sizes.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sizes.md,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.carbonGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyInfo: {
    flex: 1,
    marginLeft: sizes.sm,
  },
  title: {
    ...typography.bodyMedium,
    color: colors.softWhite,
    marginBottom: 4,
  },
  company: {
    ...typography.caption,
    color: colors.chromeSilver,
  },
  likeButton: {
    padding: sizes.xs,
  },
  details: {
    flexDirection: 'row',
    gap: sizes.md,
    marginBottom: sizes.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    ...typography.caption,
    color: colors.chromeSilver,
  },
  description: {
    ...typography.body,
    color: colors.liquidSilver,
    marginBottom: sizes.md,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: sizes.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sizes.xs,
    paddingVertical: sizes.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: sizes.radiusMedium,
  },
  actionText: {
    ...typography.caption,
    color: colors.platinumSilver,
    fontWeight: '600',
  },
});
