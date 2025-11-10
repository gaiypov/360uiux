/**
 * 360° РАБОТА - ULTRA EDITION
 * Analytics Screen with Premium Charts
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { GlassCard, LoadingSpinner } from '@/components/ui';
import { StatCard } from '@/components/charts/StatCard';
import { MiniLineChart } from '@/components/charts/MiniLineChart';
import { colors, metalGradients, typography, sizes } from "@/constants";
import { api } from '@/services/api';
import { useToastStore } from '@/stores';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function AnalyticsScreen({ navigation }: any) {
  const { showToast } = useToastStore();
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const result = await api.getEmployerAnalytics({ period });
      setAnalytics(result.analytics);
    } catch (error: any) {
      console.error('Error loading analytics:', error);
      showToast('error', 'Ошибка загрузки аналитики');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  if (loading && !analytics) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />
        <LoadingSpinner />
      </View>
    );
  }

  if (!analytics) {
    return null;
  }

  const { stats, changes, viewsData, applicationsData, topVacancies } = analytics;

  // Convert data for charts
  const viewsChartData = viewsData.map((d: any) => d.count);
  const applicationsChartData = applicationsData.map((d: any) => d.count);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.platinumSilver}
            colors={[colors.platinumSilver]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Аналитика</Text>
            <TouchableOpacity
              style={styles.detailedButton}
              onPress={() => navigation.navigate('DetailedAnalytics')}
              activeOpacity={0.7}
            >
              <Text style={styles.detailedButtonText}>Подробнее</Text>
              <Icon name="arrow-right" size={16} color={colors.platinumSilver} />
            </TouchableOpacity>
          </View>

          {/* Period Selector */}
          <View style={styles.periodSelector}>
            {['week', 'month', 'year'].map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.periodButton,
                  period === p && styles.periodButtonActive,
                ]}
                onPress={() => setPeriod(p as any)}
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
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statRow}>
            <View style={styles.statHalf}>
              <StatCard
                icon="eye-outline"
                label="Просмотры"
                value={stats.views.toLocaleString('ru-RU')}
                change={changes.views}
                trend={changes.views >= 0 ? 'up' : 'down'}
                index={0}
              />
            </View>
            <View style={styles.statHalf}>
              <StatCard
                icon="account-multiple"
                label="Отклики"
                value={stats.applications}
                change={changes.applications}
                trend={changes.applications >= 0 ? 'up' : 'down'}
                index={1}
              />
            </View>
          </View>
          <View style={styles.statRow}>
            <View style={styles.statHalf}>
              <StatCard
                icon="account-check"
                label="Наймы"
                value={stats.hires}
                change={0}
                trend="up"
                index={2}
              />
            </View>
            <View style={styles.statHalf}>
              <StatCard
                icon="percent"
                label="Конверсия"
                value={`${stats.conversionRate.toFixed(1)}%`}
                change={0}
                trend="up"
                index={3}
              />
            </View>
          </View>
        </View>

        {/* Views Chart */}
        <GlassCard style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Просмотры вакансий</Text>
            <View style={styles.chartLegend}>
              <View style={styles.legendDot} />
              <Text style={styles.legendText}>За неделю</Text>
            </View>
          </View>
          <MiniLineChart data={viewsChartData} height={150} />
          <View style={styles.chartFooter}>
            <Text style={styles.chartFooterText}>
              {viewsChartData.length > 1 && viewsChartData[0] > 0
                ? `${viewsChartData[viewsChartData.length - 1] > viewsChartData[0] ? '+' : ''}${((viewsChartData[viewsChartData.length - 1] / viewsChartData[0] - 1) * 100).toFixed(1)}% за период`
                : 'Нет данных за период'}
            </Text>
          </View>
        </GlassCard>

        {/* Applications Chart */}
        <GlassCard style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Отклики</Text>
            <View style={styles.chartLegend}>
              <View style={[styles.legendDot, { backgroundColor: colors.platinumSilver }]} />
              <Text style={styles.legendText}>За неделю</Text>
            </View>
          </View>
          <MiniLineChart data={applicationsChartData} height={150} />
          <View style={styles.chartFooter}>
            <Text style={styles.chartFooterText}>
              {applicationsChartData.length > 0
                ? `Средний отклик: ${(applicationsChartData.reduce((a: number, b: number) => a + b, 0) / applicationsChartData.length).toFixed(1)}/день`
                : 'Нет данных за период'}
            </Text>
          </View>
        </GlassCard>

        {/* Top Vacancies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Топ вакансий</Text>
          {topVacancies.map((vacancy, index) => (
            <GlassCard key={vacancy.id} style={styles.vacancyCard}>
              <View style={styles.vacancyHeader}>
                <View style={styles.vacancyRank}>
                  <Text style={styles.vacancyRankText}>#{index + 1}</Text>
                </View>
                <Text style={styles.vacancyTitle} numberOfLines={1}>
                  {vacancy.title}
                </Text>
              </View>

              <View style={styles.vacancyStats}>
                <View style={styles.vacancyStat}>
                  <Icon name="eye-outline" size={16} color={colors.liquidSilver} />
                  <Text style={styles.vacancyStatText}>{vacancy.views}</Text>
                </View>
                <View style={styles.vacancyStat}>
                  <Icon name="account-multiple" size={16} color={colors.liquidSilver} />
                  <Text style={styles.vacancyStatText}>{vacancy.applications}</Text>
                </View>
                <View style={styles.conversionBadge}>
                  <Text style={styles.conversionText}>
                    {((vacancy.applications / vacancy.views) * 100).toFixed(1)}%
                  </Text>
                </View>
              </View>
            </GlassCard>
          ))}
        </View>

        {/* Performance Insights */}
        <GlassCard style={styles.insightsCard}>
          <View style={styles.insightsHeader}>
            <Icon name="lightbulb-on" size={24} color={colors.platinumSilver} />
            <Text style={styles.insightsTitle}>Рекомендации</Text>
          </View>
          <View style={styles.insights}>
            <View style={styles.insightItem}>
              <Icon name="check-circle" size={20} color={colors.success} />
              <Text style={styles.insightText}>
                Вакансии с видео получают на 45% больше откликов
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Icon name="trending-up" size={20} color={colors.platinumSilver} />
              <Text style={styles.insightText}>
                Лучшее время публикации: Вт-Чт, 10:00-12:00
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Icon name="star" size={20} color={colors.warning} />
              <Text style={styles.insightText}>
                Добавьте зарплатную вилку для увеличения конверсии
              </Text>
            </View>
          </View>
        </GlassCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBlack,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.primaryBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: sizes.lg,
    paddingBottom: 100,
  },
  header: {
    marginBottom: sizes.lg,
    marginTop: sizes.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: sizes.md,
  },
  title: {
    ...typography.h1,
    color: colors.softWhite,
  },
  detailedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: sizes.md,
    paddingVertical: sizes.sm,
    backgroundColor: colors.carbonGray,
    borderRadius: sizes.radiusMedium,
  },
  detailedButtonText: {
    ...typography.bodyMedium,
    color: colors.platinumSilver,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: sizes.sm,
  },
  periodButton: {
    paddingHorizontal: sizes.md,
    paddingVertical: sizes.sm,
    borderRadius: sizes.radiusMedium,
    backgroundColor: colors.glassBackground,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  periodButtonActive: {
    backgroundColor: 'rgba(232, 232, 237, 0.2)',
    borderColor: colors.platinumSilver,
  },
  periodText: {
    ...typography.caption,
    color: colors.liquidSilver,
  },
  periodTextActive: {
    color: colors.platinumSilver,
    fontWeight: '600',
  },
  statsGrid: {
    marginBottom: sizes.md,
  },
  statRow: {
    flexDirection: 'row',
    gap: sizes.md,
    marginBottom: sizes.md,
  },
  statHalf: {
    flex: 1,
  },
  chartCard: {
    marginBottom: sizes.md,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: sizes.lg,
  },
  chartTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.softWhite,
  },
  chartLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.platinumSilver,
  },
  legendText: {
    ...typography.caption,
    color: colors.liquidSilver,
  },
  chartFooter: {
    marginTop: sizes.md,
    paddingTop: sizes.md,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
  chartFooterText: {
    ...typography.caption,
    color: colors.platinumSilver,
  },
  section: {
    marginBottom: sizes.lg,
  },
  sectionTitle: {
    ...typography.h2,
    fontSize: 20,
    color: colors.softWhite,
    marginBottom: sizes.md,
  },
  vacancyCard: {
    marginBottom: sizes.sm,
  },
  vacancyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.sm,
    marginBottom: sizes.sm,
  },
  vacancyRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(232, 232, 237, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vacancyRankText: {
    ...typography.bodyMedium,
    color: colors.platinumSilver,
    fontWeight: '700',
  },
  vacancyTitle: {
    ...typography.bodyMedium,
    color: colors.softWhite,
    flex: 1,
  },
  vacancyStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.md,
  },
  vacancyStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vacancyStatText: {
    ...typography.caption,
    color: colors.liquidSilver,
  },
  conversionBadge: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(232, 232, 237, 0.15)',
    paddingHorizontal: sizes.sm,
    paddingVertical: 4,
    borderRadius: sizes.radiusSmall,
  },
  conversionText: {
    ...typography.caption,
    color: colors.platinumSilver,
    fontWeight: '600',
  },
  insightsCard: {
    marginBottom: sizes.md,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.sm,
    marginBottom: sizes.md,
  },
  insightsTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.softWhite,
  },
  insights: {
    gap: sizes.md,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: sizes.sm,
  },
  insightText: {
    ...typography.body,
    color: colors.liquidSilver,
    flex: 1,
    lineHeight: 20,
  },
});
