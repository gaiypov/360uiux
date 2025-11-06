/**
 * 360° РАБОТА - Application Status Badge Component
 *
 * Отображает статус отклика с цветовой индикацией
 * Architecture v3: pending, viewed, interview, rejected, hired, cancelled
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type ApplicationStatus =
  | 'pending'
  | 'viewed'
  | 'interview'
  | 'rejected'
  | 'hired'
  | 'cancelled';

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
  small?: boolean;
}

/**
 * Конфигурация для каждого статуса
 */
const STATUS_CONFIG: Record<
  ApplicationStatus,
  {
    label: string;
    color: string;
    backgroundColor: string;
    emoji: string;
  }
> = {
  pending: {
    label: 'На рассмотрении',
    color: '#F59E0B',
    backgroundColor: '#FEF3C7',
    emoji: '⏳',
  },
  viewed: {
    label: 'Просмотрено',
    color: '#3B82F6',
    backgroundColor: '#DBEAFE',
    emoji: '👁️',
  },
  interview: {
    label: 'Собеседование',
    color: '#8B5CF6',
    backgroundColor: '#EDE9FE',
    emoji: '📅',
  },
  rejected: {
    label: 'Отклонено',
    color: '#EF4444',
    backgroundColor: '#FEE2E2',
    emoji: '❌',
  },
  hired: {
    label: 'Принят',
    color: '#10B981',
    backgroundColor: '#D1FAE5',
    emoji: '✅',
  },
  cancelled: {
    label: 'Отменено',
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    emoji: '🚫',
  },
};

export const ApplicationStatusBadge: React.FC<ApplicationStatusBadgeProps> = ({
  status,
  small = false,
}) => {
  const config = STATUS_CONFIG[status];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.backgroundColor },
        small && styles.badgeSmall,
      ]}
    >
      <Text style={styles.emoji}>{config.emoji}</Text>
      <Text
        style={[
          styles.label,
          { color: config.color },
          small && styles.labelSmall,
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  emoji: {
    fontSize: 14,
    marginRight: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  labelSmall: {
    fontSize: 11,
  },
});
