-- ========================================
-- 360° РАБОТА - Admin Dashboard
-- Migration 003: Add Moderation Columns to Vacancies
-- ========================================

-- Add moderation columns to vacancies table
ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(20) DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES admins(id);
ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP;
ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES admins(id);
ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS rejection_comment TEXT;
ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Create indexes for moderation
CREATE INDEX IF NOT EXISTS idx_vacancies_moderation_status ON vacancies(moderation_status);
CREATE INDEX IF NOT EXISTS idx_vacancies_approved_at ON vacancies(approved_at);
CREATE INDEX IF NOT EXISTS idx_vacancies_rejected_at ON vacancies(rejected_at);
CREATE INDEX IF NOT EXISTS idx_vacancies_deleted_at ON vacancies(deleted_at);

-- Comments
COMMENT ON COLUMN vacancies.moderation_status IS 'Moderation status: pending, approved, rejected';
COMMENT ON COLUMN vacancies.approved_by IS 'Admin who approved the vacancy';
COMMENT ON COLUMN vacancies.rejected_by IS 'Admin who rejected the vacancy';
COMMENT ON COLUMN vacancies.rejection_reason IS 'Reason for rejection';
COMMENT ON COLUMN vacancies.rejection_comment IS 'Detailed comment on rejection';
