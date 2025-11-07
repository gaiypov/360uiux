-- ========================================
-- 360° РАБОТА - Admin Dashboard Tables
-- Migration 001: Create Admin Tables
-- ========================================

-- ========================================
-- 1. ADMINS TABLE
-- Stores admin and moderator accounts
-- ========================================
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'moderator')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES admins(id)
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);
CREATE INDEX IF NOT EXISTS idx_admins_status ON admins(status);

-- ========================================
-- 2. ADMIN_ACTIONS TABLE
-- Audit log for all admin actions
-- ========================================
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  target_id UUID,
  target_type TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_action_type ON admin_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target_id ON admin_actions(target_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at DESC);

-- ========================================
-- 3. COMPLAINTS TABLE
-- User complaints and reports
-- ========================================
CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL,
  reported_type TEXT NOT NULL CHECK (reported_type IN ('user', 'vacancy', 'application')),
  type TEXT NOT NULL CHECK (type IN ('user_behavior', 'content_violation', 'technical_issue', 'fraud', 'other')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'rejected')),
  resolution TEXT,
  notes TEXT,
  resolved_by UUID REFERENCES admins(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_complaints_reporter_id ON complaints(reporter_id);
CREATE INDEX IF NOT EXISTS idx_complaints_reported_id ON complaints(reported_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_type ON complaints(type);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON complaints(priority);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at DESC);

-- ========================================
-- 4. VIDEO_VIEWS TABLE
-- Track video resume views (2-view limit)
-- ========================================
CREATE TABLE IF NOT EXISTS video_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_video_views_video_id ON video_views(video_id);
CREATE INDEX IF NOT EXISTS idx_video_views_user_id ON video_views(user_id);
CREATE INDEX IF NOT EXISTS idx_video_views_application_id ON video_views(application_id);
CREATE INDEX IF NOT EXISTS idx_video_views_video_user ON video_views(video_id, user_id);

-- Unique constraint to prevent duplicate views in the same second
CREATE UNIQUE INDEX IF NOT EXISTS idx_video_views_unique
  ON video_views(video_id, user_id, viewed_at);

-- ========================================
-- TRIGGERS
-- ========================================

-- Update updated_at timestamp on admins table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- FUNCTION: Check 2-view limit
-- Automatically enforces the 2-view limit
-- ========================================
CREATE OR REPLACE FUNCTION check_video_view_limit()
RETURNS TRIGGER AS $$
DECLARE
  view_count INTEGER;
BEGIN
  -- Count existing views
  SELECT COUNT(*) INTO view_count
  FROM video_views
  WHERE video_id = NEW.video_id
    AND user_id = NEW.user_id;

  -- Enforce 2-view limit
  IF view_count >= 2 THEN
    RAISE EXCEPTION 'View limit reached. This video can only be viewed 2 times.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_video_view_limit
  BEFORE INSERT ON video_views
  FOR EACH ROW
  EXECUTE FUNCTION check_video_view_limit();

-- ========================================
-- FUNCTION: Auto-delete video after 2nd view
-- Marks video for deletion after reaching view limit
-- ========================================
CREATE OR REPLACE FUNCTION auto_delete_video_after_2_views()
RETURNS TRIGGER AS $$
DECLARE
  view_count INTEGER;
BEGIN
  -- Count total views for this video by this user
  SELECT COUNT(*) INTO view_count
  FROM video_views
  WHERE video_id = NEW.video_id
    AND user_id = NEW.user_id;

  -- If this is the 2nd view, mark video for deletion
  IF view_count = 2 THEN
    UPDATE videos
    SET deleted_at = CURRENT_TIMESTAMP,
        deletion_reason = 'view_limit_reached'
    WHERE id = NEW.video_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_delete_video
  AFTER INSERT ON video_views
  FOR EACH ROW
  EXECUTE FUNCTION auto_delete_video_after_2_views();

-- ========================================
-- DEFAULT ADMIN ACCOUNT
-- Email: admin@360rabota.ru
-- Password: admin123 (CHANGE IN PRODUCTION!)
-- ========================================
-- Password hash for 'admin123' (bcrypt, 10 rounds)
INSERT INTO admins (email, password_hash, name, role, status)
VALUES (
  'admin@360rabota.ru',
  '$2b$10$XQlN3YcJCZQJF5H5sNYqxOHvV8YJqhCW5vH5TqMb.JKLpJHNFz8Qm',
  'System Administrator',
  'admin',
  'active'
)
ON CONFLICT (email) DO NOTHING;

-- ========================================
-- COMMENTS
-- ========================================
COMMENT ON TABLE admins IS 'Admin and moderator accounts';
COMMENT ON TABLE admin_actions IS 'Audit log for all admin actions';
COMMENT ON TABLE complaints IS 'User complaints and reports';
COMMENT ON TABLE video_views IS 'Video resume view tracking (2-view limit)';

COMMENT ON COLUMN admins.role IS 'admin: full access, moderator: limited access';
COMMENT ON COLUMN video_views.viewed_at IS 'Timestamp when video was viewed';
COMMENT ON COLUMN complaints.priority IS 'Priority level: low, medium, high, critical';
