/**
 * 360° РАБОТА - ULTRA EDITION
 * Candidates Screen (Employer)
 * Shows all applications from all vacancies
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { GlassCard, LoadingSpinner } from '@/components/ui';
import { colors, metalGradients, typography, sizes } from '@/constants';
import { api } from '@/services/api';
import { useToastStore } from '@/stores';
import { haptics } from '@/utils/haptics';

interface Application {
  id: string;
  jobseeker_id: string;
  vacancy_id: string;
  vacancy_title: string;
  jobseeker_name: string;
  jobseeker_profession?: string;
  jobseeker_city?: string;
  message?: string;
  employer_status: 'pending' | 'viewed' | 'interview' | 'rejected' | 'accepted';
  has_video: boolean;
  created_at: string;
}

export function CandidatesScreen({ navigation }: any) {
  const { showToast } = useToastStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'interview'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load employer's vacancies first
      const vacanciesResult = await api.getMyVacancies({ status: 'published' });
      setVacancies(vacanciesResult.vacancies || []);

      // Load applications from all vacancies
      const allApplications: Application[] = [];

      for (const vacancy of vacanciesResult.vacancies || []) {
        try {
          const result = await api.getVacancyApplications(vacancy.id);
          const apps = (result.applications || []).map((app: any) => ({
            ...app,
            vacancy_title: vacancy.title,
          }));
          allApplications.push(...apps);
        } catch (error) {
          console.error(`Error loading applications for vacancy ${vacancy.id}:`, error);
        }
      }

      // Sort by creation date (newest first)
      allApplications.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setApplications(allApplications);
    } catch (error: any) {
      console.error('Error loading data:', error);
      showToast('error', 'Ошибка загрузки откликов');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleStatusUpdate = async (applicationId: string, status: Application['employer_status']) => {
    try {
      haptics.light();

      await api.updateApplicationStatus(applicationId, {
        employerStatus: status,
      });

      // Update local state
      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId ? { ...app, employer_status: status } : app
        )
      );

      const statusText = {
        viewed: 'просмотрен',
        interview: 'приглашен на собеседование',
        rejected: 'отклонен',
        accepted: 'принят',
      }[status];

      showToast('success', `Отклик ${statusText}`);
      haptics.success();
    } catch (error: any) {
      console.error('Error updating status:', error);
      showToast('error', 'Ошибка обновления статуса');
      haptics.error();
    }
  };

  const handleApplicationPress = (application: Application) => {
    haptics.light();
    navigation.navigate('ApplicationDetail', {
      applicationId: application.id,
    });
  };

  const getStatusColor = (status: Application['employer_status']) => {
    switch (status) {
      case 'pending':
        return '#FFB800';
      case 'viewed':
        return '#0A84FF';
      case 'interview':
        return colors.platinumSilver;
      case 'accepted':
        return '#30D158';
      case 'rejected':
        return '#FF453A';
      default:
        return colors.chromeSilver;
    }
  };

  const getStatusLabel = (status: Application['employer_status']) => {
    switch (status) {
      case 'pending':
        return 'Новый';
      case 'viewed':
        return 'Просмотрен';
      case 'interview':
        return 'Собеседование';
      case 'accepted':
        return 'Принят';
      case 'rejected':
        return 'Отклонен';
      default:
        return status;
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    if (filter === 'pending') return app.employer_status === 'pending';
    if (filter === 'interview') return app.employer_status === 'interview';
    return true;
  });

  const renderApplication = ({ item }: { item: Application }) => {
    const canAccept = item.employer_status !== 'accepted' && item.employer_status !== 'rejected';
    const canReject = item.employer_status !== 'rejected';

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleApplicationPress(item)}
      >
        <GlassCard style={styles.card}>
          {/* Header */}
          <View style={styles.applicationHeader}>
            <View style={styles.avatar}>
              <Icon name="account" size={32} color={colors.platinumSilver} />
              {item.has_video && (
                <View style={styles.videoBadge}>
                  <Icon name="video" size={12} color={colors.primaryBlack} />
                </View>
              )}
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.jobseeker_name || 'Соискатель'}</Text>
              {item.jobseeker_profession && (
                <Text style={styles.profession}>{item.jobseeker_profession}</Text>
              )}
              <Text style={styles.vacancyTitle} numberOfLines={1}>
                {item.vacancy_title}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.employer_status)}20` }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.employer_status) }]}>
                {getStatusLabel(item.employer_status)}
              </Text>
            </View>
          </View>

          {/* Details */}
          {(item.jobseeker_city || item.message) && (
            <View style={styles.details}>
              {item.jobseeker_city && (
                <View style={styles.detailRow}>
                  <Icon name="map-marker" size={16} color={colors.chromeSilver} />
                  <Text style={styles.detailText}>{item.jobseeker_city}</Text>
                </View>
              )}
              {item.message && (
                <Text style={styles.message} numberOfLines={2}>
                  "{item.message}"
                </Text>
              )}
            </View>
          )}

          {/* Actions */}
          {item.employer_status === 'pending' && (
            <View style={styles.actions}>
              {canReject && (
                <TouchableOpacity
                  style={styles.actionButtonReject}
                  onPress={() => handleStatusUpdate(item.id, 'rejected')}
                >
                  <Text style={styles.actionTextReject}>Отклонить</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.actionButtonInterview}
                onPress={() => handleStatusUpdate(item.id, 'interview')}
              >
                <Text style={styles.actionTextInterview}>Собеседование</Text>
              </TouchableOpacity>
            </View>
          )}

          {item.employer_status === 'interview' && (
            <View style={styles.actions}>
              {canReject && (
                <TouchableOpacity
                  style={styles.actionButtonReject}
                  onPress={() => handleStatusUpdate(item.id, 'rejected')}
                >
                  <Text style={styles.actionTextReject}>Отклонить</Text>
                </TouchableOpacity>
              )}
              {canAccept && (
                <TouchableOpacity
                  style={styles.actionButtonAccept}
                  onPress={() => handleStatusUpdate(item.id, 'accepted')}
                >
                  <LinearGradient
                    colors={metalGradients.platinum}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.actionGradient}
                  >
                    <Text style={styles.actionTextAccept}>Принять</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Timestamp */}
          <Text style={styles.timestamp}>
            {new Date(item.created_at).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </GlassCard>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Отклики</Text>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {(['all', 'pending', 'interview'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterButton,
              filter === f && styles.filterButtonActive,
            ]}
            onPress={() => {
              haptics.light();
              setFilter(f);
            }}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}
            >
              {f === 'all' ? 'Все' : f === 'pending' ? 'Новые' : 'Собеседование'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.count}>
        {filteredApplications.length} {filteredApplications.length === 1 ? 'отклик' : 'откликов'}
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="account-search-outline" size={64} color={colors.chromeSilver} />
      <Text style={styles.emptyTitle}>Нет откликов</Text>
      <Text style={styles.emptyText}>
        {filter === 'all'
          ? 'Пока никто не откликнулся на ваши вакансии'
          : filter === 'pending'
          ? 'Нет новых откликов'
          : 'Нет приглашенных на собеседование'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />

      <FlatList
        data={filteredApplications}
        renderItem={renderApplication}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.platinumSilver}
            colors={[colors.platinumSilver]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
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
  listContent: {
    paddingHorizontal: sizes.lg,
    paddingTop: sizes.lg,
    paddingBottom: 100,
  },
  header: {
    marginBottom: sizes.lg,
  },
  title: {
    ...typography.h1,
    fontSize: 32,
    color: colors.softWhite,
    marginBottom: sizes.md,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: sizes.sm,
    marginBottom: sizes.md,
  },
  filterButton: {
    paddingVertical: sizes.sm,
    paddingHorizontal: sizes.md,
    borderRadius: sizes.radiusMedium,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  filterButtonActive: {
    backgroundColor: colors.platinumSilver,
  },
  filterText: {
    ...typography.body,
    color: colors.chromeSilver,
    fontSize: 14,
  },
  filterTextActive: {
    color: colors.primaryBlack,
    fontWeight: '600',
  },
  count: {
    ...typography.caption,
    color: colors.chromeSilver,
  },
  card: {
    padding: sizes.md,
    marginBottom: sizes.md,
  },
  applicationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: sizes.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: sizes.sm,
    position: 'relative',
  },
  videoBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.platinumSilver,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primaryBlack,
  },
  info: {
    flex: 1,
    marginRight: sizes.sm,
  },
  name: {
    ...typography.h3,
    fontSize: 16,
    color: colors.softWhite,
    marginBottom: 2,
  },
  profession: {
    ...typography.body,
    fontSize: 13,
    color: colors.chromeSilver,
    marginBottom: 2,
  },
  vacancyTitle: {
    ...typography.caption,
    fontSize: 12,
    color: colors.graphiteSilver,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: sizes.sm,
    borderRadius: sizes.radiusSmall,
  },
  statusText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
  },
  details: {
    marginBottom: sizes.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.xs,
    marginBottom: 4,
  },
  detailText: {
    ...typography.caption,
    color: colors.chromeSilver,
    fontSize: 13,
  },
  message: {
    ...typography.body,
    fontSize: 13,
    color: colors.chromeSilver,
    marginTop: 4,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: sizes.sm,
    marginTop: sizes.sm,
  },
  actionButtonReject: {
    flex: 1,
    paddingVertical: sizes.sm,
    paddingHorizontal: sizes.md,
    borderRadius: sizes.radiusMedium,
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    alignItems: 'center',
  },
  actionTextReject: {
    ...typography.bodyMedium,
    color: '#FF453A',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonInterview: {
    flex: 1,
    paddingVertical: sizes.sm,
    paddingHorizontal: sizes.md,
    borderRadius: sizes.radiusMedium,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
  },
  actionTextInterview: {
    ...typography.bodyMedium,
    color: colors.softWhite,
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonAccept: {
    flex: 1,
    borderRadius: sizes.radiusMedium,
    overflow: 'hidden',
  },
  actionGradient: {
    paddingVertical: sizes.sm,
    paddingHorizontal: sizes.md,
    alignItems: 'center',
  },
  actionTextAccept: {
    ...typography.bodyMedium,
    color: colors.primaryBlack,
    fontSize: 14,
    fontWeight: '700',
  },
  timestamp: {
    ...typography.caption,
    fontSize: 11,
    color: colors.graphiteSilver,
    marginTop: sizes.sm,
    paddingTop: sizes.sm,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: sizes.xxxLarge,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.softWhite,
    marginTop: sizes.lg,
    marginBottom: sizes.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.chromeSilver,
    textAlign: 'center',
  },
});
