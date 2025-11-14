/**
 * 360° РАБОТА - MainFeedScreen
 * TikTok-style video feed with vacancies
 * ✅ P0-2, P0-3, P0-7 FIX: Optimized FlatList and callbacks
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, FlatList, Dimensions, StyleSheet, StatusBar, Share } from 'react-native';
import { colors } from '@/constants';
import { MainFeedHeader, VacancyCard, ActionButtons, SearchModal } from '@/components/feed';
import { useVacancyFeed } from '@/hooks/useVacancyFeed';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { api } from '@/services/api';
import { haptics } from '@/utils/haptics';
import { Vacancy } from '@/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function MainFeedScreen({ navigation }: any) {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { vacancies, fetchMore } = useVacancyFeed();
  const { user } = useAuthStore();
  const { showToast } = useToastStore();

  const [likedVacancies, setLikedVacancies] = useState<Set<string>>(new Set());
  const [savedVacancies, setSavedVacancies] = useState<Set<string>>(new Set());
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  // ✅ P0-7 FIX: Use useCallback instead of useRef for stable reference
  const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }, []);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // Обработчик отклика
  const handleApply = (vacancy: Vacancy) => {
    if (!user) {
      navigation.navigate('RegistrationRequired');
      return;
    }

    haptics.success();
    showToast('success', '✅ Отклик отправлен!');
    navigation.navigate('Application', { vacancyId: vacancy.id });
  };

  // Обработчик лайка
  const handleLike = async (vacancyId: string) => {
    if (!user) {
      navigation.navigate('RegistrationRequired');
      return;
    }

    try {
      const wasLiked = likedVacancies.has(vacancyId);

      // Оптимистичное обновление UI
      setLikedVacancies(prev => {
        const newSet = new Set(prev);
        if (wasLiked) {
          newSet.delete(vacancyId);
        } else {
          newSet.add(vacancyId);
        }
        return newSet;
      });

      // API запрос
      if (wasLiked) {
        await api.unlikeVacancy(vacancyId);
        haptics.light();
      } else {
        await api.likeVacancy(vacancyId);
        haptics.success();
        showToast('success', '❤️ Вакансия понравилась!');
      }
    } catch (error) {
      console.error('Error liking vacancy:', error);

      // Откат при ошибке
      const wasLikedBeforeError = likedVacancies.has(vacancyId);
      setLikedVacancies(prev => {
        const newSet = new Set(prev);
        if (wasLikedBeforeError) {
          newSet.add(vacancyId);
        } else {
          newSet.delete(vacancyId);
        }
        return newSet;
      });

      haptics.error();
      showToast('error', 'Ошибка при лайке');
    }
  };

  // Обработчик комментариев
  const handleComment = (vacancyId: string) => {
    if (!user) {
      navigation.navigate('RegistrationRequired');
      return;
    }

    haptics.light();
    showToast('info', 'Функция комментариев скоро будет доступна');
  };

  // Обработчик избранного
  const handleSave = async (vacancyId: string) => {
    if (!user) {
      navigation.navigate('RegistrationRequired');
      return;
    }

    try {
      const wasSaved = savedVacancies.has(vacancyId);

      // Оптимистичное обновление UI
      setSavedVacancies(prev => {
        const newSet = new Set(prev);
        if (wasSaved) {
          newSet.delete(vacancyId);
        } else {
          newSet.add(vacancyId);
        }
        return newSet;
      });

      // API запрос
      if (wasSaved) {
        await api.unfavoriteVacancy(vacancyId);
        haptics.light();
        showToast('info', 'Удалено из избранного');
      } else {
        await api.favoriteVacancy(vacancyId);
        haptics.success();
        showToast('success', '⭐ Добавлено в избранное!');
      }
    } catch (error) {
      console.error('Error saving vacancy:', error);

      // Откат при ошибке
      const wasSavedBeforeError = savedVacancies.has(vacancyId);
      setSavedVacancies(prev => {
        const newSet = new Set(prev);
        if (wasSavedBeforeError) {
          newSet.add(vacancyId);
        } else {
          newSet.delete(vacancyId);
        }
        return newSet;
      });

      haptics.error();
      showToast('error', 'Ошибка при добавлении в избранное');
    }
  };

  // Обработчик поделиться
  const handleShare = async (vacancy: Vacancy) => {
    try {
      await Share.share({
        message: `Вакансия: ${vacancy.title}\nЗарплата: ${vacancy.salaryMin}-${vacancy.salaryMax || vacancy.salaryMin}₽\nСсылка: https://360rabota.ru/vacancy/${vacancy.id}`,
      });
      haptics.light();
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Обработчик поиска
  const handleSearch = (query: string) => {
    setIsSearchVisible(false);
    navigation.navigate('Search', { query });
  };

  // ✅ P0-2 FIX: Memoize renderItem to prevent FlatList re-renders
  const renderItem = useCallback(({ item, index }: { item: Vacancy; index: number }) => (
    <View style={styles.vacancyContainer}>
      {/* Карточка с видео и информацией */}
      <VacancyCard
        vacancy={item}
        isActive={index === currentIndex}
        onApply={() => handleApply(item)}
      />

      {/* Боковые кнопки */}
      <ActionButtons
        vacancy={item}
        isLiked={likedVacancies.has(item.id)}
        isSaved={savedVacancies.has(item.id)}
        onLike={() => handleLike(item.id)}
        onComment={() => handleComment(item.id)}
        onSave={() => handleSave(item.id)}
        onShare={() => handleShare(item)}
      />
    </View>
  ), [currentIndex, likedVacancies, savedVacancies, handleApply, handleLike, handleComment, handleSave, handleShare]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primaryBlack}
        translucent
      />

      {/* Хедер */}
      <MainFeedHeader onSearchPress={() => setIsSearchVisible(true)} />

      {/* Видео-лента */}
      {/* ✅ P0-3 FIX: Optimized FlatList props for video feed performance */}
      <FlatList
        ref={flatListRef}
        data={vacancies}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(data, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
        onEndReached={fetchMore}
        onEndReachedThreshold={0.5}
        // ✅ Performance optimizations
        windowSize={3}
        maxToRenderPerBatch={2}
        removeClippedSubviews={true}
        initialNumToRender={1}
        updateCellsBatchingPeriod={100}
      />

      {/* Модалка поиска */}
      <SearchModal
        visible={isSearchVisible}
        onClose={() => setIsSearchVisible(false)}
        onSearch={handleSearch}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBlack,
  },
  vacancyContainer: {
    height: SCREEN_HEIGHT,
    position: 'relative',
  },
});
