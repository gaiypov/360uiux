# 360° РАБОТА (Revolut Ultra Edition)

<div align="center">

**Премиальная платформа для поиска работы в стиле Revolut Ultra**

🖤 Черный дизайн | ⚡ Неоновые акценты | 💎 Glass Morphism | ✨ Плавные анимации

</div>

---

## 📱 О проекте

360° РАБОТА — это React Native приложение премиум-класса для поиска работы, вдохновленное дизайном Revolut Ultra. Приложение предлагает уникальный опыт просмотра вакансий в формате вертикального свайпа (как TikTok) с полноэкранным видео, стеклянными карточками и неоновыми эффектами.

### ✨ Ключевые особенности

- **🎨 Premium Design System**: Черный фон, glass morphism, неоновые акценты (фиолетовый + голубой)
- **📱 TikTok-style Feed**: Вертикальный свайп с полноэкранными видео вакансиями
- **🎭 Плавные анимации**: React Native Reanimated 3 для butter-smooth анимаций
- **💎 Металлический минимализм**: Clean UI в стиле Revolut Ultra
- **⚡ Мгновенный отклик**: Оптимизированная производительность
- **🔐 TypeScript**: Полная типизация для надежности кода

---

## 🛠️ Tech Stack

```
Framework:     React Native 0.74
Language:      TypeScript
State:         Zustand
Navigation:    React Navigation 6
UI:            Custom components (Revolut Ultra style)
Animations:    react-native-reanimated 3
Gestures:      react-native-gesture-handler
Blur:          @react-native-community/blur
Video:         react-native-video
Gradient:      react-native-linear-gradient
Icons:         react-native-vector-icons
HTTP:          axios
Storage:       AsyncStorage
```

---

## 🎨 Дизайн-система

### Цвета

```typescript
primaryBlack:   '#050505'  // Глубокий черный
graphiteGray:   '#1C1C1E'  // Графитовый серый
ultraViolet:    '#8E7FFF'  // Ультрафиолет (основной акцент)
cyberBlue:      '#39E0F8'  // Кибер-голубой (вторичный акцент)
liquidSilver:   '#D0D0D5'  // Жидкое серебро
softWhite:      '#FAFAFA'  // Мягкий белый
```

### Типографика

- **Заголовки**: Bold, Uppercase, Wide letter-spacing
- **Body**: Inter, Regular/Medium
- **Numbers**: Monoширинный шрифт для зарплат

### Эффекты

- **Glass Morphism**: `rgba(255, 255, 255, 0.08)` фон + blur
- **Neon Glow**: Shadows с ультрафиолетовым свечением
- **Gradients**: Фиолетовый → Голубой переходы

---

## 🚀 Быстрый старт

### Предварительные требования

