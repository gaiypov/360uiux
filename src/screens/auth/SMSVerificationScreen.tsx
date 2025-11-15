/**
 * 360° РАБОТА - ULTRA EDITION
 * SMS Verification Screen
 * P1 FIX: Added race condition protection for async operations
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

  // P1 FIX: Prevent race conditions with async operations
  const isCancelledRef = useRef(false);

  /**
   * Component cleanup
   */
  useEffect(() => {
    return () => {
      isCancelledRef.current = true;
    };
  }, []);

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
   * Fixed: Added await for login() to prevent race conditions
   * P1 FIX: Added isCancelled checks to prevent setState after unmount
   */
  const handleVerifyCode = async (codeToVerify?: string) => {
    try {
      const fullCode = codeToVerify || code.join('');

      if (fullCode.length !== 4) {
        if (!isCancelledRef.current) setError('Введите 4-значный код');
        haptics.error();
        return;
      }

      if (!isCancelledRef.current) {
        setError('');
        setLoading(true);
      }
      haptics.light();

      console.log('🔐 Verifying code for phone:', phone);

      // Проверяем код
      const response = await api.verifyCode(phone, fullCode);

      if (isCancelledRef.current) return;

      if (response.requiresRegistration) {
        // Нужна регистрация - показываем выбор роли
        console.log('📝 User needs registration');
        haptics.success();
        showToast('success', 'Код подтверждён');

        navigation.replace('RoleSelection', {
          phone,
          formattedPhone,
        });
      } else {
        // Пользователь уже существует - входим
        if (response.user && response.tokens) {
          console.log('✅ Existing user found, logging in...');

          // CRITICAL FIX: Await login to prevent race condition
          await login(response.user);

          haptics.success();
          showToast('success', 'Добро пожаловать!');

          console.log('✅ Login complete, navigating to Main');

          // Переходим в приложение (теперь безопасно - login завершен)
          navigation.replace('Main');
        } else {
          console.error('❌ Invalid response: missing user or tokens');
          throw new Error('Invalid server response');
        }
      }
    } catch (error: any) {
      if (isCancelledRef.current) return;

      console.error('❌ Verify code error:', error);
      haptics.error();

      const message = error.response?.data?.message || 'Неверный код';
      if (!isCancelledRef.current) {
        setError(message);
        showToast('error', message);

        // Очищаем поля
        setCode(['', '', '', '']);
        inputRefs[0].current?.focus();
      }
    } finally {
      if (!isCancelledRef.current) {
        setLoading(false);
      }
    }
  };

  /**
   * Повторная отправка кода
   * P1 FIX: Added isCancelled checks to prevent setState after unmount
   */
  const handleResendCode = async () => {
    try {
      if (!isCancelledRef.current) setResending(true);
      haptics.light();

      await api.sendCode(phone);

      if (isCancelledRef.current) return;

      setTimer(60);
      haptics.success();
      showToast('success', 'Код отправлен повторно');
    } catch (error: any) {
      if (isCancelledRef.current) return;

      console.error('Resend code error:', error);
      haptics.error();
      showToast('error', 'Ошибка отправки кода');
    } finally {
      if (!isCancelledRef.current) {
        setResending(false);
      }
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
    color: colors.liquidSilver,
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
    color: colors.liquidSilver,
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
    color: colors.liquidSilver,
  },
});
