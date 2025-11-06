-- 360° РАБОТА - Chat Enhancements: Voice, Images, Reactions
-- Created: 2025-11-06
-- FEATURES: Voice messages, Image attachments, Message reactions, Application statuses, Messenger integration

-- ===================================
-- UPDATE CHAT_MESSAGES TABLE
-- Add support for voice and image messages
-- ===================================

-- Обновляем CHECK constraint для новых типов сообщений
ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_message_type_check;
ALTER TABLE chat_messages ADD CONSTRAINT chat_messages_message_type_check
  CHECK (message_type IN ('text', 'video', 'voice', 'image', 'system'));

-- Добавляем поля для voice messages
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS audio_uri TEXT;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS audio_duration INTEGER; -- в секундах
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS audio_waveform JSONB; -- для визуализации

-- Добавляем поля для image messages
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS image_uri TEXT;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS image_width INTEGER;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS image_height INTEGER;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS image_thumbnail_uri TEXT;

-- Добавляем поля для video messages (расширение существующих)
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS video_views_remaining INTEGER DEFAULT 2;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS video_deleted_at TIMESTAMP;

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_chat_messages_type ON chat_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_chat_messages_audio ON chat_messages(audio_uri) WHERE audio_uri IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_chat_messages_image ON chat_messages(image_uri) WHERE image_uri IS NOT NULL;

-- ===================================
-- MESSAGE REACTIONS TABLE (NEW!)
-- Реакции на сообщения (❤️, 👍, 😊, etc)
-- ===================================

CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Ссылки
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Реакция (emoji)
  reaction VARCHAR(10) NOT NULL, -- '❤️', '👍', '😊', '🔥', '👏', '🎉'

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Уникальность: один пользователь может поставить одну реакцию на сообщение
  UNIQUE(message_id, user_id, reaction)
);

-- Индексы
CREATE INDEX idx_reactions_message ON message_reactions(message_id);
CREATE INDEX idx_reactions_user ON message_reactions(user_id);

-- Комментарий
COMMENT ON TABLE message_reactions IS 'Реакции пользователей на сообщения в чате';

-- ===================================
-- UPDATE APPLICATIONS TABLE
-- Расширяем статусы и добавляем таймлайн
-- ===================================

-- Обновляем статусы
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check;
ALTER TABLE applications ADD CONSTRAINT applications_status_check
  CHECK (status IN ('pending', 'viewed', 'interview', 'rejected', 'hired', 'cancelled'));

-- Добавляем временные метки для таймлайна
ALTER TABLE applications ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMP;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS interview_scheduled_at TIMESTAMP;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS interview_completed_at TIMESTAMP;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS hired_at TIMESTAMP;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP;

-- Добавляем причину отказа
ALTER TABLE applications ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Добавляем последнюю активность в чате
ALTER TABLE applications ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMP;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS unread_messages_count INTEGER DEFAULT 0;

-- Индексы
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_viewed_at ON applications(viewed_at);
CREATE INDEX IF NOT EXISTS idx_applications_last_message ON applications(last_message_at DESC);

-- ===================================
-- UPDATE EMPLOYERS TABLE
-- Добавляем интеграцию с Telegram/WhatsApp
-- ===================================

ALTER TABLE employers ADD COLUMN IF NOT EXISTS telegram_username VARCHAR(100);
ALTER TABLE employers ADD COLUMN IF NOT EXISTS telegram_enabled BOOLEAN DEFAULT false;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS whatsapp_phone VARCHAR(20);
ALTER TABLE employers ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT false;

-- Индексы
CREATE INDEX IF NOT EXISTS idx_employers_telegram ON employers(telegram_username) WHERE telegram_enabled = true;
CREATE INDEX IF NOT EXISTS idx_employers_whatsapp ON employers(whatsapp_phone) WHERE whatsapp_enabled = true;

-- Комментарии
COMMENT ON COLUMN employers.telegram_username IS 'Telegram username (без @)';
COMMENT ON COLUMN employers.telegram_enabled IS 'Показывать кнопку Telegram в профиле';
COMMENT ON COLUMN employers.whatsapp_phone IS 'WhatsApp номер телефона';
COMMENT ON COLUMN employers.whatsapp_enabled IS 'Показывать кнопку WhatsApp в профиле';

-- ===================================
-- UPDATE USERS TABLE
-- Добавляем push notification tokens
-- ===================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS push_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS push_enabled BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS push_platform VARCHAR(20); -- 'ios', 'android', 'web'

-- Индекс для быстрой отправки push
CREATE INDEX IF NOT EXISTS idx_users_push_token ON users(push_token) WHERE push_enabled = true;

