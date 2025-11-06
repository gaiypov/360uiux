/**
 * 360° РАБОТА - ULTRA EDITION
 * Ultra Vacancy Card Component (TikTok-style)
 */

import React, { useRef, useEffect, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Video from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, metalGradients, glassVariants, typography, sizes } from '@/constants';
import { Vacancy } from '@/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PremiumVacancyCardProps {
  vacancy: Vacancy;
  isActive: boolean;
  onApply?: () => void;
  onCompanyPress?: () => void;
  onLike?: () => void;
  onComment?: () => void;
  onFavorite?: () => void;
  onShare?: () => void;
  onSoundPress?: () => void;
  isLiked?: boolean;
  isFavorited?: boolean;
}

const PremiumVacancyCardComponent = ({
  vacancy,
  isActive,
  onApply,
  onCompanyPress,
  onLike,
  onComment,
  onFavorite,
  onShare,
  onSoundPress,
  isLiked = false,
  isFavorited = false,
}: PremiumVacancyCardProps) => {
  const videoRef = useRef<Video>(null);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      videoRef.current?.seek(0);
      scale.value = withSpring(1, { damping: 15 });
    } else {
      scale.value = withSpring(0.95, { damping: 15 });
    }
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* Полноэкранное видео */}
      <Video
        ref={videoRef}
        source={{ uri: vacancy.videoUrl }}
        style={styles.video}
        resizeMode="cover"
        repeat
        paused={!isActive}
        muted={false}
      />

      {/* Темный градиент снизу */}
      <LinearGradient
        colors={['transparent', 'rgba(2,2,4,0.95)']}
        style={styles.bottomGradient}
      />

      {/* Glass Info Card */}
      <View style={styles.infoContainer}>
        <BlurView
          style={styles.glassCard}
          blurType="dark"
          blurAmount={glassVariants.dark.blur}
          reducedTransparencyFallbackColor={colors.graphiteBlack}
        >
          {/* Header с компанией */}
          <View style={styles.header}>
            <View style={styles.companyRow}>
              <View style={styles.companyIcon}>
                <Icon name="office-building" size={20} color={colors.platinumSilver} />
              </View>
              <Text style={styles.companyName}>
                {vacancy.employer.companyName}
              </Text>
              {vacancy.employer.verified && (
                <Icon name="check-decagram" size={16} color={colors.platinumSilver} />
              )}
            </View>
            <View style={styles.ratingBadge}>
              <Icon name="star" size={14} color={colors.platinumSilver} />
              <Text style={styles.rating}>{vacancy.employer.rating.toFixed(1)}</Text>
            </View>
          </View>

          {/* Профессия */}
          <Text style={styles.title} numberOfLines={2}>
            {vacancy.title}
          </Text>

          {/* Зарплата с metal gradient */}
          <View style={styles.salaryContainer}>
            <LinearGradient
              colors={metalGradients.platinum}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.salaryGradient}
            >
              <Text style={styles.salary}>
                от {vacancy.salaryMin.toLocaleString('ru-RU')} ₽
              </Text>
            </LinearGradient>
          </View>

          {/* Локация */}
          <View style={styles.locationRow}>
            <Icon name="map-marker" size={16} color={colors.liquidSilver} />
            <Text style={styles.location}>
              {vacancy.city}{vacancy.metro && ` • м. ${vacancy.metro}`}
            </Text>
          </View>

          {/* Benefits */}
          {vacancy.benefits.length > 0 && (
            <View style={styles.benefits}>
              {vacancy.benefits.slice(0, 3).map((benefit, index) => (
                <View key={index} style={styles.benefitChip}>
                  <Text style={styles.benefitText} numberOfLines={1}>
                    {benefit}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </BlurView>
      </View>

      {/* TikTok-style Side Actions (6 buttons) */}
      <View style={styles.sideActions}>
        {/* 1. Like */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onLike}
          activeOpacity={0.7}
        >
          <View style={styles.actionIconContainer}>
            <Icon
              name={isLiked ? 'heart' : 'heart-outline'}
              size={32}
              color={isLiked ? '#FF006E' : colors.softWhite}
            />
          </View>
          <Text style={styles.actionLabel}>{vacancy.applications}</Text>
        </TouchableOpacity>

        {/* 2. Comment */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onComment}
          activeOpacity={0.7}
        >
          <View style={styles.actionIconContainer}>
            <Icon name="comment-outline" size={30} color={colors.softWhite} />
          </View>
          <Text style={styles.actionLabel}>
            {vacancy.commentsCount || 0}
          </Text>
        </TouchableOpacity>

        {/* 3. Favorite/Bookmark */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onFavorite}
          activeOpacity={0.7}
        >
          <View style={styles.actionIconContainer}>
            <Icon
              name={isFavorited ? 'bookmark' : 'bookmark-outline'}
              size={30}
              color={isFavorited ? colors.platinumSilver : colors.softWhite}
            />
          </View>
        </TouchableOpacity>

        {/* 4. Share */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onShare}
          activeOpacity={0.7}
        >
          <View style={styles.actionIconContainer}>
            <Icon name="share-variant" size={28} color={colors.softWhite} />
          </View>
        </TouchableOpacity>

        {/* 5. Sound/Music */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onSoundPress}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconContainer, styles.soundIcon]}>
            <Icon name="music-note" size={24} color={colors.softWhite} />
          </View>
        </TouchableOpacity>

        {/* 6. Company Avatar */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onCompanyPress}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconContainer, styles.avatarContainer]}>
            <LinearGradient
              colors={metalGradients.platinum}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarGradient}
            >
              <Icon name="office-building" size={24} color={colors.graphiteBlack} />
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </View>

      {/* CTA Button с неоновым glow */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.8}
          onPress={onApply}
        >
          <LinearGradient
            colors={metalGradients.platinum}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Icon name="flash" size={20} color={colors.graphiteBlack} />
            <Text style={styles.ctaText}>В РАБОТУ</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// Memoized export with custom comparison
