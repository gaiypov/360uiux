/**
 * 360° РАБОТА - ULTRA EDITION
 * Admin Settings Screen - System Configuration
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GlassCard, GlassButton, MetalIcon } from '@/components/ui';
import { colors, typography, sizes } from '@/constants';
import { AdminSettings } from '@/types';
import { adminApi } from '@/services/adminApi';
import { useToastStore } from '@/stores/toastStore';
import { haptics } from '@/utils/haptics';

export function AdminSettingsScreen({ navigation }: any) {
  const [settings, setSettings] = useState<AdminSettings>({
    autoModeration: true,
    guestViewLimit: 3,
    resumeVideoViewLimit: 2,
    topVacancyCostPerDay: 500,
    minimumWithdrawal: 1000,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToastStore();

  const loadSettings = useCallback(async () => {
    try {
      const data = await adminApi.getSettings();
      setSettings(data.settings);
    } catch (error: any) {
      console.error('Failed to load settings:', error);
      showToast('error', 'Ошибка загрузки настроек');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const data = await adminApi.getSettings();
        if (mounted) {
          setSettings(data.settings);
        }
      } catch (error: any) {
        console.error('Failed to load settings:', error);
        if (mounted) {
          showToast('error', 'Ошибка загрузки настроек');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [showToast]);

  const handleSave = useCallback(async () => {
    haptics.medium();
    setSaving(true);

    try {
      await adminApi.updateSettings(settings);
      showToast('success', 'Настройки сохранены');
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      showToast('error', 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  }, [settings, showToast]);

  const updateSetting = useCallback((key: keyof AdminSettings, value: any) => {
    haptics.light();
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />
        <View style={styles.loadingContainer}>
          <MetalIcon name="loading" variant="chrome" size="large" glow />
          <Text style={styles.loadingText}>Загрузка...</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Настройки</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Moderation Settings */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <Text style={styles.sectionTitle}>МОДЕРАЦИЯ</Text>
          <GlassCard style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Icon name="robot" size={24} color={colors.accentBlue} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Автомодерация</Text>
                  <Text style={styles.settingDescription}>
                    Автоматическая проверка видео на неприемлемый контент
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.autoModeration}
                onValueChange={(value) => updateSetting('autoModeration', value)}
                trackColor={{ false: colors.glassBorder, true: colors.accentBlue }}
                thumbColor={colors.textPrimary}
              />
            </View>
          </GlassCard>
        </Animated.View>

        {/* Guest Settings */}
        <Animated.View entering={FadeInDown.delay(50).duration(400)}>
          <Text style={styles.sectionTitle}>ГОСТЕВОЙ ДОСТУП</Text>
          <GlassCard style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Icon name="eye" size={24} color={colors.accentPurple} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Лимит просмотров для гостей</Text>
                  <Text style={styles.settingDescription}>
                    Количество вакансий, которые может просмотреть гость
                  </Text>
                </View>
              </View>
              <TextInput
                style={styles.numberInput}
                value={String(settings.guestViewLimit)}
                onChangeText={(text) => updateSetting('guestViewLimit', parseInt(text) || 0)}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
          </GlassCard>
        </Animated.View>

        {/* Resume Video Settings */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Text style={styles.sectionTitle}>ВИДЕО-РЕЗЮМЕ</Text>
          <GlassCard style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Icon name="video-account" size={24} color={colors.accentOrange} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Лимит просмотров резюме</Text>
                  <Text style={styles.settingDescription}>
                    Сколько раз работодатель может просмотреть видео-резюме
                  </Text>
                </View>
              </View>
              <TextInput
                style={styles.numberInput}
                value={String(settings.resumeVideoViewLimit)}
                onChangeText={(text) => updateSetting('resumeVideoViewLimit', parseInt(text) || 0)}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
          </GlassCard>
        </Animated.View>

        {/* Billing Settings */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <Text style={styles.sectionTitle}>БИЛЛИНГ</Text>
          <GlassCard style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Icon name="crown" size={24} color={colors.accentOrange} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Стоимость топ вакансии</Text>
                  <Text style={styles.settingDescription}>
                    Цена за 1 день размещения в топе (в рублях)
                  </Text>
                </View>
              </View>
              <TextInput
                style={styles.numberInput}
                value={String(settings.topVacancyCostPerDay)}
                onChangeText={(text) => updateSetting('topVacancyCostPerDay', parseInt(text) || 0)}
                keyboardType="number-pad"
                maxLength={5}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Icon name="cash" size={24} color={colors.accentGreen} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Минимальная сумма вывода</Text>
                  <Text style={styles.settingDescription}>
                    Минимальная сумма для вывода средств (в рублях)
                  </Text>
                </View>
              </View>
              <TextInput
                style={styles.numberInput}
                value={String(settings.minimumWithdrawal)}
                onChangeText={(text) => updateSetting('minimumWithdrawal', parseInt(text) || 0)}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>
          </GlassCard>
        </Animated.View>

        {/* System Info */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Text style={styles.sectionTitle}>ИНФОРМАЦИЯ О СИСТЕМЕ</Text>
          <GlassCard style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Версия:</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Окружение:</Text>
              <Text style={styles.infoValue}>Development</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>База данных:</Text>
              <Text style={styles.infoValue}>PostgreSQL</Text>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Save Button */}
        <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.saveButtonContainer}>
          <GlassButton
            title={saving ? 'Сохранение...' : 'Сохранить изменения'}
            onPress={handleSave}
            icon="content-save"
            variant="primary"
            disabled={saving}
          />
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBlack,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: sizes.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sizes.lg,
    paddingTop: sizes.xl,
    paddingBottom: sizes.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    marginHorizontal: sizes.lg,
    marginTop: sizes.xl,
    marginBottom: sizes.sm,
    letterSpacing: 1.5,
  },
  card: {
    marginHorizontal: sizes.lg,
    padding: sizes.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: sizes.sm,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: sizes.md,
  },
  settingText: {
    marginLeft: sizes.md,
    flex: 1,
  },
  settingTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  settingDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  numberInput: {
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.glassBackground,
    borderRadius: 8,
    paddingHorizontal: sizes.md,
    paddingVertical: sizes.sm,
    minWidth: 60,
    textAlign: 'center',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.glassBorder,
    marginVertical: sizes.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: sizes.sm,
  },
  infoLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  saveButtonContainer: {
    paddingHorizontal: sizes.lg,
    marginTop: sizes.xl,
  },
  bottomSpacer: {
    height: sizes.xxl,
  },
});
