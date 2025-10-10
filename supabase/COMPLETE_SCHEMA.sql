-- ================================================
-- CreatorPulse Complete Database Schema
-- ================================================
-- User login system + Daily content digest pipeline
-- Supports: Users, Auth, Settings, API Keys, Raw Feeds,
--           Scoring, Digests, Delivery Tracking
-- ================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ================================================
-- 1. USERS & AUTHENTICATION
-- ================================================

-- Users table (core authentication)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    password_hash TEXT, -- bcrypt hash
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- ================================================
-- 2. USER SETTINGS
-- ================================================

-- User settings (preferences, automation, notifications)
CREATE TABLE IF NOT EXISTS user_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- Preferences
    timezone TEXT DEFAULT 'America/New_York',
    digest_time TIME DEFAULT '09:00:00', -- When to deliver daily digest
    max_items_per_digest INTEGER DEFAULT 10,
    min_quality_score DECIMAL(3,2) DEFAULT 0.50,
    summary_length TEXT DEFAULT 'medium' CHECK (summary_length IN ('short', 'medium', 'long')),
    
    -- Topics of interest
    topics_of_interest TEXT[] DEFAULT '{}',
    excluded_topics TEXT[] DEFAULT '{}',
    preferred_sources TEXT[] DEFAULT '{}',
    
    -- Automation settings
    auto_generate_digest BOOLEAN DEFAULT FALSE,
    auto_send_email BOOLEAN DEFAULT FALSE,
    auto_post_linkedin BOOLEAN DEFAULT FALSE,
    auto_generate_image BOOLEAN DEFAULT FALSE,
    
    -- Notification preferences
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- ================================================
-- 3. API KEYS & CREDENTIALS (Encrypted Storage)
-- ================================================

