/**
 * 360° РАБОТА - Image Picker Component
 * Choose images from gallery or take photo with camera
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { colors, typography, sizes } from '@/constants';
import { haptics } from '@/utils/haptics';

interface ImagePickerProps {
  onImageSelected: (imageData: {
    uri: string;
    width: number;
    height: number;
    fileSize: number;
  }) => void;
  onCancel?: () => void;
}

export function ImagePicker({ onImageSelected, onCancel }: ImagePickerProps) {
  // Request camera permission (Android)
  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Доступ к камере',
            message: 'Для съемки фотографий необходим доступ к камере',
            buttonNeutral: 'Спросить позже',
            buttonNegative: 'Отмена',
            buttonPositive: 'ОК',
          }
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('Error requesting camera permission:', err);
        return false;
      }
    }
    return true; // iOS handles permissions automatically
  };

  // Launch camera
  const handleTakePhoto = async () => {
    try {
      haptics.light();

      // Request permission
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert(
          'Нет доступа',
          'Для съемки фотографий необходим доступ к камере',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch camera
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
        saveToPhotos: false,
      });

      if (result.didCancel) {
        console.log('User cancelled camera');
        if (onCancel) onCancel();
        return;
      }

      if (result.errorCode) {
        console.error('Camera error:', result.errorMessage);
        Alert.alert('Ошибка', 'Не удалось сделать фото');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const image = result.assets[0];

        // Check file size (max 10MB)
        if (image.fileSize && image.fileSize > 10 * 1024 * 1024) {
          Alert.alert(
            'Файл слишком большой',
            'Максимальный размер изображения - 10MB'
          );
          return;
        }

        onImageSelected({
          uri: image.uri!,
          width: image.width!,
          height: image.height!,
          fileSize: image.fileSize!,
        });

        console.log('✅ Photo taken:', {
          uri: image.uri,
          width: image.width,
          height: image.height,
          size: image.fileSize,
        });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Ошибка', 'Не удалось запустить камеру');
    }
  };

  // Launch gallery
  const handleChooseFromGallery = async () => {
    try {
      haptics.light();

      // Launch gallery
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
        selectionLimit: 1,
      });

      if (result.didCancel) {
        console.log('User cancelled gallery');
        if (onCancel) onCancel();
        return;
      }

      if (result.errorCode) {
        console.error('Gallery error:', result.errorMessage);
        Alert.alert('Ошибка', 'Не удалось выбрать фото');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const image = result.assets[0];

        // Check file size (max 10MB)
        if (image.fileSize && image.fileSize > 10 * 1024 * 1024) {
          Alert.alert(
            'Файл слишком большой',
            'Максимальный размер изображения - 10MB'
          );
          return;
        }

        onImageSelected({
          uri: image.uri!,
          width: image.width!,
          height: image.height!,
          fileSize: image.fileSize!,
        });

        console.log('✅ Photo selected:', {
          uri: image.uri,
          width: image.width,
          height: image.height,
          size: image.fileSize,
        });
      }
    } catch (error) {
      console.error('Error choosing photo:', error);
      Alert.alert('Ошибка', 'Не удалось выбрать фото');
    }
  };

  return (
    <View style={styles.container}>
      {/* Take Photo Button */}
      <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
        <View style={styles.iconContainer}>
          <Icon name="camera" size={32} color={colors.primary} />
        </View>
        <Text style={styles.buttonText}>Сделать фото</Text>
      </TouchableOpacity>

      {/* Choose from Gallery Button */}
      <TouchableOpacity style={styles.button} onPress={handleChooseFromGallery}>
        <View style={styles.iconContainer}>
          <Icon name="image-multiple" size={32} color={colors.primary} />
        </View>
        <Text style={styles.buttonText}>Выбрать из галереи</Text>
      </TouchableOpacity>

      {/* Cancel Button */}
      {onCancel && (
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => {
            haptics.light();
            onCancel();
          }}
        >
          <Text style={styles.cancelButtonText}>Отмена</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: sizes.radiusLarge,
    borderTopRightRadius: sizes.radiusLarge,
    padding: sizes.lg,
    gap: sizes.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: sizes.radiusMedium,
    padding: sizes.md,
    gap: sizes.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    justifyContent: 'center',
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
