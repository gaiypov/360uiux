# 360° РАБОТА - Quick Start Guide

## 📋 Краткий Обзор

**360° РАБОТА** - премиум-платформа для поиска работы с видео-резюме и вакансиями.

**Архитектура:**
- 📱 Mobile App: React Native + Expo 51
- 🔧 Backend: Node.js + Express + TypeScript + Prisma
- 💻 Web Dashboard: Next.js 14
- 🗄️ Database: PostgreSQL

---

## 🚀 Быстрый Старт

### 1. Установка Зависимостей

```bash
# Root (Mobile App)
npm install

# Backend
cd backend
npm install

# Web Dashboard
cd web-dashboard
npm install
```

### 2. Настройка Окружения

**Backend (.env):**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/360rabota"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
API_VIDEO_API_KEY="your-api-video-key"
REDIS_URL="redis://localhost:6379"
SMS_API_KEY="your-sms-api-key"
```

### 3. Запуск Базы Данных

```bash
# Prisma migrations
cd backend
npm run migrate:up

# Generate Prisma Client
npx prisma generate
```

### 4. Запуск Проектов

```bash
# Terminal 1: Backend
cd backend
npm run dev
# Запускается на http://localhost:3000

# Terminal 2: Mobile App
cd ..
npm start
# Expo DevTools

# Terminal 3: Web Dashboard
cd web-dashboard
npm run dev
# Запускается на http://localhost:3001
```

---

## 📁 Структура Проекта (Кратко)

```
360uiux/
│
├── src/                          # Mobile App (React Native)
│   ├── screens/                  # Экраны (auth, jobseeker, employer, admin)
│   ├── components/               # UI компоненты
│   ├── navigation/               # Навигация
│   ├── stores/                   # State Management (Zustand)
│   ├── services/                 # API сервисы
│   └── utils/                    # Утилиты
│
├── backend/                      # Backend API (Node.js)
│   ├── src/
│   │   ├── controllers/          # Контроллеры
│   │   ├── routes/               # API routes
│   │   ├── services/             # Бизнес-логика
│   │   ├── middleware/           # Middleware
│   │   └── server.ts             # Entry point
│   └── prisma/
│       └── schema.prisma         # Database schema
│
└── web-dashboard/                # Web Dashboard (Next.js)
    └── src/
        ├── app/                  # Pages (App Router)
        └── components/           # React компоненты
```

---

## 🎯 Основные Роли

### 👤 Соискатель (JobSeeker)
- Создание видео-резюме
- Просмотр ленты вакансий
- Отклики на вакансии
- Чат с работодателями

### 🏢 Работодатель (Employer)
- Создание вакансий с видео
- Просмотр откликов
- Просмотр видео-резюме (макс. 2 раза)
- Аналитика и статистика
- Кошелек и оплата

### 👮 Администратор (Moderator)
- Модерация видео
- Управление пользователями
- Финансовая отчетность
- Аналитика платформы

---

## 🔑 Ключевые API Endpoints

```
Auth:
POST   /api/auth/send-code         # Отправка SMS кода
POST   /api/auth/verify-code       # Проверка кода
POST   /api/auth/register          # Регистрация
POST   /api/auth/login             # Вход

Vacancies:
GET    /api/vacancies              # Список вакансий
POST   /api/vacancies              # Создание вакансии
GET    /api/vacancies/:id          # Детали вакансии
POST   /api/vacancies/:id/like     # Лайк вакансии

Applications:
POST   /api/applications           # Отклик на вакансию
GET    /api/applications           # Мои отклики
PUT    /api/applications/:id/status # Изменить статус

Videos:
POST   /api/videos/upload          # Загрузка видео
GET    /api/videos/:id             # Получить видео

