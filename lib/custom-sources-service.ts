/**
 * Custom Sources Service
 * Unified service for managing and fetching content from custom sources
 * (Twitter, YouTube, RSS, Newsletter)
 */

import { TwitterService, getTwitterService } from './twitter-service';
import { YouTubeService, getYouTubeService } from './youtube-service';
import Parser from 'rss-parser';
import { supabaseAdmin } from './supabase';

export interface CustomSource {
  id: string;
  user_id: string;
  source_type: 'twitter' | 'youtube' | 'rss' | 'newsletter';
  source_identifier: string; // Twitter handle, YouTube channel ID, RSS URL
  source_name?: string;
  priority_weight: number; // 1-10
  enabled: boolean;
  metadata?: any;
  last_fetched_at?: string;
  fetch_error?: string;
  created_at: string;
  updated_at: string;
}

export interface FetchedContent {
  title: string;
  content: string;
  url: string;
  source_type: string;
  source_name: string;
  author?: string;
  published_at: Date;
  image_url?: string;
  metadata?: any;
}

export class CustomSourcesService {
  private twitterService: TwitterService;
  private youtubeService: YouTubeService;
  private rssParser: Parser;

  constructor() {
    this.twitterService = getTwitterService();
    this.youtubeService = getYouTubeService();
    this.rssParser = new Parser({
      timeout: 10000,
      headers: {
        'User-Agent': 'CreatorPulse/1.0',
      },
    });
  }

