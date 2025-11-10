/**
 * 360° РАБОТА - ULTRA EDITION
 * Create Video Resume Screen (Job Seeker)
 *
 * 3 шага:
 * 1. Основная информация
 * 2. Запись видео
 * 3. Предпросмотр и публикация
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { GlassCard, GlassButton } from '@/components/ui';
import { colors, metalGradients, typography, sizes } from '@/constants';
import { useToastStore } from '@/stores';
import { api } from '@/services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CreateResumeScreenProps {
  navigation: any;
}

type Step = 1 | 2 | 3;

export function CreateResumeScreen({ navigation }: CreateResumeScreenProps) {
  const { showToast } = useToastStore();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: '',
    profession: '',
    city: '',
    salaryExpected: '',
    about: '',
  });

  // Video state
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);

  const updateForm = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Валидация шага 1
      if (!form.name || !form.profession || !form.city) {
        showToast('error', 'Заполните обязательные поля');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Architecture v3: Видео ОПЦИОНАЛЬНО
      setCurrentStep(3);
    }
  };

  const handleSkipVideo = () => {
    // Architecture v3: Пропустить видео и перейти к публикации
    setCurrentStep(3);
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
      type: 'resume',
      maxDuration: 120, // 2 минуты для резюме
      onVideoRecorded: (path: string, duration: number) => {
        setVideoPath(path);
        setVideoDuration(duration);
        showToast('success', 'Видео записано!');
      },
    });
  };

  const handlePublish = async () => {
    setLoading(true);
    try {
      let videoData = null;

      // Upload video to api.video if exists
      if (videoPath) {
        showToast('info', '⏳ Загружаем видео...');

        const { VideoUploadService } = require('../../services/VideoUploadService');
        const videoTitle = `Resume - ${form.name} - ${form.profession}`;

        videoData = await VideoUploadService.uploadResumeVideo(
          videoPath,
          videoTitle,
          (progress) => {
            // Progress callback (could show progress bar)
            console.log(`Upload progress: ${progress.percentage.toFixed(1)}%`);
          }
        );

        console.log('Video uploaded:', videoData);
        showToast('success', '✅ Видео загружено!');
      }

      // Send resume data to backend with video metadata
      await api.createResume({
        ...form,
        videoId: videoData?.videoId,
        videoUrl: videoData?.playerUrl,
        hlsUrl: videoData?.hlsUrl,
        thumbnailUrl: videoData?.thumbnailUrl,
      });

      if (videoPath) {
        // Architecture v3: Private video with light AI moderation
        showToast('success', '🎉 Резюме с видео опубликовано!');
        showToast('info', '🤖 Видео проходит быструю AI-проверку');
      } else {
        showToast('success', '🎉 Резюме опубликовано!');
      }

      // Navigate back
      navigation.goBack();
    } catch (error: any) {
      console.error('Error publishing resume:', error);
      showToast('error', error.response?.data?.message || 'Ошибка при публикации резюме');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    return (
      <View style={styles.stepIndicator}>
        {[1, 2, 3].map((step) => (
          <View key={step} style={styles.stepRow}>
            <View
              style={[
                styles.stepCircle,
                currentStep >= step && styles.stepCircleActive,
              ]}
            >
              {currentStep > step ? (
                <Icon name="check" size={16} color={colors.primaryBlack} />
              ) : (
                <Text style={styles.stepNumber}>{step}</Text>
              )}
            </View>
            {step < 3 && (
              <View
                style={[
                  styles.stepLine,
                  currentStep > step && styles.stepLineActive,
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
            <Icon name="account-edit" size={32} color={colors.primaryBlack} />
          </LinearGradient>
        </View>

        <Text style={styles.sectionTitle}>Основная информация</Text>
        <Text style={styles.sectionHint}>
          Расскажите о себе. Эти данные будут видны работодателям.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ваше имя *</Text>
          <TextInput
            style={styles.input}
            placeholder="Иван Иванов"
            placeholderTextColor={colors.liquidSilver}
            value={form.name}
            onChangeText={(text) => updateForm('name', text)}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Профессия *</Text>
          <TextInput
            style={styles.input}
            placeholder="Frontend разработчик"
            placeholderTextColor={colors.liquidSilver}
            value={form.profession}
            onChangeText={(text) => updateForm('profession', text)}
          />
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
          <Text style={styles.label}>Ожидаемая зарплата</Text>
          <TextInput
            style={styles.input}
            placeholder="150 000 ₽"
            placeholderTextColor={colors.liquidSilver}
            value={form.salaryExpected}
            onChangeText={(text) => updateForm('salaryExpected', text)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>О себе (кратко)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Опишите ваш опыт и навыки..."
            placeholderTextColor={colors.liquidSilver}
            value={form.about}
            onChangeText={(text) => updateForm('about', text)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
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

        <Text style={styles.sectionTitle}>Видео-резюме (опционально)</Text>
        <Text style={styles.sectionHint}>
          Запишите короткое видео о себе (30-120 сек){'\n'}
          Это повысит ваши шансы! Но можно и пропустить.
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
          <Text style={styles.tipText}>• Выберите хорошо освещённое место</Text>
          <Text style={styles.tipText}>• Говорите чётко и уверенно</Text>
          <Text style={styles.tipText}>• Улыбайтесь и будьте естественны</Text>
          <Text style={styles.tipText}>
            • Расскажите о ключевых достижениях
          </Text>
        </View>

        {/* Architecture v3: Skip Video Option */}
        {!videoPath && (
          <TouchableOpacity
            style={styles.skipVideoButton}
            onPress={handleSkipVideo}
          >
            <Text style={styles.skipVideoText}>Пропустить видео →</Text>
            <Text style={styles.skipVideoHint}>
              Вы сможете добавить видео позже
            </Text>
          </TouchableOpacity>
        )}
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
        <Text style={styles.sectionHint}>
          Проверьте данные перед публикацией
        </Text>

        <View style={styles.previewRow}>
          <Icon name="account" size={20} color={colors.liquidSilver} />
          <Text style={styles.previewLabel}>Имя:</Text>
          <Text style={styles.previewValue}>{form.name}</Text>
        </View>

        <View style={styles.previewRow}>
          <Icon name="briefcase" size={20} color={colors.liquidSilver} />
          <Text style={styles.previewLabel}>Профессия:</Text>
          <Text style={styles.previewValue}>{form.profession}</Text>
        </View>

        <View style={styles.previewRow}>
          <Icon name="map-marker" size={20} color={colors.liquidSilver} />
          <Text style={styles.previewLabel}>Город:</Text>
          <Text style={styles.previewValue}>{form.city}</Text>
        </View>

        {form.salaryExpected && (
          <View style={styles.previewRow}>
            <Icon name="currency-rub" size={20} color={colors.liquidSilver} />
            <Text style={styles.previewLabel}>Зарплата:</Text>
            <Text style={styles.previewValue}>{form.salaryExpected} ₽</Text>
          </View>
        )}

        {videoPath && (
          <View style={styles.previewRow}>
            <Icon name="video" size={20} color={colors.liquidSilver} />
            <Text style={styles.previewLabel}>Видео:</Text>
            <Text style={styles.previewValue}>
              {Math.floor(videoDuration / 60)}:
              {(videoDuration % 60).toString().padStart(2, '0')}
            </Text>
          </View>
        )}

        {!videoPath && (
          <View style={styles.previewRow}>
            <Icon name="video-off" size={20} color={colors.liquidSilver} />
            <Text style={styles.previewLabel}>Видео:</Text>
            <Text style={styles.previewValue}>Без видео</Text>
          </View>
        )}

        {/* Architecture v3: Light AI check for resume videos */}
        {videoPath && (
          <View style={styles.moderationNotice}>
            <Icon name="robot" size={24} color={colors.info} />
            <View style={styles.moderationTextBox}>
              <Text style={styles.moderationTitle}>AI-Проверка</Text>
              <Text style={styles.moderationText}>
                Ваше видео пройдёт быструю автоматическую проверку.{'\n'}
                Обычно это занимает 2-3 минуты.
              </Text>
            </View>
          </View>
        )}

        {!videoPath && (
          <View style={styles.privacyNotice}>
            <Icon name="shield-check" size={24} color={colors.success} />
            <View style={styles.moderationTextBox}>
              <Text style={styles.privacyTitle}>Приватность</Text>
              <Text style={styles.privacyText}>
                Ваши данные будут видны только работодателям, которым вы откликнетесь.
              </Text>
            </View>
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
        <Text style={styles.headerTitle}>
          {currentStep === 1
            ? 'Информация'
            : currentStep === 2
            ? 'Видео'
            : 'Публикация'}
        </Text>
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
            title={currentStep === 1 ? 'Далее →' : 'Продолжить →'}
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
            style={styles.publishButton}
            loading={loading}
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
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: sizes.large,
    paddingBottom: sizes.medium,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: colors.platinumSilver,
  },
  stepNumber: {
    ...typography.caption,
    color: colors.liquidSilver,
    fontWeight: '600',
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 8,
  },
  stepLineActive: {
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
  textArea: {
    height: 100,
    paddingTop: sizes.medium,
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
  moderationNotice: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,193,7,0.1)',
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: 12,
    padding: sizes.medium,
    marginTop: sizes.large,
    gap: sizes.medium,
  },
  moderationTextBox: {
    flex: 1,
  },
  moderationTitle: {
    ...typography.body,
    color: colors.warning,
    fontWeight: '700',
    marginBottom: sizes.xSmall,
  },
  moderationText: {
    ...typography.caption,
    color: colors.liquidSilver,
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
  skipVideoButton: {
    marginTop: sizes.large,
    padding: sizes.medium,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    alignItems: 'center',
  },
  skipVideoText: {
    ...typography.body,
    color: colors.platinumSilver,
    fontWeight: '600',
  },
  skipVideoHint: {
    ...typography.caption,
    color: colors.liquidSilver,
    marginTop: sizes.xSmall,
  },
  privacyNotice: {
    flexDirection: 'row',
    backgroundColor: 'rgba(76,175,80,0.1)',
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: 12,
    padding: sizes.medium,
    marginTop: sizes.large,
    gap: sizes.medium,
  },
  privacyTitle: {
    ...typography.body,
    color: colors.success,
    fontWeight: '700',
    marginBottom: sizes.xSmall,
  },
  privacyText: {
    ...typography.caption,
    color: colors.liquidSilver,
  },
});
