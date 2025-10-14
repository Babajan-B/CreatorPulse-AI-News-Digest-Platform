-- ================================================
-- CreatorPulse - Missing Features Database Schema
-- ================================================
-- This script creates all tables for the missing MVP features
-- Run this after COMPLETE_SCHEMA.sql

-- ================================================
-- 1. CUSTOM SOURCE CONNECTIONS
-- ================================================

CREATE TABLE IF NOT EXISTS user_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('twitter', 'youtube', 'rss', 'newsletter')),
    source_identifier TEXT NOT NULL, -- Twitter handle, YouTube channel ID, RSS URL, etc.
    source_name VARCHAR(255),
    priority_weight INTEGER DEFAULT 5 CHECK (priority_weight >= 1 AND priority_weight <= 10),
    enabled BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}', -- Store additional source-specific data
    last_fetched_at TIMESTAMP WITH TIME ZONE,
    fetch_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, source_type, source_identifier)
);

CREATE INDEX idx_user_sources_user_id ON user_sources(user_id);
CREATE INDEX idx_user_sources_enabled ON user_sources(enabled) WHERE enabled = TRUE;
CREATE INDEX idx_user_sources_type ON user_sources(source_type);

-- ================================================
-- 2. TREND DETECTION ENGINE
-- ================================================

CREATE TABLE IF NOT EXISTS trend_detection (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic VARCHAR(255) NOT NULL,
    keywords TEXT[] NOT NULL,
    article_count INTEGER DEFAULT 0,
    trend_score NUMERIC(5,2) DEFAULT 0.0 CHECK (trend_score >= 0 AND trend_score <= 10),
    velocity NUMERIC(8,2) DEFAULT 0.0, -- Rate of growth
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    peak_time TIMESTAMP WITH TIME ZONE,
    time_window VARCHAR(10) DEFAULT '24h', -- '24h', '7d', '30d'
    related_articles JSONB DEFAULT '[]', -- Array of article references
    metadata JSONB DEFAULT '{}',
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_trend_detection_topic ON trend_detection(topic);
CREATE INDEX idx_trend_detection_score ON trend_detection(trend_score DESC);
CREATE INDEX idx_trend_detection_detected_at ON trend_detection(detected_at DESC);
CREATE INDEX idx_trend_detection_expires_at ON trend_detection(expires_at);

-- Table to track keyword mentions over time
CREATE TABLE IF NOT EXISTS keyword_mentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keyword VARCHAR(255) NOT NULL,
    mention_date DATE NOT NULL,
    mention_count INTEGER DEFAULT 1,
    article_ids UUID[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(keyword, mention_date)
);

CREATE INDEX idx_keyword_mentions_keyword ON keyword_mentions(keyword);
CREATE INDEX idx_keyword_mentions_date ON keyword_mentions(mention_date DESC);

-- ================================================
-- 3. VOICE/STYLE TRAINING SYSTEM
-- ================================================

CREATE TABLE IF NOT EXISTS voice_training_samples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    published_date DATE,
    style_analysis JSONB DEFAULT '{}', -- Extracted style metrics
    word_count INTEGER,
    sentence_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_voice_training_user_id ON voice_training_samples(user_id);

-- Extend user_settings table with voice training fields
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS voice_trained BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS voice_training_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS voice_profile JSONB DEFAULT '{}';

-- ================================================
-- 4. DRAFT REVIEW & APPROVAL WORKFLOW
-- ================================================

CREATE TABLE IF NOT EXISTS newsletter_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content_intro TEXT,
    curated_articles JSONB DEFAULT '[]', -- Array of article objects with commentary
    trends_section JSONB DEFAULT '{}', -- Trends to watch section
    commentary TEXT,
    closing TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'sent', 'discarded')),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    review_time_seconds INTEGER, -- Track time spent reviewing
    edit_count INTEGER DEFAULT 0,
    original_content JSONB, -- Full original generated content
    edited_content JSONB, -- User edited content
    email_id VARCHAR(255), -- MailerSend message ID
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_newsletter_drafts_user_id ON newsletter_drafts(user_id);
CREATE INDEX idx_newsletter_drafts_status ON newsletter_drafts(status);
CREATE INDEX idx_newsletter_drafts_generated_at ON newsletter_drafts(generated_at DESC);

-- ================================================
-- 5. FEEDBACK LOOP & LEARNING
-- ================================================

