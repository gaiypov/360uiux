-- 360° РАБОТА - Architecture v3: Private Resume Videos
-- Created: 2025-01-06
-- MAJOR CHANGE: Resume videos are now PRIVATE, shown only in chats with 2 view limit

-- ===================================
-- UPDATE VIDEOS TABLE - Add Privacy & Protection Fields
-- ===================================

-- Добавляем поля приватности и защиты
ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS download_protected BOOLEAN DEFAULT false;

-- Обновляем существующие видео:
-- Вакансии -> публичные
UPDATE videos SET is_public = true WHERE type = 'vacancy';
-- Резюме -> приватные
UPDATE videos SET is_public = false, download_protected = true WHERE type = 'resume';

-- ===================================
-- RESUME VIDEO VIEWS TABLE (NEW!)
-- Отслеживание просмотров видео-резюме работодателями
-- ===================================

CREATE TABLE IF NOT EXISTS resume_video_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Ссылки
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  application_id UUID NOT NULL, -- В каком отклике (добавим FK позже)
  employer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Счетчики просмотров
  view_count INTEGER DEFAULT 0,
  max_views INTEGER DEFAULT 2,

  -- Временные метки
  first_viewed_at TIMESTAMP,
  last_viewed_at TIMESTAMP,

  -- Автоудаление после лимита
  auto_delete_after_views BOOLEAN DEFAULT true,
  deleted_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Уникальность: одна запись на (видео, отклик, работодатель)
  UNIQUE(video_id, application_id, employer_id)
);

-- Индексы для быстрого поиска
CREATE INDEX idx_resume_views_video_app ON resume_video_views(video_id, application_id);
CREATE INDEX idx_resume_views_employer ON resume_video_views(employer_id, video_id);
CREATE INDEX idx_resume_views_deleted ON resume_video_views(deleted_at) WHERE deleted_at IS NULL;

-- ===================================
-- UPDATE APPLICATIONS TABLE
-- Добавляем видео-резюме и чат
-- ===================================

ALTER TABLE applications ADD COLUMN IF NOT EXISTS resume_video_id UUID REFERENCES videos(id) ON DELETE SET NULL;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS chat_room_id UUID;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS employer_status VARCHAR(50) DEFAULT 'new';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS employer_notes TEXT;

-- Индексы
CREATE INDEX IF NOT EXISTS idx_applications_resume_video ON applications(resume_video_id);
CREATE INDEX IF NOT EXISTS idx_applications_chat_room ON applications(chat_room_id);

-- ===================================
-- CHAT MESSAGES TABLE (NEW!)
-- Сообщения в чате между соискателем и работодателем
-- ===================================

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Ссылка на отклик (чат привязан к отклику)
  application_id UUID NOT NULL, -- Добавим FK позже

  -- Отправитель
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('jobseeker', 'employer', 'system')),

  -- Тип и содержание
  message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('text', 'video', 'system')),
  content TEXT,

  -- Для видео сообщений
  video_id UUID REFERENCES videos(id) ON DELETE SET NULL,

  -- Статус прочтения
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы
CREATE INDEX idx_chat_messages_application ON chat_messages(application_id);
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at DESC);
CREATE INDEX idx_chat_messages_unread ON chat_messages(application_id, is_read) WHERE is_read = false;

-- Триггер для обновления updated_at
CREATE TRIGGER update_chat_messages_updated_at
  BEFORE UPDATE ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- UPDATE RESUMES TABLE
-- Добавляем ссылку на видео
-- ===================================

ALTER TABLE resumes ADD COLUMN IF NOT EXISTS video_id UUID REFERENCES videos(id) ON DELETE SET NULL;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS video_status VARCHAR(50) DEFAULT 'none';

-- Индекс
CREATE INDEX IF NOT EXISTS idx_resumes_video ON resumes(video_id);

-- ===================================
-- ФУНКЦИЯ: Проверка лимита просмотров
-- ===================================

CREATE OR REPLACE FUNCTION check_video_view_limit(
  p_video_id UUID,
  p_application_id UUID,
  p_employer_id UUID
)
RETURNS TABLE(
  can_view BOOLEAN,
  views_left INTEGER,
  total_views INTEGER
) AS $$
DECLARE
  v_record resume_video_views%ROWTYPE;
BEGIN
  -- Получить запись просмотров
  SELECT * INTO v_record
  FROM resume_video_views
  WHERE video_id = p_video_id
    AND application_id = p_application_id
    AND employer_id = p_employer_id;

  -- Если записи нет - создать
  IF NOT FOUND THEN
    INSERT INTO resume_video_views (video_id, application_id, employer_id, view_count, max_views)
    VALUES (p_video_id, p_application_id, p_employer_id, 0, 2)
    RETURNING * INTO v_record;
  END IF;

  -- Проверить лимит
  RETURN QUERY SELECT
    (v_record.view_count < v_record.max_views) AS can_view,
    (v_record.max_views - v_record.view_count) AS views_left,
    v_record.view_count AS total_views;
END;
$$ LANGUAGE plpgsql;

-- ===================================
-- ФУНКЦИЯ: Увеличить счетчик просмотров
-- ===================================

