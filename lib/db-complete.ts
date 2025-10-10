/**
 * Complete Database Operations for CreatorPulse
 * Using the comprehensive schema with all features
 */

import { supabase as supabaseClient } from './supabase';

// ================================================
// FEED ITEMS OPERATIONS
// ================================================

export interface FeedItem {
  id: string;
  title: string;
  summary: string;
  content?: string;
  url: string;
  source_name: string;
  source_url: string;
  source_type: string;
  source_logo?: string;
  author?: string;
  published_at: string;
  image_url?: string;
  tags?: string[];
  categories?: string[];
}

/**
 * Save feed items (RSS articles) to database
 */
export async function saveFeedItems(items: FeedItem[]) {
  try {
    const { data, error } = await supabaseClient
      .from('feed_items')
      .upsert(items, { onConflict: 'url' })
      .select();

    if (error) throw error;

    console.log(`💾 Saved ${data?.length || 0} feed items to Supabase`);
    return { success: true, count: data?.length || 0 };
  } catch (error: any) {
    console.error('Error saving feed items:', error.message);
    return { success: false, count: 0, error: error.message };
  }
}

/**
 * Get recent feed items
 */
export async function getRecentFeedItems(days: number = 7, limit: number = 50) {
  try {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const { data, error } = await supabaseClient
      .from('feed_items')
      .select('*')
      .gte('published_at', sinceDate.toISOString())
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { success: true, items: data || [] };
  } catch (error: any) {
    console.error('Error getting feed items:', error.message);
    return { success: false, items: [], error: error.message };
  }
}

// ================================================
// ITEM SCORES OPERATIONS
// ================================================

export interface ItemScore {
  feed_item_id: string;
  score_date?: string;
  relevance_score: number;
  recency_score: number;
  source_reliability_score: number;
  engagement_score: number;
  final_score: number;
}

/**
 * Save item scores for the day
 */
export async function saveItemScores(scores: ItemScore[]) {
  try {
    const { data, error } = await supabaseClient
      .from('item_scores')
      .upsert(scores, { onConflict: 'feed_item_id,score_date' })
      .select();

    if (error) throw error;

    return { success: true, count: data?.length || 0 };
  } catch (error: any) {
    console.error('Error saving scores:', error.message);
    return { success: false, count: 0, error: error.message };
  }
}

/**
 * Get scored items for today
 */
