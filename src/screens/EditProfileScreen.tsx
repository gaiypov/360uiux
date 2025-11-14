/**
 * 360° РАБОТА - ULTRA EDITION
 * Edit Profile Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { GlassCard, MetalIcon, LoadingSpinner } from '@/components/ui';
import { colors, metalGradients, typography, sizes } from '@/constants';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { validateName, validateEmail, validatePhone } from '@/utils/validation';
import { haptics } from '@/utils/haptics';
import { getKeyboardBehavior, getTextSelectionProps } from '@/utils/platform';

export function EditProfileScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { showToast } = useToastStore();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [about, setAbout] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = async () => {
    const nameValidation = validateName(name);
    const emailValidation = validateEmail(email);
    const phoneValidation = phone ? validatePhone(phone) : { isValid: true };

    const newErrors: Record<string, string> = {};
    
    if (!nameValidation.isValid) newErrors.name = nameValidation.error!;
    if (!emailValidation.isValid) newErrors.email = emailValidation.error!;
    if (!phoneValidation.isValid) newErrors.phone = phoneValidation.error!;

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
      
      // Update user in store
      // updateUser({ name, email, phone, city, about });
      
      haptics.success();
      showToast('success', 'Профиль обновлен');
      navigation.goBack();
    } catch (error) {
      haptics.error();
      showToast('error', 'Ошибка сохранения');
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
        <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color={colors.softWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Редактировать профиль</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {/* Avatar */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.avatarSection}>
          <View style={styles.avatar}>
            <MetalIcon name="account" variant="platinum" size="medium" />
          </View>
          <TouchableOpacity
            onPress={() => {
              haptics.light();
              showToast('info', 'Загрузка фото скоро будет доступна');
            }}
          >
            <Text style={styles.changePhotoText}>Изменить фото</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Form */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <GlassCard variant="medium" style={styles.formCard}>
            {/* Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Имя *</Text>
              <View style={[styles.inputWrapper, errors.name && styles.inputError]}>
                <Icon name="account" size={20} color={colors.chromeSilver} />
                <TextInput
                  style={styles.input}
                  placeholder="Введите имя"
                  placeholderTextColor={colors.graphiteSilver}
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  editable={!loading}
                  {...getTextSelectionProps(colors.platinumSilver)}
                />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email *</Text>
              <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                <Icon name="email-outline" size={20} color={colors.chromeSilver} />
                <TextInput
                  style={styles.input}
                  placeholder="example@mail.ru"
                  placeholderTextColor={colors.graphiteSilver}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                  {...getTextSelectionProps(colors.platinumSilver)}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Phone */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Телефон</Text>
              <View style={[styles.inputWrapper, errors.phone && styles.inputError]}>
                <Icon name="phone" size={20} color={colors.chromeSilver} />
                <TextInput
                  style={styles.input}
                  placeholder="+7 (___) ___-__-__"
                  placeholderTextColor={colors.graphiteSilver}
                  value={phone}
                  onChangeText={(text) => {
                    setPhone(text);
                    if (errors.phone) setErrors({ ...errors, phone: '' });
                  }}
                  keyboardType="phone-pad"
                  editable={!loading}
                  {...getTextSelectionProps(colors.platinumSilver)}
                />
              </View>
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            {/* City */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Город</Text>
              <View style={styles.inputWrapper}>
                <Icon name="map-marker" size={20} color={colors.chromeSilver} />
                <TextInput
                  style={styles.input}
                  placeholder="Москва"
                  placeholderTextColor={colors.graphiteSilver}
                  value={city}
                  onChangeText={setCity}
                  editable={!loading}
                  {...getTextSelectionProps(colors.platinumSilver)}
                />
              </View>
            </View>

            {/* About */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>О себе</Text>
              <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Расскажите о себе..."
                  placeholderTextColor={colors.graphiteSilver}
                  value={about}
                  onChangeText={setAbout}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={!loading}
                  {...getTextSelectionProps(colors.platinumSilver)}
                />
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Save Button */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={metalGradients.platinum}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveGradient}
            >
              {loading ? (
                <LoadingSpinner size="small" variant="spinner" color={colors.graphiteBlack} />
              ) : (
                <>
                  <Icon name="content-save" size={20} color={colors.graphiteBlack} />
                  <Text style={styles.saveText}>СОХРАНИТЬ</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: sizes.xxl }} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sizes.lg,
    paddingTop: sizes.xxl,
    paddingBottom: sizes.md,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.softWhite,
  },
  scrollContent: {
    paddingHorizontal: sizes.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: sizes.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.carbonGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: sizes.md,
  },
  changePhotoText: {
    ...typography.bodyMedium,
    color: colors.platinumSilver,
  },
  formCard: {
    marginBottom: sizes.lg,
  },
  inputContainer: {
    marginBottom: sizes.lg,
  },
  inputLabel: {
    ...typography.captionMedium,
    color: colors.liquidSilver,
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
  textAreaWrapper: {
    alignItems: 'flex-start',
    paddingVertical: sizes.sm,
  },
  input: {
    ...typography.body,
    flex: 1,
    color: colors.softWhite,
    paddingVertical: sizes.md,
    marginLeft: sizes.sm,
  },
  textArea: {
    height: 100,
    marginLeft: 0,
  },
  errorText: {
    ...typography.micro,
    color: colors.error,
    marginTop: sizes.xs,
    marginLeft: sizes.sm,
  },
  buttonContainer: {
    marginTop: sizes.md,
  },
  saveButton: {
    borderRadius: sizes.radiusLarge,
    overflow: 'hidden',
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sizes.md + 2,
    gap: sizes.sm,
  },
  saveText: {
    ...typography.h3,
    color: colors.graphiteBlack,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});
