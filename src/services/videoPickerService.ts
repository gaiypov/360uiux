/**
 * Video Picker Service
 *
 * REQUIRED DEPENDENCY:
 * npm install react-native-image-picker
 *
 * iOS: Add photo library permissions to Info.plist:
 * <key>NSPhotoLibraryUsageDescription</key>
 * <string>Нужен доступ к галерее для загрузки видео</string>
 *
 * Android: Add permission to AndroidManifest.xml:
 * <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
 */

import { Platform, Alert } from 'react-native';
import { validateVideo, VideoInfo } from '@/utils/videoValidation';

// Note: This will be imported once react-native-image-picker is installed
// import { launchImageLibrary, Asset } from 'react-native-image-picker';

interface PickVideoOptions {
  maxDuration?: number; // in seconds
  minDuration?: number; // in seconds
  maxSizeInMB?: number;
}

interface PickVideoResult {
  success: boolean;
  videoInfo?: VideoInfo;
  error?: string;
}

/**
 * Pick video from device gallery
 */
export async function pickVideoFromGallery(
  options: PickVideoOptions = {}
): Promise<PickVideoResult> {
  const {
    maxDuration = 180,
    minDuration = 10,
    maxSizeInMB = 100,
  } = options;

  try {
    // TODO: Uncomment when react-native-image-picker is installed
    /*
    const result = await launchImageLibrary({
      mediaType: 'video',
      videoQuality: 'high',
      selectionLimit: 1,
    });

    if (result.didCancel) {
      return {
        success: false,
        error: 'Выбор отменен',
      };
    }

    if (result.errorCode) {
      return {
        success: false,
        error: result.errorMessage || 'Ошибка при выборе видео',
      };
    }

    const asset = result.assets?.[0];
    if (!asset || !asset.uri) {
      return {
        success: false,
        error: 'Видео не выбрано',
      };
    }

    // Get video info
    const videoInfo: VideoInfo = {
      path: asset.uri,
      duration: asset.duration || 0,
      size: asset.fileSize || 0,
      width: asset.width,
      height: asset.height,
    };

    // Validate video
    const validationResult = validateVideo(videoInfo, {
      minDuration,
      maxDuration,
      maxSizeInMB,
      allowedFormats: ['mp4', 'mov', 'avi', 'mkv', 'm4v'],
    });

    if (!validationResult.isValid) {
      Alert.alert('Ошибка', validationResult.error);
      return {
        success: false,
        error: validationResult.error,
      };
    }

    return {
      success: true,
      videoInfo,
    };
    */

    // Temporary mock response until library is installed
    Alert.alert(
      'Библиотека не установлена',
      'Установите react-native-image-picker:\nnpm install react-native-image-picker'
    );
    return {
      success: false,
      error: 'react-native-image-picker not installed',
    };
  } catch (error: any) {
    console.error('Error picking video:', error);
    return {
      success: false,
      error: error.message || 'Неизвестная ошибка',
    };
  }
}

/**
 * Request gallery permissions
 */
export async function requestGalleryPermissions(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      // TODO: Request Android permissions using PermissionsAndroid
      /*
      import { PermissionsAndroid } from 'react-native';

      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Доступ к галерее',
          message: 'Приложению нужен доступ к галерее для выбора видео',
          buttonNeutral: 'Спросить позже',
          buttonNegative: 'Отмена',
          buttonPositive: 'Разрешить',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
      */
      return true;
    }
    return true;
  } catch (error) {
    console.error('Error requesting permissions:', error);
    return false;
  }
}
