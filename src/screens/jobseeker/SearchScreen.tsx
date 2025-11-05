/**
 * 360° РАБОТА - ULTRA EDITION
 * Search Screen with Premium Filters
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { GlassCard, GlassButton, PressableScale, ShimmerLoader } from '@/components/ui';
import { FilterModal, type FilterValues } from '@/components/FilterModal';
import { colors, metalGradients, typography, sizes } from '@/constants';
import { useToastStore } from '@/stores/toastStore';
import { haptics } from '@/utils/haptics';
import { Vacancy } from '@/types';

export function SearchScreen({ navigation }: any) {
  const { showToast } = useToastStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({
    cities: [],
    experience: [],
    employment: [],
    schedule: [],
  });
  const [results, setResults] = useState<Vacancy[]>([]);
  const [searching, setSearching] = useState(false);

  const activeFiltersCount =
    filters.cities.length +
    filters.experience.length +
    filters.employment.length +
    filters.schedule.length +
    (filters.salaryMin ? 1 : 0) +
    (filters.salaryMax ? 1 : 0);

  const handleSearch = async () => {
    if (!searchQuery.trim() && activeFiltersCount === 0) {
      haptics.error();
      showToast('warning', 'Введите запрос или выберите фильтры');
      return;
    }

    haptics.light();
    setSearching(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock results
      const mockResults: Vacancy[] = [
        // Add mock vacancies here
      ];

      setResults(mockResults);
      haptics.success();

      if (mockResults.length === 0) {
        showToast('info', 'Вакансии не найдены. Попробуйте изменить параметры поиска');
      } else {
        showToast('success', `Найдено ${mockResults.length} вакансий`);
      }
    } catch (error) {
      haptics.error();
      showToast('error', 'Ошибка поиска');
    } finally {
      setSearching(false);
    }
  };

  const handleApplyFilters = (newFilters: FilterValues) => {
    haptics.medium();
    setFilters(newFilters);
    showToast('success', 'Фильтры применены');
    handleSearch();
  };

  const handleClearSearch = () => {
    haptics.light();
    setSearchQuery('');
    setResults([]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Поиск работы</Text>
          <Text style={styles.subtitle}>Найди работу мечты</Text>
        </View>

        {/* Search Bar */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <GlassCard style={styles.searchCard} variant="medium">
            <View style={styles.searchInputContainer}>
              <Icon name="magnify" size={24} color={colors.chromeSilver} />
              <TextInput
                style={styles.searchInput}
                placeholder="Должность, компания, навыки..."
                placeholderTextColor={colors.graphiteSilver}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                onSubmitEditing={handleSearch}
                editable={!searching}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={handleClearSearch}>
                  <Icon name="close-circle" size={20} color={colors.chromeSilver} />
                </TouchableOpacity>
              )}
            </View>
          </GlassCard>
        </Animated.View>

        {/* Filter Button */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <PressableScale>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => {
                haptics.light();
                setShowFilterModal(true);
              }}
              disabled={searching}
            >
              <LinearGradient
                colors={activeFiltersCount > 0 ? metalGradients.platinum : [colors.carbonGray, colors.carbonGray]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.filterGradient}
              >
                <Icon
                  name="filter-variant"
                  size={20}
                  color={activeFiltersCount > 0 ? colors.graphiteBlack : colors.chromeSilver}
                />
                <Text style={[styles.filterButtonText, activeFiltersCount > 0 && styles.filterButtonTextActive]}>
                  Фильтры
                </Text>
                {activeFiltersCount > 0 && (
                  <View style={styles.filterBadge}>
                    <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </PressableScale>
        </Animated.View>

        {/* Search Button */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <TouchableOpacity
            style={styles.searchButtonLarge}
            onPress={handleSearch}
            disabled={searching}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={metalGradients.platinum}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.searchGradient}
            >
              {searching ? (
                <ShimmerLoader width={100} height={20} />
              ) : (
                <>
                  <Icon name="magnify" size={20} color={colors.graphiteBlack} />
                  <Text style={styles.searchButtonText}>НАЙТИ</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Searching State */}
        {searching && (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.searchingState}>
            <ShimmerLoader width="100%" height={120} style={{ marginBottom: sizes.md }} />
            <ShimmerLoader width="100%" height={120} style={{ marginBottom: sizes.md }} />
            <ShimmerLoader width="100%" height={120} />
          </Animated.View>
        )}

        {/* Results or Empty State */}
        {!searching && (
              <Text style={styles.filterSectionTitle}>Зарплата</Text>
              <View style={styles.salaryInputs}>
                <View style={styles.salaryInputWrapper}>
                  <Text style={styles.inputLabel}>От</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="50 000"
                    placeholderTextColor={colors.liquidSilver}
                    value={filters.salaryMin}
                    onChangeText={(text) =>
                      setFilters({ ...filters, salaryMin: text })
                    }
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.salaryInputWrapper}>
                  <Text style={styles.inputLabel}>До</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="200 000"
                    placeholderTextColor={colors.liquidSilver}
                    value={filters.salaryMax}
                    onChangeText={(text) =>
                      setFilters({ ...filters, salaryMax: text })
                    }
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text style={styles.filterSectionTitle}>Город</Text>
              <TextInput
                style={styles.input}
                placeholder="Москва, Санкт-Петербург..."
                placeholderTextColor={colors.liquidSilver}
                value={filters.city}
                onChangeText={(text) => setFilters({ ...filters, city: text })}
              />

              <Text style={styles.filterSectionTitle}>Опыт работы</Text>
              <View style={styles.chipGroup}>
                {['any', 'no_experience', '1-3', '3-6', '6+'].map((exp) => (
                  <TouchableOpacity
                    key={exp}
                    style={[
                      styles.chip,
                      filters.experience === exp && styles.chipActive,
                    ]}
                    onPress={() => setFilters({ ...filters, experience: exp })}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        filters.experience === exp && styles.chipTextActive,
                      ]}
                    >
                      {exp === 'any'
                        ? 'Любой'
                        : exp === 'no_experience'
                        ? 'Без опыта'
                        : `${exp} лет`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterSectionTitle}>График работы</Text>
              <View style={styles.chipGroup}>
                {['any', 'full_time', 'part_time', 'remote', 'flexible'].map(
                  (schedule) => (
                    <TouchableOpacity
                      key={schedule}
                      style={[
                        styles.chip,
                        filters.schedule === schedule && styles.chipActive,
                      ]}
                      onPress={() =>
                        setFilters({ ...filters, schedule: schedule })
                      }
                    >
                      <Text
                        style={[
                          styles.chipText,
                          filters.schedule === schedule && styles.chipTextActive,
                        ]}
                      >
                        {schedule === 'any'
                          ? 'Любой'
                          : schedule === 'full_time'
                          ? 'Полный день'
                          : schedule === 'part_time'
                          ? 'Частичная'
                          : schedule === 'remote'
                          ? 'Удаленка'
                          : 'Гибкий'}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>

              <View style={styles.filterActions}>
                <GlassButton
                  title="СБРОСИТЬ"
                  variant="ghost"
                  onPress={() =>
                    setFilters({
                      salaryMin: '',
                      salaryMax: '',
                      city: '',
                      experience: 'any',
                      schedule: 'any',
                    })
                  }
                />
                <GlassButton
                  title="ПРИМЕНИТЬ"
                  variant="primary"
                  onPress={handleSearch}
                  style={styles.applyButton}
                />
              </View>
            </GlassCard>
          </Animated.View>
        )}

        {/* Search Results */}
        {results.length > 0 ? (
          <View style={styles.results}>
            <Text style={styles.resultsTitle}>
              Найдено: {results.length} вакансий
            </Text>
            {results.map((vacancy) => (
              <GlassCard key={vacancy.id} style={styles.resultCard}>
                {/* TODO: Vacancy card content */}
              </GlassCard>
            ))}
          </View>
        ) : searchQuery.length > 0 ? (
          <View style={styles.emptyState}>
            <Icon name="briefcase-search" size={64} color={colors.liquidSilver} />
            <Text style={styles.emptyStateText}>
              Начните поиск вакансии
            </Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Search Button (floating) */}
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Icon name="magnify" size={24} color={colors.softWhite} />
      </TouchableOpacity>
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
  header: {
    marginBottom: sizes.xl,
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
  searchCard: {
    marginBottom: sizes.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.sm,
  },
  searchInput: {
    ...typography.body,
    color: colors.softWhite,
    flex: 1,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.sm,
    marginBottom: sizes.lg,
  },
  filterToggleText: {
    ...typography.bodyMedium,
    color: colors.platinumSilver,
  },
  filtersCard: {
    marginBottom: sizes.lg,
  },
  filterSectionTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.softWhite,
    marginTop: sizes.md,
    marginBottom: sizes.sm,
  },
  salaryInputs: {
    flexDirection: 'row',
    gap: sizes.md,
  },
  salaryInputWrapper: {
    flex: 1,
  },
  inputLabel: {
    ...typography.caption,
    color: colors.liquidSilver,
    marginBottom: sizes.xs,
    textTransform: 'uppercase',
  },
  input: {
    ...typography.body,
    color: colors.softWhite,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: sizes.radiusMedium,
    paddingHorizontal: sizes.md,
    paddingVertical: sizes.sm,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: sizes.sm,
    marginBottom: sizes.md,
  },
  chip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: sizes.radiusMedium,
    paddingHorizontal: sizes.md,
    paddingVertical: sizes.sm,
  },
  chipActive: {
    backgroundColor: 'rgba(232, 232, 237, 0.2)',
    borderColor: colors.platinumSilver,
  },
  chipText: {
    ...typography.caption,
    color: colors.liquidSilver,
  },
  chipTextActive: {
    color: colors.platinumSilver,
    fontWeight: '600',
  },
  filterActions: {
    flexDirection: 'row',
    gap: sizes.md,
    marginTop: sizes.lg,
  },
  applyButton: {
    flex: 1,
  },
  results: {
    gap: sizes.md,
  },
  resultsTitle: {
    ...typography.h3,
    color: colors.softWhite,
    marginBottom: sizes.sm,
  },
  resultCard: {
    marginBottom: sizes.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sizes.xxl * 2,
  },
  emptyStateText: {
    ...typography.body,
    color: colors.liquidSilver,
    marginTop: sizes.lg,
  },
  searchButton: {
    position: 'absolute',
    bottom: sizes.lg,
    right: sizes.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.platinumSilver,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.platinumSilver,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    shadowOpacity: 0.5,
    elevation: 8,
  },
});
