/**
 * 360° РАБОТА - Application Card Component
 *
 * Карточка отклика для списка откликов
 * Architecture v3: Универсальный компонент для jobseeker и employer
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { ApplicationStatusBadge } from './ApplicationStatusBadge';

type ApplicationStatus =
  | 'pending'
  | 'viewed'
  | 'interview'
  | 'rejected'
  | 'hired'
  | 'cancelled';

interface ApplicationCardProps {
  // Основная информация
  applicationId: string;
  status: ApplicationStatus;
  appliedAt: string;

  // Информация о вакансии/резюме
  title: string;
  subtitle?: string; // Компания или имя соискателя

  // Чат
  lastMessageAt?: string;
  lastMessagePreview?: string;
  unreadCount: number;

  // Мессенджеры (только для employer view)
  telegramUsername?: string;
  telegramEnabled?: boolean;
  whatsappPhone?: string;
  whatsappEnabled?: boolean;

  // Действия
  onPress: () => void;

  // Тип пользователя
  userRole: 'jobseeker' | 'employer';
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  status,
  appliedAt,
  title,
  subtitle,
  lastMessageAt,
  lastMessagePreview,
  unreadCount,
  telegramUsername,
  telegramEnabled,
  whatsappPhone,
  whatsappEnabled,
  onPress,
  userRole,
}) => {
  /**
   * Открыть Telegram
   */
  const handleTelegram = async () => {
    if (!telegramUsername) return;

    const url = `tg://resolve?domain=${telegramUsername}`;
    const webUrl = `https://t.me/${telegramUsername}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось открыть Telegram');
    }
  };

  /**
   * Открыть WhatsApp
   */
  const handleWhatsApp = async () => {
    if (!whatsappPhone) return;

    const url = `whatsapp://send?phone=${whatsappPhone}`;
    const webUrl = `https://wa.me/${whatsappPhone}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось открыть WhatsApp');
    }
  };

  /**
   * Форматировать дату
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} д назад`;

    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    });
  };

  const showMessengers = userRole === 'jobseeker' &&
    ((telegramEnabled && telegramUsername) || (whatsappEnabled && whatsappPhone));

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Хедер */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {/* Статус и дата */}
      <View style={styles.statusRow}>
        <ApplicationStatusBadge status={status} small />
        <Text style={styles.date}>{formatDate(appliedAt)}</Text>
      </View>

      {/* Последнее сообщение */}
      {lastMessagePreview && (
        <View style={styles.messagePreview}>
          <Text style={styles.messageText} numberOfLines={2}>
            {lastMessagePreview}
          </Text>
          {lastMessageAt && (
            <Text style={styles.messageTime}>{formatDate(lastMessageAt)}</Text>
          )}
        </View>
      )}

      {/* Мессенджеры (только для jobseeker) */}
      {showMessengers && (
        <View style={styles.messengers}>
          {telegramEnabled && telegramUsername && (
            <TouchableOpacity
              style={styles.messengerButton}
              onPress={handleTelegram}
            >
              <Text style={styles.messengerEmoji}>✈️</Text>
              <Text style={styles.messengerText}>Telegram</Text>
            </TouchableOpacity>
          )}

          {whatsappEnabled && whatsappPhone && (
            <TouchableOpacity
              style={styles.messengerButton}
              onPress={handleWhatsApp}
            >
              <Text style={styles.messengerEmoji}>💬</Text>
              <Text style={styles.messengerText}>WhatsApp</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  messagePreview: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  messageText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  messengers: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  messengerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  messengerEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  messengerText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
});