export const PremiumVacancyCard = memo(
  PremiumVacancyCardComponent,
  (prevProps, nextProps) => {
    // Only re-render if vacancy ID or isActive changes
    return (
      prevProps.vacancy.id === nextProps.vacancy.id &&
      prevProps.isActive === nextProps.isActive
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: colors.primaryBlack,
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.5,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 140,
    left: sizes.md,
    right: 100,
  },
  glassCard: {
    borderRadius: sizes.radiusXLarge,
    overflow: 'hidden',
    backgroundColor: glassVariants.dark.background,
    borderWidth: 1,
    borderColor: glassVariants.dark.border,
    padding: sizes.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: sizes.md,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: sizes.sm,
  },
  companyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(232, 232, 237, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyName: {
    ...typography.bodyMedium,
    color: colors.softWhite,
    flex: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(232, 232, 237, 0.15)',
    paddingHorizontal: sizes.sm,
    paddingVertical: 4,
    borderRadius: sizes.radiusSmall,
    gap: 4,
  },
  rating: {
    ...typography.caption,
    color: colors.platinumSilver,
    fontWeight: '600',
  },
  title: {
    ...typography.h2,
    color: colors.softWhite,
    marginBottom: sizes.sm,
  },
  salaryContainer: {
    alignSelf: 'flex-start',
    marginBottom: sizes.md,
    borderRadius: sizes.radiusMedium,
    overflow: 'hidden',
  },
  salaryGradient: {
    paddingHorizontal: sizes.md,
    paddingVertical: sizes.sm,
  },
  salary: {
    ...typography.numbers,
    color: colors.graphiteBlack,
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sizes.md,
  },
  location: {
    ...typography.body,
    color: colors.liquidSilver,
    marginLeft: 6,
  },
  benefits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: sizes.sm,
  },
  benefitChip: {
    backgroundColor: colors.carbonGray,
    borderRadius: sizes.radiusSmall,
    paddingHorizontal: sizes.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.steelGray,
  },
  benefitText: {
    ...typography.caption,
    color: colors.liquidSilver,
  },
  sideActions: {
    position: 'absolute',
    right: sizes.md,
    bottom: 180,
    gap: sizes.lg,
    paddingVertical: sizes.md,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  actionLabel: {
    ...typography.caption,
    fontSize: 12,
    color: colors.softWhite,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  soundIcon: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  avatarContainer: {
    padding: 0,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  avatarGradient: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.softWhite,
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 60,
    left: sizes.md,
    right: sizes.md,
  },
  ctaButton: {
    borderRadius: sizes.radiusMedium,
    overflow: 'hidden',
    shadowColor: colors.platinumSilver,
    shadowOffset: sizes.glowSoft.offset,
    shadowRadius: sizes.glowSoft.radius,
    shadowOpacity: sizes.glowSoft.opacity,
    elevation: 12,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sizes.lg,
    gap: sizes.sm,
  },
  ctaText: {
    ...typography.h3,
    color: colors.graphiteBlack,
    fontWeight: '700',
    letterSpacing: 2,
  },
});
