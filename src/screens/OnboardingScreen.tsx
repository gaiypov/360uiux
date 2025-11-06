/**
 * 360° РАБОТА - ULTRA EDITION
 * Onboarding Screen - TikTok Format с дизайном Revolut Ultra
 * 3 слайда перед главной страницей (без регистрации)
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { GlassCard } from '@/components/ui';
import { colors, metalGradients, typography, sizes } from '@/constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingScreenProps {
  navigation: any;
}

const slides = [
  {
    id: '1',
    icon: 'video',
    emoji: '📹',
    gradient: metalGradients.platinum,
    title: 'Это TikTok для работы!',
    description: 'Смотри короткие видео-вакансии от реальных работодателей',
    features: [
      { icon: 'video-check', text: 'Короткие видео 30-180 сек' },
      { icon: 'eye', text: 'Смотри компанию изнутри' },
      { icon: 'thumb-up', text: 'Лайкай и сохраняй' },
    ],
  },
  {
    id: '2',
    icon: 'movie-open',
    emoji: '🎬',
    gradient: metalGradients.chrome,
    title: 'Новый формат поиска',
    description: 'Видео показывает настоящее место работы и атмосферу',
    features: [
      { icon: 'office-building', text: 'Реальное место работы' },
      { icon: 'account-group', text: 'Познакомься с командой' },
      { icon: 'briefcase', text: 'Узнай об атмосфере' },
    ],
  },
  {
    id: '3',
    icon: 'lightning-bolt',
    emoji: '⚡',
    gradient: metalGradients.platinum,
    title: 'Найди работу за минуты',
    description: 'Откликайся одним касанием\nОбщайся с работодателем напрямую',
    features: [
      { icon: 'gesture-swipe-left', text: 'Свайп для отклика' },
      { icon: 'message-text', text: 'Прямой чат с работодателем' },
      { icon: 'video-account', text: 'Твоё видео-резюме опционально' },
    ],
  },
];

export function OnboardingScreen({ navigation }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      // Последний слайд - переход на главную БЕЗ регистрации
      navigation.replace('Main');
    }
  };

  const handleSkip = () => {
    navigation.replace('Main');
  };

  const renderSlide = ({ item }: { item: typeof slides[0] }) => {
    return (
      <View style={styles.slide}>
        {/* Icon with gradient circle */}
        <Animated.View
          entering={FadeIn.delay(200).duration(600)}
          style={styles.iconContainer}
        >
          <LinearGradient
            colors={item.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <Text style={styles.emoji}>{item.emoji}</Text>
          </LinearGradient>

          {/* Glow effect */}
          <View style={styles.glowCircle} />
        </Animated.View>

        {/* Title */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)}>
          <Text style={styles.title}>{item.title}</Text>
        </Animated.View>

        {/* Description */}
        <Animated.View entering={FadeInDown.delay(600).duration(600)}>
          <Text style={styles.description}>{item.description}</Text>
        </Animated.View>

        {/* Features card */}
        <Animated.View
          entering={FadeInDown.delay(800).duration(600)}
          style={styles.featuresContainer}
        >
          <GlassCard style={styles.featureCard} variant="dark">
            {item.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIconBox}>
                  <Icon name={feature.icon} size={20} color={colors.platinumSilver} />
                </View>
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            ))}
          </GlassCard>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />

      {/* Background gradient */}
      <LinearGradient
        colors={['#000000', '#0A0A0A', '#000000']}
        style={StyleSheet.absoluteFill}
      />

      {/* Skip button */}
      {currentIndex < slides.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Пропустить</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrentIndex(index);
        }}
        scrollEnabled={true}
        bounces={false}
      />

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        {/* Pagination dots */}
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                currentIndex === index && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Next button */}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={metalGradients.platinum}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.nextGradient}
          >
            <Text style={styles.nextText}>
              {currentIndex === slides.length - 1 ? 'Начать просмотр!' : 'Далее'}
            </Text>
            <Icon
              name="arrow-right"
              size={24}
              color={colors.primaryBlack}
              style={{ marginLeft: sizes.sm }}
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBlack,
  },
  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: sizes.xl,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: sizes.lg,
    zIndex: 10,
    paddingHorizontal: sizes.md,
    paddingVertical: sizes.sm,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: sizes.radiusMedium,
  },
  skipText: {
    ...typography.body,
    color: colors.chromeSilver,
    fontWeight: '600',
    fontSize: 15,
  },
  iconContainer: {
    marginBottom: sizes.xxxLarge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGradient: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.platinumSilver,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
  },
  glowCircle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.platinumSilver,
    opacity: 0.1,
    zIndex: -1,
  },
  emoji: {
    fontSize: 80,
  },
  title: {
    ...typography.h1,
    fontSize: 34,
    color: colors.softWhite,
    textAlign: 'center',
    marginBottom: sizes.md,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  description: {
    ...typography.body,
    fontSize: 18,
    color: colors.chromeSilver,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: sizes.xxLarge,
    paddingHorizontal: sizes.md,
  },
  featuresContainer: {
    width: '100%',
  },
  featureCard: {
    padding: sizes.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: sizes.md,
    gap: sizes.md,
  },
  featureIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    ...typography.body,
    fontSize: 16,
    color: colors.softWhite,
    flex: 1,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: sizes.xl,
  },
  pagination: {
    flexDirection: 'row',
    gap: sizes.sm,
    marginBottom: sizes.xxLarge,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    transition: 'all 0.3s',
  },
  dotActive: {
    backgroundColor: colors.platinumSilver,
    width: 32,
  },
  nextButton: {
    width: '100%',
    borderRadius: sizes.radiusLarge,
    overflow: 'hidden',
    shadowColor: colors.platinumSilver,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  nextGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sizes.lg + 2,
    paddingHorizontal: sizes.xl,
  },
  nextText: {
    ...typography.h3,
    color: colors.primaryBlack,
    fontWeight: '700',
    fontSize: 18,
  },
});
