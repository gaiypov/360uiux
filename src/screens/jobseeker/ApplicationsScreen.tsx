/**
 * 360° РАБОТА - Revolut Ultra Edition
 * Applications History Screen
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
import { GlassCard } from '@/components/ui';
import { colors, typography, sizes } from '@/constants';
import { Application, Vacancy } from '@/types';

// Mock data
const MOCK_APPLICATIONS: (Application & { vacancy: Vacancy })[] = [
  {
    id: '1',
    vacancyId: '1',
    userId: '1',
    status: 'viewed',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    vacancy: {
      id: '1',
      title: 'Senior Frontend Developer',
      employer: {
        id: 'e1',
        companyName: 'Yandex',
        rating: 4.8,
        verified: true,
      },
      salaryMin: 250000,
      city: 'Москва',
      videoUrl: '',
      benefits: ['ДМС', 'Удаленка'],
      applications: 128,
      createdAt: new Date().toISOString(),
    },
  },
  {
    id: '2',
    vacancyId: '2',
    userId: '1',
    status: 'accepted',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    vacancy: {
      id: '2',
      title: 'Product Designer',
      employer: {
        id: 'e2',
        companyName: 'VK',
        rating: 4.6,
        verified: true,
      },
      salaryMin: 200000,
      city: 'Санкт-Петербург',
      videoUrl: '',
      benefits: ['ДМС', 'Обучение'],
      applications: 89,
      createdAt: new Date().toISOString(),
    },
  },
];

export function ApplicationsScreen() {
  const [filter, setFilter] = useState<
    'all' | 'pending' | 'viewed' | 'accepted' | 'rejected'
  >('all');

  const filteredApplications = MOCK_APPLICATIONS.filter(
    (app) => filter === 'all' || app.status === filter
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'clock-outline';
      case 'viewed':
        return 'eye-outline';
      case 'accepted':
        return 'check-circle';
      case 'rejected':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return colors.warning;
      case 'viewed':
        return colors.cyberBlue;
      case 'accepted':
        return colors.success;
      case 'rejected':
        return colors.error;
      default:
        return colors.liquidSilver;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Ожидает';
      case 'viewed':
        return 'Просмотрено';
      case 'accepted':
        return 'Приглашение';
      case 'rejected':
        return 'Отказ';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Вчера';
    if (diffDays < 7) return `${diffDays} дн. назад`;
    return date.toLocaleDateString('ru-RU');
  };

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
          <Text style={styles.title}>Мои отклики</Text>
          <Text style={styles.subtitle}>
            Всего откликов: {MOCK_APPLICATIONS.length}
          </Text>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filters}
        >
          {[
            { key: 'all', label: 'Все' },
            { key: 'pending', label: 'Ожидают' },
            { key: 'viewed', label: 'Просмотрены' },
            { key: 'accepted', label: 'Приглашения' },
            { key: 'rejected', label: 'Отказы' },
          ].map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.filterChip,
                filter === item.key && styles.filterChipActive,
              ]}
              onPress={() => setFilter(item.key as any)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === item.key && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Applications List */}
        {filteredApplications.length > 0 ? (
          <View style={styles.applicationsList}>
            {filteredApplications.map((application) => (
              <TouchableOpacity
                key={application.id}
                activeOpacity={0.8}
                onPress={() =>
                  console.log('Open vacancy', application.vacancy.id)
                }
              >
                <GlassCard style={styles.applicationCard}>
                  {/* Status Badge */}
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${getStatusColor(application.status)}20` },
                    ]}
                  >
                    <Icon
                      name={getStatusIcon(application.status)}
                      size={16}
                      color={getStatusColor(application.status)}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(application.status) },
                      ]}
                    >
                      {getStatusText(application.status)}
                    </Text>
                  </View>

                  {/* Company */}
                  <View style={styles.companyRow}>
                    <View style={styles.companyIcon}>
                      <Icon
                        name="office-building"
                        size={20}
                        color={colors.ultraViolet}
                      />
                    </View>
                    <Text style={styles.companyName}>
                      {application.vacancy.employer.companyName}
                    </Text>
                    {application.vacancy.employer.verified && (
                      <Icon
                        name="check-decagram"
                        size={16}
                        color={colors.cyberBlue}
                      />
                    )}
                  </View>

                  {/* Title */}
                  <Text style={styles.vacancyTitle} numberOfLines={2}>
                    {application.vacancy.title}
                  </Text>

                  {/* Salary */}
                  <View style={styles.salaryContainer}>
                    <LinearGradient
                      colors={[colors.ultraViolet, colors.cyberBlue]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.salaryGradient}
                    >
                      <Text style={styles.salary}>
                        от {application.vacancy.salaryMin.toLocaleString('ru-RU')} ₽
                      </Text>
                    </LinearGradient>
                  </View>

                  {/* Footer */}
                  <View style={styles.cardFooter}>
                    <View style={styles.locationRow}>
                      <Icon name="map-marker" size={14} color={colors.liquidSilver} />
                      <Text style={styles.location}>
                        {application.vacancy.city}
                      </Text>
                    </View>
                    <Text style={styles.date}>
                      {formatDate(application.createdAt)}
                    </Text>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="briefcase-off" size={64} color={colors.liquidSilver} />
            <Text style={styles.emptyStateText}>
              {filter === 'all'
                ? 'У вас пока нет откликов'
                : `Нет откликов в статусе "${getStatusText(filter)}"`}
            </Text>
          </View>
        )}
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
  filtersScroll: {
    marginBottom: sizes.lg,
  },
  filters: {
    flexDirection: 'row',
    gap: sizes.sm,
  },
  filterChip: {
    backgroundColor: colors.glassBackground,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: sizes.radiusMedium,
    paddingHorizontal: sizes.md,
    paddingVertical: sizes.sm,
  },
  filterChipActive: {
    backgroundColor: 'rgba(142, 127, 255, 0.2)',
    borderColor: colors.ultraViolet,
  },
  filterChipText: {
    ...typography.caption,
    color: colors.liquidSilver,
  },
  filterChipTextActive: {
    color: colors.ultraViolet,
    fontWeight: '600',
  },
  applicationsList: {
    gap: sizes.md,
  },
  applicationCard: {
    position: 'relative',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: sizes.sm,
    paddingVertical: 4,
    borderRadius: sizes.radiusSmall,
    marginBottom: sizes.md,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.sm,
    marginBottom: sizes.sm,
  },
  companyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(142, 127, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyName: {
    ...typography.bodyMedium,
    color: colors.softWhite,
    flex: 1,
  },
  vacancyTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.softWhite,
    marginBottom: sizes.sm,
  },
  salaryContainer: {
    alignSelf: 'flex-start',
    borderRadius: sizes.radiusMedium,
    overflow: 'hidden',
    marginBottom: sizes.md,
  },
  salaryGradient: {
    paddingHorizontal: sizes.md,
    paddingVertical: sizes.xs,
  },
  salary: {
    ...typography.bodyMedium,
    color: colors.softWhite,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: sizes.sm,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    ...typography.caption,
    color: colors.liquidSilver,
  },
  date: {
    ...typography.caption,
    color: colors.liquidSilver,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sizes.xxl * 2,
  },
  emptyStateText: {
    ...typography.body,
    color: colors.liquidSilver,
    marginTop: sizes.lg,
    textAlign: 'center',
  },
});