CREATE TABLE IF NOT EXISTS draft_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    draft_id UUID REFERENCES newsletter_drafts(id) ON DELETE CASCADE,
    article_id UUID REFERENCES feed_items(id) ON DELETE SET NULL,
    section_type VARCHAR(20) CHECK (section_type IN ('intro', 'article', 'trend', 'closing', 'overall')),
    reaction VARCHAR(20) CHECK (reaction IN ('thumbs_up', 'thumbs_down', 'neutral')),
    edit_applied BOOLEAN DEFAULT FALSE,
    original_text TEXT,
    edited_text TEXT,
    feedback_notes TEXT,
    feedback_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_draft_feedback_user_id ON draft_feedback(user_id);
CREATE INDEX idx_draft_feedback_draft_id ON draft_feedback(draft_id);
CREATE INDEX idx_draft_feedback_article_id ON draft_feedback(article_id);
CREATE INDEX idx_draft_feedback_reaction ON draft_feedback(reaction);

-- Learning insights table
CREATE TABLE IF NOT EXISTS learning_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    insight_type VARCHAR(50) NOT NULL, -- 'source_quality', 'voice_refinement', 'content_preference'
    insight_data JSONB NOT NULL,
    applied BOOLEAN DEFAULT FALSE,
    confidence_score NUMERIC(3,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    applied_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_learning_insights_user_id ON learning_insights(user_id);
CREATE INDEX idx_learning_insights_type ON learning_insights(insight_type);
CREATE INDEX idx_learning_insights_applied ON learning_insights(applied);

-- ================================================
-- 6. ANALYTICS DASHBOARD
-- ================================================

CREATE TABLE IF NOT EXISTS engagement_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    draft_id UUID REFERENCES newsletter_drafts(id) ON DELETE SET NULL,
    email_id VARCHAR(255), -- MailerSend message ID
    event_type VARCHAR(50) NOT NULL, -- sent, delivered, opened, clicked, bounced, spam_complaint
    article_id UUID REFERENCES feed_items(id) ON DELETE SET NULL,
    link_clicked TEXT,
    recipient_email VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_agent TEXT,
    ip_address INET,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_engagement_analytics_user_id ON engagement_analytics(user_id);
CREATE INDEX idx_engagement_analytics_draft_id ON engagement_analytics(draft_id);
CREATE INDEX idx_engagement_analytics_email_id ON engagement_analytics(email_id);
CREATE INDEX idx_engagement_analytics_event_type ON engagement_analytics(event_type);
CREATE INDEX idx_engagement_analytics_timestamp ON engagement_analytics(timestamp DESC);

-- Aggregated analytics for faster queries
CREATE TABLE IF NOT EXISTS analytics_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_sent INTEGER DEFAULT 0,
    total_delivered INTEGER DEFAULT 0,
    total_opened INTEGER DEFAULT 0,
    total_clicked INTEGER DEFAULT 0,
    total_bounced INTEGER DEFAULT 0,
    open_rate NUMERIC(5,2) DEFAULT 0.0,
    click_through_rate NUMERIC(5,2) DEFAULT 0.0,
    engagement_rate NUMERIC(5,2) DEFAULT 0.0,
    time_saved_minutes INTEGER DEFAULT 0,
    roi_calculated NUMERIC(10,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, period_start, period_end)
);

CREATE INDEX idx_analytics_summary_user_id ON analytics_summary(user_id);
CREATE INDEX idx_analytics_summary_period ON analytics_summary(period_start DESC, period_end DESC);

-- ================================================
-- 7. SCHEDULED DELIVERY ENHANCEMENTS
-- ================================================

CREATE TABLE IF NOT EXISTS delivery_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    schedule_type VARCHAR(20) DEFAULT 'daily' CHECK (schedule_type IN ('daily', 'weekly', 'custom')),
    delivery_time TIME NOT NULL DEFAULT '08:00:00',
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    days_of_week INTEGER[] DEFAULT '{1,2,3,4,5}', -- 0=Sunday, 6=Saturday
    enabled BOOLEAN DEFAULT TRUE,
    channels TEXT[] DEFAULT '{"email"}', -- email, whatsapp, etc.
    last_delivered_at TIMESTAMP WITH TIME ZONE,
    next_delivery_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_delivery_schedules_user_id ON delivery_schedules(user_id);