- Node.js >= 18
- React Native development environment ([Setup Guide](https://reactnative.dev/docs/environment-setup))
- iOS: Xcode 14+ и CocoaPods
- Android: Android Studio и JDK 17

### Установка

```bash
# 1. Клонировать репозиторий
git clone https://github.com/gaiypov/360uiux.git
cd 360uiux

# 2. Установить зависимости
npm install

# 3. Установить pods (только iOS)
cd ios && pod install && cd ..

# 4. Запустить Metro bundler
npm start

# 5. Запустить на устройстве/симуляторе
# iOS:
npm run ios

# Android:
npm run android
```

---

## 📂 Структура проекта

```
360uiux/
├── src/
│   ├── components/          # UI компоненты
│   │   ├── ui/             # Базовые UI (GlassButton, GlassCard, etc.)
│   │   └── vacancy/        # Компоненты вакансий (PremiumVacancyCard)
│   ├── screens/            # Экраны приложения
│   │   ├── auth/           # Авторизация (Login, RoleSelection)
│   │   ├── jobseeker/      # Экраны соискателя (VacancyFeed)
│   │   ├── employer/       # Экраны работодателя
│   │   ├── SplashScreen.tsx
│   │   └── OnboardingScreen.tsx
│   ├── navigation/         # Навигация
│   │   ├── RootNavigator.tsx
│   │   └── JobSeekerNavigator.tsx
│   ├── stores/             # Zustand stores (authStore)
│   ├── hooks/              # Custom hooks (useVacancyFeed)
│   ├── services/           # API сервисы (api.ts)
│   ├── types/              # TypeScript типы
│   ├── constants/          # Дизайн-система (colors, typography, sizes, effects)
│   └── assets/             # Изображения, шрифты
├── App.tsx                 # Главный компонент
├── index.js                # Entry point
└── package.json
```

---

## 🎯 Основные экраны

### 1. Splash Screen
- 360° вращающееся неоновое кольцо
- Плавная анимация появления логотипа
- Elastic scale эффект

### 2. Onboarding
- Премиум приветствие
- Glass morphism карточки с фичами
- Неоновый CTA button

### 3. Auth Flow
- **Role Selection**: Выбор роли (Соискатель/Работодатель)
- **Login**: Вход с glass input fields
- **Register**: Регистрация

### 4. Vacancy Feed (Главный экран)
- **TikTok-style вертикальный свайп**
- **Полноэкранное видео** вакансий
- **Glass info card** с деталями:
  - Название компании + рейтинг
  - Профессия
  - Зарплата (с неоновым градиентом)
  - Локация + метро
  - Benefits (chip badges)
- **Боковая панель действий**: Компания, Лайк, Поделиться
- **CTA кнопка "В РАБОТУ"** с glow эффектом

---

## 🎨 UI Компоненты

### GlassButton
Кнопка с тремя вариантами:
- `primary`: Неоновый градиент + glow
- `secondary`: Прозрачная с border
- `ghost`: Минималистичная

```tsx
<GlassButton
  title="ВОЙТИ"
  onPress={handleLogin}
  variant="primary"
/>
```

### GlassCard
Карточка с glass morphism эффектом:
```tsx
<GlassCard>
  <Text>Content</Text>
</GlassCard>
```

### NeonIconButton
Иконка-кнопка с неоновым свечением при активации:
```tsx
<NeonIconButton
  icon="home"
  active={true}
  onPress={handlePress}
/>
```

### PremiumVacancyCard
Полноэкранная карточка вакансии с видео:
```tsx
<PremiumVacancyCard
  vacancy={vacancy}
  isActive={true}
  onApply={handleApply}
/>
```

---

## 🔧 Настройка и конфигурация

### Environment Variables

Создайте `.env` файл в корне проекта:

```env
API_BASE_URL=https://api.360rabota.ru/v1
```

### Иконки (react-native-vector-icons)

**iOS**: Уже настроено через CocoaPods

**Android**: Добавьте в `android/app/build.gradle`:
```gradle
apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
```

### Reanimated Plugin

Убедитесь, что `react-native-reanimated/plugin` последний в списке плагинов в `babel.config.js` (уже настроено).

---

## 🗺️ Roadmap

### Phase 1: MVP ✅
- [x] Дизайн-система
- [x] UI компоненты
- [x] Splash & Onboarding
- [x] Auth flow
- [x] Vacancy Feed с видео
- [x] Navigation

### Phase 2: Features 🚧
- [ ] Поиск вакансий
- [ ] Фильтры и сортировка
- [ ] Избранное
- [ ] История откликов
- [ ] Профиль пользователя
- [ ] Push уведомления

### Phase 3: Advanced 📋
- [ ] Чаты с работодателями
- [ ] Видео-резюме
- [ ] AI рекомендации
- [ ] Аналитика для работодателей
- [ ] Премиум подписка

---

## 🤝 Contributing

Мы приветствуем ваш вклад! Пожалуйста:

1. Fork проект
2. Создайте feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

---

## 📄 License

Этот проект лицензирован под MIT License.

---

## 👨‍💻 Автор

**Gaiypov**
- GitHub: [@gaiypov](https://github.com/gaiypov)

---

<div align="center">

**Сделано с ❤️ и ⚡ в стиле Revolut Ultra**

</div>
