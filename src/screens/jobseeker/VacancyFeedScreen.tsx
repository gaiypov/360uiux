/**
 * 360° РАБОТА - ULTRA EDITION
 * Vacancy Feed Screen (TikTok-style vertical swipe)
 * Architecture v4: Optimized with preloading, memory cleanup, sound isolation
 *
 * Optimizations:
 * - Preloading: N+1 while playing N
 * - Memory cleanup: Only N-1, N, N+1 rendered (window = 3)
 * - Sound isolation: Only active video plays sound
 * - Smart caching: Expo-av with optimized loading
 * - Minimal re-renders: useCallback, React.memo
 */

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, Dimensions, StatusBar, FlatList } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { colors, metalGradients } from "@/constants";
import { PremiumVacancyCard, CommentsModal } from '@/components/vacancy';
import { useVacancyFeed } from '@/hooks/useVacancyFeed';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { api } from '@/services/api';
import { haptics } from '@/utils/haptics';
import {
  incrementGuestView,
  hasReachedViewLimit,
  getRemainingViews,
} from '@/utils/guestViewCounter';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Memory optimization: Only render videos within this window
 * N-1, N, N+1 where N is current index
 */
const RENDER_WINDOW_SIZE = 1; // Render current +/- 1

export function VacancyFeedScreen({ navigation }: any) {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { vacancies, fetchMore } = useVacancyFeed();
  const { user } = useAuthStore();
  const { showToast } = useToastStore();

  const [likedVacancies, setLikedVacancies] = useState<Set<string>>(new Set());
  const [favoritedVacancies, setFavoritedVacancies] = useState<Set<string>>(new Set());
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set());
  const [remainingViews, setRemainingViews] = useState<number>(20);
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [selectedVacancyId, setSelectedVacancyId] = useState<string | null>(null);

  // Check view limit on mount
  useEffect(() => {
    const checkViewLimit = async () => {
      if (!user) {
        const limitReached = await hasReachedViewLimit();
        if (limitReached) {
          navigation.replace('RegistrationRequired');
          return;
        }
        const remaining = await getRemainingViews();
        setRemainingViews(remaining);
      }
    };
    checkViewLimit();
  }, [user, navigation]);

  // Track view when vacancy changes
  useEffect(() => {
    const trackView = async () => {
      if (!user && vacancies[currentIndex]) {
        try {
          const viewData = await incrementGuestView(vacancies[currentIndex].id);
          setRemainingViews(20 - viewData.count);

          // Check if limit reached
          if (viewData.count >= 20) {
            setTimeout(() => {
              navigation.replace('RegistrationRequired');
            }, 1000);
          }
        } catch (error) {
          console.error('Error tracking view:', error);
        }
      }
    };
    trackView();
  }, [currentIndex, user, vacancies, navigation]);

  /**
   * Calculate which videos should be rendered (memory optimization)
   * Only render videos within window: [currentIndex - 1, currentIndex + 1]
   */
  const shouldRenderVideo = useCallback((index: number): boolean => {
    return Math.abs(index - currentIndex) <= RENDER_WINDOW_SIZE;
  }, [currentIndex]);

  /**
   * Calculate which videos should be preloaded
   * Preload N+1 while playing N
   */
  const shouldPreloadVideo = useCallback((index: number): boolean => {
    return index === currentIndex + 1;
  }, [currentIndex]);

  /**
   * Handle Like/Unlike with API
   * Wrapped in useCallback to prevent re-renders
   */
  const handleLike = useCallback(async (vacancyId: string) => {
    if (!user) {
      navigation.navigate('RegistrationRequired');
      return;
    }

    const actionKey = `like-${vacancyId}`;
    if (loadingActions.has(actionKey)) return;

    try {
      // Optimistic UI update
      const wasLiked = likedVacancies.has(vacancyId);
      setLikedVacancies((prev) => {
        const newSet = new Set(prev);
        if (wasLiked) {
          newSet.delete(vacancyId);
        } else {
          newSet.add(vacancyId);
        }
        return newSet;
      });

      // Add to loading
      setLoadingActions((prev) => new Set(prev).add(actionKey));

      // API call
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

      // Revert optimistic update on error
      setLikedVacancies((prev) => {
        const newSet = new Set(prev);
        if (likedVacancies.has(vacancyId)) {
          newSet.delete(vacancyId);
        } else {
          newSet.add(vacancyId);
        }
        return newSet;
      });

      haptics.error();
      showToast('error', 'Ошибка при лайке');
    } finally {
      setLoadingActions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(actionKey);
        return newSet;
      });
    }
  }, [user, navigation, likedVacancies, loadingActions, showToast]);

  /**
   * Handle Favorite/Unfavorite with API
   * Wrapped in useCallback to prevent re-renders
   */
  const handleFavorite = useCallback(async (vacancyId: string) => {
    if (!user) {
      navigation.navigate('RegistrationRequired');
      return;
    }

    const actionKey = `favorite-${vacancyId}`;
    if (loadingActions.has(actionKey)) return;

    try {
      // Optimistic UI update
      const wasFavorited = favoritedVacancies.has(vacancyId);
      setFavoritedVacancies((prev) => {
        const newSet = new Set(prev);
        if (wasFavorited) {
          newSet.delete(vacancyId);
        } else {
          newSet.add(vacancyId);
        }
        return newSet;
      });

      // Add to loading
      setLoadingActions((prev) => new Set(prev).add(actionKey));

      // API call
      if (wasFavorited) {
        await api.unfavoriteVacancy(vacancyId);
        haptics.light();
        showToast('info', 'Удалено из избранного');
      } else {
        await api.favoriteVacancy(vacancyId);
        haptics.success();
        showToast('success', '🔖 Добавлено в избранное!');
      }
    } catch (error) {
      console.error('Error favoriting vacancy:', error);

      // Revert optimistic update on error
      setFavoritedVacancies((prev) => {
        const newSet = new Set(prev);
        if (favoritedVacancies.has(vacancyId)) {
          newSet.delete(vacancyId);
        } else {
          newSet.add(vacancyId);
        }
        return newSet;
      });

      haptics.error();
      showToast('error', 'Ошибка при добавлении в избранное');
    } finally {
      setLoadingActions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(actionKey);
        return newSet;
      });
    }
  }, [user, navigation, favoritedVacancies, loadingActions, showToast]);

  /**
   * Handle Comment - open modal
   * Wrapped in useCallback to prevent re-renders
   */
  const handleComment = useCallback((vacancyId: string) => {
    if (!user) {
      navigation.navigate('RegistrationRequired');
      return;
    }

    haptics.light();
    setSelectedVacancyId(vacancyId);
    setCommentsModalVisible(true);
  }, [user, navigation]);

  /**
   * Handle Apply to vacancy
   * Wrapped in useCallback to prevent re-renders
   * НЕ МЕНЯТЬ: Это логика "Откликнуться"!
   */
  const handleApply = useCallback((vacancyId: string) => {
    if (!user) {
      navigation.navigate('RegistrationRequired');
      return;
    }

    haptics.success();
    showToast('success', '✅ Отклик отправлен!');
    // TODO: Navigate to ApplicationScreen or create application
    console.log('Apply to', vacancyId);
  }, [user, navigation, showToast]);

  /**
   * Handle Share
   * Wrapped in useCallback to prevent re-renders
   */
  const handleShare = useCallback((vacancyId: string) => {
    haptics.light();
    showToast('info', 'Функция "Поделиться" скоро будет доступна');
    console.log('Share', vacancyId);
  }, [showToast]);

  /**
   * Handle Sound/Music info
   * Wrapped in useCallback to prevent re-renders
   */
  const handleSoundPress = useCallback((vacancyId: string) => {
    haptics.light();
    console.log('Sound info', vacancyId);
  }, []);

  /**
   * Optimized gesture handler with useCallback
   */
  const gesture = useMemo(() => Gesture.Pan().onEnd((event) => {
    const threshold = 500;

    // Swipe up - next vacancy
    if (event.velocityY < -threshold && currentIndex < vacancies.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }
    // Swipe down - previous vacancy
    else if (event.velocityY > threshold && currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      flatListRef.current?.scrollToIndex({
        index: prevIndex,
        animated: true,
      });
      setCurrentIndex(prevIndex);
    }
  }), [currentIndex, vacancies.length]);

  /**
   * Handle viewable items changed - updates current index
   * Memoized with useRef to maintain stable reference
   */
  const handleViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  /**
   * Viewability configuration for FlatList
   * Stable reference with useRef
   */
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  /**
   * Optimized renderItem with useCallback
   * Prevents unnecessary re-renders
   */
  const renderItem = useCallback(({ item, index }: any) => {
    const isActive = index === currentIndex;
    const shouldPreload = shouldPreloadVideo(index);
    const shouldRender = shouldRenderVideo(index);

    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(300)}
      >
        <PremiumVacancyCard
          vacancy={item}
          isActive={isActive}
          shouldPreload={shouldPreload}
          shouldRender={shouldRender}
          isLiked={likedVacancies.has(item.id)}
          isFavorited={favoritedVacancies.has(item.id)}
          onApply={() => handleApply(item.id)}
          onCompanyPress={() => console.log('Company', item.employer.id)}
          onLike={() => handleLike(item.id)}
          onComment={() => handleComment(item.id)}
          onFavorite={() => handleFavorite(item.id)}
          onShare={() => handleShare(item.id)}
          onSoundPress={() => handleSoundPress(item.id)}
        />
      </Animated.View>
    );
  }, [
    currentIndex,
    shouldPreloadVideo,
    shouldRenderVideo,
    likedVacancies,
    favoritedVacancies,
    handleApply,
    handleLike,
    handleComment,
    handleFavorite,
    handleShare,
    handleSoundPress,
  ]);

  /**
   * Optimized keyExtractor with useCallback
   * Returns stable unique key for each item
   */
  const keyExtractor = useCallback((item: any) => item.id, []);

  /**
   * Handle end reached for infinite scroll
   * Wrapped in useCallback
   */
  const handleEndReached = useCallback(() => {
    console.log('📥 Fetching more vacancies...');
    fetchMore();
  }, [fetchMore]);

  /**
   * Optimized getItemLayout for better scrolling performance
   * Prevents layout calculations on every scroll
   */
  const getItemLayout = useCallback(
    (_data: any, index: number) => ({
      length: SCREEN_HEIGHT,
      offset: SCREEN_HEIGHT * index,
      index,
    }),
    []
  );

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primaryBlack}
        translucent
      />
      <GestureDetector gesture={gesture}>
        <View style={styles.container}>
          <FlatList
            ref={flatListRef}
            data={vacancies}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            snapToInterval={SCREEN_HEIGHT}
            decelerationRate="fast"
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            onViewableItemsChanged={handleViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            getItemLayout={getItemLayout}
            removeClippedSubviews={true} // Memory optimization
            maxToRenderPerBatch={3} // Render only 3 items per batch
            windowSize={3} // Keep 3 screens in memory
            initialNumToRender={2} // Start with 2 items
            updateCellsBatchingPeriod={100} // Batch updates every 100ms
          />
        </View>
      </GestureDetector>

      {/* Comments Modal */}
      <CommentsModal
        visible={commentsModalVisible}
        vacancyId={selectedVacancyId}
        onClose={() => {
          setCommentsModalVisible(false);
          setSelectedVacancyId(null);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBlack,
  },
});