-- Комментарии
COMMENT ON COLUMN users.push_token IS 'OneSignal player ID для push notifications';
COMMENT ON COLUMN users.push_enabled IS 'Пользователь разрешил push уведомления';

-- ===================================
-- ФУНКЦИЯ: Обновить last_message_at в applications
-- ===================================

CREATE OR REPLACE FUNCTION update_application_last_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Обновить last_message_at в applications
  UPDATE applications
  SET last_message_at = NEW.created_at,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.application_id;

  -- Увеличить счетчик непрочитанных для получателя
  -- (если отправитель != jobseeker, значит работодатель отправил, и наоборот)
  IF NEW.sender_type = 'employer' THEN
    UPDATE applications
    SET unread_messages_count = unread_messages_count + 1
    WHERE id = NEW.application_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер на создание сообщения
DROP TRIGGER IF EXISTS trigger_update_app_last_message ON chat_messages;
CREATE TRIGGER trigger_update_app_last_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_application_last_message();

-- ===================================
-- ФУНКЦИЯ: Сброс счетчика непрочитанных при чтении
-- ===================================

CREATE OR REPLACE FUNCTION reset_unread_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Если сообщение помечено как прочитанное
  IF NEW.is_read = true AND OLD.is_read = false THEN
    -- Проверить, есть ли еще непрочитанные сообщения в этом application
    DECLARE
      unread_count INTEGER;
    BEGIN
      SELECT COUNT(*) INTO unread_count
      FROM chat_messages
      WHERE application_id = NEW.application_id
        AND is_read = false
        AND id != NEW.id;

      -- Обновить счетчик
      UPDATE applications
      SET unread_messages_count = unread_count
      WHERE id = NEW.application_id;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер на обновление сообщения
DROP TRIGGER IF EXISTS trigger_reset_unread_count ON chat_messages;
CREATE TRIGGER trigger_reset_unread_count
  AFTER UPDATE ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION reset_unread_count();

-- ===================================
-- ФУНКЦИЯ: Track video view в chat message
-- ===================================

CREATE OR REPLACE FUNCTION track_message_video_view(
  p_message_id UUID,
  p_user_id UUID
)
RETURNS TABLE(
  success BOOLEAN,
  views_remaining INTEGER
) AS $$
DECLARE
  v_message chat_messages%ROWTYPE;
  v_new_views_remaining INTEGER;
BEGIN
  -- Получить сообщение
  SELECT * INTO v_message
  FROM chat_messages
  WHERE id = p_message_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0;
    RETURN;
  END IF;

  -- Проверить тип
  IF v_message.message_type != 'video' THEN
    RETURN QUERY SELECT false, 0;
    RETURN;
  END IF;

  -- Проверить что не автор
  IF v_message.sender_id = p_user_id THEN
    RETURN QUERY SELECT true, v_message.video_views_remaining;
    RETURN;
  END IF;

  -- Проверить лимит
  IF v_message.video_views_remaining IS NULL THEN
    v_new_views_remaining := 2;
  ELSE
    v_new_views_remaining := v_message.video_views_remaining;
  END IF;

  IF v_new_views_remaining <= 0 THEN
    RETURN QUERY SELECT false, 0;
    RETURN;
  END IF;

  -- Декремент
  v_new_views_remaining := v_new_views_remaining - 1;

  -- Обновить
  UPDATE chat_messages
  SET video_views_remaining = v_new_views_remaining,
      video_deleted_at = CASE
        WHEN v_new_views_remaining <= 0 THEN CURRENT_TIMESTAMP
        ELSE NULL
      END,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = p_message_id;

  -- Обновить в videos тоже (если есть video_id)
  IF v_message.video_id IS NOT NULL THEN
    UPDATE videos
    SET views = views + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = v_message.video_id;
  END IF;

  RETURN QUERY SELECT true, v_new_views_remaining;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION track_message_video_view IS 'Отслеживание просмотра видео в сообщении чата';

-- ===================================
-- VIEW: Application Dashboard для работодателя
-- ===================================

CREATE OR REPLACE VIEW employer_applications_dashboard AS
SELECT
  a.id AS application_id,
  a.status,
  a.created_at AS applied_at,
  a.viewed_at,
  a.interview_scheduled_at,
  a.last_message_at,
  a.unread_messages_count,

  -- Jobseeker info
  u.id AS jobseeker_id,
  u.name AS jobseeker_name,
  u.phone AS jobseeker_phone,

  -- Resume info
  r.id AS resume_id,
  r.title AS resume_title,
  r.video_id AS resume_video_id,

  -- Vacancy info
  v.id AS vacancy_id,
  v.title AS vacancy_title,

  -- Video views
  COALESCE(
    (SELECT video_views_remaining
     FROM chat_messages
     WHERE application_id = a.id
       AND message_type = 'video'
     LIMIT 1),
    2
  ) AS video_views_remaining,

  -- Employer info
  e.id AS employer_id,
  e.company_name

