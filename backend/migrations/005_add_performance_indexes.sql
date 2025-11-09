-- =====================================================
-- Migration 005: Performance Indexes
-- Критические индексы для производительности в production
-- =====================================================

-- =====================================================
-- USERS TABLE INDEXES
-- =====================================================

-- Поиск по телефону (используется при логине)
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Поиск по email (используется при регистрации работодателей)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;

-- Фильтрация по роли (для админ панели, модерации)
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Составной индекс для активных пользователей по роли
CREATE INDEX IF NOT EXISTS idx_users_role_created ON users(role, created_at DESC);

-- =====================================================
-- VACANCIES TABLE INDEXES
-- =====================================================

-- Вакансии работодателя (для личного кабинета)
CREATE INDEX IF NOT EXISTS idx_vacancies_employer_id ON vacancies(employer_id);

-- Фильтр по статусу (для показа активных вакансий)
CREATE INDEX IF NOT EXISTS idx_vacancies_status ON vacancies(status);

-- Поиск по городу (фильтр в каталоге)
CREATE INDEX IF NOT EXISTS idx_vacancies_city ON vacancies(city);

-- Поиск по профессии (фильтр в каталоге)
CREATE INDEX IF NOT EXISTS idx_vacancies_profession ON vacancies(profession);

-- Сортировка по дате создания (новые вакансии)
CREATE INDEX IF NOT EXISTS idx_vacancies_created_at ON vacancies(created_at DESC);

-- Составной индекс для каталога вакансий (status + created_at)
-- Самый частый запрос: "активные вакансии, отсортированные по дате"
CREATE INDEX IF NOT EXISTS idx_vacancies_status_created ON vacancies(status, created_at DESC) WHERE status = 'active';

-- Топ-вакансии (is_top = true)
CREATE INDEX IF NOT EXISTS idx_vacancies_top ON vacancies(is_top, top_until) WHERE is_top = true AND top_until > NOW();

-- Поиск по городу и профессии (частый запрос)
CREATE INDEX IF NOT EXISTS idx_vacancies_city_profession ON vacancies(city, profession) WHERE status = 'active';

-- =====================================================
-- APPLICATIONS TABLE INDEXES
-- =====================================================

-- Отклики на конкретную вакансию (для работодателя)
CREATE INDEX IF NOT EXISTS idx_applications_vacancy_id ON applications(vacancy_id);

-- Отклики соискателя (для личного кабинета)
CREATE INDEX IF NOT EXISTS idx_applications_jobseeker_id ON applications(jobseeker_id);

-- Фильтр по статусу
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

-- Сортировка по дате создания
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);

-- Составной индекс: отклики работодателя по статусу
CREATE INDEX IF NOT EXISTS idx_applications_vacancy_status ON applications(vacancy_id, status, created_at DESC);

-- Составной индекс: отклики соискателя по статусу
CREATE INDEX IF NOT EXISTS idx_applications_jobseeker_status ON applications(jobseeker_id, status, created_at DESC);

-- Непросмотренные отклики (viewed_at IS NULL)
CREATE INDEX IF NOT EXISTS idx_applications_unviewed ON applications(vacancy_id, created_at DESC) WHERE viewed_at IS NULL;

-- =====================================================
-- VIDEOS TABLE INDEXES
-- =====================================================

-- Видео пользователя
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);

-- Фильтр по статусу видео
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);

-- Фильтр по статусу модерации
CREATE INDEX IF NOT EXISTS idx_videos_moderation_status ON videos(moderation_status);

-- Приоритетная модерация (для модераторов)
CREATE INDEX IF NOT EXISTS idx_videos_priority_moderation ON videos(priority_moderation, created_at) WHERE priority_moderation = true;

-- Видео, ожидающие модерации
CREATE INDEX IF NOT EXISTS idx_videos_pending_moderation ON videos(moderation_status, created_at)
  WHERE moderation_status IN ('pending_moderation', 'auto_moderation');

-- Видео по типу (vacancy/resume)
CREATE INDEX IF NOT EXISTS idx_videos_type ON videos(type);

-- Видео вакансии
CREATE INDEX IF NOT EXISTS idx_videos_vacancy_id ON videos(vacancy_id) WHERE vacancy_id IS NOT NULL;

-- Составной индекс для модераторов
CREATE INDEX IF NOT EXISTS idx_videos_moderation_priority ON videos(moderation_status, priority_moderation, created_at DESC);

-- =====================================================
-- CHAT MESSAGES TABLE INDEXES
-- =====================================================

-- Сообщения в чате (по application_id)
CREATE INDEX IF NOT EXISTS idx_chat_messages_application_id ON chat_messages(application_id, created_at DESC);

-- Непрочитанные сообщения
CREATE INDEX IF NOT EXISTS idx_chat_messages_unread ON chat_messages(application_id, is_read) WHERE is_read = false;

-- Отправитель сообщения
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);

-- Составной индекс для чата с фильтром по прочитанности
CREATE INDEX IF NOT EXISTS idx_chat_messages_app_read_created ON chat_messages(application_id, is_read, created_at DESC);

-- =====================================================
-- TRANSACTIONS TABLE INDEXES
-- =====================================================

-- Транзакции кошелька
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON transactions(wallet_id, created_at DESC);

-- Фильтр по статусу транзакции
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- Сортировка по дате создания
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- Составной индекс для истории транзакций
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_status ON transactions(wallet_id, status, created_at DESC);

