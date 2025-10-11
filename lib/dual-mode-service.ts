// Dual-Mode Service: AI News vs Science Breakthroughs
// Handles data fetching based on user preference

import { ACTIVE_SCIENCE_SOURCES } from './science-sources';
import { LLMService } from './llm-service';
import Parser from 'rss-parser';

export type UserMode = 'ai_news' | 'science_breakthrough';

export interface ProcessedArticle {
  id: string;
  title: string;
  content: string;
  url: string;
  source: string;
  category: string;
  published_at: string;
  importance_score: number;
  summary?: string;
  bullet_points?: string[];
  hashtags?: string[];
  mode: UserMode;
}

export interface ModeConfig {
  mode: UserMode;
  fetchLimit: number;
  topItems: number;
  summaryStyle: 'ai_news' | 'research_focused';
}

export class DualModeService {
  private llmService: LLMService;
  private parser: Parser;

  constructor() {
    this.llmService = new LLMService();
    this.parser = new Parser({
      timeout: 10000,
      customFields: {
        item: [
          ['media:content', 'mediaContent'],
          ['media:thumbnail', 'mediaThumbnail'],
          ['content:encoded', 'contentEncoded']
        ]
      }
    });
  }

  /**
   * Get configuration for a specific mode
   */
  getModeConfig(mode: UserMode): ModeConfig {
    if (mode === 'ai_news') {
      return {
        mode: 'ai_news',
        fetchLimit: 50,
        topItems: 5,
        summaryStyle: 'ai_news'
      };
    } else {
      return {
        mode: 'science_breakthrough',
        fetchLimit: 50,
        topItems: 5,
        summaryStyle: 'research_focused'
      };
    }
  }

  /**
   * Fetch articles based on user mode
   */
  async fetchArticlesByMode(
    mode: UserMode, 
    limit: number = 50
  ): Promise<ProcessedArticle[]> {
    const config = this.getModeConfig(mode);
    
    console.log(`🔍 Fetching ${limit} articles for mode: ${mode}`);

    if (mode === 'ai_news') {
      return this.fetchAINewsArticles(limit);
    } else {
      return this.fetchScienceBreakthroughArticles(limit);
    }
  }

  /**
   * Fetch AI News articles (using mock data for now)
   */
  private async fetchAINewsArticles(limit: number): Promise<ProcessedArticle[]> {
    try {
      // Return mock AI news data for now
      const mockArticles: ProcessedArticle[] = [
        {
          id: 'ai-1',
          title: 'OpenAI Announces GPT-5 with Revolutionary Capabilities',
          content: 'OpenAI has unveiled GPT-5, the next generation of its large language model series, featuring enhanced reasoning, multimodal processing, and breakthrough performance improvements.',
          url: 'https://techcrunch.com',
          source: 'TechCrunch',
          category: 'AI Models',
          published_at: new Date().toISOString(),
          importance_score: 95,
          mode: 'ai_news'
        },
        {
          id: 'ai-2',
          title: 'Google DeepMind Achieves Breakthrough in Protein Folding',
          content: 'AlphaFold 3 demonstrates unprecedented accuracy in predicting protein structures, potentially revolutionizing drug discovery and medical research.',
          url: 'https://nature.com',
          source: 'Nature',
          category: 'AI Research',
          published_at: new Date().toISOString(),
          importance_score: 92,
          mode: 'ai_news'
        },
        {
          id: 'ai-3',
          title: 'Meta Releases Open-Source AI Model Llama 4',
          content: 'Meta continues its commitment to open-source AI with the release of Llama 4, featuring improved performance and efficiency.',
          url: 'https://ai.meta.com',
          source: 'Meta AI',
          category: 'Open Source',
          published_at: new Date().toISOString(),
          importance_score: 88,
          mode: 'ai_news'
        }
      ];
      
      return mockArticles.slice(0, limit);
    } catch (error) {
      console.error('Error fetching AI news articles:', error);
      return [];
    }
  }

