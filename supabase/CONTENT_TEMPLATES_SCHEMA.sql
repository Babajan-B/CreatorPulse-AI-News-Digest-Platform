-- Content Templates and User Preferences Schema
-- For CreatorPulse content generation system
-- Date: October 18, 2025

-- ================================================
-- CONTENT TEMPLATES TABLE
-- ================================================
-- Stores reusable content templates that users can customize

CREATE TABLE IF NOT EXISTS content_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Template metadata
  name VARCHAR(255) NOT NULL,
  description TEXT,
  content_type VARCHAR(100) NOT NULL, -- 'newsletter', 'youtube_script', 'linkedin_article', etc.
  
  -- Template structure
  structure JSONB NOT NULL DEFAULT '{}'::jsonb, -- Sections, formatting, placeholders
  
  -- Default customization
  default_tone VARCHAR(50) DEFAULT 'professional', -- 'professional', 'casual', 'enthusiastic', 'educational'
  default_length VARCHAR(50) DEFAULT 'medium', -- 'brief', 'medium', 'detailed', 'comprehensive'
  default_audience TEXT[] DEFAULT ARRAY[]::TEXT[], -- Target audience tags
  
  -- Usage tracking
  use_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  is_public BOOLEAN DEFAULT false, -- Whether other users can see/use it
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_content_templates_user_id ON content_templates(user_id);
CREATE INDEX idx_content_templates_content_type ON content_templates(content_type);
CREATE INDEX idx_content_templates_is_public ON content_templates(is_public) WHERE is_public = true;
CREATE INDEX idx_content_templates_use_count ON content_templates(use_count DESC);

-- ================================================
-- USER CONTENT PREFERENCES TABLE
-- ================================================
-- Stores user-specific preferences for content generation

CREATE TABLE IF NOT EXISTS user_content_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Default content settings
  default_content_type VARCHAR(100) DEFAULT 'newsletter',
  default_tone VARCHAR(50) DEFAULT 'professional',
  default_length VARCHAR(50) DEFAULT 'medium',
  default_target_audience TEXT[] DEFAULT ARRAY['Tech Professionals', 'AI Enthusiasts']::TEXT[],
  
  -- Article selection preferences
  min_quality_score DECIMAL(3,1) DEFAULT 7.0,
  preferred_sources TEXT[] DEFAULT ARRAY[]::TEXT[],
  excluded_sources TEXT[] DEFAULT ARRAY[]::TEXT[],
  preferred_topics TEXT[] DEFAULT ARRAY['AI', 'Machine Learning']::TEXT[],
  
  -- Generation preferences
  include_trends BOOLEAN DEFAULT true,
  include_stats BOOLEAN DEFAULT true,
  include_cta BOOLEAN DEFAULT true,
  default_cta_type VARCHAR(50) DEFAULT 'subscribe', -- 'subscribe', 'visit', 'follow', 'share', 'learn_more'
  use_voice_matching BOOLEAN DEFAULT true,
  
  -- Scheduling preferences
  preferred_send_time TIME,
  preferred_send_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5]::INTEGER[], -- 1=Monday, 7=Sunday
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for user lookup
CREATE INDEX idx_user_content_preferences_user_id ON user_content_preferences(user_id);

-- ================================================
-- DRAFT TEMPLATES (Junction table for saved templates)
-- ================================================
-- Links drafts to templates for tracking which template was used

CREATE TABLE IF NOT EXISTS draft_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID NOT NULL REFERENCES newsletter_drafts(id) ON DELETE CASCADE,
  template_id UUID REFERENCES content_templates(id) ON DELETE SET NULL,
  
  -- Customizations applied to this specific draft
  applied_customizations JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_draft_templates_draft_id ON draft_templates(draft_id);
CREATE INDEX idx_draft_templates_template_id ON draft_templates(template_id);

-- ================================================
-- TEMPLATE SECTIONS TABLE
-- ================================================
-- Stores section definitions for templates (optional, for complex templates)

CREATE TABLE IF NOT EXISTS template_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES content_templates(id) ON DELETE CASCADE,
  
  -- Section details
  section_name VARCHAR(255) NOT NULL,
  section_order INTEGER NOT NULL,
  section_type VARCHAR(100) NOT NULL, -- 'intro', 'article', 'trend', 'cta', 'closing', 'custom'
  
  -- Section content
  content_template TEXT,
  is_required BOOLEAN DEFAULT true,
  is_repeatable BOOLEAN DEFAULT false, -- For sections like articles
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_template_sections_template_id ON template_sections(template_id);
CREATE INDEX idx_template_sections_order ON template_sections(template_id, section_order);

