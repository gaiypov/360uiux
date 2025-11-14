/**
 * 360° РАБОТА - ULTRA EDITION
 * Role Switcher Component
 *
 * Переключение роли между соискателем и работодателем
 * P1 FIX: Added accessibility labels
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { colors, metalGradients, typography, sizes } from '@/constants';
import { useAuthStore } from '@/stores/authStore';

interface RoleSwitcherProps {
  onRoleChanged?: () => void;
}

export function RoleSwitcher({ onRoleChanged }: RoleSwitcherProps) {
  const { user, switchRole } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const currentRole = user?.role || 'jobseeker';

  const handleSwitchRole = () => {
    const newRole = currentRole === 'jobseeker' ? 'employer' : 'jobseeker';
    const roleText = newRole === 'employer' ? 'работодателя' : 'соискателя';

    Alert.alert(
      'Переключить режим?',
      `Вы переходите в режим ${roleText}`,
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Переключить',
          onPress: async () => {
            setIsLoading(true);
            try {
              // Имитация задержки (в реальном приложении - API call)
              await new Promise((resolve) => setTimeout(resolve, 500));
              switchRole(newRole);
              onRoleChanged?.();
            } catch (error) {
              console.error('Error switching role:', error);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Current Role */}
      <View style={styles.currentRoleSection}>
        <Text style={styles.label}>ТЕКУЩИЙ РЕЖИМ</Text>
        <View
          style={styles.currentRoleCard}
          accessible={true}
          accessibilityLabel={`Текущий режим: ${currentRole === 'employer' ? 'Работодатель' : 'Соискатель'}`}
          accessibilityHint={currentRole === 'employer' ? 'Создание вакансий, поиск кандидатов' : 'Поиск работы, отклики на вакансии'}
        >
          <LinearGradient
            colors={
              currentRole === 'employer'
                ? metalGradients.platinum
                : metalGradients.silver
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.currentRoleGradient}
          >
            <Icon
              name={currentRole === 'employer' ? 'briefcase' : 'account'}
              size={32}
              color={colors.primaryBlack}
            />
          </LinearGradient>
          <View style={styles.roleInfo}>
            <Text style={styles.roleTitle}>
              {currentRole === 'employer'
                ? '🏢 Работодатель'
                : '👤 Соискатель'}
            </Text>
            <Text style={styles.roleDescription}>
              {currentRole === 'employer'
                ? 'Создание вакансий, поиск кандидатов'
                : 'Поиск работы, отклики на вакансии'}
            </Text>
          </View>
        </View>
      </View>

      {/* Switch Button */}
      <TouchableOpacity
        style={styles.switchButton}
        onPress={handleSwitchRole}
        disabled={isLoading}
        accessibilityRole="button"
        accessibilityLabel={`Переключить на ${currentRole === 'jobseeker' ? 'работодателя' : 'соискателя'}`}
        accessibilityHint="Открывает диалог подтверждения смены роли"
        accessibilityState={{ disabled: isLoading, busy: isLoading }}
      >
        <LinearGradient
          colors={
            currentRole === 'jobseeker'
              ? metalGradients.platinum
              : metalGradients.silver
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.switchGradient}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.primaryBlack} />
          ) : (
            <>
              <Icon name="swap-horizontal" size={24} color={colors.primaryBlack} />
              <Text style={styles.switchButtonText}>
                Переключить на{' '}
                {currentRole === 'jobseeker' ? 'работодателя' : 'соискателя'}
              </Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Info */}
      <View style={styles.infoBox}>
        <Icon name="information" size={20} color={colors.info} />
        <Text style={styles.infoText}>
          Вы можете переключаться между режимами в любое время. Ваши данные
          сохранятся.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 16,
    padding: sizes.large,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  label: {
    ...typography.caption,
    color: colors.liquidSilver,
    marginBottom: sizes.small,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  currentRoleSection: {
    marginBottom: sizes.large,
  },
  currentRoleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: sizes.medium,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: sizes.medium,
  },
  currentRoleGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    ...typography.h4,
    color: colors.softWhite,
    marginBottom: sizes.xSmall,
  },
  roleDescription: {
    ...typography.caption,
    color: colors.liquidSilver,
  },
  switchButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: sizes.medium,
  },
  switchGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sizes.medium,
    paddingHorizontal: sizes.large,
    gap: sizes.small,
  },
  switchButtonText: {
    ...typography.body,
    color: colors.primaryBlack,
    fontWeight: '700',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(59,130,246,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.3)',
    borderRadius: 8,
    padding: sizes.small,
    gap: sizes.small,
  },
  infoText: {
    ...typography.caption,
    color: colors.info,
    flex: 1,
  },
});
