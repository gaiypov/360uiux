# 360° РАБОТА - Административная панель

Веб-приложение для модераторов и администраторов платформы 360° РАБОТА.

## 🎯 Назначение

Административная панель предназначена для:
- Модерации видео-вакансий
- Управления пользователями
- Рассмотрения жалоб
- Просмотра статистики платформы
- Настройки системных параметров

## 🛠️ Технологический стек

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod
- **Authentication:** JWT (jose)

## 📦 Установка

```bash
# Установить зависимости
npm install

# Запустить dev сервер
npm run dev

# Открыть http://localhost:3001
```

## 🏗️ Структура проекта

```
admin-dashboard/
├── app/
│   ├── admin/
│   │   ├── login/page.tsx          # Авторизация
│   │   ├── dashboard/page.tsx      # Главная страница
│   │   ├── moderation/page.tsx     # Модерация видео
│   │   ├── users/page.tsx          # Управление пользователями
│   │   ├── complaints/page.tsx     # Жалобы
│   │   └── analytics/page.tsx      # Аналитика
│   ├── api/
│   │   ├── admin/                  # Admin API routes
│   │   └── video/
│   │       └── track-view/route.ts # 2-view limit API
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                         # UI components
│   └── ResumeVideoPlayer.tsx      # Video player с 2-view limit
├── lib/
│   └── utils.ts
└── package.json
```

## 📄 Основные страницы

### 1. Авторизация (`/admin/login`)

**Доступ:** Email + Password

**Роли:**
- `admin` - полный доступ ко всем функциям
- `moderator` - доступ к модерации и просмотру пользователей

**Функционал:**
- Email и пароль
- JWT токен аутентификации
- Сохранение токена в localStorage
- Автоматическое перенаправление на dashboard

**TODO:**
- [ ] Создать таблицу `admins` в БД
- [ ] Реализовать API endpoint `/api/admin/auth/login`
- [ ] Добавить хеширование паролей (bcrypt)
- [ ] Добавить JWT генерацию

### 2. Dashboard (`/admin/dashboard`)

**Отображает:**
- Статистика:
  - Всего вакансий (+ новых сегодня)
  - Пользователей (+ новых сегодня)
  - Вакансий на модерации (⚠️)
  - Нерассмотренных жалоб (🔴)
- Быстрые действия:
  - Перейти к модерации
  - Управление пользователями
  - Рассмотреть жалобы
- Последняя активность

**TODO:**
- [ ] Создать API endpoint `/api/admin/stats`
- [ ] Подключить к реальной БД
- [ ] Добавить графики (Recharts)

### 3. Модерация видео-вакансий (`/admin/moderation`)

**Критически важная функция!**

**Функционал:**
- Просмотр видео встроенным плеером
- AI проверка (длительность, качество, контент)
- Фильтры: Ожидают / Одобренные / Отклонённые
- Действия:
  - ✅ Одобрить вакансию
  - ❌ Отклонить с причиной
  - ⏩ Пропустить

**Причины отклонения:**
1. Несоответствие описанию
2. Низкое качество видео
3. Низкое качество звука
4. Недопустимый контент
5. Спам/мошенничество
6. Другое (с комментарием)

**API Endpoints:**
```
GET  /api/admin/moderation?status=pending
POST /api/admin/moderation/approve
POST /api/admin/moderation/reject
```

**TODO:**
- [ ] Создать API endpoints
- [ ] Интегрировать с VideoProcessingService из backend
- [ ] Добавить push уведомления работодателю
- [ ] Логировать все действия модератора

### 4. Управление пользователями (`/admin/users`)

**Функционал:**
- Поиск по имени/телефону/email
- Фильтры:
  - Все
  - Соискатели
  - Работодатели
  - Заблокированные
- Просмотр профиля пользователя
- Статистика по пользователю
- Блокировка/Разблокировка с причиной
- История действий пользователя

**TODO:**
- [ ] Создать страницу `/admin/users/page.tsx`
- [ ] Создать API endpoint `/api/admin/users`
- [ ] Реализовать поиск и фильтрацию
- [ ] Добавить модальное окно блокировки

