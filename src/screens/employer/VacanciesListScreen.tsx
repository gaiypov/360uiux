/**
 * 360° РАБОТА - ULTRA EDITION
 * Vacancies List Screen (Employer)
 * Main screen showing all employer's vacancies
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { GlassCard, LoadingSpinner } from '@/components/ui';
import { colors, metalGradients, typography, sizes } from '@/constants';
import { api } from '@/services/api';
import { useToastStore } from '@/stores';
import { haptics } from '@/utils/haptics';

interface Vacancy {
  id: string;
  title: string;
  profession: string;
  city: string;
  salary_min?: number;
  salary_max?: number;
  status: 'draft' | 'published' | 'closed';
  views_count: number;
  applications_count: number;
  created_at: string;
  published_at?: string;
}

export function VacanciesListScreen({ navigation }: any) {
  const { showToast } = useToastStore();
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    loadVacancies();
  }, [filter]);

  const loadVacancies = async () => {
    try {
      setLoading(true);
      const status = filter === 'all' ? undefined : filter;
      const result = await api.getMyVacancies({ status });
      setVacancies(result.vacancies || []);
    } catch (error: any) {
      console.error('Error loading vacancies:', error);
      showToast('error', 'Ошибка загрузки вакансий');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadVacancies();
    setRefreshing(false);
  }, [filter]);

  const handleCreateVacancy = () => {
    haptics.light();
    navigation.navigate('CreateVacancyV2');
  };

  const handleVacancyPress = (vacancy: Vacancy) => {
    haptics.light();
    navigation.navigate('VacancyDetail', { vacancyId: vacancy.id });
  };

  const getStatusColor = (status: Vacancy['status']) => {
    switch (status) {
      case 'published':
        return colors.successGreen;
      case 'draft':
        return colors.chromeSilver;
      case 'closed':
        return colors.errorRed;
      default:
        return colors.graphiteSilver;
    }
  };

  const getStatusLabel = (status: Vacancy['status']) => {
    switch (status) {
      case 'published':
        return 'Опубликована';
      case 'draft':
        return 'Черновик';
      case 'closed':
        return 'Закрыта';
      default:
        return status;
    }
  };

  const renderVacancy = ({ item }: { item: Vacancy }) => {
    const salaryText = item.salary_min && item.salary_max
      ? `${item.salary_min.toLocaleString('ru-RU')} - ${item.salary_max.toLocaleString('ru-RU')} ₽`
      : item.salary_min
      ? `от ${item.salary_min.toLocaleString('ru-RU')} ₽`
      : 'Не указана';

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleVacancyPress(item)}
      >
        <GlassCard style={styles.vacancyCard}>
          {/* Header */}
          <View style={styles.vacancyHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.vacancyTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.vacancyProfession} numberOfLines={1}>
                {item.profession}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {getStatusLabel(item.status)}
              </Text>
            </View>
          </View>

          {/* Details */}
          <View style={styles.vacancyDetails}>
            <View style={styles.detailRow}>
              <Icon name="currency-rub" size={16} color={colors.chromeSilver} />
              <Text style={styles.detailText}>{salaryText}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="map-marker" size={16} color={colors.chromeSilver} />
              <Text style={styles.detailText}>{item.city}</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon name="eye" size={18} color={colors.platinumSilver} />
              <Text style={styles.statText}>{item.views_count || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="account-group" size={18} color={colors.platinumSilver} />
              <Text style={styles.statText}>{item.applications_count || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="calendar" size={18} color={colors.chromeSilver} />
              <Text style={styles.statText}>
                {new Date(item.created_at).toLocaleDateString('ru-RU')}
              </Text>
            </View>
          </View>
        </GlassCard>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.title}>Мои вакансии</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateVacancy}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={metalGradients.platinum}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.createGradient}
          >
            <Icon name="plus" size={20} color={colors.primaryBlack} />
            <Text style={styles.createText}>Создать</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {['all', 'published', 'draft'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterButton,
              filter === f && styles.filterButtonActive,
            ]}
            onPress={() => {
              haptics.light();
              setFilter(f as any);
            }}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}
            >
              {f === 'all' ? 'Все' : f === 'published' ? 'Опубликованные' : 'Черновики'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.count}>
        {vacancies.length} {vacancies.length === 1 ? 'вакансия' : 'вакансий'}
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="briefcase-off-outline" size={64} color={colors.chromeSilver} />
      <Text style={styles.emptyTitle}>Нет вакансий</Text>
      <Text style={styles.emptyText}>
        {filter === 'all'
          ? 'Создайте свою первую вакансию'
          : filter === 'published'
          ? 'Нет опубликованных вакансий'
          : 'Нет черновиков'}
      </Text>
      {filter === 'all' && (
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={handleCreateVacancy}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={metalGradients.platinum}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.emptyButtonGradient}
          >
            <Icon name="plus-circle" size={20} color={colors.primaryBlack} />
            <Text style={styles.emptyButtonText}>Создать вакансию</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
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

      <FlatList
        data={vacancies}
        renderItem={renderVacancy}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.platinumSilver}
            colors={[colors.platinumSilver]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
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
  listContent: {
    paddingHorizontal: sizes.lg,
    paddingTop: sizes.lg,
    paddingBottom: 100,
  },
  header: {
    marginBottom: sizes.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: sizes.lg,
  },
  title: {
    ...typography.h1,
    fontSize: 32,
    color: colors.softWhite,
  },
  createButton: {
    borderRadius: sizes.radiusMedium,
    overflow: 'hidden',
    shadowColor: colors.platinumSilver,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: sizes.sm,
    paddingHorizontal: sizes.md,
    gap: sizes.xs,
  },
  createText: {
    ...typography.bodyMedium,
    color: colors.primaryBlack,
    fontWeight: '700',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: sizes.sm,
    marginBottom: sizes.md,
  },
  filterButton: {
    paddingVertical: sizes.sm,
    paddingHorizontal: sizes.md,
    borderRadius: sizes.radiusMedium,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  filterButtonActive: {
    backgroundColor: colors.platinumSilver,
  },
  filterText: {
    ...typography.body,
    color: colors.chromeSilver,
    fontSize: 14,
  },
  filterTextActive: {
    color: colors.primaryBlack,
    fontWeight: '600',
  },
  count: {
    ...typography.caption,
    color: colors.chromeSilver,
  },
  vacancyCard: {
    padding: sizes.md,
    marginBottom: sizes.md,
  },
  vacancyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: sizes.sm,
  },
  headerLeft: {
    flex: 1,
    marginRight: sizes.sm,
  },
  vacancyTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.softWhite,
    marginBottom: 4,
  },
  vacancyProfession: {
    ...typography.body,
    color: colors.chromeSilver,
    fontSize: 14,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: sizes.sm,
    borderRadius: sizes.radiusSmall,
  },
  statusText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
  },
  vacancyDetails: {
    flexDirection: 'row',
    gap: sizes.lg,
    marginBottom: sizes.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.xs,
  },
  detailText: {
    ...typography.caption,
    color: colors.chromeSilver,
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    gap: sizes.lg,
    paddingTop: sizes.sm,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.xs,
  },
  statText: {
    ...typography.caption,
    color: colors.chromeSilver,
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: sizes.xxxLarge,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.softWhite,
    marginTop: sizes.lg,
    marginBottom: sizes.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.chromeSilver,
    textAlign: 'center',
    marginBottom: sizes.xl,
  },
  emptyButton: {
    borderRadius: sizes.radiusLarge,
    overflow: 'hidden',
    shadowColor: colors.platinumSilver,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: sizes.md,
    paddingHorizontal: sizes.xl,
    gap: sizes.sm,
  },
  emptyButtonText: {
    ...typography.bodyMedium,
    color: colors.primaryBlack,
    fontWeight: '700',
  },
});
