/**
 * 360° РАБОТА - ULTRA EDITION
 * Registration Required Screen
 * Architecture v3: Shown after 20 guest video views
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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { GlassCard, MetalIcon } from '@/components/ui';
import { colors, metalGradients, typography, sizes } from '@/constants';
import { haptics } from '@/utils/haptics';
import { getGuestViews } from '@/utils/guestViewCounter';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface RegistrationRequiredScreenProps {
  navigation: any;
}

export function RegistrationRequiredScreen({ navigation }: RegistrationRequiredScreenProps) {
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);
  const [viewsData, setViewsData] = React.useState({ count: 0, viewedVacancies: [] as string[] });

  useEffect(() => {
    // Load views data
    getGuestViews().then(setViewsData);

    // Haptic feedback
    haptics.warning();

    // Icon animations
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true
    );

    rotate.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 100 }),
        withTiming(-5, { duration: 100 }),
        withTiming(5, { duration: 100 }),
        withTiming(0, { duration: 100 })
      ),
      -1,
      false
    );
  }, []);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const handleRegister = () => {
    haptics.light();
    navigation.navigate('PhoneInput');
  };

  const handleLogin = () => {
    haptics.light();
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />

      {/* Background gradient */}
      <LinearGradient
        colors={['#000000', '#0A0A0A', '#1A0A0F', '#000000']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        {/* Lock Icon */}
        <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
          <View style={styles.iconWrapper}>
            <LinearGradient
              colors={['#FF006E', '#8338EC', '#3A86FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconGradient}
            >
              <Icon name="lock-alert" size={64} color={colors.softWhite} />
            </LinearGradient>
            {/* Glow effect */}
            <View style={styles.glowCircle} />
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <Text style={styles.title}>Лимит просмотров исчерпан</Text>
        </Animated.View>

        {/* Subtitle */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)}>
          <Text style={styles.subtitle}>
            Вы просмотрели {viewsData.count} {viewsData.count === 20 ? 'видео' : 'видео-вакансий'}
          </Text>
        </Animated.View>

        {/* Info Card */}
        <Animated.View
          entering={FadeInUp.delay(600).duration(600)}
          style={styles.infoCardContainer}
        >
          <GlassCard variant="medium" style={styles.infoCard}>
            <Text style={styles.infoTitle}>Зарегистрируйтесь, чтобы продолжить</Text>
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Icon name="infinity" size={20} color={colors.platinumSilver} />
                <Text style={styles.benefitText}>Безлимитный просмотр вакансий</Text>
              </View>
              <View style={styles.benefitItem}>
                <Icon name="gesture-swipe-left" size={20} color={colors.platinumSilver} />
                <Text style={styles.benefitText}>Откликайтесь на вакансии</Text>
              </View>
              <View style={styles.benefitItem}>
                <Icon name="message-text" size={20} color={colors.platinumSilver} />
                <Text style={styles.benefitText}>Общайтесь с работодателями</Text>
              </View>
              <View style={styles.benefitItem}>
                <Icon name="bookmark-multiple" size={20} color={colors.platinumSilver} />
                <Text style={styles.benefitText}>Сохраняйте избранное</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Timer indicator */}
        <Animated.View entering={FadeIn.delay(800).duration(600)} style={styles.timerContainer}>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={['#FF006E', '#8338EC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.progressFill}
            />
          </View>
          <Text style={styles.timerText}>20 / 20 видео просмотрено</Text>
        </Animated.View>
      </View>

      {/* Bottom Buttons */}
      <Animated.View
        entering={FadeInUp.delay(1000).duration(600)}
        style={styles.bottomSection}
      >
        {/* Register Button */}
        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={metalGradients.platinum}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.registerGradient}
          >
            <Icon name="account-plus" size={22} color={colors.primaryBlack} />
            <Text style={styles.registerText}>ЗАРЕГИСТРИРОВАТЬСЯ</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Уже есть аккаунт? </Text>
          <TouchableOpacity onPress={handleLogin} activeOpacity={0.7}>
            <Text style={styles.loginLink}>Войти</Text>
          </TouchableOpacity>
        </View>

        {/* Fine print */}
        <Text style={styles.fineText}>
          Регистрация займет меньше минуты
        </Text>
      </Animated.View>
    </View>
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
    marginBottom: sizes.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF006E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 16,
  },
  glowCircle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FF006E',
    opacity: 0.2,
    zIndex: -1,
  },
  title: {
    ...typography.h1,
    fontSize: 28,
    color: colors.softWhite,
    textAlign: 'center',
    marginBottom: sizes.sm,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    ...typography.body,
    fontSize: 16,
    color: colors.chromeSilver,
    textAlign: 'center',
    marginBottom: sizes.xxl,
  },
  infoCardContainer: {
    width: '100%',
    marginBottom: sizes.xl,
  },
  infoCard: {
    paddingVertical: sizes.lg,
  },
  infoTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.softWhite,
    textAlign: 'center',
    marginBottom: sizes.lg,
    fontWeight: '700',
  },
  benefitsList: {
    gap: sizes.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.md,
  },
  benefitText: {
    ...typography.body,
    fontSize: 15,
    color: colors.chromeSilver,
    flex: 1,
  },
  timerContainer: {
    width: '100%',
    alignItems: 'center',
    gap: sizes.sm,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    width: '100%',
    height: '100%',
  },
  timerText: {
    ...typography.caption,
    fontSize: 13,
    color: colors.chromeSilver,
  },
  bottomSection: {
    paddingHorizontal: sizes.xl,
    paddingBottom: sizes.xxl,
    alignItems: 'center',
  },
  registerButton: {
    width: '100%',
    borderRadius: sizes.radiusLarge,
    overflow: 'hidden',
    shadowColor: colors.platinumSilver,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
    marginBottom: sizes.lg,
  },
  registerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sizes.lg + 2,
    paddingHorizontal: sizes.xl,
    gap: sizes.sm,
  },
  registerText: {
    ...typography.h3,
    color: colors.primaryBlack,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1.5,
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sizes.sm,
  },
  loginText: {
    ...typography.body,
    fontSize: 14,
    color: colors.chromeSilver,
  },
  loginLink: {
    ...typography.bodyMedium,
    fontSize: 14,
    color: colors.platinumSilver,
    textDecorationLine: 'underline',
  },
  fineText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.graphiteSilver,
    textAlign: 'center',
  },
});
