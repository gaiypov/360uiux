/**
 * 360° РАБОТА - ULTRA EDITION
 * Company Detail Screen
 */

import React from 'react';
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
import { Employer } from '@/types';

interface CompanyDetailScreenProps {
  route: {
    params: {
      company: Employer;
    };
  };
  navigation: any;
}

export function CompanyDetailScreen({
  route,
  navigation,
}: CompanyDetailScreenProps) {
  const { company } = route.params;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={colors.softWhite} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Company Card */}
        <GlassCard style={styles.companyCard}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Icon name="office-building" size={48} color={colors.platinumSilver} />
            </View>
          </View>

          <Text style={styles.companyName}>{company.companyName}</Text>

          {company.verified && (
            <View style={styles.verifiedBadge}>
              <Icon name="check-decagram" size={20} color={colors.platinumSilver} />
              <Text style={styles.verifiedText}>Проверенный работодатель</Text>
            </View>
          )}

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <LinearGradient
              colors={metalGradients.platinum}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ratingGradient}
            >
              <Icon name="star" size={20} color={colors.softWhite} />
              <Text style={styles.ratingText}>{company.rating.toFixed(1)}</Text>
            </LinearGradient>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>24</Text>
              <Text style={styles.statLabel}>Вакансии</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>156</Text>
              <Text style={styles.statLabel}>Сотрудников</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>89</Text>
              <Text style={styles.statLabel}>Отзывов</Text>
            </View>
          </View>
        </GlassCard>

        {/* Industry */}
        {company.industry && (
          <GlassCard style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="factory" size={24} color={colors.platinumSilver} />
              <Text style={styles.sectionTitle}>Индустрия</Text>
            </View>
            <Text style={styles.sectionValue}>{company.industry}</Text>
          </GlassCard>
        )}

        {/* Website */}
        {company.website && (
          <GlassCard style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="web" size={24} color={colors.platinumSilver} />
              <Text style={styles.sectionTitle}>Сайт</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.websiteLink}>{company.website}</Text>
            </TouchableOpacity>
          </GlassCard>
        )}

        {/* About */}
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>О компании</Text>
          <Text style={styles.aboutText}>
            {company.companyName} — это инновационная компания, которая стремится
            создавать лучшие продукты и предоставлять отличные условия для своих
            сотрудников. Мы ценим талант, креативность и профессионализм.
          </Text>
        </GlassCard>

        {/* Benefits */}
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Преимущества</Text>
          <View style={styles.benefits}>
            {[
              'Конкурентная зарплата',
              'ДМС для сотрудников',
              'Гибкий график работы',
              'Удаленная работа',
              'Обучение и развитие',
              'Корпоративные мероприятия',
            ].map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Icon name="check-circle" size={20} color={colors.platinumSilver} />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* Open Vacancies */}
        <View style={styles.vacanciesSection}>
          <Text style={styles.vacanciesTitle}>Открытые вакансии</Text>
          <GlassButton
            title="ПОСМОТРЕТЬ ВСЕ ВАКАНСИИ"
            variant="secondary"
            onPress={() => console.log('View all vacancies')}
          />
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
  header: {
    paddingHorizontal: sizes.md,
    paddingTop: 50,
    paddingBottom: sizes.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glassBackground,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: sizes.lg,
    paddingBottom: 100,
  },
  companyCard: {
    alignItems: 'center',
    paddingVertical: sizes.xl,
  },
  logoContainer: {
    marginBottom: sizes.lg,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(232, 232, 237, 0.2)',
    borderWidth: 3,
    borderColor: colors.platinumSilver,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyName: {
    ...typography.h1,
    fontSize: 28,
    color: colors.softWhite,
    marginBottom: sizes.sm,
    textAlign: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.xs,
    backgroundColor: 'rgba(232, 232, 237, 0.15)',
    paddingHorizontal: sizes.md,
    paddingVertical: sizes.xs,
    borderRadius: sizes.radiusMedium,
    marginBottom: sizes.lg,
  },
  verifiedText: {
    ...typography.caption,
    color: colors.platinumSilver,
    fontWeight: '600',
  },
  ratingContainer: {
    borderRadius: sizes.radiusMedium,
    overflow: 'hidden',
    marginBottom: sizes.lg,
  },
  ratingGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.xs,
    paddingHorizontal: sizes.lg,
    paddingVertical: sizes.sm,
  },
  ratingText: {
    ...typography.numbers,
    color: colors.softWhite,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-around',
    paddingTop: sizes.lg,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.platinumSilver,
    marginBottom: sizes.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.liquidSilver,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.glassBorder,
  },
  section: {
    marginTop: sizes.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.sm,
    marginBottom: sizes.sm,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.softWhite,
  },
  sectionValue: {
    ...typography.body,
    color: colors.liquidSilver,
  },
  websiteLink: {
    ...typography.body,
    color: colors.platinumSilver,
    textDecorationLine: 'underline',
  },
  aboutText: {
    ...typography.body,
    color: colors.liquidSilver,
    lineHeight: 24,
  },
  benefits: {
    gap: sizes.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.sm,
  },
  benefitText: {
    ...typography.body,
    color: colors.liquidSilver,
    flex: 1,
  },
  vacanciesSection: {
    marginTop: sizes.lg,
    gap: sizes.md,
  },
  vacanciesTitle: {
    ...typography.h2,
    fontSize: 22,
    color: colors.softWhite,
  },
});
