/**
 * 360° РАБОТА - ULTRA EDITION
 * Notifications Screen - Activity Feed
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Swipeable } from 'react-native-gesture-handler';
import { GlassCard, MetalIcon, PullToRefresh, ShimmerLoader } from '@/components/ui';
import { colors, typography, sizes } from '@/constants';
import { useNotificationsStore, type Notification } from '@/stores/notificationsStore';
import { useToastStore } from '@/stores/toastStore';
import { haptics } from '@/utils/haptics';

export function NotificationsScreen({ navigation }: any) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    deleteNotification,
  } = useNotificationsStore();

  const { showToast } = useToastStore();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize with mock data if empty (development only)
  useEffect(() => {
    if (notifications.length === 0) {
      setLoading(true);
      setTimeout(() => {
        addNotification({
          type: 'application',
          title: 'Отклик просмотрен',
          message:
            'Компания "Яндекс" просмотрела ваш отклик на вакансию Senior React Native Developer',
        });
        addNotification({
          type: 'message',
          title: 'Новое сообщение',
          message: 'HR-менеджер компании "Сбер" отправил вам сообщение',
        });
        addNotification({
          type: 'vacancy',
          title: 'Новая подходящая вакансия',
          message: 'Найдена вакансия "Mobile Developer" в компании "ВКонтакте"',
        });
        setLoading(false);
      }, 800);
    }
  }, []);

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    haptics.light();

    // Simulate network request
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In real app, fetch new notifications from API

    setRefreshing(false);
    haptics.success();
  }, []);

  // Handle notification deletion
  const handleDelete = useCallback(
    (notificationId: string) => {
      haptics.medium();
      deleteNotification(notificationId);
      showToast('success', 'Уведомление удалено');
    },
    [deleteNotification, showToast]
  );

  // Handle notification press with haptic
  const handleNotificationPress = useCallback(
    (notificationId: string) => {
      haptics.light();
      markAsRead(notificationId);
    },
    [markAsRead]
  );

  // Handle mark all as read with haptic
  const handleMarkAllAsRead = useCallback(() => {
    haptics.medium();
    markAllAsRead();
    showToast('success', 'Все уведомления прочитаны');
  }, [markAllAsRead, showToast]);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'application':
        return 'clipboard-check';
      case 'message':
        return 'message';
      case 'vacancy':
        return 'briefcase-search';
      case 'system':
        return 'bell';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'application':
        return colors.success;
      case 'message':
        return colors.info;
      case 'vacancy':
        return colors.platinumSilver;
      case 'system':
        return colors.warning;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} д назад`;
    return date.toLocaleDateString('ru-RU');
  };

  // Render right swipe actions (delete)
  const renderRightActions = useCallback(
    (notificationId: string) => {
      return (
        <TouchableOpacity
          style={styles.deleteAction}
          onPress={() => handleDelete(notificationId)}
          activeOpacity={0.8}
        >
          <Icon name="delete" size={24} color={colors.softWhite} />
          <Text style={styles.deleteText}>Удалить</Text>
        </TouchableOpacity>
      );
    },
    [handleDelete]
  );

  // Memoized render function for performance
  const renderNotification = useCallback(
    ({ item, index }: { item: Notification; index: number }) => (
      <Animated.View entering={FadeInRight.delay(Math.min(index * 50, 300)).duration(400)}>
        <Swipeable
          renderRightActions={() => renderRightActions(item.id)}
          overshootRight={false}
          friction={2}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleNotificationPress(item.id)}
          >
            <GlassCard
              variant={item.read ? 'light' : 'medium'}
              style={[styles.notificationCard, !item.read && styles.unreadCard]}
            >
              <View style={styles.notificationContent}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: `${getNotificationColor(item.type)}20` },
                  ]}
                >
                  <Icon
                    name={getNotificationIcon(item.type)}
                    size={24}
                    color={getNotificationColor(item.type)}
                  />
                </View>

                <View style={styles.textContent}>
                  <View style={styles.header}>
                    <Text style={styles.notificationTitle}>{item.title}</Text>
                    {!item.read && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notificationMessage} numberOfLines={2}>
                    {item.message}
                  </Text>
                  <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
                </View>
              </View>
            </GlassCard>
          </TouchableOpacity>
        </Swipeable>
      </Animated.View>
    ),
    [handleNotificationPress, renderRightActions, getNotificationIcon, getNotificationColor]
  );

  // Memoize key extractor for performance
  const keyExtractor = useCallback((item: Notification) => item.id, []);

  // Loading skeleton
  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Уведомления</Text>
        </View>
        <View style={styles.listContent}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={styles.skeletonCard}>
              <ShimmerLoader width={48} height={48} borderRadius={24} />
              <View style={{ flex: 1, marginLeft: sizes.md }}>
                <ShimmerLoader width="60%" height={16} />
                <ShimmerLoader width="90%" height={12} style={{ marginTop: sizes.sm }} />
                <ShimmerLoader width="30%" height={10} style={{ marginTop: sizes.xs }} />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />

      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={styles.headerContainer}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Уведомления</Text>
            {unreadCount > 0 && (
              <Text style={styles.unreadCount}>
                {unreadCount} непрочитанных
              </Text>
            )}
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={handleMarkAllAsRead}
              activeOpacity={0.7}
            >
              <Text style={styles.markAllText}>Прочитать все</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={21}
        // Pull to refresh
        refreshControl={<PullToRefresh refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            style={styles.emptyState}
          >
            <MetalIcon name="bell-off" variant="steel" size="large" glow={false} />
            <Text style={styles.emptyTitle}>Нет уведомлений</Text>
            <Text style={styles.emptyText}>
              Здесь будут отображаться ваши уведомления
            </Text>
          </Animated.View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBlack,
  },
  headerContainer: {
    paddingHorizontal: sizes.lg,
    paddingTop: sizes.xxl,
    paddingBottom: sizes.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    ...typography.h1,
    color: colors.softWhite,
    marginBottom: sizes.xs,
  },
  unreadCount: {
    ...typography.caption,
    color: colors.platinumSilver,
  },
  markAllButton: {
    paddingHorizontal: sizes.md,
    paddingVertical: sizes.sm,
    backgroundColor: colors.carbonGray,
    borderRadius: sizes.radiusMedium,
  },
  markAllText: {
    ...typography.captionMedium,
    color: colors.platinumSilver,
  },
  listContent: {
    paddingHorizontal: sizes.lg,
    paddingBottom: sizes.xl,
  },
  notificationCard: {
    marginBottom: sizes.md,
  },
  unreadCard: {
    borderWidth: 1,
    borderColor: colors.platinumSilver,
  },
  notificationContent: {
    flexDirection: 'row',
    gap: sizes.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sizes.xs,
  },
  notificationTitle: {
    ...typography.bodyMedium,
    color: colors.softWhite,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.platinumSilver,
    marginLeft: sizes.sm,
  },
  notificationMessage: {
    ...typography.body,
    color: colors.chromeSilver,
    marginBottom: sizes.xs,
  },
  timestamp: {
    ...typography.caption,
    color: colors.graphiteSilver,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sizes.xxl * 2,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.softWhite,
    marginTop: sizes.lg,
    marginBottom: sizes.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.chromeSilver,
    textAlign: 'center',
  },
  deleteAction: {
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    marginBottom: sizes.md,
    borderTopRightRadius: sizes.radiusLarge,
    borderBottomRightRadius: sizes.radiusLarge,
    paddingHorizontal: sizes.md,
  },
  deleteText: {
    ...typography.micro,
    color: colors.softWhite,
    marginTop: 4,
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: sizes.md,
    marginBottom: sizes.md,
    backgroundColor: colors.slateGray,
    borderRadius: sizes.radiusLarge,
  },
});