-- Поиск по payment_id (для webhook обработки)
CREATE INDEX IF NOT EXISTS idx_transactions_payment_id ON transactions(payment_id) WHERE payment_id IS NOT NULL;

-- =====================================================
-- COMPANY WALLETS TABLE INDEXES
-- =====================================================

-- Кошелёк работодателя
CREATE INDEX IF NOT EXISTS idx_company_wallets_employer_id ON company_wallets(employer_id);

-- =====================================================
-- INVOICES TABLE INDEXES
-- =====================================================

-- Счета работодателя
CREATE INDEX IF NOT EXISTS idx_invoices_employer_id ON invoices(employer_id, created_at DESC);

-- Фильтр по статусу счёта
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- Поиск по номеру счёта
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);

-- Составной индекс для списка счетов работодателя
CREATE INDEX IF NOT EXISTS idx_invoices_employer_status ON invoices(employer_id, status, created_at DESC);

-- =====================================================
-- VIDEO COMPLAINTS TABLE INDEXES
-- =====================================================

-- Жалобы на видео
CREATE INDEX IF NOT EXISTS idx_video_complaints_video_id ON video_complaints(video_id);

-- Жалобы пользователя
CREATE INDEX IF NOT EXISTS idx_video_complaints_user_id ON video_complaints(user_id);

-- Фильтр по статусу жалобы
CREATE INDEX IF NOT EXISTS idx_video_complaints_status ON video_complaints(status);

-- Жалобы на рассмотрении (для модераторов)
CREATE INDEX IF NOT EXISTS idx_video_complaints_pending ON video_complaints(status, created_at)
  WHERE status IN ('pending', 'in_review');

-- =====================================================
-- MODERATION LOGS TABLE INDEXES
-- =====================================================

-- Логи модерации видео
CREATE INDEX IF NOT EXISTS idx_moderation_logs_video_id ON moderation_logs(video_id, created_at DESC);

-- Логи модератора
CREATE INDEX IF NOT EXISTS idx_moderation_logs_performed_by ON moderation_logs(performed_by) WHERE performed_by IS NOT NULL;

-- Фильтр по типу действия
CREATE INDEX IF NOT EXISTS idx_moderation_logs_action ON moderation_logs(action);

-- =====================================================
-- SMS CODES TABLE INDEXES
-- =====================================================

-- Поиск кода по телефону (для верификации)
CREATE INDEX IF NOT EXISTS idx_sms_codes_phone ON sms_codes(phone, created_at DESC);

-- Неверифицированные коды
CREATE INDEX IF NOT EXISTS idx_sms_codes_unverified ON sms_codes(phone, verified) WHERE verified = false;

-- Удаление истекших кодов
CREATE INDEX IF NOT EXISTS idx_sms_codes_expires_at ON sms_codes(expires_at) WHERE verified = false;

-- =====================================================
-- FAVORITES TABLE INDEXES
-- =====================================================

-- Избранное пользователя
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id, created_at DESC);

-- Проверка наличия в избранном
CREATE INDEX IF NOT EXISTS idx_favorites_user_vacancy ON favorites(user_id, vacancy_id);

-- =====================================================
-- NOTIFICATIONS TABLE INDEXES
-- =====================================================

-- Уведомления пользователя
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, created_at DESC);

-- Непрочитанные уведомления
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- =====================================================
-- RESUME VIDEO VIEWS TABLE INDEXES
-- =====================================================

-- Просмотры видео-резюме
CREATE INDEX IF NOT EXISTS idx_resume_video_views_video_id ON resume_video_views(video_id);

-- Просмотры работодателя
CREATE INDEX IF NOT EXISTS idx_resume_video_views_employer_id ON resume_video_views(employer_id);

-- Просмотры по отклику
CREATE INDEX IF NOT EXISTS idx_resume_video_views_application_id ON resume_video_views(application_id);

-- Составной индекс для проверки лимита просмотров
CREATE INDEX IF NOT EXISTS idx_resume_video_views_video_employer ON resume_video_views(video_id, employer_id);

-- =====================================================
-- FULL-TEXT SEARCH INDEXES (для поиска)
-- =====================================================

-- Полнотекстовый поиск вакансий по названию и профессии
CREATE INDEX IF NOT EXISTS idx_vacancies_title_search ON vacancies USING gin(to_tsvector('russian', title));
CREATE INDEX IF NOT EXISTS idx_vacancies_profession_search ON vacancies USING gin(to_tsvector('russian', profession));

-- Полнотекстовый поиск пользователей по имени и компании
CREATE INDEX IF NOT EXISTS idx_users_name_search ON users USING gin(to_tsvector('russian', COALESCE(name, '')));
CREATE INDEX IF NOT EXISTS idx_users_company_search ON users USING gin(to_tsvector('russian', COALESCE(company_name, '')));

-- =====================================================
-- STATISTICS
-- =====================================================

-- Обновить статистику для оптимизатора запросов
ANALYZE users;
ANALYZE vacancies;
ANALYZE applications;
ANALYZE videos;
ANALYZE chat_messages;
ANALYZE transactions;
ANALYZE company_wallets;
ANALYZE invoices;
ANALYZE video_complaints;
ANALYZE moderation_logs;
ANALYZE sms_codes;
ANALYZE favorites;
ANALYZE notifications;
ANALYZE resume_video_views;

-- =====================================================
-- РЕЗУЛЬТАТ
-- =====================================================

-- Подсчёт созданных индексов
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Размер индексов
SELECT
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;

COMMIT;
