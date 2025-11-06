/**
 * 360° РАБОТА - ULTRA EDITION
 * Vacancy Feed Screen (TikTok-style vertical swipe)
 * Architecture v3: Guest view tracking with 20-video limit
 */

import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, StatusBar, FlatList } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { colors, metalGradients } from "@/constants";
import { PremiumVacancyCard } from '@/components/vacancy';
import { useVacancyFeed } from '@/hooks/useVacancyFeed';
import { useAuthStore } from '@/stores/authStore';
import {
  incrementGuestView,
  hasReachedViewLimit,
  getRemainingViews,
} from '@/utils/guestViewCounter';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function VacancyFeedScreen({ navigation }: any) {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { vacancies, fetchMore } = useVacancyFeed();
  const { user } = useAuthStore();
  const [likedVacancies, setLikedVacancies] = useState<Set<string>>(new Set());
  const [favoritedVacancies, setFavoritedVacancies] = useState<Set<string>>(new Set());
  const [remainingViews, setRemainingViews] = useState<number>(20);

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

  const handleLike = (vacancyId: string) => {
    if (!user) {
      navigation.navigate('RegistrationRequired');
      return;
    }
    setLikedVacancies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(vacancyId)) {
        newSet.delete(vacancyId);
      } else {
        newSet.add(vacancyId);
      }
      return newSet;
    });
  };

  const handleFavorite = (vacancyId: string) => {
    if (!user) {
      navigation.navigate('RegistrationRequired');
      return;
    }
    setFavoritedVacancies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(vacancyId)) {
        newSet.delete(vacancyId);
      } else {
        newSet.add(vacancyId);
      }
      return newSet;
    });
  };

  const handleComment = (vacancyId: string) => {
    if (!user) {
      navigation.navigate('RegistrationRequired');
      return;
    }
    console.log('Comment on', vacancyId);
  };

  const handleApply = (vacancyId: string) => {
    if (!user) {
      navigation.navigate('RegistrationRequired');
      return;
    }
    console.log('Apply to', vacancyId);
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
          <FlatList
            ref={flatListRef}
            data={vacancies}
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
                  onShare={() => console.log('Share', item.id)}
                  onSoundPress={() => console.log('Sound', item.id)}
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBlack,
  },
});
