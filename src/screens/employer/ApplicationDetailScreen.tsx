/**
 * 360° РАБОТА - ULTRA EDITION
 * Application Detail Screen (Employer)
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

interface ApplicationDetailProps {
  route: {
    params: {
      applicationId: string;
    };
  };
  navigation: any;
}

export function ApplicationDetailScreen({ route, navigation }: ApplicationDetailProps) {
  const { applicationId } = route.params;
  const { showToast } = useToastStore();

  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplication();
  }, [applicationId]);

  const loadApplication = async () => {
    try {
      setLoading(true);
      const result = await api.getApplicationById(applicationId);
      setApplication(result.application);
    } catch (error: any) {
      console.error('Error loading application:', error);
      showToast('error', 'Ошибка загрузки отклика');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    try {
      haptics.light();
      await api.updateApplicationStatus(applicationId, {
        employerStatus: status as any,
      });
      showToast('success', 'Статус обновлен');
      setApplication({ ...application, employer_status: status });
    } catch (error: any) {
      console.error('Error updating status:', error);
      showToast('error', 'Ошибка обновления статуса');
      haptics.error();
    }
  };

  const handleViewVideo = async () => {
    if (!application.video_id) {
      showToast('error', 'Видео-резюме отсутствует');
      return;
    }

    try {
      haptics.light();

      // Получить защищенный URL видео
      const result = await api.getApplicationVideoUrl(applicationId);

      navigation.navigate('VideoPlayer', {
        videoUrl: result.videoUrl,
        title: `Видео-резюме: ${application.candidate_name}`,
        type: 'resume',
      });
    } catch (error: any) {
      console.error('Error getting video URL:', error);
      if (error.response?.data?.message?.includes('limit exceeded')) {
        showToast('error', 'Превышен лимит просмотров (2/2)');
      } else {
        showToast('error', 'Ошибка загрузки видео');
      }
      haptics.error();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return colors.platinumSilver;
      case 'viewed':
        return '#5AC8FA';
      case 'interview':
        return '#FFD60A';
      case 'accepted':
        return '#30D158';
      case 'rejected':
        return '#FF453A';
      default:
        return colors.chromeSilver;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new':
        return 'Новый';
      case 'viewed':
        return 'Просмотрен';
      case 'interview':
        return 'На собеседовании';
      case 'accepted':
        return 'Принят';
      case 'rejected':
        return 'Отклонен';
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

  if (!application) {
    return null;
  }

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
        <Text style={styles.topBarTitle}>Отклик</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(application.employer_status)}20` }]}>
          <Text style={[styles.statusText, { color: getStatusColor(application.employer_status) }]}>
            {getStatusLabel(application.employer_status)}
          </Text>
        </View>

        {/* Candidate Info */}
        <GlassCard style={styles.card}>
          <View style={styles.candidateHeader}>
            <View style={styles.candidateAvatar}>
              <Icon name="account" size={48} color={colors.platinumSilver} />
            </View>
            <View style={styles.candidateInfo}>
              <Text style={styles.candidateName}>{application.candidate_name}</Text>
              {application.candidate_age && (
                <Text style={styles.candidateAge}>{application.candidate_age} лет</Text>
              )}
            </View>
          </View>
        </GlassCard>

        {/* Vacancy Info */}
        <GlassCard style={styles.card}>
          <Text style={styles.cardTitle}>Вакансия</Text>
          <Text style={styles.vacancyTitle}>{application.vacancy_title}</Text>
        </GlassCard>

        {/* Video Resume */}
        {application.video_id && (
          <TouchableOpacity
            style={styles.videoCard}
            onPress={handleViewVideo}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={metalGradients.platinum}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.videoGradient}
            >
              <Icon name="play-circle" size={48} color={colors.primaryBlack} />
              <Text style={styles.videoText}>Смотреть видео-резюме</Text>
              <View style={styles.videoStats}>
                <Icon name="eye" size={16} color={colors.graphiteBlack} />
                <Text style={styles.videoStatsText}>
                  {application.views_count || 0} / 2 просмотра
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Application Details */}
        <GlassCard style={styles.card}>
          <View style={styles.infoRow}>
            <Icon name="calendar" size={20} color={colors.chromeSilver} />
            <Text style={styles.infoLabel}>Дата отклика</Text>
            <Text style={styles.infoValue}>
              {new Date(application.created_at).toLocaleDateString('ru-RU')}
            </Text>
          </View>
        </GlassCard>

        {/* Cover Letter */}
        {application.cover_letter && (
          <GlassCard style={styles.card}>
            <Text style={styles.cardTitle}>Сопроводительное письмо</Text>
            <Text style={styles.cardText}>{application.cover_letter}</Text>
          </GlassCard>
        )}

        {/* Status Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.actionsTitle}>Изменить статус</Text>

          {application.employer_status !== 'viewed' && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleStatusUpdate('viewed')}
            >
              <Icon name="eye" size={20} color={colors.platinumSilver} />
              <Text style={styles.actionButtonText}>Просмотрен</Text>
            </TouchableOpacity>
          )}

          {application.employer_status !== 'interview' && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleStatusUpdate('interview')}
            >
              <Icon name="calendar-clock" size={20} color={colors.platinumSilver} />
              <Text style={styles.actionButtonText}>Пригласить на собеседование</Text>
            </TouchableOpacity>
          )}

          {application.employer_status !== 'accepted' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSuccess]}
              onPress={() => handleStatusUpdate('accepted')}
            >
              <Icon name="check-circle" size={20} color={colors.successGreen} />
              <Text style={[styles.actionButtonText, styles.actionButtonSuccessText]}>
                Принять
              </Text>
            </TouchableOpacity>
          )}

          {application.employer_status !== 'rejected' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonDanger]}
              onPress={() => handleStatusUpdate('rejected')}
            >
              <Icon name="close-circle" size={20} color={colors.errorRed} />
              <Text style={[styles.actionButtonText, styles.actionButtonDangerText]}>
                Отклонить
              </Text>
            </TouchableOpacity>
          )}
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
  card: {
    marginBottom: sizes.md,
  },
  candidateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.md,
  },
  candidateAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  candidateInfo: {
    flex: 1,
  },
  candidateName: {
    ...typography.h2,
    fontSize: 22,
    color: colors.softWhite,
    marginBottom: 4,
  },
  candidateAge: {
    ...typography.body,
    color: colors.chromeSilver,
  },
  cardTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.softWhite,
    marginBottom: sizes.sm,
  },
  vacancyTitle: {
    ...typography.body,
    fontSize: 16,
    color: colors.chromeSilver,
  },
  videoCard: {
    borderRadius: sizes.radiusLarge,
    overflow: 'hidden',
    marginBottom: sizes.md,
    shadowColor: colors.platinumSilver,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  videoGradient: {
    padding: sizes.xl,
    alignItems: 'center',
    gap: sizes.md,
  },
  videoText: {
    ...typography.h3,
    fontSize: 18,
    color: colors.primaryBlack,
    fontWeight: '700',
  },
  videoStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.xs,
  },
  videoStatsText: {
    ...typography.caption,
    color: colors.graphiteBlack,
    fontWeight: '600',
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
  cardText: {
    ...typography.body,
    color: colors.chromeSilver,
    lineHeight: 22,
  },
  actionsContainer: {
    gap: sizes.sm,
    marginTop: sizes.lg,
  },
  actionsTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.softWhite,
    marginBottom: sizes.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sizes.md,
    paddingHorizontal: sizes.xl,
    borderRadius: sizes.radiusLarge,
    backgroundColor: 'rgba(255,255,255,0.1)',
    gap: sizes.sm,
  },
  actionButtonText: {
    ...typography.bodyMedium,
    color: colors.platinumSilver,
    fontWeight: '600',
    fontSize: 16,
  },
  actionButtonSuccess: {
    backgroundColor: 'rgba(48, 209, 88, 0.15)',
  },
  actionButtonSuccessText: {
    color: colors.successGreen,
  },
  actionButtonDanger: {
    backgroundColor: 'rgba(255, 69, 58, 0.15)',
  },
  actionButtonDangerText: {
    color: colors.errorRed,
  },
});
