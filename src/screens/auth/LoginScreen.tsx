/**
 * 360° РАБОТА - ULTRA EDITION
 * Login Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { GlassCard, MetalIcon, LoadingSpinner } from '@/components/ui';
import { colors, metalGradients, typography, sizes } from '@/constants';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { validateEmail, validatePassword } from '@/utils/validation';
import { haptics } from '@/utils/haptics';
import { getKeyboardBehavior, getTextSelectionProps, getShadowStyle } from '@/utils/platform';

export function LoginScreen({ navigation }: any) {
  const { login } = useAuthStore();
  const { showToast } = useToastStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleLogin = async () => {
    // Validate inputs
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    if (!emailValidation.isValid || !passwordValidation.isValid) {
      setErrors({
        email: emailValidation.error,
        password: passwordValidation.error,
      });
      haptics.error();
      return;
    }

    setErrors({});
    setLoading(true);
    haptics.light();

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock login - in real app, call API
      const mockUser = {
        id: '1',
        email,
        name: 'Пользователь',
        role: 'jobseeker' as const,
        avatar: undefined,
      };

      login(mockUser);
      haptics.success();
      showToast('success', 'Добро пожаловать!');
      navigation.replace('Main');
    } catch (error) {
      haptics.error();
      showToast('error', 'Ошибка входа. Проверьте данные.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={getKeyboardBehavior()}
      >
        <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* Logo & Title */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <MetalIcon name="briefcase-account" variant="platinum" size="large" glow />
          <Text style={styles.title}>360° РАБОТА</Text>
          <Text style={styles.subtitle}>Ultra Edition</Text>
        </Animated.View>

        {/* Login Form */}
        <Animated.View entering={FadeInUp.delay(200).duration(600)}>
          <GlassCard variant="medium" style={styles.formCard}>
            <Text style={styles.formTitle}>Вход в аккаунт</Text>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                <Icon name="email-outline" size={20} color={colors.chromeSilver} />
                <TextInput
                  style={styles.input}
                  placeholder="example@mail.ru"
                  placeholderTextColor={colors.graphiteSilver}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  editable={!loading}
                  {...getTextSelectionProps(colors.platinumSilver)}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Пароль</Text>
              <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                <Icon name="lock-outline" size={20} color={colors.chromeSilver} />
                <TextInput
                  style={styles.input}
                  placeholder="Введите пароль"
                  placeholderTextColor={colors.graphiteSilver}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  editable={!loading}
                  {...getTextSelectionProps(colors.platinumSilver)}
                />
                <TouchableOpacity
                  onPress={() => {
                    setShowPassword(!showPassword);
                    haptics.light();
                  }}
                  disabled={loading}
                >
                  <Icon
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={colors.chromeSilver}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={() => {
                haptics.light();
                navigation.navigate('ForgotPassword');
              }}
              style={styles.forgotButton}
              disabled={loading}
            >
              <Text style={styles.forgotText}>Забыли пароль?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={metalGradients.platinum}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginGradient}
              >
                {loading ? (
                  <LoadingSpinner size="small" variant="spinner" color={colors.graphiteBlack} />
                ) : (
                  <>
                    <Icon name="login" size={20} color={colors.graphiteBlack} />
                    <Text style={styles.loginText}>ВОЙТИ</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>или</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login */}
            <View style={styles.socialContainer}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => {
                  haptics.light();
                  showToast('info', 'Google вход скоро будет доступен');
                }}
                disabled={loading}
              >
                <Icon name="google" size={24} color={colors.softWhite} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => {
                  haptics.light();
                  showToast('info', 'Apple вход скоро будет доступен');
                }}
                disabled={loading}
              >
                <Icon name="apple" size={24} color={colors.softWhite} />
              </TouchableOpacity>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Register Link */}
        <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.footer}>
          <Text style={styles.footerText}>Нет аккаунта? </Text>
          <TouchableOpacity
            onPress={() => {
              haptics.light();
              navigation.navigate('Register');
            }}
            disabled={loading}
          >
            <Text style={styles.footerLink}>Зарегистрироваться</Text>
          </TouchableOpacity>
        </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBlack,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: sizes.xl,
    paddingVertical: sizes.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: sizes.xxl,
  },
  title: {
    ...typography.h1,
    color: colors.softWhite,
    marginTop: sizes.lg,
    letterSpacing: 2,
  },
  subtitle: {
    ...typography.body,
    color: colors.platinumSilver,
    marginTop: sizes.xs,
  },
  formCard: {
    marginBottom: sizes.lg,
  },
  formTitle: {
    ...typography.h3,
    color: colors.softWhite,
    marginBottom: sizes.lg,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: sizes.lg,
  },
  inputLabel: {
    ...typography.captionMedium,
    color: colors.chromeSilver,
    marginBottom: sizes.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.slateGray,
    borderRadius: sizes.radiusMedium,
    paddingHorizontal: sizes.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: colors.error,
  },
  input: {
    ...typography.body,
    flex: 1,
    color: colors.softWhite,
    paddingVertical: sizes.md,
    marginLeft: sizes.sm,
  },
  errorText: {
    ...typography.micro,
    color: colors.error,
    marginTop: sizes.xs,
    marginLeft: sizes.sm,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: sizes.lg,
  },
  forgotText: {
    ...typography.caption,
    color: colors.platinumSilver,
  },
  loginButton: {
    borderRadius: sizes.radiusLarge,
    overflow: 'hidden',
    marginBottom: sizes.md,
  },
  loginGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sizes.md + 2,
    gap: sizes.sm,
  },
  loginText: {
    ...typography.h3,
    color: colors.graphiteBlack,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: sizes.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.steelGray,
  },
  dividerText: {
    ...typography.caption,
    color: colors.graphiteSilver,
    marginHorizontal: sizes.md,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: sizes.md,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.carbonGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: sizes.lg,
  },
  footerText: {
    ...typography.body,
    color: colors.chromeSilver,
  },
  footerLink: {
    ...typography.bodyMedium,
    color: colors.platinumSilver,
  },
});
