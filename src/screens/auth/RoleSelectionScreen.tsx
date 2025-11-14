/**
 * 360° РАБОТА - ULTRA EDITION
 * Role Selection Screen
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, metalGradients, typography, sizes } from "@/constants";
import { haptics } from '@/utils/haptics';

interface RoleSelectionScreenProps {
  route?: {
    params: {
      phone: string;
      formattedPhone: string;
    };
  };
  navigation?: any;
  onSelectRole?: (role: 'jobseeker' | 'employer') => void;
}

export function RoleSelectionScreen({ route, navigation, onSelectRole }: RoleSelectionScreenProps) {
  const { phone, formattedPhone } = route?.params || { phone: '', formattedPhone: '' };

  const handleSelectRole = (role: 'jobseeker' | 'employer') => {
    haptics.medium();

    if (onSelectRole) {
      // Used as component (not in navigation)
      onSelectRole(role);
    } else if (navigation) {
      // Used in navigation flow
      if (role === 'jobseeker') {
        navigation.replace('Registration', { phone, formattedPhone });
      } else {
        navigation.replace('EmployerRegistration', { phone, formattedPhone });
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primaryBlack}
        translucent
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Кто вы?</Text>
        <Text style={styles.subtitle}>Выберите роль для продолжения</Text>
      </View>

      {/* Role Cards */}
      <View style={styles.cardsContainer}>
        {/* Job Seeker Card */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.9}
          onPress={() => handleSelectRole('jobseeker')}
        >
          <LinearGradient
            colors={metalGradients.platinum}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            <View style={styles.iconContainer}>
              <Icon name="account-search" size={48} color={colors.graphiteBlack} />
            </View>
            <Text style={styles.cardTitle}>Ищу работу</Text>
            <Text style={styles.cardDescription}>
              Найти работу мечты{'\n'}с помощью ИИ
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Employer Card */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.9}
          onPress={() => handleSelectRole('employer')}
        >
          <View style={styles.cardSecondary}>
            <View style={styles.iconContainer}>
              <Icon name="office-building" size={48} color={colors.platinumSilver} />
            </View>
            <Text style={styles.cardTitle}>Работодатель</Text>
            <Text style={styles.cardDescription}>
              Найти лучших{'\n'}кандидатов
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBlack,
    paddingHorizontal: sizes.lg,
  },
  header: {
    marginTop: 100,
    marginBottom: sizes.xxl,
    alignItems: 'center',
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
  cardsContainer: {
    gap: sizes.lg,
  },
  card: {
    borderRadius: sizes.radiusXLarge,
    overflow: 'hidden',
    shadowColor: colors.platinumSilver,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    shadowOpacity: 0.3,
    elevation: 10,
  },
  cardGradient: {
    padding: sizes.xl,
    alignItems: 'center',
    minHeight: 200,
    justifyContent: 'center',
  },
  cardSecondary: {
    padding: sizes.xl,
    alignItems: 'center',
    minHeight: 200,
    justifyContent: 'center',
    backgroundColor: colors.glassBackground,
    borderWidth: 2,
    borderColor: colors.glassBorder,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: sizes.lg,
  },
  cardTitle: {
    ...typography.h2,
    color: colors.softWhite,
    marginBottom: sizes.sm,
  },
  cardDescription: {
    ...typography.body,
    color: colors.liquidSilver,
    textAlign: 'center',
  },
});
