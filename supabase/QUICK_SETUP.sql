-- CreatorPulse Quick Setup for Supabase
-- Copy and paste this entire file into Supabase SQL Editor and click RUN

-- ================================================
-- Articles Table
-- ================================================
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL,
  source_logo TEXT,
  source_type TEXT DEFAULT 'rss',
  published_at TIMESTAMPTZ NOT NULL,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  author TEXT,
  image_url TEXT,
  tags TEXT[],
  quality_score DECIMAL(3,2) DEFAULT 5.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_quality_score ON articles(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source);

-- ================================================
-- Users Table  
-- ================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default user
INSERT INTO users (email, name) VALUES ('guest@creatorpulse.com', 'Guest User')
ON CONFLICT (email) DO NOTHING;

-- ================================================
-- Digests Table
-- ================================================
CREATE TABLE IF NOT EXISTS digests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  article_ids TEXT[],
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'draft',
  email_sent BOOLEAN DEFAULT FALSE,
  linkedin_posted BOOLEAN DEFAULT FALSE
);

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE 'CreatorPulse tables created successfully! 🎉';
END $$;