  /**
   * Get all custom sources for a user
   */
  async getUserSources(userId: string): Promise<CustomSource[]> {
    const { data, error } = await supabaseAdmin
      .from('user_sources')
      .select('*')
      .eq('user_id', userId)
      .order('priority_weight', { ascending: false });

    if (error) {
      console.error('Error fetching user sources:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get active custom sources for a user
   */
  async getActiveSources(userId: string): Promise<CustomSource[]> {
    const { data, error } = await supabaseAdmin
      .from('user_sources')
      .select('*')
      .eq('user_id', userId)
      .eq('enabled', true)
      .order('priority_weight', { ascending: false });

    if (error) {
      console.error('Error fetching active sources:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Add a new custom source
   */
  async addSource(userId: string, source: {
    source_type: 'twitter' | 'youtube' | 'rss' | 'newsletter';
    source_identifier: string;
    source_name?: string;
    priority_weight?: number;
  }): Promise<{ success: boolean; source?: CustomSource; error?: string }> {
    try {
      // Validate the source before adding
      const validation = await this.validateSource(source.source_type, source.source_identifier);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      const { data, error } = await supabaseAdmin
        .from('user_sources')
        .insert({
          user_id: userId,
          source_type: source.source_type,
          source_identifier: source.source_identifier,
          source_name: source.source_name || validation.suggested_name,
          priority_weight: source.priority_weight || 5,
          enabled: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding source:', error);
        return { success: false, error: error.message };
      }

      return { success: true, source: data };
    } catch (error: any) {
      console.error('Error in addSource:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a source
   */
  async updateSource(
    sourceId: string,
    updates: Partial<Pick<CustomSource, 'source_name' | 'priority_weight' | 'enabled'>>
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabaseAdmin
      .from('user_sources')
      .update(updates)
      .eq('id', sourceId);

    if (error) {
      console.error('Error updating source:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  /**
   * Delete a source
   */
  async deleteSource(sourceId: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabaseAdmin
      .from('user_sources')
      .delete()
      .eq('id', sourceId);

    if (error) {
      console.error('Error deleting source:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  /**
   * Validate a source before adding
   */
  async validateSource(
    sourceType: string,
    identifier: string
  ): Promise<{ valid: boolean; error?: string; suggested_name?: string }> {
    try {
      switch (sourceType) {
        case 'twitter':
          if (!this.twitterService.isConfigured()) {
            return { valid: false, error: 'Twitter API not configured' };
          }
          // Remove @ if present
          const username = identifier.replace('@', '');
          const result = await this.twitterService.fetchUserTweets(username, { maxResults: 1 });
          if (result.error) {
            return { valid: false, error: result.error };
          }
          return { valid: true, suggested_name: `@${username}` };

        case 'youtube':
          // YouTube now works via RSS - no API needed!
          // Accept channel ID (UC...), channel handle (@username), or channel name
          let channelId = identifier;
          
          // Extract channel ID from various formats
          if (identifier.includes('youtube.com/channel/')) {
            channelId = identifier.split('youtube.com/channel/')[1].split('/')[0].split('?')[0];
          } else if (identifier.includes('youtube.com/@')) {
            // For @handles, we'll use the handle directly
            channelId = identifier.split('youtube.com/@')[1].split('/')[0].split('?')[0];
          } else if (identifier.startsWith('@')) {
            // Already a handle
            channelId = identifier;
          }
          
          // Validate it's not empty
          if (!channelId || channelId.trim() === '') {
            return { valid: false, error: 'Please provide a valid YouTube channel' };
          }
          
          return { valid: true, suggested_name: channelId };

        case 'rss':
          try {
            const feed = await this.rssParser.parseURL(identifier);
            return { valid: true, suggested_name: feed.title };
          } catch (error: any) {
            return { valid: false, error: 'Invalid RSS feed URL' };
          }

        case 'newsletter':
          // For newsletters, just validate it's a URL
          try {
            new URL(identifier);
            return { valid: true };
          } catch {
            return { valid: false, error: 'Invalid newsletter URL' };
          }

        default:
          return { valid: false, error: 'Invalid source type' };
      }
    } catch (error: any) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Fetch content from all active sources for a user
   */
  async fetchAllContent(userId: string): Promise<FetchedContent[]> {
    const sources = await this.getActiveSources(userId);
    const allContent: FetchedContent[] = [];

    for (const source of sources) {
      try {
        const content = await this.fetchFromSource(source);
        allContent.push(...content);

        // Update last_fetched_at
        await supabaseAdmin
          .from('user_sources')
          .update({ last_fetched_at: new Date().toISOString(), fetch_error: null })
          .eq('id', source.id);
      } catch (error: any) {
        console.error(`Error fetching from source ${source.id}:`, error);
        
        // Update fetch_error
        await supabaseAdmin
          .from('user_sources')
          .update({ fetch_error: error.message })
          .eq('id', source.id);
      }
    }

    // Sort by priority weight and published date
    return allContent.sort((a, b) => {
      return b.published_at.getTime() - a.published_at.getTime();
    });
  }

  /**
   * Fetch content from a single source
   */
  async fetchFromSource(source: CustomSource): Promise<FetchedContent[]> {
    switch (source.source_type) {
      case 'twitter':
        return await this.fetchFromTwitter(source);
      
      case 'youtube':
        return await this.fetchFromYouTube(source);
      
      case 'rss':
      case 'newsletter':
        return await this.fetchFromRSS(source);
      
      default:
        return [];
    }
  }

  /**
   * Fetch from Twitter
   */
  private async fetchFromTwitter(source: CustomSource): Promise<FetchedContent[]> {
    const username = source.source_identifier.replace('@', '');
    const result = await this.twitterService.fetchUserTweets(username, { maxResults: 10 });

    if (result.error) {
      throw new Error(result.error);
    }

    return result.tweets.map((tweet) => ({
      title: `Tweet by @${tweet.authorUsername}`,
      content: tweet.text,
      url: tweet.url,
      source_type: 'twitter',
      source_name: source.source_name || `@${tweet.authorUsername}`,
      author: tweet.authorName,
      published_at: new Date(tweet.createdAt),
      metadata: {
        likes: tweet.metrics?.likes || 0,
        retweets: tweet.metrics?.retweets || 0,
        tweet_id: tweet.id,
      },
    }));
  }

  /**
   * Fetch from YouTube via RSS (no API key needed!)
   */
  private async fetchFromYouTube(source: CustomSource): Promise<FetchedContent[]> {
    try {
      let channelId = source.source_identifier;
      let rssUrl: string;
      
      // Extract handle from full YouTube URL if present
      console.log(`🔍 Processing YouTube identifier: ${channelId}`);
      if (channelId.includes('youtube.com/@')) {
        const match = channelId.match(/youtube\.com\/@([^\/\?]+)/);
        if (match && match[1]) {
          channelId = `@${match[1]}`;
          console.log(`✅ Extracted handle: ${channelId}`);
        }
      } else if (channelId.includes('youtube.com/channel/')) {
        const match = channelId.match(/youtube\.com\/channel\/([^\/\?]+)/);
        if (match && match[1]) {
          channelId = match[1];
          console.log(`✅ Extracted channel ID: ${channelId}`);
        }
      }
      
      // Build RSS URL based on identifier format
      if (channelId.startsWith('UC')) {
        // Channel ID format
        rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
        console.log(`📺 Using channel ID format: ${rssUrl}`);
      } else if (channelId.startsWith('@') || !channelId.includes('/')) {
        // Handle or username format - need to fetch channel page to get ID
        const handle = channelId.startsWith('@') ? channelId : `@${channelId}`;
        console.log(`🔍 Processing handle: ${handle}`);
        
        // Try to fetch the channel page to extract channel ID
        try {
          const channelUrl = `https://www.youtube.com/${handle}`;
          console.log(`🌐 Fetching channel page: ${channelUrl}`);
          const response = await fetch(channelUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
          });
          const html = await response.text();
          
          // Extract channel ID from page
          const match = html.match(/"channelId":"(UC[^"]+)"/);
          if (match && match[1]) {
            channelId = match[1];
            rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
            console.log(`✅ Found channel ID: ${channelId}, RSS URL: ${rssUrl}`);
          } else {
            console.log(`❌ Could not find channel ID in page HTML`);
            throw new Error('Could not find channel ID');
          }
        } catch (error) {
          console.log(`❌ Error fetching channel page: ${error}`);
          throw new Error(`Could not fetch channel ${handle}. Please use Channel ID (UC...) instead.`);
        }
      } else {
        throw new Error('Invalid YouTube identifier. Use Channel ID (UC...) or handle (@username)');
      }

      // Fetch RSS feed
      const feed = await this.rssParser.parseURL(rssUrl);
      
      return (feed.items || []).slice(0, 10).map((item) => {
        // Extract video ID from link
        const videoId = item.link?.includes('watch?v=') 
          ? item.link.split('watch?v=')[1].split('&')[0]
          : '';
        
        return {
          title: item.title || 'Untitled Video',
          content: item.contentSnippet || item.content || item.description || '',
          url: item.link || '',
          source_type: 'youtube',
          source_name: source.source_name || feed.title || 'YouTube Channel',
          author: item.creator || feed.title || 'YouTube Creator',
          published_at: item.pubDate ? new Date(item.pubDate) : new Date(),
          image_url: item['media:group']?.['media:thumbnail']?.[0]?.['$']?.url || 
                     `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          metadata: {
            video_id: videoId,
            channel_name: feed.title,
          },
        };
      });
    } catch (error: any) {
      throw new Error(`Failed to fetch YouTube channel: ${error.message}`);
    }
  }

  /**
   * Fetch from RSS feed
   */
  private async fetchFromRSS(source: CustomSource): Promise<FetchedContent[]> {
    try {
      const feed = await this.rssParser.parseURL(source.source_identifier);

      return (feed.items || []).slice(0, 10).map((item) => ({
        title: item.title || 'Untitled',
        content: item.contentSnippet || item.content || item.description || '',
        url: item.link || '',
        source_type: source.source_type,
        source_name: source.source_name || feed.title || 'RSS Feed',
        author: item.creator || feed.title,
        published_at: item.pubDate ? new Date(item.pubDate) : new Date(),
        metadata: {
          guid: item.guid,
          categories: item.categories,
        },
      }));
    } catch (error: any) {
      throw new Error(`Failed to fetch RSS feed: ${error.message}`);
    }
  }

  /**
   * Get source statistics
   */
  async getSourceStats(userId: string): Promise<{
    total: number;
    active: number;
    by_type: Record<string, number>;
  }> {
    const sources = await this.getUserSources(userId);
    
    const stats = {
      total: sources.length,
      active: sources.filter((s) => s.enabled).length,
      by_type: {
        twitter: 0,
        youtube: 0,
        rss: 0,
        newsletter: 0,
      },
    };

    sources.forEach((source) => {
      stats.by_type[source.source_type]++;
    });

    return stats;
  }
}

// Singleton instance
let customSourcesServiceInstance: CustomSourcesService | null = null;

export function getCustomSourcesService(): CustomSourcesService {
  if (!customSourcesServiceInstance) {
    customSourcesServiceInstance = new CustomSourcesService();
  }
  return customSourcesServiceInstance;
}

export default CustomSourcesService;

