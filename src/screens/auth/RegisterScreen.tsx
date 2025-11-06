/**
 * 360° РАБОТА - ULTRA EDITION
 * Register Screen
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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { GlassCard, MetalIcon, LoadingSpinner } from '@/components/ui';
import { colors, metalGradients, typography, sizes } from '@/constants';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { validateEmail, validatePassword, validateName } from '@/utils/validation';
import { haptics } from '@/utils/haptics';
import { getKeyboardBehavior, getTextSelectionProps } from '@/utils/platform';

type UserRole = 'jobseeker' | 'employer';

export function RegisterScreen({ navigation }: any) {
  const { login } = useAuthStore();
  const { showToast } = useToastStore();

  const [role, setRole] = useState<UserRole>('jobseeker');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleRegister = async () => {
    const nameValidation = validateName(name);
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    const newErrors: Record<string, string> = {};

    if (!nameValidation.isValid) newErrors.name = nameValidation.error!;
    if (!emailValidation.isValid) newErrors.email = emailValidation.error!;
    if (!passwordValidation.isValid) newErrors.password = passwordValidation.error!;
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      haptics.error();
      return;
    }

    setErrors({});
    setLoading(true);
    haptics.light();

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockUser = {
        id: Date.now().toString(),
        email,
        name,
        role,
        avatar: undefined,
      };

      login(mockUser);
      haptics.success();
      showToast('success', 'Регистрация успешна!');
      navigation.replace('Onboarding');
    } catch (error) {
      haptics.error();
      showToast('error', 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
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
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <MetalIcon name="account-plus" variant="platinum" size="large" glow />
          <Text style={styles.title}>Регистрация</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(600)}>
          <GlassCard variant="medium" style={styles.formCard}>
            {/* Role Selection */}
            <Text style={styles.sectionTitle}>Я ищу</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[styles.roleButton, role === 'jobseeker' && styles.roleButtonActive]}
                onPress={() => { setRole('jobseeker'); haptics.light(); }}
                disabled={loading}
              >
                <Icon name="account-search" size={24} color={role === 'jobseeker' ? colors.graphiteBlack : colors.chromeSilver} />
                <Text style={[styles.roleText, role === 'jobseeker' && styles.roleTextActive]}>Работу</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleButton, role === 'employer' && styles.roleButtonActive]}
                onPress={() => { setRole('employer'); haptics.light(); }}
                disabled={loading}
              >
                <Icon name="briefcase-search" size={24} color={role === 'employer' ? colors.graphiteBlack : colors.chromeSilver} />
                <Text style={[styles.roleText, role === 'employer' && styles.roleTextActive]}>Сотрудников</Text>
              </TouchableOpacity>
            </View>

            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Имя</Text>
              <View style={[styles.inputWrapper, errors.name && styles.inputError]}>
                <Icon name="account" size={20} color={colors.chromeSilver} />
                <TextInput
                  style={styles.input}
                  placeholder="Ваше имя"
                  placeholderTextColor={colors.graphiteSilver}
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  editable={!loading}
                  {...getTextSelectionProps(colors.platinumSilver)}
                />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

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
                  placeholder="Минимум 8 символов"
                  placeholderTextColor={colors.graphiteSilver}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                  {...getTextSelectionProps(colors.platinumSilver)}
                />
                <TouchableOpacity onPress={() => { setShowPassword(!showPassword); haptics.light(); }} disabled={loading}>
                  <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.chromeSilver} />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Подтвердите пароль</Text>
              <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputError]}>
                <Icon name="lock-check" size={20} color={colors.chromeSilver} />
                <TextInput
                  style={styles.input}
                  placeholder="Повторите пароль"
                  placeholderTextColor={colors.graphiteSilver}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                  }}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                  {...getTextSelectionProps(colors.platinumSilver)}
                />
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={metalGradients.platinum}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.registerGradient}
              >
                {loading ? (
                  <LoadingSpinner size="small" variant="spinner" color={colors.graphiteBlack} />
                ) : (
                  <>
                    <Icon name="account-plus" size={20} color={colors.graphiteBlack} />
                    <Text style={styles.registerText}>ЗАРЕГИСТРИРОВАТЬСЯ</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Terms */}
            <Text style={styles.termsText}>
              Регистрируясь, вы принимаете{' '}
              <Text style={styles.termsLink}>условия использования</Text>
            </Text>
          </GlassCard>
        </Animated.View>

        {/* Login Link */}
        <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.footer}>
          <Text style={styles.footerText}>Уже есть аккаунт? </Text>
          <TouchableOpacity onPress={() => { haptics.light(); navigation.navigate('Login'); }} disabled={loading}>
            <Text style={styles.footerLink}>Войти</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primaryBlack },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: sizes.xl, paddingVertical: sizes.xxl },
  header: { alignItems: 'center', marginBottom: sizes.xl },
  title: { ...typography.h1, color: colors.softWhite, marginTop: sizes.md, letterSpacing: 2 },
  formCard: { marginBottom: sizes.lg },
  sectionTitle: { ...typography.h4, color: colors.chromeSilver, marginBottom: sizes.md, textAlign: 'center' },
  roleContainer: { flexDirection: 'row', gap: sizes.md, marginBottom: sizes.lg },
  roleButton: { flex: 1, alignItems: 'center', paddingVertical: sizes.lg, backgroundColor: colors.slateGray, borderRadius: sizes.radiusMedium, borderWidth: 2, borderColor: 'transparent' },
  roleButtonActive: { borderColor: colors.platinumSilver, backgroundColor: colors.platinumSilver },
  roleText: { ...typography.bodyMedium, color: colors.chromeSilver, marginTop: sizes.xs },
  roleTextActive: { color: colors.graphiteBlack },
  inputContainer: { marginBottom: sizes.md },
  inputLabel: { ...typography.captionMedium, color: colors.chromeSilver, marginBottom: sizes.sm },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.slateGray, borderRadius: sizes.radiusMedium, paddingHorizontal: sizes.md, borderWidth: 1, borderColor: 'transparent' },
  inputError: { borderColor: colors.error },
  input: { ...typography.body, flex: 1, color: colors.softWhite, paddingVertical: sizes.md, marginLeft: sizes.sm },
  errorText: { ...typography.micro, color: colors.error, marginTop: sizes.xs, marginLeft: sizes.sm },
  registerButton: { borderRadius: sizes.radiusLarge, overflow: 'hidden', marginVertical: sizes.lg },
  registerGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: sizes.md + 2, gap: sizes.sm },
  registerText: { ...typography.h4, color: colors.graphiteBlack, fontWeight: '700', letterSpacing: 1.5 },
  termsText: { ...typography.micro, color: colors.graphiteSilver, textAlign: 'center' },
  termsLink: { color: colors.platinumSilver },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: sizes.lg },
  footerText: { ...typography.body, color: colors.chromeSilver },
  footerLink: { ...typography.bodyMedium, color: colors.platinumSilver },
});
