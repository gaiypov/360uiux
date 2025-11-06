# 360° РАБОТА - Backend API

Backend API для приложения **360° РАБОТА - Ultra Edition**

## 🛠 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express 4.18
- **Language:** TypeScript 5.3
- **Database:** PostgreSQL
- **ORM:** pg-promise
- **Authentication:** JWT (jsonwebtoken)
- **Payments:** Tinkoff Acquiring, Alfabank Acquiring
- **PDF:** PDFKit
- **SMS:** SMS.RU API

## 📦 Установка

### 1. Установить зависимости

```bash
cd backend
npm install
```

### 2. Настроить PostgreSQL

Создайте базу данных:

```sql
CREATE DATABASE rabota360;
```

### 3. Настроить переменные окружения

Скопируйте `.env.example` в `.env` и заполните:

```bash
cp .env.example .env
```

Отредактируйте `.env`:

```env
# Server
PORT=5000
NODE_ENV=development
APP_URL=http://localhost:5000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/rabota360

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d

# Tinkoff Acquiring
TINKOFF_TERMINAL_KEY=your_tinkoff_terminal_key
TINKOFF_SECRET_KEY=your_tinkoff_secret_key

# Alfabank Acquiring
ALFABANK_USERNAME=your_alfabank_username
ALFABANK_PASSWORD=your_alfabank_password

# SMS
SMS_API_KEY=your_sms_api_key
```

### 4. Запустить миграции

```bash
psql -U user -d rabota360 -f migrations/001_initial_schema.sql
```

Или через psql интерактивно:

```bash
psql -U user rabota360 < migrations/001_initial_schema.sql
```

## 🚀 Запуск

### Development режим (с hot-reload)

```bash
npm run dev
```

### Production режим

```bash
npm run build
npm start
```

Сервер запустится на `http://localhost:5000`

## 📡 API Endpoints

### Auth (Авторизация)

| Метод | Endpoint | Описание | Auth |
|-------|----------|----------|------|
| POST | `/api/v1/auth/send-code` | Отправить SMS код | ❌ |
| POST | `/api/v1/auth/verify-code` | Проверить SMS код | ❌ |
| POST | `/api/v1/auth/register/jobseeker` | Регистрация соискателя | ❌ |
| POST | `/api/v1/auth/register/employer` | Регистрация работодателя | ❌ |
| POST | `/api/v1/auth/refresh` | Обновить access token | ❌ |
| GET | `/api/v1/auth/me` | Получить текущего пользователя | ✅ |
| POST | `/api/v1/auth/logout` | Выход | ✅ |

### Billing (Биллинг)

| Метод | Endpoint | Описание | Auth |
|-------|----------|----------|------|
| GET | `/api/v1/billing/wallet/balance` | Баланс кошелька | ✅ Employer |
| GET | `/api/v1/billing/wallet/transactions` | История транзакций | ✅ Employer |
| POST | `/api/v1/billing/payment/init` | Инициализация платежа | ✅ Employer |
| POST | `/api/v1/billing/payment/webhook/:system` | Webhook от банка | ❌ |
| GET | `/api/v1/billing/payment/:id/status` | Статус платежа | ✅ Employer |
| POST | `/api/v1/billing/invoices/generate` | Сгенерировать счёт | ✅ Employer |
| GET | `/api/v1/billing/invoices` | Список счетов | ✅ Employer |
| GET | `/api/v1/billing/invoices/:id/pdf` | Скачать PDF счёта | ✅ Employer |
| POST | `/api/v1/billing/invoices/:id/pay` | Оплатить счёт | ✅ Employer |
| GET | `/api/v1/billing/pricing` | Тарифы | ❌ |

## 📝 Примеры использования

### 1. Отправить SMS код

```bash
curl -X POST http://localhost:5000/api/v1/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+79991234567"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Verification code sent",
  "expiresAt": "2025-01-05T12:05:00.000Z"
}
```

### 2. Проверить SMS код

```bash
curl -X POST http://localhost:5000/api/v1/auth/verify-code \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+79991234567",
    "code": "1234"
  }'
```

