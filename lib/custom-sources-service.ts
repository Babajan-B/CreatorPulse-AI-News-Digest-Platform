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

      const { data, error } = await supabase
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
    const { error } = await supabase
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
    const { error } = await supabase
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
          if (!this.youtubeService.isConfigured()) {
            return { valid: false, error: 'YouTube API not configured' };
          }
          const ytResult = await this.youtubeService.fetchChannelVideos(identifier, { maxResults: 1 });
          if (ytResult.error) {
            return { valid: false, error: ytResult.error };
          }
          const channelName = ytResult.videos[0]?.channelTitle;
          return { valid: true, suggested_name: channelName };

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
        await supabase
          .from('user_sources')
          .update({ last_fetched_at: new Date().toISOString(), fetch_error: null })
          .eq('id', source.id);
      } catch (error: any) {
        console.error(`Error fetching from source ${source.id}:`, error);
        
        // Update fetch_error
        await supabase
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
   * Fetch from YouTube
   */
  private async fetchFromYouTube(source: CustomSource): Promise<FetchedContent[]> {
    const result = await this.youtubeService.fetchChannelVideos(source.source_identifier, {
      maxResults: 10,
    });

    if (result.error) {
      throw new Error(result.error);
    }

    return result.videos.map((video) => ({
      title: video.title,
      content: video.description,
      url: video.url,
      source_type: 'youtube',
      source_name: source.source_name || video.channelTitle,
      author: video.channelTitle,
      published_at: new Date(video.publishedAt),
      image_url: video.thumbnailUrl,
      metadata: {
        video_id: video.id,
        view_count: video.viewCount || 0,
        like_count: video.likeCount || 0,
        duration: video.duration,
      },
    }));
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