  /**
   * Fetch Science Breakthrough articles
   */
  private async fetchScienceBreakthroughArticles(limit: number): Promise<ProcessedArticle[]> {
    try {
      const articles: ProcessedArticle[] = [];
      const sources = ACTIVE_SCIENCE_SOURCES.slice(0, 3); // Use first 3 sources for now
      
      // Distribute limit across sources
      const itemsPerSource = Math.max(2, Math.floor(limit / sources.length));
      
      for (const source of sources) {
        try {
          console.log(`📡 Fetching from ${source.name}...`);
          
          // Fetch RSS feed
          const feed = await this.parser.parseURL(source.rss_url);
          
          // Convert to ProcessedArticle format
          const items = feed.items.slice(0, itemsPerSource);
          const processed = items.map((item, idx) => ({
            id: `${source.id}-${idx}`,
            title: item.title || 'Untitled',
            content: item.contentSnippet || item.content || item.summary || '',
            url: item.link || source.website_url,
            source: source.name,
            category: source.category,
            published_at: item.pubDate || item.isoDate || new Date().toISOString(),
            importance_score: this.calculateImportanceScore(
              { 
                title: item.title || '', 
                content: item.contentSnippet || '',
                published_at: item.pubDate || new Date().toISOString()
              }, 
              'science_breakthrough', 
              source.weight
            ),
            mode: 'science_breakthrough' as UserMode
          }));
          
          articles.push(...processed);
        } catch (error) {
          console.error(`Error fetching from ${source.name}:`, error);
        }
      }
      
      // Sort by importance score and limit
      return articles
        .sort((a, b) => b.importance_score - a.importance_score)
        .slice(0, limit);
        
    } catch (error) {
      console.error('Error fetching science breakthrough articles:', error);
      return [];
    }
  }

  /**
   * Calculate importance score for ranking
   */
  private calculateImportanceScore(
    article: any, 
    mode: UserMode, 
    sourceWeight: number = 5
  ): number {
    let score = sourceWeight; // Base score from source weight
    
    // Age factor (newer = higher score)
    const publishedDate = new Date(article.published_at);
    const now = new Date();
    const ageInHours = (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60);
    
    if (ageInHours < 24) score += 10; // Very recent
    else if (ageInHours < 72) score += 5; // Recent
    else if (ageInHours < 168) score += 2; // This week
    
    // Title keywords boost
    const title = article.title.toLowerCase();
    
    if (mode === 'ai_news') {
      const aiKeywords = ['breakthrough', 'new model', 'gpt', 'llm', 'openai', 'anthropic', 'gemini'];
      const keywordMatches = aiKeywords.filter(keyword => title.includes(keyword));
      score += keywordMatches.length * 3;
    } else {
      const scienceKeywords = ['breakthrough', 'discovery', 'clinical trial', 'new treatment', 'cure', 'vaccine'];
      const keywordMatches = scienceKeywords.filter(keyword => title.includes(keyword));
      score += keywordMatches.length * 4;
    }
    
    // Content length factor
    if (article.content && article.content.length > 1000) score += 2;
    
    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Get top articles with AI summaries
   */
  async getTopArticlesWithSummaries(
    mode: UserMode, 
    topCount: number = 5
  ): Promise<ProcessedArticle[]> {
    try {
      // Fetch articles
      const articles = await this.fetchArticlesByMode(mode, 50);
      
      // Get top articles by importance score
      const topArticles = articles
        .sort((a, b) => b.importance_score - a.importance_score)
        .slice(0, topCount);
      
      // Generate summaries for each
      const config = this.getModeConfig(mode);
      
      for (const article of topArticles) {
        try {
          const summaryData = await this.llmService.generateContent(
            article.title,
            article.content,
            config.summaryStyle
          );
          
          article.summary = summaryData.summary;
          article.bullet_points = summaryData.bullet_points;
          article.hashtags = summaryData.hashtags;
        } catch (error) {
          console.error(`Error generating summary for ${article.title}:`, error);
          // Keep article without summary
        }
      }
      
      return topArticles;
      
    } catch (error) {
      console.error('Error getting top articles with summaries:', error);
      return [];
    }
  }

  /**
   * Get mode statistics
   */
  async getModeStats(mode: UserMode): Promise<{
    totalArticles: number;
    topCategories: { [key: string]: number };
    avgImportanceScore: number;
    sourcesCount: number;
  }> {
    try {
      const articles = await this.fetchArticlesByMode(mode, 100);
      const config = this.getModeConfig(mode);
      
      // Calculate category distribution
      const categories: { [key: string]: number } = {};
      articles.forEach(article => {
        categories[article.category] = (categories[article.category] || 0) + 1;
      });
      
      // Calculate average importance score
      const avgScore = articles.length > 0 
        ? articles.reduce((sum, a) => sum + a.importance_score, 0) / articles.length 
        : 0;
      
      const sourcesCount = mode === 'ai_news' ? 3 : ACTIVE_SCIENCE_SOURCES.length;
      
      return {
        totalArticles: articles.length,
        topCategories: categories,
        avgImportanceScore: Math.round(avgScore * 100) / 100,
        sourcesCount
      };
      
    } catch (error) {
      console.error('Error getting mode stats:', error);
      return {
        totalArticles: 0,
        topCategories: {},
        avgImportanceScore: 0,
        sourcesCount: 0
      };
    }
  }
}
