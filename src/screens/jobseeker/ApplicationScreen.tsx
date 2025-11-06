/**
 * 360° РАБОТА - ULTRA EDITION
 * Application Screen (Job Seeker)
 *
 * Экран отклика на вакансию с опциональным видео-резюме
 * Architecture v3: Приватные видео с лимитом 2 просмотра
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { GlassCard, GlassButton } from '@/components/ui';
import { colors, metalGradients, typography, sizes } from '@/constants';
import { useToastStore, useAuthStore } from '@/stores';
import { apiService } from '@/services/api.service';

interface ApplicationScreenProps {
  navigation: any;
  route: {
    params: {
      vacancyId: string;
      vacancyTitle: string;
      companyName: string;
    };
  };
}

export function ApplicationScreen({ navigation, route }: ApplicationScreenProps) {
  const { vacancyId, vacancyTitle, companyName } = route.params;
  const { showToast } = useToastStore();
  const { user } = useAuthStore();

  const [message, setMessage] = useState('');
  const [attachVideo, setAttachVideo] = useState(true);
  const [hasResumeVideo, setHasResumeVideo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingVideo, setCheckingVideo] = useState(true);

  useEffect(() => {
    checkForResumeVideo();
  }, []);

  const checkForResumeVideo = async () => {
    try {
      // TODO: API call to check if user has resume video
      // const result = await apiService.getMyResumeVideo();
      // setHasResumeVideo(!!result.video);

      // Имитация проверки
      await new Promise((resolve) => setTimeout(resolve, 500));
      setHasResumeVideo(false); // Меняем на true после реализации API
    } catch (error) {
      console.error('Error checking resume video:', error);
      setHasResumeVideo(false);
    } finally {
      setCheckingVideo(false);
    }
  };

  const handleSubmit = async () => {
    if (!message.trim() && !attachVideo) {
      showToast('error', 'Добавьте сообщение или видео');
      return;
    }

    setLoading(true);
    try {
      // TODO: API call to submit application
      // const result = await apiService.createApplication({
      //   vacancyId,
      //   message,
      //   attachResumeVideo: attachVideo,
      // });

      // Имитация отправки
      await new Promise((resolve) => setTimeout(resolve, 1500));

      showToast('success', '🎉 Отклик отправлен!');

      if (attachVideo) {
        showToast('info', '📹 Работодатель сможет посмотреть ваше видео 2 раза');
      }

      // Переход на экран чата или назад
      navigation.goBack();
    } catch (error: any) {
      console.error('Error submitting application:', error);
      showToast('error', 'Ошибка при отправке отклика');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVideo = () => {
    navigation.navigate('CreateResume');
  };

  if (checkingVideo) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.platinumSilver} />
          <Text style={styles.loadingText}>Загрузка...</Text>
        </View>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>Отклик на вакансию</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Vacancy Info */}
        <GlassCard style={styles.section}>
          <View style={styles.vacancyHeader}>
            <LinearGradient
              colors={metalGradients.platinum}
              style={styles.vacancyIcon}
            >
              <Icon name="briefcase" size={24} color={colors.primaryBlack} />
            </LinearGradient>
          </View>

          <Text style={styles.vacancyTitle}>{vacancyTitle}</Text>
          <Text style={styles.companyName}>{companyName}</Text>
        </GlassCard>

        {/* Message */}
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Сопроводительное письмо</Text>
          <Text style={styles.sectionHint}>
            Расскажите, почему вы подходите на эту позицию
          </Text>

          <TextInput
            style={styles.messageInput}
            placeholder="Здравствуйте! Меня заинтересовала ваша вакансия..."
            placeholderTextColor={colors.liquidSilver}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </GlassCard>

        {/* Video Resume */}
        <GlassCard style={styles.section}>
          <View style={styles.videoHeader}>
            <Icon name="video" size={24} color={colors.platinumSilver} />
            <Text style={styles.sectionTitle}>Видео-резюме</Text>
          </View>

          {hasResumeVideo ? (
            <>
              <View style={styles.videoToggleRow}>
                <View style={styles.videoToggleInfo}>
                  <Text style={styles.videoToggleLabel}>
                    Прикрепить видео-резюме
                  </Text>
                  <Text style={styles.videoToggleHint}>
                    Работодатель сможет посмотреть видео 2 раза
                  </Text>
                </View>
                <Switch
                  value={attachVideo}
                  onValueChange={setAttachVideo}
                  trackColor={{
                    false: 'rgba(255,255,255,0.2)',
                    true: colors.platinumSilver,
                  }}
                  thumbColor={colors.softWhite}
                />
              </View>

              {attachVideo && (
                <View style={styles.privacyNotice}>
                  <Icon name="shield-lock" size={20} color={colors.info} />
                  <Text style={styles.privacyText}>
                    🔒 Ваше видео приватное и доступно только этому работодателю{'\n'}
                    👁️ Лимит: 2 просмотра на работодателя{'\n'}
                    🗑️ Видео удалится после просмотра 2 раз
                  </Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.noVideoBox}>
              <Icon name="video-off" size={48} color={colors.liquidSilver} />
              <Text style={styles.noVideoText}>
                У вас пока нет видео-резюме
              </Text>
              <TouchableOpacity
                style={styles.createVideoButton}
                onPress={handleCreateVideo}
              >
                <LinearGradient
                  colors={metalGradients.platinum}
                  style={styles.createVideoGradient}
                >
                  <Icon name="video-plus" size={20} color={colors.primaryBlack} />
                  <Text style={styles.createVideoText}>Создать видео-резюме</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </GlassCard>

        {/* Tips */}
        <GlassCard style={styles.section}>
          <Text style={styles.tipsTitle}>💡 Советы:</Text>
          <Text style={styles.tipText}>
            • Опишите свой релевантный опыт
          </Text>
          <Text style={styles.tipText}>
            • Объясните, почему вы заинтересованы в компании
          </Text>
          <Text style={styles.tipText}>
            • Видео-резюме увеличивает шанс отклика на 3x
          </Text>
          <Text style={styles.tipText}>
            • Будьте вежливы и профессиональны
          </Text>
        </GlassCard>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <GlassButton
          title={loading ? 'Отправка...' : '📤 Отправить отклик'}
          onPress={handleSubmit}
          variant="primary"
          disabled={loading}
          loading={loading}
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: sizes.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.liquidSilver,
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
    padding: sizes.md,
    paddingBottom: 120,
  },
  section: {
    marginBottom: sizes.md,
  },
  vacancyHeader: {
    alignItems: 'center',
    marginBottom: sizes.md,
  },
  vacancyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vacancyTitle: {
    ...typography.h2,
    color: colors.softWhite,
    textAlign: 'center',
    marginBottom: sizes.xs,
  },
  companyName: {
    ...typography.body,
    color: colors.liquidSilver,
    textAlign: 'center',
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.softWhite,
    marginBottom: sizes.xs,
  },
  sectionHint: {
    ...typography.caption,
    color: colors.liquidSilver,
    marginBottom: sizes.md,
  },
  messageInput: {
    ...typography.body,
    color: colors.softWhite,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: sizes.radiusMedium,
    padding: sizes.md,
    minHeight: 150,
  },
  videoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.sm,
    marginBottom: sizes.md,
  },
  videoToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: sizes.sm,
  },
  videoToggleInfo: {
    flex: 1,
  },
  videoToggleLabel: {
    ...typography.body,
    color: colors.softWhite,
    fontWeight: '600',
  },
  videoToggleHint: {
    ...typography.caption,
    color: colors.liquidSilver,
    marginTop: sizes.xs,
  },
  privacyNotice: {
    flexDirection: 'row',
    backgroundColor: 'rgba(33,150,243,0.1)',
    borderWidth: 1,
    borderColor: colors.info,
    borderRadius: sizes.radiusMedium,
    padding: sizes.md,
    marginTop: sizes.md,
    gap: sizes.sm,
  },
  privacyText: {
    ...typography.caption,
    color: colors.liquidSilver,
    flex: 1,
  },
  noVideoBox: {
    alignItems: 'center',
    paddingVertical: sizes.xl,
    gap: sizes.md,
  },
  noVideoText: {
    ...typography.body,
    color: colors.liquidSilver,
  },
  createVideoButton: {
    marginTop: sizes.sm,
    borderRadius: sizes.radiusMedium,
    overflow: 'hidden',
  },
  createVideoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: sizes.lg,
    paddingVertical: sizes.md,
    gap: sizes.sm,
  },
  createVideoText: {
    ...typography.body,
    color: colors.primaryBlack,
    fontWeight: '600',
  },
  tipsTitle: {
    ...typography.body,
    color: colors.softWhite,
    fontWeight: '600',
    marginBottom: sizes.sm,
  },
  tipText: {
    ...typography.caption,
    color: colors.liquidSilver,
    marginTop: sizes.xs,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: sizes.md,
    backgroundColor: colors.graphiteGray,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
});
