/**
 * 360° РАБОТА - ULTRA EDITION
 * Admin Dashboard Screen - Revolut Style
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { GlassCard, MetalIcon } from '@/components/ui';
import { colors, typography, sizes } from '@/constants';
import { AdminDashboardStats } from '@/types';
import { adminApi } from '@/services/adminApi';
import { useToastStore } from '@/stores/toastStore';
import { haptics } from '@/utils/haptics';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

export function AdminDashboardScreen({ navigation }: any) {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { showToast } = useToastStore();

  const loadDashboard = async () => {
    try {
      const data = await adminApi.getDashboardStats();
      setStats(data);
    } catch (error: any) {
      console.error('Failed to load dashboard:', error);
      showToast('error', 'Ошибка загрузки дашборда');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const onRefresh = () => {
    haptics.light();
    setRefreshing(true);
    loadDashboard();
  };

  const navigateTo = (screen: string) => {
    haptics.medium();
    navigation.navigate(screen);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />
        <View style={styles.loadingContainer}>
          <MetalIcon name="loading" variant="chrome" size="large" glow />
          <Text style={styles.loadingText}>Загрузка...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accentBlue}
          />
        }
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={styles.header}
        >
          <MetalIcon name="shield-crown" variant="gold" size="large" glow />
          <Text style={styles.title}>Админ Панель</Text>
          <Text style={styles.subtitle}>360° РАБОТА - ULTRA</Text>
        </Animated.View>

        {/* Quick Stats Grid */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={styles.quickStatsGrid}
        >
          <StatCard
            icon="account-multiple"
            label="Пользователи"
            value={stats?.overview.totalUsers || 0}
            color={colors.accentBlue}
            delay={0}
          />
          <StatCard
            icon="briefcase"
            label="Вакансии"
            value={stats?.overview.totalVacancies || 0}
            color={colors.accentPurple}
            delay={50}
          />
          <StatCard
            icon="file-document"
            label="Отклики"
            value={stats?.overview.totalApplications || 0}
            color={colors.accentGreen}
            delay={100}
          />
          <StatCard
            icon="video"
            label="Видео"
            value={stats?.overview.totalVideos || 0}
            color={colors.accentOrange}
            delay={150}
          />
        </Animated.View>

        {/* Today's Activity */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Text style={styles.sectionTitle}>СЕГОДНЯ</Text>
          <GlassCard style={styles.todayCard}>
            <View style={styles.todayRow}>
              <View style={styles.todayItem}>
                <Icon name="account-plus" size={24} color={colors.accentBlue} />
                <Text style={styles.todayValue}>+{stats?.today.newUsers || 0}</Text>
                <Text style={styles.todayLabel}>новых</Text>
              </View>
              <View style={styles.todayItem}>
                <Icon name="briefcase-plus" size={24} color={colors.accentPurple} />
                <Text style={styles.todayValue}>+{stats?.today.newVacancies || 0}</Text>
                <Text style={styles.todayLabel}>вакансий</Text>
              </View>
              <View style={styles.todayItem}>
                <Icon name="file-plus" size={24} color={colors.accentGreen} />
                <Text style={styles.todayValue}>+{stats?.today.newApplications || 0}</Text>
                <Text style={styles.todayLabel}>откликов</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Moderation Alert */}
        {stats && (stats.moderation.pendingModeration > 0 || stats.moderation.pendingComplaints > 0) && (
          <Animated.View entering={FadeInDown.delay(250).duration(400)}>
            <TouchableOpacity
              onPress={() => navigateTo('AdminReports')}
              activeOpacity={0.8}
            >
              <GlassCard style={[styles.alertCard, styles.warningCard]}>
                <Icon name="alert-circle" size={32} color={colors.accentOrange} />
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>Требуется модерация</Text>
                  <Text style={styles.alertText}>
                    {stats.moderation.pendingModeration} видео • {stats.moderation.pendingComplaints} жалоб
                  </Text>
                </View>
                <Icon name="chevron-right" size={24} color={colors.textSecondary} />
              </GlassCard>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Text style={styles.sectionTitle}>УПРАВЛЕНИЕ</Text>
          <GlassCard style={styles.card}>
            <ActionItem
              icon="cash-multiple"
              title="Финансы"
              subtitle="Транзакции и выручка от работодателей"
              onPress={() => navigateTo('AdminTransactions')}
              color={colors.accentGreen}
            />
            <View style={styles.divider} />
            <ActionItem
              icon="account-group"
              title="Пользователи"
              subtitle={`${stats?.overview.totalJobseekers || 0} соискателей • ${stats?.overview.totalEmployers || 0} работодателей`}
              onPress={() => navigateTo('AdminUsers')}
              color={colors.accentBlue}
            />
            <View style={styles.divider} />
            <ActionItem
              icon="briefcase-variant"
              title="Вакансии"
              subtitle={`${stats?.overview.activeVacancies || 0} активных из ${stats?.overview.totalVacancies || 0}`}
              onPress={() => navigateTo('AdminVacancies')}
              color={colors.accentPurple}
            />
            <View style={styles.divider} />
            <ActionItem
              icon="flag"
              title="Жалобы"
              subtitle={`${stats?.moderation.pendingComplaints || 0} на рассмотрении`}
              onPress={() => navigateTo('AdminReports')}
              color={colors.accentOrange}
              badge={stats?.moderation.pendingComplaints || 0}
            />
            <View style={styles.divider} />
            <ActionItem
              icon="cog"
              title="Настройки"
              subtitle="Системные параметры"
              onPress={() => navigateTo('AdminSettings')}
              color={colors.textSecondary}
            />
          </GlassCard>
        </Animated.View>

        {/* Top Employers */}
        {stats && stats.topEmployers.length > 0 && (
          <Animated.View entering={FadeInDown.delay(350).duration(400)}>
            <Text style={styles.sectionTitle}>ТОП РАБОТОДАТЕЛИ</Text>
            <GlassCard style={styles.card}>
              {stats.topEmployers.map((employer, index) => (
                <React.Fragment key={employer.id}>
                  {index > 0 && <View style={styles.divider} />}
                  <View style={styles.employerRow}>
                    <View style={styles.employerInfo}>
                      <Text style={styles.employerName}>{employer.name}</Text>
                      <Text style={styles.employerStats}>
                        {employer.vacanciesCount} вакансий • {employer.totalApplications} откликов
                      </Text>
                    </View>
                    {employer.verified && (
                      <Icon name="check-decagram" size={20} color={colors.accentBlue} />
                    )}
                  </View>
                </React.Fragment>
              ))}
            </GlassCard>
          </Animated.View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

// Stat Card Component
const StatCard = ({ icon, label, value, color, delay }: any) => (
  <Animated.View
    entering={FadeInDown.delay(delay).duration(400)}
    style={styles.statCardWrapper}
  >
    <GlassCard style={styles.statCard}>
      <Icon name={icon} size={28} color={color} />
      <Text style={styles.statValue}>{value.toLocaleString()}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </GlassCard>
  </Animated.View>
);

// Action Item Component
const ActionItem = ({ icon, title, subtitle, onPress, color, badge }: any) => (
  <TouchableOpacity
    style={styles.actionItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.actionIcon, { backgroundColor: `${color}15` }]}>
      <Icon name={icon} size={24} color={color} />
    </View>
    <View style={styles.actionContent}>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionSubtitle}>{subtitle}</Text>
    </View>
    {badge > 0 && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badge}</Text>
      </View>
    )}
    <Icon name="chevron-right" size={20} color={colors.textSecondary} />
  </TouchableOpacity>
);

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
    alignItems: 'center',
    paddingTop: sizes.xl,
    paddingBottom: sizes.lg,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginTop: sizes.md,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: sizes.xs,
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
  quickStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: sizes.md,
    gap: sizes.sm,
  },
  statCardWrapper: {
    width: (width - sizes.lg * 2 - sizes.sm) / 2,
  },
  statCard: {
    alignItems: 'center',
    padding: sizes.lg,
  },
  statValue: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: sizes.sm,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: sizes.xs,
  },
  todayCard: {
    marginHorizontal: sizes.lg,
    padding: sizes.lg,
  },
  todayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  todayItem: {
    alignItems: 'center',
  },
  todayValue: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: sizes.xs,
  },
  todayLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  alertCard: {
    marginHorizontal: sizes.lg,
    padding: sizes.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningCard: {
    borderColor: colors.accentOrange,
    borderWidth: 1,
  },
  alertContent: {
    flex: 1,
    marginLeft: sizes.md,
  },
  alertTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  alertText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: sizes.xs,
  },
  card: {
    marginHorizontal: sizes.lg,
    padding: sizes.md,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: sizes.sm,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
    marginLeft: sizes.md,
  },
  actionTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  actionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    backgroundColor: colors.accentOrange,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: sizes.sm,
  },
  badgeText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 11,
  },
  divider: {
    height: 1,
    backgroundColor: colors.glassBorder,
    marginVertical: sizes.xs,
  },
  employerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: sizes.sm,
  },
  employerInfo: {
    flex: 1,
  },
  employerName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  employerStats: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  bottomSpacer: {
    height: sizes.xl,
  },
});
