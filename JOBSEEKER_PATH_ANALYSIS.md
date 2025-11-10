# 📋 Анализ Пути Соискателя (Job Seeker) - 360° РАБОТА

## 🎯 Обзор Пути Пользователя

### Навигация (Tabs + Stack)

**Bottom Tabs:**
1. **Feed** - Лента вакансий (TikTok-style)
2. **Search** - Поиск вакансий
3. **Applications** - Мои отклики
4. **Notifications** - Уведомления
5. **Settings** - Настройки

**Stack Screens:**
- VacancyDetail - Детали вакансии
- CompanyDetail - О компании
- Application - Подача отклика
- Favorites - Избранное
- Profile - Профиль
- CreateResume - Создание резюме
- VideoRecord/Preview/Player - Работа с видео
- Chat - Чат с работодателем

---

## 🔴 КРИТИЧНЫЕ ПРОБЛЕМЫ

### 1. Frontend НЕ подключен к Backend API

#### ApplicationScreen.tsx (строки 54-102)
```typescript
// TODO: API call to check if user has resume video
// const result = await apiService.getMyResumeVideo();
// setHasResumeVideo(!!result.video);

// Имитация проверки
await new Promise((resolve) => setTimeout(resolve, 500));
setHasResumeVideo(false); // ❌ Всегда false!
```

```typescript
// TODO: API call to submit application
// const result = await apiService.createApplication({
//   vacancyId,
//   message,
//   attachResumeVideo: attachVideo,
// });

// ❌ Имитация отправки - ничего не происходит!
await new Promise((resolve) => setTimeout(resolve, 1500));
```

#### CreateResumeScreen.tsx (строки 124-131)
```typescript
// TODO: Send resume data to backend with video metadata
// await apiService.createResume({
//   ...form,
//   videoId: videoData?.videoId,
//   videoUrl: videoData?.playerUrl,
//   hlsUrl: videoData?.hlsUrl,
//   thumbnailUrl: videoData?.thumbnailUrl,
// });

// ❌ Имитация - резюме не создается!
await new Promise((resolve) => setTimeout(resolve, 1000));
```

---

### 2. Отсутствуют Backend Endpoints

#### Нужны эндпоинты для резюме:

**Отсутствуют:**
- `GET /api/v1/resumes/my` - Получить мои резюме
- `GET /api/v1/resumes/video/my` - Получить моё видео-резюме
- `POST /api/v1/resumes` - Создать резюме
- `PUT /api/v1/resumes/:id` - Обновить резюме
- `DELETE /api/v1/resumes/:id` - Удалить резюме

**Есть только:**
- ✅ `POST /api/v1/resumes/video` - Загрузить видео-резюме (ResumeVideoController)

---

### 3. VacancyFeedScreen - API интеграция неполная

#### Лайки (строки 82-125)
```typescript
const handleLike = async (vacancyId: string) => {
  if (!user) {
    navigation.navigate('RegistrationRequired');
    return;
  }

  // ❌ API вызов есть, но обработка ошибок минимальная
  try {
    const wasLiked = likedVacancies.has(vacancyId);
    // Optimistic UI update
    setLikedVacancies(...)

    // API call
    await api.post(`/vacancies/${vacancyId}/like`);
  } catch (error) {
    // Rollback
    setLikedVacancies(...);
    showToast('error', 'Не удалось поставить лайк');
  }
}
```

**Проблемы:**
- Нет синхронизации с сервером при загрузке
- Лайки не сохраняются между сессиями
- Нет индикатора загрузки во время API call

#### Избранное (строки 144-181)
- ❌ Аналогичная проблема с синхронизацией

---

## ⚠️ ВАЖНЫЕ НЕДОСТАТКИ

### 4. Логика откликов (ApplicationController.ts)

**Хорошо реализовано:**
✅ Проверка роли пользователя
✅ Валидация vacancyId
✅ Проверка существования вакансии
✅ Проверка дубликатов откликов
✅ Поддержка видео-резюме
✅ Создание chat room

**Проблемы:**
```typescript
// Строка 90
const chatRoomId = uuidv4();

// ❌ chatRoomId создается, но чат не инициализируется
// Нужно вызвать chatService.createChatRoom(chatRoomId, ...)
```

---

### 5. CreateResumeScreen - Flow неполный

**Текущий Flow:**
1. ✅ Шаг 1: Основная информация (name, profession, city, salary)
2. ✅ Шаг 2: Запись видео (опционально)
3. ⚠️ Шаг 3: Публикация

**Проблемы Шага 3:**
```typescript
const handlePublish = async () => {
  // ✅ Загрузка видео на api.video (если есть)
  if (videoPath) {
    videoData = await VideoUploadService.uploadResumeVideo(...);
  }

  // ❌ Данные резюме НЕ отправляются на сервер
  // TODO комментарий вместо реального вызова

  // ❌ Navigation некорректная
  navigation.navigate('VacancyFeed');
  // Должно быть: navigation.goBack() или navigate('Profile')
}
```

