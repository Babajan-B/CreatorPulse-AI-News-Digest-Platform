// Unified Social Media Service
import { redditService, RedditPost } from './reddit-service';
import { rssSocialService, RSSPost } from './rss-social-service';
import { 
  REDDIT_SOURCES, 
  HACKERNEWS_SOURCES, 
  LOBSTERS_SOURCES, 
  SLASHDOT_SOURCES, 
  PRODUCTHUNT_SOURCES,
  getActiveSources 
} from './social-sources';

export interface SocialMediaPost {
  id: string;
  title: string;
  content: string;
  author: string;
  source: string;
  url: string;
  score: number;
  comments: number;
  shares?: number;
  engagement_rate?: number;
  created_at: Date;
  image?: string;
  trending_score: number;
  platform: 'reddit' | 'hackernews' | 'lobsters' | 'slashdot' | 'producthunt';
  category: string;
  trending_reason: string;
  hashtags?: string[];
  mentions?: string[];
}

export interface TrendingContent {
  reddit: SocialMediaPost[];
  hackernews: SocialMediaPost[];
  lobsters: SocialMediaPost[];
  slashdot: SocialMediaPost[];
  producthunt: SocialMediaPost[];
  combined: SocialMediaPost[];
  total_count: number;
  last_updated: Date;
}

export class SocialMediaService {
  private redditService = redditService;
  private rssSocialService = rssSocialService;

  /**
   * Get trending content from all social media platforms
   */
  async getTrendingContent(limit: number = 50): Promise<TrendingContent> {
    try {
      console.log('🔄 Fetching trending content from social media platforms...');

      // Fetch from all platforms in parallel
      const [redditPosts, hackernewsPosts, lobstersPosts, slashdotPosts, producthuntPosts] = await Promise.all([
        this.getRedditTrending(limit / 5),
        this.getHackerNewsTrending(limit / 5),
        this.getLobstersTrending(limit / 5),
        this.getSlashdotTrending(limit / 5),
        this.getProductHuntTrending(limit / 5)
      ]);

      console.log(`📱 Fetched ${redditPosts.length} Reddit posts`);
      console.log(`🟠 Fetched ${hackernewsPosts.length} Hacker News posts`);
      console.log(`🦞 Fetched ${lobstersPosts.length} Lobsters posts`);
      console.log(`⚡ Fetched ${slashdotPosts.length} Slashdot posts`);
      console.log(`🚀 Fetched ${producthuntPosts.length} Product Hunt posts`);

      // Combine and sort by trending score
      const combined = [
        ...redditPosts,
        ...hackernewsPosts,
        ...lobstersPosts,
        ...slashdotPosts,
        ...producthuntPosts
      ]
        .sort((a, b) => b.trending_score - a.trending_score)
        .slice(0, limit);

      console.log(`🎯 Total trending content: ${combined.length} posts`);

      return {
        reddit: redditPosts,
        hackernews: hackernewsPosts,
        lobsters: lobstersPosts,
        slashdot: slashdotPosts,
        producthunt: producthuntPosts,
        combined,
        total_count: combined.length,
        last_updated: new Date()
      };

    } catch (error) {
      console.error('Error fetching trending content:', error);
      return {
        reddit: [],
        hackernews: [],
        lobsters: [],
        slashdot: [],
        producthunt: [],
        combined: [],
        total_count: 0,
        last_updated: new Date()
      };
    }
  }

  /**
   * Get trending Reddit posts
   */
  async getRedditTrending(limit: number = 25): Promise<SocialMediaPost[]> {
    try {
      const activeRedditSources = REDDIT_SOURCES.filter(source => source.active);
      const subreddits = activeRedditSources.map(source => 
        source.name.replace('r/', '')
      );

      console.log(`🔍 Fetching from Reddit subreddits: ${subreddits.join(', ')}`);

      const posts = await this.redditService.getMultipleSubredditPosts(subreddits, 10);
      
      return posts.map(post => this.redditService.formatPostForDisplay(post));
    } catch (error) {
      console.error('Error fetching Reddit trending:', error);
      return [];
    }
  }

