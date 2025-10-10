import { createClient } from '@supabase/supabase-js';

// Database configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database Types
export interface DBArticle {
  id: string;
  title: string;
  summary: string;
  content?: string;
  url: string;
  source: string;
  source_logo?: string;
  source_type: string;
  published_at: string;
  scraped_at: string;
  author?: string;
  image_url?: string;
  tags: string[];
  quality_score: number;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

export interface DBUser {
  id: string;
  email: string;
  name?: string;
  settings?: any;
  created_at?: string;
  updated_at?: string;
}

export interface DBDigest {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  article_ids: string[];
  generated_at: string;
  delivered_at?: string;
  status: 'draft' | 'generated' | 'delivered' | 'failed';
  image_url?: string;
  email_sent: boolean;
  linkedin_posted: boolean;
  created_at?: string;
}

// Database connection string for direct PostgreSQL access if needed
export const dbConnectionString = DATABASE_URL;

