/**
 * 360° РАБОТА - ULTRA EDITION
 * Phone Input Screen
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
import { haptics } from '@/utils/haptics';
import { getKeyboardBehavior, getTextSelectionProps } from '@/utils/platform';
import { api } from '@/services/api';

export function PhoneInputScreen({ navigation }: any) {
  const { showToast } = useToastStore();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Форматирование номера телефона
   */
  const formatPhoneNumber = (text: string) => {
    // Удаляем все кроме цифр
    const cleaned = text.replace(/\D/g, '');

    // Ограничиваем 11 цифрами (7 + 10)
    const limited = cleaned.slice(0, 11);

    // Форматируем: +7 (999) 999-99-99
    if (limited.length === 0) return '';
    if (limited.length <= 1) return `+${limited}`;
    if (limited.length <= 4) return `+${limited[0]} (${limited.slice(1)}`;
    if (limited.length <= 7)
      return `+${limited[0]} (${limited.slice(1, 4)}) ${limited.slice(4)}`;
    if (limited.length <= 9)
      return `+${limited[0]} (${limited.slice(1, 4)}) ${limited.slice(4, 7)}-${limited.slice(7)}`;

    return `+${limited[0]} (${limited.slice(1, 4)}) ${limited.slice(4, 7)}-${limited.slice(7, 9)}-${limited.slice(9, 11)}`;
  };

  /**
   * Получить чистый номер для API
   */
  const getCleanPhone = (formatted: string): string => {
    const cleaned = formatted.replace(/\D/g, '');
    return `+${cleaned}`;
  };

  /**
   * Валидация номера
   */
  const validatePhone = (formatted: string): boolean => {
    const cleaned = formatted.replace(/\D/g, '');
    return cleaned.length === 11 && cleaned.startsWith('7');
  };

  /**
   * Обработка изменения текста
   */
  const handleChangeText = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhone(formatted);
    if (error) setError('');
  };

  /**
   * Отправка SMS кода
   */
  const handleSendCode = async () => {
    try {
      // Валидация
      if (!validatePhone(phone)) {
        setError('Введите корректный номер телефона');
        haptics.error();
        return;
      }

      setError('');
      setLoading(true);
      haptics.light();

      const cleanPhone = getCleanPhone(phone);

      // Отправляем код
      const response = await api.sendCode(cleanPhone);

      haptics.success();
      showToast('success', 'Код отправлен на ваш номер');

      // Переходим на экран ввода кода
      navigation.navigate('SMSVerification', {
        phone: cleanPhone,
        formattedPhone: phone,
      });
    } catch (error: any) {
      console.error('Send code error:', error);
      haptics.error();

      const message =
        error.response?.data?.message || 'Ошибка отправки кода. Попробуйте позже';
      setError(message);
      showToast('error', message);
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
        {/* Logo & Title */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <MetalIcon name="phone-check" variant="platinum" size="large" glow />
          <Text style={styles.title}>360° РАБОТА</Text>
          <Text style={styles.subtitle}>Ultra Edition</Text>
          <Text style={styles.description}>
            Введите номер телефона для входа или регистрации
          </Text>
        </Animated.View>

        {/* Phone Input Form */}
        <Animated.View entering={FadeInUp.delay(200).duration(600)}>
          <GlassCard variant="medium" style={styles.formCard}>
            <Text style={styles.formTitle}>Номер телефона</Text>

            {/* Phone Input */}
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, error && styles.inputError]}>
                <Icon name="cellphone" size={20} color={colors.chromeSilver} />
                <TextInput
                  style={styles.input}
                  placeholder="+7 (999) 999-99-99"
                  placeholderTextColor={colors.graphiteSilver}
                  value={phone}
                  onChangeText={handleChangeText}
                  keyboardType="phone-pad"
                  autoFocus
                  editable={!loading}
                  maxLength={18}
                  {...getTextSelectionProps(colors.platinumSilver)}
                />
              </View>
              {error && <Text style={styles.errorText}>{error}</Text>}
            </View>

            {/* Info */}
            <View style={styles.infoContainer}>
              <Icon name="information-outline" size={16} color={colors.chromeSilver} />
              <Text style={styles.infoText}>
                Мы отправим SMS с кодом подтверждения
              </Text>
            </View>

            {/* Send Button */}
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendCode}
              disabled={loading || !phone}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={metalGradients.platinum}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.sendGradient}
              >
                {loading ? (
                  <LoadingSpinner size="small" variant="spinner" color={colors.graphiteBlack} />
                ) : (
                  <>
                    <Icon name="arrow-right" size={20} color={colors.graphiteBlack} />
                    <Text style={styles.sendText}>ОТПРАВИТЬ КОД</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </GlassCard>
        </Animated.View>

        {/* Terms */}
        <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.footer}>
          <Text style={styles.termsText}>
            Продолжая, вы принимаете{' '}
            <Text style={styles.termsLink}>условия использования</Text> и{' '}
            <Text style={styles.termsLink}>политику конфиденциальности</Text>
          </Text>
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
    color: colors.softWhite,
    marginTop: sizes.lg,
    letterSpacing: 2,
  },
  subtitle: {
    ...typography.body,
    color: colors.platinumSilver,
    marginTop: sizes.xs,
  },
  description: {
    ...typography.body,
    color: colors.liquidSilver,
    marginTop: sizes.lg,
    textAlign: 'center',
    maxWidth: 300,
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
    ...typography.h3,
    flex: 1,
    color: colors.softWhite,
    paddingVertical: sizes.md,
    marginLeft: sizes.sm,
    letterSpacing: 1,
  },
  errorText: {
    ...typography.micro,
    color: colors.error,
    marginTop: sizes.xs,
    marginLeft: sizes.sm,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sizes.lg,
    paddingHorizontal: sizes.sm,
  },
  infoText: {
    ...typography.caption,
    color: colors.liquidSilver,
    marginLeft: sizes.xs,
    flex: 1,
  },
  sendButton: {
    borderRadius: sizes.radiusLarge,
    overflow: 'hidden',
  },
  sendGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sizes.md + 2,
    gap: sizes.sm,
  },
  sendText: {
    ...typography.h3,
    color: colors.graphiteBlack,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  footer: {
    marginTop: sizes.xl,
    paddingHorizontal: sizes.md,
  },
  termsText: {
    ...typography.micro,
    color: colors.graphiteSilver,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: colors.platinumSilver,
    textDecorationLine: 'underline',
  },
});