  /**
   * Get trending Hacker News posts
   */
  async getHackerNewsTrending(limit: number = 25): Promise<SocialMediaPost[]> {
    try {
      const feeds = HACKERNEWS_SOURCES
        .filter(source => source.active && source.rss_url)
        .map(source => ({
          url: source.rss_url!,
          platform: source.platform,
          source: source.name,
          category: source.category
        }));

      const posts = await this.rssSocialService.fetchMultipleFeeds(feeds);
      return posts.slice(0, limit).map(post => this.rssSocialService.formatPostForDisplay(post));
    } catch (error) {
      console.error('Error fetching Hacker News trending:', error);
      return [];
    }
  }

  /**
   * Get trending Lobsters posts
   */
  async getLobstersTrending(limit: number = 25): Promise<SocialMediaPost[]> {
    try {
      const feeds = LOBSTERS_SOURCES
        .filter(source => source.active && source.rss_url)
        .map(source => ({
          url: source.rss_url!,
          platform: source.platform,
          source: source.name,
          category: source.category
        }));

      const posts = await this.rssSocialService.fetchMultipleFeeds(feeds);
      return posts.slice(0, limit).map(post => this.rssSocialService.formatPostForDisplay(post));
    } catch (error) {
      console.error('Error fetching Lobsters trending:', error);
      return [];
    }
  }

  /**
   * Get trending Slashdot posts
   */
  async getSlashdotTrending(limit: number = 25): Promise<SocialMediaPost[]> {
    try {
      const feeds = SLASHDOT_SOURCES
        .filter(source => source.active && source.rss_url)
        .map(source => ({
          url: source.rss_url!,
          platform: source.platform,
          source: source.name,
          category: source.category
        }));

      const posts = await this.rssSocialService.fetchMultipleFeeds(feeds);
      return posts.slice(0, limit).map(post => this.rssSocialService.formatPostForDisplay(post));
    } catch (error) {
      console.error('Error fetching Slashdot trending:', error);
      return [];
    }
  }

  /**
   * Get trending Product Hunt posts
   */
  async getProductHuntTrending(limit: number = 25): Promise<SocialMediaPost[]> {
    try {
      const feeds = PRODUCTHUNT_SOURCES
        .filter(source => source.active && source.rss_url)
        .map(source => ({
          url: source.rss_url!,
          platform: source.platform,
          source: source.name,
          category: source.category
        }));

      const posts = await this.rssSocialService.fetchMultipleFeeds(feeds);
      return posts.slice(0, limit).map(post => this.rssSocialService.formatPostForDisplay(post));
    } catch (error) {
      console.error('Error fetching Product Hunt trending:', error);
      return [];
    }
  }

  /**
   * Get posts by category
   */
  async getPostsByCategory(category: string, limit: number = 25): Promise<SocialMediaPost[]> {
    try {
      const trendingContent = await this.getTrendingContent(limit * 2);
      
      return trendingContent.combined
        .filter(post => post.category.toLowerCase().includes(category.toLowerCase()))
        .slice(0, limit);
    } catch (error) {
      console.error(`Error fetching posts for category ${category}:`, error);
      return [];
    }
  }

  /**
   * Get posts by platform
   */
  async getPostsByPlatform(platform: 'reddit' | 'hackernews' | 'lobsters' | 'slashdot' | 'producthunt', limit: number = 25): Promise<SocialMediaPost[]> {
    try {
      switch (platform) {
        case 'reddit':
          return await this.getRedditTrending(limit);
        case 'hackernews':
          return await this.getHackerNewsTrending(limit);
        case 'lobsters':
          return await this.getLobstersTrending(limit);
        case 'slashdot':
          return await this.getSlashdotTrending(limit);
        case 'producthunt':
          return await this.getProductHuntTrending(limit);
        default:
          return [];
      }
    } catch (error) {
      console.error(`Error fetching posts for platform ${platform}:`, error);
      return [];
    }
  }