-- User API keys for LLM, image generation, social media
CREATE TABLE IF NOT EXISTS user_api_keys (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- LLM Provider
    llm_provider TEXT DEFAULT 'openai' CHECK (llm_provider IN ('openai', 'anthropic', 'huggingface', 'local')),
    llm_api_key TEXT, -- Encrypted
    llm_model TEXT DEFAULT 'gpt-4',
    
    -- Image Generation
    image_provider TEXT DEFAULT 'dalle' CHECK (image_provider IN ('dalle', 'stabilityai', 'midjourney', 'replicate')),
    image_api_key TEXT, -- Encrypted
    
    -- LinkedIn OAuth
    linkedin_access_token TEXT, -- Encrypted
    linkedin_refresh_token TEXT, -- Encrypted
    linkedin_token_expiry TIMESTAMPTZ,
    
    -- Twitter/X API
    twitter_api_key TEXT, -- Encrypted
    twitter_api_secret TEXT, -- Encrypted
    twitter_bearer_token TEXT, -- Encrypted
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_api_keys_user_id ON user_api_keys(user_id);

-- ================================================
-- 4. RAW FEED ITEMS (All Collected Content)
-- ================================================

-- Raw feed items from all sources (RSS, websites, social)
CREATE TABLE IF NOT EXISTS feed_items (
    id TEXT PRIMARY KEY, -- Source-generated ID or hash
    
    -- Content
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT, -- Full article content if available
    url TEXT NOT NULL UNIQUE,
    
    -- Source info
    source_name TEXT NOT NULL,
    source_url TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('rss', 'website', 'twitter', 'bluesky', 'linkedin')),
    source_logo TEXT,
    
    -- Metadata
    author TEXT,
    published_at TIMESTAMPTZ NOT NULL,
    scraped_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Media
    image_url TEXT,
    video_url TEXT,
    
    -- Classification
    tags TEXT[] DEFAULT '{}',
    categories TEXT[] DEFAULT '{}',
    
    -- Engagement metrics (if available)
    likes_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    
    -- Additional metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feed_items_published_at ON feed_items(published_at DESC);
CREATE INDEX idx_feed_items_source_name ON feed_items(source_name);
CREATE INDEX idx_feed_items_source_type ON feed_items(source_type);
CREATE INDEX idx_feed_items_scraped_at ON feed_items(scraped_at DESC);
CREATE INDEX idx_feed_items_tags ON feed_items USING GIN(tags);
CREATE INDEX idx_feed_items_url ON feed_items(url);

-- Full-text search index
CREATE INDEX idx_feed_items_search ON feed_items USING GIN(to_tsvector('english', title || ' ' || COALESCE(summary, '')));

-- ================================================
-- 5. ITEM SCORES (Quality Scoring Per Day)
-- ================================================

-- Daily quality scores for each feed item
CREATE TABLE IF NOT EXISTS item_scores (
    id BIGSERIAL PRIMARY KEY,
    feed_item_id TEXT NOT NULL REFERENCES feed_items(id) ON DELETE CASCADE,
    score_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Quality score components
    relevance_score DECIMAL(3,2) DEFAULT 0.50, -- 0.00-1.00
    recency_score DECIMAL(3,2) DEFAULT 0.50,
    source_reliability_score DECIMAL(3,2) DEFAULT 0.50,
    engagement_score DECIMAL(3,2) DEFAULT 0.50,
    
    -- Final computed score
    final_score DECIMAL(3,2) DEFAULT 0.50, -- Weighted average
    
    -- Scoring metadata
    scoring_version TEXT DEFAULT 'v1.0',
    scored_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Uniqueness: One score per item per day
    UNIQUE(feed_item_id, score_date)
);

CREATE INDEX idx_item_scores_feed_item ON item_scores(feed_item_id);
CREATE INDEX idx_item_scores_date ON item_scores(score_date DESC);
CREATE INDEX idx_item_scores_final_score ON item_scores(final_score DESC);
CREATE INDEX idx_item_scores_scored_at ON item_scores(scored_at DESC);

-- ================================================
-- 6. DIGESTS (Per User Per Day)
-- ================================================

-- Daily digest generated for each user
CREATE TABLE IF NOT EXISTS digests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Digest info
    title TEXT NOT NULL,
    description TEXT,
    digest_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Status tracking
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'generated', 'delivering', 'delivered', 'failed')),
    
    -- Generation metadata
    generated_at TIMESTAMPTZ,
    generation_duration_ms INTEGER, -- Time to generate
    
    -- Delivery tracking
    delivered_at TIMESTAMPTZ,
    email_sent_at TIMESTAMPTZ,
    linkedin_posted_at TIMESTAMPTZ,
    
    -- Delivery status
    email_sent BOOLEAN DEFAULT FALSE,
    linkedin_posted BOOLEAN DEFAULT FALSE,
    email_opened BOOLEAN DEFAULT FALSE,
    email_clicked BOOLEAN DEFAULT FALSE,
    
    -- Generated content
    summary TEXT, -- Overall digest summary
    image_url TEXT, -- Generated digest image
    
    -- Stats
    total_items INTEGER DEFAULT 0,
    avg_quality_score DECIMAL(3,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- One digest per user per day
    UNIQUE(user_id, digest_date)
);

CREATE INDEX idx_digests_user_id ON digests(user_id);
CREATE INDEX idx_digests_date ON digests(digest_date DESC);
CREATE INDEX idx_digests_status ON digests(status);
CREATE INDEX idx_digests_generated_at ON digests(generated_at DESC);

-- ================================================
-- 7. DIGEST ITEMS (Selected Items for Each Digest)
-- ================================================

-- Items selected and processed for each digest
CREATE TABLE IF NOT EXISTS digest_items (
    id BIGSERIAL PRIMARY KEY,
    digest_id UUID NOT NULL REFERENCES digests(id) ON DELETE CASCADE,
    feed_item_id TEXT NOT NULL REFERENCES feed_items(id) ON DELETE CASCADE,
    
    -- Position in digest
    position INTEGER NOT NULL, -- Order in digest (1, 2, 3, ...)
    
    -- Processed content
    ai_summary TEXT, -- LLM-generated summary
    bullet_points TEXT[], -- Key takeaways
    hashtags TEXT[], -- Social media hashtags
    generated_image_url TEXT, -- Item-specific image if generated
    
    -- Metadata
    selected_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    
    -- Quality & relevance for this user
    user_relevance_score DECIMAL(3,2),
    
    -- Uniqueness: One item per position per digest
    UNIQUE(digest_id, feed_item_id),
    UNIQUE(digest_id, position)
);

CREATE INDEX idx_digest_items_digest_id ON digest_items(digest_id);
CREATE INDEX idx_digest_items_feed_item_id ON digest_items(feed_item_id);
CREATE INDEX idx_digest_items_position ON digest_items(digest_id, position);

