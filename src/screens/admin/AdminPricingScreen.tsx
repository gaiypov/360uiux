/**
 * 360° РАБОТА - ULTRA EDITION
 * Admin Pricing Screen - Manage Pricing Plans
 * Revolut Ultra Style
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { GlassCard, MetalIcon, LoadingSpinner } from '@/components/ui';
import { colors, metalGradients, typography, sizes } from '@/constants';
import { useToastStore } from '@/stores/toastStore';
import { haptics } from '@/utils/haptics';
import { getTextSelectionProps } from '@/utils/platform';
import { adminApi } from '@/services/adminApi';

interface PricingPlan {
  id: string;
  name: string;
  description?: string;
  vacancy_post_price: number;
  vacancy_top_price: number;
  vacancy_boost_price: number;
  application_view_price: number;
  is_active: boolean;
  created_at: Date;
}

export function AdminPricingScreen() {
  const { showToast } = useToastStore();

  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    vacancy_post_price: '',
    vacancy_top_price: '',
    vacancy_boost_price: '',
    application_view_price: '',
    is_active: true,
  });

  /**
   * Load pricing plans
   */
  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.getPricingPlans();
      setPlans(response.plans || []);
    } catch (error) {
      console.error('Failed to load pricing plans:', error);
      showToast('error', 'Ошибка загрузки тарифов');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  /**
   * Open create modal
   */
  const handleCreate = () => {
    setFormData({
      name: '',
      description: '',
      vacancy_post_price: '',
      vacancy_top_price: '',
      vacancy_boost_price: '',
      application_view_price: '',
      is_active: true,
    });
    setSelectedPlan(null);
    setIsEditing(false);
    setModalVisible(true);
    haptics.light();
  };

  /**
   * Open edit modal
   */
  const handleEdit = (plan: PricingPlan) => {
    setFormData({
      name: plan.name,
      description: plan.description || '',
      vacancy_post_price: plan.vacancy_post_price.toString(),
      vacancy_top_price: plan.vacancy_top_price.toString(),
      vacancy_boost_price: plan.vacancy_boost_price.toString(),
      application_view_price: plan.application_view_price.toString(),
      is_active: plan.is_active,
    });
    setSelectedPlan(plan);
    setIsEditing(true);
    setModalVisible(true);
    haptics.light();
  };

  /**
   * Toggle plan active status
   */
  const handleToggleActive = async (plan: PricingPlan) => {
    try {
      haptics.light();
      await adminApi.updatePricingPlan(plan.id, {
        is_active: !plan.is_active,
      });
      setPlans(plans.map(p =>
        p.id === plan.id ? { ...p, is_active: !p.is_active } : p
      ));
      showToast('success', plan.is_active ? 'Тариф деактивирован' : 'Тариф активирован');
    } catch (error) {
      console.error('Failed to toggle plan:', error);
      showToast('error', 'Ошибка изменения статуса');
      haptics.error();
    }
  };

  /**
   * Save pricing plan
   */
  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      showToast('error', 'Введите название тарифа');
      haptics.error();
      return;
    }

    if (!formData.vacancy_post_price || parseFloat(formData.vacancy_post_price) < 0) {
      showToast('error', 'Введите корректную цену публикации');
      haptics.error();
      return;
    }

    try {
      setSaving(true);
      haptics.light();

      const data = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        vacancy_post_price: parseFloat(formData.vacancy_post_price),
        vacancy_top_price: parseFloat(formData.vacancy_top_price) || 0,
        vacancy_boost_price: parseFloat(formData.vacancy_boost_price) || 0,
        application_view_price: parseFloat(formData.application_view_price) || 0,
        is_active: formData.is_active,
      };

      if (isEditing && selectedPlan) {
        await adminApi.updatePricingPlan(selectedPlan.id, data);
        setPlans(plans.map(p => p.id === selectedPlan.id ? { ...p, ...data } : p));
        showToast('success', 'Тариф обновлён');
      } else {
        const newPlan = await adminApi.createPricingPlan(data);
        setPlans([newPlan, ...plans]);
        showToast('success', 'Тариф создан');
      }

      haptics.success();
      setModalVisible(false);
      loadPlans();
    } catch (error) {
      console.error('Failed to save plan:', error);
      showToast('error', 'Ошибка сохранения тарифа');
      haptics.error();
    } finally {
      setSaving(false);
    }
  };

  /**
   * Delete pricing plan
   */
  const handleDelete = async (plan: PricingPlan) => {
    Alert.alert(
      'Удалить тариф?',
      `Вы уверены, что хотите удалить тариф "${plan.name}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              haptics.light();
              await adminApi.deletePricingPlan(plan.id);
              setPlans(plans.filter(p => p.id !== plan.id));
              showToast('success', 'Тариф удалён');
            } catch (error) {
              console.error('Failed to delete plan:', error);
              showToast('error', 'Ошибка удаления тарифа');
              haptics.error();
            }
          },
        },
      ]
    );
  };

  /**
   * Render pricing plan card
   */
  const renderPlanCard = ({ item }: { item: PricingPlan }) => (
    <Animated.View entering={FadeInDown}>
      <GlassCard style={styles.planCard}>
        <View style={styles.planHeader}>
          <View style={styles.planTitleRow}>
            <MetalIcon name="currency-rub" size={32} />
            <View style={styles.planTitleContainer}>
              <Text style={styles.planName}>{item.name}</Text>
              {item.description && (
                <Text style={styles.planDescription}>{item.description}</Text>
              )}
            </View>
          </View>
          <View style={styles.planActions}>
            <TouchableOpacity
              onPress={() => handleToggleActive(item)}
              style={[
                styles.statusBadge,
                item.is_active ? styles.statusActive : styles.statusInactive,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  item.is_active ? styles.statusActiveText : styles.statusInactiveText,
                ]}
              >
                {item.is_active ? 'Активен' : 'Неактивен'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.pricesContainer}>
          <View style={styles.priceRow}>
            <Icon name="file-document-outline" size={18} color={colors.chromeSilver} />
            <Text style={styles.priceLabel}>Публикация вакансии:</Text>
            <Text style={styles.priceValue}>{item.vacancy_post_price} ₽</Text>
          </View>

          <View style={styles.priceRow}>
            <Icon name="star-outline" size={18} color={colors.accentBlue} />
            <Text style={styles.priceLabel}>ТОП размещение:</Text>
            <Text style={styles.priceValue}>{item.vacancy_top_price} ₽</Text>
          </View>

          <View style={styles.priceRow}>
            <Icon name="rocket-launch-outline" size={18} color={colors.accentPurple} />
            <Text style={styles.priceLabel}>Буст вакансии:</Text>
            <Text style={styles.priceValue}>{item.vacancy_boost_price} ₽</Text>
          </View>

          <View style={styles.priceRow}>
            <Icon name="eye-outline" size={18} color={colors.accentGreen} />
            <Text style={styles.priceLabel}>Просмотр отклика:</Text>
            <Text style={styles.priceValue}>{item.application_view_price} ₽</Text>
          </View>
        </View>

        <View style={styles.planFooter}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEdit(item)}
          >
            <Icon name="pencil" size={18} color={colors.accentBlue} />
            <Text style={styles.editButtonText}>Редактировать</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item)}
          >
            <Icon name="delete-outline" size={18} color={colors.accentRed} />
            <Text style={styles.deleteButtonText}>Удалить</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>
    </Animated.View>
  );

  /**
   * Render form input
   */
  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    keyboardType: 'default' | 'numeric' = 'default',
    icon?: string
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        {icon && (
          <Icon name={icon} size={20} color={colors.chromeSilver} style={styles.inputIcon} />
        )}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.darkChrome}
          keyboardType={keyboardType}
          editable={!saving}
          {...getTextSelectionProps()}
        />
      </View>
    </View>
  );

  /**
   * Render modal
   */
  const renderModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={[colors.slateGray, colors.carbonGray]}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditing ? 'Редактировать тариф' : 'Создать тариф'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} disabled={saving}>
                <Icon name="close" size={24} color={colors.chromeSilver} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {renderInput(
                'Название тарифа *',
                formData.name,
                (text) => setFormData({ ...formData, name: text }),
                'Например: Базовый',
                'default',
                'tag-outline'
              )}

              {renderInput(
                'Описание',
                formData.description,
                (text) => setFormData({ ...formData, description: text }),
                'Описание тарифа',
                'default',
                'text'
              )}

              {renderInput(
                'Публикация вакансии (₽) *',
                formData.vacancy_post_price,
                (text) => setFormData({ ...formData, vacancy_post_price: text.replace(/[^0-9.]/g, '') }),
                '0',
                'numeric',
                'file-document-outline'
              )}

              {renderInput(
                'ТОП размещение (₽)',
                formData.vacancy_top_price,
                (text) => setFormData({ ...formData, vacancy_top_price: text.replace(/[^0-9.]/g, '') }),
                '0',
                'numeric',
                'star-outline'
              )}

              {renderInput(
                'Буст вакансии (₽)',
                formData.vacancy_boost_price,
                (text) => setFormData({ ...formData, vacancy_boost_price: text.replace(/[^0-9.]/g, '') }),
                '0',
                'numeric',
                'rocket-launch-outline'
              )}

              {renderInput(
                'Просмотр отклика (₽)',
                formData.application_view_price,
                (text) => setFormData({ ...formData, application_view_price: text.replace(/[^0-9.]/g, '') }),
                '0',
                'numeric',
                'eye-outline'
              )}

              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setFormData({ ...formData, is_active: !formData.is_active })}
                disabled={saving}
              >
                <View style={[styles.checkbox, formData.is_active && styles.checkboxActive]}>
                  {formData.is_active && (
                    <Icon name="check" size={16} color={colors.graphiteBlack} />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>Активировать тариф сразу</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleSave} disabled={saving} activeOpacity={0.8}>
                <LinearGradient
                  colors={metalGradients.platinum}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                >
                  {saving ? (
                    <LoadingSpinner color={colors.graphiteBlack} size={20} />
                  ) : (
                    <Text style={styles.saveButtonText}>
                      {isEditing ? 'Сохранить' : 'Создать'}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
        <Text style={styles.loadingText}>Загрузка тарифов...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Управление тарифами</Text>
            <Text style={styles.headerSubtitle}>
              {plans.length} {plans.length === 1 ? 'тариф' : 'тарифа'}
            </Text>
          </View>
          <TouchableOpacity onPress={handleCreate}>
            <LinearGradient
              colors={metalGradients.platinum}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.createButton}
            >
              <Icon name="plus" size={20} color={colors.graphiteBlack} />
              <Text style={styles.createButtonText}>Создать</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {plans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MetalIcon name="currency-rub" size={80} />
          <Text style={styles.emptyTitle}>Нет тарифов</Text>
          <Text style={styles.emptySubtitle}>
            Создайте первый тариф для работодателей
          </Text>
        </View>
      ) : (
        <FlatList
          data={plans}
          renderItem={renderPlanCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {renderModal()}
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
    padding: sizes.lg,
    paddingTop: sizes.xl,
    gap: sizes.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.xs,
    paddingHorizontal: sizes.md,
    paddingVertical: sizes.sm,
    borderRadius: sizes.radiusMedium,
  },
  createButtonText: {
    ...typography.buttonSmall,
    color: colors.graphiteBlack,
  },
  listContent: {
    padding: sizes.lg,
    gap: sizes.md,
  },
  planCard: {
    padding: sizes.lg,
    gap: sizes.md,
  },
  planHeader: {
    gap: sizes.sm,
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.md,
  },
  planTitleContainer: {
    flex: 1,
  },
  planName: {
    ...typography.h3,
    color: colors.softWhite,
  },
  planDescription: {
    ...typography.caption,
    color: colors.chromeSilver,
    marginTop: sizes.xs,
  },
  planActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: sizes.sm,
    paddingVertical: 4,
    borderRadius: sizes.radiusSmall,
  },
  statusActive: {
    backgroundColor: `${colors.accentGreen}20`,
  },
  statusInactive: {
    backgroundColor: `${colors.accentGray}20`,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  statusActiveText: {
    color: colors.accentGreen,
  },
  statusInactiveText: {
    color: colors.accentGray,
  },
  pricesContainer: {
    gap: sizes.sm,
    paddingTop: sizes.sm,
    borderTopWidth: 1,
    borderTopColor: colors.steelGray,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.sm,
  },
  priceLabel: {
    ...typography.body,
    color: colors.liquidSilver,
    flex: 1,
  },
  priceValue: {
    ...typography.bodyBold,
    color: colors.softWhite,
  },
  planFooter: {
    flexDirection: 'row',
    gap: sizes.sm,
    paddingTop: sizes.sm,
    borderTopWidth: 1,
    borderTopColor: colors.steelGray,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sizes.xs,
    paddingVertical: sizes.sm,
    backgroundColor: `${colors.accentBlue}15`,
    borderRadius: sizes.radiusSmall,
  },
  editButtonText: {
    ...typography.buttonSmall,
    color: colors.accentBlue,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sizes.xs,
    paddingVertical: sizes.sm,
    backgroundColor: `${colors.accentRed}15`,
    borderRadius: sizes.radiusSmall,
  },
  deleteButtonText: {
    ...typography.buttonSmall,
    color: colors.accentRed,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: sizes.xl,
    gap: sizes.md,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.softWhite,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.chromeSilver,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    maxHeight: '90%',
  },
  modalContent: {
    borderTopLeftRadius: sizes.radiusLarge,
    borderTopRightRadius: sizes.radiusLarge,
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
    color: colors.softWhite,
  },
  modalScroll: {
    maxHeight: 400,
  },
  inputContainer: {
    marginBottom: sizes.md,
  },
  inputLabel: {
    ...typography.caption,
    color: colors.liquidSilver,
    marginBottom: sizes.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.slateGray,
    borderRadius: sizes.radiusMedium,
    borderWidth: 1,
    borderColor: colors.steelGray,
    paddingHorizontal: sizes.md,
    height: 48,
  },
  inputIcon: {
    marginRight: sizes.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.platinumSilver,
    height: '100%',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.sm,
    marginTop: sizes.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: sizes.radiusSmall,
    borderWidth: 2,
    borderColor: colors.steelGray,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.carbonGray,
  },
  checkboxActive: {
    backgroundColor: colors.platinumSilver,
    borderColor: colors.platinumSilver,
  },
  checkboxLabel: {
    ...typography.body,
    color: colors.chromeSilver,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: sizes.sm,
    marginTop: sizes.lg,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sizes.md,
    backgroundColor: colors.slateGray,
    borderRadius: sizes.radiusMedium,
    borderWidth: 1,
    borderColor: colors.steelGray,
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.chromeSilver,
  },
  saveButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sizes.md,
    borderRadius: sizes.radiusMedium,
    minWidth: 120,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.graphiteBlack,
  },
});