  /**
   * Search across all social media platforms
   */
  async searchPosts(query: string, limit: number = 25): Promise<SocialMediaPost[]> {
    try {
      console.log(`🔍 Searching for "${query}" across social media...`);

      // Search Reddit
      const redditResults = await this.redditService.searchPosts(query, undefined, limit);
      const redditPosts = redditResults.map(post => this.redditService.formatPostForDisplay(post));

      // Get all RSS posts and filter by query
      const [hnPosts, lobstersPosts, slashdotPosts, phPosts] = await Promise.all([
        this.getHackerNewsTrending(limit),
        this.getLobstersTrending(limit),
        this.getSlashdotTrending(limit),
        this.getProductHuntTrending(limit)
      ]);

      const rssPosts = [...hnPosts, ...lobstersPosts, ...slashdotPosts, ...phPosts]
        .filter(post => 
          post.content.toLowerCase().includes(query.toLowerCase()) ||
          post.title.toLowerCase().includes(query.toLowerCase())
        );

      // Combine and sort
      const combined = [...redditPosts, ...rssPosts]
        .sort((a, b) => b.trending_score - a.trending_score)
        .slice(0, limit);

      console.log(`🎯 Search results: ${combined.length} posts`);

      return combined;
    } catch (error) {
      console.error(`Error searching for "${query}":`, error);
      return [];
    }
  }

  /**
   * Get platform statistics
   */
  async getPlatformStats(): Promise<{
    reddit: { active_sources: number; total_posts: number };
    hackernews: { active_sources: number; total_posts: number };
    lobsters: { active_sources: number; total_posts: number };
    slashdot: { active_sources: number; total_posts: number };
    producthunt: { active_sources: number; total_posts: number };
    combined: { total_sources: number; total_posts: number };
  }> {
    try {
      const trendingContent = await this.getTrendingContent(100);
      
      return {
        reddit: {
          active_sources: REDDIT_SOURCES.filter(source => source.active).length,
          total_posts: trendingContent.reddit.length
        },
        hackernews: {
          active_sources: HACKERNEWS_SOURCES.filter(source => source.active).length,
          total_posts: trendingContent.hackernews.length
        },
        lobsters: {
          active_sources: LOBSTERS_SOURCES.filter(source => source.active).length,
          total_posts: trendingContent.lobsters.length
        },
        slashdot: {
          active_sources: SLASHDOT_SOURCES.filter(source => source.active).length,
          total_posts: trendingContent.slashdot.length
        },
        producthunt: {
          active_sources: PRODUCTHUNT_SOURCES.filter(source => source.active).length,
          total_posts: trendingContent.producthunt.length
        },
        combined: {
          total_sources: getActiveSources().length,
          total_posts: trendingContent.total_count
        }
      };
    } catch (error) {
      console.error('Error getting platform stats:', error);
      return {
        reddit: { active_sources: 0, total_posts: 0 },
        hackernews: { active_sources: 0, total_posts: 0 },
        lobsters: { active_sources: 0, total_posts: 0 },
        slashdot: { active_sources: 0, total_posts: 0 },
        producthunt: { active_sources: 0, total_posts: 0 },
        combined: { total_sources: 0, total_posts: 0 }
      };
    }
  }

