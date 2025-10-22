-- Create user_api_keys table for secure API key storage
-- This table stores encrypted API keys for users

CREATE TABLE IF NOT EXISTS user_api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_name VARCHAR(100) NOT NULL,
  key_type VARCHAR(50) NOT NULL CHECK (key_type IN ('openai', 'anthropic', 'groq', 'mailersend', 'linkedin', 'custom')),
  encrypted_value TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  UNIQUE(user_id, key_type, key_name),
  CHECK (key_name != ''),
  CHECK (encrypted_value != '')
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_api_keys_user_id ON user_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_type ON user_api_keys(key_type);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_active ON user_api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_last_used ON user_api_keys(last_used_at);

-- Add comment for documentation
COMMENT ON TABLE user_api_keys IS 'Stores encrypted API keys for users';
COMMENT ON COLUMN user_api_keys.encrypted_value IS 'AES-256-GCM encrypted API key value';
COMMENT ON COLUMN user_api_keys.key_type IS 'Type of API key (openai, anthropic, groq, etc.)';
COMMENT ON COLUMN user_api_keys.is_active IS 'Whether the API key is currently active';

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_api_keys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_user_api_keys_updated_at
  BEFORE UPDATE ON user_api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_user_api_keys_updated_at();

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON user_api_keys TO your_app_user;
-- GRANT USAGE ON SEQUENCE user_api_keys_id_seq TO your_app_user;




