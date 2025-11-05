/**
 * 360° РАБОТА - ULTRA EDITION
 * Vacancy Feed Screen (TikTok-style vertical swipe)
 */

import React, { useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, StatusBar, FlatList } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { colors, metalGradients } from "@/constants";
import { PremiumVacancyCard } from '@/components/vacancy';
import { useVacancyFeed } from '@/hooks/useVacancyFeed';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function VacancyFeedScreen() {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { vacancies, fetchMore } = useVacancyFeed();

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
                  onApply={() => console.log('Apply to', item.id)}
                  onCompanyPress={() => console.log('Company', item.employer.id)}
                  onLike={() => console.log('Like', item.id)}
                  onShare={() => console.log('Share', item.id)}
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