-- ================================================
-- 8. USER INTERACTIONS (Bookmarks, Read Status)
-- ================================================

-- Track user engagement with feed items
CREATE TABLE IF NOT EXISTS user_interactions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feed_item_id TEXT NOT NULL REFERENCES feed_items(id) ON DELETE CASCADE,
    
    -- Interaction types
    bookmarked BOOLEAN DEFAULT FALSE,
    bookmarked_at TIMESTAMPTZ,
    
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    
    clicked BOOLEAN DEFAULT FALSE,
    clicked_at TIMESTAMPTZ,
    
    shared BOOLEAN DEFAULT FALSE,
    shared_at TIMESTAMPTZ,
    share_platform TEXT, -- 'email', 'twitter', 'linkedin', 'facebook'
    
    -- User rating (optional)
    user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- One interaction record per user per item
    UNIQUE(user_id, feed_item_id)
);

CREATE INDEX idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX idx_user_interactions_feed_item_id ON user_interactions(feed_item_id);
CREATE INDEX idx_user_interactions_bookmarked ON user_interactions(user_id) WHERE bookmarked = TRUE;
CREATE INDEX idx_user_interactions_read ON user_interactions(user_id) WHERE read = TRUE;

-- ================================================
-- 9. DELIVERY LOGS (Email, LinkedIn Posts)
-- ================================================

-- Track all delivery attempts
CREATE TABLE IF NOT EXISTS delivery_logs (
    id BIGSERIAL PRIMARY KEY,
    digest_id UUID NOT NULL REFERENCES digests(id) ON DELETE CASCADE,
    
    -- Delivery info
    delivery_type TEXT NOT NULL CHECK (delivery_type IN ('email', 'linkedin', 'twitter', 'webhook')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'bounced')),
    
    -- Delivery details
    recipient TEXT, -- Email address or social profile
    subject TEXT,
    
    -- Timestamps
    attempted_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    
    -- Error tracking
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Response data
    external_id TEXT, -- Email ID, LinkedIn post ID, etc.
    response_data JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_delivery_logs_digest_id ON delivery_logs(digest_id);
CREATE INDEX idx_delivery_logs_status ON delivery_logs(status);
CREATE INDEX idx_delivery_logs_type ON delivery_logs(delivery_type);
CREATE INDEX idx_delivery_logs_attempted_at ON delivery_logs(attempted_at DESC);

-- ================================================
-- 10. ANALYTICS & METRICS
-- ================================================

