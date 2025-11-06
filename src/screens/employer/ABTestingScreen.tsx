/**
 * 360° РАБОТА - ULTRA EDITION
 * A/B Testing Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { GlassCard, GlassButton } from '@/components/ui';
import { colors, metalGradients, typography, sizes } from "@/constants";

export function ABTestingScreen({ navigation }: any) {
  const [activeTests, setActiveTests] = useState([
    {
      id: '1',
      name: 'Зарплата: Точная vs Вилка',
      status: 'running',
      variantA: {
        name: 'Точная сумма',
        views: 234,
        applications: 18,
        conversion: 7.7,
      },
      variantB: {
        name: 'Вилка',
        views: 241,
        applications: 24,
        conversion: 10.0,
      },
      winner: 'B',
      confidence: 85,
    },
    {
      id: '2',
      name: 'Заголовок: Формальный vs Креативный',
      status: 'running',
      variantA: {
        name: 'Формальный',
        views: 156,
        applications: 12,
        conversion: 7.7,
      },
      variantB: {
        name: 'Креативный',
        views: 168,
        applications: 11,
        conversion: 6.5,
      },
      winner: 'A',
      confidence: 62,
    },
  ]);

  const completedTests = [
    {
      id: '3',
      name: 'Видео vs Фото',
      winner: 'A',
      improvement: '+45%',
      conclusion: 'Видео увеличивает конверсию',
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
          <Text style={styles.title}>A/B Тестирование</Text>
          <Text style={styles.subtitle}>
            Оптимизируйте вакансии на основе данных
          </Text>
        </View>

        {/* Create Test Button */}
        <TouchableOpacity
          style={styles.createTestButton}
          onPress={() => navigation.navigate('CreateABTest')}
        >
          <LinearGradient
            colors={metalGradients.platinum}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.createTestGradient}
          >
            <Icon name="plus-circle" size={24} color={colors.softWhite} />
            <Text style={styles.createTestText}>Создать A/B тест</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Active Tests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Активные тесты ({activeTests.length})</Text>

          {activeTests.map((test) => (
            <GlassCard key={test.id} style={styles.testCard}>
              <View style={styles.testHeader}>
                <Text style={styles.testName}>{test.name}</Text>
                <View style={styles.statusBadge}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>В процессе</Text>
                </View>
              </View>

              {/* Variants Comparison */}
              <View style={styles.variantsContainer}>
                {/* Variant A */}
                <View style={[styles.variant, test.winner === 'A' && styles.variantWinning]}>
                  <View style={styles.variantHeader}>
                    <Text style={styles.variantLabel}>A</Text>
                    <Text style={styles.variantName}>{test.variantA.name}</Text>
                  </View>

                  <View style={styles.variantStats}>
                    <View style={styles.variantStat}>
                      <Text style={styles.variantStatLabel}>Просмотры</Text>
                      <Text style={styles.variantStatValue}>{test.variantA.views}</Text>
                    </View>
                    <View style={styles.variantStat}>
                      <Text style={styles.variantStatLabel}>Отклики</Text>
                      <Text style={styles.variantStatValue}>{test.variantA.applications}</Text>
                    </View>
                    <View style={styles.variantStat}>
                      <Text style={styles.variantStatLabel}>Конверсия</Text>
                      <Text style={[styles.variantStatValue, styles.conversionValue]}>
                        {test.variantA.conversion}%
                      </Text>
                    </View>
                  </View>
                </View>

                {/* VS */}
                <View style={styles.vsContainer}>
                  <Text style={styles.vsText}>VS</Text>
                </View>

                {/* Variant B */}
                <View style={[styles.variant, test.winner === 'B' && styles.variantWinning]}>
                  <View style={styles.variantHeader}>
                    <Text style={styles.variantLabel}>B</Text>
                    <Text style={styles.variantName}>{test.variantB.name}</Text>
                  </View>

                  <View style={styles.variantStats}>
                    <View style={styles.variantStat}>
                      <Text style={styles.variantStatLabel}>Просмотры</Text>
                      <Text style={styles.variantStatValue}>{test.variantB.views}</Text>
                    </View>
                    <View style={styles.variantStat}>
                      <Text style={styles.variantStatLabel}>Отклики</Text>
                      <Text style={styles.variantStatValue}>{test.variantB.applications}</Text>
                    </View>
                    <View style={styles.variantStat}>
                      <Text style={styles.variantStatLabel}>Конверсия</Text>
                      <Text style={[styles.variantStatValue, styles.conversionValue]}>
                        {test.variantB.conversion}%
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Confidence */}
              <View style={styles.confidenceContainer}>
                <View style={styles.confidenceHeader}>
                  <Text style={styles.confidenceLabel}>Уверенность</Text>
                  <Text style={styles.confidenceValue}>{test.confidence}%</Text>
                </View>
                <View style={styles.confidenceBar}>
                  <View style={[styles.confidenceFill, { width: `${test.confidence}%` }]} />
                </View>
                {test.confidence >= 80 && (
                  <View style={styles.readyBadge}>
                    <Icon name="check-circle" size={16} color={colors.success} />
                    <Text style={styles.readyText}>Готово к внедрению</Text>
                  </View>
                )}
              </View>

              {/* Actions */}
              <View style={styles.testActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Подробнее</Text>
                </TouchableOpacity>
                {test.confidence >= 80 && (
                  <TouchableOpacity style={styles.implementButton}>
                    <LinearGradient
                      colors={metalGradients.platinum}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.implementGradient}
                    >
                      <Text style={styles.implementText}>Внедрить победителя</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            </GlassCard>
          ))}
        </View>

        {/* Completed Tests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Завершенные тесты</Text>

          {completedTests.map((test) => (
            <GlassCard key={test.id} style={styles.completedCard}>
              <View style={styles.completedHeader}>
                <View>
                  <Text style={styles.completedName}>{test.name}</Text>
                  <Text style={styles.completedConclusion}>{test.conclusion}</Text>
                </View>
                <View style={styles.improvementBadge}>
                  <Text style={styles.improvementText}>{test.improvement}</Text>
                </View>
              </View>
            </GlassCard>
          ))}
        </View>

        {/* Tips */}
        <GlassCard style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Icon name="lightbulb-on" size={24} color={colors.warning} />
            <Text style={styles.tipsTitle}>Советы по A/B тестам</Text>
          </View>
          <View style={styles.tips}>
            <Text style={styles.tip}>• Тестируйте только один элемент за раз</Text>
            <Text style={styles.tip}>• Дождитесь статистической значимости (80%+)</Text>
            <Text style={styles.tip}>• Собирайте минимум 100 просмотров на вариант</Text>
            <Text style={styles.tip}>• Тестируйте в течение минимум 7 дней</Text>
          </View>
        </GlassCard>
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
  createTestButton: {
    borderRadius: sizes.radiusMedium,
    overflow: 'hidden',
    marginBottom: sizes.lg,
  },
  createTestGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sizes.sm,
    paddingVertical: sizes.md,
  },
  createTestText: {
    ...typography.bodyMedium,
    color: colors.softWhite,
    fontWeight: '600',
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
  testCard: {
    marginBottom: sizes.md,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: sizes.lg,
  },
  testName: {
    ...typography.h3,
    fontSize: 16,
    color: colors.softWhite,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.xs,
    backgroundColor: 'rgba(232, 232, 237, 0.15)',
    paddingHorizontal: sizes.sm,
    paddingVertical: 4,
    borderRadius: sizes.radiusSmall,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.platinumSilver,
  },
  statusText: {
    ...typography.caption,
    color: colors.platinumSilver,
    fontSize: 11,
  },
  variantsContainer: {
    flexDirection: 'row',
    gap: sizes.sm,
    marginBottom: sizes.lg,
  },
  variant: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: sizes.radiusMedium,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: sizes.md,
  },
  variantWinning: {
    borderColor: colors.platinumSilver,
    borderWidth: 2,
  },
  variantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.sm,
    marginBottom: sizes.md,
  },
  variantLabel: {
    ...typography.h3,
    fontSize: 18,
    color: colors.platinumSilver,
    fontWeight: '700',
  },
  variantName: {
    ...typography.caption,
    color: colors.liquidSilver,
    flex: 1,
  },
  variantStats: {
    gap: sizes.sm,
  },
  variantStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  variantStatLabel: {
    ...typography.caption,
    color: colors.liquidSilver,
    fontSize: 11,
  },
  variantStatValue: {
    ...typography.bodyMedium,
    color: colors.softWhite,
  },
  conversionValue: {
    color: colors.platinumSilver,
    fontWeight: '700',
  },
  vsContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsText: {
    ...typography.caption,
    color: colors.liquidSilver,
    fontWeight: '700',
  },
  confidenceContainer: {
    marginBottom: sizes.md,
  },
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: sizes.xs,
  },
  confidenceLabel: {
    ...typography.caption,
    color: colors.liquidSilver,
  },
  confidenceValue: {
    ...typography.bodyMedium,
    color: colors.platinumSilver,
    fontWeight: '700',
  },
  confidenceBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: colors.platinumSilver,
  },
  readyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.xs,
    marginTop: sizes.sm,
  },
  readyText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  testActions: {
    flexDirection: 'row',
    gap: sizes.sm,
  },
  actionButton: {
    flex: 1,
    padding: sizes.sm,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: sizes.radiusMedium,
    alignItems: 'center',
  },
  actionButtonText: {
    ...typography.caption,
    color: colors.liquidSilver,
    fontWeight: '600',
  },
  implementButton: {
    flex: 1,
    borderRadius: sizes.radiusMedium,
    overflow: 'hidden',
  },
  implementGradient: {
    padding: sizes.sm,
    alignItems: 'center',
  },
  implementText: {
    ...typography.caption,
    color: colors.softWhite,
    fontWeight: '600',
  },
  completedCard: {
    marginBottom: sizes.sm,
  },
  completedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: sizes.md,
  },
  completedName: {
    ...typography.bodyMedium,
    color: colors.softWhite,
    marginBottom: sizes.xs,
  },
  completedConclusion: {
    ...typography.caption,
    color: colors.liquidSilver,
  },
  improvementBadge: {
    backgroundColor: 'rgba(0, 214, 111, 0.15)',
    paddingHorizontal: sizes.md,
    paddingVertical: sizes.xs,
    borderRadius: sizes.radiusMedium,
  },
  improvementText: {
    ...typography.bodyMedium,
    color: colors.success,
    fontWeight: '700',
  },
  tipsCard: {
    marginBottom: sizes.md,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.sm,
    marginBottom: sizes.md,
  },
  tipsTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.softWhite,
  },
  tips: {
    gap: sizes.sm,
  },
  tip: {
    ...typography.body,
    fontSize: 14,
    color: colors.liquidSilver,
    lineHeight: 20,
  },
});
