/**
 * 360° РАБОТА - ULTRA EDITION
 * Login Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { GlassButton, GlassCard } from '@/components/ui';
import { colors, metalGradients, typography, sizes } from "@/constants";

interface LoginScreenProps {
  onLogin: () => void;
  onSignUp: () => void;
}

export function LoginScreen({ onLogin, onSignUp }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primaryBlack}
        translucent
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>360°</Text>
        <Text style={styles.subtitle}>Войти в аккаунт</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <GlassCard>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor={colors.liquidSilver}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Пароль</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.liquidSilver}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.forgotButton}>
            <Text style={styles.forgotText}>Забыли пароль?</Text>
          </TouchableOpacity>
        </GlassCard>

        <View style={styles.buttonContainer}>
          <GlassButton
            title="ВОЙТИ"
            onPress={onLogin}
            variant="primary"
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>или</Text>
            <View style={styles.dividerLine} />
          </View>

          <GlassButton
            title="СОЗДАТЬ АККАУНТ"
            onPress={onSignUp}
            variant="secondary"
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBlack,
    paddingHorizontal: sizes.lg,
  },
  header: {
    marginTop: 100,
    marginBottom: sizes.xxl,
    alignItems: 'center',
  },
  logo: {
    ...typography.h1,
    fontSize: 56,
    color: colors.softWhite,
    letterSpacing: 4,
    marginBottom: sizes.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.liquidSilver,
  },
  form: {
    gap: sizes.lg,
  },
  inputContainer: {
    marginBottom: sizes.md,
  },
  label: {
    ...typography.caption,
    color: colors.liquidSilver,
    marginBottom: sizes.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    ...typography.body,
    color: colors.softWhite,
    backgroundColor: colors.slateGray,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: sizes.radiusMedium,
    paddingHorizontal: sizes.md,
    paddingVertical: sizes.md,
  },
  forgotButton: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    ...typography.caption,
    color: colors.platinumSilver,
  },
  buttonContainer: {
    gap: sizes.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: sizes.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.glassBorder,
  },
  dividerText: {
    ...typography.caption,
    color: colors.liquidSilver,
    marginHorizontal: sizes.md,
  },
});
