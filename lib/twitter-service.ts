/**
 * Twitter Service
 * Fetches tweets from specified Twitter accounts
 * Uses Twitter API v2
 */

import { TwitterApi } from 'twitter-api-v2';

export interface TwitterConfig {
  bearerToken: string;
}

export interface Tweet {
  id: string;
  text: string;
  authorId: string;
  authorUsername: string;
  authorName: string;
  createdAt: string;
  url: string;
  metrics?: {
    likes: number;
    retweets: number;
    replies: number;
  };
}

export interface TwitterFetchResult {
  tweets: Tweet[];
  error?: string;
}

export class TwitterService {
  private client: TwitterApi | null = null;

  constructor(config?: TwitterConfig) {
    if (config?.bearerToken) {
      this.client = new TwitterApi(config.bearerToken);
    } else if (process.env.TWITTER_BEARER_TOKEN) {
      this.client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
    }
  }

  /**
   * Check if Twitter service is configured
   */
  isConfigured(): boolean {
    return this.client !== null;
  }

  /**
   * Fetch recent tweets from a user by username
   */
  async fetchUserTweets(
    username: string,
    options: {
      maxResults?: number;
      excludeReplies?: boolean;
      excludeRetweets?: boolean;
    } = {}
  ): Promise<TwitterFetchResult> {
    if (!this.client) {
      return {
        tweets: [],
        error: 'Twitter API not configured. Please add TWITTER_BEARER_TOKEN to environment variables.',
      };
    }

    try {
      const { maxResults = 10, excludeReplies = true, excludeRetweets = true } = options;

      // Get user ID from username
      const user = await this.client.v2.userByUsername(username, {
        'user.fields': ['id', 'name', 'username'],
      });

      if (!user.data) {
        return {
          tweets: [],
          error: `User @${username} not found`,
        };
      }

      // Fetch user tweets
      const tweets = await this.client.v2.userTimeline(user.data.id, {
        max_results: Math.min(maxResults, 100),
        exclude: [
          ...(excludeReplies ? ['replies' as const] : []),
          ...(excludeRetweets ? ['retweets' as const] : []),
        ],
        'tweet.fields': ['created_at', 'public_metrics', 'author_id'],
        expansions: ['author_id'],
      });

      const tweetData: Tweet[] = tweets.data.data.map((tweet) => ({
        id: tweet.id,
        text: tweet.text,
        authorId: tweet.author_id!,
        authorUsername: user.data.username,
        authorName: user.data.name,
        createdAt: tweet.created_at!,
        url: `https://twitter.com/${user.data.username}/status/${tweet.id}`,
        metrics: tweet.public_metrics
          ? {
              likes: tweet.public_metrics.like_count,
              retweets: tweet.public_metrics.retweet_count,
              replies: tweet.public_metrics.reply_count,
            }
          : undefined,
      }));

      return {
        tweets: tweetData,
      };
    } catch (error: any) {
      console.error('Twitter fetch error:', error);
      return {
        tweets: [],
        error: error.message || 'Failed to fetch tweets',
      };
    }
  }

  /**
   * Fetch tweets by hashtag
   */
  async fetchHashtagTweets(
    hashtag: string,
    options: {
      maxResults?: number;
      sinceHours?: number;
    } = {}
  ): Promise<TwitterFetchResult> {
    if (!this.client) {
      return {
        tweets: [],
        error: 'Twitter API not configured',
      };
    }

    try {
      const { maxResults = 10, sinceHours = 24 } = options;

      // Calculate start time
      const startTime = new Date();
      startTime.setHours(startTime.getHours() - sinceHours);

      // Search tweets
      const searchResults = await this.client.v2.search(
        `#${hashtag.replace('#', '')} -is:retweet`,
        {
          max_results: Math.min(maxResults, 100),
          'tweet.fields': ['created_at', 'public_metrics', 'author_id'],
          expansions: ['author_id'],
          'user.fields': ['username', 'name'],
          start_time: startTime.toISOString(),
        }
      );

      if (!searchResults.data.data || searchResults.data.data.length === 0) {
        return {
          tweets: [],
        };
      }

      const users = searchResults.includes?.users || [];
      const userMap = new Map(users.map((u) => [u.id, u]));

      const tweetData: Tweet[] = searchResults.data.data.map((tweet) => {
        const author = userMap.get(tweet.author_id!);
        return {
          id: tweet.id,
          text: tweet.text,
          authorId: tweet.author_id!,
          authorUsername: author?.username || 'unknown',
          authorName: author?.name || 'Unknown User',
          createdAt: tweet.created_at!,
          url: `https://twitter.com/${author?.username}/status/${tweet.id}`,
          metrics: tweet.public_metrics
            ? {
                likes: tweet.public_metrics.like_count,
                retweets: tweet.public_metrics.retweet_count,
                replies: tweet.public_metrics.reply_count,
              }
            : undefined,
        };
      });

      return {
        tweets: tweetData,
      };
    } catch (error: any) {
      console.error('Twitter hashtag fetch error:', error);
      return {
        tweets: [],
        error: error.message || 'Failed to fetch hashtag tweets',
      };
    }
  }

  /**
   * Fetch tweets from multiple users
   */
  async fetchMultipleUsers(
    usernames: string[],
    options: { maxResultsPerUser?: number } = {}
  ): Promise<{ username: string; result: TwitterFetchResult }[]> {
    const results = await Promise.all(
      usernames.map(async (username) => ({
        username,
        result: await this.fetchUserTweets(username, {
          maxResults: options.maxResultsPerUser || 5,
        }),
      }))
    );

    return results;
  }

  /**
   * Convert tweet to article format for our system
   */
  static tweetToArticle(tweet: Tweet) {
    return {
      title: `Tweet by @${tweet.authorUsername}`,
      content: tweet.text,
      url: tweet.url,
      source: 'twitter',
      source_name: `@${tweet.authorUsername}`,
      author: tweet.authorName,
      published_at: new Date(tweet.createdAt),
      metadata: {
        likes: tweet.metrics?.likes || 0,
        retweets: tweet.metrics?.retweets || 0,
        replies: tweet.metrics?.replies || 0,
        tweet_id: tweet.id,
      },
    };
  }
}

// Singleton instance
let twitterServiceInstance: TwitterService | null = null;

export function getTwitterService(): TwitterService {
  if (!twitterServiceInstance) {
    twitterServiceInstance = new TwitterService();
  }
  return twitterServiceInstance;
}

export default TwitterService;




