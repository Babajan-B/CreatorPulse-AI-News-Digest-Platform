/**
 * Trend Detection Service
 * Detects emerging trends and spikes in article topics
 */

import { supabaseAdmin as supabase } from './supabase';
import natural from 'natural';

export interface Trend {
  id?: string;
  topic: string;
  keywords: string[];
  article_count: number;
  trend_score: number;
  velocity: number;
  detected_at: string;
  related_articles: any[];
  time_window: string;
}

export interface KeywordMention {
  keyword: string;
  mention_date: string;
  mention_count: number;
  article_ids: string[];
}

export class TrendDetectionService {
  private tfidf: natural.TfIdf;

  constructor() {
    this.tfidf = new natural.TfIdf();
  }

  /**
   * Extract keywords from text using TF-IDF
   */
  extractKeywords(text: string, topN: number = 10): string[] {
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(text.toLowerCase()) || [];
    
    // Filter out stop words and short words
    const stopwords = natural.stopwords;
    const filtered = tokens.filter(
      (token) => token.length > 3 && !stopwords.includes(token)
    );

    // Use TF-IDF to rank keywords
    this.tfidf.addDocument(filtered.join(' '));
    
    const keywords: { term: string; score: number }[] = [];
    this.tfidf.listTerms(this.tfidf.documents.length - 1).forEach((item) => {
      keywords.push({ term: item.term, score: item.tfidf });
    });

    // Sort by score and return top N
    return keywords
      .sort((a, b) => b.score - a.score)
      .slice(0, topN)
      .map((k) => k.term);
  }

