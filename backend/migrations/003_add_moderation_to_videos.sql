-- 360° РАБОТА - Add Moderation System to Videos
-- Created: 2025-01-05
-- Adds moderation fields and complaints table

-- ===================================
-- UPDATE VIDEOS TABLE - ADD MODERATION FIELDS
-- ===================================

-- Добавляем новые статусы для модерации
ALTER TABLE videos DROP CONSTRAINT IF EXISTS videos_status_check;
ALTER TABLE videos
  ADD CONSTRAINT videos_status_check
  CHECK (status IN ('uploading', 'transcoding', 'auto_moderation', 'pending_moderation', 'approved', 'rejected', 'flagged', 'blocked'));

-- Добавляем поля модерации
ALTER TABLE videos ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(20) DEFAULT 'pending'
  CHECK (moderation_status IN ('pending', 'in_review', 'approved', 'rejected'));

ALTER TABLE videos ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE videos ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP;

ALTER TABLE videos ADD COLUMN IF NOT EXISTS ai_check_passed BOOLEAN DEFAULT false;

ALTER TABLE videos ADD COLUMN IF NOT EXISTS ai_check_results JSONB;

ALTER TABLE videos ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE videos ADD COLUMN IF NOT EXISTS complaints_count INTEGER DEFAULT 0;

ALTER TABLE videos ADD COLUMN IF NOT EXISTS priority_moderation BOOLEAN DEFAULT false;

-- ===================================
-- VIDEO COMPLAINTS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS video_complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Ссылка на видео
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,

  -- Кто пожаловался
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  -- Причина жалобы
  reason VARCHAR(50) NOT NULL CHECK (reason IN (
    'inappropriate_content',
    'misleading_info',
    'spam',
    'violence',
    'harassment',
    'copyright',
    'other'
  )),

  -- Описание жалобы
  description TEXT,

  -- Статус обработки жалобы
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',       -- Ожидает рассмотрения
    'in_review',     -- На рассмотрении модератором
    'confirmed',     -- Жалоба подтверждена
    'dismissed',     -- Жалоба отклонена
    'resolved'       -- Проблема решена
  )),

  -- Кто рассмотрел жалобу
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Когда рассмотрели
  reviewed_at TIMESTAMP,

  -- Комментарий модератора
  moderator_comment TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для video_complaints
CREATE INDEX idx_video_complaints_video_id ON video_complaints(video_id);
CREATE INDEX idx_video_complaints_user_id ON video_complaints(user_id);
CREATE INDEX idx_video_complaints_status ON video_complaints(status);
CREATE INDEX idx_video_complaints_created_at ON video_complaints(created_at);

-- Триггер для обновления updated_at
CREATE TRIGGER update_video_complaints_updated_at
  BEFORE UPDATE ON video_complaints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- MODERATION LOGS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS moderation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Ссылка на видео
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,

  -- Тип события
  action VARCHAR(50) NOT NULL CHECK (action IN (
    'ai_check_started',
    'ai_check_completed',
    'ai_check_failed',
    'manual_review_started',
    'manual_review_completed',
    'approved',
    'rejected',
    'flagged',
    'blocked',
    'unblocked',
    'complaint_received',
    'complaint_resolved'
  )),

  -- Кто выполнил действие (null для AI)
  performed_by UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Детали действия
  details JSONB,

  -- Комментарий
  comment TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для moderation_logs
CREATE INDEX idx_moderation_logs_video_id ON moderation_logs(video_id);
CREATE INDEX idx_moderation_logs_action ON moderation_logs(action);
CREATE INDEX idx_moderation_logs_created_at ON moderation_logs(created_at);

-- ===================================
-- ФУНКЦИЯ: Автоматическое обновление complaints_count
-- ===================================
CREATE OR REPLACE FUNCTION update_video_complaints_count()
RETURNS TRIGGER AS $$
BEGIN
  -- При добавлении новой жалобы
  IF TG_OP = 'INSERT' THEN
    UPDATE videos
    SET complaints_count = complaints_count + 1
    WHERE id = NEW.video_id;

    -- Автоматическая блокировка при 3+ жалобах
    UPDATE videos
    SET status = 'flagged'
    WHERE id = NEW.video_id
      AND complaints_count >= 3
      AND status NOT IN ('blocked', 'rejected');
  END IF;

  -- При удалении жалобы
  IF TG_OP = 'DELETE' THEN
    UPDATE videos
    SET complaints_count = GREATEST(complaints_count - 1, 0)
    WHERE id = OLD.video_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического подсчета жалоб
CREATE TRIGGER trigger_update_complaints_count
  AFTER INSERT OR DELETE ON video_complaints
  FOR EACH ROW
  EXECUTE FUNCTION update_video_complaints_count();

-- ===================================
-- ИНДЕКСЫ ДЛЯ МОДЕРАЦИИ
-- ===================================
CREATE INDEX idx_videos_moderation_status ON videos(moderation_status);
CREATE INDEX idx_videos_ai_check_passed ON videos(ai_check_passed);
CREATE INDEX idx_videos_complaints_count ON videos(complaints_count);
CREATE INDEX idx_videos_priority_moderation ON videos(priority_moderation);
CREATE INDEX idx_videos_moderated_at ON videos(moderated_at);

-- Индекс для поиска видео, требующих модерации
CREATE INDEX idx_videos_pending_moderation
  ON videos(status, moderation_status, priority_moderation, created_at)
  WHERE status IN ('auto_moderation', 'pending_moderation');

-- ===================================
-- КОММЕНТАРИИ
-- ===================================
COMMENT ON TABLE video_complaints IS 'Таблица жалоб на видео от пользователей';
COMMENT ON TABLE moderation_logs IS 'Журнал всех действий модерации';

COMMENT ON COLUMN videos.moderation_status IS 'Статус модерации видео';
COMMENT ON COLUMN videos.ai_check_passed IS 'Прошло ли видео AI проверку';
COMMENT ON COLUMN videos.ai_check_results IS 'Результаты AI проверки (JSON)';
COMMENT ON COLUMN videos.complaints_count IS 'Количество жалоб на видео';
COMMENT ON COLUMN videos.priority_moderation IS 'Приоритетная модерация (+500₽)';

-- ===================================
-- НАЧАЛЬНЫЕ ДАННЫЕ
-- ===================================

-- Обновляем существующие видео: approved по умолчанию
UPDATE videos
SET moderation_status = 'approved',
    ai_check_passed = true,
    status = 'approved'
WHERE moderation_status IS NULL;
