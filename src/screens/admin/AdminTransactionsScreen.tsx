/**
 * 360° РАБОТА - ULTRA EDITION
 * Admin Transactions Screen - Financial Management
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GlassCard, MetalIcon } from '@/components/ui';
import { colors, typography, sizes } from '@/constants';
import { AdminTransaction, AdminFinancialStats } from '@/types';
import { adminApi } from '@/services/adminApi';
import { useToastStore } from '@/stores/toastStore';
import { haptics } from '@/utils/haptics';

type FilterType = 'ALL' | 'deposit' | 'payment' | 'refund' | 'withdrawal';
type StatusFilter = 'ALL' | 'pending' | 'completed' | 'failed';

export function AdminTransactionsScreen({ navigation }: any) {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [stats, setStats] = useState<AdminFinancialStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [typeFilter, setTypeFilter] = useState<FilterType>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [selectedTransaction, setSelectedTransaction] = useState<AdminTransaction | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { showToast } = useToastStore();

  const loadData = useCallback(async () => {
    try {
      const [transactionsData, statsData] = await Promise.all([
        adminApi.getTransactions({
          page: 1,
          limit: 50,
          ...(typeFilter !== 'ALL' && { type: typeFilter }),
          ...(statusFilter !== 'ALL' && { status: statusFilter }),
        }),
        adminApi.getFinancialStats({ period: '7d' }),
      ]);

      setTransactions(transactionsData.transactions);
      setStats(statsData);
    } catch (error: any) {
      console.error('Failed to load transactions:', error);
      showToast('error', 'Ошибка загрузки транзакций');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [typeFilter, statusFilter, showToast]);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const [transactionsData, statsData] = await Promise.all([
          adminApi.getTransactions({
            page: 1,
            limit: 50,
            ...(typeFilter !== 'ALL' && { type: typeFilter }),
            ...(statusFilter !== 'ALL' && { status: statusFilter }),
          }),
          adminApi.getFinancialStats({ period: '7d' }),
        ]);

        if (mounted) {
          setTransactions(transactionsData.transactions);
          setStats(statsData);
        }
      } catch (error: any) {
        console.error('Failed to load transactions:', error);
        if (mounted) {
          showToast('error', 'Ошибка загрузки транзакций');
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
  }, [typeFilter, statusFilter, showToast]);

  const onRefresh = () => {
    haptics.light();
    setRefreshing(true);
    loadData();
  };

  const handleTransactionPress = (transaction: AdminTransaction) => {
    haptics.medium();
    setSelectedTransaction(transaction);
    setModalVisible(true);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return colors.accentGreen;
      case 'payment':
        return colors.accentOrange;
      case 'refund':
        return colors.accentBlue;
      case 'withdrawal':
        return colors.accentPurple;
      default:
        return colors.textSecondary;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Пополнение';
      case 'payment':
        return 'Оплата';
      case 'refund':
        return 'Возврат';
      case 'withdrawal':
        return 'Вывод';
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.accentGreen;
      case 'pending':
        return colors.accentOrange;
      case 'failed':
        return colors.accentRed;
      case 'cancelled':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Завершено';
      case 'pending':
        return 'В обработке';
      case 'failed':
        return 'Ошибка';
      case 'cancelled':
        return 'Отменено';
      default:
        return status;
    }
  };

  const renderTransaction = useCallback(({ item, index }: { item: AdminTransaction; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
      <TouchableOpacity
        onPress={() => handleTransactionPress(item)}
        activeOpacity={0.8}
      >
        <GlassCard style={styles.transactionCard}>
          <View style={styles.transactionHeader}>
            <View style={styles.transactionInfo}>
              <View style={styles.transactionTitleRow}>
                <View style={[styles.typeIndicator, { backgroundColor: getTypeColor(item.type) }]} />
                <Text style={styles.transactionType}>{getTypeLabel(item.type)}</Text>
              </View>
              <Text style={styles.employerName}>{item.employer.name}</Text>
              {item.description && (
                <Text style={styles.description} numberOfLines={1}>
                  {item.description}
                </Text>
              )}
            </View>
            <View style={styles.amountColumn}>
              <Text style={[styles.amount, { color: getTypeColor(item.type) }]}>
                {item.type === 'deposit' || item.type === 'refund' ? '+' : '-'}
                {item.amount.toLocaleString()} ₽
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {getStatusLabel(item.status)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.transactionFooter}>
            {item.paymentSystem && (
              <View style={styles.paymentSystemBadge}>
                <Icon name="credit-card" size={12} color={colors.textSecondary} />
                <Text style={styles.paymentSystemText}>{item.paymentSystem}</Text>
              </View>
            )}
            <Text style={styles.date}>
              {new Date(item.createdAt).toLocaleString('ru-RU')}
            </Text>
          </View>
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  ), []);

  const keyExtractor = useCallback((item: AdminTransaction) => item.id, []);

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
        <Text style={styles.title}>Финансы</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Financial Overview */}
      {stats && (
        <Animated.View entering={FadeInDown.duration(400)} style={styles.overviewSection}>
          <GlassCard style={styles.overviewCard}>
            <View style={styles.overviewRow}>
              <View style={styles.overviewItem}>
                <Icon name="cash-multiple" size={24} color={colors.accentGreen} />
                <Text style={styles.overviewValue}>
                  {stats.overview.totalRevenue.toLocaleString()} ₽
                </Text>
                <Text style={styles.overviewLabel}>Общая выручка</Text>
              </View>
              <View style={styles.dividerVertical} />
              <View style={styles.overviewItem}>
                <Icon name="cash-minus" size={24} color={colors.accentOrange} />
                <Text style={styles.overviewValue}>
                  {stats.overview.totalPayments.toLocaleString()} ₽
                </Text>
                <Text style={styles.overviewLabel}>Списано</Text>
              </View>
              <View style={styles.dividerVertical} />
              <View style={styles.overviewItem}>
                <Icon name="cash-check" size={24} color={colors.accentBlue} />
                <Text style={styles.overviewValue}>
                  {stats.overview.netRevenue.toLocaleString()} ₽
                </Text>
                <Text style={styles.overviewLabel}>Чистая</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>
      )}

      {/* Type Filters */}
      <View style={styles.filterContainer}>
        {(['ALL', 'deposit', 'payment', 'refund', 'withdrawal'] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => {
              haptics.light();
              setTypeFilter(f);
            }}
            style={[
              styles.filterChip,
              typeFilter === f && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                typeFilter === f && styles.filterTextActive,
              ]}
            >
              {f === 'ALL' ? 'Все' : getTypeLabel(f)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Status Filters */}
      <View style={styles.filterContainer}>
        {(['ALL', 'completed', 'pending', 'failed'] as StatusFilter[]).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => {
              haptics.light();
              setStatusFilter(f);
            }}
            style={[
              styles.filterChip,
              statusFilter === f && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                statusFilter === f && styles.filterTextActive,
              ]}
            >
              {f === 'ALL' ? 'Все' : getStatusLabel(f)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transactions List */}
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="cash-off" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>Транзакции не найдены</Text>
          </View>
        }
      />

      {/* Transaction Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedTransaction && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Детали транзакции</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Icon name="close" size={24} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>ID:</Text>
                    <Text style={styles.modalValue}>{selectedTransaction.id}</Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Тип:</Text>
                    <Text style={[styles.modalValue, { color: getTypeColor(selectedTransaction.type) }]}>
                      {getTypeLabel(selectedTransaction.type)}
                    </Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Сумма:</Text>
                    <Text style={[styles.modalValue, { color: getTypeColor(selectedTransaction.type) }]}>
                      {selectedTransaction.amount.toLocaleString()} {selectedTransaction.currency}
                    </Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Статус:</Text>
                    <Text style={[styles.modalValue, { color: getStatusColor(selectedTransaction.status) }]}>
                      {getStatusLabel(selectedTransaction.status)}
                    </Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Работодатель:</Text>
                    <Text style={styles.modalValue}>{selectedTransaction.employer.name}</Text>
                  </View>
                  {selectedTransaction.paymentSystem && (
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>Система:</Text>
                      <Text style={styles.modalValue}>{selectedTransaction.paymentSystem}</Text>
                    </View>
                  )}
                  {selectedTransaction.description && (
                    <View style={styles.descriptionBox}>
                      <Text style={styles.modalLabel}>Описание:</Text>
                      <Text style={styles.descriptionText}>{selectedTransaction.description}</Text>
                    </View>
                  )}
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Создано:</Text>
                    <Text style={styles.modalValue}>
                      {new Date(selectedTransaction.createdAt).toLocaleString('ru-RU')}
                    </Text>
                  </View>
                  {selectedTransaction.completedAt && (
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>Завершено:</Text>
                      <Text style={styles.modalValue}>
                        {new Date(selectedTransaction.completedAt).toLocaleString('ru-RU')}
                      </Text>
                    </View>
                  )}
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
  overviewSection: {
    paddingHorizontal: sizes.lg,
    marginBottom: sizes.md,
  },
  overviewCard: {
    padding: sizes.md,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  overviewItem: {
    alignItems: 'center',
    flex: 1,
  },
  overviewValue: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: sizes.xs,
  },
  overviewLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dividerVertical: {
    width: 1,
    height: '100%',
    backgroundColor: colors.glassBorder,
    marginHorizontal: sizes.sm,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: sizes.lg,
    marginBottom: sizes.sm,
    gap: sizes.sm,
    flexWrap: 'wrap',
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
    fontSize: 11,
  },
  filterTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  listContent: {
    padding: sizes.lg,
  },
  transactionCard: {
    marginBottom: sizes.md,
    padding: sizes.md,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: sizes.sm,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.xs,
  },
  typeIndicator: {
    width: 4,
    height: 16,
    borderRadius: 2,
  },
  transactionType: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  employerName: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  amountColumn: {
    alignItems: 'flex-end',
  },
  amount: {
    ...typography.h3,
    fontWeight: '700',
    marginBottom: sizes.xs,
  },
  statusBadge: {
    paddingHorizontal: sizes.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 10,
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentSystemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: sizes.sm,
    paddingVertical: 2,
    backgroundColor: colors.glassBackground,
    borderRadius: 8,
  },
  paymentSystemText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  date: {
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
    maxHeight: '80%',
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
    textAlign: 'right',
    flex: 1,
    marginLeft: sizes.sm,
  },
  descriptionBox: {
    marginTop: sizes.md,
    padding: sizes.md,
    backgroundColor: colors.glassBackground,
    borderRadius: 12,
  },
  descriptionText: {
    ...typography.body,
    color: colors.textPrimary,
    marginTop: sizes.xs,
  },
});
