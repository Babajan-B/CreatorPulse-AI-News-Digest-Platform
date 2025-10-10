-- CreatorPulse Database Schema
-- Two main databases: Articles & User Data

-- ================================================
-- DATABASE 1: ARTICLES & NEWS DATA
-- ================================================

-- Articles Table
CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    content TEXT,
    url TEXT NOT NULL UNIQUE,
    source TEXT NOT NULL,
    source_logo TEXT,
    source_type TEXT NOT NULL DEFAULT 'rss',
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    scraped_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    author TEXT,
    image_url TEXT,
    tags TEXT[] DEFAULT '{}',
    quality_score DECIMAL(3,2) DEFAULT 5.0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source);
CREATE INDEX IF NOT EXISTS idx_articles_quality_score ON articles(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_articles_tags ON articles USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_articles_scraped_at ON articles(scraped_at DESC);

-- ================================================
-- DATABASE 2: USER DATA & DIGESTS
-- ================================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    settings JSONB DEFAULT '{
        "timezone": "America/New_York",
        "notifications": {
            "email": true,
            "push": false
        },
        "automation": {
            "enableDaily": false,
            "deliveryTime": "09:00",
            "autoEmailDigest": false,
            "autoLinkedInPost": false,
            "autoGenerateImage": false
        },
        "preferences": {
            "topicsOfInterest": [],
            "minimumScore": 0.5,
            "maxItemsPerDigest": 10,
            "summaryLength": "medium"
        }
    }',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Credentials Table (for storing API keys securely)
CREATE TABLE IF NOT EXISTS user_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    llm_api_key TEXT,
    llm_provider TEXT DEFAULT 'openai',
    image_api_key TEXT,
    image_provider TEXT DEFAULT 'dalle',
    linkedin_access_token TEXT,
    linkedin_refresh_token TEXT,
    linkedin_token_expiry TIMESTAMP WITH TIME ZONE,
    twitter_api_key TEXT,
    twitter_api_secret TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Digests Table
CREATE TABLE IF NOT EXISTS digests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    article_ids TEXT[] NOT NULL DEFAULT '{}',
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'delivered', 'failed')),
    image_url TEXT,
    email_sent BOOLEAN DEFAULT FALSE,
    linkedin_posted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for user data
CREATE INDEX IF NOT EXISTS idx_digests_user_id ON digests(user_id);
CREATE INDEX IF NOT EXISTS idx_digests_generated_at ON digests(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_digests_status ON digests(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- User Article Interactions (bookmarks, read status, etc.)
CREATE TABLE IF NOT EXISTS user_article_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    bookmarked BOOLEAN DEFAULT FALSE,
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, article_id)
);

CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_article_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_bookmarked ON user_article_interactions(bookmarked) WHERE bookmarked = TRUE;

-- ================================================
-- FUNCTIONS & TRIGGERS
-- ================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_credentials_updated_at BEFORE UPDATE ON user_credentials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- INITIAL DATA (Optional)
-- ================================================

-- Create a default user for testing
INSERT INTO users (email, name) VALUES ('guest@creatorpulse.com', 'Guest User')
ON CONFLICT (email) DO NOTHING;

-- ================================================
-- VIEWS FOR COMMON QUERIES
-- ================================================

-- Recent high-quality articles view
CREATE OR REPLACE VIEW recent_quality_articles AS
SELECT 
    a.*,
    EXTRACT(EPOCH FROM (NOW() - a.published_at)) / 3600 AS hours_since_published
FROM articles a
WHERE a.published_at > NOW() - INTERVAL '7 days'
  AND a.quality_score >= 7.0
ORDER BY a.quality_score DESC, a.published_at DESC;

-- User digest summary view
CREATE OR REPLACE VIEW user_digest_summary AS
SELECT 
    d.id,
    d.user_id,
    d.title,
    d.generated_at,
    d.status,
    d.email_sent,
    d.linkedin_posted,
    array_length(d.article_ids, 1) AS article_count,
    u.email AS user_email
FROM digests d
JOIN users u ON d.user_id = u.id
ORDER BY d.generated_at DESC;

-- ================================================
-- GRANT PERMISSIONS (if needed)
-- ================================================

-- These are set by Supabase by default, but can be customized
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;

