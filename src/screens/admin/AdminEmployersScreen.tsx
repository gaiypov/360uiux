/**
 * 360° РАБОТА - ULTRA EDITION
 * Admin Employers Screen - Employer Management & Analytics
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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GlassCard, GlassButton, MetalIcon } from '@/components/ui';
import { colors, typography, sizes } from '@/constants';
import { AdminUser } from '@/types';
import { adminApi } from '@/services/adminApi';
import { useToastStore } from '@/stores/toastStore';
import { haptics } from '@/utils/haptics';

type SortType = 'balance' | 'vacancies' | 'spending' | 'recent';

export function AdminEmployersScreen({ navigation }: any) {
  const [employers, setEmployers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('recent');
  const [selectedEmployer, setSelectedEmployer] = useState<AdminUser | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { showToast } = useToastStore();

  const loadEmployers = useCallback(async () => {
    try {
      const params: any = {
        page: 1,
        limit: 100,
        role: 'EMPLOYER', // Только работодатели
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      const data = await adminApi.getUsers(params);

      // Сортировка
      let sorted = [...data.users];
      switch (sortBy) {
        case 'balance':
          sorted.sort((a, b) => b.balance - a.balance);
          break;
        case 'vacancies':
          sorted.sort((a, b) => b.stats.vacancies - a.stats.vacancies);
          break;
        case 'spending':
          // Примерная трата = вакансии * средняя стоимость
          sorted.sort((a, b) => b.stats.vacancies - a.stats.vacancies);
          break;
        case 'recent':
        default:
          // По умолчанию уже отсортировано
          break;
      }

      setEmployers(sorted);
    } catch (error: any) {
      console.error('Failed to load employers:', error);
      showToast('error', 'Ошибка загрузки работодателей');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, sortBy, showToast]);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const params: any = {
          page: 1,
          limit: 100,
          role: 'EMPLOYER',
        };

        if (searchQuery) {
          params.search = searchQuery;
        }

        const data = await adminApi.getUsers(params);

        if (mounted) {
          let sorted = [...data.users];
          switch (sortBy) {
            case 'balance':
              sorted.sort((a, b) => b.balance - a.balance);
              break;
            case 'vacancies':
              sorted.sort((a, b) => b.stats.vacancies - a.stats.vacancies);
              break;
            case 'spending':
              sorted.sort((a, b) => b.stats.vacancies - a.stats.vacancies);
              break;
          }
          setEmployers(sorted);
        }
      } catch (error: any) {
        console.error('Failed to load employers:', error);
        if (mounted) {
          showToast('error', 'Ошибка загрузки работодателей');
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
  }, [searchQuery, sortBy, showToast]);

  const onRefresh = () => {
    haptics.light();
    setRefreshing(true);
    loadEmployers();
  };

  const handleEmployerPress = (employer: AdminUser) => {
    haptics.medium();
    setSelectedEmployer(employer);
    setModalVisible(true);
  };

  const handleToggleVerified = async () => {
    if (!selectedEmployer) return;

    try {
      const newVerified = !selectedEmployer.verified;
      await adminApi.updateUser(selectedEmployer.id, { verified: newVerified });

      setEmployers(employers.map(e =>
        e.id === selectedEmployer.id ? { ...e, verified: newVerified } : e
      ));
      setSelectedEmployer({ ...selectedEmployer, verified: newVerified });

      showToast('success', newVerified ? 'Компания верифицирована' : 'Верификация отменена');
    } catch (error) {
      showToast('error', 'Ошибка обновления');
    }
  };

  const EmployerCard = React.memo(({ item, index }: { item: AdminUser; index: number }) => {
    const totalSpending = item.stats.vacancies * 500; // Примерная оценка

    return (
      <Animated.View entering={FadeInDown.delay(index * 30).duration(400)}>
        <TouchableOpacity
          onPress={() => handleEmployerPress(item)}
          activeOpacity={0.8}
        >
          <GlassCard style={styles.employerCard}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <View style={styles.companyInfo}>
                <View style={styles.companyNameRow}>
                  <Icon name="office-building" size={20} color={colors.accentPurple} />
                  <Text style={styles.companyName}>{item.companyName || 'Компания'}</Text>
                  {item.verified && (
                    <Icon name="check-decagram" size={16} color={colors.accentBlue} />
                  )}
                </View>
                <Text style={styles.contactPerson}>{item.name}</Text>
                <Text style={styles.phone}>{item.phone}</Text>
              </View>

              {/* Balance Badge */}
              <View style={styles.balanceBadge}>
                <Icon name="wallet" size={16} color={colors.accentGreen} />
                <Text style={styles.balanceText}>{item.balance.toLocaleString()} ₽</Text>
              </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Icon name="briefcase" size={16} color={colors.accentPurple} />
                <Text style={styles.statValue}>{item.stats.vacancies}</Text>
                <Text style={styles.statLabel}>вакансий</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Icon name="account-multiple" size={16} color={colors.accentBlue} />
                <Text style={styles.statValue}>{item.stats.applications}</Text>
                <Text style={styles.statLabel}>откликов</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Icon name="cash-minus" size={16} color={colors.accentOrange} />
                <Text style={styles.statValue}>{totalSpending.toLocaleString()} ₽</Text>
                <Text style={styles.statLabel}>потрачено</Text>
              </View>
            </View>

            {/* Footer - Quick Actions */}
            <View style={styles.cardFooter}>
              <View style={styles.quickAction}>
                <Icon name="video" size={14} color={colors.textSecondary} />
                <Text style={styles.quickActionText}>{item.stats.videos} видео</Text>
              </View>
              {item.inn && (
                <View style={styles.quickAction}>
                  <Icon name="file-document" size={14} color={colors.textSecondary} />
                  <Text style={styles.quickActionText}>ИНН: {item.inn}</Text>
                </View>
              )}
            </View>
          </GlassCard>
        </TouchableOpacity>
      </Animated.View>
    );
  });

  const renderEmployer = useCallback(({ item, index }: { item: AdminUser; index: number }) => (
    <EmployerCard item={item} index={index} />
  ), []);

  const keyExtractor = useCallback((item: AdminUser) => item.id, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />
        <View style={styles.loadingContainer}>
          <MetalIcon name="loading" variant="chrome" size="large" glow />
          <Text style={styles.loadingText}>Загрузка работодателей...</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />

      {/* Header */}
      <View style={styles.header}>
        <MetalIcon name="office-building" variant="gold" size="medium" glow />
        <Text style={styles.title}>Работодатели</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Summary Stats */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.summaryContainer}>
        <GlassCard style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{employers.length}</Text>
              <Text style={styles.summaryLabel}>Компаний</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {employers.filter(e => e.verified).length}
              </Text>
              <Text style={styles.summaryLabel}>Верифицировано</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {employers.reduce((sum, e) => sum + e.balance, 0).toLocaleString()} ₽
              </Text>
              <Text style={styles.summaryLabel}>Общий баланс</Text>
            </View>
          </View>
        </GlassCard>
      </Animated.View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск по компании, имени, телефону..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Sort Filters */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'recent', label: 'Недавние', icon: 'clock-outline' },
            { key: 'balance', label: 'По балансу', icon: 'wallet' },
            { key: 'vacancies', label: 'По вакансиям', icon: 'briefcase' },
            { key: 'spending', label: 'По тратам', icon: 'cash-minus' },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              onPress={() => {
                haptics.light();
                setSortBy(filter.key as SortType);
              }}
              style={[
                styles.filterChip,
                sortBy === filter.key && styles.filterChipActive,
              ]}
            >
              <Icon
                name={filter.icon}
                size={14}
                color={sortBy === filter.key ? colors.textPrimary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.filterText,
                  sortBy === filter.key && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Employers List */}
      <FlatList
        data={employers}
        renderItem={renderEmployer}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="office-building-off" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>Работодатели не найдены</Text>
          </View>
        }
      />

      {/* Employer Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedEmployer && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleRow}>
                    <Icon name="office-building" size={24} color={colors.accentPurple} />
                    <Text style={styles.modalTitle}>{selectedEmployer.companyName}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Icon name="close" size={24} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  {/* Company Info */}
                  <Text style={styles.sectionTitle}>ИНФОРМАЦИЯ О КОМПАНИИ</Text>
                  <GlassCard style={styles.infoCard}>
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>Контактное лицо:</Text>
                      <Text style={styles.modalValue}>{selectedEmployer.name}</Text>
                    </View>
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>Телефон:</Text>
                      <Text style={styles.modalValue}>{selectedEmployer.phone}</Text>
                    </View>
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>Email:</Text>
                      <Text style={styles.modalValue}>{selectedEmployer.email || 'Не указан'}</Text>
                    </View>
                    {selectedEmployer.inn && (
                      <View style={styles.modalRow}>
                        <Text style={styles.modalLabel}>ИНН:</Text>
                        <Text style={styles.modalValue}>{selectedEmployer.inn}</Text>
                      </View>
                    )}
                    {selectedEmployer.kpp && (
                      <View style={styles.modalRow}>
                        <Text style={styles.modalLabel}>КПП:</Text>
                        <Text style={styles.modalValue}>{selectedEmployer.kpp}</Text>
                      </View>
                    )}
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>Верификация:</Text>
                      <View style={styles.verifiedBadge}>
                        {selectedEmployer.verified ? (
                          <>
                            <Icon name="check-circle" size={16} color={colors.accentGreen} />
                            <Text style={[styles.modalValue, { color: colors.accentGreen }]}>
                              Верифицирована
                            </Text>
                          </>
                        ) : (
                          <>
                            <Icon name="alert-circle" size={16} color={colors.accentOrange} />
                            <Text style={[styles.modalValue, { color: colors.accentOrange }]}>
                              Не верифицирована
                            </Text>
                          </>
                        )}
                      </View>
                    </View>
                  </GlassCard>

                  {/* Stats */}
                  <Text style={styles.sectionTitle}>СТАТИСТИКА</Text>
                  <GlassCard style={styles.infoCard}>
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>Вакансии:</Text>
                      <Text style={styles.modalValue}>{selectedEmployer.stats.vacancies}</Text>
                    </View>
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>Отклики:</Text>
                      <Text style={styles.modalValue}>{selectedEmployer.stats.applications}</Text>
                    </View>
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>Видео:</Text>
                      <Text style={styles.modalValue}>{selectedEmployer.stats.videos}</Text>
                    </View>
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>Баланс:</Text>
                      <Text style={[styles.modalValue, { color: colors.accentGreen }]}>
                        {selectedEmployer.balance.toLocaleString()} ₽
                      </Text>
                    </View>
                  </GlassCard>

                  {/* Actions */}
                  <View style={styles.modalActions}>
                    <GlassButton
                      title={selectedEmployer.verified ? 'Отменить верификацию' : 'Верифицировать компанию'}
                      onPress={handleToggleVerified}
                      icon={selectedEmployer.verified ? 'close-circle' : 'check-circle'}
                      variant={selectedEmployer.verified ? 'secondary' : 'primary'}
                    />
                    <GlassButton
                      title="Посмотреть транзакции"
                      onPress={() => {
                        setModalVisible(false);
                        navigation.navigate('AdminTransactions');
                      }}
                      icon="cash-multiple"
                      variant="secondary"
                    />
                  </View>
                </ScrollView>
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
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    flex: 1,
  },
  headerSpacer: {
    width: 40,
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
    gap: 4,
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
  listContent: {
    padding: sizes.lg,
  },
  employerCard: {
    marginBottom: sizes.md,
    padding: sizes.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: sizes.sm,
  },
  companyInfo: {
    flex: 1,
  },
  companyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.xs,
    marginBottom: 4,
  },
  companyName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  contactPerson: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  phone: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  balanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: sizes.sm,
    paddingVertical: 4,
    backgroundColor: `${colors.accentGreen}20`,
    borderRadius: 8,
  },
  balanceText: {
    ...typography.caption,
    color: colors.accentGreen,
    fontWeight: '700',
    fontSize: 12,
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
    gap: sizes.md,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickActionText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
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
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: sizes.lg,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.sm,
    flex: 1,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  modalBody: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: sizes.md,
    marginBottom: sizes.sm,
  },
  infoCard: {
    padding: sizes.md,
    marginBottom: sizes.md,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: sizes.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
    alignItems: 'center',
  },
  modalLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  modalValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: sizes.sm,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modalActions: {
    gap: sizes.sm,
    marginTop: sizes.md,
    marginBottom: sizes.lg,
  },
});
