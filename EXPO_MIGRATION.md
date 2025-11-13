# 🚀 Миграция на Expo Dev + EAS Build

## 📋 Обзор

Проект **360° РАБОТА** мигрирован с React Native CLI на Expo SDK 51 для упрощения разработки и сборки.

---

## ⚙️ Установка зависимостей

### Шаг 1: Очистка старых зависимостей

```bash
# Удалить node_modules и lock файлы
rm -rf node_modules
rm package-lock.json
# или
rm yarn.lock
```

### Шаг 2: Установка Expo и зависимостей

```bash
# Установить все зависимости
npm install

# ИЛИ с yarn
yarn install
```

### Шаг 3: Установка EAS CLI (глобально)

```bash
npm install -g eas-cli
```

---

## 🎬 Запуск приложения

### Development (Expo Go - ограничено)

⚠️ **Внимание:** Из-за использования `react-native-video` и `react-native-vision-camera`, Expo Go НЕ поддерживается. Используйте Development Build.

### Development Build (рекомендуется)

```bash
# Запустить Metro bundler с dev client
npm run start:dev-client

# ИЛИ просто
npm start
```

### iOS Simulator

```bash
# Сначала установить development build
eas build --profile development --platform ios --local

# Запустить на симуляторе
npm run ios
```

### Android Emulator

```bash
# Сначала установить development build
eas build --profile development --platform android --local

# Запустить на эмуляторе
npm run android
```

---

## 🏗️ EAS Build

### Настройка EAS

```bash
# Логин в Expo
eas login

# Инициализация проекта (первый раз)
eas build:configure
```

### Development Build

```bash
# iOS
eas build --profile development --platform ios

# Android
eas build --profile development --platform android

# Оба платформы
eas build --profile development --platform all
```

### Preview Build (Internal Testing)

```bash
# iOS
eas build --profile preview --platform ios

# Android APK
eas build --profile preview --platform android
```

### Production Build

```bash
# iOS (App Store)
eas build --profile production --platform ios

# Android AAB (Google Play)
eas build --profile production --platform android

# Оба платформы
eas build --profile production --platform all
```

---

## 📱 Установка на устройство

### Development Build

После завершения build на EAS:

```bash
# iOS - установить на подключенное устройство
eas build:run --profile development --platform ios

# Android - скачать APK и установить вручную
# Или использовать QR код из EAS Build
```

---

## 🔧 Prebuild (для нативных изменений)

Если нужно изменить нативный код (iOS/Android):

```bash
# Генерация нативных проектов
npx expo prebuild

# Генерация с очисткой предыдущих изменений
npx expo prebuild --clean
```

⚠️ **После prebuild папки `ios/` и `android/` НЕ коммитятся в Git.**

---

## 📦 Обновление зависимостей

### Обновление Expo SDK

```bash
# Проверить доступные обновления
npx expo-doctor

# Обновить SDK (например, с 51 на 52)
npx expo install expo@latest
npx expo install --fix
```

### Обновление отдельных пакетов

```bash
# Обновить все Expo пакеты
npx expo install --fix

# Обновить конкретный пакет
npx expo install expo-av@latest
```

---

## 🎥 Видео плеер

### Использование expo-av (основной)

```typescript
import { Video } from 'expo-av';

<Video
  source={{ uri: videoUrl }}
  style={styles.video}
  useNativeControls
  resizeMode="contain"
  isLooping
/>
```

### Использование react-native-video (резервный)

⚠️ Требует Development Build

```typescript
import Video from 'react-native-video';

<Video
  source={{ uri: videoUrl }}
  style={styles.video}
  controls
  resizeMode="contain"
  repeat
/>
```

---

## 📷 Камера

### Использование expo-camera

```typescript
import { Camera } from 'expo-camera';

const [permission, requestPermission] = Camera.useCameraPermissions();
```

### Использование react-native-vision-camera

⚠️ Требует Development Build + настроен в app.json

```typescript
import { Camera } from 'react-native-vision-camera';
```

---

## 🐛 Troubleshooting

### Проблема: Module not found

```bash
# Очистить cache
npx expo start --clear

# Переустановить зависимости
rm -rf node_modules
npm install
```

### Проблема: Metro bundler ошибка

```bash
# Остановить все процессы
killall -9 node

# Очистить watchman
watchman watch-del-all

# Перезапустить
npm start
```

### Проблема: iOS build failed

```bash
# Очистить build cache
rm -rf ios/build
cd ios && pod install && cd ..

# Пересобрать
npm run ios
```

### Проблема: Android build failed

```bash
# Очистить gradle cache
cd android && ./gradlew clean && cd ..

# Пересобрать
npm run android
```

---

## 📝 Важные замечания

### Нативные модули

Проект использует следующие нативные модули:
- `react-native-video` - требует Development Build
- `react-native-vision-camera` - требует Development Build
- `@react-native-community/slider` - требует Development Build

**Expo Go НЕ поддерживается!** Используйте только Development Build.

### app.json конфигурация

После изменения `app.json`:
- Необходимо пересобрать Development Build
- Изменения не применятся в уже установленном приложении

### EAS Build кредиты

- Free tier: 30 builds/месяц
- Для production: рекомендуется платный план

---

## 🔗 Полезные ссылки

- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [Development Builds](https://docs.expo.dev/development/introduction/)
- [Expo SDK API Reference](https://docs.expo.dev/versions/latest/)
- [Custom Native Code](https://docs.expo.dev/workflow/customizing/)

---

## ✅ Чек-лист миграции

- [x] app.json создан
- [x] eas.json создан
- [x] package.json обновлен
- [x] metro.config.js обновлен
- [x] .gitignore обновлен
- [ ] Установить зависимости: `npm install`
- [ ] Логин в EAS: `eas login`
- [ ] Настроить проект: `eas build:configure`
- [ ] Создать Development Build: `eas build --profile development`
- [ ] Установить на устройство
- [ ] Протестировать основные функции

---

**Готово к запуску!** 🚀