-- ================================================
-- FUNCTIONS AND TRIGGERS
-- ================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_content_templates_updated_at BEFORE UPDATE ON content_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_content_preferences_updated_at BEFORE UPDATE ON user_content_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_sections_updated_at BEFORE UPDATE ON template_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment template use count
CREATE OR REPLACE FUNCTION increment_template_use_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE content_templates
  SET 
    use_count = use_count + 1,
    last_used_at = NOW()
  WHERE id = NEW.template_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-increment use count when template is used
CREATE TRIGGER increment_template_use AFTER INSERT ON draft_templates
  FOR EACH ROW EXECUTE FUNCTION increment_template_use_count();

-- ================================================
-- SEED DATA (Default Templates)
-- ================================================

-- Insert default content preferences for new users
-- (This would typically be done in application code when user signs up)

-- Example: Newsletter Template
INSERT INTO content_templates (
  user_id,
  name,
  description,
  content_type,
  structure,
  default_tone,
  default_length,
  is_public
) VALUES (
  -- You'll need to replace this with actual user_id or handle in application
  (SELECT id FROM users LIMIT 1),
  'AI Weekly Newsletter',
  'Professional newsletter format for AI news and insights',
  'newsletter',
  '{
    "sections": [
      {"type": "intro", "name": "Opening", "required": true},
      {"type": "trend", "name": "Trending Topics", "required": false},
      {"type": "article", "name": "Featured Articles", "required": true, "repeatable": true},
      {"type": "closing", "name": "Closing Thoughts", "required": true},
      {"type": "cta", "name": "Call to Action", "required": false}
    ],
    "formatting": {
      "max_articles": 5,
      "include_images": true,
      "include_summaries": true,
      "include_key_points": true
    }
  }'::jsonb,
  'professional',
  'medium',
  true
);

-- ================================================
-- VIEWS FOR COMMON QUERIES
-- ================================================

-- View for popular public templates
CREATE OR REPLACE VIEW popular_public_templates AS
SELECT 
  ct.*,
  u.name as creator_name,
  COUNT(DISTINCT dt.id) as usage_count
FROM content_templates ct
LEFT JOIN users u ON ct.user_id = u.id
LEFT JOIN draft_templates dt ON ct.id = dt.template_id
WHERE ct.is_public = true
GROUP BY ct.id, u.name
ORDER BY usage_count DESC, ct.use_count DESC;

-- View for user's templates with usage stats
CREATE OR REPLACE VIEW user_templates_with_stats AS
SELECT 
  ct.*,
  COUNT(DISTINCT dt.id) as drafts_created,
  MAX(dt.created_at) as last_draft_created
FROM content_templates ct
LEFT JOIN draft_templates dt ON ct.id = dt.template_id
GROUP BY ct.id;

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

-- Enable RLS on all tables
ALTER TABLE content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_content_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE draft_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_sections ENABLE ROW LEVEL SECURITY;

-- Policies for content_templates
CREATE POLICY "Users can view their own templates" ON content_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public templates" ON content_templates
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create their own templates" ON content_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" ON content_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" ON content_templates
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for user_content_preferences
CREATE POLICY "Users can view their own preferences" ON user_content_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences" ON user_content_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_content_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for draft_templates (automatically managed)
CREATE POLICY "Users can view their draft templates" ON draft_templates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM newsletter_drafts nd
      WHERE nd.id = draft_templates.draft_id
      AND nd.user_id = auth.uid()
    )
  );

-- Policies for template_sections
CREATE POLICY "Users can view sections of their templates" ON template_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM content_templates ct
      WHERE ct.id = template_sections.template_id
      AND ct.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view sections of public templates" ON template_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM content_templates ct
      WHERE ct.id = template_sections.template_id
      AND ct.is_public = true
    )
  );

-- ================================================
-- COMMENTS
-- ================================================

COMMENT ON TABLE content_templates IS 'Reusable content templates for different content types';
COMMENT ON TABLE user_content_preferences IS 'User-specific preferences for content generation';
COMMENT ON TABLE draft_templates IS 'Junction table linking drafts to templates';
COMMENT ON TABLE template_sections IS 'Section definitions for complex templates';

COMMENT ON COLUMN content_templates.structure IS 'JSONB containing section definitions, formatting rules, and placeholders';
COMMENT ON COLUMN user_content_preferences.preferred_send_days IS 'Array of integers: 1=Monday, 2=Tuesday, ..., 7=Sunday';