Chat:
GET    /api/chat/:appId/messages   # История чата
POST   /api/chat/:appId/messages   # Отправить сообщение
```

---

## 🗄️ Основные Модели БД

```
User          - Пользователи (соискатели, работодатели, модераторы)
Video         - Видео (вакансии и резюме)
Vacancy       - Вакансии
Resume        - Резюме
Application   - Отклики
ChatMessage   - Сообщения в чате
Wallet        - Кошельки работодателей
Transaction   - Транзакции
```

---

## 🔐 Безопасность

- ✅ JWT Authentication (Access + Refresh tokens)
- ✅ SMS 2FA верификация
- ✅ Bcrypt для паролей
- ✅ Rate Limiting
- ✅ Helmet для HTTP headers
- ✅ CORS protection
- ✅ Input validation (Joi)
- ✅ Private video URLs
- ✅ 2-view limit для резюме
- ✅ HMAC webhook verification

---

## 📦 Технологии

### Mobile App
- React Native 0.74.5
- Expo 51
- React Navigation 6
- Zustand (State)
- Axios (HTTP)
- Expo Camera, AV, Video

### Backend
- Node.js 18+
- Express 4.18
- TypeScript 5.3
- Prisma ORM 6.19
- PostgreSQL
- Redis (ioredis)
- JWT, Bcrypt
- Winston (Logging)

### Web Dashboard
- Next.js 14.2
- React 18.2
- Tailwind CSS 3.4
- Recharts (Charts)
- Lucide React (Icons)

---

## 🔄 Основные Команды

### Mobile App
```bash
npm start              # Запуск Expo DevTools
npm run android        # Запуск на Android
npm run ios            # Запуск на iOS
npm run web            # Запуск в браузере
npm run lint           # Линтинг
```

### Backend
```bash
npm run dev            # Development mode
npm run build          # Build TypeScript
npm start              # Production mode
npm run migrate:up     # Run migrations
npm run migrate:down   # Rollback migrations
```

### Web Dashboard
```bash
npm run dev            # Development server
npm run build          # Production build
npm start              # Production server
npm run lint           # Линтинг
```

---

## 📚 Документация

Подробная документация:
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Полная структура проекта
- **[ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md)** - Архитектурные диаграммы
- **[README.md](./README.md)** - Основная документация
- **[NAVIGATION_STRUCTURE.md](./NAVIGATION_STRUCTURE.md)** - Структура навигации
- **[VIDEO_UPLOAD_SETUP.md](./docs/VIDEO_UPLOAD_SETUP.md)** - Настройка видео

---

## 🆘 Помощь

### Частые Проблемы

**1. Expo не запускается:**
```bash
npx expo start --clear
```

**2. Проблемы с Prisma:**
```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

**3. Ошибки TypeScript:**
```bash
npm run build
```

**4. Проблемы с портами:**
```bash
# Backend (default: 3000)
# Web Dashboard (default: 3001)
# Проверьте, свободны ли порты
```

---

## 🌟 Особенности Проекта

### Уникальные Фичи
1. **Приватные Видео-Резюме** - видео доступно только 2 раза для работодателя
2. **Tinder-Style Feed** - свайп-лента вакансий
3. **Real-time Chat** - WebSocket чат между работодателем и соискателем
4. **Гостевой Режим** - просмотр без регистрации с аналитикой
5. **AI + Ручная Модерация** - двухступенчатая проверка видео
6. **Multi-Provider** - поддержка разных провайдеров видео и БД

### Premium UI/UX
- Glass morphism эффекты
- Metal textures
- Neon glow
- Haptic feedback
- Smooth animations
- Dark theme

---

## 📞 Контакты

**Проект:** 360° РАБОТА
**Версия:** 3.0
**Архитектура:** v3 (Private Resume Videos)

---

**Быстрые ссылки:**
- [Полная структура проекта](./PROJECT_STRUCTURE.md)
- [Архитектурные диаграммы](./ARCHITECTURE_DIAGRAM.md)
- [Следующие шаги](./NEXT_STEPS.md)
