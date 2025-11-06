/**
 * 360° РАБОТА - ULTRA EDITION
 * Wallet Screen (Employer only)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StatusBar,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { GlassCard, MetalIcon, LoadingSpinner } from '@/components/ui';
import { colors, metalGradients, typography, sizes } from '@/constants';
import { useToastStore } from '@/stores/toastStore';
import { haptics } from '@/utils/haptics';
import { api, Transaction, WalletBalance } from '@/services/api';

export function WalletScreen({ navigation }: any) {
  const { showToast } = useToastStore();

  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);

  /**
   * Загрузка данных кошелька
   */
  const loadWalletData = useCallback(async () => {
    try {
      const [balanceData, transactionsData] = await Promise.all([
        api.getWalletBalance(),
        api.getTransactions({ limit: 50 }),
      ]);

      setBalance(balanceData);
      setTransactions(transactionsData.transactions);
    } catch (error: any) {
      console.error('Load wallet error:', error);
      showToast('error', 'Ошибка загрузки кошелька');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadWalletData();
  }, [loadWalletData]);

  /**
   * Обновление данных
   */
  const handleRefresh = () => {
    setRefreshing(true);
    loadWalletData();
  };

  /**
   * Инициация пополнения кошелька
   */
  const handleTopUp = async (amount: number, paymentSystem: 'tinkoff' | 'alfabank') => {
    try {
      setLoadingPayment(true);
      haptics.light();

      const response = await api.initPayment({
        amount,
        paymentSystem,
        cardType: 'business',
      });

      // Открываем URL оплаты в браузере
      const supported = await Linking.canOpenURL(response.paymentUrl);
      if (supported) {
        await Linking.openURL(response.paymentUrl);
        showToast('success', 'Перенаправление на оплату...');
      } else {
        showToast('error', 'Не удалось открыть страницу оплаты');
      }
    } catch (error: any) {
      console.error('Init payment error:', error);
      haptics.error();
      showToast('error', error.response?.data?.message || 'Ошибка создания платежа');
    } finally {
      setLoadingPayment(false);
    }
  };

  /**
   * Показать диалог выбора суммы и способа оплаты
   */
  const showTopUpDialog = () => {
    haptics.light();
    navigation.navigate('TopUpModal', {
      onConfirm: handleTopUp,
    });
  };

  /**
   * Форматирование суммы
   */
  const formatAmount = (amount: number, currency: string = 'RUB') => {
    return `${amount.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽`;
  };

  /**
   * Иконка транзакции
   */
  const getTransactionIcon = (type: string, status: string) => {
    if (status === 'pending') return { name: 'clock-outline', color: colors.chromeSilver };
    if (status === 'failed' || status === 'cancelled') return { name: 'close-circle', color: colors.error };

    switch (type) {
      case 'deposit':
        return { name: 'plus-circle', color: colors.success };
      case 'payment':
        return { name: 'minus-circle', color: colors.error };
      case 'refund':
        return { name: 'backup-restore', color: colors.platinumSilver };
      default:
        return { name: 'swap-horizontal', color: colors.chromeSilver };
    }
  };

  /**
   * Название типа транзакции
   */
  const getTransactionTitle = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Пополнение';
      case 'payment':
        return 'Оплата';
      case 'refund':
        return 'Возврат';
      default:
        return 'Операция';
    }
  };

  /**
   * Статус транзакции
   */
  const getTransactionStatus = (status: string) => {
    switch (status) {
      case 'completed':
        return { text: 'Завершено', color: colors.success };
      case 'pending':
        return { text: 'В обработке', color: colors.chromeSilver };
      case 'failed':
        return { text: 'Ошибка', color: colors.error };
      case 'cancelled':
        return { text: 'Отменено', color: colors.stoneGray };
      default:
        return { text: status, color: colors.chromeSilver };
    }
  };

  /**
   * Рендер карточки баланса
   */
  const renderBalanceCard = () => (
    <Animated.View entering={FadeInDown.delay(100).duration(600)}>
      <GlassCard variant="dark" style={styles.balanceCard}>
        <LinearGradient
          colors={['rgba(192, 192, 192, 0.15)', 'rgba(192, 192, 192, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceGradient}
        >
          <View style={styles.balanceHeader}>
            <MetalIcon name="wallet" variant="platinum" size="medium" glow />
            <Text style={styles.balanceLabel}>Баланс кошелька</Text>
          </View>

          <Text style={styles.balanceAmount}>
            {balance ? formatAmount(balance.balance, balance.currency) : '—'}
          </Text>

          <TouchableOpacity
            style={styles.topUpButton}
            onPress={showTopUpDialog}
            disabled={loadingPayment}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={metalGradients.platinum}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.topUpGradient}
            >
              {loadingPayment ? (
                <LoadingSpinner size="small" variant="spinner" color={colors.graphiteBlack} />
              ) : (
                <>
                  <Icon name="plus" size={20} color={colors.graphiteBlack} />
                  <Text style={styles.topUpText}>ПОПОЛНИТЬ</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </GlassCard>
    </Animated.View>
  );

  /**
   * Рендер списка транзакций
   */
  const renderTransactions = () => {
    if (transactions.length === 0) {
      return (
        <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.emptyContainer}>
          <MetalIcon name="format-list-bulleted" variant="chrome" size="large" />
          <Text style={styles.emptyText}>Нет транзакций</Text>
          <Text style={styles.emptySubtext}>
            Пополните кошелек, чтобы начать использовать платформу
          </Text>
        </Animated.View>
      );
    }

    return (
      <Animated.View entering={FadeInUp.delay(200).duration(600)}>
        <Text style={styles.sectionTitle}>История транзакций</Text>

        {transactions.map((transaction, index) => {
          const icon = getTransactionIcon(transaction.type, transaction.status);
          const status = getTransactionStatus(transaction.status);
          const isDeposit = transaction.type === 'deposit' || transaction.type === 'refund';

          return (
            <GlassCard key={transaction.id} variant="medium" style={styles.transactionCard}>
              <View style={styles.transactionRow}>
                <View style={styles.transactionIcon}>
                  <Icon name={icon.name} size={24} color={icon.color} />
                </View>

                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionTitle}>
                    {getTransactionTitle(transaction.type)}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {new Date(transaction.created_at).toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  {transaction.description && (
                    <Text style={styles.transactionDescription} numberOfLines={1}>
                      {transaction.description}
                    </Text>
                  )}
                </View>

                <View style={styles.transactionRight}>
                  <Text
                    style={[
                      styles.transactionAmount,
                      isDeposit ? styles.amountPositive : styles.amountNegative,
                    ]}
                  >
                    {isDeposit ? '+' : '−'}
                    {formatAmount(transaction.amount, transaction.currency)}
                  </Text>
                  <Text style={[styles.transactionStatus, { color: status.color }]}>
                    {status.text}
                  </Text>
                </View>
              </View>
            </GlassCard>
          );
        })}
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />
        <LoadingSpinner size="large" variant="spinner" color={colors.platinumSilver} />
        <Text style={styles.loadingText}>Загрузка кошелька...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />

      {/* Header */}
      <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={colors.softWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Кошелёк</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Icon name="refresh" size={24} color={colors.softWhite} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.platinumSilver}
            colors={[colors.platinumSilver]}
          />
        }
      >
        {renderBalanceCard()}
        {renderTransactions()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBlack,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.chromeSilver,
    marginTop: sizes.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sizes.xl,
    paddingVertical: sizes.lg,
    backgroundColor: colors.primaryBlack,
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.softWhite,
  },
  refreshButton: {
    width: 40,
    alignItems: 'flex-end',
  },
  scrollContent: {
    paddingHorizontal: sizes.xl,
    paddingBottom: sizes.xxl,
  },
  balanceCard: {
    marginBottom: sizes.xl,
    overflow: 'hidden',
  },
  balanceGradient: {
    padding: sizes.xl,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.sm,
    marginBottom: sizes.md,
  },
  balanceLabel: {
    ...typography.h3,
    color: colors.chromeSilver,
  },
  balanceAmount: {
    ...typography.display,
    fontSize: 48,
    color: colors.softWhite,
    marginBottom: sizes.xl,
    textShadowColor: 'rgba(192, 192, 192, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  topUpButton: {
    borderRadius: sizes.radiusLarge,
    overflow: 'hidden',
  },
  topUpGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sizes.md + 2,
    gap: sizes.sm,
  },
  topUpText: {
    ...typography.h3,
    color: colors.graphiteBlack,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.softWhite,
    marginBottom: sizes.lg,
  },
  transactionCard: {
    marginBottom: sizes.md,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: sizes.radiusMedium,
    backgroundColor: colors.slateGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: sizes.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    ...typography.bodyMedium,
    color: colors.softWhite,
    marginBottom: 2,
  },
  transactionDate: {
    ...typography.caption,
    color: colors.chromeSilver,
  },
  transactionDescription: {
    ...typography.micro,
    color: colors.stoneGray,
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    ...typography.h3,
    marginBottom: 2,
  },
  amountPositive: {
    color: colors.success,
  },
  amountNegative: {
    color: colors.softWhite,
  },
  transactionStatus: {
    ...typography.caption,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: sizes.xxl * 2,
  },
  emptyText: {
    ...typography.h2,
    color: colors.softWhite,
    marginTop: sizes.lg,
    marginBottom: sizes.sm,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.chromeSilver,
    textAlign: 'center',
    paddingHorizontal: sizes.xl,
  },
});
