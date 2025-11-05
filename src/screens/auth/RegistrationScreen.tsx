/**
 * 360° РАБОТА - ULTRA EDITION
 * Registration Screen
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

type UserRole = 'jobseeker' | 'employer';

export function RegistrationScreen({ route, navigation }: Props) {
  const { phone, formattedPhone } = route.params;
  const { showToast } = useToastStore();
  const { login } = useAuthStore();

  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);

  // Job Seeker fields
  const [name, setName] = useState('');
  const [profession, setProfession] = useState('');
  const [city, setCity] = useState('');

  // Employer fields
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [inn, setInn] = useState('');
  const [legalAddress, setLegalAddress] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Валидация для соискателя
   */
  const validateJobSeeker = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Введите имя';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Имя слишком короткое';
    }

    if (!profession.trim()) {
      newErrors.profession = 'Укажите профессию';
    }

    if (!city.trim()) {
      newErrors.city = 'Укажите город';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Валидация для работодателя
   */
  const validateEmployer = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Неверный формат email';
    }

    if (!companyName.trim()) {
      newErrors.companyName = 'Введите название компании';
    }

    if (!inn.trim()) {
      newErrors.inn = 'Введите ИНН';
    } else if (!/^\d{10}$|^\d{12}$/.test(inn)) {
      newErrors.inn = 'ИНН должен содержать 10 или 12 цифр';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Регистрация соискателя
   */
  const handleRegisterJobSeeker = async () => {
    if (!validateJobSeeker()) {
      haptics.error();
      return;
    }

    try {
      setLoading(true);
      haptics.light();

      const response = await api.registerJobSeeker({
        phone,
        name: name.trim(),
        profession: profession.trim(),
        city: city.trim(),
      });

      // Сохраняем пользователя
      login(response.user);
      haptics.success();
      showToast('success', 'Добро пожаловать!');

      // Переходим в приложение
      navigation.replace('Main');
    } catch (error: any) {
      console.error('Register jobseeker error:', error);
      haptics.error();
      showToast('error', error.response?.data?.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Регистрация работодателя
   */
  const handleRegisterEmployer = async () => {
    if (!validateEmployer()) {
      haptics.error();
      return;
    }

    try {
      setLoading(true);
      haptics.light();

      const response = await api.registerEmployer({
        phone,
        email: email.trim().toLowerCase(),
        company_name: companyName.trim(),
        inn: inn.trim(),
        legal_address: legalAddress.trim() || undefined,
      });

      // Сохраняем пользователя
      login(response.user);
      haptics.success();
      showToast('success', 'Компания зарегистрирована!');

      // Переходим в приложение
      navigation.replace('Main');
    } catch (error: any) {
      console.error('Register employer error:', error);
      haptics.error();
      showToast('error', error.response?.data?.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Обработка регистрации
   */
  const handleRegister = () => {
    if (role === 'jobseeker') {
      handleRegisterJobSeeker();
    } else if (role === 'employer') {
      handleRegisterEmployer();
    }
  };

  /**
   * Выбор роли
   */
  const renderRoleSelection = () => (
    <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.roleContainer}>
      <Text style={styles.subtitle}>Выберите тип аккаунта</Text>

      <TouchableOpacity
        style={styles.roleCard}
        onPress={() => {
          setRole('jobseeker');
          haptics.light();
        }}
        activeOpacity={0.8}
      >
        <GlassCard variant="medium" style={styles.roleCardInner}>
          <MetalIcon name="briefcase-account" variant="platinum" size="medium" />
          <Text style={styles.roleTitle}>Ищу работу</Text>
          <Text style={styles.roleDescription}>
            Найдите работу мечты{'\n'}в вашем городе
          </Text>
        </GlassCard>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.roleCard}
        onPress={() => {
          setRole('employer');
          haptics.light();
        }}
        activeOpacity={0.8}
      >
        <GlassCard variant="medium" style={styles.roleCardInner}>
          <MetalIcon name="domain" variant="steel" size="medium" />
          <Text style={styles.roleTitle}>Ищу сотрудников</Text>
          <Text style={styles.roleDescription}>
            Найдите лучших кандидатов{'\n'}для вашей компании
          </Text>
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  );

  /**
   * Форма соискателя
   */
  const renderJobSeekerForm = () => (
    <Animated.View entering={FadeInUp.delay(200).duration(600)}>
      <GlassCard variant="medium" style={styles.formCard}>
        <View style={styles.formHeader}>
          <TouchableOpacity
            onPress={() => {
              setRole(null);
              setErrors({});
              haptics.light();
            }}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={20} color={colors.chromeSilver} />
          </TouchableOpacity>
          <Text style={styles.formTitle}>Регистрация соискателя</Text>
        </View>

        {/* Имя */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Ваше имя</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) setErrors({ ...errors, name: '' });
            }}
            placeholder="Иван Иванов"
            placeholderTextColor={colors.stoneGray}
            editable={!loading}
            {...getTextSelectionProps(colors.platinumSilver)}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Профессия */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Профессия</Text>
          <TextInput
            style={[styles.input, errors.profession && styles.inputError]}
            value={profession}
            onChangeText={(text) => {
              setProfession(text);
              if (errors.profession) setErrors({ ...errors, profession: '' });
            }}
            placeholder="Например, Менеджер"
            placeholderTextColor={colors.stoneGray}
            editable={!loading}
            {...getTextSelectionProps(colors.platinumSilver)}
          />
          {errors.profession && <Text style={styles.errorText}>{errors.profession}</Text>}
        </View>

        {/* Город */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Город</Text>
          <TextInput
            style={[styles.input, errors.city && styles.inputError]}
            value={city}
            onChangeText={(text) => {
              setCity(text);
              if (errors.city) setErrors({ ...errors, city: '' });
            }}
            placeholder="Москва"
            placeholderTextColor={colors.stoneGray}
            editable={!loading}
            {...getTextSelectionProps(colors.platinumSilver)}
          />
          {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={metalGradients.platinum}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitGradient}
          >
            {loading ? (
              <LoadingSpinner size="small" variant="spinner" color={colors.graphiteBlack} />
            ) : (
              <>
                <Icon name="check" size={20} color={colors.graphiteBlack} />
                <Text style={styles.submitText}>ЗАРЕГИСТРИРОВАТЬСЯ</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </GlassCard>
    </Animated.View>
  );

  /**
   * Форма работодателя
   */
  const renderEmployerForm = () => (
    <Animated.View entering={FadeInUp.delay(200).duration(600)}>
      <GlassCard variant="medium" style={styles.formCard}>
        <View style={styles.formHeader}>
          <TouchableOpacity
            onPress={() => {
              setRole(null);
              setErrors({});
              haptics.light();
            }}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={20} color={colors.chromeSilver} />
          </TouchableOpacity>
          <Text style={styles.formTitle}>Регистрация компании</Text>
        </View>

        {/* Email */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors({ ...errors, email: '' });
            }}
            placeholder="company@example.com"
            placeholderTextColor={colors.stoneGray}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
            {...getTextSelectionProps(colors.platinumSilver)}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        {/* Название компании */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Название компании</Text>
          <TextInput
            style={[styles.input, errors.companyName && styles.inputError]}
            value={companyName}
            onChangeText={(text) => {
              setCompanyName(text);
              if (errors.companyName) setErrors({ ...errors, companyName: '' });
            }}
            placeholder='ООО "Рога и Копыта"'
            placeholderTextColor={colors.stoneGray}
            editable={!loading}
            {...getTextSelectionProps(colors.platinumSilver)}
          />
          {errors.companyName && <Text style={styles.errorText}>{errors.companyName}</Text>}
        </View>

        {/* ИНН */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>ИНН</Text>
          <TextInput
            style={[styles.input, errors.inn && styles.inputError]}
            value={inn}
            onChangeText={(text) => {
              const cleaned = text.replace(/\D/g, '').slice(0, 12);
              setInn(cleaned);
              if (errors.inn) setErrors({ ...errors, inn: '' });
            }}
            placeholder="1234567890"
            placeholderTextColor={colors.stoneGray}
            keyboardType="number-pad"
            maxLength={12}
            editable={!loading}
            {...getTextSelectionProps(colors.platinumSilver)}
          />
          {errors.inn && <Text style={styles.errorText}>{errors.inn}</Text>}
          <Text style={styles.hint}>10 или 12 цифр</Text>
        </View>

        {/* Юридический адрес (optional) */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Юридический адрес <Text style={styles.optional}>(необязательно)</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={legalAddress}
            onChangeText={setLegalAddress}
            placeholder="г. Москва, ул. Примерная, д. 1"
            placeholderTextColor={colors.stoneGray}
            editable={!loading}
            multiline
            numberOfLines={2}
            {...getTextSelectionProps(colors.platinumSilver)}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={metalGradients.steel}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitGradient}
          >
            {loading ? (
              <LoadingSpinner size="small" variant="spinner" color={colors.graphiteBlack} />
            ) : (
              <>
                <Icon name="check" size={20} color={colors.graphiteBlack} />
                <Text style={styles.submitText}>ЗАРЕГИСТРИРОВАТЬ КОМПАНИЮ</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </GlassCard>
    </Animated.View>
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
          {!role && (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.headerBackButton}
            >
              <Icon name="arrow-left" size={24} color={colors.softWhite} />
            </TouchableOpacity>
          )}

          <MetalIcon name="account-plus" variant="platinum" size="large" glow />
          <Text style={styles.title}>Регистрация</Text>
          <Text style={styles.headerSubtitle}>
            Номер телефона: <Text style={styles.phone}>{formattedPhone}</Text>
          </Text>
        </Animated.View>

        {/* Content */}
        {!role && renderRoleSelection()}
        {role === 'jobseeker' && renderJobSeekerForm()}
        {role === 'employer' && renderEmployerForm()}
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
    paddingHorizontal: sizes.xl,
    paddingVertical: sizes.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: sizes.xxl,
  },
  headerBackButton: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  title: {
    ...typography.h1,
    color: colors.softWhite,
    marginTop: sizes.lg,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.chromeSilver,
    marginTop: sizes.sm,
    textAlign: 'center',
  },
  phone: {
    ...typography.bodyMedium,
    color: colors.platinumSilver,
  },
  subtitle: {
    ...typography.h3,
    color: colors.softWhite,
    textAlign: 'center',
    marginBottom: sizes.xl,
  },
  roleContainer: {
    gap: sizes.lg,
  },
  roleCard: {
    marginBottom: sizes.md,
  },
  roleCardInner: {
    alignItems: 'center',
    paddingVertical: sizes.xl,
  },
  roleTitle: {
    ...typography.h2,
    color: colors.softWhite,
    marginTop: sizes.md,
    marginBottom: sizes.xs,
  },
  roleDescription: {
    ...typography.body,
    color: colors.chromeSilver,
    textAlign: 'center',
    lineHeight: 20,
  },
  formCard: {
    marginBottom: sizes.lg,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sizes.xl,
  },
  backButton: {
    marginRight: sizes.sm,
  },
  formTitle: {
    ...typography.h2,
    color: colors.softWhite,
  },
  inputContainer: {
    marginBottom: sizes.lg,
  },
  label: {
    ...typography.bodyMedium,
    color: colors.platinumSilver,
    marginBottom: sizes.sm,
  },
  optional: {
    ...typography.caption,
    color: colors.chromeSilver,
  },
  input: {
    ...typography.body,
    color: colors.softWhite,
    backgroundColor: colors.slateGray,
    borderRadius: sizes.radiusMedium,
    paddingHorizontal: sizes.lg,
    paddingVertical: sizes.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    ...typography.micro,
    color: colors.error,
    marginTop: sizes.xs,
  },
  hint: {
    ...typography.caption,
    color: colors.chromeSilver,
    marginTop: sizes.xs,
  },
  submitButton: {
    borderRadius: sizes.radiusLarge,
    overflow: 'hidden',
    marginTop: sizes.md,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sizes.md + 2,
    gap: sizes.sm,
  },
  submitText: {
    ...typography.h3,
    color: colors.graphiteBlack,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});
