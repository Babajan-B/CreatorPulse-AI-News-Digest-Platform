-- Update user_settings table to add preferred_mode field
-- This script adds support for dual-mode: AI News vs Science Breakthroughs

-- Add preferred_mode column to user_settings table
ALTER TABLE user_settings 
ADD COLUMN preferred_mode VARCHAR(50) DEFAULT 'ai_news';

-- Add check constraint to ensure valid modes
ALTER TABLE user_settings 
ADD CONSTRAINT check_preferred_mode 
CHECK (preferred_mode IN ('ai_news', 'science_breakthrough'));

-- Add index for faster queries
CREATE INDEX idx_user_settings_preferred_mode ON user_settings(preferred_mode);

-- Update existing users to have default mode
UPDATE user_settings 
SET preferred_mode = 'ai_news' 
WHERE preferred_mode IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN user_settings.preferred_mode IS 'User preferred content mode: ai_news or science_breakthrough';

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    column_default, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_settings' 
AND column_name = 'preferred_mode';
