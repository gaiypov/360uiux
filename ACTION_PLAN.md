# 🎯 Action Plan - Что делать дальше?
## Дата: 2025-11-06

---

## ✅ ГДЕ МЫ СЕЙЧАС

**Pull Request:** Создан и готов к merge
**Branch:** `claude/revolut-ultra-job-app-011CUoibKxNjRkXdDTh4rhTp`
**Commits:** 6 коммитов (все запушены)
**Код:** ✅ Production ready после аудита
**Документация:** ✅ Complete

---

## 🎯 СЛЕДУЮЩИЕ ШАГИ

### ШАГ 1: REVIEW & MERGE PR (1-2 дня) 👈 НАЧНИТЕ ЗДЕСЬ

**Что делать:**

1. **Откройте Pull Request на GitHub:**
   ```
   https://github.com/gaiypov/360uiux/pull/[ваш-номер-PR]
   ```

2. **Проверьте PR содержит:**
   - ✅ 6 коммитов
   - ✅ 7 файлов изменено
   - ✅ 2,256+ строк добавлено
   - ✅ Все документы (PR_DESCRIPTION.md и т.д.)

3. **Действия:**
   - [ ] Прочитайте описание PR
   - [ ] Проверьте Files Changed
   - [ ] Если нужно - добавьте reviewers
   - [ ] Дождитесь approval (если требуется)
   - [ ] **НАЖМИТЕ "Merge pull request"**
   - [ ] **НАЖМИТЕ "Confirm merge"**
   - [ ] Удалите ветку после merge (опционально)

**Результат:** Код в main branch ✅

---

### ШАГ 2: BACKEND РАЗРАБОТКА (3-5 дней)

**Priority:** 🔴 КРИТИЧНО - без этого фичи не работают

#### 2.1 Video Tracking API

**Нужные endpoints:**

```typescript
// 1. Track video view
POST /api/v1/videos/:videoId/track-view
Authorization: Bearer <token>
Body: {
  applicationId?: string,
  conversationId?: string
}

Response: {
  success: boolean,
  viewsRemaining: number,
  autoDeleted: boolean
}

// Логика:
// - Декрементировать viewsRemaining в БД
// - Если viewsRemaining === 0, пометить как deleted
// - Вернуть новое количество просмотров
```

```typescript
// 2. Get remaining views
GET /api/v1/videos/:videoId/views
Authorization: Bearer <token>

Response: {
  viewsRemaining: number,
  isDeleted: boolean
}

// Логика:
// - Получить текущее количество просмотров из БД
// - Вернуть статус
```

**Database schema:**
```sql
-- Добавить в таблицу video_resumes или messages:
ALTER TABLE video_resumes ADD COLUMN views_remaining INTEGER DEFAULT 2;
ALTER TABLE video_resumes ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE video_resumes ADD COLUMN deleted_at TIMESTAMP;

-- Или если videos хранятся в messages:
ALTER TABLE messages ADD COLUMN video_views_remaining INTEGER;
ALTER TABLE messages ADD COLUMN video_deleted_at TIMESTAMP;
```

#### 2.2 WebSocket Events

**Server должен поддерживать:**

```typescript
// События которые ПРИХОДЯТ от клиента:
socket.on('video:track', (data) => {
  // { videoId, conversationId, messageId, userId, timestamp }
  // Broadcast другим участникам conversation
  io.to(data.conversationId).emit('video:viewed', {
    videoId: data.videoId,
    conversationId: data.conversationId,
    viewsRemaining: updatedCount,
    viewedAt: timestamp
  });
});

socket.on('video:delete', (data) => {
  // { videoId, conversationId, messageId, userId, timestamp }
  // Broadcast другим участникам
  io.to(data.conversationId).emit('video:deleted', {
    videoId: data.videoId,
    conversationId: data.conversationId,
    messageId: data.messageId,
    deletedAt: timestamp
  });
});
```

**Файлы для изменения на backend:**
```
backend/src/routes/videos.ts       - Добавить endpoints
backend/src/controllers/videos.ts  - Реализовать логику
backend/src/models/VideoResume.ts  - Добавить поля
backend/src/sockets/chat.ts        - Добавить WS события
```

**Estimated time:** 2-3 дня

---

