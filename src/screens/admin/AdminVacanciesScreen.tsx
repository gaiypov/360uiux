/**
 * 360° РАБОТА - ULTRA EDITION
 * Admin Vacancies Screen - Vacancy Moderation
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
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GlassCard, GlassButton } from '@/components/ui';
import { colors, typography, sizes } from '@/constants';
import { AdminVacancy } from '@/types';
import { adminApi } from '@/services/adminApi';
import { useToastStore } from '@/stores/toastStore';
import { haptics } from '@/utils/haptics';

type FilterType = 'ALL' | 'draft' | 'published' | 'archived';

export function AdminVacanciesScreen({ navigation }: any) {
  const [vacancies, setVacancies] = useState<AdminVacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [selectedVacancy, setSelectedVacancy] = useState<AdminVacancy | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { showToast } = useToastStore();

  const loadVacancies = useCallback(async () => {
    try {
      const params: any = { page: 1, limit: 50 };
      if (filter !== 'ALL') {
        params.status = filter;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }

      const data = await adminApi.getVacancies(params);
      setVacancies(data.vacancies);
    } catch (error: any) {
      console.error('Failed to load vacancies:', error);
      showToast('error', 'Ошибка загрузки вакансий');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, searchQuery, showToast]);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const params: any = { page: 1, limit: 50 };
        if (filter !== 'ALL') {
          params.status = filter;
        }
        if (searchQuery) {
          params.search = searchQuery;
        }

        const data = await adminApi.getVacancies(params);
        if (mounted) {
          setVacancies(data.vacancies);
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
  }, [filter, searchQuery, showToast]);

  const onRefresh = () => {
    haptics.light();
    setRefreshing(true);
    loadVacancies();
  };

  const handleVacancyPress = (vacancy: AdminVacancy) => {
    haptics.medium();
    setSelectedVacancy(vacancy);
    setModalVisible(true);
  };

  const handleToggleTop = async () => {
    if (!selectedVacancy) return;

    try {
      const newIsTop = !selectedVacancy.isTop;
      await adminApi.updateVacancy(selectedVacancy.id, { isTop: newIsTop });

      setVacancies(vacancies.map(v =>
        v.id === selectedVacancy.id ? { ...v, isTop: newIsTop } : v
      ));
      setSelectedVacancy({ ...selectedVacancy, isTop: newIsTop });

      showToast('success', newIsTop ? 'Вакансия в топе' : 'Убрано из топа');
    } catch (error) {
      showToast('error', 'Ошибка обновления');
    }
  };

  const handleChangeStatus = async (newStatus: string) => {
    if (!selectedVacancy) return;

    try {
      await adminApi.updateVacancy(selectedVacancy.id, { status: newStatus });

      setVacancies(vacancies.map(v =>
        v.id === selectedVacancy.id ? { ...v, status: newStatus } : v
      ));
      setSelectedVacancy({ ...selectedVacancy, status: newStatus });

      showToast('success', 'Статус обновлен');
    } catch (error) {
      showToast('error', 'Ошибка обновления');
    }
  };

  const handleDeleteVacancy = () => {
    if (!selectedVacancy) return;

    Alert.alert(
      'Удалить вакансию?',
      'Вы уверены, что хотите удалить эту вакансию?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminApi.deleteVacancy(selectedVacancy.id);
              setVacancies(vacancies.filter(v => v.id !== selectedVacancy.id));
              setModalVisible(false);
              showToast('success', 'Вакансия удалена');
            } catch (error) {
              showToast('error', 'Ошибка удаления');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return colors.accentGreen;
      case 'draft':
        return colors.accentOrange;
      case 'archived':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published':
        return 'Опубликована';
      case 'draft':
        return 'Черновик';
      case 'archived':
        return 'Архив';
      default:
        return status;
    }
  };

  const renderVacancy = useCallback(({ item, index }: { item: AdminVacancy; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
      <TouchableOpacity
        onPress={() => handleVacancyPress(item)}
        activeOpacity={0.8}
      >
        <GlassCard style={styles.vacancyCard}>
          <View style={styles.vacancyHeader}>
            <View style={styles.vacancyInfo}>
              <View style={styles.vacancyTitleRow}>
                <Text style={styles.vacancyTitle}>{item.title}</Text>
                {item.isTop && (
                  <Icon name="crown" size={16} color={colors.accentOrange} />
                )}
              </View>
              <Text style={styles.vacancyProfession}>{item.profession}</Text>
              <Text style={styles.vacancyLocation}>{item.city}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {getStatusLabel(item.status)}
              </Text>
            </View>
          </View>

          <View style={styles.vacancySalary}>
            <Icon name="currency-rub" size={16} color={colors.accentGreen} />
            <Text style={styles.salaryText}>
              {item.salaryMin?.toLocaleString()} - {item.salaryMax?.toLocaleString()} ₽
            </Text>
          </View>

          <View style={styles.vacancyStats}>
            <View style={styles.statItem}>
              <Icon name="eye" size={16} color={colors.textSecondary} />
              <Text style={styles.statText}>{item.views}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="account-multiple" size={16} color={colors.textSecondary} />
              <Text style={styles.statText}>{item.applicationsCount}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="office-building" size={16} color={colors.textSecondary} />
              <Text style={styles.statText}>{item.employer.name}</Text>
              {item.employer.verified && (
                <Icon name="check-decagram" size={14} color={colors.accentBlue} />
              )}
            </View>
          </View>
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  ), []);

  const keyExtractor = useCallback((item: AdminVacancy) => item.id, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Вакансии</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск вакансий..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        {(['ALL', 'published', 'draft', 'archived'] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => {
              haptics.light();
              setFilter(f);
            }}
            style={[
              styles.filterChip,
              filter === f && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}
            >
              {f === 'ALL' ? 'Все' : getStatusLabel(f)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Vacancies List */}
      <FlatList
        data={vacancies}
        renderItem={renderVacancy}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="briefcase-off" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>Вакансии не найдены</Text>
          </View>
        }
      />

      {/* Vacancy Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedVacancy && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedVacancy.title}</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Icon name="close" size={24} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Статус:</Text>
                    <Text style={[styles.modalValue, { color: getStatusColor(selectedVacancy.status) }]}>
                      {getStatusLabel(selectedVacancy.status)}
                    </Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Просмотры:</Text>
                    <Text style={styles.modalValue}>{selectedVacancy.views}</Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Отклики:</Text>
                    <Text style={styles.modalValue}>{selectedVacancy.applicationsCount}</Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Топ вакансия:</Text>
                    <Text style={styles.modalValue}>{selectedVacancy.isTop ? 'Да' : 'Нет'}</Text>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <GlassButton
                    title={selectedVacancy.isTop ? 'Убрать из топа' : 'В топ'}
                    onPress={handleToggleTop}
                    icon={selectedVacancy.isTop ? 'crown-off' : 'crown'}
                    variant={selectedVacancy.isTop ? 'secondary' : 'primary'}
                  />
                  {selectedVacancy.status !== 'published' && (
                    <GlassButton
                      title="Опубликовать"
                      onPress={() => handleChangeStatus('published')}
                      icon="check"
                      variant="primary"
                    />
                  )}
                  {selectedVacancy.status === 'published' && (
                    <GlassButton
                      title="В архив"
                      onPress={() => handleChangeStatus('archived')}
                      icon="archive"
                      variant="secondary"
                    />
                  )}
                  <GlassButton
                    title="Удалить"
                    onPress={handleDeleteVacancy}
                    icon="delete"
                    variant="danger"
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    paddingHorizontal: sizes.lg,
    marginBottom: sizes.md,
    gap: sizes.sm,
  },
  filterChip: {
    paddingHorizontal: sizes.md,
    paddingVertical: sizes.sm,
    borderRadius: 20,
    backgroundColor: colors.glassBackground,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  filterChipActive: {
    backgroundColor: colors.accentBlue,
    borderColor: colors.accentBlue,
  },
  filterText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  listContent: {
    padding: sizes.lg,
  },
  vacancyCard: {
    marginBottom: sizes.md,
    padding: sizes.md,
  },
  vacancyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: sizes.sm,
  },
  vacancyInfo: {
    flex: 1,
  },
  vacancyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.xs,
  },
  vacancyTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  vacancyProfession: {
    ...typography.caption,
    color: colors.accentPurple,
    marginTop: 2,
  },
  vacancyLocation: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: sizes.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 11,
  },
  vacancySalary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: sizes.sm,
  },
  salaryText: {
    ...typography.body,
    color: colors.accentGreen,
    fontWeight: '600',
  },
  vacancyStats: {
    flexDirection: 'row',
    gap: sizes.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: sizes.xxl * 2,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: sizes.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.secondaryBlack,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: sizes.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: sizes.lg,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    flex: 1,
  },
  modalBody: {
    marginBottom: sizes.lg,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: sizes.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  modalLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  modalValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  modalActions: {
    gap: sizes.sm,
  },
});
