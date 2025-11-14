/**
 * 360° РАБОТА - ULTRA EDITION
 * Registration Screen - Simplified 2-step flow
 * Architecture v3: TikTok-style registration (name + age only)
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
import { useToastStore } from '@/stores/toastStore';
import { useAuthStore } from '@/stores/authStore';
import { haptics } from '@/utils/haptics';
import { getKeyboardBehavior, getTextSelectionProps } from '@/utils/platform';
import { api } from '@/services/api';

interface Props {
  route: {
    params: {
      phone: string;
      formattedPhone: string;
    };
  };
  navigation: any;
}

export function RegistrationScreen({ route, navigation }: Props) {
  const { phone, formattedPhone } = route.params;
  const { showToast } = useToastStore();
  const { login } = useAuthStore();

  const [loading, setLoading] = useState(false);

  // Simplified fields
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Валидация
   */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Введите имя';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Имя слишком короткое';
    }

    if (age && (parseInt(age) < 14 || parseInt(age) > 100)) {
      newErrors.age = 'Укажите корректный возраст';
    }

    if (!acceptTerms) {
      newErrors.terms = 'Примите условия использования';
    }

    if (!acceptPrivacy) {
      newErrors.privacy = 'Примите политику конфиденциальности';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Регистрация
   */
  const handleRegister = async () => {
    if (!validate()) {
      haptics.error();
      return;
    }

    try {
      setLoading(true);
      haptics.light();

      // По умолчанию все новые пользователи - соискатели (jobseeker)
      const response = await api.registerJobSeeker({
        phone,
        name: name.trim(),
        age: age ? parseInt(age) : undefined,
      });

      // Сохраняем пользователя
      login(response.user);
      haptics.success();
      showToast('success', 'Добро пожаловать!');

      // Переходим на экран приветствия
      navigation.replace('WelcomeBack', { name: name.trim() });
    } catch (error: any) {
      console.error('Register error:', error);
      haptics.error();
      showToast('error', error.response?.data?.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Checkbox компонент
   */
  const renderCheckbox = (
    value: boolean,
    onPress: () => void,
    label: string,
    linkText?: string,
    error?: string
  ) => (
    <TouchableOpacity
      style={styles.checkboxContainer}
      onPress={() => {
        onPress();
        haptics.light();
      }}
      activeOpacity={0.7}
      disabled={loading}
    >
      <View style={[styles.checkbox, value && styles.checkboxActive]}>
        {value && <Icon name="check" size={16} color={colors.graphiteBlack} />}
      </View>
      <Text style={styles.checkboxLabel}>
        {label}{' '}
        {linkText && <Text style={styles.checkboxLink}>{linkText}</Text>}
      </Text>
      {error && <Text style={styles.checkboxError}>{error}</Text>}
    </TouchableOpacity>
  );

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
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <MetalIcon name="account-plus" variant="platinum" size="large" glow />
          <Text style={styles.title}>Расскажите о себе</Text>
          <Text style={styles.subtitle}>
            Осталось совсем чуть-чуть!
          </Text>
        </Animated.View>

        {/* Form */}
        <Animated.View entering={FadeInUp.delay(200).duration(600)}>
          <GlassCard variant="medium" style={styles.formCard}>
            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Ваше имя <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.inputWrapper, errors.name && styles.inputError]}>
                <Icon name="account" size={20} color={colors.chromeSilver} />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  placeholder="Введите ваше имя"
                  placeholderTextColor={colors.graphiteSilver}
                  editable={!loading}
                  autoFocus
                  {...getTextSelectionProps(colors.platinumSilver)}
                />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Age Input (optional) */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Возраст <Text style={styles.optional}>(рекомендуется)</Text>
              </Text>
              <View style={[styles.inputWrapper, errors.age && styles.inputError]}>
                <Icon name="cake-variant" size={20} color={colors.chromeSilver} />
                <TextInput
                  style={styles.input}
                  value={age}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/\D/g, '').slice(0, 2);
                    setAge(cleaned);
                    if (errors.age) setErrors({ ...errors, age: '' });
                  }}
                  placeholder="Ваш возраст"
                  placeholderTextColor={colors.graphiteSilver}
                  keyboardType="number-pad"
                  maxLength={2}
                  editable={!loading}
                  {...getTextSelectionProps(colors.platinumSilver)}
                />
              </View>
              {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
              <Text style={styles.hint}>
                Работодатели предпочитают кандидатов с указанным возрастом
              </Text>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Checkboxes */}
            <View style={styles.checkboxesContainer}>
              {renderCheckbox(
                acceptTerms,
                () => setAcceptTerms(!acceptTerms),
                'Я принимаю',
                'условия использования',
                errors.terms
              )}
              {renderCheckbox(
                acceptPrivacy,
                () => setAcceptPrivacy(!acceptPrivacy),
                'Я принимаю',
                'политику конфиденциальности',
                errors.privacy
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleRegister}
              disabled={loading || !name.trim()}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={metalGradients.platinum}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.submitGradient}
              >
                {loading ? (
                  <LoadingSpinner size="small" variant="spinner" color={colors.graphiteBlack} />
                ) : (
                  <>
                    <Text style={styles.submitText}>НАЧАТЬ!</Text>
                    <Icon name="arrow-right" size={24} color={colors.graphiteBlack} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </GlassCard>
        </Animated.View>

        {/* Phone info */}
        <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.footer}>
          <Text style={styles.footerText}>
            Номер телефона: <Text style={styles.footerPhone}>{formattedPhone}</Text>
          </Text>
          <TouchableOpacity
            onPress={() => {
              haptics.light();
              navigation.goBack();
            }}
            disabled={loading}
          >
            <Text style={styles.footerLink}>Изменить</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    fontSize: 32,
    color: colors.softWhite,
    marginTop: sizes.lg,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    ...typography.body,
    fontSize: 16,
    color: colors.liquidSilver,
    marginTop: sizes.sm,
    textAlign: 'center',
  },
  formCard: {
    paddingVertical: sizes.lg,
  },
  inputContainer: {
    marginBottom: sizes.lg,
  },
  label: {
    ...typography.bodyMedium,
    color: colors.platinumSilver,
    marginBottom: sizes.sm,
    fontSize: 15,
  },
  required: {
    color: colors.error,
  },
  optional: {
    ...typography.caption,
    color: colors.liquidSilver,
    fontWeight: '400',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.slateGray,
    borderRadius: sizes.radiusMedium,
    paddingHorizontal: sizes.md,
    borderWidth: 2,
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
    fontSize: 16,
  },
  errorText: {
    ...typography.micro,
    color: colors.error,
    marginTop: sizes.xs,
    marginLeft: sizes.sm,
  },
  hint: {
    ...typography.caption,
    color: colors.liquidSilver,
    marginTop: sizes.xs,
    marginLeft: sizes.sm,
    fontSize: 13,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: colors.glassBorder,
    marginVertical: sizes.lg,
  },
  checkboxesContainer: {
    gap: sizes.md,
    marginBottom: sizes.lg,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.chromeSilver,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxActive: {
    backgroundColor: colors.platinumSilver,
    borderColor: colors.platinumSilver,
  },
  checkboxLabel: {
    ...typography.body,
    color: colors.softWhite,
    fontSize: 14,
    flex: 1,
  },
  checkboxLink: {
    color: colors.platinumSilver,
    textDecorationLine: 'underline',
  },
  checkboxError: {
    ...typography.micro,
    color: colors.error,
    marginTop: sizes.xs,
  },
  submitButton: {
    borderRadius: sizes.radiusLarge,
    overflow: 'hidden',
    shadowColor: colors.platinumSilver,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sizes.lg,
    gap: sizes.sm,
  },
  submitText: {
    ...typography.h3,
    color: colors.graphiteBlack,
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 2,
  },
  footer: {
    alignItems: 'center',
    marginTop: sizes.xl,
    gap: sizes.sm,
  },
  footerText: {
    ...typography.body,
    color: colors.liquidSilver,
    fontSize: 14,
  },
  footerPhone: {
    ...typography.bodyMedium,
    color: colors.platinumSilver,
  },
  footerLink: {
    ...typography.bodyMedium,
    color: colors.platinumSilver,
    textDecorationLine: 'underline',
    fontSize: 14,
  },
});
