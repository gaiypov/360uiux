# Настройка загрузки видео из галереи

## Мобильное приложение (React Native)

### Установка зависимости

Для работы функционала загрузки видео из галереи необходимо установить `react-native-image-picker`:

```bash
npm install react-native-image-picker
```

### Конфигурация iOS

1. Добавьте разрешения в `ios/360rabota/Info.plist`:

```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>Нужен доступ к галерее для загрузки видео вакансий</string>
<key>NSCameraUsageDescription</key>
<string>Нужен доступ к камере для записи видео вакансий</string>
<key>NSMicrophoneUsageDescription</key>
<string>Нужен доступ к микрофону для записи видео вакансий</string>
```

2. Установите pod зависимости:

```bash
cd ios
pod install
cd ..
```

### Конфигурация Android

1. Добавьте разрешения в `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

2. Для Android 13+ (API 33+) добавьте также:

```xml
<uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
```

### Активация функционала

После установки зависимости обновите файл `src/services/videoPickerService.ts`:

1. Раскомментируйте импорт в начале файла:

```typescript
import { launchImageLibrary, Asset } from 'react-native-image-picker';
```

2. Раскомментируйте основной код в функции `pickVideoFromGallery()`:

```typescript
export async function pickVideoFromGallery(
  options: PickVideoOptions = {}
): Promise<PickVideoResult> {
  const {
    maxDuration = 180,
    minDuration = 10,
    maxSizeInMB = 100,
  } = options;

  try {
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
  } catch (error: any) {
    console.error('Error picking video:', error);
    return {
      success: false,
      error: error.message || 'Неизвестная ошибка',
    };
  }
}
```

3. Удалите временный mock код (Alert.alert с сообщением об установке библиотеки)

### Перезапуск приложения

После установки зависимости и конфигурации перезапустите приложение:

```bash
# iOS
npm run ios

# Android
npm run android
```

## Веб-дашборд (Next.js)

Веб-версия работает сразу без дополнительной настройки. Используются нативные браузерные API:

- Drag & Drop для перетаскивания видео
- File Input для выбора файла
- Video element для предпросмотра

### Ограничения браузера

- Максимальный размер файла: 100 МБ
- Поддерживаемые форматы: MP4, MOV, AVI, MKV
- Длительность видео: 10-180 секунд

### Проверка совместимости

Для оптимальной работы рекомендуется:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Валидация видео

Оба варианта (мобильный и веб) используют общие правила валидации:

### Формат
- Разрешенные форматы: MP4, MOV, AVI, MKV
- Рекомендуемый формат: MP4 (H.264)

### Размер
- Максимальный размер: 100 МБ
- Рекомендуемое разрешение: 1920x1080 или 1080x1920 (вертикальное)

### Длительность
- Минимум: 10 секунд
- Максимум: 180 секунд (3 минуты)
- Рекомендуемая длительность: 30-60 секунд

## Использование

### Создание вакансии (Мобильное приложение)

1. Откройте экран создания вакансии
2. На шаге 2 "Видео" выберите один из вариантов:
   - **Записать видео** - откроет камеру для записи
   - **Загрузить видео** - откроет галерею для выбора видео

### Создание вакансии (Веб-дашборд)

1. Перейдите в раздел "Вакансии"
2. Нажмите "Создать вакансию"
3. Заполните информацию о вакансии
4. На шаге "Видео":
   - Перетащите видео файл в зону загрузки
   - Или нажмите для выбора файла
5. Дождитесь валидации и предпросмотра
6. Опубликуйте вакансию

## Troubleshooting

### iOS: "Photo Library usage description not found"

Добавьте описание в Info.plist (см. раздел "Конфигурация iOS")

### Android: "Permission denied"

1. Проверьте наличие разрешений в AndroidManifest.xml
2. Для Android 13+ используйте новые разрешения для медиа
3. Проверьте, что пользователь предоставил разрешения в настройках приложения

### Видео не проигрывается в предпросмотре

1. Проверьте формат видео (должен быть MP4/MOV/AVI/MKV)
2. Убедитесь, что видео не повреждено
3. Проверьте размер файла (не более 100 МБ)

### Ошибка "Видео слишком длинное/короткое"

Видео должно быть от 10 до 180 секунд. Используйте видеоредактор для обрезки.

## Backend интеграция

Для полной функциональности необходимо реализовать API endpoint для загрузки видео:

```typescript
// POST /api/vacancies
// Content-Type: multipart/form-data

interface CreateVacancyRequest {
  video: File; // видео файл
  data: {
    title: string;
    salaryMin: number;
    salaryMax?: number;
    city: string;
    metro?: string;
    description?: string;
    requirements?: string;
    benefits?: string;
    experience: string;
    schedule: string;
    priorityModeration: boolean;
  };
}
```

Рекомендуется использовать облачное хранилище (AWS S3, Google Cloud Storage, Cloudinary) для хранения видео файлов.