CREATE OR REPLACE FUNCTION increment_video_view(
  p_video_id UUID,
  p_application_id UUID,
  p_employer_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_view_count INTEGER;
  v_max_views INTEGER;
BEGIN
  -- Проверить текущий счетчик
  SELECT view_count, max_views INTO v_view_count, v_max_views
  FROM resume_video_views
  WHERE video_id = p_video_id
    AND application_id = p_application_id
    AND employer_id = p_employer_id;

  -- Если лимит исчерпан
  IF v_view_count >= v_max_views THEN
    RETURN false;
  END IF;

  -- Увеличить счетчик
  UPDATE resume_video_views
  SET view_count = view_count + 1,
      last_viewed_at = CURRENT_TIMESTAMP,
      first_viewed_at = COALESCE(first_viewed_at, CURRENT_TIMESTAMP),
      updated_at = CURRENT_TIMESTAMP
  WHERE video_id = p_video_id
    AND application_id = p_application_id
    AND employer_id = p_employer_id;

  -- Увеличить общий счетчик в videos
  UPDATE videos
  SET views = views + 1,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = p_video_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- ===================================
-- ФУНКЦИЯ: Автоматическое создание системного сообщения в чате
-- ===================================

CREATE OR REPLACE FUNCTION create_initial_chat_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Если у отклика есть видео-резюме, создать системное сообщение + видео сообщение
  IF NEW.resume_video_id IS NOT NULL THEN
    -- Системное сообщение
    INSERT INTO chat_messages (application_id, sender_id, sender_type, message_type, content)
    VALUES (
      NEW.id,
      NEW.jobseeker_id,
      'system',
      'system',
      'Соискатель откликнулся на вашу вакансию'
    );

    -- Видео сообщение
    INSERT INTO chat_messages (application_id, sender_id, sender_type, message_type, content, video_id)
    VALUES (
      NEW.id,
      NEW.jobseeker_id,
      'jobseeker',
      'video',
      '📹 Видео-резюме (доступно 2 просмотра)',
      NEW.resume_video_id
    );
  ELSE
    -- Только системное сообщение
    INSERT INTO chat_messages (application_id, sender_id, sender_type, message_type, content)
    VALUES (
      NEW.id,
      NEW.jobseeker_id,
      'system',
      'system',
      'Соискатель откликнулся на вашу вакансию'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер на создание отклика
CREATE TRIGGER trigger_create_initial_chat
  AFTER INSERT ON applications
  FOR EACH ROW
  EXECUTE FUNCTION create_initial_chat_message();

-- ===================================
-- ДОБАВЛЕНИЕ FOREIGN KEYS (отложенные)
-- ===================================

-- Теперь можем добавить FK для applications.id в других таблицах
DO $$
BEGIN
  -- Для resume_video_views
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_resume_views_application'
  ) THEN
    ALTER TABLE resume_video_views
      ADD CONSTRAINT fk_resume_views_application
      FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE;
  END IF;

  -- Для chat_messages
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_chat_messages_application'
  ) THEN
    ALTER TABLE chat_messages
      ADD CONSTRAINT fk_chat_messages_application
      FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ===================================
-- КОММЕНТАРИИ
-- ===================================

COMMENT ON TABLE resume_video_views IS 'Отслеживание просмотров видео-резюме (макс 2 на работодателя)';
COMMENT ON TABLE chat_messages IS 'Сообщения в чате между соискателем и работодателем';

COMMENT ON COLUMN videos.is_public IS 'Публичное видео (вакансии=true, резюме=false)';
COMMENT ON COLUMN videos.download_protected IS 'Защита от скачивания (резюме=true)';
COMMENT ON COLUMN resume_video_views.view_count IS 'Сколько раз работодатель посмотрел';
COMMENT ON COLUMN resume_video_views.max_views IS 'Максимум просмотров (по умолчанию 2)';
COMMENT ON COLUMN applications.resume_video_id IS 'Видео-резюме прикрепленное к отклику';
COMMENT ON COLUMN applications.chat_room_id IS 'ID комнаты чата (для WebSocket)';

-- ===================================
-- СТАТИСТИКА (для аналитики)
-- ===================================

-- Создать view для статистики
CREATE OR REPLACE VIEW resume_video_stats AS
SELECT
  v.id AS video_id,
  v.user_id AS jobseeker_id,
  COUNT(DISTINCT rvv.employer_id) AS unique_employers_viewed,
  SUM(rvv.view_count) AS total_views,
  COUNT(DISTINCT rvv.application_id) AS applications_with_views,
  COUNT(*) FILTER (WHERE rvv.view_count >= rvv.max_views) AS employers_exhausted_limit,
  MAX(rvv.last_viewed_at) AS last_viewed_at
FROM videos v
LEFT JOIN resume_video_views rvv ON v.id = rvv.video_id
WHERE v.type = 'resume'
GROUP BY v.id, v.user_id;

COMMENT ON VIEW resume_video_stats IS 'Статистика просмотров видео-резюме';

-- ===================================
-- УСПЕШНО!
-- ===================================
-- Архитектура v3 готова:
-- ✅ Приватные видео-резюме (is_public = false)
-- ✅ Защита от скачивания (download_protected = true)
-- ✅ Лимит просмотров (max 2 per employer)
-- ✅ Автоматические чаты при откликах
-- ✅ Видео в сообщениях чата
-- ✅ Функции проверки и увеличения просмотров