FROM applications a
JOIN users u ON a.jobseeker_id = u.id
LEFT JOIN resumes r ON a.resume_id = r.id
LEFT JOIN vacancies v ON a.vacancy_id = v.id
LEFT JOIN employers e ON v.employer_id = e.id;

COMMENT ON VIEW employer_applications_dashboard IS 'Dashboard откликов для работодателя';

-- ===================================
-- VIEW: Jobseeker Applications Dashboard
-- ===================================

CREATE OR REPLACE VIEW jobseeker_applications_dashboard AS
SELECT
  a.id AS application_id,
  a.status,
  a.created_at AS applied_at,
  a.viewed_at,
  a.interview_scheduled_at,
  a.last_message_at,
  a.unread_messages_count,

  -- Vacancy info
  v.id AS vacancy_id,
  v.title AS vacancy_title,
  v.salary_from,
  v.salary_to,
  v.city,

  -- Employer info
  e.id AS employer_id,
  e.company_name,
  e.telegram_username,
  e.telegram_enabled,
  e.whatsapp_phone,
  e.whatsapp_enabled,

  -- Resume info
  r.id AS resume_id,
  r.title AS resume_title

FROM applications a
JOIN vacancies v ON a.vacancy_id = v.id
JOIN employers e ON v.employer_id = e.id
LEFT JOIN resumes r ON a.resume_id = r.id
WHERE a.jobseeker_id = current_setting('app.current_user_id')::UUID;

COMMENT ON VIEW jobseeker_applications_dashboard IS 'Dashboard откликов для соискателя';

-- ===================================
-- INDEXES для производительности
-- ===================================

-- Для быстрого поиска чатов с непрочитанными
CREATE INDEX IF NOT EXISTS idx_applications_unread
  ON applications(employer_id, unread_messages_count)
  WHERE unread_messages_count > 0;

-- Для сортировки по последнему сообщению
CREATE INDEX IF NOT EXISTS idx_applications_last_msg_employer
  ON applications(employer_id, last_message_at DESC NULLS LAST);

-- Для фильтрации по статусу
CREATE INDEX IF NOT EXISTS idx_applications_employer_status
  ON applications(employer_id, status, created_at DESC);

-- ===================================
-- SEED DATA: Allowed Reactions
-- ===================================

-- Можно создать отдельную таблицу для allowed reactions (опционально)
-- Или хардкодить в приложении: ['❤️', '👍', '😊', '🔥', '👏', '🎉', '💯', '✅']

-- ===================================
-- КОММЕНТАРИИ
-- ===================================

COMMENT ON COLUMN chat_messages.audio_uri IS 'URL записи голосового сообщения';
COMMENT ON COLUMN chat_messages.audio_duration IS 'Длительность аудио в секундах';
COMMENT ON COLUMN chat_messages.audio_waveform IS 'Данные waveform для визуализации (массив амплитуд)';

COMMENT ON COLUMN chat_messages.image_uri IS 'URL изображения';
COMMENT ON COLUMN chat_messages.image_width IS 'Ширина изображения в пикселях';
COMMENT ON COLUMN chat_messages.image_height IS 'Высота изображения в пикселях';
COMMENT ON COLUMN chat_messages.image_thumbnail_uri IS 'URL thumbnail для быстрой загрузки';

COMMENT ON COLUMN chat_messages.video_views_remaining IS 'Осталось просмотров для видео (макс 2)';
COMMENT ON COLUMN chat_messages.video_deleted_at IS 'Когда видео было автоматически удалено';

COMMENT ON COLUMN applications.last_message_at IS 'Время последнего сообщения в чате';
COMMENT ON COLUMN applications.unread_messages_count IS 'Количество непрочитанных сообщений';

-- ===================================
-- МИГРАЦИЯ ЗАВЕРШЕНА!
-- ===================================
-- ✅ Voice messages (audio_uri, audio_duration, waveform)
-- ✅ Image attachments (image_uri, width, height, thumbnail)
-- ✅ Message reactions (отдельная таблица)
-- ✅ Application statuses (pending, viewed, interview, rejected, hired, cancelled)
-- ✅ Application timeline (viewed_at, interview_scheduled_at, etc)
-- ✅ Telegram/WhatsApp integration (username, phone, enabled flags)
-- ✅ Push notifications (push_token, push_enabled)
-- ✅ Last message tracking (last_message_at, unread_count)
-- ✅ Video view tracking в chat messages
-- ✅ Dashboard views для быстрых запросов
-- ✅ Triggers для автоматического обновления счетчиков