CREATE INDEX idx_delivery_schedules_enabled ON delivery_schedules(enabled) WHERE enabled = TRUE;
CREATE INDEX idx_delivery_schedules_next_delivery ON delivery_schedules(next_delivery_at);

-- ================================================
-- UTILITY FUNCTIONS
-- ================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_user_sources_updated_at BEFORE UPDATE ON user_sources 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletter_drafts_updated_at BEFORE UPDATE ON newsletter_drafts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_summary_updated_at BEFORE UPDATE ON analytics_summary 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_schedules_updated_at BEFORE UPDATE ON delivery_schedules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- VIEWS FOR COMMON QUERIES
-- ================================================

-- View for active user sources
CREATE OR REPLACE VIEW v_active_user_sources AS
SELECT 
    us.*,
    u.email as user_email,
    u.full_name as user_name
FROM user_sources us
JOIN users u ON us.user_id = u.id
WHERE us.enabled = TRUE;

-- View for trending topics with article count
CREATE OR REPLACE VIEW v_trending_topics AS
SELECT 
    topic,
    keywords,
    article_count,
    trend_score,
    velocity,
    detected_at,
    related_articles
FROM trend_detection
WHERE expires_at > NOW()
ORDER BY trend_score DESC, detected_at DESC
LIMIT 50;

-- View for draft analytics
CREATE OR REPLACE VIEW v_draft_analytics AS
SELECT 
    nd.id,
    nd.user_id,
    nd.title,
    nd.status,
    nd.generated_at,
    nd.review_time_seconds,
    nd.edit_count,
    COUNT(DISTINCT ea.id) FILTER (WHERE ea.event_type = 'opened') as open_count,
    COUNT(DISTINCT ea.id) FILTER (WHERE ea.event_type = 'clicked') as click_count,
    COUNT(DISTINCT df.id) as feedback_count,
    COUNT(DISTINCT df.id) FILTER (WHERE df.reaction = 'thumbs_up') as positive_feedback,
    COUNT(DISTINCT df.id) FILTER (WHERE df.reaction = 'thumbs_down') as negative_feedback
FROM newsletter_drafts nd
LEFT JOIN engagement_analytics ea ON nd.id = ea.draft_id
LEFT JOIN draft_feedback df ON nd.id = df.draft_id
GROUP BY nd.id, nd.user_id, nd.title, nd.status, nd.generated_at, nd.review_time_seconds, nd.edit_count;

-- ================================================
-- SAMPLE DATA (Optional - for testing)
-- ================================================

-- Insert sample trend detection data
-- INSERT INTO trend_detection (topic, keywords, article_count, trend_score, velocity)
-- VALUES 
--     ('Multimodal AI', ARRAY['multimodal', 'gemini', 'gpt-4v'], 15, 8.5, 12.3),
--     ('AI Regulation', ARRAY['regulation', 'policy', 'governance'], 12, 7.8, 8.9),
--     ('Open Source LLMs', ARRAY['open source', 'llama', 'mistral'], 18, 9.2, 15.6);

-- ================================================
-- PERMISSIONS (Row Level Security)
-- ================================================

-- Enable RLS on all new tables
ALTER TABLE user_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_detection ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_training_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE draft_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_schedules ENABLE ROW LEVEL SECURITY;

-- User Sources Policies
CREATE POLICY user_sources_select ON user_sources FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_sources_insert ON user_sources FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_sources_update ON user_sources FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY user_sources_delete ON user_sources FOR DELETE USING (auth.uid() = user_id);

-- Voice Training Policies
CREATE POLICY voice_training_select ON voice_training_samples FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY voice_training_insert ON voice_training_samples FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY voice_training_delete ON voice_training_samples FOR DELETE USING (auth.uid() = user_id);

-- Newsletter Drafts Policies
CREATE POLICY drafts_select ON newsletter_drafts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY drafts_insert ON newsletter_drafts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY drafts_update ON newsletter_drafts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY drafts_delete ON newsletter_drafts FOR DELETE USING (auth.uid() = user_id);

-- Feedback Policies
CREATE POLICY feedback_select ON draft_feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY feedback_insert ON draft_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Analytics Policies
CREATE POLICY analytics_select ON engagement_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY analytics_insert ON engagement_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Delivery Schedules Policies
CREATE POLICY schedules_select ON delivery_schedules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY schedules_insert ON delivery_schedules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY schedules_update ON delivery_schedules FOR UPDATE USING (auth.uid() = user_id);

