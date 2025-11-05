/**
 * 360° РАБОТА - ULTRA EDITION
 * Splash Screen with 360° Ring Animation
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { colors, metalGradients, metalGradients, typography } from "@/constants";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);
  const ringScale = useSharedValue(0.8);

  useEffect(() => {
    // 360° вращение кольца с плавной анимацией
    rotation.value = withSequence(
      withTiming(360, {
        duration: 2000,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      withTiming(0, { duration: 0 })
    );

    // Пульсация кольца
    ringScale.value = withSequence(
      withTiming(1, { duration: 1000, easing: Easing.ease }),
      withTiming(1.05, { duration: 500, easing: Easing.ease }),
      withTiming(1, { duration: 500, easing: Easing.ease })
    );

    // Fade in логотипа
    opacity.value = withTiming(1, {
      duration: 1000,
      easing: Easing.ease,
    });

    // Elastic scale логотипа
    scale.value = withTiming(1, {
      duration: 1000,
      easing: Easing.elastic(1),
    });

    setTimeout(onComplete, 2500);
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: ringScale.value },
    ],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Вращающееся металлическое кольцо */}
      <Animated.View style={[styles.ringContainer, ringStyle]}>
        <LinearGradient
          colors={metalGradients.platinum}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ring}
        />
      </Animated.View>

      {/* Логотип 360° */}
      <Animated.View style={[styles.logo, logoStyle]}>
        <Text style={styles.logoText}>360°</Text>
        <Text style={styles.logoSubtext}>РАБОТА</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
  },
  ring: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: 'transparent',
    shadowColor: colors.platinumSilver,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 30,
    shadowOpacity: 0.6,
    elevation: 20,
  },
  logo: {
    alignItems: 'center',
    zIndex: 10,
  },
  logoText: {
    ...typography.h1,
    fontSize: 72,
    color: colors.softWhite,
    letterSpacing: 4,
  },
  logoSubtext: {
    ...typography.h3,
    fontSize: 20,
    color: colors.liquidSilver,
    letterSpacing: 8,
    marginTop: 8,
  },
});
