/**
 * 360° РАБОТА - ULTRA EDITION
 * Applications History Screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { GlassCard, LoadingSpinner } from '@/components/ui';
import { colors, metalGradients, typography, sizes } from "@/constants";
import { Application, Vacancy } from '@/types';
import { api } from '@/services/api';
import { useToastStore } from '@/stores';
import { haptics } from '@/utils/haptics';

interface ApplicationWithVacancy {
  id: string;
  vacancy_id: string;
  jobseeker_id: string;
  employer_status: string;
  created_at: string;
  cover_letter?: string;
  vacancy_title?: string;
  company_name?: string;
  salary_min?: number;
  salary_max?: number;
  city?: string;
}

export function ApplicationsScreen({ navigation }: any) {
  const { showToast } = useToastStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'viewed' | 'interview' | 'accepted' | 'rejected'>('all');
  const [applications, setApplications] = useState<ApplicationWithVacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const result = await api.getMyApplications();
      setApplications(result.applications || []);
    } catch (error: any) {
      console.error('Error loading applications:', error);
      showToast('error', 'Ошибка загрузки откликов');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadApplications();
    setRefreshing(false);
  };

  const filteredApplications = applications.filter(
    (app) => filter === 'all' || app.employer_status === filter
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'new':
        return 'clock-outline';
      case 'viewed':
        return 'eye-outline';
      case 'interview':
        return 'calendar-clock';
      case 'accepted':
        return 'check-circle';
      case 'rejected':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'new':
        return '#FFB800';
      case 'viewed':
        return '#5AC8FA';
      case 'interview':
        return '#FFD60A';
      case 'accepted':
        return '#30D158';
      case 'rejected':
        return '#FF453A';
      default:
        return colors.liquidSilver;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
      case 'new':
        return 'Новый';
      case 'viewed':
        return 'Просмотрено';
      case 'interview':
        return 'Собеседование';
      case 'accepted':
        return 'Приглашение';
      case 'rejected':
        return 'Отказ';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Вчера';
    if (diffDays < 7) return `${diffDays} дн. назад`;
    return date.toLocaleDateString('ru-RU');
  };

  if (loading && applications.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />
        <LoadingSpinner />
      </View>
    );
  }

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
          <Text style={styles.title}>Мои отклики</Text>
          <Text style={styles.subtitle}>
            Всего откликов: {applications.length}
          </Text>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filters}
        >
          {[
            { key: 'all', label: 'Все' },
            { key: 'new', label: 'Новые' },
            { key: 'viewed', label: 'Просмотрены' },
            { key: 'interview', label: 'Собеседование' },
            { key: 'accepted', label: 'Приглашения' },
            { key: 'rejected', label: 'Отказы' },
          ].map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.filterChip,
                filter === item.key && styles.filterChipActive,
              ]}
              onPress={() => setFilter(item.key as any)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === item.key && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Applications List */}
        {filteredApplications.length > 0 ? (
          <View style={styles.applicationsList}>
            {filteredApplications.map((application) => (
              <TouchableOpacity
                key={application.id}
                activeOpacity={0.8}
                onPress={() => {
                  haptics.light();
                  console.log('Open vacancy', application.vacancy_id);
                }}
              >
                <GlassCard style={styles.applicationCard}>
                  {/* Status Badge */}
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${getStatusColor(application.employer_status)}20` },
                    ]}
                  >
                    <Icon
                      name={getStatusIcon(application.employer_status)}
                      size={16}
                      color={getStatusColor(application.employer_status)}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(application.employer_status) },
                      ]}
                    >
                      {getStatusText(application.employer_status)}
                    </Text>
                  </View>

                  {/* Company */}
                  <View style={styles.companyRow}>
                    <View style={styles.companyIcon}>
                      <Icon
                        name="office-building"
                        size={20}
                        color={colors.platinumSilver}
                      />
                    </View>
                    <Text style={styles.companyName}>
                      {application.company_name || 'Компания'}
                    </Text>
                  </View>

                  {/* Title */}
                  <Text style={styles.vacancyTitle} numberOfLines={2}>
                    {application.vacancy_title || 'Вакансия'}
                  </Text>

                  {/* Salary */}
                  {application.salary_min && (
                    <View style={styles.salaryContainer}>
                      <LinearGradient
                        colors={metalGradients.platinum}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.salaryGradient}
                      >
                        <Text style={styles.salary}>
                          от {application.salary_min.toLocaleString('ru-RU')} ₽
                        </Text>
                    </LinearGradient>
                  </View>
                  )}

                  {/* Footer */}
                  <View style={styles.cardFooter}>
                    {application.city && (
                      <View style={styles.locationRow}>
                        <Icon name="map-marker" size={14} color={colors.liquidSilver} />
                        <Text style={styles.location}>
                          {application.city}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.date}>
                      {formatDate(application.created_at)}
                    </Text>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="briefcase-off" size={64} color={colors.liquidSilver} />
            <Text style={styles.emptyStateText}>
              {filter === 'all'
                ? 'У вас пока нет откликов'
                : `Нет откликов в статусе "${getStatusText(filter)}"`}
            </Text>
          </View>
        )}
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
  title: {
    ...typography.h1,
    color: colors.softWhite,
    marginBottom: sizes.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.liquidSilver,
  },
  filtersScroll: {
    marginBottom: sizes.lg,
  },
  filters: {
    flexDirection: 'row',
    gap: sizes.sm,
  },
  filterChip: {
    backgroundColor: colors.glassBackground,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: sizes.radiusMedium,
    paddingHorizontal: sizes.md,
    paddingVertical: sizes.sm,
  },
  filterChipActive: {
    backgroundColor: 'rgba(232, 232, 237, 0.2)',
    borderColor: colors.platinumSilver,
  },
  filterChipText: {
    ...typography.caption,
    color: colors.liquidSilver,
  },
  filterChipTextActive: {
    color: colors.platinumSilver,
    fontWeight: '600',
  },
  applicationsList: {
    gap: sizes.md,
  },
  applicationCard: {
    position: 'relative',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: sizes.sm,
    paddingVertical: 4,
    borderRadius: sizes.radiusSmall,
    marginBottom: sizes.md,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.sm,
    marginBottom: sizes.sm,
  },
  companyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(232, 232, 237, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyName: {
    ...typography.bodyMedium,
    color: colors.softWhite,
    flex: 1,
  },
  vacancyTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.softWhite,
    marginBottom: sizes.sm,
  },
  salaryContainer: {
    alignSelf: 'flex-start',
    borderRadius: sizes.radiusMedium,
    overflow: 'hidden',
    marginBottom: sizes.md,
  },
  salaryGradient: {
    paddingHorizontal: sizes.md,
    paddingVertical: sizes.xs,
  },
  salary: {
    ...typography.bodyMedium,
    color: colors.softWhite,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: sizes.sm,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    ...typography.caption,
    color: colors.liquidSilver,
  },
  date: {
    ...typography.caption,
    color: colors.liquidSilver,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sizes.xxl * 2,
  },
  emptyStateText: {
    ...typography.body,
    color: colors.liquidSilver,
    marginTop: sizes.lg,
    textAlign: 'center',
  },
});
