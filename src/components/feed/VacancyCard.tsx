/**
 * 360° РАБОТА - VacancyCard Component
 * TikTok-style vacancy card with video and information
 * ✅ P0-1 FIX: Memoized with React.memo() for performance
 */

import React, { useRef, useEffect, useState, useCallback, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Video from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import { colors, sizes, typography } from '@/constants';
import { Vacancy } from '@/types';

interface VacancyCardProps {
  vacancy: Vacancy;
  isActive: boolean;
  onApply: () => void;
}

export const VacancyCard = memo(function VacancyCard({ vacancy, isActive, onApply }: VacancyCardProps) {
  const videoRef = useRef<Video>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // ✅ P0-8 FIX: Safe video seek with error handling
  useEffect(() => {
    if (!isActive || !isVideoLoaded || !videoRef.current) {
      return;
    }

    const seekToStart = async () => {
      try {
        await videoRef.current?.seek(0);
      } catch (error) {
        console.error(`Failed to seek video ${vacancy.id}:`, error);
        // Fallback: pause and retry
        try {
          videoRef.current?.pause?.();
          await new Promise(resolve => setTimeout(resolve, 100));
          await videoRef.current?.seek(0);
          videoRef.current?.play?.();
        } catch (retryError) {
          console.error(`Failed to seek video after retry:`, retryError);
        }
      }
    };

    seekToStart();
  }, [isActive, isVideoLoaded, vacancy.id]);

  // ✅ Memoized callback: Video load handler
  const handleVideoLoad = useCallback(() => {
    setIsVideoLoaded(true);
  }, []);

  // ✅ Memoized callback: Video error handler
  const handleVideoError = useCallback((error: any) => {
    console.error('Video playback error:', error);
    setIsVideoLoaded(false);
  }, []);

  // ✅ Memoized callback: Get company initial
  const getCompanyInitial = useCallback(() => {
    const companyName = vacancy.employer?.companyName || '';
    return companyName.trim().charAt(0).toUpperCase() || '?';
  }, [vacancy.employer?.companyName]);

  return (
    <View style={styles.container}>
      {/* Видео на весь экран */}
      <Video
        ref={videoRef}
        source={{ uri: vacancy.videoUrl }}
        style={styles.video}
        resizeMode="cover"
        repeat
        paused={!isActive}
        muted={false}
        onLoad={handleVideoLoad}
        onError={handleVideoError}
      />

      {/* Градиент для читаемости текста */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      />

      {/* Информация о вакансии */}
      <View style={styles.infoContainer}>
        {/* Название профессии */}
        <Text style={styles.title}>{vacancy.title}</Text>

        {/* Зарплата */}
        <View style={styles.row}>
          <Text style={styles.salary}>
            💰 {vacancy.salaryMin.toLocaleString()} - {vacancy.salaryMax ? vacancy.salaryMax.toLocaleString() : vacancy.salaryMin.toLocaleString()} ₽
          </Text>
        </View>

        {/* Локация */}
        <View style={styles.row}>
          <Text style={styles.location}>📍 {vacancy.city}</Text>
        </View>

        {/* Компания */}
        <View style={styles.companyRow}>
          <View style={styles.companyAvatar}>
            {vacancy.employer?.logoUrl ? (
              <Image source={{ uri: vacancy.employer.logoUrl }} style={styles.companyLogo} />
            ) : (
              <Text style={styles.companyInitial}>
                {getCompanyInitial()}
              </Text>
            )}
          </View>
          <Text style={styles.companyName}>{vacancy.employer?.companyName || 'Компания'}</Text>
        </View>

        {/* КНОПКА ОТКЛИКА - ГЛАВНАЯ ACTION */}
        <TouchableOpacity
          style={styles.applyButton}
          onPress={onApply}
          activeOpacity={0.8}
        >
          <Text style={styles.applyButtonText}>📱 Откликнуться</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  // ✅ Custom comparison function for React.memo()
  // Only re-render if vacancy ID or isActive changed
  return (
    prevProps.vacancy.id === nextProps.vacancy.id &&
    prevProps.isActive === nextProps.isActive
    // onApply не проверяем, т.к. это callback который может меняться
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 350,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 100,
    left: sizes.md,
    right: 80, // Место для боковых кнопок
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.softWhite,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  row: {
    marginBottom: 6,
  },
  salary: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.softWhite,
  },
  location: {
    fontSize: 15,
    color: colors.softWhite,
    opacity: 0.95,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  companyAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.platinumSilver,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 2,
    borderColor: colors.softWhite,
  },
  companyLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  companyInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.graphiteBlack,
  },
  companyName: {
    fontSize: 15,
    color: colors.softWhite,
    fontWeight: '500',
  },
  applyButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: colors.platinumSilver,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.graphiteBlack,
  },
});
