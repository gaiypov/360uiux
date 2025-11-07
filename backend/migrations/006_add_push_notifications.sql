-- ========================================
-- Migration 006: Push Notifications Support
-- ========================================
-- Adds tables for device registration and notification preferences
-- Architecture v3: Multi-device push notification system

-- ========================================
-- 1. User Devices Table
-- ========================================

CREATE TABLE IF NOT EXISTS user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_type VARCHAR(20) NOT NULL CHECK (device_type IN ('ios', 'android', 'web')),

  -- Push notification tokens
  fcm_token TEXT, -- Firebase Cloud Messaging (Android & iOS)
  apns_token TEXT, -- Apple Push Notification Service (iOS only)
  web_push_subscription JSONB, -- Web Push subscription object

  -- Device information
  device_model VARCHAR(255),
  os_version VARCHAR(50),
  app_version VARCHAR(50),

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for user_devices
CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_fcm_token ON user_devices(fcm_token) WHERE fcm_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_devices_apns_token ON user_devices(apns_token) WHERE apns_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_devices_active ON user_devices(is_active) WHERE is_active = true;

COMMENT ON TABLE user_devices IS 'Registered devices for push notifications';
COMMENT ON COLUMN user_devices.fcm_token IS 'Firebase Cloud Messaging token for Android/iOS';
COMMENT ON COLUMN user_devices.apns_token IS 'Apple Push Notification Service token for iOS';
COMMENT ON COLUMN user_devices.web_push_subscription IS 'Web Push API subscription object';

-- ========================================
-- 2. User Notification Preferences Table
-- ========================================

CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- Channel preferences
  push_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,

  -- Notification types (array of enabled notification types)
  notification_types TEXT[] DEFAULT ARRAY[
    'video_viewed',
    'video_limit_reached',
    'vacancy_approved',
    'vacancy_rejected',
    'application_received',
    'application_viewed',
    'application_status_changed',
    'message_received',
    'user_blocked',
    'user_unblocked'
  ],

  -- Quiet hours (JSON: { start: '22:00', end: '08:00' })
  quiet_hours JSONB,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for user_notification_preferences
CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_user_id ON user_notification_preferences(user_id);

COMMENT ON TABLE user_notification_preferences IS 'User notification settings and preferences';
COMMENT ON COLUMN user_notification_preferences.notification_types IS 'Array of enabled notification types';
COMMENT ON COLUMN user_notification_preferences.quiet_hours IS 'Do not disturb time range';

-- ========================================
-- 3. Notification Logs Table
-- ========================================

CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Notification content
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type VARCHAR(100) NOT NULL,
  data JSONB, -- Additional data for the notification

  -- Delivery status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'read')),

  -- Delivery channels
  push_sent BOOLEAN DEFAULT false,
  email_sent BOOLEAN DEFAULT false,
  sms_sent BOOLEAN DEFAULT false,

  -- Error tracking
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP,
  read_at TIMESTAMP
);

-- Indexes for notification_logs
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_type ON notification_logs(type);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at DESC);

COMMENT ON TABLE notification_logs IS 'Log of all sent notifications';
COMMENT ON COLUMN notification_logs.data IS 'Additional data payload for the notification';
COMMENT ON COLUMN notification_logs.retry_count IS 'Number of retry attempts for failed notifications';

-- ========================================
-- 4. Notification Templates Table (Optional)
-- ========================================

CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(100) NOT NULL UNIQUE,

  -- Multi-language support
  title_ru TEXT NOT NULL,
  body_ru TEXT NOT NULL,
  title_en TEXT,
  body_en TEXT,

  -- Template variables (array of available variables like {userName}, {companyName})
  variables TEXT[],

  -- Channel-specific templates
  email_subject TEXT,
  email_body_html TEXT,
  sms_template TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for notification_templates
CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON notification_templates(type);

COMMENT ON TABLE notification_templates IS 'Reusable notification templates';
COMMENT ON COLUMN notification_templates.variables IS 'Available template variables for substitution';

-- ========================================
-- 5. Triggers
-- ========================================

-- Trigger to update updated_at on user_devices
CREATE OR REPLACE FUNCTION update_user_devices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_devices_updated_at
BEFORE UPDATE ON user_devices
FOR EACH ROW
EXECUTE FUNCTION update_user_devices_updated_at();

-- Trigger to update updated_at on user_notification_preferences
CREATE OR REPLACE FUNCTION update_user_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_notification_preferences_updated_at
BEFORE UPDATE ON user_notification_preferences
FOR EACH ROW
EXECUTE FUNCTION update_user_notification_preferences_updated_at();

-- ========================================
-- 6. Sample Templates (Optional)
-- ========================================

INSERT INTO notification_templates (type, title_ru, body_ru, variables) VALUES
  ('video_viewed', 'Ваше видео просмотрено!', '{employerName} просмотрел ваше видео-резюме. Осталось {viewsRemaining} просмотр.', ARRAY['employerName', 'viewsRemaining']),
  ('video_limit_reached', 'Лимит просмотров достигнут', '{employerName} просмотрел ваше видео во второй раз. Видео удалено согласно правилам платформы.', ARRAY['employerName']),
  ('vacancy_approved', 'Вакансия одобрена', 'Ваша вакансия "{vacancyTitle}" успешно прошла модерацию и опубликована.', ARRAY['vacancyTitle']),
  ('vacancy_rejected', 'Вакансия отклонена', 'Ваша вакансия "{vacancyTitle}" отклонена модератором. Причина: {reason}', ARRAY['vacancyTitle', 'reason', 'comment']),
  ('application_received', 'Новый отклик', 'Получен новый отклик на вакансию "{vacancyTitle}" от {jobseekerName}', ARRAY['vacancyTitle', 'jobseekerName']),
  ('application_viewed', 'Отклик просмотрен', 'Работодатель {employerName} просмотрел ваш отклик на вакансию "{vacancyTitle}"', ARRAY['employerName', 'vacancyTitle']),
  ('application_status_changed', 'Статус отклика изменен', 'Статус вашего отклика на вакансию "{vacancyTitle}" изменен: {newStatus}', ARRAY['vacancyTitle', 'newStatus', 'message']),
  ('message_received', 'Новое сообщение', '{senderName}: {messagePreview}', ARRAY['senderName', 'messagePreview']),
  ('user_blocked', 'Аккаунт заблокирован', 'Ваш аккаунт был заблокирован. Причина: {reason}', ARRAY['reason', 'blockedUntil']),
  ('user_unblocked', 'Аккаунт разблокирован', 'Ваш аккаунт был разблокирован. Вы снова можете пользоваться платформой.', ARRAY[]::TEXT[])
ON CONFLICT (type) DO NOTHING;

-- ========================================
-- Migration Complete
-- ========================================

-- Summary:
-- ✅ user_devices table for device registration
-- ✅ user_notification_preferences table for user settings
-- ✅ notification_logs table for tracking sent notifications
-- ✅ notification_templates table for reusable templates
-- ✅ Indexes for performance
-- ✅ Triggers for automatic timestamp updates
-- ✅ Sample notification templates
