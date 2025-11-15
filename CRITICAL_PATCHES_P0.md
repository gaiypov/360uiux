# 🔥 CRITICAL PATCHES - P0 ISSUES
## Готовые исправления для критических проблем

**Дата**: 2025-11-14
**Приоритет**: 🔴 **CRITICAL - БЛОКИРУЕТ PRODUCTION**
**Estimated Time**: 2-3 days implementation

---

## 📋 TABLE OF CONTENTS

1. [P0-1: VacancyCard Memoization](#p0-1-vacancycard-memoization)
2. [P0-2: MainFeedScreen renderItem](#p0-2-mainfeedscreen-renderitem)
3. [P0-3: FlatList Optimization](#p0-3-flatlist-optimization)
4. [P0-4: Video Component Pooling](#p0-4-video-component-pooling)
5. [P0-5: Navigation Types](#p0-5-navigation-types)
6. [P0-6: ActionButtons Memoization](#p0-6-actionbuttons-memoization)
7. [P0-7: handleViewableItemsChanged Fix](#p0-7-handleviewableitemschanged-fix)
8. [P0-8: Video seek Error Handling](#p0-8-video-seek-error-handling)
9. [P0-9: ResumeVideoPlayer Memory Leak](#p0-9-resumevideoplayer-memory-leak)
10. [P0-10: API Refresh Race Condition](#p0-10-api-refresh-race-condition)
11. [P0-11: Guest View Counter Atomicity](#p0-11-guest-view-counter-atomicity)
12. [P0-12: VideoRecordScreen Permissions](#p0-12-videorecordscreen-permissions)

---

## P0-1: VacancyCard Memoization

### 📁 Файл: `src/components/feed/VacancyCard.tsx`

### ❌ BEFORE (Current)

```tsx
export function VacancyCard({ vacancy, isActive, onApply }: VacancyCardProps) {
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    if (videoRef.current && isActive) {
      videoRef.current.seek(0);
    }
  }, [isActive]);

  // ... rest of component
}
```

### ✅ AFTER (Fixed)

```tsx
import React, { useRef, useEffect, memo, useCallback } from 'react';

interface VacancyCardProps {
  vacancy: Vacancy;
  isActive: boolean;
  onApply: () => void;
}

export const VacancyCard = memo(function VacancyCard({
  vacancy,
  isActive,
  onApply
}: VacancyCardProps) {
  const videoRef = useRef<Video>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Управление воспроизведением
  useEffect(() => {
    if (!isVideoLoaded) return;

    if (videoRef.current && isActive) {
      try {
        videoRef.current.seek(0);
      } catch (error) {
        console.error('Video seek error:', error);
      }
    }
  }, [isActive, isVideoLoaded]);

  const handleVideoLoad = useCallback(() => {
    setIsVideoLoaded(true);
  }, []);

  const handleVideoError = useCallback((error: any) => {
    console.error('Video playback error:', error);
    setIsVideoLoaded(false);
  }, []);

  const getCompanyInitial = useCallback(() => {
    const companyName = vacancy.employer?.companyName || '';
    return companyName.trim().charAt(0).toUpperCase() || '?';
  }, [vacancy.employer?.companyName]);

  return (
    <View style={styles.container}>
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
        poster={vacancy.thumbnailUrl} // Optional: add thumbnail
        posterResizeMode="cover"
      />

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      />

      <View style={styles.infoContainer}>
        <Text style={styles.title}>{vacancy.title}</Text>

        <View style={styles.row}>
          <Text style={styles.salary}>
            💰 {vacancy.salaryMin.toLocaleString()} - {vacancy.salaryMax ? vacancy.salaryMax.toLocaleString() : vacancy.salaryMin.toLocaleString()} ₽
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.location}>📍 {vacancy.city}</Text>
        </View>

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
  // Custom comparison function
  return (
    prevProps.vacancy.id === nextProps.vacancy.id &&
    prevProps.isActive === nextProps.isActive
    // onApply не проверяем, т.к. это callback который может меняться
  );
});
```

**Key Changes**:
1. ✅ Wrapped in `React.memo()` with custom comparison
2. ✅ Added `isVideoLoaded` state для track load status
3. ✅ Мемоизированы callbacks (`handleVideoLoad`, `handleVideoError`, `getCompanyInitial`)
4. ✅ Added try/catch для `seek()`
5. ✅ Added `poster` prop для better UX

---

## P0-2: MainFeedScreen renderItem

### 📁 Файл: `src/screens/MainFeedScreen.tsx`

### ❌ BEFORE (Current)

```tsx
const renderItem = ({ item, index }: { item: Vacancy; index: number }) => (
  <View style={styles.vacancyContainer}>
    <VacancyCard
      vacancy={item}
      isActive={index === currentIndex}
      onApply={() => handleApply(item)}
    />
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
);
```

### ✅ AFTER (Fixed)

```tsx
// Мемоизированный renderItem
const renderItem = useCallback(({ item, index }: { item: Vacancy; index: number }) => {
  return (
    <VacancyItem
      vacancy={item}
      isActive={index === currentIndex}
      isLiked={likedVacancies.has(item.id)}
      isSaved={savedVacancies.has(item.id)}
      onApply={handleApply}
      onLike={handleLike}
      onComment={handleComment}
      onSave={handleSave}
      onShare={handleShare}
    />
  );
}, [currentIndex, likedVacancies, savedVacancies, handleApply, handleLike, handleComment, handleSave, handleShare]);

// Отдельный мемоизированный компонент для item
const VacancyItem = memo(function VacancyItem({
  vacancy,
  isActive,
  isLiked,
  isSaved,
  onApply,
  onLike,
  onComment,
  onSave,
  onShare
}: {
  vacancy: Vacancy;
  isActive: boolean;
  isLiked: boolean;
  isSaved: boolean;
  onApply: (vacancy: Vacancy) => void;
  onLike: (vacancyId: string) => void;
  onComment: (vacancyId: string) => void;
  onSave: (vacancyId: string) => void;
  onShare: (vacancy: Vacancy) => void;
}) {
  const handleApplyPress = useCallback(() => {
    onApply(vacancy);
  }, [vacancy, onApply]);

  const handleLikePress = useCallback(() => {
    onLike(vacancy.id);
  }, [vacancy.id, onLike]);

  const handleCommentPress = useCallback(() => {
    onComment(vacancy.id);
  }, [vacancy.id, onComment]);

  const handleSavePress = useCallback(() => {
    onSave(vacancy.id);
  }, [vacancy.id, onSave]);

  const handleSharePress = useCallback(() => {
    onShare(vacancy);
  }, [vacancy, onShare]);

  return (
    <View style={styles.vacancyContainer}>
      <VacancyCard
        vacancy={vacancy}
        isActive={isActive}
        onApply={handleApplyPress}
      />
      <ActionButtons
        vacancy={vacancy}
        isLiked={isLiked}
        isSaved={isSaved}
        onLike={handleLikePress}
        onComment={handleCommentPress}
        onSave={handleSavePress}
        onShare={handleSharePress}
      />
    </View>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.vacancy.id === nextProps.vacancy.id &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.isLiked === nextProps.isLiked &&
    prevProps.isSaved === nextProps.isSaved
  );
});

// Мемоизированные handlers
const handleApply = useCallback((vacancy: Vacancy) => {
  if (!user) {
    navigation.navigate('RegistrationRequired');
    return;
  }
  haptics.success();
  showToast('success', '✅ Отклик отправлен!');
  navigation.navigate('Application', { vacancyId: vacancy.id });
}, [user, navigation, showToast]);

const handleLike = useCallback(async (vacancyId: string) => {
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
    setLikedVacancies(prev => {
      const newSet = new Set(prev);
      const wasLiked = prev.has(vacancyId);
      if (wasLiked) {
        newSet.add(vacancyId);
      } else {
        newSet.delete(vacancyId);
      }
      return newSet;
    });

    haptics.error();
    showToast('error', 'Ошибка при лайке');
  }
}, [user, navigation, likedVacancies, showToast]);

// Similar мемоизация для handleComment, handleSave, handleShare
```

**Key Changes**:
1. ✅ `renderItem` wrapped in `useCallback()`
2. ✅ Created separate memoized `VacancyItem` component
3. ✅ All handlers мемоизированы with `useCallback()`
4. ✅ Custom comparison function для skip unnecessary re-renders

---

## P0-3: FlatList Optimization

### 📁 Файл: `src/screens/MainFeedScreen.tsx`

### ❌ BEFORE (Current)

```tsx
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
/>
```

### ✅ AFTER (Fixed)

```tsx
<FlatList
  ref={flatListRef}
  data={vacancies}
  renderItem={renderItem}
  keyExtractor={item => item.id} // ✅ Убрали .toString()

  // ✅ CRITICAL: Performance props
  windowSize={5} // Render 5 screens worth of content (2 above + current + 2 below)
  initialNumToRender={2} // Render first 2 items immediately
  maxToRenderPerBatch={2} // Render max 2 items per batch
  updateCellsBatchingPeriod={50} // Update batch every 50ms
  removeClippedSubviews={Platform.OS === 'android'} // Android only (iOS has issues)

  // ✅ Paging & snapping
  pagingEnabled
  snapToAlignment="start"
  decelerationRate="fast"

  // ✅ Optimized item layout
  getItemLayout={(data, index) => ({
    length: SCREEN_HEIGHT,
    offset: SCREEN_HEIGHT * index,
    index,
  })}

  // ✅ Viewability
  onViewableItemsChanged={handleViewableItemsChanged}
  viewabilityConfig={viewabilityConfig}

  // ✅ Load more
  onEndReached={fetchMore}
  onEndReachedThreshold={0.5}

  // ✅ UI
  showsVerticalScrollIndicator={false}

  // ✅ CRITICAL: Disables unnecessary re-renders
  disableIntervalMomentum
  disableScrollViewPanResponder

  // ✅ CRITICAL: Memory management
  onMemoryWarning={() => {
    console.warn('FlatList memory warning');
    // Можно добавить логику для clear cache или reduce windowSize
  }}
/>
```

**Key Changes**:
1. ✅ Added `windowSize={5}` - only render 5 screens
2. ✅ Added `initialNumToRender={2}` - reduce initial batch
3. ✅ Added `maxToRenderPerBatch={2}` - control batch size
4. ✅ Added `updateCellsBatchingPeriod={50}` - batch updates
5. ✅ Added `removeClippedSubviews` for Android
6. ✅ Added `disableIntervalMomentum` and `disableScrollViewPanResponder`
7. ✅ Removed `.toString()` from keyExtractor
8. ✅ Added `onMemoryWarning` handler

---

## P0-4: Video Component Pooling

### 📁 Новый файл: `src/components/video/VideoPool.tsx`

```tsx
/**
 * Video Pool Manager
 * Manages video instances to prevent memory leaks
 */
import { useRef, useEffect } from 'react';

const MAX_VIDEO_INSTANCES = Platform.OS === 'ios' ? 4 : 6;
const activeVideoInstances = new Set<string>();

export function useVideoPool(vacancyId: string, isActive: boolean) {
  const canPlayVideo = useRef(false);

  useEffect(() => {
    if (isActive) {
      // Check if we can create new video instance
      if (activeVideoInstances.size < MAX_VIDEO_INSTANCES) {
        activeVideoInstances.add(vacancyId);
        canPlayVideo.current = true;
      } else {
        console.warn(`Video pool limit reached (${MAX_VIDEO_INSTANCES})`);
        canPlayVideo.current = false;
      }
    } else {
      // Remove from pool when not active
      activeVideoInstances.delete(vacancyId);
      canPlayVideo.current = false;
    }

    return () => {
      activeVideoInstances.delete(vacancyId);
    };
  }, [vacancyId, isActive]);

  return canPlayVideo.current;
}
```

### Использование в VacancyCard:

```tsx
import { useVideoPool } from '@/components/video/VideoPool';

export const VacancyCard = memo(function VacancyCard({ vacancy, isActive, onApply }: VacancyCardProps) {
  const canPlayVideo = useVideoPool(vacancy.id, isActive);
  const videoRef = useRef<Video>(null);

  return (
    <View style={styles.container}>
      {canPlayVideo ? (
        <Video
          ref={videoRef}
          source={{ uri: vacancy.videoUrl }}
          paused={!isActive}
          // ... rest of props
        />
      ) : (
        // Показываем placeholder или thumbnail
        <Image
          source={{ uri: vacancy.thumbnailUrl || 'default_thumbnail.png' }}
          style={styles.video}
          resizeMode="cover"
        />
      )}
      {/* ... rest of component */}
    </View>
  );
});
```

**Benefits**:
1. ✅ Prevents OutOfMemory crashes
2. ✅ Limits concurrent video instances
3. ✅ Platform-specific limits
4. ✅ Graceful degradation (shows thumbnail)

---

## P0-5: Navigation Types

### 📁 Новый файл: `src/navigation/types.ts`

```tsx
/**
 * Navigation Types
 * Type-safe navigation with React Navigation
 */
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

// ===========================================
// ROOT STACK PARAM LIST
// ===========================================
export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;

  // Auth Screens (Modal)
  RegistrationRequired: undefined;
  Login: undefined;
  PhoneInput: undefined;
  SMSVerification: { phone: string };
  Registration: { phone: string };
  WelcomeBack: { user: { name: string; role: string } };
};

// ===========================================
// JOB SEEKER STACK PARAM LIST
// ===========================================
export type JobSeekerStackParamList = {
  Tabs: undefined;
  Feed: undefined;
  VacancyDetail: { vacancyId: string };
  CompanyDetail: { companyId: string };
  Application: { vacancyId: string };
  CreateResume: undefined;
  VideoRecord: {
    onVideoRecorded?: (videoPath: string, duration: number) => void;
    maxDuration?: number;
  };
  VideoPreview: {
    videoPath: string;
    duration: number;
    onConfirm?: (videoPath: string, duration: number) => void;
  };
  VideoPlayer: {
    videoUrl: string;
    videoId?: string;
  };
  Chat: {
    conversationId: string;
    recipientId: string;
    recipientName: string;
  };
  Notifications: undefined;
  Settings: undefined;
};

// ===========================================
// JOB SEEKER TAB PARAM LIST
// ===========================================
export type JobSeekerTabParamList = {
  Home: undefined;
  Search: { query?: string };
  Favorites: undefined;
  Applications: undefined;
  Profile: undefined;
};

// ===========================================
// EMPLOYER STACK PARAM LIST
// ===========================================
export type EmployerStackParamList = {
  Tabs: undefined;
  CreateVacancy: undefined;
  CreateVacancyV2: undefined;
  VideoRecord: {
    onVideoRecorded?: (videoPath: string, duration: number) => void;
    maxDuration?: number;
  };
  VideoPlayer: {
    videoUrl: string;
    videoId?: string;
  };
  MassMailing: undefined;
  Automation: undefined;
  ABTesting: undefined;
  DetailedAnalytics: undefined;
  Chat: {
    conversationId: string;
    recipientId: string;
    recipientName: string;
  };
  Wallet: undefined;
  TopUpModal: {
    amount?: number;
  };
};

// ===========================================
// EMPLOYER TAB PARAM LIST
// ===========================================
export type EmployerTabParamList = {
  Vacancies: undefined;
  Candidates: undefined;
  Analytics: undefined;
  Notifications: undefined;
  Settings: undefined;
};

// ===========================================
// SCREEN PROPS
// ===========================================

// Root Stack Screen Props
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

// Job Seeker Stack Screen Props
export type JobSeekerStackScreenProps<T extends keyof JobSeekerStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<JobSeekerStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

// Job Seeker Tab Screen Props
export type JobSeekerTabScreenProps<T extends keyof JobSeekerTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<JobSeekerTabParamList, T>,
    JobSeekerStackScreenProps<keyof JobSeekerStackParamList>
  >;

// Employer Stack Screen Props
export type EmployerStackScreenProps<T extends keyof EmployerStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<EmployerStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

// Employer Tab Screen Props
export type EmployerTabScreenProps<T extends keyof EmployerTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<EmployerTabParamList, T>,
    EmployerStackScreenProps<keyof EmployerStackParamList>
  >;

// ===========================================
// DECLARATION MERGING
// ===========================================
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
```

### Использование в MainFeedScreen:

```tsx
import type { JobSeekerStackScreenProps } from '@/navigation/types';

type Props = JobSeekerStackScreenProps<'Feed'>;

export function MainFeedScreen({ navigation, route }: Props) {
  // ✅ Type-safe navigation
  navigation.navigate('RegistrationRequired'); // ✅ Autocomplete works
  navigation.navigate('Application', { vacancyId: '123' }); // ✅ Params typed
  // navigation.navigate('Unknown'); // ❌ TypeScript error

  // ...
}
```

**Benefits**:
1. ✅ Type-safe navigation.navigate()
2. ✅ Autocomplete для route names
3. ✅ Type checking для params
4. ✅ Refactor-safe

---

## P0-6: ActionButtons Memoization

### 📁 Файл: `src/components/feed/ActionButtons.tsx`

### ❌ BEFORE

```tsx
export function ActionButtons({ vacancy, isLiked, isSaved, onLike, onComment, onSave, onShare }: ActionButtonsProps) {
  const scale = useSharedValue(1);
  // ...
}
```

### ✅ AFTER

```tsx
import React, { memo, useCallback } from 'react';

export const ActionButtons = memo(function ActionButtons({
  vacancy,
  isLiked,
  isSaved,
  onLike,
  onComment,
  onSave,
  onShare,
}: ActionButtonsProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }), []); // ✅ Empty deps для performance

  const handleLikePress = useCallback(() => {
    'worklet'; // ✅ Worklet directive
    scale.value = withSpring(1.2, {}, () => {
      scale.value = withSpring(1);
    });
    runOnJS(onLike)(); // ✅ Run callback on JS thread
  }, [onLike, scale]);

  return (
    <View style={styles.container}>
      {/* Аватар компании */}
      <TouchableOpacity style={styles.avatarButton}>
        <View style={styles.avatarCircle}>
          {vacancy.employer.logoUrl ? (
            <Image source={{ uri: vacancy.employer.logoUrl }} style={styles.avatar} />
          ) : (
            <Text style={styles.avatarText}>{vacancy.employer.companyName[0]}</Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Лайк */}
      <Animated.View style={animatedStyle}>
        <TouchableOpacity style={styles.button} onPress={handleLikePress}>
          <Icon
            name={isLiked ? 'heart' : 'heart-outline'}
            size={32}
            color={isLiked ? '#FF0000' : colors.softWhite}
          />
          <Text style={styles.buttonText}>
            {vacancy.applications > 0 ? vacancy.applications : ''}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Rest of buttons */}
      {/* ... */}
    </View>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.vacancy.id === nextProps.vacancy.id &&
    prevProps.isLiked === nextProps.isLiked &&
    prevProps.isSaved === nextProps.isSaved &&
    prevProps.vacancy.applications === nextProps.vacancy.applications
  );
});
```

**Key Changes**:
1. ✅ Wrapped in `React.memo()`
2. ✅ Added `'worklet'` directive
3. ✅ Used `runOnJS()` for callbacks
4. ✅ Memoized `animatedStyle`
5. ✅ Custom comparison function

---

## P0-7: handleViewableItemsChanged Fix

### 📁 Файл: `src/screens/MainFeedScreen.tsx`

### ❌ BEFORE

```tsx
const handleViewableItemsChanged = useRef(({ viewableItems }: any) => {
  if (viewableItems.length > 0) {
    setCurrentIndex(viewableItems[0].index || 0);
  }
}).current;

const viewabilityConfig = useRef({
  itemVisiblePercentThreshold: 50,
}).current;
```

### ✅ AFTER

```tsx
const viewabilityConfig = useMemo(() => ({
  itemVisiblePercentThreshold: 50,
  minimumViewTime: 100, // ✅ Добавили minimum view time
}), []);

const handleViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
  if (viewableItems.length > 0 && viewableItems[0].index !== null) {
    setCurrentIndex(viewableItems[0].index);
  }
}, []); // ✅ Empty deps - setCurrentIndex is stable
```

**Key Changes**:
1. ✅ Changed from `useRef` to `useCallback`
2. ✅ Added type for `viewableItems`
3. ✅ Added null check for `index`
4. ✅ Changed `viewabilityConfig` to `useMemo`
5. ✅ Added `minimumViewTime`

---

## P0-8: Video seek Error Handling

### 📁 Файл: `src/components/feed/VacancyCard.tsx`

### ❌ BEFORE

```tsx
useEffect(() => {
  if (videoRef.current && isActive) {
    videoRef.current.seek(0);
  }
}, [isActive]);
```

### ✅ AFTER

```tsx
const [isVideoReady, setIsVideoReady] = useState(false);

useEffect(() => {
  if (!isActive || !isVideoReady || !videoRef.current) {
    return;
  }

  const seekToStart = async () => {
    try {
      await videoRef.current?.seek(0);
    } catch (error) {
      console.error(`Failed to seek video ${vacancy.id}:`, error);
      // Fallback: pause and try again
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
}, [isActive, isVideoReady, vacancy.id]);

const handleLoad = useCallback(() => {
  setIsVideoReady(true);
}, []);

const handleError = useCallback((error: any) => {
  console.error('Video error:', error);
  setIsVideoReady(false);
}, []);

return (
  <Video
    ref={videoRef}
    onLoad={handleLoad}
    onError={handleError}
    // ...
  />
);
```

**Key Changes**:
1. ✅ Added `isVideoReady` state
2. ✅ Wrapped seek in try/catch
3. ✅ Added retry logic
4. ✅ Added proper error logging

---

## P0-9: ResumeVideoPlayer Memory Leak

### 📁 Файл: `src/components/video/ResumeVideoPlayer.tsx`

### ❌ BEFORE

```tsx
useEffect(() => {
  return () => {
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
    }
    if (isPlaying) {
      setIsPlaying(false);
    }
  };
}, [isPlaying]);
```

### ✅ AFTER

```tsx
useEffect(() => {
  // Cleanup on unmount
  return () => {
    // Clear timer
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
      deleteTimerRef.current = null;
    }
  };
}, []); // ✅ Empty deps - только при unmount

// Separate effect для isPlaying
useEffect(() => {
  // Pause video when component unmounts or video becomes inactive
  if (!isPlaying && videoRef.current) {
    try {
      videoRef.current.pause?.();
    } catch (error) {
      console.error('Error pausing video:', error);
    }
  }
}, [isPlaying]);
```

**Key Changes**:
1. ✅ Separated cleanup effect (empty deps)
2. ✅ Removed state update from cleanup
3. ✅ Added null assignment to timerRef
4. ✅ Separate effect для video pause

---

## P0-10: API Refresh Race Condition

### 📁 Файл: `src/services/api.ts`

### ❌ BEFORE

```tsx
if (error.response?.status === 401 && !originalRequest._retry) {
  originalRequest._retry = true;
  const newTokens = await this.refreshAccessToken();
  // ❌ Concurrent calls могут вызвать multiple refreshes
}
```

### ✅ AFTER

```tsx
class APIService {
  private refreshPromise: Promise<AuthTokens | null> | null = null;

  // ... existing code ...

  private async refreshAccessToken(): Promise<AuthTokens | null> {
    // ✅ Return existing promise if refresh is in progress
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // ✅ Create new refresh promise
    this.refreshPromise = (async () => {
      try {
        if (!this.refreshToken) {
          await this.loadTokensFromStorage();
        }

        if (!this.refreshToken) {
          return null;
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken: this.refreshToken,
        });

        const tokens = response.data.tokens;
        await this.saveTokens(tokens);

        return tokens;
      } catch (error) {
        console.error('Error refreshing token:', error);
        return null;
      } finally {
        // ✅ Clear promise after completion
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  // Response interceptor (unchanged except using new refresh logic)
  this.client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as any;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const newTokens = await this.refreshAccessToken(); // ✅ Теперь safe для concurrent calls

          if (newTokens) {
            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            return this.client(originalRequest);
          }
        } catch (refreshError) {
          await this.logout();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
}
```

**Key Changes**:
1. ✅ Added `refreshPromise` field
2. ✅ Return existing promise if refresh in progress
3. ✅ Clear promise after completion
4. ✅ Prevents multiple concurrent refresh calls

---

## P0-11: Guest View Counter Atomicity

### 📁 Новый файл: `src/utils/guestViewCounter.ts`

```tsx
/**
 * Guest View Counter with Atomic Operations
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@360rabota:guest_views';

interface GuestViewData {
  count: number;
  viewedVacancies: string[];
  firstViewAt: string;
  lastViewAt: string;
}

// ✅ In-memory lock для atomicity
let operationLock: Promise<void> = Promise.resolve();

async function atomicOperation<T>(operation: () => Promise<T>): Promise<T> {
  // Wait for previous operation
  await operationLock;

  // Create new lock
  let releaseLock: () => void;
  operationLock = new Promise(resolve => {
    releaseLock = resolve;
  });

  try {
    const result = await operation();
    return result;
  } finally {
    releaseLock!();
  }
}

export async function getGuestViews(): Promise<GuestViewData> {
  return atomicOperation(async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (!data) {
        return {
          count: 0,
          viewedVacancies: [],
          firstViewAt: new Date().toISOString(),
          lastViewAt: new Date().toISOString(),
        };
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error getting guest views:', error);
      return {
        count: 0,
        viewedVacancies: [],
        firstViewAt: new Date().toISOString(),
        lastViewAt: new Date().toISOString(),
      };
    }
  });
}

export async function incrementGuestView(vacancyId: string): Promise<GuestViewData> {
  return atomicOperation(async () => {
    const current = await getGuestViews();

    // Check if already viewed
    if (current.viewedVacancies.includes(vacancyId)) {
      return current;
    }

    const updated: GuestViewData = {
      count: current.count + 1,
      viewedVacancies: [...current.viewedVacancies, vacancyId],
      firstViewAt: current.firstViewAt || new Date().toISOString(),
      lastViewAt: new Date().toISOString(),
    };

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.error('Error incrementing guest view:', error);
      return current; // Return current on error
    }
  });
}

export async function resetGuestViews(): Promise<void> {
  return atomicOperation(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error resetting guest views:', error);
    }
  });
}
```

**Key Changes**:
1. ✅ Added in-memory lock mechanism
2. ✅ All operations wrapped in `atomicOperation()`
3. ✅ Prevents concurrent read-modify-write
4. ✅ Safe для быстрых последовательных вызовов

---

## P0-12: VideoRecordScreen Permissions

### 📁 Файл: `src/screens/video/VideoRecordScreen.tsx`

### ❌ BEFORE

```tsx
useEffect(() => {
  const checkPermissions = async () => {
    if (!hasCameraPermission) {
      await requestCameraPermission();
    }
    if (!hasMicrophonePermission) {
      await requestMicrophonePermission();
    }
  };
  checkPermissions();
}, []);

return (
  <View>
    <Camera device={device} isActive={true} />
  </View>
);
```

### ✅ AFTER

```tsx
const [permissionsGranted, setPermissionsGranted] = useState(false);
const [permissionsChecking, setPermissionsChecking] = useState(true);

useEffect(() => {
  const checkAndRequestPermissions = async () => {
    setPermissionsChecking(true);

    try {
      let cameraGranted = hasCameraPermission;
      let micGranted = hasMicrophonePermission;

      // Request camera permission
      if (!cameraGranted) {
        const result = await requestCameraPermission();
        cameraGranted = result;
      }

      // Request microphone permission
      if (!micGranted) {
        const result = await requestMicrophonePermission();
        micGranted = result;
      }

      // Check final status
      if (cameraGranted && micGranted) {
        setPermissionsGranted(true);
      } else {
        // Show error dialog
        Alert.alert(
          'Требуются разрешения',
          'Для записи видео необходимо разрешить доступ к камере и микрофону.',
          [
            { text: 'Отмена', onPress: () => navigation.goBack() },
            { text: 'Настройки', onPress: () => Linking.openSettings() },
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Ошибка', 'Не удалось запросить разрешения');
      navigation.goBack();
    } finally {
      setPermissionsChecking(false);
    }
  };

  checkAndRequestPermissions();
}, [hasCameraPermission, hasMicrophonePermission, requestCameraPermission, requestMicrophonePermission, navigation]);

// ✅ Render based on permissions state
if (permissionsChecking) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Проверка разрешений...</Text>
    </View>
  );
}

if (!permissionsGranted) {
  return (
    <View style={styles.container}>
      <Icon name="camera-off" size={64} color={colors.error} />
      <Text style={styles.errorText}>Нет доступа к камере</Text>
      <TouchableOpacity onPress={() => Linking.openSettings()}>
        <Text style={styles.settingsButton}>Открыть настройки</Text>
      </TouchableOpacity>
    </View>
  );
}

// ✅ Only render Camera when permissions granted
return (
  <View style={styles.container}>
    <Camera
      ref={camera}
      device={device}
      isActive={true}
      video={true}
      audio={true}
    />
  </View>
);
```

**Key Changes**:
1. ✅ Added `permissionsGranted` and `permissionsChecking` states
2. ✅ Block render until permissions checked
3. ✅ Show loading state while checking
4. ✅ Show error state if denied
5. ✅ Deep link to Settings if denied
6. ✅ Only render Camera when permissions granted

---

## 📊 IMPLEMENTATION SUMMARY

### Estimated Implementation Time:
- **Day 1**: P0-1, P0-2, P0-6 (Memoization) - **4 hours**
- **Day 2**: P0-3, P0-4 (FlatList + Video Pooling) - **6 hours**
- **Day 3**: P0-5, P0-7 (Navigation Types + ViewableItems) - **4 hours**
- **Day 4**: P0-8, P0-9, P0-10 (Error handling + Race conditions) - **6 hours**
- **Day 5**: P0-11, P0-12 (Atomicity + Permissions) - **4 hours**
- **Testing & QA**: **2 days**

**Total**: ~4-5 working days

### Testing Checklist:
- [ ] Test on iOS (iPhone 12, iPhone SE)
- [ ] Test on Android (Samsung S21, old device with Android 9)
- [ ] Memory profiling (before/after)
- [ ] FPS measurement (React DevTools Profiler)
- [ ] Network failure scenarios
- [ ] Permission denial scenarios
- [ ] Concurrent API calls
- [ ] Fast scrolling stress test

---

**NEXT**: Начните implementation с P0-1 (VacancyCard memoization) - самый простой fix с большим impact.
