/**
 * YouTube Service
 * Fetches videos from YouTube channels
 * Uses YouTube Data API v3
 */

import { google, youtube_v3 } from 'googleapis';

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  url: string;
  thumbnailUrl?: string;
  duration?: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
}

export interface YouTubeFetchResult {
  videos: YouTubeVideo[];
  error?: string;
}

export class YouTubeService {
  private youtube: youtube_v3.Youtube | null = null;
  private apiKey: string | null = null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.YOUTUBE_API_KEY || null;
    
    if (this.apiKey) {
      this.youtube = google.youtube({
        version: 'v3',
        auth: this.apiKey,
      });
    }
  }

  /**
   * Check if YouTube service is configured
   */
  isConfigured(): boolean {
    return this.youtube !== null && this.apiKey !== null;
  }

  /**
   * Fetch recent videos from a channel by channel ID
   */
  async fetchChannelVideos(
    channelId: string,
    options: {
      maxResults?: number;
      publishedAfter?: Date;
    } = {}
  ): Promise<YouTubeFetchResult> {
    if (!this.youtube) {
      return {
        videos: [],
        error: 'YouTube API not configured. Please add YOUTUBE_API_KEY to environment variables.',
      };
    }

    try {
      const { maxResults = 10, publishedAfter } = options;

      // Search for videos from the channel
      const searchResponse = await this.youtube.search.list({
        part: ['snippet'],
        channelId: channelId,
        order: 'date',
        type: ['video'],
        maxResults: Math.min(maxResults, 50),
        publishedAfter: publishedAfter?.toISOString(),
      });

      if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
        return {
          videos: [],
        };
      }

      // Get video IDs
      const videoIds = searchResponse.data.items
        .map((item) => item.id?.videoId)
        .filter((id): id is string => id !== undefined);

      if (videoIds.length === 0) {
        return { videos: [] };
      }

      // Fetch video details (including statistics and duration)
      const videosResponse = await this.youtube.videos.list({
        part: ['snippet', 'contentDetails', 'statistics'],
        id: videoIds,
      });

      if (!videosResponse.data.items) {
        return { videos: [] };
      }

      const videos: YouTubeVideo[] = videosResponse.data.items.map((video) => ({
        id: video.id!,
        title: video.snippet?.title || 'Untitled',
        description: video.snippet?.description || '',
        channelId: video.snippet?.channelId || channelId,
        channelTitle: video.snippet?.channelTitle || 'Unknown Channel',
        publishedAt: video.snippet?.publishedAt || new Date().toISOString(),
        url: `https://www.youtube.com/watch?v=${video.id}`,
        thumbnailUrl: video.snippet?.thumbnails?.high?.url || video.snippet?.thumbnails?.default?.url,
        duration: video.contentDetails?.duration,
        viewCount: parseInt(video.statistics?.viewCount || '0'),
        likeCount: parseInt(video.statistics?.likeCount || '0'),
        commentCount: parseInt(video.statistics?.commentCount || '0'),
      }));

      return {
        videos,
      };
    } catch (error: any) {
      console.error('YouTube fetch error:', error);
      return {
        videos: [],
        error: error.message || 'Failed to fetch YouTube videos',
      };
    }
  }

  /**
   * Fetch recent videos from a channel by custom URL or username
   */
  async fetchChannelVideosByHandle(
    handle: string,
    options: {
      maxResults?: number;
      publishedAfter?: Date;
    } = {}
  ): Promise<YouTubeFetchResult> {
    if (!this.youtube) {
      return {
        videos: [],
        error: 'YouTube API not configured',
      };
    }

    try {
      // First, get channel ID from handle
      const channelResponse = await this.youtube.search.list({
        part: ['snippet'],
        q: handle,
        type: ['channel'],
        maxResults: 1,
      });

      if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
        return {
          videos: [],
          error: `Channel "${handle}" not found`,
        };
      }

      const channelId = channelResponse.data.items[0].id?.channelId;
      if (!channelId) {
        return {
          videos: [],
          error: 'Channel ID not found',
        };
      }

      // Now fetch videos from that channel
      return await this.fetchChannelVideos(channelId, options);
    } catch (error: any) {
      console.error('YouTube handle fetch error:', error);
      return {
        videos: [],
        error: error.message || 'Failed to fetch channel by handle',
      };
    }
  }

  /**
   * Fetch videos from multiple channels
   */
  async fetchMultipleChannels(
    channelIds: string[],
    options: { maxResultsPerChannel?: number } = {}
  ): Promise<{ channelId: string; result: YouTubeFetchResult }[]> {
    const results = await Promise.all(
      channelIds.map(async (channelId) => ({
        channelId,
        result: await this.fetchChannelVideos(channelId, {
          maxResults: options.maxResultsPerChannel || 5,
        }),
      }))
    );

    return results;
  }

  /**
   * Search videos by keyword
   */
  async searchVideos(
    query: string,
    options: {
      maxResults?: number;
      publishedAfter?: Date;
      relevanceLanguage?: string;
    } = {}
  ): Promise<YouTubeFetchResult> {
    if (!this.youtube) {
      return {
        videos: [],
        error: 'YouTube API not configured',
      };
    }

    try {
      const { maxResults = 10, publishedAfter, relevanceLanguage = 'en' } = options;

      const searchResponse = await this.youtube.search.list({
        part: ['snippet'],
        q: query,
        type: ['video'],
        maxResults: Math.min(maxResults, 50),
        publishedAfter: publishedAfter?.toISOString(),
        relevanceLanguage,
        order: 'relevance',
      });

      if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
        return {
          videos: [],
        };
      }

      const videoIds = searchResponse.data.items
        .map((item) => item.id?.videoId)
        .filter((id): id is string => id !== undefined);

      if (videoIds.length === 0) {
        return { videos: [] };
      }

      const videosResponse = await this.youtube.videos.list({
        part: ['snippet', 'contentDetails', 'statistics'],
        id: videoIds,
      });

      if (!videosResponse.data.items) {
        return { videos: [] };
      }

      const videos: YouTubeVideo[] = videosResponse.data.items.map((video) => ({
        id: video.id!,
        title: video.snippet?.title || 'Untitled',
        description: video.snippet?.description || '',
        channelId: video.snippet?.channelId || '',
        channelTitle: video.snippet?.channelTitle || 'Unknown Channel',
        publishedAt: video.snippet?.publishedAt || new Date().toISOString(),
        url: `https://www.youtube.com/watch?v=${video.id}`,
        thumbnailUrl: video.snippet?.thumbnails?.high?.url || video.snippet?.thumbnails?.default?.url,
        duration: video.contentDetails?.duration,
        viewCount: parseInt(video.statistics?.viewCount || '0'),
        likeCount: parseInt(video.statistics?.likeCount || '0'),
        commentCount: parseInt(video.statistics?.commentCount || '0'),
      }));

      return {
        videos,
      };
    } catch (error: any) {
      console.error('YouTube search error:', error);
      return {
        videos: [],
        error: error.message || 'Failed to search YouTube videos',
      };
    }
  }

  /**
   * Parse YouTube duration (ISO 8601 format) to minutes
   */
  static parseDuration(duration: string): number {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1]?.replace('H', '') || '0');
    const minutes = parseInt(match[2]?.replace('M', '') || '0');
    const seconds = parseInt(match[3]?.replace('S', '') || '0');

    return hours * 60 + minutes + seconds / 60;
  }

  /**
   * Convert YouTube video to article format for our system
   */
  static videoToArticle(video: YouTubeVideo) {
    const durationMinutes = video.duration ? YouTubeService.parseDuration(video.duration) : 0;

    return {
      title: video.title,
      content: video.description,
      url: video.url,
      source: 'youtube',
      source_name: video.channelTitle,
      author: video.channelTitle,
      published_at: new Date(video.publishedAt),
      image_url: video.thumbnailUrl,
      metadata: {
        video_id: video.id,
        channel_id: video.channelId,
        duration_minutes: durationMinutes,
        view_count: video.viewCount || 0,
        like_count: video.likeCount || 0,
        comment_count: video.commentCount || 0,
      },
    };
  }
}

// Singleton instance
let youtubeServiceInstance: YouTubeService | null = null;

export function getYouTubeService(): YouTubeService {
  if (!youtubeServiceInstance) {
    youtubeServiceInstance = new YouTubeService();
  }
  return youtubeServiceInstance;
}

export default YouTubeService;




