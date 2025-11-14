/**
 * 360° РАБОТА - ULTRA EDITION
 * Detailed Analytics Screen - Advanced Charts & Metrics
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GlassCard, MetalIcon } from '@/components/ui';
import { StatCard } from '@/components/charts/StatCard';
import { MiniLineChart } from '@/components/charts/MiniLineChart';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { colors, typography, sizes } from '@/constants';

export function DetailedAnalyticsScreen({ navigation }: any) {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  // Mock data
  const kpiData = [
    { icon: 'eye-outline', label: 'Просмотры', value: '45.2K', change: 18.3, trend: 'up' as const },
    { icon: 'account-multiple', label: 'Кандидаты', value: '1,234', change: 12.5, trend: 'up' as const },
    { icon: 'check-circle', label: 'Наняли', value: '47', change: 8.2, trend: 'up' as const },
    { icon: 'percent', label: 'Конверсия', value: '3.8%', change: -2.1, trend: 'down' as const },
  ];

  const applicationsBySource = [
    { label: 'HeadHunter', value: 450 },
    { label: 'Прямые', value: 320 },
    { label: 'LinkedIn', value: 180 },
    { label: 'Referral', value: 150 },
    { label: 'Другие', value: 134 },
  ];

  const applicationsByStatus = [
    { label: 'Новые', value: 234, color: colors.info },
    { label: 'На рассмотрении', value: 156, color: colors.warning },
    { label: 'Приняты', value: 89, color: colors.success },
    { label: 'Отклонены', value: 345, color: colors.error },
  ];

  const weeklyTrend = [120, 150, 180, 220, 190, 240, 280];
  const conversionFunnel = [
    { label: 'Просмотры', value: 5420 },
    { label: 'Клики', value: 1234 },
    { label: 'Отклики', value: 824 },
    { label: 'Интервью', value: 156 },
    { label: 'Офферы', value: 47 },
  ];

  const topVacancies = [
    { title: 'Senior React Native Dev', applications: 234, conversion: 4.2 },
    { title: 'Full Stack Engineer', applications: 189, conversion: 3.8 },
    { title: 'Product Designer', applications: 156, conversion: 5.1 },
    { title: 'DevOps Engineer', applications: 134, conversion: 3.2 },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={colors.softWhite} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <MetalIcon name="chart-box" variant="platinum" size="medium" glow={false} />
            <Text style={styles.title}>Детальная Аналитика</Text>
          </View>
          <View style={{ width: 24 }} />
        </Animated.View>

        {/* Period Selector */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <View style={styles.periodSelector}>
            {(['week', 'month', 'year'] as const).map((p, index) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.periodButton,
                  period === p && styles.periodButtonActive,
                ]}
                onPress={() => setPeriod(p)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.periodText,
                    period === p && styles.periodTextActive,
                  ]}
                >
                  {p === 'week' ? 'Неделя' : p === 'month' ? 'Месяц' : 'Год'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* KPI Cards */}
        <View style={styles.kpiGrid}>
          {kpiData.map((kpi, index) => (
            <Animated.View
              key={index}
              entering={FadeInDown.delay(200 + index * 50).duration(400)}
              style={styles.kpiCard}
            >
              <StatCard {...kpi} index={index} />
            </Animated.View>
          ))}
        </View>

        {/* Weekly Trend */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <Text style={styles.sectionTitle}>ДИНАМИКА ОТКЛИКОВ</Text>
          <GlassCard style={styles.chartCard}>
            <Text style={styles.chartTitle}>Отклики по дням недели</Text>
            <MiniLineChart data={weeklyTrend} height={160} />
          </GlassCard>
        </Animated.View>

        {/* Applications by Source */}
        <Animated.View entering={FadeInDown.delay(500).duration(400)}>
          <Text style={styles.sectionTitle}>ИСТОЧНИКИ КАНДИДАТОВ</Text>
          <GlassCard style={styles.chartCard}>
            <Text style={styles.chartTitle}>Распределение по источникам</Text>
            <BarChart data={applicationsBySource} height={200} />
          </GlassCard>
        </Animated.View>

        {/* Applications by Status */}
        <Animated.View entering={FadeInDown.delay(600).duration(400)}>
          <Text style={styles.sectionTitle}>СТАТУСЫ ОТКЛИКОВ</Text>
          <GlassCard style={styles.chartCard}>
            <Text style={styles.chartTitle}>Распределение по статусам</Text>
            <PieChart data={applicationsByStatus} size={180} />
          </GlassCard>
        </Animated.View>

        {/* Conversion Funnel */}
        <Animated.View entering={FadeInDown.delay(700).duration(400)}>
          <Text style={styles.sectionTitle}>ВОРОНКА КОНВЕРСИИ</Text>
          <GlassCard style={styles.chartCard}>
            {conversionFunnel.map((step, index) => {
              const percentage = index === 0 ? 100 : (step.value / conversionFunnel[0].value) * 100;
              const conversionRate = index > 0
                ? ((step.value / conversionFunnel[index - 1].value) * 100).toFixed(1)
                : null;

              return (
                <View key={index} style={styles.funnelStep}>
                  <View style={styles.funnelStepHeader}>
                    <Text style={styles.funnelStepLabel}>{step.label}</Text>
                    <Text style={styles.funnelStepValue}>{step.value.toLocaleString('ru-RU')}</Text>
                  </View>
                  <View style={styles.funnelBarContainer}>
                    <View
                      style={[
                        styles.funnelBar,
                        { width: `${percentage}%` },
                      ]}
                    />
                  </View>
                  {conversionRate && (
                    <Text style={styles.conversionRate}>↓ {conversionRate}%</Text>
                  )}
                </View>
              );
            })}
          </GlassCard>
        </Animated.View>

        {/* Top Vacancies */}
        <Animated.View entering={FadeInDown.delay(800).duration(400)}>
          <Text style={styles.sectionTitle}>ТОП ВАКАНСИИ</Text>
          <GlassCard style={styles.chartCard}>
            {topVacancies.map((vacancy, index) => (
              <View key={index} style={styles.vacancyRow}>
                <View style={styles.vacancyRank}>
                  <Text style={styles.vacancyRankText}>#{index + 1}</Text>
                </View>
                <View style={styles.vacancyInfo}>
                  <Text style={styles.vacancyTitle}>{vacancy.title}</Text>
                  <Text style={styles.vacancyStats}>
                    {vacancy.applications} откликов • {vacancy.conversion}% конверсия
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color={colors.chromeSilver} />
              </View>
            ))}
          </GlassCard>
        </Animated.View>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBlack,
  },
  scrollContent: {
    paddingBottom: sizes.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sizes.lg,
    paddingTop: sizes.xl,
    paddingBottom: sizes.lg,
  },
  headerCenter: {
    alignItems: 'center',
    gap: sizes.sm,
  },
  title: {
    ...typography.h3,
    color: colors.softWhite,
  },
  periodSelector: {
    flexDirection: 'row',
    marginHorizontal: sizes.lg,
    marginBottom: sizes.lg,
    backgroundColor: colors.carbonGray,
    borderRadius: sizes.radiusMedium,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: sizes.sm,
    alignItems: 'center',
    borderRadius: sizes.radiusSmall,
  },
  periodButtonActive: {
    backgroundColor: colors.platinumSilver,
  },
  periodText: {
    ...typography.bodyMedium,
    color: colors.chromeSilver,
  },
  periodTextActive: {
    color: colors.graphiteBlack,
    fontWeight: '600',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: sizes.lg,
    marginBottom: sizes.md,
    gap: sizes.md,
  },
  kpiCard: {
    width: '48%',
  },
  sectionTitle: {
    ...typography.label,
    color: colors.chromeSilver,
    marginHorizontal: sizes.lg,
    marginTop: sizes.lg,
    marginBottom: sizes.md,
  },
  chartCard: {
    marginHorizontal: sizes.lg,
    marginBottom: sizes.md,
  },
  chartTitle: {
    ...typography.h4,
    color: colors.softWhite,
    marginBottom: sizes.lg,
  },
  funnelStep: {
    marginBottom: sizes.lg,
  },
  funnelStepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: sizes.xs,
  },
  funnelStepLabel: {
    ...typography.bodyMedium,
    color: colors.chromeSilver,
  },
  funnelStepValue: {
    ...typography.bodyMedium,
    color: colors.softWhite,
    fontWeight: '600',
  },
  funnelBarContainer: {
    height: 32,
    backgroundColor: colors.carbonGray,
    borderRadius: sizes.radiusSmall,
    overflow: 'hidden',
  },
  funnelBar: {
    height: '100%',
    backgroundColor: colors.platinumSilver,
    borderRadius: sizes.radiusSmall,
  },
  conversionRate: {
    ...typography.caption,
    color: colors.graphiteSilver,
    marginTop: sizes.xs,
    textAlign: 'right',
  },
  vacancyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: sizes.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.steelGray,
  },
  vacancyRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.carbonGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: sizes.md,
  },
  vacancyRankText: {
    ...typography.bodyMedium,
    color: colors.platinumSilver,
    fontWeight: '700',
  },
  vacancyInfo: {
    flex: 1,
  },
  vacancyTitle: {
    ...typography.bodyMedium,
    color: colors.softWhite,
    marginBottom: 2,
  },
  vacancyStats: {
    ...typography.caption,
    color: colors.chromeSilver,
  },
  footer: {
    height: sizes.xl,
  },
});
