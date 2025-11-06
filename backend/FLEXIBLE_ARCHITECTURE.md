# 🎯 ГИБКАЯ АРХИТЕКТУРА - 360° РАБОТА

Переключаемые провайдеры через `.env` файл:
- **2 видео сервиса**: api.video ⟷ Yandex Cloud Video
- **4 варианта БД**: Yandex ⟷ VK Cloud ⟷ Supabase ⟷ Local PostgreSQL
- **SMS**: SMS.ru

## 📐 Архитектура

```
Mobile App (React Native)
    ↓
Backend API (Node.js)
    ↓
├─ 📹 Видео: api.video ⟷ Yandex Cloud Video
├─ 🗄️ БД: Yandex ⟷ VK Cloud ⟷ Supabase ⟷ Local PostgreSQL
├─ 📱 SMS: SMS.ru
└─ 💳 Платежи: Тинькофф + Альфабанк
```

**Переключение через .env файл!**

## 🚀 Быстрый старт

### 1. Development (Локально)

```bash
# .env
VIDEO_PROVIDER=api.video
DB_PROVIDER=local
SMS_RU_API_KEY=test_key

# Запустить
npm install
npm run dev
```

### 2. Production (api.video + Yandex DB)

```bash
# .env
VIDEO_PROVIDER=api.video
DB_PROVIDER=yandex
SMS_RU_API_KEY=prod_key

# Deploy
npm run build
npm start
```

### 3. Production (Полностью Yandex)

```bash
# .env
VIDEO_PROVIDER=yandex
DB_PROVIDER=yandex
SMS_RU_API_KEY=prod_key

# Deploy
npm run build
npm start
```

## 🎬 Видео Провайдеры

### Провайдер 1: api.video (Рекомендуется)

**Преимущества:**
- Простая интеграция через SDK
- Готовый HLS плеер
- Автоматический транскодинг
- Встроенная аналитика
- Глобальный CDN
- Free tier для начала

**Настройка:**
```bash
# .env
VIDEO_PROVIDER=api.video
API_VIDEO_KEY=your_api_key
```

**Получить ключ:** https://dashboard.api.video/

**Стоимость:**
- Free: 0-75 видео, 0-100GB трафика
- Starter: $29/месяц (~2,500₽)

### Провайдер 2: Yandex Cloud Video

**Преимущества:**
- Полностью российский стэк
- Интеграция с Yandex Cloud
- Управление через Object Storage
- Собственный транскодинг

**Настройка:**
```bash
# .env
VIDEO_PROVIDER=yandex
YANDEX_ACCESS_KEY=your_access_key
YANDEX_SECRET_KEY=your_secret_key
YANDEX_VIDEO_BUCKET=vacancy-videos
YANDEX_IAM_TOKEN=your_iam_token
```

**Получить ключи:**
1. Создать Service Account: https://console.cloud.yandex.ru/iam
2. Создать Access Key для Object Storage
3. Выдать права на Video API

**Стоимость:** ~5,000₽/месяц (Storage + Transcoding)

## 🗄️ База Данных Провайдеры

### Провайдер 1: Local PostgreSQL (Development)

```bash
# .env
DB_PROVIDER=local
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=360_rabota
PG_USER=postgres
PG_PASSWORD=postgres
```

**Стоимость:** 0₽

### Провайдер 2: Yandex Managed PostgreSQL

```bash
# .env
DB_PROVIDER=yandex
YANDEX_PG_HOST=rc1a-xxx.mdb.yandexcloud.net
YANDEX_PG_DATABASE=360_rabota
YANDEX_PG_USER=admin
YANDEX_PG_PASSWORD=your_password
```

**Получить:** https://console.cloud.yandex.ru/folders/xxx/managed-postgresql

**Стоимость:** ~5,000₽/месяц

### Провайдер 3: VK Cloud PostgreSQL

```bash
# .env
DB_PROVIDER=vk
VK_PG_HOST=postgres-xxx.vpc.mcs.mail.ru
VK_PG_DATABASE=360_rabota
VK_PG_USER=admin
VK_PG_PASSWORD=your_password
```

**Получить:** https://mcs.mail.ru/databases/

**Стоимость:** ~3,000₽/месяц

### Провайдер 4: Supabase

```bash
# .env
DB_PROVIDER=supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_DB_PASSWORD=your_db_password
```

**Получить:** https://supabase.com/dashboard/projects

**Стоимость:**
- Free: 500MB database, 2GB bandwidth
- Pro: $25/месяц (~2,200₽)

