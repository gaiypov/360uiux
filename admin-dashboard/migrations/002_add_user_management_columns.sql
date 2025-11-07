-- ========================================
-- 360° РАБОТА - Admin Dashboard
-- Migration 002: Add User Management Columns
-- ========================================

-- Add columns for user management
ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked_by UUID REFERENCES admins(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_blocked_at ON users(blocked_at);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active_at DESC);

-- Comments
COMMENT ON COLUMN users.blocked_at IS 'Timestamp when user was blocked by admin';
COMMENT ON COLUMN users.blocked_by IS 'Admin who blocked the user';
COMMENT ON COLUMN users.blocked_reason IS 'Reason for blocking';
COMMENT ON COLUMN users.deleted_at IS 'Soft delete timestamp';
COMMENT ON COLUMN users.last_active_at IS 'Last activity timestamp';