export async function getTodayScoredItems(minScore: number = 0.5, limit: number = 50) {
  try {
    const { data, error } = await supabaseClient
      .from('item_scores')
      .select(`
        *,
        feed_items:feed_item_id (*)
      `)
      .eq('score_date', new Date().toISOString().split('T')[0])
      .gte('final_score', minScore)
      .order('final_score', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { success: true, items: data || [] };
  } catch (error: any) {
    return { success: false, items: [], error: error.message };
  }
}

// ================================================
// DIGEST OPERATIONS
// ================================================

export interface Digest {
  id?: string;
  user_id: string;
  title: string;
  description?: string;
  digest_date?: string;
  status?: string;
  summary?: string;
  image_url?: string;
  total_items?: number;
  avg_quality_score?: number;
}

/**
 * Create or get today's digest for user
 */
export async function getTodaysDigest(userId: string) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Try to get existing digest
    const { data: existing, error: fetchError } = await supabaseClient
      .from('digests')
      .select('*')
      .eq('user_id', userId)
      .eq('digest_date', today)
      .single();

    if (existing) {
      return { success: true, digest: existing, isNew: false };
    }

    // Create new digest
    const digestTitle = `AI News Digest - ${new Date().toLocaleDateString()}`;
    
    const { data: newDigest, error: createError } = await supabaseClient
      .from('digests')
      .insert({
        user_id: userId,
        title: digestTitle,
        digest_date: today,
        status: 'draft',
      })
      .select()
      .single();

    if (createError) throw createError;

    return { success: true, digest: newDigest, isNew: true };
  } catch (error: any) {
    console.error('Error with digest:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Add items to digest
 */
export async function addItemsToDigest(digestId: string, itemIds: string[]) {
  try {
    const digestItems = itemIds.map((itemId, index) => ({
      digest_id: digestId,
      feed_item_id: itemId,
      position: index + 1,
    }));

    const { data, error } = await supabaseClient
      .from('digest_items')
      .upsert(digestItems)
      .select();

    if (error) throw error;

    // Update digest total_items count
    await supabaseClient
      .from('digests')
      .update({ total_items: itemIds.length })
      .eq('id', digestId);

    return { success: true, count: data?.length || 0 };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get digest with all items
 */
export async function getDigestWithItems(digestId: string) {
  try {
    const { data: digest, error: digestError } = await supabaseClient
      .from('digests')
      .select(`
        *,
        user:users(*),
        items:digest_items(
          *,
          feed_item:feed_items(*)
        )
      `)
      .eq('id', digestId)
      .single();

    if (digestError) throw digestError;

    return { success: true, digest };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Update digest status
 */
export async function updateDigestStatus(
  digestId: string,
  status: string,
  updates?: {
    emailSent?: boolean;
    linkedinPosted?: boolean;
    deliveredAt?: string;
  }
) {
  try {
    const updateData: any = { status };

    if (status === 'generated') {
      updateData.generated_at = new Date().toISOString();
    }

    if (updates?.emailSent) {
      updateData.email_sent = true;
      updateData.email_sent_at = new Date().toISOString();
    }

    if (updates?.linkedinPosted) {
      updateData.linkedin_posted = true;
      updateData.linkedin_posted_at = new Date().toISOString();
    }

    if (updates?.deliveredAt) {
      updateData.delivered_at = updates.deliveredAt;
    }

    if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    }

    const { error } = await supabaseClient
      .from('digests')
      .update(updateData)
      .eq('id', digestId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ================================================
// USER INTERACTIONS
// ================================================

/**
 * Bookmark an article
 */
export async function bookmarkArticle(userId: string, feedItemId: string) {
  try {
    const { error } = await supabaseClient
      .from('user_interactions')
      .upsert({
        user_id: userId,
        feed_item_id: feedItemId,
        bookmarked: true,
        bookmarked_at: new Date().toISOString(),
      }, { onConflict: 'user_id,feed_item_id' });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Mark article as read
 */
export async function markAsRead(userId: string, feedItemId: string) {
  try {
    const { error } = await supabaseClient
      .from('user_interactions')
      .upsert({
        user_id: userId,
        feed_item_id: feedItemId,
        read: true,
        read_at: new Date().toISOString(),
      }, { onConflict: 'user_id,feed_item_id' });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Track article share
 */
export async function trackShare(userId: string, feedItemId: string, platform: string) {
  try {
    const { error } = await supabaseClient
      .from('user_interactions')
      .upsert({
        user_id: userId,
        feed_item_id: feedItemId,
        shared: true,
        shared_at: new Date().toISOString(),
        share_platform: platform,
      }, { onConflict: 'user_id,feed_item_id' });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get user's bookmarked articles
 */
export async function getUserBookmarks(userId: string) {
  try {
    const { data, error } = await supabaseClient
      .from('user_interactions')
      .select(`
        *,
        feed_item:feed_items(*)
      `)
      .eq('user_id', userId)
      .eq('bookmarked', true)
      .order('bookmarked_at', { ascending: false });

    if (error) throw error;

    return { success: true, bookmarks: data || [] };
  } catch (error: any) {
    return { success: false, bookmarks: [], error: error.message };
  }
}

// ================================================
// ANALYTICS
// ================================================

/**
 * Get dashboard statistics
 */
export async function getDashboardStats() {
  try {
    const { data, error } = await supabaseClient
      .from('daily_analytics')
      .select('*')
      .order('analytics_date', { ascending: false })
      .limit(7);

    if (error) throw error;

    return { success: true, analytics: data || [] };
  } catch (error: any) {
    return { success: false, analytics: [], error: error.message };
  }
}

export { supabaseClient };