### ШАГ 3: FIREBASE SETUP (1 день)

**Priority:** 🔴 КРИТИЧНО - для push notifications

#### 3.1 Create Firebase Project

1. **Перейдите на:** https://console.firebase.google.com/
2. **Создайте проект:** "360-rabota" (или ваше название)
3. **Добавьте iOS app:**
   - Bundle ID: `com.yourcompany.360rabota` (из Xcode)
   - Скачайте `GoogleService-Info.plist`
4. **Добавьте Android app:**
   - Package name: `com.yourcompany.360rabota` (из build.gradle)
   - Скачайте `google-services.json`

#### 3.2 Configure Apps

**iOS:**
```bash
# Скопировать файл
cp GoogleService-Info.plist ios/YourApp/

# Добавить в Xcode project
# (открыть в Xcode и drag & drop файл)
```

**Android:**
```bash
# Скопировать файл
cp google-services.json android/app/
```

#### 3.3 Backend FCM Integration

**Install:**
```bash
cd backend
npm install firebase-admin
```

**Configure:**
```typescript
// backend/src/services/firebase.ts
import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  })
});

export async function sendNotification(fcmToken: string, data: any) {
  const message = {
    token: fcmToken,
    notification: {
      title: data.title,
      body: data.body,
    },
    data: data.data,
  };

  return await admin.messaging().send(message);
}
```

**Estimated time:** 1 день

---

### ШАГ 4: ЗВУКОВЫЕ ФАЙЛЫ (2-4 часа)

**Priority:** 🟡 СРЕДНИЙ - можно использовать default звуки временно

#### 4.1 Создать звуки

**Опции:**
1. **Купить готовые:** (Рекомендуется)
   - AudioJungle: https://audiojungle.net/
   - Freesound: https://freesound.org/
   - Стоимость: $1-5 за звук

2. **Создать самому:**
   - Audacity (бесплатно)
   - GarageBand (Mac)
   - FL Studio

**Требования:**
- Длина: 1-2 секунды
- Формат: MP3 (Android), WAV (iOS)
- Качество: 44.1kHz, mono
- Размер: < 100KB

#### 4.2 Добавить в проект

**Android:**
```bash
mkdir -p android/app/src/main/res/raw
cp message_sound.mp3 android/app/src/main/res/raw/
cp video_message_sound.mp3 android/app/src/main/res/raw/
```

**iOS:**
```bash
cp message_sound.wav ios/YourApp/
cp video_message_sound.wav ios/YourApp/
# Добавить файлы в Xcode проект
```

**Estimated time:** 2-4 часа

---

### ШАГ 5: ТЕСТИРОВАНИЕ (2-3 дня)

**Priority:** 🔴 КРИТИЧНО - перед production

#### 5.1 Local Testing

**Video Messages:**
```bash
# Start backend
cd backend && npm run dev

# Start app
cd .. && npm run android  # or npm run ios
```

**Test cases:**
- [ ] Play video → view count -1
- [ ] Play again → still counts as 1 view
- [ ] View 2 times → video auto-deletes
- [ ] Locked state shows
- [ ] Deleted state shows
- [ ] Network error → graceful fallback

**Notifications:**
- [ ] Receive notification in background
- [ ] Quick reply works
- [ ] Mark as read works
- [ ] Tap opens correct chat
- [ ] Custom sound plays
- [ ] Badge updates

#### 5.2 Integration Testing

**Test WebSocket:**
```bash
# Open 2 devices/emulators
# User A plays video → User B sees update
# User A marks read → User B sees update
```

#### 5.3 Edge Cases

- [ ] Kill app during video play
- [ ] Airplane mode
- [ ] Low memory
- [ ] Background restrictions
- [ ] Notification permissions denied

**Estimated time:** 2-3 дня

---

### ШАГ 6: STAGING DEPLOYMENT (1-2 дня)

**Priority:** 🟡 СРЕДНИЙ - рекомендуется

#### 6.1 Deploy Backend

```bash
# Example with Heroku
heroku create 360rabota-staging
git push heroku main

# Or with your hosting provider
# Configure environment variables:
# - DATABASE_URL
# - FIREBASE_PROJECT_ID
# - FIREBASE_CLIENT_EMAIL
# - FIREBASE_PRIVATE_KEY
```