  /**
   * Test all platform connections
   */
  async testConnections(): Promise<{
    reddit: boolean;
    hackernews: boolean;
    lobsters: boolean;
    slashdot: boolean;
    producthunt: boolean;
    overall: boolean;
  }> {
    try {
      console.log('🧪 Testing social media platform connections...');

      // Test Reddit
      const redditTest = await this.redditService.testConnection();
      console.log(`📱 Reddit connection: ${redditTest ? '✅' : '❌'}`);

      // Test RSS-based platforms by trying to fetch a post
      const hnTest = (await this.getHackerNewsTrending(1)).length > 0;
      console.log(`🟠 Hacker News connection: ${hnTest ? '✅' : '❌'}`);

      const lobstersTest = (await this.getLobstersTrending(1)).length > 0;
      console.log(`🦞 Lobsters connection: ${lobstersTest ? '✅' : '❌'}`);

      const slashdotTest = (await this.getSlashdotTrending(1)).length > 0;
      console.log(`⚡ Slashdot connection: ${slashdotTest ? '✅' : '❌'}`);

      const phTest = (await this.getProductHuntTrending(1)).length > 0;
      console.log(`🚀 Product Hunt connection: ${phTest ? '✅' : '❌'}`);

      const overall = redditTest && hnTest && lobstersTest && slashdotTest && phTest;
      console.log(`🎯 Overall connection status: ${overall ? '✅' : '❌'}`);

      return {
        reddit: redditTest,
        hackernews: hnTest,
        lobsters: lobstersTest,
        slashdot: slashdotTest,
        producthunt: phTest,
        overall
      };
    } catch (error) {
      console.error('Error testing connections:', error);
      return {
        reddit: false,
        hackernews: false,
        lobsters: false,
        slashdot: false,
        producthunt: false,
        overall: false
      };
    }
  }

  /**
   * Get trending hashtags across platforms
   */
  async getTrendingHashtags(limit: number = 20): Promise<Array<{
    hashtag: string;
    count: number;
    platforms: string[];
  }>> {
    try {
      const trendingContent = await this.getTrendingContent(100);
      const hashtagCounts: { [key: string]: { count: number; platforms: Set<string> } } = {};

      // Count hashtags from all posts
      trendingContent.combined.forEach(post => {
        if (post.hashtags) {
          post.hashtags.forEach(hashtag => {
            const normalized = hashtag.toLowerCase().replace('#', '');
            if (!hashtagCounts[normalized]) {
              hashtagCounts[normalized] = { count: 0, platforms: new Set() };
            }
            hashtagCounts[normalized].count++;
            hashtagCounts[normalized].platforms.add(post.platform);
          });
        }
      });

      // Convert to array and sort
      return Object.entries(hashtagCounts)
        .map(([hashtag, data]) => ({
          hashtag: `#${hashtag}`,
          count: data.count,
          platforms: Array.from(data.platforms)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting trending hashtags:', error);
      return [];
    }
  }

  /**
   * Get top authors across platforms
   */
  async getTopAuthors(limit: number = 20): Promise<Array<{
    author: string;
    platform: string;
    posts_count: number;
    total_score: number;
    avg_engagement: number;
  }>> {
    try {
      const trendingContent = await this.getTrendingContent(100);
      const authorStats: { [key: string]: {
        platform: string;
        posts_count: number;
        total_score: number;
        total_engagement: number;
      } } = {};

      // Aggregate author statistics
      trendingContent.combined.forEach(post => {
        const key = `${post.author}-${post.platform}`;
        if (!authorStats[key]) {
          authorStats[key] = {
            platform: post.platform,
            posts_count: 0,
            total_score: 0,
            total_engagement: 0
          };
        }
        authorStats[key].posts_count++;
        authorStats[key].total_score += post.score;
        authorStats[key].total_engagement += post.comments + (post.shares || 0);
      });

      // Convert to array and sort
      return Object.entries(authorStats)
        .map(([author, stats]) => ({
          author: author.split('-')[0],
          platform: stats.platform,
          posts_count: stats.posts_count,
          total_score: stats.total_score,
          avg_engagement: stats.total_engagement / stats.posts_count
        }))
        .sort((a, b) => b.total_score - a.total_score)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting top authors:', error);
      return [];
    }
  }
}

// Export singleton instance
export const socialMediaService = new SocialMediaService();
