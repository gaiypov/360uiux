/**
 * 360° РАБОТА - ULTRA EDITION
 * Employer Vacancies List Screen - My Vacancies Management
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GlassCard, GlassButton, MetalIcon } from '@/components/ui';
import { colors, typography, sizes } from '@/constants';
import { useToastStore } from '@/stores/toastStore';
import { haptics } from '@/utils/haptics';

type VacancyStatus = 'ALL' | 'draft' | 'published' | 'archived';

interface Vacancy {
  id: string;
  title: string;
  profession: string;
  city: string;
  salaryMin?: number;
  salaryMax?: number;
  status: 'draft' | 'published' | 'archived';
  views: number;
  applicationsCount: number;
  isTop: boolean;
  topUntil?: string;
  createdAt: string;
  publishedAt?: string;
}

export function EmployerVacanciesListScreen({ navigation }: any) {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<VacancyStatus>('ALL');
  const { showToast } = useToastStore();

  const loadVacancies = useCallback(async () => {
    try {
      // TODO: Replace with real API call
      // const data = await employerApi.getMyVacancies({ status: statusFilter, search: searchQuery });

      // Mock data for now
      const mockVacancies: Vacancy[] = [
        {
          id: '1',
          title: 'Senior React Native Developer',
          profession: 'Разработчик',
          city: 'Москва',
          salaryMin: 200000,
          salaryMax: 300000,
          status: 'published',
          views: 1234,
          applicationsCount: 43,
          isTop: true,
          topUntil: '2025-11-20',
          createdAt: '2025-11-01',
          publishedAt: '2025-11-02',
        },
        {
          id: '2',
          title: 'Product Manager',
          profession: 'Менеджер продукта',
          city: 'Санкт-Петербург',
          salaryMin: 150000,
          salaryMax: 250000,
          status: 'published',
          views: 856,
          applicationsCount: 27,
          isTop: false,
          createdAt: '2025-10-28',
          publishedAt: '2025-10-29',
        },
        {
          id: '3',
          title: 'UX/UI Designer',
          profession: 'Дизайнер',
          city: 'Москва',
          salaryMin: 120000,
          salaryMax: 180000,
          status: 'draft',
          views: 0,
          applicationsCount: 0,
          isTop: false,
          createdAt: '2025-11-10',
        },
      ];

      let filtered = mockVacancies;
      if (statusFilter !== 'ALL') {
        filtered = filtered.filter(v => v.status === statusFilter);
      }
      if (searchQuery) {
        filtered = filtered.filter(v =>
          v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.profession.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setVacancies(filtered);
    } catch (error: any) {
      console.error('Failed to load vacancies:', error);
      showToast('error', 'Ошибка загрузки вакансий');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, searchQuery, showToast]);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        // Mock data
        const mockVacancies: Vacancy[] = [
          {
            id: '1',
            title: 'Senior React Native Developer',
            profession: 'Разработчик',
            city: 'Москва',
            salaryMin: 200000,
            salaryMax: 300000,
            status: 'published',
            views: 1234,
            applicationsCount: 43,
            isTop: true,
            topUntil: '2025-11-20',
            createdAt: '2025-11-01',
            publishedAt: '2025-11-02',
          },
          {
            id: '2',
            title: 'Product Manager',
            profession: 'Менеджер продукта',
            city: 'Санкт-Петербург',
            salaryMin: 150000,
            salaryMax: 250000,
            status: 'published',
            views: 856,
            applicationsCount: 27,
            isTop: false,
            createdAt: '2025-10-28',
            publishedAt: '2025-10-29',
          },
          {
            id: '3',
            title: 'UX/UI Designer',
            profession: 'Дизайнер',
            city: 'Москва',
            salaryMin: 120000,
            salaryMax: 180000,
            status: 'draft',
            views: 0,
            applicationsCount: 0,
            isTop: false,
            createdAt: '2025-11-10',
          },
        ];

        if (mounted) {
          let filtered = mockVacancies;
          if (statusFilter !== 'ALL') {
            filtered = filtered.filter(v => v.status === statusFilter);
          }
          if (searchQuery) {
            filtered = filtered.filter(v =>
              v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              v.profession.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }
          setVacancies(filtered);
        }
      } catch (error: any) {
        console.error('Failed to load vacancies:', error);
        if (mounted) {
          showToast('error', 'Ошибка загрузки вакансий');
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
  }, [statusFilter, searchQuery, showToast]);

  const onRefresh = () => {
    haptics.light();
    setRefreshing(true);
    loadVacancies();
  };

  const handleCreateVacancy = () => {
    haptics.medium();
    navigation.navigate('CreateVacancyV2');
  };

  const handleVacancyPress = (vacancy: Vacancy) => {
    haptics.medium();
    // TODO: Navigate to vacancy details/edit screen
    showToast('info', 'Редактирование вакансии - в разработке');
  };

  const handleBoostVacancy = (vacancy: Vacancy) => {
    haptics.medium();
    navigation.navigate('EmployerPricing');
  };

  const VacancyCard = React.memo(({ item, index }: { item: Vacancy; index: number }) => {
    const statusConfig = {
      published: { label: 'Опубликована', color: colors.accentGreen, icon: 'check-circle' },
      draft: { label: 'Черновик', color: colors.textSecondary, icon: 'file-document-edit' },
      archived: { label: 'Архив', color: colors.textSecondary, icon: 'archive' },
    };

    const config = statusConfig[item.status];

    return (
      <Animated.View entering={FadeInDown.delay(index * 30).duration(400)}>
        <TouchableOpacity onPress={() => handleVacancyPress(item)} activeOpacity={0.8}>
          <GlassCard style={styles.vacancyCard}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{item.title}</Text>
                {item.isTop && (
                  <View style={styles.topBadge}>
                    <Icon name="crown" size={12} color={colors.accentOrange} />
                    <Text style={styles.topText}>ТОП</Text>
                  </View>
                )}
              </View>
              <View style={[styles.statusBadge, { backgroundColor: `${config.color}20` }]}>
                <Icon name={config.icon} size={14} color={config.color} />
                <Text style={[styles.statusText, { color: config.color }]}>
                  {config.label}
                </Text>
              </View>
            </View>

            {/* Details */}
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Icon name="briefcase-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.detailText}>{item.profession}</Text>
              </View>
              <View style={styles.detailItem}>
                <Icon name="map-marker" size={14} color={colors.textSecondary} />
                <Text style={styles.detailText}>{item.city}</Text>
              </View>
            </View>

            {/* Salary */}
            {(item.salaryMin || item.salaryMax) && (
              <View style={styles.salaryRow}>
                <Icon name="cash" size={16} color={colors.accentGreen} />
                <Text style={styles.salaryText}>
                  {item.salaryMin && item.salaryMax
                    ? `${item.salaryMin.toLocaleString()} - ${item.salaryMax.toLocaleString()} ₽`
                    : item.salaryMin
                    ? `от ${item.salaryMin.toLocaleString()} ₽`
                    : `до ${item.salaryMax.toLocaleString()} ₽`}
                </Text>
              </View>
            )}

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Icon name="eye" size={16} color={colors.accentBlue} />
                <Text style={styles.statValue}>{item.views}</Text>
                <Text style={styles.statLabel}>просмотров</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Icon name="account-multiple" size={16} color={colors.accentPurple} />
                <Text style={styles.statValue}>{item.applicationsCount}</Text>
                <Text style={styles.statLabel}>откликов</Text>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.cardFooter}>
              <Text style={styles.dateText}>
                Создана: {new Date(item.createdAt).toLocaleDateString('ru-RU')}
              </Text>
              {item.isTop && item.topUntil && (
                <View style={styles.topUntil}>
                  <Icon name="clock-outline" size={12} color={colors.accentOrange} />
                  <Text style={styles.topUntilText}>
                    Топ до: {new Date(item.topUntil).toLocaleDateString('ru-RU')}
                  </Text>
                </View>
              )}
            </View>

            {/* Actions - только для опубликованных вакансий */}
            {item.status === 'published' && (
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    handleBoostVacancy(item);
                  }}
                  style={styles.boostButton}
                  activeOpacity={0.7}
                >
                  <Icon name="rocket-launch" size={16} color={colors.accentGreen} />
                  <Text style={styles.boostButtonText}>Буст</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    navigation.navigate('EmployerPricing');
                  }}
                  style={styles.servicesButton}
                  activeOpacity={0.7}
                >
                  <Icon name="star" size={16} color={colors.accentBlue} />
                  <Text style={styles.servicesButtonText}>Доп. услуги</Text>
                </TouchableOpacity>
              </View>
            )}
          </GlassCard>
        </TouchableOpacity>
      </Animated.View>
    );
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />
        <View style={styles.loadingContainer}>
          <MetalIcon name="loading" variant="chrome" size="large" glow />
          <Text style={styles.loadingText}>Загрузка вакансий...</Text>
        </View>
      </View>
    );
  }

  const publishedCount = vacancies.filter(v => v.status === 'published').length;
  const draftCount = vacancies.filter(v => v.status === 'draft').length;
  const archivedCount = vacancies.filter(v => v.status === 'archived').length;
  const totalViews = vacancies.reduce((sum, v) => sum + v.views, 0);
  const totalApplications = vacancies.reduce((sum, v) => sum + v.applicationsCount, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />

      {/* Header */}
      <View style={styles.header}>
        <MetalIcon name="briefcase" variant="gold" size="medium" glow />
        <Text style={styles.headerTitle}>Мои вакансии</Text>
        <TouchableOpacity onPress={handleCreateVacancy} style={styles.addButton}>
          <Icon name="plus" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Summary Stats */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.summaryContainer}>
        <GlassCard style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{publishedCount}</Text>
              <Text style={styles.summaryLabel}>Активных</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totalViews}</Text>
              <Text style={styles.summaryLabel}>Просмотров</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totalApplications}</Text>
              <Text style={styles.summaryLabel}>Откликов</Text>
            </View>
          </View>
        </GlassCard>
      </Animated.View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск по названию или профессии..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Status Filters */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'ALL', label: 'Все', count: vacancies.length },
            { key: 'published', label: 'Опубликованные', count: publishedCount },
            { key: 'draft', label: 'Черновики', count: draftCount },
            { key: 'archived', label: 'Архив', count: archivedCount },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              onPress={() => {
                haptics.light();
                setStatusFilter(filter.key as VacancyStatus);
              }}
              style={[
                styles.filterChip,
                statusFilter === filter.key && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  statusFilter === filter.key && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
              <View style={[
                styles.filterBadge,
                statusFilter === filter.key && styles.filterBadgeActive,
              ]}>
                <Text style={[
                  styles.filterBadgeText,
                  statusFilter === filter.key && styles.filterBadgeTextActive,
                ]}>
                  {filter.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Vacancies List */}
      <FlatList
        data={vacancies}
        renderItem={({ item, index }) => <VacancyCard item={item} index={index} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MetalIcon name="briefcase-off" variant="silver" size="large" />
            <Text style={styles.emptyTitle}>
              {statusFilter === 'ALL' ? 'У вас пока нет вакансий' : 'Нет вакансий с таким статусом'}
            </Text>
            <Text style={styles.emptyText}>
              Создайте первую вакансию и начните поиск сотрудников
            </Text>
            <GlassButton
              title="Создать вакансию"
              onPress={handleCreateVacancy}
              icon="plus"
              variant="primary"
              style={{ marginTop: sizes.lg }}
            />
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBlack,
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
    gap: sizes.sm,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    flex: 1,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContainer: {
    paddingHorizontal: sizes.lg,
    marginBottom: sizes.md,
  },
  summaryCard: {
    padding: sizes.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: '100%',
    backgroundColor: colors.glassBorder,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassBackground,
    borderRadius: 12,
    marginHorizontal: sizes.lg,
    paddingHorizontal: sizes.md,
    marginBottom: sizes.md,
  },
  searchIcon: {
    marginRight: sizes.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: sizes.md,
  },
  filterContainer: {
    paddingLeft: sizes.lg,
    marginBottom: sizes.md,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: sizes.md,
    paddingVertical: sizes.sm,
    borderRadius: 20,
    backgroundColor: colors.glassBackground,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginRight: sizes.sm,
    gap: sizes.xs,
  },
  filterChipActive: {
    backgroundColor: colors.accentBlue,
    borderColor: colors.accentBlue,
  },
  filterText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  filterTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  filterBadge: {
    backgroundColor: colors.glassBorder,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterBadgeText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  filterBadgeTextActive: {
    color: colors.textPrimary,
  },
  listContent: {
    padding: sizes.lg,
  },
  vacancyCard: {
    marginBottom: sizes.md,
    padding: sizes.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: sizes.sm,
  },
  titleContainer: {
    flex: 1,
    marginRight: sizes.sm,
  },
  title: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  topBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  topText: {
    ...typography.caption,
    color: colors.accentOrange,
    fontSize: 10,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: sizes.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
  },
  detailsRow: {
    flexDirection: 'row',
    gap: sizes.md,
    marginBottom: sizes.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  salaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.xs,
    marginBottom: sizes.sm,
  },
  salaryText: {
    ...typography.body,
    color: colors.accentGreen,
    fontWeight: '700',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: sizes.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.glassBorder,
    marginVertical: sizes.sm,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '700',
    marginTop: 2,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: colors.glassBorder,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  topUntil: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topUntilText: {
    ...typography.caption,
    color: colors.accentOrange,
    fontSize: 11,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: sizes.sm,
    marginTop: sizes.sm,
    paddingTop: sizes.sm,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
  boostButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: sizes.sm,
    backgroundColor: `${colors.accentGreen}20`,
    borderRadius: sizes.radiusSmall,
  },
  boostButtonText: {
    ...typography.caption,
    color: colors.accentGreen,
    fontWeight: '600',
    fontSize: 12,
  },
  servicesButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: sizes.sm,
    backgroundColor: `${colors.accentBlue}20`,
    borderRadius: sizes.radiusSmall,
  },
  servicesButtonText: {
    ...typography.caption,
    color: colors.accentBlue,
    fontWeight: '600',
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: sizes.xxl * 2,
    paddingHorizontal: sizes.lg,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: sizes.lg,
    marginBottom: sizes.sm,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
