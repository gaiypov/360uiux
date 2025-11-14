/**
 * 360° РАБОТА - ActionButtons Component
 * TikTok-style side action buttons
 * P1 FIX: Added accessibility labels for screen readers
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { colors, sizes, typography } from '@/constants';

interface ActionButtonsProps {
  vacancy: {
    employer: {
      companyName: string;
      logoUrl?: string;
    };
    applications: number;
    commentsCount?: number;
    isLiked?: boolean;
    isSaved?: boolean;
  };
  isLiked: boolean;
  isSaved: boolean;
  onLike: () => void;
  onComment: () => void;
  onSave: () => void;
  onShare: () => void;
}

export function ActionButtons({
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
  }));

  const handleLikePress = () => {
    scale.value = withSpring(1.2, {}, () => {
      scale.value = withSpring(1);
    });
    onLike();
  };

  return (
    <View style={styles.container}>
      {/* Аватар компании */}
      <TouchableOpacity
        style={styles.avatarButton}
        accessibilityRole="button"
        accessibilityLabel={`Профиль компании ${vacancy.employer.companyName}`}
      >
        <View style={styles.avatarCircle}>
          {vacancy.employer.logoUrl ? (
            <Image
              source={{ uri: vacancy.employer.logoUrl }}
              style={styles.avatar}
              accessibilityIgnoresInvertColors
            />
          ) : (
            <Text style={styles.avatarText}>{vacancy.employer.companyName[0]}</Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Лайк */}
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleLikePress}
          accessibilityRole="button"
          accessibilityLabel={isLiked ? 'Убрать лайк' : 'Поставить лайк'}
          accessibilityState={{ selected: isLiked }}
          accessibilityHint={`Всего откликов: ${vacancy.applications}`}
        >
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

      {/* Комментарии */}
      <TouchableOpacity
        style={styles.button}
        onPress={onComment}
        accessibilityRole="button"
        accessibilityLabel="Комментарии"
        accessibilityHint={`Всего комментариев: ${vacancy.commentsCount || 0}`}
      >
        <Icon name="comment-outline" size={30} color={colors.softWhite} />
        <Text style={styles.buttonText}>
          {vacancy.commentsCount && vacancy.commentsCount > 0 ? vacancy.commentsCount : ''}
        </Text>
      </TouchableOpacity>

      {/* Избранное */}
      <TouchableOpacity
        style={styles.button}
        onPress={onSave}
        accessibilityRole="button"
        accessibilityLabel={isSaved ? 'Удалить из избранного' : 'Добавить в избранное'}
        accessibilityState={{ selected: isSaved }}
      >
        <Icon
          name={isSaved ? 'star' : 'star-outline'}
          size={32}
          color={isSaved ? '#FFD700' : colors.softWhite}
        />
      </TouchableOpacity>

      {/* Поделиться */}
      <TouchableOpacity
        style={styles.button}
        onPress={onShare}
        accessibilityRole="button"
        accessibilityLabel="Поделиться вакансией"
      >
        <Icon name="share-variant" size={30} color={colors.softWhite} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 12,
    bottom: 100,
    alignItems: 'center',
  },
  avatarButton: {
    marginBottom: 20,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.platinumSilver,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.softWhite,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.graphiteBlack,
  },
  button: {
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 12,
    color: colors.softWhite,
    marginTop: 4,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
