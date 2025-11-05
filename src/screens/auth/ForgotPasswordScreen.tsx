/**
 * 360° РАБОТА - ULTRA EDITION
 * Forgot Password Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { GlassCard, MetalIcon, LoadingSpinner } from '@/components/ui';
import { colors, metalGradients, typography, sizes } from '@/constants';
import { useToastStore } from '@/stores/toastStore';
import { validateEmail } from '@/utils/validation';
import { haptics } from '@/utils/haptics';
import { getKeyboardBehavior, getTextSelectionProps } from '@/utils/platform';

export function ForgotPasswordScreen({ navigation }: any) {
  const { showToast } = useToastStore();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleResetPassword = async () => {
    const emailValidation = validateEmail(email);
    
    if (!emailValidation.isValid) {
      setError(emailValidation.error!);
      haptics.error();
      return;
    }

    setError('');
    setLoading(true);
    haptics.light();

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setSent(true);
      haptics.success();
      showToast('success', 'Ссылка для восстановления отправлена на email');
      
      setTimeout(() => {
        navigation.goBack();
      }, 3000);
    } catch (err) {
      haptics.error();
      showToast('error', 'Ошибка отправки');
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

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <MetalIcon name="lock-reset" variant="platinum" size="large" glow />
          <Text style={styles.title}>Восстановление пароля</Text>
          <Text style={styles.subtitle}>
            Введите email, на который зарегистрирован аккаунт
          </Text>
        </Animated.View>

        {!sent ? (
          <Animated.View entering={FadeInDown.delay(200).duration(600)}>
            <GlassCard variant="medium" style={styles.formCard}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={[styles.inputWrapper, error && styles.inputError]}>
                  <Icon name="email-outline" size={20} color={colors.chromeSilver} />
                  <TextInput
                    style={styles.input}
                    placeholder="example@mail.ru"
                    placeholderTextColor={colors.graphiteSilver}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (error) setError('');
                    }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoFocus
                    editable={!loading}
                    {...getTextSelectionProps(colors.platinumSilver)}
                  />
                </View>
                {error && <Text style={styles.errorText}>{error}</Text>}
              </View>

              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleResetPassword}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={metalGradients.platinum}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.resetGradient}
                >
                  {loading ? (
                    <LoadingSpinner size="small" variant="spinner" color={colors.graphiteBlack} />
                  ) : (
                    <>
                      <Icon name="email-send" size={20} color={colors.graphiteBlack} />
                      <Text style={styles.resetText}>ОТПРАВИТЬ ССЫЛКУ</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </GlassCard>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(200).duration(600)}>
            <GlassCard variant="medium" style={styles.successCard}>
              <Icon name="check-circle" size={64} color={colors.platinumSilver} />
              <Text style={styles.successTitle}>Проверьте почту</Text>
              <Text style={styles.successText}>
                Мы отправили ссылку для восстановления пароля на {email}
              </Text>
            </GlassCard>
          </Animated.View>
        )}

        <TouchableOpacity
          onPress={() => {
            haptics.light();
            navigation.goBack();
          }}
          style={styles.backToLogin}
          disabled={loading}
        >
          <Icon name="arrow-left" size={16} color={colors.platinumSilver} />
          <Text style={styles.backText}>Вернуться ко входу</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBlack,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: sizes.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: sizes.xxl,
  },
  title: {
    ...typography.h2,
    color: colors.softWhite,
    marginTop: sizes.md,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.chromeSilver,
    marginTop: sizes.sm,
    textAlign: 'center',
  },
  formCard: {
    marginBottom: sizes.lg,
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
  resetButton: {
    borderRadius: sizes.radiusLarge,
    overflow: 'hidden',
  },
  resetGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sizes.md + 2,
    gap: sizes.sm,
  },
  resetText: {
    ...typography.h3,
    color: colors.graphiteBlack,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  successCard: {
    alignItems: 'center',
    paddingVertical: sizes.xxl,
  },
  successTitle: {
    ...typography.h3,
    color: colors.softWhite,
    marginTop: sizes.lg,
    marginBottom: sizes.sm,
  },
  successText: {
    ...typography.body,
    color: colors.chromeSilver,
    textAlign: 'center',
  },
  backToLogin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sizes.xs,
    marginTop: sizes.lg,
  },
  backText: {
    ...typography.body,
    color: colors.platinumSilver,
  },
});
