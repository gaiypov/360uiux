-- Migration: Add FCM token support for push notifications
-- Date: 2025-01-13
-- Description: Add fcm_token column to users table for Firebase Cloud Messaging

-- Add fcm_token column to users table
ALTER TABLE users
ADD COLUMN fcm_token TEXT;

-- Add index for faster lookups by FCM token
CREATE INDEX idx_users_fcm_token ON users(fcm_token) WHERE fcm_token IS NOT NULL;

-- Add comment
COMMENT ON COLUMN users.fcm_token IS 'Firebase Cloud Messaging token for push notifications';
