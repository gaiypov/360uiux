-- 360° РАБОТА - Add Videos Table
-- Created: 2025-01-05

-- ===================================
-- VIDEOS TABLE
-- ===================================
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- ID от видео провайдера (api.video или Yandex)
  video_id VARCHAR(255) UNIQUE NOT NULL,

  -- Тип видео
  type VARCHAR(20) NOT NULL CHECK (type IN ('vacancy', 'resume')),

  -- Владелец видео
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  -- Для видео вакансий
  vacancy_id UUID REFERENCES vacancies(id) ON DELETE CASCADE,

  -- Метаданные
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- URL-ы видео
  player_url TEXT NOT NULL,
  hls_url TEXT NOT NULL,
  thumbnail_url TEXT,

  -- Информация о видео
  duration INTEGER, -- Длительность в секундах
  status VARCHAR(20) NOT NULL CHECK (status IN ('uploading', 'processing', 'ready', 'failed')) DEFAULT 'ready',
  views INTEGER DEFAULT 0,

  -- Провайдер, который использовался
  provider VARCHAR(20) NOT NULL CHECK (provider IN ('api.video', 'yandex')),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы
CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_vacancy_id ON videos(vacancy_id);
CREATE INDEX idx_videos_type ON videos(type);
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_videos_video_id ON videos(video_id);

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Комментарии к таблице
COMMENT ON TABLE videos IS 'Таблица для хранения информации о видео (вакансии и резюме)';
COMMENT ON COLUMN videos.video_id IS 'ID видео от провайдера (api.video или Yandex Cloud Video)';
COMMENT ON COLUMN videos.type IS 'Тип видео: vacancy (вакансия) или resume (видеорезюме)';
COMMENT ON COLUMN videos.vacancy_id IS 'Ссылка на вакансию (только для видео вакансий)';
COMMENT ON COLUMN videos.provider IS 'Видео провайдер: api.video или yandex';