#### 6.2 Deploy App

**iOS (TestFlight):**
```bash
# Increase build number
# In Xcode: Product → Archive → Distribute App → TestFlight
```

**Android (Internal Testing):**
```bash
cd android
./gradlew bundleRelease
# Upload to Google Play Console → Internal Testing
```

#### 6.3 QA Testing

- [ ] Install from TestFlight/Internal Testing
- [ ] Test all features
- [ ] Collect feedback
- [ ] Fix bugs

**Estimated time:** 1-2 дня

---

### ШАГ 7: PRODUCTION DEPLOYMENT (1 week)

**Priority:** 🔴 FINAL STEP

#### 7.1 Pre-deployment Checklist

- [ ] All tests passing
- [ ] Staging validated
- [ ] Backend in production
- [ ] Firebase configured
- [ ] Crash reporting setup (Sentry/Firebase Crashlytics)
- [ ] Analytics setup (Firebase Analytics/Mixpanel)
- [ ] Release notes prepared

#### 7.2 Deploy

**Backend:**
```bash
git checkout main
git pull
# Deploy to production server
```

**iOS:**
```bash
# Xcode → Distribute App → App Store Connect
# Submit for review
# Wait 1-3 days for approval
```

**Android:**
```bash
# Google Play Console → Production
# Submit for review
# Usually approved within hours
```

#### 7.3 Monitoring

**First 24 hours:**
- [ ] Monitor crash reports
- [ ] Monitor error logs
- [ ] Monitor user feedback
- [ ] Monitor performance metrics
- [ ] Be ready for hotfix

**Estimated time:** 1 неделя (включая review)

---

## 📅 TIMELINE SUMMARY

```
Week 1:
├─ Day 1-2: ✅ Merge PR & Start Backend
├─ Day 3-4: 🔧 Backend Development
└─ Day 5-7: 🔔 Firebase Setup + Sounds

Week 2:
├─ Day 1-3: 🧪 Integration Testing
└─ Day 4-7: 🚀 Staging Deployment

Week 3:
├─ Day 1-2: ✅ Final Testing
├─ Day 3: 🚀 Production Deploy
└─ Day 4-7: 📊 Monitoring

Total: ~3 weeks to production
```

---

## 🚨 BLOCKERS & DEPENDENCIES

### Hard Blockers (нужно сделать обязательно):
1. ⛔ Backend API endpoints - **без этого фичи не работают**
2. ⛔ Firebase setup - **без этого push notifications не работают**

### Soft Blockers (можно обойти временно):
3. ⚠️ Custom sounds - можно использовать default звуки
4. ⚠️ Staging environment - можно тестить на local

---

## 💡 QUICK START (Минимум для работы)

**Если нужно быстро запустить:**

1. **Backend минимум:**
   ```typescript
   // Хардкод для тестирования
   app.post('/videos/:videoId/track-view', (req, res) => {
     res.json({ viewsRemaining: 1, autoDeleted: false });
   });
   ```

2. **Firebase минимум:**
   - Создать проект
   - Добавить config файлы
   - Базовая настройка (10 минут)

3. **Пропустить sounds:**
   - Default звуки работают
   - Добавить кастомные позже

**Минимальное время:** 1-2 дня для базовой работы

---

## 📞 SUPPORT

**Если нужна помощь:**
- Backend API: Проверьте `src/services/api.ts` для контрактов
- WebSocket: Проверьте `src/services/WebSocketService.ts`
- Notifications: Проверьте `src/services/NotificationService.ts`

**Документация:**
- API contracts: В `CODE_AUDIT_REPORT.md`
- WebSocket events: В `IMPLEMENTATION_SUMMARY.md`
- Architecture: В `PR_DESCRIPTION.md`

---

## ✅ CHECKLIST

Отмечайте по мере выполнения:

- [ ] PR merged
- [ ] Backend API implemented
- [ ] Firebase configured
- [ ] Sound files added (optional)
- [ ] Local testing complete
- [ ] Staging deployed
- [ ] QA testing done
- [ ] Production deployed
- [ ] Monitoring active

---

**Следующее действие:** Merge Pull Request → Start Backend Development

**Время до production:** ~3 weeks

**Готово к старту!** 🚀
