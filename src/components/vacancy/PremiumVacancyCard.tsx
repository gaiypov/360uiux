/**
 * 360° РАБОТА - Revolut Ultra Edition
 * Premium Vacancy Card Component (TikTok-style)
 */

import React, { useRef, useEffect } from 'react';
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
import { colors, typography, sizes } from '@/constants';
import { Vacancy } from '@/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PremiumVacancyCardProps {
  vacancy: Vacancy;
  isActive: boolean;
  onApply?: () => void;
  onCompanyPress?: () => void;
  onLike?: () => void;
  onShare?: () => void;
}

export function PremiumVacancyCard({
  vacancy,
  isActive,
  onApply,
  onCompanyPress,
  onLike,
  onShare,
}: PremiumVacancyCardProps) {
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
        colors={['transparent', 'rgba(5,5,5,0.9)']}
        style={styles.bottomGradient}
      />

      {/* Glass Info Card */}
      <View style={styles.infoContainer}>
        <BlurView
          style={styles.glassCard}
          blurType="dark"
          blurAmount={12}
          reducedTransparencyFallbackColor={colors.graphiteGray}
        >
          {/* Header с компанией */}
          <View style={styles.header}>
            <View style={styles.companyRow}>
              <View style={styles.companyIcon}>
                <Icon name="office-building" size={20} color={colors.ultraViolet} />
              </View>
              <Text style={styles.companyName}>
                {vacancy.employer.companyName}
              </Text>
              {vacancy.employer.verified && (
                <Icon name="check-decagram" size={16} color={colors.cyberBlue} />
              )}
            </View>
            <View style={styles.ratingBadge}>
              <Icon name="star" size={14} color={colors.cyberBlue} />
              <Text style={styles.rating}>{vacancy.employer.rating.toFixed(1)}</Text>
            </View>
          </View>

          {/* Профессия */}
          <Text style={styles.title} numberOfLines={2}>
            {vacancy.title}
          </Text>

          {/* Зарплата с неоновым акцентом */}
          <View style={styles.salaryContainer}>
            <LinearGradient
              colors={[colors.ultraViolet, colors.cyberBlue]}
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

      {/* Боковая панель действий */}
      <View style={styles.sideActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onCompanyPress}
          activeOpacity={0.7}
        >
          <View style={styles.actionIconContainer}>
            <Icon name="office-building" size={28} color={colors.softWhite} />
          </View>
          <Text style={styles.actionLabel}>Компания</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onLike}
          activeOpacity={0.7}
        >
          <View style={styles.actionIconContainer}>
            <Icon name="heart-outline" size={28} color={colors.softWhite} />
          </View>
          <Text style={styles.actionLabel}>{vacancy.applications}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onShare}
          activeOpacity={0.7}
        >
          <View style={styles.actionIconContainer}>
            <Icon name="share-variant" size={28} color={colors.softWhite} />
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
            colors={[colors.ultraViolet, colors.cyberBlue]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Icon name="flash" size={20} color={colors.softWhite} />
            <Text style={styles.ctaText}>В РАБОТУ</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

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
    backgroundColor: colors.glassBackground,
    borderWidth: 1,
    borderColor: colors.glassBorder,
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
    backgroundColor: 'rgba(142, 127, 255, 0.2)',
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
    backgroundColor: 'rgba(57, 224, 248, 0.15)',
    paddingHorizontal: sizes.sm,
    paddingVertical: 4,
    borderRadius: sizes.radiusSmall,
    gap: 4,
  },
  rating: {
    ...typography.caption,
    color: colors.cyberBlue,
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
    color: colors.softWhite,
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
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: sizes.radiusSmall,
    paddingHorizontal: sizes.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  benefitText: {
    ...typography.caption,
    color: colors.liquidSilver,
  },
  sideActions: {
    position: 'absolute',
    right: sizes.md,
    bottom: 240,
    gap: sizes.xl,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    ...typography.caption,
    color: colors.liquidSilver,
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
    shadowColor: colors.ultraViolet,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 24,
    shadowOpacity: 0.5,
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
    color: colors.softWhite,
    fontWeight: '700',
    letterSpacing: 2,
  },
});
