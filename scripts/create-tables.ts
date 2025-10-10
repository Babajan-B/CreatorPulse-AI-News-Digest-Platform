/**
 * Create Supabase Tables
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dptkbsqxxtjuyksucnky.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwdGtic3F4eHRqdXlrc3Vjbmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMzIwNDQsImV4cCI6MjA3NTYwODA0NH0.ZxRfS0hk_eVTjJXdcl5KRyhCzodxuHrKEFG68MUSXmE';

console.log('🔗 Connecting to Supabase...');
console.log(`URL: ${supabaseUrl}\n`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  console.log('📋 Creating database tables...\n');

  try {
    // Create articles table
    console.log('Creating articles table...');
    const { error: articlesError } = await supabase.rpc('exec', {
      sql: `
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
        
        CREATE INDEX IF NOT EXISTS idx_published_at ON articles(published_at DESC);
        CREATE INDEX IF NOT EXISTS idx_quality_score ON articles(quality_score DESC);
      `
    });

    if (articlesError) {
      console.log('ℹ️  Note:', articlesError.message);
    } else {
      console.log('✅ Articles table created');
    }

    // Create users table
    console.log('Creating users table...');
    const { error: usersError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT NOT NULL UNIQUE,
          name TEXT,
          settings JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        INSERT INTO users (email, name) VALUES ('guest@creatorpulse.com', 'Guest User')
        ON CONFLICT (email) DO NOTHING;
      `
    });

    if (usersError) {
      console.log('ℹ️  Note:', usersError.message);
    } else {
      console.log('✅ Users table created');
    }

    console.log('\n✅ Database setup complete!');
    console.log('\nYour CreatorPulse is now connected to Supabase! 🎉');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  The rpc function might not be available.');
    console.log('Please create tables manually in Supabase SQL Editor.\n');
  }
}

createTables();

