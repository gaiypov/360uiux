/**
 * 360° РАБОТА - Image Attachment Component
 * Display images in chat messages
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { colors, typography, sizes } from '@/constants';
import { haptics } from '@/utils/haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IMAGE_WIDTH = SCREEN_WIDTH * 0.6;

interface ImageAttachmentProps {
  imageUrl: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  isSender: boolean;
}

export function ImageAttachment({
  imageUrl,
  thumbnailUrl,
  width: imageWidth,
  height: imageHeight,
  isSender,
}: ImageAttachmentProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [error, setError] = useState(false);

  // Calculate aspect ratio
  const aspectRatio =
    imageWidth && imageHeight ? imageWidth / imageHeight : 4 / 3;

  const handlePress = () => {
    haptics.light();
    setIsFullScreen(true);
  };

  const handleClose = () => {
    haptics.light();
    setIsFullScreen(false);
  };

  if (error) {
    return (
      <View style={[styles.errorContainer, isSender && styles.senderContainer]}>
        <Icon name="image-broken" size={32} color={colors.textSecondary} />
        <Text style={styles.errorText}>Не удалось загрузить изображение</Text>
      </View>
    );
  }

  return (
    <>
      {/* Thumbnail/Preview */}
      <TouchableOpacity
        style={[styles.container, isSender && styles.senderContainer]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: thumbnailUrl || imageUrl }}
          style={[
            styles.image,
            {
              width: IMAGE_WIDTH,
              aspectRatio,
            },
          ]}
          resizeMode="cover"
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setError(true);
          }}
        />

        {/* Loading indicator */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color="#fff" />
          </View>
        )}

        {/* Zoom icon overlay */}
        <View style={styles.zoomIconContainer}>
          <Icon name="magnify-plus-outline" size={20} color="#fff" />
        </View>
      </TouchableOpacity>

      {/* Full screen modal */}
      <Modal
        visible={isFullScreen}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <View style={styles.modalContainer}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Icon name="close" size={28} color="#fff" />
          </TouchableOpacity>

          {/* Full screen image with pinch zoom */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            maximumZoomScale={3}
            minimumZoomScale={1}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            <Image
              source={{ uri: imageUrl }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          </ScrollView>

          {/* Download/Share buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                // TODO: Implement download
                Alert.alert('Скоро', 'Функция скачивания будет доступна в ближайшее время');
              }}
            >
              <Icon name="download" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Скачать</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                // TODO: Implement share
                Alert.alert('Скоро', 'Функция поделиться будет доступна в ближайшее время');
              }}
            >
              <Icon name="share-variant" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Поделиться</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: sizes.radiusMedium,
    overflow: 'hidden',
    backgroundColor: colors.carbonGray,
    position: 'relative',
  },
  senderContainer: {
    alignSelf: 'flex-end',
  },
  image: {
    backgroundColor: colors.carbonGray,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  zoomIconContainer: {
    position: 'absolute',
    top: sizes.xs,
    right: sizes.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: sizes.radiusSmall,
    padding: 4,
  },
  errorContainer: {
    width: IMAGE_WIDTH,
    height: 150,
    borderRadius: sizes.radiusMedium,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    gap: sizes.xs,
  },
  errorText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // Full screen modal
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: sizes.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: sizes.md,
    paddingVertical: sizes.sm,
    borderRadius: sizes.radiusMedium,
    gap: sizes.xs,
  },
  actionButtonText: {
    ...typography.body,
    color: '#fff',
    fontWeight: '600',
  },
});