---

### 6. Видео-резюме - Приватность не реализована

**Текущая логика:**
```typescript
// ApplicationScreen.tsx - строки 206-213
{attachVideo && (
  <View style={styles.privacyNotice}>
    <Text>🔒 Ваше видео приватное и доступно только этому работодателю</Text>
    <Text>👁️ Лимит: 2 просмотра на работодателя</Text>
    <Text>🗑️ Видео удалится после просмотра 2 раз</Text>
  </View>
)}
```

**Реальность:**
❌ Лимит 2 просмотра НЕ реализован
❌ Приватность НЕ реализована
❌ Автоудаление НЕ реализовано

**Есть только в Backend (PrivateVideoService.ts):**
- ✅ Генерация временных токенов для просмотра
- ⚠️ Но Redis не подключен (комментарии TODO)

---

## 📊 Текущее Состояние Функций

| Функция | Frontend | Backend | Интеграция | Статус |
|---------|----------|---------|------------|--------|
| Просмотр ленты вакансий | ✅ | ✅ | ✅ | ✅ Работает |
| Гостевой просмотр (20 лимит) | ✅ | ❌ | ❌ | ⚠️ Локально |
| Лайки вакансий | ⚠️ | ✅ | ⚠️ | ⚠️ Частично |
| Избранное | ⚠️ | ✅ | ⚠️ | ⚠️ Частично |
| Поиск вакансий | ✅ | ✅ | ❓ | ❓ Не проверено |
| Создание резюме | ✅ | ❌ | ❌ | ❌ Не работает |
| Видео-резюме (загрузка) | ✅ | ✅ | ❌ | ⚠️ Частично |
| Видео-резюме (приватность) | ❌ | ⚠️ | ❌ | ❌ Не работает |
| Подача отклика | ✅ | ✅ | ❌ | ❌ Не работает |
| Список откликов | ✅ | ✅ | ❓ | ❓ Не проверено |
| Чат с работодателем | ✅ | ⚠️ | ❌ | ❌ Не работает |

---

## 🔧 ПЛАН ИСПРАВЛЕНИЙ

### Приоритет 1: КРИТИЧНЫЕ (Без этого ничего не работает)

#### 1.1 Создать Backend Endpoints для резюме

**Файл:** `backend/src/controllers/ResumeController.ts`