### 5. Жалобы (`/admin/complaints`)

**Функционал:**
- Список жалоб с фильтрами:
  - Новые
  - В работе
  - Решённые
- Детали жалобы:
  - Кто пожаловался
  - На кого
  - Причина
  - Описание
  - Прикреплённый контент (видео, скриншоты)
- Действия:
  - Снять жалобу (необоснованная)
  - Связаться с пользователем
  - Заблокировать пользователя
  - Отклонить жалобу

**TODO:**
- [ ] Создать страницу `/admin/complaints/page.tsx`
- [ ] Создать таблицу `complaints` в БД
- [ ] Реализовать API endpoints
- [ ] Добавить отправку email уведомлений

### 6. Аналитика (`/admin/analytics`)

**Функционал:**
- Графики:
  - Регистрации пользователей
  - Публикации вакансий
  - Отклики
  - Активность по дням/неделям/месяцам
- Метрики:
  - Пользователи (всего, новых, соискателей, работодателей)
  - Вакансии (всего, новых, активных, на модерации)
  - Отклики (всего, новых, с видео, без видео)
  - Модерация (среднее время, одобрено, отклонено)
- Экспорт данных в CSV/Excel

**TODO:**
- [ ] Создать страницу `/admin/analytics/page.tsx`
- [ ] Интегрировать Recharts
- [ ] Создать API endpoint `/api/admin/analytics`
- [ ] Реализовать экспорт данных

## 🔒 2-View Limit (КРИТИЧЕСКАЯ ФУНКЦИЯ)

### Компонент: `ResumeVideoPlayer`

**Описание:**
Видео-резюме соискателя может быть просмотрено работодателем **максимум 2 раза**. После 2 просмотров видео автоматически удаляется/блокируется.

**Как работает:**

1. **При загрузке компонента:**
   - Запрос к API: `GET /api/video/track-view?videoId=X&applicationId=Y`
   - Получает текущий счётчик просмотров (0, 1, или 2)
   - Если `viewCount >= 2` → показать замок 🔒

2. **При начале воспроизведения видео:**
   - Запрос к API: `POST /api/video/track-view`
   - Увеличивает счётчик в БД
   - Возвращает новый `viewCount` и `viewsRemaining`

3. **После 2-го просмотра:**
   - Видео помечается как удалённое в БД
   - Push уведомление соискателю: "Ваше видео было просмотрено 2 раза"
   - Видео больше нельзя воспроизвести

**База данных:**

```sql
-- Таблица просмотров
CREATE TABLE video_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id),
  user_id UUID NOT NULL REFERENCES users(id),
  application_id UUID NOT NULL REFERENCES applications(id),
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для быстрого подсчёта
CREATE INDEX idx_video_views_user ON video_views(video_id, user_id);

-- Триггер для проверки лимита
CREATE OR REPLACE FUNCTION check_video_view_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM video_views
      WHERE video_id = NEW.video_id
      AND user_id = NEW.user_id) >= 2 THEN
    RAISE EXCEPTION 'View limit reached';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_video_view_limit
BEFORE INSERT ON video_views
FOR EACH ROW
EXECUTE FUNCTION check_video_view_limit();

-- Автоматическое удаление видео после 2 просмотров
CREATE OR REPLACE FUNCTION delete_video_after_views()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM video_views
      WHERE video_id = NEW.video_id) >= 2 THEN
    UPDATE videos
    SET deleted_at = NOW(),
        deletion_reason = 'view_limit_reached'
    WHERE id = NEW.video_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_delete_video
AFTER INSERT ON video_views
FOR EACH ROW
EXECUTE FUNCTION delete_video_after_views();
```

**API Endpoints:**

