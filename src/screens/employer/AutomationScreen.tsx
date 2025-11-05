/**
 * 360° РАБОТА - Revolut Ultra Edition
 * Automation Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { GlassCard, GlassButton } from '@/components/ui';
import { colors, typography, sizes } from '@/constants';
import { useToastStore } from '@/stores';

export function AutomationScreen() {
  const { showToast } = useToastStore();
  const [automations, setAutomations] = useState({
    autoReply: true,
    autoReject: false,
    smartFiltering: true,
    scheduledPublishing: false,
  });

  const toggleAutomation = (key: keyof typeof automations) => {
    setAutomations({ ...automations, [key]: !automations[key] });
    showToast('success', 'Настройки обновлены');
  };

  const automationRules = [
    {
      id: '1',
      name: 'Автоответ на отклик',
      description: 'Автоматическая благодарность за отклик',
      enabled: automations.autoReply,
      key: 'autoReply' as const,
      icon: 'reply',
      color: colors.cyberBlue,
    },
    {
      id: '2',
      name: 'Автоотклонение',
      description: 'Отклонить кандидатов без опыта',
      enabled: automations.autoReject,
      key: 'autoReject' as const,
      icon: 'close-circle',
      color: colors.error,
    },
    {
      id: '3',
      name: 'Умная фильтрация',
      description: 'AI анализ резюме и автоматическая сортировка',
      enabled: automations.smartFiltering,
      key: 'smartFiltering' as const,
      icon: 'brain',
      color: colors.ultraViolet,
    },
    {
      id: '4',
      name: 'Отложенная публикация',
      description: 'Автоматическая публикация вакансий по расписанию',
      enabled: automations.scheduledPublishing,
      key: 'scheduledPublishing' as const,
      icon: 'clock-outline',
      color: colors.warning,
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Автоматизация</Text>
          <Text style={styles.subtitle}>
            Настройте автоматические правила для экономии времени
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Активных правил</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statValue}>156</Text>
            <Text style={styles.statLabel}>Обработано сегодня</Text>
          </GlassCard>
        </View>

        {/* Automation Rules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Правила автоматизации</Text>

          {automationRules.map((rule) => (
            <GlassCard key={rule.id} style={styles.ruleCard}>
              <View style={styles.ruleHeader}>
                <View
                  style={[styles.ruleIcon, { backgroundColor: `${rule.color}20` }]}
                >
                  <Icon name={rule.icon} size={24} color={rule.color} />
                </View>
                <Switch
                  value={rule.enabled}
                  onValueChange={() => toggleAutomation(rule.key)}
                  trackColor={{
                    false: colors.glassBorder,
                    true: colors.ultraViolet,
                  }}
                  thumbColor={rule.enabled ? colors.softWhite : colors.liquidSilver}
                />
              </View>

              <Text style={styles.ruleName}>{rule.name}</Text>
              <Text style={styles.ruleDescription}>{rule.description}</Text>

              {rule.enabled && (
                <TouchableOpacity style={styles.configureButton}>
                  <Text style={styles.configureText}>Настроить</Text>
                  <Icon name="chevron-right" size={20} color={colors.cyberBlue} />
                </TouchableOpacity>
              )}
            </GlassCard>
          ))}
        </View>

        {/* AI Assistant */}
        <GlassCard style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <View style={styles.aiIconContainer}>
              <Icon name="robot" size={32} color={colors.ultraViolet} />
            </View>
            <View style={styles.aiText}>
              <Text style={styles.aiTitle}>AI Помощник</Text>
              <Text style={styles.aiSubtitle}>
                Интеллектуальная обработка откликов
              </Text>
            </View>
          </View>

          <View style={styles.aiFeatures}>
            <View style={styles.aiFeature}>
              <Icon name="check-circle" size={18} color={colors.success} />
              <Text style={styles.aiFeatureText}>
                Автоматический анализ 100+ резюме в день
              </Text>
            </View>
            <View style={styles.aiFeature}>
              <Icon name="check-circle" size={18} color={colors.success} />
              <Text style={styles.aiFeatureText}>
                Подбор лучших кандидатов по 50+ критериям
              </Text>
            </View>
            <View style={styles.aiFeature}>
              <Icon name="check-circle" size={18} color={colors.success} />
              <Text style={styles.aiFeatureText}>
                Персонализированные рекомендации
              </Text>
            </View>
          </View>

          <GlassButton
            title="АКТИВИРОВАТЬ AI"
            variant="primary"
            onPress={() => showToast('info', 'AI помощник активирован')}
            style={styles.aiButton}
          />
        </GlassCard>

        {/* Triggers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Триггеры</Text>

          <GlassCard style={styles.triggerCard}>
            <View style={styles.triggerHeader}>
              <Icon name="lightning-bolt" size={20} color={colors.warning} />
              <Text style={styles.triggerTitle}>Новый отклик</Text>
            </View>
            <Text style={styles.triggerAction}>→ Отправить автоответ</Text>
            <Text style={styles.triggerAction}>→ Добавить в CRM</Text>
          </GlassCard>

          <GlassCard style={styles.triggerCard}>
            <View style={styles.triggerHeader}>
              <Icon name="clock-outline" size={20} color={colors.cyberBlue} />
              <Text style={styles.triggerTitle}>24 часа без ответа</Text>
            </View>
            <Text style={styles.triggerAction}>→ Отправить напоминание</Text>
          </GlassCard>

          <TouchableOpacity style={styles.addTrigger}>
            <Icon name="plus-circle" size={24} color={colors.ultraViolet} />
            <Text style={styles.addTriggerText}>Добавить триггер</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBlack,
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
  statsRow: {
    flexDirection: 'row',
    gap: sizes.md,
    marginBottom: sizes.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: sizes.lg,
  },
  statValue: {
    ...typography.h1,
    fontSize: 32,
    color: colors.ultraViolet,
    marginBottom: sizes.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.liquidSilver,
    textAlign: 'center',
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
  ruleCard: {
    marginBottom: sizes.md,
  },
  ruleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: sizes.md,
  },
  ruleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleName: {
    ...typography.h3,
    fontSize: 16,
    color: colors.softWhite,
    marginBottom: sizes.xs,
  },
  ruleDescription: {
    ...typography.body,
    fontSize: 14,
    color: colors.liquidSilver,
  },
  configureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: sizes.md,
    paddingTop: sizes.md,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
  configureText: {
    ...typography.bodyMedium,
    color: colors.cyberBlue,
  },
  aiCard: {
    marginBottom: sizes.lg,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.md,
    marginBottom: sizes.lg,
  },
  aiIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(142, 127, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiText: {
    flex: 1,
  },
  aiTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.softWhite,
    marginBottom: sizes.xs,
  },
  aiSubtitle: {
    ...typography.body,
    fontSize: 14,
    color: colors.liquidSilver,
  },
  aiFeatures: {
    gap: sizes.sm,
    marginBottom: sizes.lg,
  },
  aiFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.sm,
  },
  aiFeatureText: {
    ...typography.body,
    fontSize: 14,
    color: colors.liquidSilver,
    flex: 1,
  },
  aiButton: {
    marginTop: sizes.sm,
  },
  triggerCard: {
    marginBottom: sizes.sm,
  },
  triggerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.sm,
    marginBottom: sizes.sm,
  },
  triggerTitle: {
    ...typography.bodyMedium,
    color: colors.softWhite,
  },
  triggerAction: {
    ...typography.caption,
    color: colors.liquidSilver,
    marginLeft: sizes.lg,
    marginTop: 2,
  },
  addTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sizes.sm,
    padding: sizes.md,
    borderRadius: sizes.radiusMedium,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.glassBorder,
    marginTop: sizes.sm,
  },
  addTriggerText: {
    ...typography.bodyMedium,
    color: colors.ultraViolet,
  },
});
