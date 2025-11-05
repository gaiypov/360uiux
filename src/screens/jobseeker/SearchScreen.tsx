/**
 * 360° РАБОТА - Revolut Ultra Edition
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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GlassCard, GlassButton } from '@/components/ui';
import { colors, typography, sizes } from '@/constants';
import { Vacancy } from '@/types';

export function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    salaryMin: '',
    salaryMax: '',
    city: '',
    experience: 'any',
    schedule: 'any',
  });
  const [results, setResults] = useState<Vacancy[]>([]);

  const handleSearch = () => {
    // TODO: Implement search with filters
    console.log('Searching:', searchQuery, filters);
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

        {/* Search Input */}
        <GlassCard style={styles.searchCard}>
          <View style={styles.searchInputContainer}>
            <Icon name="magnify" size={24} color={colors.liquidSilver} />
            <TextInput
              style={styles.searchInput}
              placeholder="Должность, компания..."
              placeholderTextColor={colors.liquidSilver}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close-circle" size={20} color={colors.liquidSilver} />
              </TouchableOpacity>
            )}
          </View>
        </GlassCard>

        {/* Filter Toggle */}
        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Icon
            name={showFilters ? 'filter-minus' : 'filter-plus'}
            size={20}
            color={colors.ultraViolet}
          />
          <Text style={styles.filterToggleText}>
            {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
          </Text>
        </TouchableOpacity>

        {/* Filters */}
        {showFilters && (
          <Animated.View entering={FadeInDown.duration(300)}>
            <GlassCard style={styles.filtersCard}>
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
    color: colors.ultraViolet,
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
    backgroundColor: 'rgba(142, 127, 255, 0.2)',
    borderColor: colors.ultraViolet,
  },
  chipText: {
    ...typography.caption,
    color: colors.liquidSilver,
  },
  chipTextActive: {
    color: colors.ultraViolet,
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
    backgroundColor: colors.ultraViolet,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.ultraViolet,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    shadowOpacity: 0.5,
    elevation: 8,
  },
});
