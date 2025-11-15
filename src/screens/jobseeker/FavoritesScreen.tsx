/**
 * 360° РАБОТА - ULTRA EDITION
 * Favorites Screen
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { GlassCard } from '@/components/ui';
import { colors, metalGradients, typography, sizes } from "@/constants";
import { Vacancy } from '@/types';

// Mock data - в реальном приложении из Zustand store
const MOCK_FAVORITES: Vacancy[] = [];

export function FavoritesScreen() {
  const handleRemoveFavorite = (vacancyId: string) => {
    console.log('Remove from favorites:', vacancyId);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Избранное</Text>
          <Text style={styles.subtitle}>
            {MOCK_FAVORITES.length === 0
              ? 'Нет сохраненных вакансий'
              : `${MOCK_FAVORITES.length} ${
                  MOCK_FAVORITES.length === 1
                    ? 'вакансия'
                    : MOCK_FAVORITES.length < 5
                    ? 'вакансии'
                    : 'вакансий'
                }`}
          </Text>
        </View>

        {/* Favorites List */}
        {MOCK_FAVORITES.length > 0 ? (
          <View style={styles.favoritesList}>
            {MOCK_FAVORITES.map((vacancy) => (
              <TouchableOpacity
                key={vacancy.id}
                activeOpacity={0.8}
                onPress={() => console.log('Open vacancy', vacancy.id)}
              >
                <GlassCard style={styles.vacancyCard}>
                  {/* Header */}
                  <View style={styles.cardHeader}>
                    <View style={styles.companyRow}>
                      <View style={styles.companyIcon}>
                        <Icon
                          name="office-building"
                          size={20}
                          color={colors.platinumSilver}
                        />
                      </View>
                      <Text style={styles.companyName}>
                        {vacancy.employer.companyName}
                      </Text>
                      {vacancy.employer.verified && (
                        <Icon
                          name="check-decagram"
                          size={16}
                          color={colors.platinumSilver}
                        />
                      )}
                    </View>

                    <TouchableOpacity
                      onPress={() => handleRemoveFavorite(vacancy.id)}
                      style={styles.favoriteButton}
                    >
                      <Icon name="heart" size={24} color={colors.error} />
                    </TouchableOpacity>
                  </View>

                  {/* Title */}
                  <Text style={styles.vacancyTitle} numberOfLines={2}>
                    {vacancy.title}
                  </Text>

                  {/* Salary */}
                  <View style={styles.salaryContainer}>
                    <LinearGradient
                      colors={metalGradients.platinum}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.salaryGradient}
                    >
                      <Text style={styles.salary}>
                        от {vacancy.salaryMin.toLocaleString('ru-RU')} ₽
                      </Text>
                    </LinearGradient>
                  </View>

                  {/* Location */}
                  <View style={styles.locationRow}>
                    <Icon name="map-marker" size={14} color={colors.liquidSilver} />
                    <Text style={styles.location}>
                      {vacancy.city}
                      {vacancy.metro && ` • м. ${vacancy.metro}`}
                    </Text>
                  </View>

                  {/* Benefits */}
                  {vacancy.benefits.length > 0 && (
                    <View style={styles.benefits}>
                      {vacancy.benefits.slice(0, 3).map((benefit, index) => (
                        <View key={index} style={styles.benefitChip}>
                          <Text style={styles.benefitText}>{benefit}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </GlassCard>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="heart-outline" size={64} color={colors.liquidSilver} />
            <Text style={styles.emptyStateText}>
              Нет избранных вакансий
            </Text>
            <Text style={styles.emptyStateHint}>
              Нажмите ❤️ на вакансии, чтобы{'\n'}сохранить её в избранное
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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
  header: {
    marginBottom: sizes.lg,
    marginTop: sizes.lg,
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
  favoritesList: {
    gap: sizes.md,
  },
  vacancyCard: {},
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: sizes.sm,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.sm,
    flex: 1,
  },
  companyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(232, 232, 237, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyName: {
    ...typography.bodyMedium,
    color: colors.softWhite,
    flex: 1,
  },
  favoriteButton: {
    padding: sizes.xs,
  },
  vacancyTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.softWhite,
    marginBottom: sizes.sm,
  },
  salaryContainer: {
    alignSelf: 'flex-start',
    borderRadius: sizes.radiusMedium,
    overflow: 'hidden',
    marginBottom: sizes.sm,
  },
  salaryGradient: {
    paddingHorizontal: sizes.md,
    paddingVertical: sizes.xs,
  },
  salary: {
    ...typography.bodyMedium,
    color: colors.softWhite,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: sizes.sm,
  },
  location: {
    ...typography.caption,
    color: colors.liquidSilver,
  },
  benefits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: sizes.sm,
  },
  benefitChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: sizes.radiusSmall,
    paddingHorizontal: sizes.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  benefitText: {
    ...typography.caption,
    color: colors.liquidSilver,
    fontSize: 11,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sizes.xxl * 2,
  },
  emptyStateText: {
    ...typography.h3,
    fontSize: 18,
    color: colors.softWhite,
    marginTop: sizes.lg,
    textAlign: 'center',
  },
  emptyStateHint: {
    ...typography.body,
    color: colors.liquidSilver,
    marginTop: sizes.sm,
    textAlign: 'center',
  },
});