-- Trend Detection is public read (no user_id)
CREATE POLICY trends_select_all ON trend_detection FOR SELECT USING (true);

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================

-- Additional composite indexes for common queries
CREATE INDEX idx_engagement_user_draft ON engagement_analytics(user_id, draft_id, event_type);
CREATE INDEX idx_feedback_user_draft ON draft_feedback(user_id, draft_id, reaction);
CREATE INDEX idx_drafts_user_status ON newsletter_drafts(user_id, status, generated_at DESC);

-- ================================================
-- CLEANUP AND MAINTENANCE
-- ================================================

-- Function to clean up expired trends
CREATE OR REPLACE FUNCTION cleanup_expired_trends()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM trend_detection WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to aggregate analytics daily
CREATE OR REPLACE FUNCTION aggregate_daily_analytics()
RETURNS void AS $$
BEGIN
    INSERT INTO analytics_summary (
        user_id, period_start, period_end,
        total_sent, total_delivered, total_opened, total_clicked, total_bounced,
        open_rate, click_through_rate, engagement_rate
    )
    SELECT 
        user_id,
        CURRENT_DATE - INTERVAL '1 day' as period_start,
        CURRENT_DATE as period_end,
        COUNT(*) FILTER (WHERE event_type = 'sent') as total_sent,
        COUNT(*) FILTER (WHERE event_type = 'delivered') as total_delivered,
        COUNT(DISTINCT email_id) FILTER (WHERE event_type = 'opened') as total_opened,
        COUNT(DISTINCT email_id) FILTER (WHERE event_type = 'clicked') as total_clicked,
        COUNT(*) FILTER (WHERE event_type = 'bounced') as total_bounced,
        CASE 
            WHEN COUNT(*) FILTER (WHERE event_type = 'sent') > 0 
            THEN (COUNT(DISTINCT email_id) FILTER (WHERE event_type = 'opened')::NUMERIC / 
                  COUNT(*) FILTER (WHERE event_type = 'sent')) * 100
            ELSE 0
        END as open_rate,
        CASE 
            WHEN COUNT(DISTINCT email_id) FILTER (WHERE event_type = 'opened') > 0 
            THEN (COUNT(DISTINCT email_id) FILTER (WHERE event_type = 'clicked')::NUMERIC / 
                  COUNT(DISTINCT email_id) FILTER (WHERE event_type = 'opened')) * 100
            ELSE 0
        END as click_through_rate,
        CASE 
            WHEN COUNT(*) FILTER (WHERE event_type = 'sent') > 0 
            THEN (COUNT(DISTINCT email_id) FILTER (WHERE event_type = 'clicked')::NUMERIC / 
                  COUNT(*) FILTER (WHERE event_type = 'sent')) * 100
            ELSE 0
        END as engagement_rate
    FROM engagement_analytics
    WHERE timestamp >= CURRENT_DATE - INTERVAL '1 day'
      AND timestamp < CURRENT_DATE
    GROUP BY user_id
    ON CONFLICT (user_id, period_start, period_end) 
    DO UPDATE SET
        total_sent = EXCLUDED.total_sent,
        total_delivered = EXCLUDED.total_delivered,
        total_opened = EXCLUDED.total_opened,
        total_clicked = EXCLUDED.total_clicked,
        total_bounced = EXCLUDED.total_bounced,
        open_rate = EXCLUDED.open_rate,
        click_through_rate = EXCLUDED.click_through_rate,
        engagement_rate = EXCLUDED.engagement_rate,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- COMPLETION
-- ================================================

COMMENT ON TABLE user_sources IS 'Custom user content sources (Twitter, YouTube, RSS)';
COMMENT ON TABLE trend_detection IS 'Trending topics and emerging themes detection';
COMMENT ON TABLE voice_training_samples IS 'User newsletter samples for voice matching';
COMMENT ON TABLE newsletter_drafts IS 'Generated newsletter drafts for review';
COMMENT ON TABLE draft_feedback IS 'User feedback on draft quality and content';
COMMENT ON TABLE engagement_analytics IS 'Email engagement tracking (opens, clicks, etc.)';
COMMENT ON TABLE analytics_summary IS 'Pre-aggregated analytics for dashboard';
COMMENT ON TABLE delivery_schedules IS 'User delivery preferences and schedules';

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

SELECT 'Missing features schema created successfully!' as message;




