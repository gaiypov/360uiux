/**
 * 360° РАБОТА - ULTRA EDITION
 * Employer Pricing Screen - Purchase Services
 * Revolut Ultra Style
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { GlassCard, MetalIcon, LoadingSpinner } from '@/components/ui';
import { colors, metalGradients, typography, sizes } from '@/constants';
import { useToastStore } from '@/stores/toastStore';
import { useAuthStore } from '@/stores/authStore';
import { haptics } from '@/utils/haptics';
import { api } from '@/services/api';

interface PricingPlan {
  id: string;
  name: string;
  description?: string;
  vacancy_post_price: number;
  vacancy_top_price: number;
  vacancy_boost_price: number;
  application_view_price: number;
  is_active: boolean;
}

interface WalletBalance {
  balance: number;
  currency: string;
}

export function EmployerPricingScreen({ navigation }: any) {
  const { showToast } = useToastStore();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [wallet, setWallet] = useState<WalletBalance | null>(null);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  /**
   * Load pricing and wallet balance
   */
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Load pricing plans
      const pricingResponse = await api.getPricing();
      setPlans(pricingResponse.plans.filter((p: PricingPlan) => p.is_active));

      // Load wallet balance
      const walletResponse = await api.getWalletBalance();
      setWallet(walletResponse);
    } catch (error) {
      console.error('Failed to load pricing:', error);
      showToast('error', 'Ошибка загрузки тарифов');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Purchase service
   */
  const handlePurchase = async (serviceName: string, price: number) => {
    if (!wallet || wallet.balance < price) {
      Alert.alert(
        'Недостаточно средств',
        'Пожалуйста, пополните баланс кошелька',
        [
          { text: 'Отмена', style: 'cancel' },
          {
            text: 'Пополнить',
            onPress: () => navigation.navigate('EmployerWallet'),
          },
        ]
      );
      return;
    }

    Alert.alert(
      'Подтвердите покупку',
      `${serviceName}\nСтоимость: ${price} ₽\n\nБаланс после покупки: ${wallet.balance - price} ₽`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Купить',
          onPress: async () => {
            try {
              setPurchasing(serviceName);
              haptics.light();

              // Create purchase transaction
              // This would call an API endpoint to deduct from wallet
              // and activate the service
              await api.purchaseService({
                service: serviceName,
                amount: price,
              });

              // Update wallet balance
              setWallet({ ...wallet, balance: wallet.balance - price });

              haptics.success();
              showToast('success', `${serviceName} успешно приобретена!`);
            } catch (error: any) {
              console.error('Purchase failed:', error);
              haptics.error();
              showToast('error', error.response?.data?.message || 'Ошибка покупки');
            } finally {
              setPurchasing(null);
            }
          },
        },
      ]
    );
  };

  /**
   * Render service card
   */
  const renderServiceCard = (
    icon: string,
    title: string,
    description: string,
    price: number,
    accentColor: string,
    features: string[]
  ) => (
    <Animated.View entering={FadeInDown}>
      <GlassCard style={styles.serviceCard}>
        <View style={styles.serviceHeader}>
          <View style={[styles.serviceIconContainer, { backgroundColor: `${accentColor}20` }]}>
            <Icon name={icon} size={32} color={accentColor} />
          </View>
          <View style={styles.serviceTitleContainer}>
            <Text style={styles.serviceTitle}>{title}</Text>
            <Text style={styles.serviceDescription}>{description}</Text>
          </View>
        </View>

        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Icon name="check-circle" size={16} color={colors.accentGreen} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <View style={styles.serviceFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Стоимость:</Text>
            <Text style={styles.priceValue}>{price} ₽</Text>
          </View>
          <TouchableOpacity
            onPress={() => handlePurchase(title, price)}
            disabled={purchasing === title}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[accentColor, accentColor]}
              style={styles.purchaseButton}
            >
              {purchasing === title ? (
                <LoadingSpinner color={colors.graphiteBlack} size={20} />
              ) : (
                <>
                  <Text style={styles.purchaseButtonText}>Купить</Text>
                  <Icon name="arrow-right" size={18} color={colors.graphiteBlack} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </GlassCard>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
        <Text style={styles.loadingText}>Загрузка тарифов...</Text>
      </View>
    );
  }

  // Get current pricing (use first active plan, or show default)
  const currentPlan = plans[0] || {
    vacancy_post_price: 500,
    vacancy_top_price: 1500,
    vacancy_boost_price: 1000,
    application_view_price: 50,
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color={colors.softWhite} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Тарифы и услуги</Text>
          <Text style={styles.headerSubtitle}>
            Улучшите видимость ваших вакансий
          </Text>
        </View>
      </View>

      {/* Wallet Balance */}
      <Animated.View entering={FadeIn.delay(100)} style={styles.walletContainer}>
        <GlassCard style={styles.walletCard}>
          <View style={styles.walletHeader}>
            <MetalIcon name="wallet" size={40} />
            <View style={styles.walletInfo}>
              <Text style={styles.walletLabel}>Баланс кошелька</Text>
              <Text style={styles.walletBalance}>
                {wallet?.balance.toFixed(2) || '0.00'} ₽
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('EmployerWallet')}
              style={styles.topUpButton}
            >
              <Icon name="plus" size={20} color={colors.accentBlue} />
              <Text style={styles.topUpButtonText}>Пополнить</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </Animated.View>

      {/* Services List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Доступные услуги</Text>

        {renderServiceCard(
          'file-document-outline',
          'Публикация вакансии',
          'Разместите вакансию на платформе',
          currentPlan.vacancy_post_price,
          colors.accentBlue,
          [
            'Публикация на 30 дней',
            'Неограниченное количество откликов',
            'Редактирование в любое время',
            'Подробная статистика просмотров',
          ]
        )}

        {renderServiceCard(
          'star',
          'ТОП размещение',
          'Вакансия в топе на 7 дней',
          currentPlan.vacancy_top_price,
          colors.accentPurple,
          [
            'Закрепление в топе на 7 дней',
            'Увеличение просмотров до 5x',
            'Специальный значок ТОП',
            'Приоритет в поисковой выдаче',
          ]
        )}

        {renderServiceCard(
          'rocket-launch',
          'Буст вакансии',
          'Мощное усиление видимости',
          currentPlan.vacancy_boost_price,
          colors.accentGreen,
          [
            'Усиление на 3 дня',
            'Показ в рекомендациях соискателям',
            'Push-уведомления подходящим кандидатам',
            'Увеличение откликов до 3x',
          ]
        )}

        {renderServiceCard(
          'eye',
          'Просмотр отклика',
          'Открыть полную информацию',
          currentPlan.application_view_price,
          colors.accentBlue,
          [
            'Полная информация о кандидате',
            'Контактные данные',
            'Видео-резюме (если есть)',
            'История работы и навыки',
          ]
        )}

        <View style={styles.infoCard}>
          <GlassCard style={styles.infoContent}>
            <Icon name="information" size={24} color={colors.accentBlue} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Как это работает?</Text>
              <Text style={styles.infoText}>
                Пополните баланс кошелька и оплачивайте услуги по мере необходимости.
                Все платежи защищены, средства зачисляются моментально.
              </Text>
            </View>
          </GlassCard>
        </View>

        <View style={styles.bottomSpacer} />
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
    gap: sizes.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.chromeSilver,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: sizes.lg,
    paddingTop: sizes.xl + 20,
    gap: sizes.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.softWhite,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.chromeSilver,
    marginTop: sizes.xs,
  },
  walletContainer: {
    paddingHorizontal: sizes.lg,
    marginBottom: sizes.lg,
  },
  walletCard: {
    padding: sizes.lg,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.md,
  },
  walletInfo: {
    flex: 1,
  },
  walletLabel: {
    ...typography.caption,
    color: colors.chromeSilver,
  },
  walletBalance: {
    ...typography.h2,
    color: colors.softWhite,
    marginTop: sizes.xs,
  },
  topUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.xs,
    paddingHorizontal: sizes.md,
    paddingVertical: sizes.sm,
    backgroundColor: `${colors.accentBlue}20`,
    borderRadius: sizes.radiusMedium,
  },
  topUpButtonText: {
    ...typography.buttonSmall,
    color: colors.accentBlue,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: sizes.lg,
    gap: sizes.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.softWhite,
    marginBottom: sizes.sm,
  },
  serviceCard: {
    padding: sizes.lg,
    gap: sizes.md,
  },
  serviceHeader: {
    flexDirection: 'row',
    gap: sizes.md,
  },
  serviceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: sizes.radiusMedium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceTitleContainer: {
    flex: 1,
  },
  serviceTitle: {
    ...typography.h3,
    color: colors.softWhite,
  },
  serviceDescription: {
    ...typography.caption,
    color: colors.chromeSilver,
    marginTop: sizes.xs,
  },
  featuresContainer: {
    gap: sizes.sm,
    paddingTop: sizes.sm,
    borderTopWidth: 1,
    borderTopColor: colors.steelGray,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.sm,
  },
  featureText: {
    ...typography.body,
    color: colors.liquidSilver,
    flex: 1,
  },
  serviceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: sizes.md,
    borderTopWidth: 1,
    borderTopColor: colors.steelGray,
  },
  priceContainer: {
    gap: sizes.xs,
  },
  priceLabel: {
    ...typography.caption,
    color: colors.chromeSilver,
  },
  priceValue: {
    ...typography.h2,
    color: colors.softWhite,
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.xs,
    paddingHorizontal: sizes.lg,
    paddingVertical: sizes.sm,
    borderRadius: sizes.radiusMedium,
    minWidth: 120,
    justifyContent: 'center',
  },
  purchaseButtonText: {
    ...typography.button,
    color: colors.graphiteBlack,
  },
  infoCard: {
    marginTop: sizes.md,
  },
  infoContent: {
    flexDirection: 'row',
    padding: sizes.lg,
    gap: sizes.md,
  },
  infoTextContainer: {
    flex: 1,
    gap: sizes.xs,
  },
  infoTitle: {
    ...typography.bodyBold,
    color: colors.softWhite,
  },
  infoText: {
    ...typography.caption,
    color: colors.chromeSilver,
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 100,
  },
});
