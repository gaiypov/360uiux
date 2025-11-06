/**
 * 360° РАБОТА - Employer Applications Screen
 *
 * Экран откликов для работодателя
 * Architecture v3: Список всех откликов с фильтрацией и чатом
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ApplicationCard } from '../../components/applications/ApplicationCard';
import { api } from '../../services/api';

type ApplicationStatus =
  | 'all'
  | 'pending'
  | 'viewed'
  | 'interview'
  | 'rejected'
  | 'hired'
  | 'cancelled';

interface Application {
  application_id: string;
  status: Exclude<ApplicationStatus, 'all'>;
  applied_at: string;
  viewed_at?: string;
  last_message_at?: string;
  unread_messages_count: number;
  jobseeker_id: string;
  jobseeker_name: string;
  jobseeker_phone: string;
  resume_id: string;
  resume_title: string;
  vacancy_id: string;
  vacancy_title: string;
  video_views_remaining: number;
}

const STATUS_FILTERS: { value: ApplicationStatus; label: string; emoji: string }[] = [
  { value: 'all', label: 'Все', emoji: '📋' },
  { value: 'pending', label: 'Новые', emoji: '⏳' },
  { value: 'viewed', label: 'Просмотрено', emoji: '👁️' },
  { value: 'interview', label: 'Собеседование', emoji: '📅' },
  { value: 'hired', label: 'Приняты', emoji: '✅' },
  { value: 'rejected', label: 'Отклонено', emoji: '❌' },
];

export const EmployerApplicationsScreen: React.FC = () => {
  const navigation = useNavigation();

  // Состояние
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<ApplicationStatus>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Загрузить отклики
   */
  const loadApplications = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }

      const response = await api.get('/chat/my-chats');

      if (response.data.success) {
        setApplications(response.data.chats);
      }
    } catch (error: any) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Обновить список
   */
  const handleRefresh = () => {
    setRefreshing(true);
    loadApplications(true);
  };

  /**
   * Применить фильтр
   */
  useEffect(() => {
    if (selectedFilter === 'all') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(
        applications.filter((app) => app.status === selectedFilter)
      );
    }
  }, [applications, selectedFilter]);

  /**
   * Загрузить при фокусе
   */
  useFocusEffect(
    useCallback(() => {
      loadApplications();
    }, [])
  );

  /**
   * Открыть чат
   */
  const handleOpenChat = (application: Application) => {
    navigation.navigate('Chat' as never, {
      applicationId: application.application_id,
      title: application.jobseeker_name,
      subtitle: application.resume_title,
    } as never);
  };

  /**
   * Рендер фильтра
   */
  const renderFilter = (filter: typeof STATUS_FILTERS[0]) => {
    const isActive = selectedFilter === filter.value;
    const count =
      filter.value === 'all'
        ? applications.length
        : applications.filter((app) => app.status === filter.value).length;

    return (
      <TouchableOpacity
        key={filter.value}
        style={[styles.filterButton, isActive && styles.filterButtonActive]}
        onPress={() => setSelectedFilter(filter.value)}
      >
        <Text style={styles.filterEmoji}>{filter.emoji}</Text>
        <Text
          style={[styles.filterLabel, isActive && styles.filterLabelActive]}
        >
          {filter.label}
        </Text>
        {count > 0 && (
          <View
            style={[
              styles.filterBadge,
              isActive && styles.filterBadgeActive,
            ]}
          >
            <Text
              style={[
                styles.filterBadgeText,
                isActive && styles.filterBadgeTextActive,
              ]}
            >
              {count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  /**
   * Рендер карточки
   */
  const renderCard = ({ item }: { item: Application }) => (
    <ApplicationCard
      applicationId={item.application_id}
      status={item.status}
      appliedAt={item.applied_at}
      title={item.jobseeker_name}
      subtitle={item.resume_title}
      lastMessageAt={item.last_message_at}
      lastMessagePreview={undefined}
      unreadCount={item.unread_messages_count}
      onPress={() => handleOpenChat(item)}
      userRole="employer"
    />
  );

  /**
   * Пустой список
   */
  const renderEmpty = () => {
    if (loading) {
      return null;
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>📭</Text>
        <Text style={styles.emptyTitle}>Нет откликов</Text>
        <Text style={styles.emptyText}>
          {selectedFilter === 'all'
            ? 'У вас пока нет откликов на вакансии'
            : `Нет откликов со статусом "${STATUS_FILTERS.find((f) => f.value === selectedFilter)?.label}"`}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Загрузка откликов...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Хедер */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Отклики</Text>
        <Text style={styles.headerSubtitle}>
          {applications.length} {applications.length === 1 ? 'отклик' : 'откликов'}
        </Text>
      </View>

      {/* Фильтры */}
      <FlatList
        horizontal
        data={STATUS_FILTERS}
        renderItem={({ item }) => renderFilter(item)}
        keyExtractor={(item) => item.value}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        style={styles.filtersContainer}
      />

      {/* Список откликов */}
      <FlatList
        data={filteredApplications}
        renderItem={renderCard}
        keyExtractor={(item) => item.application_id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#8B5CF6']}
            tintColor="#8B5CF6"
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filters: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  filterEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterLabelActive: {
    color: '#FFFFFF',
  },
  filterBadge: {
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 6,
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },
  filterBadgeTextActive: {
    color: '#FFFFFF',
  },
  list: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