  /**
   * Detect trends from recent articles
   */
  async detectTrends(options: {
    timeWindow?: string; // '24h', '7d', '30d'
    minArticleCount?: number;
    topN?: number;
  } = {}): Promise<Trend[]> {
    const {
      timeWindow = '24h',
      minArticleCount = 3,
      topN = 10,
    } = options;

    try {
      // Calculate time range
      const now = new Date();
      let since = new Date();
      
      switch (timeWindow) {
        case '24h':
          since.setHours(since.getHours() - 24);
          break;
        case '7d':
          since.setDate(since.getDate() - 7);
          break;
        case '30d':
          since.setDate(since.getDate() - 30);
          break;
      }

      // Fetch recent articles
      const { data: articles, error } = await supabase
        .from('feed_items')
        .select('id, title, content, topic, published_at')
        .gte('published_at', since.toISOString())
        .order('published_at', { ascending: false })
        .limit(500);

      if (error) {
        console.error('Error fetching articles:', error);
        return [];
      }

      if (!articles || articles.length === 0) {
        return [];
      }

      // Extract all keywords from articles
      const keywordCounts = new Map<string, Set<string>>();
      
      articles.forEach((article) => {
        const text = `${article.title} ${article.content || ''}`;
        const keywords = this.extractKeywords(text, 5);
        
        keywords.forEach((keyword) => {
          if (!keywordCounts.has(keyword)) {
            keywordCounts.set(keyword, new Set());
          }
          keywordCounts.get(keyword)!.add(article.id);
        });
      });

      // Calculate historical average (30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: historicalArticles } = await supabase
        .from('feed_items')
        .select('id, title, content')
        .gte('published_at', thirtyDaysAgo.toISOString())
        .lt('published_at', since.toISOString());

      // Calculate historical keyword frequency
      const historicalCounts = new Map<string, number>();
      
      (historicalArticles || []).forEach((article) => {
        const text = `${article.title} ${article.content || ''}`;
        const keywords = this.extractKeywords(text, 5);
        
        keywords.forEach((keyword) => {
          historicalCounts.set(keyword, (historicalCounts.get(keyword) || 0) + 1);
        });
      });

      const historicalDays = Math.max(
        1,
        (since.getTime() - thirtyDaysAgo.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Detect spikes and calculate trend scores
      const trends: Trend[] = [];

      keywordCounts.forEach((articleIds, keyword) => {
        const currentCount = articleIds.size;
        
        if (currentCount < minArticleCount) {
          return;
        }

        // Calculate historical average
        const historicalCount = historicalCounts.get(keyword) || 0;
        const historicalAverage = historicalCount / historicalDays;

        // Calculate current rate (per day)
        const currentDays = (now.getTime() - since.getTime()) / (1000 * 60 * 60 * 24);
        const currentRate = currentCount / currentDays;

        // Calculate velocity (rate of change)
        const velocity = historicalAverage > 0
          ? ((currentRate - historicalAverage) / historicalAverage) * 100
          : currentRate * 100;

        // Calculate trend score (0-10)
        const trendScore = Math.min(10, Math.max(0, velocity / 10));

        // Only include if there's a significant increase
        if (velocity > 20) {
          const relatedArticlesList = Array.from(articleIds).slice(0, 5);
          
          trends.push({
            topic: keyword,
            keywords: [keyword],
            article_count: currentCount,
            trend_score: parseFloat(trendScore.toFixed(2)),
            velocity: parseFloat(velocity.toFixed(2)),
            detected_at: now.toISOString(),
            related_articles: relatedArticlesList.map((id) => ({ article_id: id })),
            time_window: timeWindow,
          });
        }
      });

      // Sort by trend score
      const sortedTrends = trends.sort((a, b) => b.trend_score - a.trend_score);

      // Take top N and save to database
      const topTrends = sortedTrends.slice(0, topN);
      
      for (const trend of topTrends) {
        await this.saveTrend(trend);
      }

      return topTrends;
    } catch (error) {
      console.error('Error detecting trends:', error);
      return [];
    }
  }

  /**
   * Save trend to database
   */
  async saveTrend(trend: Trend): Promise<void> {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await supabaseAdmin.from('trend_detection').insert({
        topic: trend.topic,
        keywords: trend.keywords,
        article_count: trend.article_count,
        trend_score: trend.trend_score,
        velocity: trend.velocity,
        detected_at: trend.detected_at,
        related_articles: trend.related_articles,
        time_window: trend.time_window,
        expires_at: expiresAt.toISOString(),
      });
    } catch (error) {
      console.error('Error saving trend:', error);
    }
  }

  /**
   * Get current trending topics
   */
  async getTrendingTopics(limit: number = 10): Promise<Trend[]> {
    try {
      const { data, error } = await supabase
        .from('trend_detection')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .order('trend_score', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching trends:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getTrendingTopics:', error);
      return [];
    }
  }

  /**
   * Get top 3 trends for newsletter
   */
  async getTopTrendsForNewsletter(): Promise<Trend[]> {
    return await this.getTrendingTopics(3);
  }

  /**
   * Track keyword mentions over time
   */
  async trackKeywordMention(keyword: string, articleId: string): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: existing } = await supabase
        .from('keyword_mentions')
        .select('*')
        .eq('keyword', keyword)
        .eq('mention_date', today)
        .single();

      if (existing) {
        // Update existing record
        const articleIds = existing.article_ids || [];
        if (!articleIds.includes(articleId)) {
          articleIds.push(articleId);
        }

        await supabase
          .from('keyword_mentions')
          .update({
            mention_count: existing.mention_count + 1,
            article_ids: articleIds,
          })
          .eq('id', existing.id);
      } else {
        // Create new record
        await supabaseAdmin.from('keyword_mentions').insert({
          keyword,
          mention_date: today,
          mention_count: 1,
          article_ids: [articleId],
        });
      }
    } catch (error) {
      console.error('Error tracking keyword mention:', error);
    }
  }

  /**
   * Clean up expired trends
   */
  async cleanupExpiredTrends(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('trend_detection')
        .delete()
        .lt('expires_at', new Date().toISOString())
        .select();

      if (error) {
        console.error('Error cleaning up trends:', error);
        return 0;
      }

      return data?.length || 0;
    } catch (error) {
      console.error('Error in cleanupExpiredTrends:', error);
      return 0;
    }
  }

  /**
   * Generate trend explainer text for newsletter
   */
  generateTrendExplainer(trend: Trend): string {
    const { topic, article_count, velocity } = trend;
    
    let intensity = 'emerging';
    if (velocity > 100) {
      intensity = 'rapidly growing';
    } else if (velocity > 50) {
      intensity = 'trending';
    }

    return `${topic.charAt(0).toUpperCase() + topic.slice(1)} is ${intensity} with ${article_count} recent articles (${velocity.toFixed(0)}% increase). This topic is gaining significant attention in the AI community.`;
  }
}

// Singleton instance
let trendDetectionServiceInstance: TrendDetectionService | null = null;

export function getTrendDetectionService(): TrendDetectionService {
  if (!trendDetectionServiceInstance) {
    trendDetectionServiceInstance = new TrendDetectionService();
  }
  return trendDetectionServiceInstance;
}

export default TrendDetectionService;

