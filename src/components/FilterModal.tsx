/**
 * 360° РАБОТА - ULTRA EDITION
 * Filter Modal Component
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { GlassCard } from './ui';
import { colors, metalGradients, typography, sizes } from '@/constants';
import { haptics } from '@/utils/haptics';

export interface FilterValues {
  salaryMin?: number;
  salaryMax?: number;
  cities: string[];
  experience: string[];
  employment: string[];
  schedule: string[];
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterValues) => void;
  initialFilters?: FilterValues;
}

const CITIES = ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург'];
const EXPERIENCE = ['Без опыта', 'От 1 года', 'От 3 лет', 'От 5 лет'];
const EMPLOYMENT = ['Полная занятость', 'Частичная занятость', 'Проектная работа', 'Стажировка'];
const SCHEDULE = ['Полный день', 'Гибкий график', 'Удаленная работа', 'Вахтовый метод'];

export function FilterModal({ visible, onClose, onApply, initialFilters }: FilterModalProps) {
  const [filters, setFilters] = useState<FilterValues>(
    initialFilters || {
      cities: [],
      experience: [],
      employment: [],
      schedule: [],
    }
  );

  const [salaryMinText, setSalaryMinText] = useState(
    initialFilters?.salaryMin?.toString() || ''
  );
  const [salaryMaxText, setSalaryMaxText] = useState(
    initialFilters?.salaryMax?.toString() || ''
  );

  const toggleFilter = (category: keyof FilterValues, value: string) => {
    haptics.light();
    const currentValues = filters[category] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    setFilters({ ...filters, [category]: newValues });
  };

  const handleApply = () => {
    haptics.medium();
    const appliedFilters = {
      ...filters,
      salaryMin: salaryMinText ? parseInt(salaryMinText) : undefined,
      salaryMax: salaryMaxText ? parseInt(salaryMaxText) : undefined,
    };
    onApply(appliedFilters);
    onClose();
  };

  const handleReset = () => {
    haptics.light();
    setFilters({
      cities: [],
      experience: [],
      employment: [],
      schedule: [],
    });
    setSalaryMinText('');
    setSalaryMaxText('');
  };

  const activeFiltersCount =
    filters.cities.length +
    filters.experience.length +
    filters.employment.length +
    filters.schedule.length +
    (salaryMinText ? 1 : 0) +
    (salaryMaxText ? 1 : 0);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View entering={FadeIn.duration(200)} style={styles.backdrop}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            activeOpacity={1}
          />
        </Animated.View>

        <Animated.View entering={SlideInDown.duration(300)} style={styles.modalContent}>
          <GlassCard variant="dark" style={styles.modal} noPadding>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Icon name="filter-variant" size={24} color={colors.platinumSilver} />
                <Text style={styles.headerTitle}>Фильтры</Text>
                {activeFiltersCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{activeFiltersCount}</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity onPress={onClose}>
                <Icon name="close" size={24} color={colors.softWhite} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
            >
              {/* Salary Range */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Зарплата (₽)</Text>
                <View style={styles.salaryRow}>
                  <View style={styles.salaryInput}>
                    <Text style={styles.salaryLabel}>От</Text>
                    <TextInput
                      style={styles.input}
                      value={salaryMinText}
                      onChangeText={setSalaryMinText}
                      placeholder="0"
                      placeholderTextColor={colors.graphiteSilver}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.salaryDivider} />
                  <View style={styles.salaryInput}>
                    <Text style={styles.salaryLabel}>До</Text>
                    <TextInput
                      style={styles.input}
                      value={salaryMaxText}
                      onChangeText={setSalaryMaxText}
                      placeholder="∞"
                      placeholderTextColor={colors.graphiteSilver}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>

              {/* Cities */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Город</Text>
                <View style={styles.chipsContainer}>
                  {CITIES.map((city) => (
                    <FilterChip
                      key={city}
                      label={city}
                      selected={filters.cities.includes(city)}
                      onPress={() => toggleFilter('cities', city)}
                    />
                  ))}
                </View>
              </View>

              {/* Experience */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Опыт работы</Text>
                <View style={styles.chipsContainer}>
                  {EXPERIENCE.map((exp) => (
                    <FilterChip
                      key={exp}
                      label={exp}
                      selected={filters.experience.includes(exp)}
                      onPress={() => toggleFilter('experience', exp)}
                    />
                  ))}
                </View>
              </View>

              {/* Employment */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Тип занятости</Text>
                <View style={styles.chipsContainer}>
                  {EMPLOYMENT.map((emp) => (
                    <FilterChip
                      key={emp}
                      label={emp}
                      selected={filters.employment.includes(emp)}
                      onPress={() => toggleFilter('employment', emp)}
                    />
                  ))}
                </View>
              </View>

              {/* Schedule */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>График работы</Text>
                <View style={styles.chipsContainer}>
                  {SCHEDULE.map((sched) => (
                    <FilterChip
                      key={sched}
                      label={sched}
                      selected={filters.schedule.includes(sched)}
                      onPress={() => toggleFilter('schedule', sched)}
                    />
                  ))}
                </View>
              </View>

              <View style={{ height: sizes.xxl }} />
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleReset}
                activeOpacity={0.7}
              >
                <Icon name="refresh" size={20} color={colors.chromeSilver} />
                <Text style={styles.resetText}>Сбросить</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApply}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={metalGradients.platinum}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.applyGradient}
                >
                  <Icon name="check" size={20} color={colors.graphiteBlack} />
                  <Text style={styles.applyText}>Применить</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </Animated.View>
      </View>
    </Modal>
  );
}

function FilterChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {selected && <Icon name="check" size={16} color={colors.graphiteBlack} />}
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    maxHeight: '90%',
  },
  modal: {
    borderTopLeftRadius: sizes.radiusXL,
    borderTopRightRadius: sizes.radiusXL,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sizes.lg,
    paddingVertical: sizes.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.steelGray,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.sm,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.softWhite,
  },
  badge: {
    backgroundColor: colors.platinumSilver,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    ...typography.micro,
    color: colors.graphiteBlack,
    fontWeight: '700',
  },
  scrollView: {
    maxHeight: 500,
  },
  section: {
    paddingHorizontal: sizes.lg,
    paddingVertical: sizes.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.chromeSilver,
    marginBottom: sizes.md,
  },
  salaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.md,
  },
  salaryInput: {
    flex: 1,
  },
  salaryLabel: {
    ...typography.caption,
    color: colors.chromeSilver,
    marginBottom: sizes.xs,
  },
  input: {
    ...typography.h4,
    color: colors.softWhite,
    backgroundColor: colors.slateGray,
    borderRadius: sizes.radiusMedium,
    paddingHorizontal: sizes.md,
    paddingVertical: sizes.sm,
  },
  salaryDivider: {
    width: 20,
    height: 2,
    backgroundColor: colors.steelGray,
    marginTop: 18,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: sizes.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: sizes.md,
    paddingVertical: sizes.sm,
    backgroundColor: colors.slateGray,
    borderRadius: sizes.radiusSmall,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: colors.platinumSilver,
    borderColor: colors.platinumSilver,
  },
  chipText: {
    ...typography.caption,
    color: colors.chromeSilver,
  },
  chipTextSelected: {
    color: colors.graphiteBlack,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: sizes.md,
    paddingHorizontal: sizes.lg,
    paddingVertical: sizes.lg,
    borderTopWidth: 1,
    borderTopColor: colors.steelGray,
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sizes.xs,
    paddingVertical: sizes.md,
    backgroundColor: colors.carbonGray,
    borderRadius: sizes.radiusMedium,
  },
  resetText: {
    ...typography.bodyMedium,
    color: colors.chromeSilver,
  },
  applyButton: {
    flex: 2,
    borderRadius: sizes.radiusMedium,
    overflow: 'hidden',
  },
  applyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sizes.xs,
    paddingVertical: sizes.md,
  },
  applyText: {
    ...typography.bodyMedium,
    color: colors.graphiteBlack,
    fontWeight: '700',
  },
});
