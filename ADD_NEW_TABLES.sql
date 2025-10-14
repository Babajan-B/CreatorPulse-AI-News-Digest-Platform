-- ================================================
-- ADD NEW TABLES FOR MVP FEATURES
-- ================================================
-- Run this in Supabase SQL Editor
-- This ADDS new tables to your existing schema
-- Does NOT modify existing tables
-- ================================================

-- First, add new columns to existing user_settings table
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS preferred_mode VARCHAR(50) DEFAULT 'ai_news',
ADD COLUMN IF NOT EXISTS voice_trained BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS voice_training_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS voice_profile JSONB DEFAULT '{}';

-- Add constraint if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'check_preferred_mode'
  ) THEN
    ALTER TABLE user_settings 
    ADD CONSTRAINT check_preferred_mode 
    CHECK (preferred_mode IN ('ai_news', 'science_breakthrough'));
  END IF;
END $$;

-- ================================================
-- 1. CUSTOM SOURCE CONNECTIONS
-- ================================================

CREATE TABLE IF NOT EXISTS user_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('twitter', 'youtube', 'rss', 'newsletter')),
    source_identifier TEXT NOT NULL,
    source_name VARCHAR(255),
    priority_weight INTEGER DEFAULT 5 CHECK (priority_weight >= 1 AND priority_weight <= 10),
    enabled BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    last_fetched_at TIMESTAMPTZ,
    fetch_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, source_type, source_identifier)
);

CREATE INDEX IF NOT EXISTS idx_user_sources_user_id ON user_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sources_enabled ON user_sources(enabled) WHERE enabled = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_sources_type ON user_sources(source_type);

-- ================================================
-- 2. TREND DETECTION ENGINE
-- ================================================

CREATE TABLE IF NOT EXISTS trend_detection (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic VARCHAR(255) NOT NULL,
    keywords TEXT[] NOT NULL,
    article_count INTEGER DEFAULT 0,
    trend_score NUMERIC(5,2) DEFAULT 0.0 CHECK (trend_score >= 0 AND trend_score <= 10),
    velocity NUMERIC(8,2) DEFAULT 0.0,
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    peak_time TIMESTAMPTZ,
    time_window VARCHAR(10) DEFAULT '24h',
    related_articles JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trend_detection_topic ON trend_detection(topic);
CREATE INDEX IF NOT EXISTS idx_trend_detection_score ON trend_detection(trend_score DESC);
CREATE INDEX IF NOT EXISTS idx_trend_detection_detected_at ON trend_detection(detected_at DESC);

CREATE TABLE IF NOT EXISTS keyword_mentions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keyword VARCHAR(255) NOT NULL,
    mention_date DATE NOT NULL,
    mention_count INTEGER DEFAULT 1,
    article_ids UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(keyword, mention_date)
);

CREATE INDEX IF NOT EXISTS idx_keyword_mentions_keyword ON keyword_mentions(keyword);
CREATE INDEX IF NOT EXISTS idx_keyword_mentions_date ON keyword_mentions(mention_date DESC);

-- ================================================
-- 3. VOICE/STYLE TRAINING SYSTEM
-- ================================================

CREATE TABLE IF NOT EXISTS voice_training_samples (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    published_date DATE,
    style_analysis JSONB DEFAULT '{}',
    word_count INTEGER,
    sentence_count INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_training_user_id ON voice_training_samples(user_id);

-- ================================================
-- 4. DRAFT REVIEW & APPROVAL WORKFLOW
-- ================================================

CREATE TABLE IF NOT EXISTS newsletter_drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content_intro TEXT,
    curated_articles JSONB DEFAULT '[]',
    trends_section JSONB DEFAULT '{}',
    commentary TEXT,
    closing TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'sent', 'discarded')),
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    review_time_seconds INTEGER,
    edit_count INTEGER DEFAULT 0,
    original_content JSONB,
    edited_content JSONB,
    email_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_drafts_user_id ON newsletter_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_drafts_status ON newsletter_drafts(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_drafts_generated_at ON newsletter_drafts(generated_at DESC);

-- ================================================
-- 5. FEEDBACK LOOP & LEARNING
-- ================================================

CREATE TABLE IF NOT EXISTS draft_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    draft_id UUID REFERENCES newsletter_drafts(id) ON DELETE CASCADE,
    article_id TEXT REFERENCES feed_items(id) ON DELETE SET NULL,
    section_type VARCHAR(20) CHECK (section_type IN ('intro', 'article', 'trend', 'closing', 'overall')),
    reaction VARCHAR(20) CHECK (reaction IN ('thumbs_up', 'thumbs_down', 'neutral')),
    edit_applied BOOLEAN DEFAULT FALSE,
    original_text TEXT,
    edited_text TEXT,
    feedback_notes TEXT,
    feedback_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_draft_feedback_user_id ON draft_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_draft_feedback_draft_id ON draft_feedback(draft_id);
CREATE INDEX IF NOT EXISTS idx_draft_feedback_article_id ON draft_feedback(article_id);

CREATE TABLE IF NOT EXISTS learning_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    insight_type VARCHAR(50) NOT NULL,
    insight_data JSONB NOT NULL,
    applied BOOLEAN DEFAULT FALSE,
    confidence_score NUMERIC(3,2) DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    applied_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_learning_insights_user_id ON learning_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_insights_type ON learning_insights(insight_type);

-- ================================================
-- 6. ANALYTICS DASHBOARD
-- ================================================

CREATE TABLE IF NOT EXISTS engagement_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    draft_id UUID REFERENCES newsletter_drafts(id) ON DELETE SET NULL,
    email_id VARCHAR(255),
    event_type VARCHAR(50) NOT NULL,
    article_id TEXT REFERENCES feed_items(id) ON DELETE SET NULL,
    link_clicked TEXT,
    recipient_email VARCHAR(255),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_agent TEXT,
    ip_address INET,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_engagement_analytics_user_id ON engagement_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_engagement_analytics_draft_id ON engagement_analytics(draft_id);
CREATE INDEX IF NOT EXISTS idx_engagement_analytics_email_id ON engagement_analytics(email_id);
CREATE INDEX IF NOT EXISTS idx_engagement_analytics_event_type ON engagement_analytics(event_type);

CREATE TABLE IF NOT EXISTS analytics_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, period_start, period_end)
);

CREATE INDEX IF NOT EXISTS idx_analytics_summary_user_id ON analytics_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_summary_period ON analytics_summary(period_start DESC, period_end DESC);

-- ================================================
-- 7. DELIVERY SCHEDULES
-- ================================================

CREATE TABLE IF NOT EXISTS delivery_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    schedule_type VARCHAR(20) DEFAULT 'daily' CHECK (schedule_type IN ('daily', 'weekly', 'custom')),
    delivery_time TIME NOT NULL DEFAULT '08:00:00',
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    days_of_week INTEGER[] DEFAULT '{1,2,3,4,5}',
    enabled BOOLEAN DEFAULT TRUE,
    channels TEXT[] DEFAULT '{"email"}',
    last_delivered_at TIMESTAMPTZ,
    next_delivery_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_schedules_user_id ON delivery_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_delivery_schedules_enabled ON delivery_schedules(enabled) WHERE enabled = TRUE;

-- ================================================
-- SUCCESS MESSAGE
-- ================================================

SELECT 'New tables added successfully! You can now use voice training and custom sources!' as message;

