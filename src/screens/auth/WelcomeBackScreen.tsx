/**
 * 360° РАБОТА - ULTRA EDITION
 * Welcome Back Screen - After successful registration
 * Architecture v3: TikTok-style welcome with confetti
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { MetalIcon } from '@/components/ui';
import { colors, metalGradients, typography, sizes } from '@/constants';
import { haptics } from '@/utils/haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface WelcomeBackScreenProps {
  route: {
    params: {
      name: string;
    };
  };
  navigation: any;
}

// Confetti particle component
const ConfettiParticle = ({ delay, x }: { delay: number; x: number }) => {
  const translateY = useSharedValue(-100);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withTiming(SCREEN_HEIGHT + 100, {
      duration: 3000 + Math.random() * 2000,
    });
    rotate.value = withRepeat(
      withTiming(360, { duration: 1000 + Math.random() * 1000 }),
      -1,
      false
    );
    opacity.value = withSequence(
      withTiming(1, { duration: 500 }),
      withTiming(0, { duration: 2000 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const colors = ['#FFD700', '#FF6B9D', '#4ECDC4', '#95E1D3', '#F38181', '#AA96DA'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return (
    <Animated.View
      style={[
        styles.confetti,
        animatedStyle,
        {
          left: x,
          backgroundColor: color,
        },
      ]}
    />
  );
};

export function WelcomeBackScreen({ route, navigation }: WelcomeBackScreenProps) {
  const { name } = route.params;
  const scale = useSharedValue(0);

  useEffect(() => {
    // Success haptic
    haptics.success();

    // Scale animation for icon
    scale.value = withSpring(1, {
      damping: 10,
      stiffness: 100,
    });
  }, []);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleContinue = () => {
    haptics.light();
    navigation.replace('Main');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />

      {/* Background gradient */}
      <LinearGradient
        colors={['#000000', '#0A0A0A', '#000000']}
        style={StyleSheet.absoluteFill}
      />

      {/* Confetti */}
      {Array.from({ length: 30 }).map((_, index) => (
        <ConfettiParticle
          key={index}
          delay={index * 100}
          x={Math.random() * SCREEN_WIDTH}
        />
      ))}

      {/* Content */}
      <View style={styles.content}>
        {/* Success Icon */}
        <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
          <View style={styles.iconWrapper}>
            <LinearGradient
              colors={metalGradients.platinum}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconGradient}
            >
              <Icon name="check-circle" size={80} color={colors.graphiteBlack} />
            </LinearGradient>
            {/* Glow effect */}
            <View style={styles.glowCircle} />
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)}>
          <Text style={styles.title}>Поздравляем, {name}! 🎉</Text>
        </Animated.View>

        {/* Subtitle */}
        <Animated.View entering={FadeInDown.delay(600).duration(600)}>
          <Text style={styles.subtitle}>
            Вы успешно зарегистрировались!{'\n'}
            Начните искать работу своей мечты
          </Text>
        </Animated.View>

        {/* Features */}
        <Animated.View
          entering={FadeInUp.delay(800).duration(600)}
          style={styles.featuresContainer}
        >
          <View style={styles.featureItem}>
            <View style={styles.featureIconBox}>
              <Icon name="video" size={24} color={colors.platinumSilver} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Смотри видео-вакансии</Text>
              <Text style={styles.featureDescription}>
                Короткие видео от реальных работодателей
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconBox}>
              <Icon name="gesture-swipe-left" size={24} color={colors.platinumSilver} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Откликайся свайпом</Text>
              <Text style={styles.featureDescription}>
                Одно касание для отклика на вакансию
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconBox}>
              <Icon name="message-text" size={24} color={colors.platinumSilver} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Общайся напрямую</Text>
              <Text style={styles.featureDescription}>
                Чат с работодателем без посредников
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Continue Button */}
      <Animated.View
        entering={FadeInUp.delay(1000).duration(600)}
        style={styles.bottomSection}
      >
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={metalGradients.platinum}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.continueGradient}
          >
            <Text style={styles.continueText}>НАЧАТЬ ПОИСК!</Text>
            <Icon
              name="arrow-right"
              size={24}
              color={colors.primaryBlack}
              style={{ marginLeft: sizes.sm }}
            />
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.hintText}>
          Вы можете создать видео-резюме позже в профиле
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBlack,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: sizes.xl,
  },
  iconContainer: {
    marginBottom: sizes.xxxLarge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
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
    shadowOpacity: 0.6,
    shadowRadius: 32,
    elevation: 20,
  },
  glowCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.platinumSilver,
    opacity: 0.15,
    zIndex: -1,
  },
  title: {
    ...typography.h1,
    fontSize: 32,
    color: colors.softWhite,
    textAlign: 'center',
    marginBottom: sizes.md,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  subtitle: {
    ...typography.body,
    fontSize: 17,
    color: colors.chromeSilver,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: sizes.xxLarge,
  },
  featuresContainer: {
    width: '100%',
    gap: sizes.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: sizes.md,
    borderRadius: sizes.radiusMedium,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  featureIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    ...typography.bodyMedium,
    fontSize: 16,
    color: colors.softWhite,
    marginBottom: 2,
  },
  featureDescription: {
    ...typography.caption,
    fontSize: 13,
    color: colors.chromeSilver,
    lineHeight: 18,
  },
  bottomSection: {
    paddingHorizontal: sizes.xl,
    paddingBottom: sizes.xxl,
    alignItems: 'center',
  },
  continueButton: {
    width: '100%',
    borderRadius: sizes.radiusLarge,
    overflow: 'hidden',
    shadowColor: colors.platinumSilver,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    marginBottom: sizes.md,
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sizes.lg + 2,
    paddingHorizontal: sizes.xl,
  },
  continueText: {
    ...typography.h3,
    color: colors.primaryBlack,
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 2,
  },
  hintText: {
    ...typography.caption,
    fontSize: 13,
    color: colors.chromeSilver,
    textAlign: 'center',
    marginTop: sizes.sm,
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
