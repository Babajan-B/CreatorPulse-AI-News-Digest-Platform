// Generic RSS-based Social Media Service
import Parser from 'rss-parser';

export interface RSSPost {
  id: string;
  title: string;
  content: string;
  author?: string;
  url: string;
  published: Date;
  score?: number;
  comments?: number;
  source: string;
  platform: string;
  category: string;
  image?: string;
  trending_score: number;
}

export class RSSSocialService {
  private parser: Parser;

  constructor() {
    this.parser = new Parser({
      customFields: {
        item: [
          ['comments', 'comments'],
          ['slash:comments', 'slashComments'],
          ['slash:hit_parade', 'slashHitParade'],
        ],
      },
    });
  }

  /**
   * Fetch posts from an RSS feed
   */
  async fetchFeed(feedUrl: string, platform: string, source: string, category: string): Promise<RSSPost[]> {
    try {
      const feed = await this.parser.parseURL(feedUrl);
      const posts: RSSPost[] = [];

      feed.items.forEach((item) => {
        const post = this.parseRSSItem(item, platform, source, category);
        if (post) {
          posts.push(post);
        }
      });

      return posts;
    } catch (error) {
      console.error(`Error fetching RSS feed ${feedUrl}:`, error);
      return [];
    }
  }

  /**
   * Parse an RSS item into a standard post format
   */
  private parseRSSItem(item: any, platform: string, source: string, category: string): RSSPost | null {
    try {
      const id = item.guid || item.link || item.id || '';
      const title = item.title || '';
      const content = item.contentSnippet || item.content || item.description || '';
      const url = item.link || '';
      const published = item.pubDate ? new Date(item.pubDate) : new Date();
      const author = item.creator || item.author || 'Unknown';

      // Extract image from content
      let image: string | undefined;
      if (item.enclosure?.url) {
        image = item.enclosure.url;
      } else if (item.content) {
        const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
        if (imgMatch) {
          image = imgMatch[1];
        }
      }

      // Extract score and comments (platform-specific)
      let score = 0;
      let comments = 0;

      if (item.comments && typeof item.comments === 'string') {
        const commentsMatch = item.comments.match(/\d+/);
        if (commentsMatch) {
          comments = parseInt(commentsMatch[0], 10);
        }
      }

      if (item.slashComments) {
        comments = parseInt(item.slashComments, 10) || 0;
      }

      // Calculate trending score
      const trending_score = this.calculateTrendingScore({
        published,
        score,
        comments,
      });

      return {
        id,
        title,
        content: this.stripHtml(content).substring(0, 500),
        author,
        url,
        published,
        score,
        comments,
        source,
        platform,
        category,
        image,
        trending_score,
      };
    } catch (error) {
      console.error('Error parsing RSS item:', error);
      return null;
    }
  }

  /**
   * Calculate trending score based on recency and engagement
   */
  private calculateTrendingScore(params: { published: Date; score: number; comments: number }): number {
    const now = Date.now();
    const ageHours = (now - params.published.getTime()) / (1000 * 60 * 60);

    // Recency penalty (newer posts score higher)
    const recencyScore = Math.max(0, 1 - ageHours / 48); // 48-hour decay

    // Engagement score
    const engagementScore = params.score * 1 + params.comments * 2;

    return engagementScore * (1 + recencyScore);
  }

  /**
   * Strip HTML tags from content
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  /**
   * Fetch multiple RSS feeds in parallel
   */
  async fetchMultipleFeeds(
    feeds: Array<{ url: string; platform: string; source: string; category: string }>
  ): Promise<RSSPost[]> {
    const promises = feeds.map((feed) =>
      this.fetchFeed(feed.url, feed.platform, feed.source, feed.category)
    );

    try {
      const results = await Promise.all(promises);
      return results.flat().sort((a, b) => b.trending_score - a.trending_score);
    } catch (error) {
      console.error('Error fetching multiple feeds:', error);
      return [];
    }
  }

  /**
   * Format post for display
   */
  formatPostForDisplay(post: RSSPost) {
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      author: post.author,
      source: post.source,
      url: post.url,
      score: post.score,
      comments: post.comments,
      created_at: post.published,
      image: post.image,
      trending_score: post.trending_score,
      platform: post.platform,
      category: post.category,
      trending_reason: `${post.comments || 0} comments`,
    };
  }
}

// Export singleton instance
export const rssSocialService = new RSSSocialService();
