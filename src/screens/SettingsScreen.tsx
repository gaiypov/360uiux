/**
 * 360° РАБОТА - ULTRA EDITION
 * Settings Screen - Profile & Notifications Management
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GlassCard, GlassButton, MetalIcon } from '@/components/ui';
import { colors, typography, sizes } from '@/constants';
import { useAuthStore } from '@/stores/authStore';

export function SettingsScreen({ navigation }: any) {
  const { user, logout } = useAuthStore();

  // Notification Settings
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [newVacanciesAlert, setNewVacanciesAlert] = useState(true);
  const [applicationUpdates, setApplicationUpdates] = useState(true);
  const [chatMessages, setChatMessages] = useState(true);

  // Privacy Settings
  const [profileVisible, setProfileVisible] = useState(true);
  const [showActivity, setShowActivity] = useState(false);

  const handleLogout = () => {
    logout();
    navigation.replace('Auth');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={styles.header}
        >
          <MetalIcon name="cog" variant="chrome" size="large" glow />
          <Text style={styles.title}>Настройки</Text>
          <Text style={styles.subtitle}>
            {user?.role === 'employer' ? 'Работодатель' : 'Соискатель'}
          </Text>
        </Animated.View>

        {/* Profile Section */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Text style={styles.sectionTitle}>ПРОФИЛЬ</Text>
          <GlassCard style={styles.card}>
            <SettingItem
              icon="account-edit"
              title="Редактировать профиль"
              onPress={() => navigation.navigate('EditProfile')}
              showArrow
            />
            <View style={styles.divider} />
            <SettingItem
              icon="shield-account"
              title="Конфиденциальность"
              onPress={() => {}}
              showArrow
            />
            <View style={styles.divider} />
            <SettingItem
              icon="lock-reset"
              title="Изменить пароль"
              onPress={() => {}}
              showArrow
            />
          </GlassCard>
        </Animated.View>

        {/* Notifications Section */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Text style={styles.sectionTitle}>УВЕДОМЛЕНИЯ</Text>
          <GlassCard style={styles.card}>
            <SettingToggle
              icon="bell"
              title="Push-уведомления"
              description="Получать уведомления в приложении"
              value={pushEnabled}
              onValueChange={setPushEnabled}
            />
            <View style={styles.divider} />
            <SettingToggle
              icon="email"
              title="Email"
              description="Получать уведомления на почту"
              value={emailEnabled}
              onValueChange={setEmailEnabled}
            />
            <View style={styles.divider} />
            <SettingToggle
              icon="message"
              title="SMS"
              description="Получать SMS уведомления"
              value={smsEnabled}
              onValueChange={setSmsEnabled}
            />
          </GlassCard>
        </Animated.View>

        {/* Notification Types */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Text style={styles.sectionTitle}>ТИПЫ УВЕДОМЛЕНИЙ</Text>
          <GlassCard style={styles.card}>
            <SettingToggle
              icon="briefcase-search"
              title="Новые вакансии"
              description="Подходящие вакансии по фильтрам"
              value={newVacanciesAlert}
              onValueChange={setNewVacanciesAlert}
            />
            <View style={styles.divider} />
            <SettingToggle
              icon="clipboard-check"
              title="Статус откликов"
              description="Обновления по вашим откликам"
              value={applicationUpdates}
              onValueChange={setApplicationUpdates}
            />
            <View style={styles.divider} />
            <SettingToggle
              icon="chat"
              title="Сообщения в чате"
              description="Новые сообщения от работодателей"
              value={chatMessages}
              onValueChange={setChatMessages}
            />
          </GlassCard>
        </Animated.View>

        {/* Privacy Section */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <Text style={styles.sectionTitle}>ПРИВАТНОСТЬ</Text>
          <GlassCard style={styles.card}>
            <SettingToggle
              icon="eye"
              title="Видимость профиля"
              description="Работодатели могут найти ваш профиль"
              value={profileVisible}
              onValueChange={setProfileVisible}
            />
            <View style={styles.divider} />
            <SettingToggle
              icon="chart-line"
              title="Показывать активность"
              description="Отображать время последней активности"
              value={showActivity}
              onValueChange={setShowActivity}
            />
          </GlassCard>
        </Animated.View>

        {/* About Section */}
        <Animated.View entering={FadeInDown.delay(500).duration(400)}>
          <Text style={styles.sectionTitle}>О ПРИЛОЖЕНИИ</Text>
          <GlassCard style={styles.card}>
            <SettingItem
              icon="information"
              title="О приложении"
              subtitle="Версия 1.0.0 Ultra Edition"
              onPress={() => {}}
              showArrow
            />
            <View style={styles.divider} />
            <SettingItem
              icon="file-document"
              title="Политика конфиденциальности"
              onPress={() => {}}
              showArrow
            />
            <View style={styles.divider} />
            <SettingItem
              icon="gavel"
              title="Условия использования"
              onPress={() => {}}
              showArrow
            />
          </GlassCard>
        </Animated.View>

        {/* Logout Button */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(400)}
          style={styles.logoutContainer}
        >
          <GlassButton
            title="ВЫЙТИ ИЗ АККАУНТА"
            onPress={handleLogout}
            variant="secondary"
          />
        </Animated.View>

        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
}

// Setting Item Component
interface SettingItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
}

function SettingItem({ icon, title, subtitle, onPress, showArrow }: SettingItemProps) {
  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.settingIconContainer}>
        <Icon name={icon} size={24} color={colors.platinumSilver} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {showArrow && (
        <Icon name="chevron-right" size={24} color={colors.chromeSilver} />
      )}
    </TouchableOpacity>
  );
}

// Setting Toggle Component
interface SettingToggleProps {
  icon: string;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

function SettingToggle({ icon, title, description, value, onValueChange }: SettingToggleProps) {
  return (
    <View style={styles.settingItem}>
      <View style={styles.settingIconContainer}>
        <Icon name={icon} size={24} color={colors.platinumSilver} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: colors.steelGray,
          true: colors.platinumSilver
        }}
        thumbColor={value ? colors.pureWhite : colors.chromeSilver}
        ios_backgroundColor={colors.steelGray}
      />
    </View>
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
  header: {
    alignItems: 'center',
    paddingTop: sizes.xxl,
    paddingBottom: sizes.lg,
    paddingHorizontal: sizes.lg,
  },
  title: {
    ...typography.h1,
    color: colors.softWhite,
    marginTop: sizes.md,
    marginBottom: sizes.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.chromeSilver,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.chromeSilver,
    marginHorizontal: sizes.lg,
    marginTop: sizes.xl,
    marginBottom: sizes.md,
  },
  card: {
    marginHorizontal: sizes.lg,
    marginBottom: sizes.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: sizes.md,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.carbonGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: sizes.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    ...typography.bodyMedium,
    color: colors.softWhite,
    marginBottom: 2,
  },
  settingSubtitle: {
    ...typography.caption,
    color: colors.chromeSilver,
  },
  settingDescription: {
    ...typography.caption,
    color: colors.graphiteSilver,
  },
  divider: {
    height: 1,
    backgroundColor: colors.steelGray,
    marginVertical: sizes.xs,
  },
  logoutContainer: {
    marginHorizontal: sizes.lg,
    marginTop: sizes.xl,
  },
  footer: {
    height: sizes.xxl,
  },
});