Response (новый пользователь):
```json
{
  "success": true,
  "requiresRegistration": true,
  "phone": "+79991234567"
}
```

Response (существующий пользователь):
```json
{
  "success": true,
  "requiresRegistration": false,
  "user": {
    "id": "uuid",
    "phone": "+79991234567",
    "role": "jobseeker",
    "name": "Иван Иванов"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 3. Регистрация соискателя

```bash
curl -X POST http://localhost:5000/api/v1/auth/register/jobseeker \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+79991234567",
    "name": "Иван Иванов",
    "profession": "Программист",
    "city": "Москва"
  }'
```

### 4. Регистрация работодателя

```bash
curl -X POST http://localhost:5000/api/v1/auth/register/employer \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+79991234567",
    "email": "company@example.com",
    "company_name": "ООО Рога и Копыта",
    "inn": "1234567890",
    "legal_address": "г. Москва, ул. Ленина, д. 1"
  }'
```

### 5. Получить баланс кошелька

```bash
curl -X GET http://localhost:5000/api/v1/billing/wallet/balance \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Response:
```json
{
  "balance": 5000.00,
  "currency": "RUB"
}
```

### 6. Инициализация платежа

```bash
curl -X POST http://localhost:5000/api/v1/billing/payment/init \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "paymentSystem": "tinkoff",
    "cardType": "business"
  }'
```

Response:
```json
{
  "transactionId": "uuid",
  "paymentUrl": "https://securepay.tinkoff.ru/...",
  "amount": 5000
}
```

### 7. Сгенерировать счёт

```bash
curl -X POST http://localhost:5000/api/v1/billing/invoices/generate \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "name": "Размещение вакансии",
        "quantity": 5,
        "price": 1000,
        "total": 5000
      }
    ],
    "description": "Счёт за размещение вакансий"
  }'
```

## 🗄️ База данных

### Основные таблицы

- **users** - Пользователи (соискатели и работодатели)
- **sms_codes** - SMS коды верификации
- **company_wallets** - Кошельки работодателей
- **transactions** - Транзакции (пополнение, списание)
- **invoices** - Счета
- **pricing_plans** - Тарифные планы
- **vacancies** - Вакансии
- **applications** - Отклики
- **chats** - Чаты
- **messages** - Сообщения
- **favorites** - Избранное
- **notifications** - Уведомления

### Миграции

Все миграции находятся в `migrations/`:

- `001_initial_schema.sql` - Начальная схема БД

## 🔐 Авторизация

Используется JWT с access/refresh токенами:

1. **Access Token** - Срок действия 1 день (настраивается)
2. **Refresh Token** - Срок действия 7 дней (настраивается)

### Формат запроса

```
Authorization: Bearer <access_token>
```

### Обновление токена

```bash
curl -X POST http://localhost:5000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

## 💳 Платёжные системы

### Tinkoff Acquiring

- **Документация:** https://www.tinkoff.ru/kassa/develop/
- **Тестовый терминал:** Доступен после регистрации

### Alfabank Acquiring

- **Документация:** https://pay.alfabank.ru/
- **Тестовый доступ:** Предоставляется менеджером

## 📊 SMS Сервис

В **development** режиме SMS коды выводятся в консоль:

```
📱 SMS Code for +79991234567: 1234
```

В **production** режиме используется SMS.RU API.

## 🐛 Отладка

### Проверить подключение к БД

```bash
psql -U user -d rabota360 -c "SELECT 1 as test;"
```

### Посмотреть логи

```bash
npm run dev
```

Логи будут выводиться в консоль.

## 📝 TODO

- [ ] Реализовать CRUD для вакансий
- [ ] Реализовать систему откликов
- [ ] Реализовать чаты (WebSocket)
- [ [ ] Добавить загрузку файлов (S3)
- [ ] Добавить уведомления (Push)
- [ ] Добавить аналитику для работодателей
- [ ] Добавить систему рейтингов

## 📄 Лицензия

MIT

---

**Разработано для 360° РАБОТА - Ultra Edition** 🚀