```typescript
export class ResumeController {
  // GET /api/v1/resumes/my
  static async getMyResumes(req: Request, res: Response) {
    const resumes = await db.manyOrNone(
      'SELECT * FROM resumes WHERE jobseeker_id = $1',
      [req.user!.userId]
    );
    return res.json({ success: true, resumes });
  }

  // GET /api/v1/resumes/video/my
  static async getMyResumeVideo(req: Request, res: Response) {
    const video = await db.oneOrNone(
      'SELECT * FROM videos WHERE user_id = $1 AND type = $2',
      [req.user!.userId, 'resume']
    );
    return res.json({ success: true, video });
  }

  // POST /api/v1/resumes
  static async createResume(req: Request, res: Response) {
    const { name, profession, city, salaryExpected, about, videoId } = req.body;

    const resume = await db.one(
      `INSERT INTO resumes (
        jobseeker_id, name, profession, city,
        salary_expected, about, video_id, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *`,
      [req.user!.userId, name, profession, city, salaryExpected, about, videoId]
    );

    return res.json({ success: true, resume });
  }
}
```

**Файл:** `backend/src/routes/resume.routes.ts`

```typescript
import { Router } from 'express';
import { authMiddleware, requireJobSeeker } from '../middleware/auth';
import { ResumeController } from '../controllers/ResumeController';

const router = Router();

router.get('/my', authMiddleware, requireJobSeeker, ResumeController.getMyResumes);
router.get('/video/my', authMiddleware, requireJobSeeker, ResumeController.getMyResumeVideo);
router.post('/', authMiddleware, requireJobSeeker, ResumeController.createResume);

export default router;
```

**Файл:** `backend/src/server.ts`

```typescript
import resumeRoutes from './routes/resume.routes';

app.use('/api/v1/resumes', resumeRoutes);
```

---

#### 1.2 Подключить API в ApplicationScreen

**Файл:** `src/services/api.ts`

```typescript
// Добавить методы
export const api = {
  // ... существующие методы

  // Резюме
  getMyResumeVideo: async () => {
    const response = await axiosInstance.get('/resumes/video/my');
    return response.data;
  },

  createResume: async (data: any) => {
    const response = await axiosInstance.post('/resumes', data);
    return response.data;
  },

  // Отклики
  createApplication: async (data: {
    vacancyId: string;
    message?: string;
    attachResumeVideo: boolean;
    resumeId?: string;
  }) => {
    const response = await axiosInstance.post('/applications', data);
    return response.data;
  },
};
```

**Файл:** `src/screens/jobseeker/ApplicationScreen.tsx`

```typescript
// Строка 54
const checkForResumeVideo = async () => {
  try {
    const result = await api.getMyResumeVideo(); // ✅ Раскомментировать
    setHasResumeVideo(!!result.video);
  } catch (error) {
    console.error('Error checking resume video:', error);
    setHasResumeVideo(false);
  } finally {
    setCheckingVideo(false);
  }
};

// Строка 78
const handleSubmit = async () => {
  if (!message.trim() && !attachVideo) {
    showToast('error', 'Добавьте сообщение или видео');
    return;
  }

  setLoading(true);
  try {
    const result = await api.createApplication({ // ✅ Раскомментировать
      vacancyId,
      message,
      attachResumeVideo: attachVideo,
    });

    showToast('success', '🎉 Отклик отправлен!');

    // Переход в чат
    navigation.navigate('Chat', {
      chatRoomId: result.application.chat_room_id,
      vacancyTitle,
      companyName,
    });
  } catch (error: any) {
    console.error('Error submitting application:', error);
    showToast('error', error.message || 'Ошибка при отправке отклика');
  } finally {
    setLoading(false);
  }
};
```

---

#### 1.3 Подключить API в CreateResumeScreen

**Файл:** `src/screens/jobseeker/CreateResumeScreen.tsx`

```typescript
// Строка 99
const handlePublish = async () => {
  setLoading(true);
  try {
    let videoData = null;

    // Upload video to api.video if exists
    if (videoPath) {
      showToast('info', '⏳ Загружаем видео...');

      const { VideoUploadService } = require('../../services/VideoUploadService');
      const videoTitle = `Resume - ${form.name} - ${form.profession}`;

      videoData = await VideoUploadService.uploadResumeVideo(
        videoPath,
        videoTitle,
        (progress) => {
          console.log(`Upload progress: ${progress.percentage.toFixed(1)}%`);
        }
      );

      showToast('success', '✅ Видео загружено!');
    }

    // ✅ Send resume data to backend
    await api.createResume({
      ...form,
      videoId: videoData?.videoId,
      videoUrl: videoData?.playerUrl,
      hlsUrl: videoData?.hlsUrl,
      thumbnailUrl: videoData?.thumbnailUrl,
    });

    if (videoPath) {
      showToast('success', '🎉 Резюме с видео опубликовано!');
      showToast('info', '🤖 Видео проходит быструю AI-проверку');
    } else {
      showToast('success', '🎉 Резюме опубликовано!');
    }

    // Navigate back
    navigation.goBack(); // ✅ Изменить с navigate('VacancyFeed')
  } catch (error: any) {
    console.error('Error publishing resume:', error);
    showToast('error', 'Ошибка при публикации резюме');
  } finally {
    setLoading(false);
  }
};
```

---

### Приоритет 2: ВАЖНЫЕ

#### 2.1 Инициализация Chat Room

**Файл:** `backend/src/controllers/ApplicationController.ts`

```typescript
// После строки 100
const chatRoomId = uuidv4();

// ✅ Добавить инициализацию чата
await chatService.createChatRoom({
  id: chatRoomId,
  applicationId: application.id,
  participants: [jobseekerId, vacancy.employer_id],
});

const application = await db.one(
  `INSERT INTO applications ...`,
  [vacancyId, jobseekerId, resumeId || null, message || null, resumeVideoId, chatRoomId]
);
```

---

#### 2.2 Синхронизация лайков и избранного

**Файл:** `src/screens/jobseeker/VacancyFeedScreen.tsx`

```typescript
// Добавить useEffect для загрузки лайков
useEffect(() => {
  const loadLikesAndFavorites = async () => {
    if (user) {
      try {
        const [likes, favorites] = await Promise.all([
          api.getMyLikes(),
          api.getMyFavorites(),
        ]);

        setLikedVacancies(new Set(likes.map(l => l.vacancyId)));
        setFavoritedVacancies(new Set(favorites.map(f => f.vacancyId)));
      } catch (error) {
        console.error('Error loading likes/favorites:', error);
      }
    }
  };

  loadLikesAndFavorites();
}, [user]);
```

---

## 📝 ИТОГИ

### Что работает:
✅ Backend логика откликов (ApplicationController)
✅ Backend маршруты (application.routes.ts)
✅ Frontend UI/UX (все экраны красиво оформлены)
✅ Навигация (правильная структура)

### Что НЕ работает:
❌ Frontend НЕ подключен к Backend API
❌ Резюме не сохраняются
❌ Отклики не отправляются
❌ Видео-резюме загружается но не привязывается
❌ Приватность видео не реализована
❌ Чаты не создаются

### Что нужно сделать в первую очередь:
1. Создать ResumeController и resume.routes.ts
2. Раскомментировать API вызовы в ApplicationScreen
3. Раскомментировать API вызовы в CreateResumeScreen
4. Добавить методы в api.ts
5. Инициализировать chat room при создании отклика

**Оценка времени:** 4-6 часов работы
