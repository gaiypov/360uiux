/**
 * 360° РАБОТА - ULTRA EDITION
 * Create Vacancy Screen (Employer)
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
import { GlassCard, GlassButton } from '@/components/ui';
import { colors, metalGradients, typography, sizes } from "@/constants";
import { useToastStore } from '@/stores';
import { api } from '@/services/api';

export function CreateVacancyScreen({ navigation }: any) {
  const { showToast } = useToastStore();
  const [form, setForm] = useState({
    title: '',
    salaryMin: '',
    salaryMax: '',
    city: '',
    metro: '',
    description: '',
    requirements: '',
    benefits: '',
    experience: 'any',
    schedule: 'full_time',
  });
  const [videoUrl, setVideoUrl] = useState('');

  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    // Validation
    if (!form.title || !form.salaryMin || !form.city) {
      showToast('error', 'Заполните обязательные поля');
      return;
    }

    if (!videoUrl) {
      showToast('error', 'Добавьте видео вакансии');
      return;
    }

    setLoading(true);

    try {
      // Create vacancy via API
      const result = await api.createVacancy({
        title: form.title,
        profession: form.title, // Using title as profession for now
        video_url: videoUrl,
        salary_min: parseInt(form.salaryMin) || undefined,
        salary_max: parseInt(form.salaryMax) || undefined,
        currency: 'RUB',
        city: form.city,
        metro: form.metro || undefined,
        schedule: form.schedule,
        requires_experience: form.experience !== 'any',
        benefits: form.benefits || undefined,
        requirements: form.requirements || undefined,
      });

      if (result.success) {
        showToast('success', '✅ Вакансия создана!');
        showToast('info', 'Не забудьте опубликовать вакансию');
        navigation.goBack();
      }
    } catch (error: any) {
      console.error('Error creating vacancy:', error);
      showToast('error', error.message || 'Ошибка при создании вакансии');
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={colors.softWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Новая вакансия</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Video Upload */}
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Видео-презентация *</Text>
          <Text style={styles.sectionHint}>
            Запишите короткое видео о вакансии (макс. 60 сек)
          </Text>

          <TouchableOpacity style={styles.videoUpload}>
            <Icon name="video-plus" size={48} color={colors.platinumSilver} />
            <Text style={styles.videoUploadText}>
              {videoUrl ? 'Видео загружено' : 'Загрузить видео'}
            </Text>
          </TouchableOpacity>
        </GlassCard>

        {/* Basic Info */}
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Основная информация</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Название вакансии *</Text>
            <TextInput
              style={styles.input}
              placeholder="Frontend Developer"
              placeholderTextColor={colors.liquidSilver}
              value={form.title}
              onChangeText={(text) => updateForm('title', text)}
            />
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Зарплата от *</Text>
              <TextInput
                style={styles.input}
                placeholder="100 000"
                placeholderTextColor={colors.liquidSilver}
                value={form.salaryMin}
                onChangeText={(text) => updateForm('salaryMin', text)}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>До</Text>
              <TextInput
                style={styles.input}
                placeholder="200 000"
                placeholderTextColor={colors.liquidSilver}
                value={form.salaryMax}
                onChangeText={(text) => updateForm('salaryMax', text)}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Город *</Text>
            <TextInput
              style={styles.input}
              placeholder="Москва"
              placeholderTextColor={colors.liquidSilver}
              value={form.city}
              onChangeText={(text) => updateForm('city', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Метро</Text>
            <TextInput
              style={styles.input}
              placeholder="Площадь Революции"
              placeholderTextColor={colors.liquidSilver}
              value={form.metro}
              onChangeText={(text) => updateForm('metro', text)}
            />
          </View>
        </GlassCard>

        {/* Details */}
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Детали</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Опыт работы</Text>
            <View style={styles.chipGroup}>
              {[
                { key: 'any', label: 'Любой' },
                { key: 'no_experience', label: 'Без опыта' },
                { key: '1-3', label: '1-3 года' },
                { key: '3-6', label: '3-6 лет' },
                { key: '6+', label: '6+ лет' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.chip,
                    form.experience === item.key && styles.chipActive,
                  ]}
                  onPress={() => updateForm('experience', item.key)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      form.experience === item.key && styles.chipTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>График работы</Text>
            <View style={styles.chipGroup}>
              {[
                { key: 'full_time', label: 'Полный день' },
                { key: 'part_time', label: 'Частичная' },
                { key: 'remote', label: 'Удаленка' },
                { key: 'flexible', label: 'Гибкий' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.chip,
                    form.schedule === item.key && styles.chipActive,
                  ]}
                  onPress={() => updateForm('schedule', item.key)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      form.schedule === item.key && styles.chipTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Описание вакансии</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Опишите вакансию..."
              placeholderTextColor={colors.liquidSilver}
              value={form.description}
              onChangeText={(text) => updateForm('description', text)}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Требования</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Опыт работы с React, TypeScript..."
              placeholderTextColor={colors.liquidSilver}
              value={form.requirements}
              onChangeText={(text) => updateForm('requirements', text)}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Что мы предлагаем</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="ДМС, обучение, офис в центре..."
              placeholderTextColor={colors.liquidSilver}
              value={form.benefits}
              onChangeText={(text) => updateForm('benefits', text)}
              multiline
              numberOfLines={3}
            />
          </View>
        </GlassCard>
      </ScrollView>

      {/* Create Button */}
      <View style={styles.createContainer}>
        <GlassButton
          title="ОПУБЛИКОВАТЬ ВАКАНСИЮ"
          variant="primary"
          onPress={handleCreate}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBlack,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sizes.md,
    paddingTop: 50,
    paddingBottom: sizes.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glassBackground,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.softWhite,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: sizes.lg,
    paddingBottom: 120,
  },
  section: {
    marginBottom: sizes.md,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.softWhite,
    marginBottom: sizes.sm,
  },
  sectionHint: {
    ...typography.caption,
    color: colors.liquidSilver,
    marginBottom: sizes.md,
  },
  videoUpload: {
    height: 200,
    borderWidth: 2,
    borderColor: colors.glassBorder,
    borderRadius: sizes.radiusLarge,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sizes.sm,
  },
  videoUploadText: {
    ...typography.bodyMedium,
    color: colors.platinumSilver,
  },
  inputGroup: {
    marginBottom: sizes.md,
  },
  inputRow: {
    flexDirection: 'row',
    gap: sizes.md,
  },
  label: {
    ...typography.caption,
    color: colors.liquidSilver,
    marginBottom: sizes.sm,
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
  textArea: {
    paddingTop: sizes.md,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: sizes.sm,
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
  createContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: sizes.lg,
    backgroundColor: colors.graphiteGray,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
});
