/**
 * 360° РАБОТА - ULTRA EDITION
 * Vacancy Feed Screen (TikTok-style vertical swipe)
 * Architecture v3: Guest view tracking with 20-video limit + API integration
 */

import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { FlashList } from '@shopify/flash-list';
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

export function VacancyFeedScreen({ navigation }: any) {
  const flatListRef = useRef<FlashList<any>>(null);
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

  // Load likes and favorites from API on mount (Priority 2: Sync)
  useEffect(() => {
    const loadLikesAndFavorites = async () => {
      if (user) {
        try {
          const [likes, favorites] = await Promise.all([
            api.getMyLikes(),
            api.getMyFavorites(),
          ]);

          // Convert to Set of vacancy IDs
          const likedIds = new Set(likes.map((like: any) => like.vacancy_id));
          const favoritedIds = new Set(favorites.map((fav: any) => fav.vacancy_id));

          setLikedVacancies(likedIds);
          setFavoritedVacancies(favoritedIds);
        } catch (error) {
          console.error('Error loading likes/favorites:', error);
        }
      }
    };

    loadLikesAndFavorites();
  }, [user]);

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
   * Handle Like/Unlike with API
   */
  const handleLike = async (vacancyId: string) => {
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
  };

  /**
   * Handle Favorite/Unfavorite with API
   */
  const handleFavorite = async (vacancyId: string) => {
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
  };

  /**
   * Handle Comment - open modal
   */
  const handleComment = (vacancyId: string) => {
    if (!user) {
      navigation.navigate('RegistrationRequired');
      return;
    }

    haptics.light();
    setSelectedVacancyId(vacancyId);
    setCommentsModalVisible(true);
  };

  /**
   * Handle Apply to vacancy
   */
  const handleApply = (vacancyId: string) => {
    if (!user) {
      navigation.navigate('RegistrationRequired');
      return;
    }

    haptics.success();
    showToast('success', '✅ Отклик отправлен!');
    // TODO: Navigate to ApplicationScreen or create application
    console.log('Apply to', vacancyId);
  };

  /**
   * Handle Share
   */
  const handleShare = (vacancyId: string) => {
    haptics.light();
    showToast('info', 'Функция "Поделиться" скоро будет доступна');
    console.log('Share', vacancyId);
  };

  /**
   * Handle Sound/Music info
   */
  const handleSoundPress = (vacancyId: string) => {
    haptics.light();
    console.log('Sound info', vacancyId);
  };

  const gesture = Gesture.Pan().onEnd((event) => {
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
  });

  const handleViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primaryBlack}
        translucent
      />
      <GestureDetector gesture={gesture}>
        <View style={styles.container}>
          <FlashList
            ref={flatListRef}
            data={vacancies}
            estimatedItemSize={SCREEN_HEIGHT}
            renderItem={({ item, index }) => (
              <Animated.View
                entering={FadeIn.duration(300)}
                exiting={FadeOut.duration(300)}
              >
                <PremiumVacancyCard
                  vacancy={item}
                  isActive={index === currentIndex}
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
            )}
            keyExtractor={(item) => item.id}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            snapToInterval={SCREEN_HEIGHT}
            decelerationRate="fast"
            onEndReached={fetchMore}
            onEndReachedThreshold={0.5}
            onViewableItemsChanged={handleViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            getItemLayout={(data, index) => ({
              length: SCREEN_HEIGHT,
              offset: SCREEN_HEIGHT * index,
              index,
            })}
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
