/**
 * 360° РАБОТА - ULTRA EDITION
 * Employer Profile Screen - Company Profile & Verification
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GlassCard, GlassButton, MetalIcon } from '@/components/ui';
import { colors, typography, sizes } from '@/constants';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { haptics } from '@/utils/haptics';

export function EmployerProfileScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { showToast } = useToastStore();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [contactName, setContactName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [inn, setInn] = useState(user?.inn || '');
  const [kpp, setKpp] = useState(user?.kpp || '');
  const [legalAddress, setLegalAddress] = useState(user?.legalAddress || '');
  const [actualAddress, setActualAddress] = useState(user?.actualAddress || '');

  const handleSave = useCallback(async () => {
    haptics.medium();
    setSaving(true);

    try {
      // TODO: Replace with real API call
      // await employerApi.updateProfile({
      //   companyName,
      //   name: contactName,
      //   email,
      //   inn,
      //   kpp,
      //   legalAddress,
      //   actualAddress,
      // });

      // Mock success
      await new Promise(resolve => setTimeout(resolve, 1000));

      showToast('success', 'Профиль обновлен');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      showToast('error', 'Ошибка обновления профиля');
    } finally {
      setSaving(false);
    }
  }, [companyName, contactName, email, inn, kpp, legalAddress, actualAddress, showToast]);

  const handleRequestVerification = () => {
    haptics.medium();
    Alert.alert(
      'Верификация компании',
      'Для верификации компании вам необходимо предоставить документы:\n\n' +
      '• Выписка из ЕГРЮЛ\n' +
      '• Устав компании\n' +
      '• Паспорт директора\n\n' +
      'Отправить заявку?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Отправить',
          onPress: async () => {
            try {
              // TODO: API call
              showToast('success', 'Заявка на верификацию отправлена');
            } catch (error) {
              showToast('error', 'Ошибка отправки заявки');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти из аккаунта?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: () => {
            // TODO: Logout logic
            showToast('success', 'Вы вышли из аккаунта');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />

      {/* Header */}
      <View style={styles.header}>
        <MetalIcon name="office-building" variant="gold" size="medium" glow />
        <Text style={styles.title}>Профиль компании</Text>
        <TouchableOpacity
          onPress={() => {
            haptics.light();
            if (isEditing && !saving) {
              setIsEditing(false);
              // Reset form
              setCompanyName(user?.companyName || '');
              setContactName(user?.name || '');
              setEmail(user?.email || '');
            } else {
              setIsEditing(true);
            }
          }}
          style={styles.editButton}
        >
          <Icon
            name={isEditing ? 'close' : 'pencil'}
            size={20}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Verification Status */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <GlassCard style={styles.verificationCard}>
            <View style={styles.verificationRow}>
              {user?.verified ? (
                <>
                  <Icon name="check-decagram" size={32} color={colors.accentGreen} />
                  <View style={styles.verificationText}>
                    <Text style={styles.verificationTitle}>Компания верифицирована</Text>
                    <Text style={styles.verificationSubtitle}>
                      Ваша компания прошла проверку документов
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <Icon name="alert-circle" size={32} color={colors.accentOrange} />
                  <View style={styles.verificationText}>
                    <Text style={styles.verificationTitle}>Требуется верификация</Text>
                    <Text style={styles.verificationSubtitle}>
                      Верифицируйте компанию для повышения доверия
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleRequestVerification}
                    style={styles.verifyButton}
                  >
                    <Icon name="shield-check" size={16} color={colors.accentBlue} />
                    <Text style={styles.verifyButtonText}>Верифицировать</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </GlassCard>
        </Animated.View>

        {/* Company Info */}
        <Animated.View entering={FadeInDown.delay(50).duration(400)}>
          <Text style={styles.sectionTitle}>ОСНОВНАЯ ИНФОРМАЦИЯ</Text>
          <GlassCard style={styles.infoCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Название компании</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={companyName}
                onChangeText={setCompanyName}
                placeholder="ООО «Название компании»"
                placeholderTextColor={colors.textSecondary}
                editable={isEditing}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Контактное лицо</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={contactName}
                onChangeText={setContactName}
                placeholder="Иванов Иван Иванович"
                placeholderTextColor={colors.textSecondary}
                editable={isEditing}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={email}
                onChangeText={setEmail}
                placeholder="info@company.ru"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={isEditing}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Телефон</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={user?.phone || ''}
                editable={false}
              />
              <Text style={styles.inputHint}>Телефон нельзя изменить</Text>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Legal Info */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Text style={styles.sectionTitle}>ЮРИДИЧЕСКИЕ ДАННЫЕ</Text>
          <GlassCard style={styles.infoCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ИНН</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={inn}
                onChangeText={setInn}
                placeholder="1234567890"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                maxLength={12}
                editable={isEditing}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>КПП</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={kpp}
                onChangeText={setKpp}
                placeholder="123456789"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                maxLength={9}
                editable={isEditing}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Юридический адрес</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline, !isEditing && styles.inputDisabled]}
                value={legalAddress}
                onChangeText={setLegalAddress}
                placeholder="г. Москва, ул. Примерная, д. 1"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={2}
                editable={isEditing}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Фактический адрес</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline, !isEditing && styles.inputDisabled]}
                value={actualAddress}
                onChangeText={setActualAddress}
                placeholder="г. Москва, ул. Примерная, д. 1"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={2}
                editable={isEditing}
              />
            </View>
          </GlassCard>
        </Animated.View>

        {/* Statistics */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <Text style={styles.sectionTitle}>СТАТИСТИКА</Text>
          <GlassCard style={styles.statsCard}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Icon name="briefcase" size={24} color={colors.accentPurple} />
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>Вакансий</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="account-multiple" size={24} color={colors.accentBlue} />
                <Text style={styles.statValue}>184</Text>
                <Text style={styles.statLabel}>Откликов</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="eye" size={24} color={colors.accentGreen} />
                <Text style={styles.statValue}>4.2K</Text>
                <Text style={styles.statLabel}>Просмотров</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="star" size={24} color={colors.accentOrange} />
                <Text style={styles.statValue}>4.8</Text>
                <Text style={styles.statLabel}>Рейтинг</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Save Button */}
        {isEditing && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.saveContainer}>
            <GlassButton
              title={saving ? 'Сохранение...' : 'Сохранить изменения'}
              onPress={handleSave}
              icon="content-save"
              variant="primary"
              disabled={saving}
            />
          </Animated.View>
        )}

        {/* Logout */}
        {!isEditing && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.logoutContainer}>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Icon name="logout" size={20} color={colors.accentRed} />
              <Text style={styles.logoutText}>Выйти из аккаунта</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
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
    paddingTop: sizes.xl,
    paddingBottom: sizes.md,
    gap: sizes.sm,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    flex: 1,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glassBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  verificationCard: {
    marginHorizontal: sizes.lg,
    padding: sizes.md,
    marginBottom: sizes.md,
  },
  verificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.md,
  },
  verificationText: {
    flex: 1,
  },
  verificationTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 4,
  },
  verificationSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: sizes.md,
    paddingVertical: sizes.sm,
    backgroundColor: `${colors.accentBlue}20`,
    borderRadius: 8,
  },
  verifyButtonText: {
    ...typography.caption,
    color: colors.accentBlue,
    fontWeight: '600',
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginHorizontal: sizes.lg,
    marginTop: sizes.xl,
    marginBottom: sizes.sm,
  },
  infoCard: {
    marginHorizontal: sizes.lg,
    padding: sizes.md,
    marginBottom: sizes.md,
  },
  inputGroup: {
    marginBottom: sizes.md,
  },
  inputLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: sizes.xs,
    fontWeight: '600',
  },
  input: {
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.glassBackground,
    borderRadius: 8,
    paddingHorizontal: sizes.md,
    paddingVertical: sizes.sm,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  inputMultiline: {
    minHeight: 60,
    textAlignVertical: 'top',
    paddingTop: sizes.sm,
  },
  inputHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
    fontSize: 11,
  },
  statsCard: {
    marginHorizontal: sizes.lg,
    padding: sizes.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    width: '25%',
  },
  statValue: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
    marginTop: sizes.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  saveContainer: {
    paddingHorizontal: sizes.lg,
    marginTop: sizes.lg,
  },
  logoutContainer: {
    paddingHorizontal: sizes.lg,
    marginTop: sizes.xl,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sizes.sm,
    padding: sizes.md,
    borderRadius: 12,
    backgroundColor: `${colors.accentRed}20`,
  },
  logoutText: {
    ...typography.body,
    color: colors.accentRed,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: sizes.xxl * 2,
  },
});