## 📱 SMS Провайдер

### SMS.ru

```bash
# .env
SMS_RU_API_KEY=your_sms_ru_api_key
```

**Получить:** https://sms.ru/

**Стоимость:**
- Регистрация: 100 бесплатных SMS
- Продакшен: ~0.60₽ за SMS

## 💰 Стоимость Комбинаций

### Комбо 1: Local (Development)
```
api.video Free:       0 ₽
PostgreSQL Local:     0 ₽
SMS.ru (100 тест):    0 ₽
─────────────────────────
ИТОГО:                0 ₽/месяц
```

### Комбо 2: api.video + Yandex (Рекомендуется!)
```
api.video Starter:    ~2,500 ₽
Yandex PostgreSQL:    ~5,000 ₽
VK Cloud Server:      ~2,000 ₽
SMS.ru (1000 SMS):    ~600 ₽
─────────────────────────
ИТОГО:                ~10,100 ₽/месяц
```

### Комбо 3: Полностью Yandex Cloud
```
Yandex Video:         ~5,000 ₽
Yandex PostgreSQL:    ~5,000 ₽
Yandex Compute:       ~3,000 ₽
SMS.ru (1000 SMS):    ~600 ₽
─────────────────────────
ИТОГО:                ~13,600 ₽/месяц
```

### Комбо 4: api.video + Supabase (Оптимально)
```
api.video Starter:    ~2,500 ₽
Supabase Pro:         ~2,200 ₽
VK Cloud Server:      ~2,000 ₽
SMS.ru (1000 SMS):    ~600 ₽
─────────────────────────
ИТОГО:                ~7,300 ₽/месяц
```

## 📦 Зависимости

```json
{
  "dependencies": {
    "@api.video/nodejs-client": "^2.4.1",
    "aws-sdk": "^2.1478.0",
    "@supabase/supabase-js": "^2.38.0",
    "ioredis": "^5.3.2",
    "pg": "^8.11.3"
  }
}
```

## 🔧 Использование в коде

### Видео сервис

```typescript
import { videoService } from '@/services/video/VideoService';

// Загрузить видео (работает с любым провайдером)
const result = await videoService.uploadVideo({
  file: videoBuffer,
  fileName: 'resume.mp4',
  metadata: {
    type: 'resume',
    userId: user.id,
    title: 'Моё видео резюме',
  },
});

console.log(result.playerUrl); // URL для плеера
console.log(result.hlsUrl);    // HLS стрим
console.log(result.thumbnailUrl); // Превью
```

### База данных

```typescript
import { db } from '@/services/database/DatabaseService';

// SQL запрос (работает с любым провайдером)
const users = await db.query('SELECT * FROM users WHERE role = $1', ['employer']);

const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [userId]);

await db.none('UPDATE users SET verified = true WHERE id = $1', [userId]);
```

## 🔄 Миграция между провайдерами

### Сменить видео провайдер:
1. Обновить `.env`: `VIDEO_PROVIDER=yandex`
2. Перезапустить сервер
3. Готово! Новые видео будут загружаться в Yandex

### Сменить БД провайдер:
1. Экспортировать данные: `pg_dump`
2. Обновить `.env`: `DB_PROVIDER=supabase`
3. Импортировать данные: `psql`
4. Перезапустить сервер

## 📚 Документация API

### POST /api/v1/videos/upload
Загрузить видео (автоматически использует выбранный провайдер)

### GET /api/v1/videos/:id
Получить информацию о видео

### DELETE /api/v1/videos/:id
Удалить видео

## 🛠️ Разработка

### Добавить новый видео провайдер:

1. Создать файл `src/services/video/NewProvider.ts`
2. Реализовать интерфейс `IVideoProvider`
3. Добавить в фабрику `VideoService.ts`
4. Обновить конфиг `video.config.ts`

### Добавить новый БД провайдер:

1. Создать файл `src/services/database/NewDBProvider.ts`
2. Реализовать интерфейс `IDBProvider`
3. Добавить в фабрику `DatabaseService.ts`
4. Обновить конфиг `database.config.ts`

## ⚠️ Важно

- Валидация конфигурации происходит при старте сервера
- Если провайдер недоступен, сервер не запустится
- Логи показывают текущего провайдера: `📹 Video provider: api.video`
- Все провайдеры имеют единый интерфейс (прозрачная замена)

## 🎉 Готово!

Теперь вы можете легко переключаться между провайдерами через `.env` файл, не меняя код!