-- Daily analytics aggregation
CREATE TABLE IF NOT EXISTS daily_analytics (
    id BIGSERIAL PRIMARY KEY,
    analytics_date DATE NOT NULL UNIQUE,
    
    -- Feed metrics
    total_items_collected INTEGER DEFAULT 0,
    items_by_source JSONB DEFAULT '{}', -- {"TechCrunch": 25, "VentureBeat": 20}
    avg_quality_score DECIMAL(3,2),
    
    -- Digest metrics
    digests_generated INTEGER DEFAULT 0,
    digests_delivered INTEGER DEFAULT 0,
    emails_sent INTEGER DEFAULT 0,
    linkedin_posts INTEGER DEFAULT 0,
    
    -- Engagement metrics
    total_clicks INTEGER DEFAULT 0,
    total_shares INTEGER DEFAULT 0,
    total_bookmarks INTEGER DEFAULT 0,
    
    -- Top topics
    trending_topics TEXT[],
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_daily_analytics_date ON daily_analytics(analytics_date DESC);

-- ================================================
-- FUNCTIONS & TRIGGERS
-- ================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_api_keys_updated_at
    BEFORE UPDATE ON user_api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_digests_updated_at
    BEFORE UPDATE ON digests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_interactions_updated_at
    BEFORE UPDATE ON user_interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- USEFUL VIEWS FOR QUERIES
-- ================================================

-- Recent high-quality items (for digest generation)
CREATE OR REPLACE VIEW v_recent_quality_items AS
SELECT 
    fi.*,
    COALESCE(isc.final_score, 5.0) as quality_score,
    EXTRACT(EPOCH FROM (NOW() - fi.published_at))/3600 as hours_ago
FROM feed_items fi
LEFT JOIN item_scores isc ON fi.id = isc.feed_item_id 
    AND isc.score_date = CURRENT_DATE
WHERE fi.published_at > NOW() - INTERVAL '7 days'
ORDER BY quality_score DESC, fi.published_at DESC;

-- User digest summary
CREATE OR REPLACE VIEW v_user_digest_summary AS
SELECT 
    d.id as digest_id,
    d.user_id,
    u.email,
    u.name,
    d.digest_date,
    d.title,
    d.status,
    d.total_items,
    d.avg_quality_score,
    d.email_sent,
    d.linkedin_posted,
    d.generated_at,
    d.delivered_at,
    COUNT(di.id) as processed_items
FROM digests d
JOIN users u ON d.user_id = u.id
LEFT JOIN digest_items di ON d.id = di.digest_id
GROUP BY d.id, u.email, u.name
ORDER BY d.digest_date DESC, d.generated_at DESC;

-- ================================================
-- INITIAL DATA
-- ================================================

-- Create default guest user
INSERT INTO users (email, name, email_verified, is_active)
VALUES ('guest@creatorpulse.com', 'Guest User', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

-- Create default settings for guest user
INSERT INTO user_settings (user_id, timezone, digest_time, auto_generate_digest)
SELECT id, 'America/New_York', '09:00:00', FALSE
FROM users WHERE email = 'guest@creatorpulse.com'
ON CONFLICT (user_id) DO NOTHING;

-- ================================================
-- ROW LEVEL SECURITY (RLS) - Optional but recommended
-- ================================================

-- Enable RLS on sensitive tables
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE digests ENABLE ROW LEVEL SECURITY;
ALTER TABLE digest_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY user_settings_policy ON user_settings
    FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY user_api_keys_policy ON user_api_keys
    FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY user_interactions_policy ON user_interactions
    FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY digests_policy ON digests
    FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY digest_items_policy ON digest_items
    FOR ALL
    USING (digest_id IN (SELECT id FROM digests WHERE user_id = auth.uid()));

-- Feed items are public (everyone can read)
ALTER TABLE feed_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY feed_items_public_read ON feed_items
    FOR SELECT
    USING (true);

-- ================================================
-- HELPER FUNCTIONS
-- ================================================

-- Function to calculate final score
CREATE OR REPLACE FUNCTION calculate_final_score(
    p_relevance DECIMAL,
    p_recency DECIMAL,
    p_reliability DECIMAL,
    p_engagement DECIMAL
)
RETURNS DECIMAL AS $$
BEGIN
    RETURN ROUND(
        (p_relevance * 0.35) + 
        (p_recency * 0.25) + 
        (p_reliability * 0.25) + 
        (p_engagement * 0.15),
        2
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get user's digest for today
CREATE OR REPLACE FUNCTION get_todays_digest(p_user_id UUID)
RETURNS TABLE (
    digest_id UUID,
    title TEXT,
    status TEXT,
    total_items INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT id, digests.title, digests.status, digests.total_items
    FROM digests
    WHERE user_id = p_user_id
      AND digest_date = CURRENT_DATE
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- MAINTENANCE FUNCTIONS
-- ================================================

-- Clean up old feed items (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_feed_items()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM feed_items
    WHERE published_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- SUCCESS MESSAGE
-- ================================================

DO $$ 
BEGIN 
    RAISE NOTICE '';
    RAISE NOTICE '✅ CreatorPulse Database Schema Created Successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Tables Created:';
    RAISE NOTICE '  ✓ users (authentication)';
    RAISE NOTICE '  ✓ user_settings (preferences & automation)';
    RAISE NOTICE '  ✓ user_api_keys (LLM, image, social API keys)';
    RAISE NOTICE '  ✓ feed_items (raw collected content)';
    RAISE NOTICE '  ✓ item_scores (daily quality scoring)';
    RAISE NOTICE '  ✓ digests (user digests per day)';
    RAISE NOTICE '  ✓ digest_items (selected & processed items)';
    RAISE NOTICE '  ✓ user_interactions (bookmarks, reads, clicks)';
    RAISE NOTICE '  ✓ delivery_logs (email & social delivery tracking)';
    RAISE NOTICE '  ✓ daily_analytics (metrics aggregation)';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Your CreatorPulse database is ready!';
    RAISE NOTICE '';
END $$;

