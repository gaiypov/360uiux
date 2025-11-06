/**
 * 360° РАБОТА - ULTRA EDITION
 * Create Vacancy Screen V2 (Employer) - 3 Steps
 *
 * Шаг 1/3: Информация
 * Шаг 2/3: Видео
 * Шаг 3/3: Публикация
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
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { GlassCard, GlassButton } from '@/components/ui';
import { colors, metalGradients, typography, sizes } from '@/constants';
import { useToastStore } from '@/stores';

interface CreateVacancyScreenV2Props {
  navigation: any;
}

type Step = 1 | 2 | 3;

export function CreateVacancyScreenV2({ navigation }: CreateVacancyScreenV2Props) {
  const { showToast } = useToastStore();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);

  // Form state
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

  // Video state
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);

  // Priority moderation
  const [priorityModeration, setPriorityModeration] = useState(false);

  const updateForm = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Валидация шага 1
      if (!form.title || !form.salaryMin || !form.city) {
        showToast('error', 'Заполните обязательные поля');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Валидация шага 2
      if (!videoPath) {
        showToast('error', 'Запишите видео вакансии');
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    } else {
      navigation.goBack();
    }
  };

  const handleRecordVideo = () => {
    navigation.navigate('VideoRecord', {
      type: 'vacancy',
      maxDuration: 180, // 3 минуты для вакансий
      onVideoRecorded: (path: string, duration: number) => {
        setVideoPath(path);
        setVideoDuration(duration);
        showToast('success', 'Видео записано!');
      },
    });
  };

  const handlePublish = async () => {
    if (!videoPath) {
      showToast('error', 'Видео не записано');
      return;
    }

    setLoading(true);
    try {
      // TODO: Загрузка видео на сервер через API
      // const result = await apiService.createVacancy(form, videoPath, priorityModeration);

      // Имитация загрузки
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (priorityModeration) {
        showToast('success', '🚀 Вакансия опубликована!');
        showToast('info', '⚡ Приоритетная модерация: < 30 минут');
      } else {
        showToast('success', '🎉 Вакансия отправлена на модерацию!');
        showToast('info', '⏳ Обычно модерация занимает 1-2 часа');
      }

      // Возврат к списку вакансий
      navigation.navigate('EmployerDashboard');
    } catch (error: any) {
      console.error('Error publishing vacancy:', error);
      showToast('error', 'Ошибка при публикации вакансии');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, label: 'Информация' },
      { number: 2, label: 'Видео' },
      { number: 3, label: 'Публикация' },
    ];

    return (
      <View style={styles.stepIndicatorContainer}>
        {steps.map((step, index) => (
          <View key={step.number} style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                currentStep >= step.number && styles.stepCircleActive,
              ]}
            >
              {currentStep > step.number ? (
                <Icon name="check" size={16} color={colors.primaryBlack} />
              ) : (
                <Text
                  style={[
                    styles.stepNumber,
                    currentStep >= step.number && styles.stepNumberActive,
                  ]}
                >
                  {step.number}
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.stepLabel,
                currentStep >= step.number && styles.stepLabelActive,
              ]}
            >
              {step.label}
            </Text>
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.stepConnector,
                  currentStep > step.number && styles.stepConnectorActive,
                ]}
              />
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderStep1 = () => (
    <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      <GlassCard style={styles.section}>
        <View style={styles.iconHeader}>
          <LinearGradient
            colors={metalGradients.platinum}
            style={styles.iconCircle}
          >
            <Icon name="briefcase-edit" size={32} color={colors.primaryBlack} />
          </LinearGradient>
        </View>

        <Text style={styles.sectionTitle}>Основная информация</Text>
        <Text style={styles.sectionHint}>
          Заполните основные данные о вакансии
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Название вакансии *</Text>
          <TextInput
            style={styles.input}
            placeholder="Официант"
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
              placeholder="65 000"
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
              placeholder="85 000"
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

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Опыт работы</Text>
          <View style={styles.chipGroup}>
            {[
              { key: 'any', label: 'Любой' },
              { key: 'no_experience', label: 'Без опыта' },
              { key: '1-3', label: '1-3 года' },
              { key: '3-6', label: '3-6 лет' },
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
      </GlassCard>
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      <GlassCard style={styles.section}>
        <View style={styles.iconHeader}>
          <LinearGradient
            colors={metalGradients.platinum}
            style={styles.iconCircle}
          >
            <Icon name="video" size={32} color={colors.primaryBlack} />
          </LinearGradient>
        </View>

        <Text style={styles.sectionTitle}>Видео-вакансия</Text>
        <Text style={styles.sectionHint}>
          Запишите видео о вакансии (30-180 сек){'\n'}
          Расскажите о работе, условиях и компании.
        </Text>

        {videoPath ? (
          <View style={styles.videoPreview}>
            <View style={styles.videoPreviewBox}>
              <Icon name="check-circle" size={64} color={colors.success} />
              <Text style={styles.videoPreviewText}>Видео записано</Text>
              <Text style={styles.videoPreviewDuration}>
                {Math.floor(videoDuration / 60)}:
                {(videoDuration % 60).toString().padStart(2, '0')}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.retakeButton}
              onPress={handleRecordVideo}
            >
              <Icon name="refresh" size={20} color={colors.platinumSilver} />
              <Text style={styles.retakeText}>Переснять</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.recordButton}
            onPress={handleRecordVideo}
          >
            <LinearGradient
              colors={metalGradients.platinum}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.recordGradient}
            >
              <Icon name="video-plus" size={48} color={colors.primaryBlack} />
              <Text style={styles.recordButtonText}>Записать видео</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <View style={styles.tipsBox}>
          <Text style={styles.tipsTitle}>💡 Советы для записи:</Text>
          <Text style={styles.tipText}>
            • Расскажите о вакансии и условиях
          </Text>
          <Text style={styles.tipText}>
            • Покажите офис или рабочее место
          </Text>
          <Text style={styles.tipText}>• Будьте дружелюбны и открыты</Text>
          <Text style={styles.tipText}>
            • Опишите, что ждет нового сотрудника
          </Text>
        </View>
      </GlassCard>
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      <GlassCard style={styles.section}>
        <View style={styles.iconHeader}>
          <LinearGradient
            colors={metalGradients.platinum}
            style={styles.iconCircle}
          >
            <Icon name="check-circle" size={32} color={colors.primaryBlack} />
          </LinearGradient>
        </View>

        <Text style={styles.sectionTitle}>Предпросмотр</Text>
        <Text style={styles.sectionHint}>Проверьте данные перед публикацией</Text>

        <View style={styles.previewRow}>
          <Icon name="briefcase" size={20} color={colors.liquidSilver} />
          <Text style={styles.previewLabel}>Вакансия:</Text>
          <Text style={styles.previewValue}>{form.title}</Text>
        </View>

        <View style={styles.previewRow}>
          <Icon name="currency-rub" size={20} color={colors.liquidSilver} />
          <Text style={styles.previewLabel}>Зарплата:</Text>
          <Text style={styles.previewValue}>
            {form.salaryMin}
            {form.salaryMax ? ` - ${form.salaryMax}` : '+'} ₽
          </Text>
        </View>

        <View style={styles.previewRow}>
          <Icon name="map-marker" size={20} color={colors.liquidSilver} />
          <Text style={styles.previewLabel}>Город:</Text>
          <Text style={styles.previewValue}>{form.city}</Text>
        </View>

        {form.metro && (
          <View style={styles.previewRow}>
            <Icon name="subway-variant" size={20} color={colors.liquidSilver} />
            <Text style={styles.previewLabel}>Метро:</Text>
            <Text style={styles.previewValue}>{form.metro}</Text>
          </View>
        )}

        <View style={styles.previewRow}>
          <Icon name="video" size={20} color={colors.liquidSilver} />
          <Text style={styles.previewLabel}>Видео:</Text>
          <Text style={styles.previewValue}>
            {Math.floor(videoDuration / 60)}:
            {(videoDuration % 60).toString().padStart(2, '0')}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Приоритетная модерация */}
        <TouchableOpacity
          style={styles.priorityOption}
          onPress={() => setPriorityModeration(!priorityModeration)}
        >
          <View style={styles.priorityInfo}>
            <View style={styles.priorityIconBox}>
              <Icon name="lightning-bolt" size={24} color={colors.warning} />
            </View>
            <View style={styles.priorityTextBox}>
              <Text style={styles.priorityTitle}>Приоритетная модерация</Text>
              <Text style={styles.priorityDescription}>
                Ускоренная проверка за 500 ₽{'\n'}
                SLA: &lt; 30 минут
              </Text>
            </View>
          </View>
          <Switch
            value={priorityModeration}
            onValueChange={setPriorityModeration}
            trackColor={{
              false: 'rgba(255,255,255,0.1)',
              true: colors.warning,
            }}
            thumbColor={priorityModeration ? colors.softWhite : colors.liquidSilver}
          />
        </TouchableOpacity>

        <View style={styles.moderationNotice}>
          <Icon
            name="clock-outline"
            size={24}
            color={priorityModeration ? colors.warning : colors.info}
          />
          <View style={styles.moderationTextBox}>
            <Text style={styles.moderationTitle}>
              {priorityModeration ? '⚡ Приоритетная модерация' : '⏳ Стандартная модерация'}
            </Text>
            <Text style={styles.moderationText}>
              {priorityModeration
                ? 'Ваша вакансия будет проверена в течение 30 минут'
                : 'После публикации вакансия пройдёт модерацию. Обычно это занимает 1-2 часа в рабочее время.'}
            </Text>
          </View>
        </View>

        {priorityModeration && (
          <View style={styles.priceNotice}>
            <Icon name="information" size={20} color={colors.warning} />
            <Text style={styles.priceText}>
              С вашего кошелька будет списано 500 ₽
            </Text>
          </View>
        )}
      </GlassCard>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Icon name="arrow-left" size={24} color={colors.softWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Новая вакансия</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Content */}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}

      {/* Footer Buttons */}
      <View style={styles.footer}>
        {currentStep < 3 ? (
          <GlassButton
            title="Далее →"
            onPress={handleNext}
            variant="primary"
            style={styles.nextButton}
          />
        ) : (
          <GlassButton
            title={loading ? 'Публикация...' : '🚀 Опубликовать'}
            onPress={handlePublish}
            variant="primary"
            disabled={loading}
            loading={loading}
            style={styles.publishButton}
          />
        )}
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
    paddingHorizontal: sizes.medium,
    paddingVertical: sizes.medium,
    paddingTop: sizes.large + sizes.small,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.softWhite,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sizes.large,
    paddingBottom: sizes.medium,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: sizes.xSmall,
  },
  stepCircleActive: {
    backgroundColor: colors.platinumSilver,
  },
  stepNumber: {
    ...typography.caption,
    color: colors.liquidSilver,
    fontWeight: '600',
  },
  stepNumberActive: {
    color: colors.primaryBlack,
  },
  stepLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.liquidSilver,
  },
  stepLabelActive: {
    color: colors.platinumSilver,
    fontWeight: '600',
  },
  stepConnector: {
    position: 'absolute',
    top: 16,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    zIndex: -1,
  },
  stepConnectorActive: {
    backgroundColor: colors.platinumSilver,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: sizes.medium,
    paddingBottom: sizes.xxxLarge,
  },
  section: {
    marginBottom: sizes.medium,
  },
  iconHeader: {
    alignItems: 'center',
    marginBottom: sizes.medium,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.softWhite,
    marginBottom: sizes.small,
    textAlign: 'center',
  },
  sectionHint: {
    ...typography.body,
    color: colors.liquidSilver,
    marginBottom: sizes.large,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: sizes.medium,
  },
  inputRow: {
    flexDirection: 'row',
    gap: sizes.medium,
  },
  label: {
    ...typography.caption,
    color: colors.liquidSilver,
    marginBottom: sizes.xSmall,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    ...typography.body,
    color: colors.softWhite,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: sizes.medium,
    paddingVertical: sizes.medium,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: sizes.small,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: sizes.medium,
    paddingVertical: sizes.small,
  },
  chipActive: {
    backgroundColor: 'rgba(232,232,237,0.2)',
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
  videoPreview: {
    marginVertical: sizes.large,
  },
  videoPreviewBox: {
    backgroundColor: 'rgba(0,255,0,0.1)',
    borderWidth: 2,
    borderColor: colors.success,
    borderRadius: 16,
    padding: sizes.xxLarge,
    alignItems: 'center',
  },
  videoPreviewText: {
    ...typography.h3,
    color: colors.success,
    marginTop: sizes.medium,
  },
  videoPreviewDuration: {
    ...typography.body,
    color: colors.liquidSilver,
    marginTop: sizes.small,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: sizes.medium,
    gap: sizes.small,
  },
  retakeText: {
    ...typography.body,
    color: colors.platinumSilver,
  },
  recordButton: {
    marginVertical: sizes.large,
    borderRadius: 16,
    overflow: 'hidden',
  },
  recordGradient: {
    padding: sizes.xxLarge,
    alignItems: 'center',
    gap: sizes.medium,
  },
  recordButtonText: {
    ...typography.h3,
    color: colors.primaryBlack,
    fontWeight: '700',
  },
  tipsBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: sizes.medium,
    marginTop: sizes.medium,
  },
  tipsTitle: {
    ...typography.body,
    color: colors.softWhite,
    fontWeight: '600',
    marginBottom: sizes.small,
  },
  tipText: {
    ...typography.caption,
    color: colors.liquidSilver,
    marginTop: sizes.xSmall,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: sizes.small,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    gap: sizes.small,
  },
  previewLabel: {
    ...typography.body,
    color: colors.liquidSilver,
    flex: 1,
  },
  previewValue: {
    ...typography.body,
    color: colors.softWhite,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: sizes.large,
  },
  priorityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,193,7,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,193,7,0.3)',
    borderRadius: 12,
    padding: sizes.medium,
    marginBottom: sizes.medium,
  },
  priorityInfo: {
    flexDirection: 'row',
    flex: 1,
    gap: sizes.medium,
  },
  priorityIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,193,7,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityTextBox: {
    flex: 1,
  },
  priorityTitle: {
    ...typography.body,
    color: colors.warning,
    fontWeight: '700',
    marginBottom: sizes.xSmall,
  },
  priorityDescription: {
    ...typography.caption,
    color: colors.liquidSilver,
  },
  moderationNotice: {
    flexDirection: 'row',
    backgroundColor: 'rgba(100,100,100,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: sizes.medium,
    gap: sizes.medium,
  },
  moderationTextBox: {
    flex: 1,
  },
  moderationTitle: {
    ...typography.body,
    color: colors.softWhite,
    fontWeight: '700',
    marginBottom: sizes.xSmall,
  },
  moderationText: {
    ...typography.caption,
    color: colors.liquidSilver,
  },
  priceNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,193,7,0.05)',
    borderRadius: 8,
    padding: sizes.small,
    marginTop: sizes.small,
    gap: sizes.small,
  },
  priceText: {
    ...typography.caption,
    color: colors.warning,
  },
  footer: {
    padding: sizes.medium,
    paddingBottom: sizes.large,
  },
  nextButton: {
    width: '100%',
  },
  publishButton: {
    width: '100%',
  },
});
