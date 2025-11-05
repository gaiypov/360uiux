/**
 * 360° РАБОТА - Revolut Ultra Edition
 * Onboarding Screen
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  ImageBackground,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { GlassButton } from '@/components/ui';
import { colors, typography, sizes } from '@/constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingScreenProps {
  onGetStarted: () => void;
}

export function OnboardingScreen({ onGetStarted }: OnboardingScreenProps) {
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primaryBlack}
        translucent
      />

      {/* Background gradient */}
      <LinearGradient
        colors={[colors.primaryBlack, colors.graphiteGray]}
        style={styles.gradient}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>360°</Text>
          <Text style={styles.logoSubtext}>РАБОТА</Text>

          {/* Tagline with neon accent */}
          <View style={styles.taglineContainer}>
            <LinearGradient
              colors={[colors.ultraViolet, colors.cyberBlue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.taglineGradient}
            >
              <Text style={styles.tagline}>Revolut Ultra для рабочих</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <FeatureItem
            icon="⚡"
            title="Мгновенные вакансии"
            description="Свайп вверх — новая возможность"
          />
          <FeatureItem
            icon="💎"
            title="Премиум компании"
            description="Только проверенные работодатели"
          />
          <FeatureItem
            icon="🎯"
            title="Точный поиск"
            description="ИИ подбирает лучшие вакансии"
          />
        </View>

        {/* CTA */}
        <View style={styles.ctaContainer}>
          <GlassButton
            title="НАЧАТЬ"
            onPress={onGetStarted}
            variant="primary"
          />
          <Text style={styles.termsText}>
            Нажимая "Начать", вы соглашаетесь с{'\n'}
            <Text style={styles.termsLink}>Условиями использования</Text>
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Text style={styles.featureEmoji}>{icon}</Text>
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBlack,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: sizes.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: SCREEN_HEIGHT * 0.15,
    marginBottom: sizes.xxl,
  },
  logo: {
    ...typography.h1,
    fontSize: 64,
    color: colors.softWhite,
    letterSpacing: 4,
  },
  logoSubtext: {
    ...typography.h3,
    color: colors.liquidSilver,
    letterSpacing: 8,
    marginTop: sizes.sm,
  },
  taglineContainer: {
    marginTop: sizes.lg,
    borderRadius: sizes.radiusMedium,
    overflow: 'hidden',
  },
  taglineGradient: {
    paddingHorizontal: sizes.lg,
    paddingVertical: sizes.sm,
  },
  tagline: {
    ...typography.body,
    color: colors.softWhite,
    fontWeight: '600',
  },
  features: {
    gap: sizes.lg,
    marginBottom: sizes.xxl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassBackground,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: sizes.radiusLarge,
    padding: sizes.lg,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(142, 127, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: sizes.md,
  },
  featureEmoji: {
    fontSize: 28,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.softWhite,
    marginBottom: 4,
  },
  featureDescription: {
    ...typography.body,
    fontSize: 14,
    color: colors.liquidSilver,
  },
  ctaContainer: {
    marginBottom: sizes.xxl,
  },
  termsText: {
    ...typography.caption,
    color: colors.liquidSilver,
    textAlign: 'center',
    marginTop: sizes.md,
  },
  termsLink: {
    color: colors.cyberBlue,
  },
});
