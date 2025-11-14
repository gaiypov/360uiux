/**
 * 360° РАБОТА - ULTRA EDITION
 * Employer Registration Screen - Company Registration
 * Revolut Ultra Style
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

export function EmployerRegistrationScreen({ route, navigation }: Props) {
  const { phone, formattedPhone } = route.params;
  const { showToast } = useToastStore();
  const { login } = useAuthStore();

  const [loading, setLoading] = useState(false);

  // Company fields
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [inn, setInn] = useState('');
  const [legalAddress, setLegalAddress] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Валидация
   */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Некорректный email';
    }

    // Company name validation
    if (!companyName.trim()) {
      newErrors.companyName = 'Введите название компании';
    } else if (companyName.trim().length < 3) {
      newErrors.companyName = 'Название слишком короткое';
    }

    // INN validation
    if (!inn.trim()) {
      newErrors.inn = 'Введите ИНН';
    } else if (!/^\d{10}$|^\d{12}$/.test(inn.trim())) {
      newErrors.inn = 'ИНН должен содержать 10 или 12 цифр';
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
   * Регистрация работодателя
   */
  const handleRegister = async () => {
    if (!validate()) {
      haptics.error();
      return;
    }

    try {
      setLoading(true);
      haptics.light();

      const response = await api.registerEmployer({
        phone,
        email: email.trim(),
        company_name: companyName.trim(),
        inn: inn.trim(),
        legal_address: legalAddress.trim() || undefined,
      });

      // Сохраняем пользователя
      login(response.user);
      haptics.success();
      showToast('success', 'Компания успешно зарегистрирована!');

      // Переходим в личный кабинет работодателя
      navigation.replace('Main');
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
    <View>
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
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={getKeyboardBehavior()}
        keyboardVerticalOffset={0}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primaryBlack}
        translucent
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
          <MetalIcon name="office-building" size={64} />
          <Text style={styles.title}>Регистрация компании</Text>
          <Text style={styles.subtitle}>
            Заполните данные вашей компании
          </Text>
          <Text style={styles.phone}>{formattedPhone}</Text>
        </Animated.View>

        {/* Form */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.form}>
          <GlassCard style={styles.formCard}>
            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Email компании <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                <Icon
                  name="email-outline"
                  size={20}
                  color={colors.chromeSilver}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="company@example.com"
                  placeholderTextColor={colors.darkChrome}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) {
                      setErrors({ ...errors, email: '' });
                    }
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!loading}
                  {...getTextSelectionProps()}
                />
              </View>
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Company Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Название компании <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.inputWrapper, errors.companyName && styles.inputError]}>
                <Icon
                  name="office-building-outline"
                  size={20}
                  color={colors.chromeSilver}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="ООО Название"
                  placeholderTextColor={colors.darkChrome}
                  value={companyName}
                  onChangeText={(text) => {
                    setCompanyName(text);
                    if (errors.companyName) {
                      setErrors({ ...errors, companyName: '' });
                    }
                  }}
                  autoCapitalize="words"
                  editable={!loading}
                  {...getTextSelectionProps()}
                />
              </View>
              {errors.companyName && (
                <Text style={styles.errorText}>{errors.companyName}</Text>
              )}
            </View>

            {/* INN */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                ИНН <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.inputWrapper, errors.inn && styles.inputError]}>
                <Icon
                  name="card-account-details-outline"
                  size={20}
                  color={colors.chromeSilver}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="1234567890"
                  placeholderTextColor={colors.darkChrome}
                  value={inn}
                  onChangeText={(text) => {
                    setInn(text.replace(/\D/g, ''));
                    if (errors.inn) {
                      setErrors({ ...errors, inn: '' });
                    }
                  }}
                  keyboardType="number-pad"
                  maxLength={12}
                  editable={!loading}
                  {...getTextSelectionProps()}
                />
              </View>
              {errors.inn && <Text style={styles.errorText}>{errors.inn}</Text>}
            </View>

            {/* Legal Address (Optional) */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Юридический адрес</Text>
              <View style={styles.inputWrapper}>
                <Icon
                  name="map-marker-outline"
                  size={20}
                  color={colors.chromeSilver}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="г. Москва, ул. Примерная, д. 1"
                  placeholderTextColor={colors.darkChrome}
                  value={legalAddress}
                  onChangeText={setLegalAddress}
                  autoCapitalize="words"
                  editable={!loading}
                  {...getTextSelectionProps()}
                />
              </View>
            </View>

            {/* Checkboxes */}
            <View style={styles.checkboxesContainer}>
              {renderCheckbox(
                acceptTerms,
                () => setAcceptTerms(!acceptTerms),
                'Я принимаю',
                'Условия использования',
                errors.terms
              )}

              {renderCheckbox(
                acceptPrivacy,
                () => setAcceptPrivacy(!acceptPrivacy),
                'Я принимаю',
                'Политику конфиденциальности',
                errors.privacy
              )}
            </View>
          </GlassCard>

          {/* Register Button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={metalGradients.platinum}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
            >
              {loading ? (
                <LoadingSpinner color={colors.graphiteBlack} />
              ) : (
                <>
                  <Text style={styles.registerButtonText}>Зарегистрировать компанию</Text>
                  <Icon name="arrow-right" size={20} color={colors.graphiteBlack} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Back to JobSeeker */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.backButtonText}>
              Назад к регистрации соискателя
            </Text>
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
  flex1: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: sizes.lg,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: sizes.xl,
  },
  title: {
    ...typography.h1,
    color: colors.softWhite,
    marginTop: sizes.lg,
    marginBottom: sizes.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.liquidSilver,
    textAlign: 'center',
    marginBottom: sizes.sm,
  },
  phone: {
    ...typography.bodyBold,
    color: colors.accentBlue,
  },
  form: {
    gap: sizes.lg,
  },
  formCard: {
    padding: sizes.lg,
    gap: sizes.lg,
  },
  inputContainer: {
    gap: sizes.xs,
  },
  label: {
    ...typography.caption,
    color: colors.liquidSilver,
    marginBottom: sizes.xs,
  },
  required: {
    color: colors.accentRed,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.slateGray,
    borderRadius: sizes.radiusMedium,
    borderWidth: 1,
    borderColor: colors.steelGray,
    paddingHorizontal: sizes.md,
    height: 52,
  },
  inputError: {
    borderColor: colors.accentRed,
  },
  inputIcon: {
    marginRight: sizes.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.platinumSilver,
    height: '100%',
  },
  errorText: {
    ...typography.caption,
    color: colors.accentRed,
    marginTop: sizes.xs,
  },
  checkboxesContainer: {
    gap: sizes.md,
    marginTop: sizes.sm,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: sizes.radiusSmall,
    borderWidth: 2,
    borderColor: colors.steelGray,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.carbonGray,
  },
  checkboxActive: {
    backgroundColor: colors.platinumSilver,
    borderColor: colors.platinumSilver,
  },
  checkboxLabel: {
    ...typography.caption,
    color: colors.chromeSilver,
    flex: 1,
  },
  checkboxLink: {
    color: colors.accentBlue,
    textDecorationLine: 'underline',
  },
  registerButton: {
    height: 56,
    borderRadius: sizes.radiusMedium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sizes.sm,
  },
  registerButtonDisabled: {
    opacity: 0.5,
  },
  registerButtonText: {
    ...typography.buttonLarge,
    color: colors.graphiteBlack,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: sizes.md,
  },
  backButtonText: {
    ...typography.caption,
    color: colors.chromeSilver,
    textDecorationLine: 'underline',
  },
});
