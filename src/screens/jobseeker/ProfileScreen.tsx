/**
 * 360° РАБОТА - Revolut Ultra Edition
 * Job Seeker Profile Screen
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { GlassCard, GlassButton } from '@/components/ui';
import { colors, typography, sizes } from '@/constants';
import { useAuthStore } from '@/stores/authStore';

export function ProfileScreen() {
  const { user, logout } = useAuthStore();

  if (!user || user.role !== 'jobseeker') {
    return null;
  }

  const profile = user.profile as any;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header Card */}
        <GlassCard style={styles.headerCard}>
          <View style={styles.avatarContainer}>
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Icon name="account" size={48} color={colors.ultraViolet} />
              </View>
            )}
            <TouchableOpacity style={styles.editAvatarButton}>
              <Icon name="camera" size={20} color={colors.softWhite} />
            </TouchableOpacity>
          </View>

          <Text style={styles.name}>
            {profile.firstName} {profile.lastName}
          </Text>
          <Text style={styles.email}>{user.email}</Text>

          {profile.profession && (
            <View style={styles.professionBadge}>
              <LinearGradient
                colors={[colors.ultraViolet, colors.cyberBlue]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.professionGradient}
              >
                <Text style={styles.professionText}>{profile.profession}</Text>
              </LinearGradient>
            </View>
          )}

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Откликов</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Приглашений</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>8</Text>
              <Text style={styles.statLabel}>Избранных</Text>
            </View>
          </View>
        </GlassCard>

        {/* Info Sections */}
        <GlassCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="map-marker" size={24} color={colors.ultraViolet} />
            <Text style={styles.sectionTitle}>Локация</Text>
          </View>
          <Text style={styles.sectionValue}>
            {profile.city || 'Не указано'}
          </Text>
        </GlassCard>

        {profile.experience && (
          <GlassCard style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="briefcase" size={24} color={colors.ultraViolet} />
              <Text style={styles.sectionTitle}>Опыт работы</Text>
            </View>
            <Text style={styles.sectionValue}>
              {profile.experience} {profile.experience === 1 ? 'год' : 'лет'}
            </Text>
          </GlassCard>
        )}

        {profile.resume && (
          <GlassCard style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="file-document" size={24} color={colors.ultraViolet} />
              <Text style={styles.sectionTitle}>Резюме</Text>
            </View>
            <TouchableOpacity style={styles.resumeButton}>
              <Text style={styles.resumeButtonText}>Посмотреть резюме</Text>
              <Icon name="arrow-right" size={20} color={colors.cyberBlue} />
            </TouchableOpacity>
          </GlassCard>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <GlassButton
            title="РЕДАКТИРОВАТЬ ПРОФИЛЬ"
            variant="secondary"
            onPress={() => console.log('Edit profile')}
          />

          <TouchableOpacity style={styles.settingsButton}>
            <Icon name="cog" size={24} color={colors.liquidSilver} />
            <Text style={styles.settingsText}>Настройки</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Icon name="logout" size={24} color={colors.error} />
            <Text style={styles.logoutText}>Выйти</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>360° РАБОТА</Text>
          <Text style={styles.appVersion}>Версия 1.0.0</Text>
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: sizes.lg,
    paddingBottom: 100,
  },
  headerCard: {
    alignItems: 'center',
    paddingVertical: sizes.xl,
    marginBottom: sizes.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: sizes.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.ultraViolet,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(142, 127, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.ultraViolet,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.ultraViolet,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primaryBlack,
  },
  name: {
    ...typography.h2,
    color: colors.softWhite,
    marginBottom: sizes.xs,
  },
  email: {
    ...typography.body,
    color: colors.liquidSilver,
    marginBottom: sizes.md,
  },
  professionBadge: {
    borderRadius: sizes.radiusMedium,
    overflow: 'hidden',
    marginBottom: sizes.lg,
  },
  professionGradient: {
    paddingHorizontal: sizes.lg,
    paddingVertical: sizes.sm,
  },
  professionText: {
    ...typography.bodyMedium,
    color: colors.softWhite,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-around',
    paddingTop: sizes.lg,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.ultraViolet,
    marginBottom: sizes.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.liquidSilver,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.glassBorder,
  },
  section: {
    marginBottom: sizes.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.sm,
    marginBottom: sizes.sm,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.softWhite,
  },
  sectionValue: {
    ...typography.body,
    color: colors.liquidSilver,
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(57, 224, 248, 0.1)',
    borderRadius: sizes.radiusMedium,
    padding: sizes.md,
    marginTop: sizes.sm,
  },
  resumeButtonText: {
    ...typography.bodyMedium,
    color: colors.cyberBlue,
  },
  actions: {
    gap: sizes.md,
    marginTop: sizes.lg,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sizes.sm,
    padding: sizes.md,
    backgroundColor: colors.glassBackground,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: sizes.radiusMedium,
  },
  settingsText: {
    ...typography.bodyMedium,
    color: colors.liquidSilver,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sizes.sm,
    padding: sizes.md,
  },
  logoutText: {
    ...typography.bodyMedium,
    color: colors.error,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: sizes.xl,
    paddingTop: sizes.lg,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
  appInfoText: {
    ...typography.h3,
    fontSize: 14,
    color: colors.liquidSilver,
    letterSpacing: 2,
  },
  appVersion: {
    ...typography.caption,
    color: colors.liquidSilver,
    marginTop: sizes.xs,
  },
});
