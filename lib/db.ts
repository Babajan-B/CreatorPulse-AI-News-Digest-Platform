import { createClient } from '@supabase/supabase-js';
import type { DBArticle, DBUser, DBDigest } from './supabase';

// Supabase configuration - ACTUAL CREDENTIALS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dptkbsqxxtjuyksucnky.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwdGtic3F4eHRqdXlrc3Vjbmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMzIwNDQsImV4cCI6MjA3NTYwODA0NH0.ZxRfS0hk_eVTjJXdcl5KRyhCzodxuHrKEFG68MUSXmE';

// Initialize Supabase client
export const supabaseClient = createClient(supabaseUrl, supabaseKey);

// ================================================
// ARTICLES DATABASE OPERATIONS
// ================================================

/**
 * Save articles to database (upsert - insert or update)
 */
export async function saveArticles(articles: Partial<DBArticle>[]): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const { data, error } = await supabaseClient
      .from('articles')
      .upsert(articles, { onConflict: 'url' })
      .select();

    if (error) {
      console.error('Error saving articles:', error);
      return { success: false, count: 0, error: error.message };
    }

    console.log(`Saved ${data?.length || 0} articles to database`);
    return { success: true, count: data?.length || 0 };
  } catch (error: any) {
    console.error('Exception saving articles:', error);
    return { success: false, count: 0, error: error.message };
  }
}

/**
 * Get articles from database with optional filters
 */
export async function getArticles(options?: {
  limit?: number;
  minScore?: number;
  sources?: string[];
  tags?: string[];
  since?: Date;
}): Promise<{ success: boolean; articles: DBArticle[]; error?: string }> {
  try {
    let query = supabaseClient
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false });

    // Apply filters
    if (options?.minScore) {
      query = query.gte('quality_score', options.minScore);
    }

    if (options?.sources && options.sources.length > 0) {
      query = query.in('source', options.sources);
    }

    if (options?.since) {
      query = query.gte('published_at', options.since.toISOString());
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching articles:', error);
      return { success: false, articles: [], error: error.message };
    }

    // Filter by tags if specified (PostgreSQL array containment)
    let articles = data || [];
    if (options?.tags && options.tags.length > 0) {
      articles = articles.filter(article =>
        options.tags!.some(tag => article.tags?.includes(tag))
      );
    }

    return { success: true, articles };
  } catch (error: any) {
    console.error('Exception fetching articles:', error);
    return { success: false, articles: [], error: error.message };
  }
}

/**
 * Get recent articles from last N days
 */
export async function getRecentArticles(days: number = 7, limit: number = 50): Promise<DBArticle[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const result = await getArticles({ since, limit });
  return result.articles;
}

/**
 * Delete old articles (cleanup)
 */
export async function deleteOldArticles(olderThanDays: number = 30): Promise<{ success: boolean; count: number }> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const { data, error } = await supabaseClient
      .from('articles')
      .delete()
      .lt('published_at', cutoffDate.toISOString())
      .select();

    if (error) {
      console.error('Error deleting old articles:', error);
      return { success: false, count: 0 };
    }

    return { success: true, count: data?.length || 0 };
  } catch (error) {
    console.error('Exception deleting old articles:', error);
    return { success: false, count: 0 };
  }
}

// ================================================
// USER DATABASE OPERATIONS
// ================================================

/**
 * Create or get user
 */
export async function upsertUser(email: string, name?: string): Promise<{ success: boolean; user?: DBUser; error?: string }> {
  try {
    const { data, error } = await supabaseClient
      .from('users')
      .upsert({ email, name }, { onConflict: 'email' })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<DBUser | null> {
  const { data } = await supabaseClient
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  return data;
}

/**
 * Update user settings
 */
export async function updateUserSettings(userId: string, settings: any): Promise<boolean> {
  const { error } = await supabaseClient
    .from('users')
    .update({ settings })
    .eq('id', userId);

  return !error;
}

// ================================================
// DIGEST DATABASE OPERATIONS
// ================================================

/**
 * Create a new digest
 */
export async function createDigest(userId: string, articleIds: string[], title?: string): Promise<{ success: boolean; digest?: DBDigest; error?: string }> {
  try {
    const digestTitle = title || `AI News Digest - ${new Date().toLocaleDateString()}`;

    const { data, error } = await supabaseClient
      .from('digests')
      .insert({
        user_id: userId,
        title: digestTitle,
        article_ids: articleIds,
        status: 'generated',
        generated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, digest: data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get user's digests
 */
export async function getUserDigests(userId: string, limit: number = 10): Promise<DBDigest[]> {
  const { data } = await supabaseClient
    .from('digests')
    .select('*')
    .eq('user_id', userId)
    .order('generated_at', { ascending: false })
    .limit(limit);

  return data || [];
}

/**
 * Update digest status
 */
export async function updateDigestStatus(
  digestId: string,
  updates: {
    status?: string;
    emailSent?: boolean;
    linkedinPosted?: boolean;
    deliveredAt?: Date;
  }
): Promise<boolean> {
  const { error } = await supabaseClient
    .from('digests')
    .update({
      status: updates.status,
      email_sent: updates.emailSent,
      linkedin_posted: updates.linkedinPosted,
      delivered_at: updates.deliveredAt?.toISOString(),
    })
    .eq('id', digestId);

  return !error;
}

// ================================================
// STATISTICS & ANALYTICS
// ================================================

/**
 * Get article statistics
 */
export async function getArticleStats(): Promise<{
  total: number;
  bySource: Record<string, number>;
  avgScore: number;
  recentCount: number;
}> {
  const { data: allArticles } = await supabaseClient
    .from('articles')
    .select('source, quality_score, published_at');

  const total = allArticles?.length || 0;
  const bySource: Record<string, number> = {};
  let totalScore = 0;
  let recentCount = 0;

  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  allArticles?.forEach(article => {
    bySource[article.source] = (bySource[article.source] || 0) + 1;
    totalScore += article.quality_score || 0;

    if (new Date(article.published_at) > oneDayAgo) {
      recentCount++;
    }
  });

  return {
    total,
    bySource,
    avgScore: total > 0 ? totalScore / total : 0,
    recentCount,
  };
}

