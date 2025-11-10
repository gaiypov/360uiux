/**
 * 360° РАБОТА - ULTRA EDITION
 * SMS Verification Screen
 */

import React, { useState, useRef, useEffect } from 'react';
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

export function SMSVerificationScreen({ route, navigation }: Props) {
  const { phone, formattedPhone } = route.params;
  const { showToast } = useToastStore();
  const { login } = useAuthStore();

  const [code, setCode] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);

  const inputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  /**
   * Таймер для повторной отправки
   */
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  /**
   * Обработка ввода цифры
   */
  const handleChangeText = (text: string, index: number) => {
    // Только цифры
    const digit = text.replace(/\D/g, '').slice(-1);

    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    if (error) setError('');

    // Переход на следующее поле
    if (digit && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Автоматическая отправка при заполнении всех полей
    if (index === 3 && digit) {
      const fullCode = newCode.join('');
      if (fullCode.length === 4) {
        handleVerifyCode(fullCode);
      }
    }
  };

  /**
   * Обработка удаления
   */
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  /**
   * Проверка кода
   */
  const handleVerifyCode = async (codeToVerify?: string) => {
    try {
      const fullCode = codeToVerify || code.join('');

      if (fullCode.length !== 4) {
        setError('Введите 4-значный код');
        haptics.error();
        return;
      }

      setError('');
      setLoading(true);
      haptics.light();

      // Проверяем код
      const response = await api.verifyCode(phone, fullCode);

      if (response.requiresRegistration) {
        // Нужна регистрация - переходим на выбор роли
        haptics.success();
        showToast('success', 'Код подтверждён');

        navigation.replace('RoleSelection', {
          phone,
          formattedPhone,
        });
      } else {
        // Пользователь уже существует - входим
        if (response.user && response.tokens) {
          login(response.user);
          haptics.success();
          showToast('success', 'Добро пожаловать!');

          // Переходим в приложение
          navigation.replace('Main');
        }
      }
    } catch (error: any) {
      console.error('Verify code error:', error);
      haptics.error();

      const message = error.response?.data?.message || 'Неверный код';
      setError(message);
      showToast('error', message);

      // Очищаем поля
      setCode(['', '', '', '']);
      inputRefs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Повторная отправка кода
   */
  const handleResendCode = async () => {
    try {
      setResending(true);
      haptics.light();

      await api.sendCode(phone);

      setTimer(60);
      haptics.success();
      showToast('success', 'Код отправлен повторно');
    } catch (error: any) {
      console.error('Resend code error:', error);
      haptics.error();
      showToast('error', 'Ошибка отправки кода');
    } finally {
      setResending(false);
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
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            disabled={loading}
          >
            <Icon name="arrow-left" size={24} color={colors.softWhite} />
          </TouchableOpacity>

          <MetalIcon name="message-badge" variant="platinum" size="large" glow />
          <Text style={styles.title}>Введите код</Text>
          <Text style={styles.subtitle}>
            Мы отправили SMS с кодом на номер{'\n'}
            <Text style={styles.phone}>{formattedPhone}</Text>
          </Text>
        </Animated.View>

        {/* Code Input Form */}
        <Animated.View entering={FadeInUp.delay(200).duration(600)}>
          <GlassCard variant="medium" style={styles.formCard}>
            {/* Code Inputs */}
            <View style={styles.codeContainer}>
              {code.map((digit, index) => (
                <View
                  key={index}
                  style={[
                    styles.codeInputWrapper,
                    digit && styles.codeInputFilled,
                    error && styles.codeInputError,
                  ]}
                >
                  <TextInput
                    ref={inputRefs[index]}
                    style={styles.codeInput}
                    value={digit}
                    onChangeText={(text) => handleChangeText(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    editable={!loading}
                    {...getTextSelectionProps(colors.platinumSilver)}
                  />
                </View>
              ))}
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            {/* Resend Timer */}
            {timer > 0 ? (
              <Text style={styles.timerText}>
                Повторная отправка через {timer} сек
              </Text>
            ) : (
              <TouchableOpacity
                onPress={handleResendCode}
                disabled={resending}
                style={styles.resendButton}
              >
                <Text style={styles.resendText}>
                  {resending ? 'Отправка...' : 'Отправить код повторно'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Verify Button */}
            {!loading && code.join('').length === 4 && (
              <TouchableOpacity
                style={styles.verifyButton}
                onPress={() => handleVerifyCode()}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={metalGradients.platinum}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.verifyGradient}
                >
                  <Icon name="check" size={20} color={colors.graphiteBlack} />
                  <Text style={styles.verifyText}>ПОДТВЕРДИТЬ</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Loading */}
            {loading && (
              <View style={styles.loadingContainer}>
                <LoadingSpinner size="small" variant="spinner" color={colors.platinumSilver} />
                <Text style={styles.loadingText}>Проверка кода...</Text>
              </View>
            )}
          </GlassCard>
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
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  title: {
    ...typography.h1,
    color: colors.softWhite,
    marginTop: sizes.lg,
  },
  subtitle: {
    ...typography.body,
    color: colors.chromeSilver,
    marginTop: sizes.sm,
    textAlign: 'center',
  },
  phone: {
    ...typography.bodyMedium,
    color: colors.platinumSilver,
  },
  formCard: {
    marginBottom: sizes.lg,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: sizes.lg,
    gap: sizes.sm,
  },
  codeInputWrapper: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: colors.slateGray,
    borderRadius: sizes.radiusMedium,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeInputFilled: {
    borderColor: colors.platinumSilver,
  },
  codeInputError: {
    borderColor: colors.error,
  },
  codeInput: {
    ...typography.h1,
    color: colors.softWhite,
    textAlign: 'center',
    width: '100%',
    padding: 0,
  },
  errorText: {
    ...typography.micro,
    color: colors.error,
    textAlign: 'center',
    marginBottom: sizes.md,
  },
  timerText: {
    ...typography.caption,
    color: colors.chromeSilver,
    textAlign: 'center',
    marginBottom: sizes.lg,
  },
  resendButton: {
    alignSelf: 'center',
    marginBottom: sizes.lg,
  },
  resendText: {
    ...typography.bodyMedium,
    color: colors.platinumSilver,
    textDecorationLine: 'underline',
  },
  verifyButton: {
    borderRadius: sizes.radiusLarge,
    overflow: 'hidden',
    marginTop: sizes.md,
  },
  verifyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sizes.md + 2,
    gap: sizes.sm,
  },
  verifyText: {
    ...typography.h3,
    color: colors.graphiteBlack,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sizes.sm,
    marginTop: sizes.lg,
  },
  loadingText: {
    ...typography.body,
    color: colors.chromeSilver,
  },
});
