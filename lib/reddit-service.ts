// Reddit API Service
import { redditCache } from './reddit-cache';

export interface RedditPost {
  id: string;
  title: string;
  content: string;
  author: string;
  subreddit: string;
  url: string;
  permalink: string;
  score: number;
  upvote_ratio: number;
  num_comments: number;
  created_utc: number;
  thumbnail?: string;
  preview?: {
    images: Array<{
      source: {
        url: string;
        width: number;
        height: number;
      };
    }>;
  };
  selftext?: string;
  is_video: boolean;
  over_18: boolean;
  domain: string;
  link_flair_text?: string;
  trending_score?: number;
}

export interface RedditResponse {
  data: {
    children: Array<{
      data: RedditPost;
    }>;
    after?: string;
    before?: string;
  };
}

export class RedditService {
  private baseUrl = 'https://www.reddit.com';
  private userAgent = 'CreatorPulse/1.0 (AI News Aggregator)';
  
  // Fallback data when rate limited and no cache available
  private fallbackPosts: RedditPost[] = [
    {
      id: 'fallback-1',
      title: 'Discussion: Latest developments in AI and machine learning',
      content: 'Community discussion about recent AI breakthroughs',
      author: 'AutoModerator',
      subreddit: 'artificial',
      url: 'https://reddit.com/r/artificial',
      permalink: '/r/artificial',
      score: 100,
      upvote_ratio: 0.95,
      num_comments: 50,
      created_utc: Date.now() / 1000 - 3600,
      is_video: false,
      over_18: false,
      domain: 'reddit.com',
      trending_score: 150
    }
  ];

  /**
   * Fetch trending posts from a subreddit
   */
  async getTrendingPosts(subreddit: string, limit: number = 25): Promise<RedditPost[]> {
    try {
      // Check 12-hour cache first
      const cacheKey = `${subreddit}-${limit}`;
      const cached = redditCache.get(cacheKey);
      
      if (cached) {
        return cached; // Will only be returned if not expired (12 hours)
      }

      // Fetch from Reddit API
      console.log(`🔄 Fetching fresh Reddit data for r/${subreddit}...`);
      const url = `${this.baseUrl}/r/${subreddit}/hot.json?limit=${limit}&raw_json=1`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/json',
        },
        // Add timeout and ignore SSL issues for development
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status} ${response.statusText}`);
      }

      const data: RedditResponse = await response.json();
      const posts = data.data.children.map(child => child.data);

      // Calculate trending scores
      const processedPosts = posts.map(post => ({
        ...post,
        trending_score: this.calculateTrendingScore(post)
      }));

      // Cache for 12 hours
      redditCache.set(cacheKey, processedPosts);

      return processedPosts;

    } catch (error) {
      console.error(`Error fetching Reddit posts from r/${subreddit}:`, error);
      
      // Try to use any cached data, even if expired
      const cacheKey = `${subreddit}-${limit}`;
      const cachedData = redditCache.get(cacheKey);
      if (cachedData) {
        console.log(`⚠️  Using expired cache due to error for r/${subreddit}`);
        return cachedData;
      }
      
      // Return fallback data if no cache available
      console.log(`⚠️  No cache available, using fallback data for r/${subreddit}`);
      return this.fallbackPosts;
    }
  }

  /**
   * Fetch posts from multiple subreddits
   */
  async getMultipleSubredditPosts(subreddits: string[], limit: number = 10): Promise<RedditPost[]> {
    const promises = subreddits.map(subreddit => 
      this.getTrendingPosts(subreddit, limit)
    );

    try {
      const results = await Promise.all(promises);
      const allPosts = results.flat();
      
      // Sort by trending score and return top posts
      return allPosts
        .sort((a, b) => (b.trending_score || 0) - (a.trending_score || 0))
        .slice(0, 50); // Return top 50 posts across all subreddits
    } catch (error) {
      console.error('Error fetching multiple subreddit posts:', error);
      return [];
    }
  }

  /**
   * Search for posts across Reddit
   */
  async searchPosts(query: string, subreddit?: string, limit: number = 25): Promise<RedditPost[]> {
    try {
      const searchUrl = subreddit 
        ? `${this.baseUrl}/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&limit=${limit}&sort=relevance&raw_json=1`
        : `${this.baseUrl}/search.json?q=${encodeURIComponent(query)}&limit=${limit}&sort=relevance&raw_json=1`;

      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Reddit search error: ${response.status} ${response.statusText}`);
      }

      const data: RedditResponse = await response.json();
      const posts = data.data.children.map(child => child.data);

      return posts.map(post => ({
        ...post,
        trending_score: this.calculateTrendingScore(post)
      }));

    } catch (error) {
      console.error(`Error searching Reddit for "${query}":`, error);
      return [];
    }
  }

  /**
   * Calculate trending score based on engagement and recency
   */
  private calculateTrendingScore(post: RedditPost): number {
    const now = Date.now() / 1000;
    const age = now - post.created_utc;
    const ageHours = age / 3600;

    // Engagement score (upvotes, comments, upvote ratio)
    const engagementScore = 
      post.score * 1 +                    // Raw score
      post.num_comments * 2 +             // Comments are valuable
      (post.upvote_ratio * 100) * 0.5;    // Upvote ratio bonus

    // Recency penalty (newer posts score higher)
    const recencyScore = Math.max(0, 1 - (ageHours / 24)); // 24-hour decay

    // Trending score
    return engagementScore * (1 + recencyScore);
  }

  /**
   * Get post content with proper formatting
   */
  getPostContent(post: RedditPost): string {
    if (post.selftext && post.selftext.trim()) {
      return post.selftext;
    }
    return post.title;
  }

  /**
   * Get post image URL
   */
  getPostImage(post: RedditPost): string | null {
    // Check for preview images
    if (post.preview?.images?.[0]?.source?.url) {
      return post.preview.images[0].source.url.replace(/&amp;/g, '&');
    }

    // Check for thumbnail (if not default)
    if (post.thumbnail && 
        post.thumbnail !== 'default' && 
        post.thumbnail !== 'self' && 
        post.thumbnail !== 'nsfw') {
      return post.thumbnail;
    }

    return null;
  }

  /**
   * Format post for display
   */
  formatPostForDisplay(post: RedditPost) {
    return {
      id: post.id,
      title: post.title,
      content: this.getPostContent(post),
      author: post.author,
      source: `r/${post.subreddit}`,
      url: `https://reddit.com${post.permalink}`,
      score: post.score,
      comments: post.num_comments,
      upvote_ratio: Math.round(post.upvote_ratio * 100),
      created_at: new Date(post.created_utc * 1000),
      image: this.getPostImage(post),
      trending_score: post.trending_score,
      platform: 'reddit',
      category: this.getCategoryFromSubreddit(post.subreddit),
      trending_reason: `${post.score} upvotes, ${post.num_comments} comments`
    };
  }

  /**
   * Get category from subreddit name
   */
  private getCategoryFromSubreddit(subreddit: string): string {
    const categoryMap: { [key: string]: string } = {
      'artificial': 'AI General',
      'MachineLearning': 'AI Research',
      'deeplearning': 'AI Research',
      'OpenAI': 'AI Companies',
      'ChatGPT': 'AI Applications',
      'LocalLLaMA': 'AI Models',
      'singularity': 'AI Future',
      'agi': 'AI Future'
    };

    return categoryMap[subreddit] || 'AI Discussion';
  }

  /**
   * Test Reddit API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const testPost = await this.getTrendingPosts('artificial', 1);
      return testPost.length > 0;
    } catch (error) {
      console.error('Reddit API test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const redditService = new RedditService();
