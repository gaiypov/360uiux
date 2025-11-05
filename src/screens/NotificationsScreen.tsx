/**
 * 360° РАБОТА - ULTRA EDITION
 * Notifications Screen - Activity Feed
 */

import React, { useEffect } from 'react';
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
import { GlassCard, MetalIcon } from '@/components/ui';
import { colors, typography, sizes } from '@/constants';
import { useNotificationsStore, type Notification } from '@/stores/notificationsStore';

export function NotificationsScreen({ navigation }: any) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, addNotification } =
    useNotificationsStore();

  // Initialize with mock data if empty (development only)
  useEffect(() => {
    if (notifications.length === 0) {
      addNotification({
        type: 'application',
        title: 'Отклик просмотрен',
        message: 'Компания "Яндекс" просмотрела ваш отклик на вакансию Senior React Native Developer',
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
    }
  }, []);

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

  const renderNotification = ({ item, index }: { item: Notification; index: number }) => (
    <Animated.View
      entering={FadeInRight.delay(index * 50).duration(400)}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => markAsRead(item.id)}
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
    </Animated.View>
  );

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
              onPress={markAllAsRead}
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
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
});