```typescript
// GET /api/video/track-view?videoId=X&applicationId=Y
{
  videoId: string,
  applicationId: string,
  viewCount: number,       // 0, 1, or 2
  viewsRemaining: number,  // 2, 1, or 0
  isLocked: boolean        // true if viewCount >= 2
}

// POST /api/video/track-view
Body: {
  videoId: string,
  applicationId: string
}

Response: {
  success: boolean,
  viewCount: number,
  viewsRemaining: number,
  isLocked: boolean,
  message: string
}

// Error: 403 if view limit reached
{
  error: "View limit reached. This video can only be viewed 2 times."
}
```

**Использование компонента:**

```tsx
import ResumeVideoPlayer from '@/components/ResumeVideoPlayer';

<ResumeVideoPlayer
  videoId="uuid-here"
  applicationId="uuid-here"
  onViewLimitReached={() => {
    alert('Видео больше недоступно');
  }}
/>
```

## 🔐 Аутентификация

### JWT Authentication

**Процесс:**

1. **Login:**
   ```
   POST /api/admin/auth/login
   Body: { email, password }
   Response: { token: "jwt-token-here" }
   ```

2. **Сохранение токена:**
   ```javascript
   localStorage.setItem('adminToken', token);
   ```

3. **Использование токена:**
   ```javascript
   fetch('/api/admin/stats', {
     headers: {
       'Authorization': `Bearer ${token}`
     }
   });
   ```

4. **Middleware для защиты routes:**
   ```typescript
   // middleware.ts
   export function middleware(request: NextRequest) {
     const token = request.cookies.get('adminToken');
     if (!token && request.nextUrl.pathname.startsWith('/admin')) {
       return NextResponse.redirect(new URL('/admin/login', request.url));
     }
   }
   ```

## 📊 База данных

### Необходимые таблицы

```sql
-- Админы
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'moderator')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Логи действий админов
CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admins(id),
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Жалобы
CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES users(id),
  reported_user_id UUID REFERENCES users(id),
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'rejected')),
  resolved_by UUID REFERENCES admins(id),
  resolution TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);

-- Просмотры видео (для 2-view limit)
CREATE TABLE video_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id),
  user_id UUID NOT NULL REFERENCES users(id),
  application_id UUID NOT NULL REFERENCES applications(id),
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables

Создать `.env.local`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/360rabota

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Backend API
BACKEND_API_URL=http://localhost:5000

# OneSignal (для push уведомлений)
ONESIGNAL_APP_ID=your-app-id
ONESIGNAL_API_KEY=your-api-key
```

### Vercel Deployment

```bash
vercel deploy
```

## 📝 TODO List

### Критически важное (Priority 1)
- [ ] Реализовать все API endpoints
- [ ] Подключить к PostgreSQL
- [ ] Реализовать JWT authentication
- [ ] Создать таблицы в БД (admins, complaints, video_views)
- [ ] Интегрировать с существующим backend (ChatService, VideoProcessingService)

### Важное (Priority 2)
- [ ] Создать страницы Users и Complaints
- [ ] Добавить графики на Analytics странице
- [ ] Реализовать экспорт данных
- [ ] Добавить логирование всех действий админов

### Дополнительно (Priority 3)
- [ ] Настроить CI/CD
- [ ] Добавить unit тесты
- [ ] Оптимизировать производительность
- [ ] Добавить мультиязычность (en/ru)

## 🤝 Интеграция с Backend

Админ-панель использует существующие сервисы из `backend/`:

- **VideoProcessingService** - для обработки видео
- **NotificationService** - для push уведомлений
- **ChatService** - для управления чатами
- **AnalyticsService** - для статистики

Все API calls должны быть направлены на `http://localhost:5000/api` (backend Express server).

## 📚 Документация

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)
- [Recharts](https://recharts.org/)
- [React Hook Form](https://react-hook-form.com/)

## 🐛 Troubleshooting

**Problem:** `Module not found: Can't resolve '@/components/ui/button'`
**Solution:** Установить недостающие UI компоненты или скопировать из `web-dashboard`

**Problem:** API calls возвращают CORS error
**Solution:** Добавить в backend CORS middleware:
```javascript
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));
```

---

**Version:** 1.0.0
**Last Updated:** 2025-11-06
**Maintained by:** 360° РАБОТА Development Team
