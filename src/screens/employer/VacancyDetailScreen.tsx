/**
 * 360° РАБОТА - ULTRA EDITION
 * Vacancy Detail Screen (Employer)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { GlassCard, LoadingSpinner } from '@/components/ui';
import { colors, metalGradients, typography, sizes } from '@/constants';
import { api } from '@/services/api';
import { useToastStore } from '@/stores';
import { haptics } from '@/utils/haptics';

interface VacancyDetailProps {
  route: {
    params: {
      vacancyId: string;
    };
  };
  navigation: any;
}

export function VacancyDetailScreen({ route, navigation }: VacancyDetailProps) {
  const { vacancyId } = route.params;
  const { showToast } = useToastStore();

  const [vacancy, setVacancy] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVacancy();
  }, [vacancyId]);

  const loadVacancy = async () => {
    try {
      setLoading(true);
      const result = await api.getVacancyById(vacancyId);
      setVacancy(result.vacancy);
    } catch (error: any) {
      console.error('Error loading vacancy:', error);
      showToast('error', 'Ошибка загрузки вакансии');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      haptics.light();
      await api.publishVacancy(vacancyId);
      showToast('success', 'Вакансия опубликована');
      loadVacancy();
    } catch (error: any) {
      console.error('Error publishing vacancy:', error);
      showToast('error', 'Ошибка публикации');
      haptics.error();
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Удалить вакансию?',
      'Это действие нельзя отменить',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteVacancy(vacancyId);
              showToast('success', 'Вакансия удалена');
              navigation.goBack();
            } catch (error: any) {
              console.error('Error deleting vacancy:', error);
              showToast('error', 'Ошибка удаления');
            }
          },
        },
      ]
    );
  };

  const handleViewApplications = () => {
    haptics.light();
    navigation.navigate('VacancyApplications', { vacancyId });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return '#30D158';
      case 'draft':
        return colors.chromeSilver;
      case 'closed':
        return '#FF453A';
      default:
        return colors.graphiteSilver;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published':
        return 'Опубликована';
      case 'draft':
        return 'Черновик';
      case 'closed':
        return 'Закрыта';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />
        <LoadingSpinner />
      </View>
    );
  }

  if (!vacancy) {
    return null;
  }

  const salaryText = vacancy.salary_min && vacancy.salary_max
    ? `${vacancy.salary_min.toLocaleString('ru-RU')} - ${vacancy.salary_max.toLocaleString('ru-RU')} ₽`
    : vacancy.salary_min
    ? `от ${vacancy.salary_min.toLocaleString('ru-RU')} ₽`
    : 'Не указана';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />

      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={colors.softWhite} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Вакансия</Text>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={handleDelete}
        >
          <Icon name="delete-outline" size={24} color={colors.errorRed} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(vacancy.status)}20` }]}>
          <Text style={[styles.statusText, { color: getStatusColor(vacancy.status) }]}>
            {getStatusLabel(vacancy.status)}
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{vacancy.title}</Text>
        <Text style={styles.profession}>{vacancy.profession}</Text>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Icon name="eye" size={20} color={colors.platinumSilver} />
            <Text style={styles.statValue}>{vacancy.views_count || 0}</Text>
            <Text style={styles.statLabel}>просмотров</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Icon name="account-group" size={20} color={colors.platinumSilver} />
            <Text style={styles.statValue}>{vacancy.applications_count || 0}</Text>
            <Text style={styles.statLabel}>откликов</Text>
          </View>
        </View>

        {/* Main Info Card */}
        <GlassCard style={styles.card}>
          <View style={styles.infoRow}>
            <Icon name="currency-rub" size={20} color={colors.chromeSilver} />
            <Text style={styles.infoLabel}>Зарплата</Text>
            <Text style={styles.infoValue}>{salaryText}</Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="map-marker" size={20} color={colors.chromeSilver} />
            <Text style={styles.infoLabel}>Город</Text>
            <Text style={styles.infoValue}>{vacancy.city}</Text>
          </View>

          {vacancy.metro && (
            <View style={styles.infoRow}>
              <Icon name="subway-variant" size={20} color={colors.chromeSilver} />
              <Text style={styles.infoLabel}>Метро</Text>
              <Text style={styles.infoValue}>{vacancy.metro}</Text>
            </View>
          )}

          {vacancy.schedule && (
            <View style={styles.infoRow}>
              <Icon name="clock-outline" size={20} color={colors.chromeSilver} />
              <Text style={styles.infoLabel}>График</Text>
              <Text style={styles.infoValue}>{vacancy.schedule}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Icon name="briefcase" size={20} color={colors.chromeSilver} />
            <Text style={styles.infoLabel}>Опыт</Text>
            <Text style={styles.infoValue}>
              {vacancy.requires_experience ? 'Требуется' : 'Не требуется'}
            </Text>
          </View>
        </GlassCard>

        {/* Requirements */}
        {vacancy.requirements && (
          <GlassCard style={styles.card}>
            <Text style={styles.cardTitle}>Требования</Text>
            <Text style={styles.cardText}>{vacancy.requirements}</Text>
          </GlassCard>
        )}

        {/* Benefits */}
        {vacancy.benefits && (
          <GlassCard style={styles.card}>
            <Text style={styles.cardTitle}>Условия</Text>
            <Text style={styles.cardText}>{vacancy.benefits}</Text>
          </GlassCard>
        )}

        {/* Dates */}
        <GlassCard style={styles.card}>
          <View style={styles.infoRow}>
            <Icon name="calendar" size={20} color={colors.chromeSilver} />
            <Text style={styles.infoLabel}>Создана</Text>
            <Text style={styles.infoValue}>
              {new Date(vacancy.created_at).toLocaleDateString('ru-RU')}
            </Text>
          </View>
          {vacancy.published_at && (
            <View style={styles.infoRow}>
              <Icon name="calendar-check" size={20} color={colors.chromeSilver} />
              <Text style={styles.infoLabel}>Опубликована</Text>
              <Text style={styles.infoValue}>
                {new Date(vacancy.published_at).toLocaleDateString('ru-RU')}
              </Text>
            </View>
          )}
        </GlassCard>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {/* View Applications */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleViewApplications}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={metalGradients.platinum}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionGradient}
            >
              <Icon name="account-group" size={20} color={colors.primaryBlack} />
              <Text style={styles.actionText}>
                Смотреть отклики ({vacancy.applications_count || 0})
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Publish Button (if draft) */}
          {vacancy.status === 'draft' && (
            <TouchableOpacity
              style={styles.actionButtonSecondary}
              onPress={handlePublish}
              activeOpacity={0.8}
            >
              <Icon name="publish" size={20} color={colors.platinumSilver} />
              <Text style={styles.actionTextSecondary}>Опубликовать</Text>
            </TouchableOpacity>
          )}

          {/* Delete Button */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            activeOpacity={0.8}
          >
            <Icon name="delete-outline" size={20} color={colors.errorRed} />
            <Text style={styles.deleteText}>Удалить вакансию</Text>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.primaryBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sizes.lg,
    paddingTop: sizes.lg,
    paddingBottom: sizes.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    ...typography.h3,
    color: colors.softWhite,
  },
  moreButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: sizes.lg,
    paddingBottom: 100,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: sizes.md,
    borderRadius: sizes.radiusMedium,
    marginBottom: sizes.md,
  },
  statusText: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    ...typography.h1,
    fontSize: 28,
    color: colors.softWhite,
    marginBottom: sizes.xs,
  },
  profession: {
    ...typography.body,
    fontSize: 16,
    color: colors.chromeSilver,
    marginBottom: sizes.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: sizes.radiusLarge,
    paddingVertical: sizes.lg,
    marginBottom: sizes.lg,
  },
  statItem: {
    alignItems: 'center',
    gap: sizes.xs,
  },
  statValue: {
    ...typography.h2,
    fontSize: 24,
    color: colors.softWhite,
  },
  statLabel: {
    ...typography.caption,
    color: colors.chromeSilver,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.glassBorder,
  },
  card: {
    marginBottom: sizes.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: sizes.sm,
    gap: sizes.sm,
  },
  infoLabel: {
    ...typography.body,
    color: colors.chromeSilver,
    flex: 1,
  },
  infoValue: {
    ...typography.bodyMedium,
    color: colors.softWhite,
  },
  cardTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.softWhite,
    marginBottom: sizes.sm,
  },
  cardText: {
    ...typography.body,
    color: colors.chromeSilver,
    lineHeight: 22,
  },
  actionsContainer: {
    gap: sizes.md,
    marginTop: sizes.lg,
  },
  actionButton: {
    borderRadius: sizes.radiusLarge,
    overflow: 'hidden',
    shadowColor: colors.platinumSilver,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sizes.md + 2,
    paddingHorizontal: sizes.xl,
    gap: sizes.sm,
  },
  actionText: {
    ...typography.bodyMedium,
    color: colors.primaryBlack,
    fontWeight: '700',
    fontSize: 16,
  },
  actionButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sizes.md,
    paddingHorizontal: sizes.xl,
    borderRadius: sizes.radiusLarge,
    backgroundColor: 'rgba(255,255,255,0.1)',
    gap: sizes.sm,
  },
  actionTextSecondary: {
    ...typography.bodyMedium,
    color: colors.platinumSilver,
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sizes.md,
    paddingHorizontal: sizes.xl,
    borderRadius: sizes.radiusLarge,
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    gap: sizes.sm,
  },
  deleteText: {
    ...typography.bodyMedium,
    color: colors.errorRed,
    fontWeight: '600',
    fontSize: 16,
  },
});
