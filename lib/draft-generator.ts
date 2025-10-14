/**
 * Draft Generator Service  
 * Generates newsletter drafts with voice matching
 */

import { supabaseAdmin as supabase } from './supabase';
import { getVoiceTrainer } from './voice-trainer';
import { getVoiceMatcher } from './voice-matcher';
import { getTrendDetectionService } from './trend-detection-service';

export interface DraftArticle {
  article_id: string;
  title: string;
  summary: string;
  url: string;
  bullet_points: string[];
  hashtags: string[];
  commentary?: string;
  image_url?: string;
  source: string;
}

export interface DraftTrend {
  topic: string;
  explainer: string;
  article_count: number;
  trend_score: number;
  velocity: number;
  related_articles: any[];
}

export interface NewsletterDraft {
  id?: string;
  user_id: string;
  title: string;
  content_intro: string;
  curated_articles: DraftArticle[];
  trends_section?: {
    intro: string;
    trends: DraftTrend[];
  };
  closing: string;
  status: 'pending' | 'approved' | 'sent' | 'discarded';
  generated_at: string;
  metadata?: any;
}

export class DraftGenerator {
  /**
   * Generate a complete newsletter draft
   */
  async generateDraft(
    userId: string,
    options: {
      articleIds?: string[];
      maxArticles?: number;
      includeTrends?: boolean;
      mode?: 'ai_news' | 'science_breakthrough';
    } = {}
  ): Promise<{
    success: boolean;
    draft?: NewsletterDraft;
    error?: string;
  }> {
    try {
      const {
        articleIds,
        maxArticles = 10,
        includeTrends = true,
        mode = 'ai_news',
      } = options;

      // Check if user has voice training
      const trainer = getVoiceTrainer();
      const voiceProfile = await trainer.getVoiceProfile(userId);

      if (!voiceProfile) {
        return {
          success: false,
          error: 'Voice profile not found. Please train your voice first with 20+ newsletter samples.',
        };
      }

      // Get voice samples
      const samples = await trainer.getUserSamples(userId);
      const sampleTexts = samples.map((s) => s.content);

      // Fetch articles
      let articles: any[] = [];
      
      if (articleIds && articleIds.length > 0) {
        const { data } = await supabase
          .from('feed_items')
          .select('*')
          .in('id', articleIds)
          .order('published_at', { ascending: false });
        
        articles = data || [];
      } else {
        // Get recent high-quality articles
        const { data } = await supabase
          .from('feed_items')
          .select('*')
          .gte('published_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('published_at', { ascending: false })
          .limit(maxArticles);
        
        articles = data || [];
      }

      if (articles.length === 0) {
        return {
          success: false,
          error: 'No articles found to include in draft',
        };
      }

      // Generate draft components
      const matcher = getVoiceMatcher();
      const date = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      // Extract top topics from articles
      const topTopics = [...new Set(articles.map((a) => a.topic).filter(Boolean))].slice(0, 3);
      
      // If no topics extracted, use mode-specific defaults
      const defaultTopics = mode === 'ai_news' 
        ? ['GPT Models', 'LLMs', 'AI Startups', 'Machine Learning']
        : ['Medical Research', 'Physics', 'Neuroscience', 'Biology'];
      
      const finalTopics = topTopics.length > 0 ? topTopics : defaultTopics;

      // Generate introduction
      const intro = await matcher.generateIntro(voiceProfile, sampleTexts, {
        date,
        topTopics: finalTopics,
        articleCount: articles.length,
        mode,
      });

      // Process articles with commentary
      const curatedArticles: DraftArticle[] = [];
      
      for (const article of articles.slice(0, maxArticles)) {
        const bulletPoints = article.bullet_points || [];
        const hashtags = article.hashtags || [];

        // Generate commentary
        const commentary = await matcher.generateCommentary(voiceProfile, sampleTexts, {
          title: article.title,
          summary: article.summary || '',
          keyPoints: bulletPoints.slice(0, 3),
          mode,
        });

        curatedArticles.push({
          article_id: article.id,
          title: article.title,
          summary: article.summary || '',
          url: article.url,
          bullet_points: bulletPoints,
          hashtags,
          commentary,
          image_url: article.image_url,
          source: article.source_name || article.source || 'Unknown',
        });
      }

      // Generate trends section
      let trendsSection;
      
      if (includeTrends) {
        const trendService = getTrendDetectionService();
        const topTrends = await trendService.getTopTrendsForNewsletter();

        if (topTrends.length > 0) {
          const trendsIntro = await matcher.generateTrendsExplainer(
            voiceProfile,
            sampleTexts,
            topTrends.map((t) => ({
              topic: t.topic,
              article_count: t.article_count,
              velocity: t.velocity,
            }))
          );

          trendsSection = {
            intro: trendsIntro,
            trends: topTrends.map((t) => ({
              topic: t.topic,
              explainer: trendService.generateTrendExplainer(t),
              article_count: t.article_count,
              trend_score: t.trend_score,
              velocity: t.velocity,
              related_articles: t.related_articles,
            })),
          };
        }
      }

      // Generate closing
      const closing = await matcher.generateClosing(voiceProfile, sampleTexts, {
        articleCount: curatedArticles.length,
        topTrends: trendsSection?.trends.map((t) => t.topic) || finalTopics.slice(0, 3),
        mode,
      });

      // Create draft object
      const modeTitle = mode === 'science_breakthrough' 
        ? 'Science Breakthrough Digest' 
        : 'AI News Digest';
      
      const draft: NewsletterDraft = {
        user_id: userId,
        title: `Your Daily ${modeTitle} - ${date}`,
        content_intro: intro,
        curated_articles: curatedArticles,
        trends_section: trendsSection,
        closing,
        status: 'pending',
        generated_at: new Date().toISOString(),
        metadata: {
          voice_profile_used: true,
          article_count: curatedArticles.length,
          includes_trends: !!trendsSection,
        },
      };

      // Save draft to database
      const savedDraft = await this.saveDraft(draft);

      if (!savedDraft) {
        return {
          success: false,
          error: 'Failed to save draft',
        };
      }

      return {
        success: true,
        draft: savedDraft,
      };
    } catch (error: any) {
      console.error('Error generating draft:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate draft',
      };
    }
  }

  /**
   * Save draft to database
   */
  async saveDraft(draft: NewsletterDraft): Promise<NewsletterDraft | null> {
    try {
      const { data, error } = await supabase
        .from('newsletter_drafts')
        .insert({
          user_id: draft.user_id,
          title: draft.title,
          content_intro: draft.content_intro,
          curated_articles: draft.curated_articles,
          trends_section: draft.trends_section || null,
          closing: draft.closing,
          status: draft.status,
          generated_at: draft.generated_at,
          original_content: {
            intro: draft.content_intro,
            articles: draft.curated_articles,
            trends: draft.trends_section,
            closing: draft.closing,
          },
          metadata: draft.metadata,
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving draft:', error);
        return null;
      }

      return {
        ...draft,
        id: data.id,
      };
    } catch (error) {
      console.error('Error in saveDraft:', error);
      return null;
    }
  }

  /**
   * Get user's drafts
   */
  async getUserDrafts(
    userId: string,
    options: {
      status?: string;
      limit?: number;
    } = {}
  ): Promise<NewsletterDraft[]> {
    try {
      let query = supabase
        .from('newsletter_drafts')
        .select('*')
        .eq('user_id', userId)
        .order('generated_at', { ascending: false });

      if (options.status) {
        query = query.eq('status', options.status);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching drafts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserDrafts:', error);
      return [];
    }
  }

  /**
   * Get single draft
   */
  async getDraft(draftId: string): Promise<NewsletterDraft | null> {
    try {
      const { data, error } = await supabase
        .from('newsletter_drafts')
        .select('*')
        .eq('id', draftId)
        .single();

      if (error) {
        console.error('Error fetching draft:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getDraft:', error);
      return null;
    }
  }

  /**
   * Update draft
   */
  async updateDraft(
    draftId: string,
    updates: Partial<NewsletterDraft>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('newsletter_drafts')
        .update({
          ...updates,
          edited_content: {
            intro: updates.content_intro,
            articles: updates.curated_articles,
            trends: updates.trends_section,
            closing: updates.closing,
          },
        })
        .eq('id', draftId);

      if (error) {
        console.error('Error updating draft:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateDraft:', error);
      return false;
    }
  }

  /**
   * Approve draft
   */
  async approveDraft(
    draftId: string,
    reviewTimeSeconds: number
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('newsletter_drafts')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          review_time_seconds: reviewTimeSeconds,
        })
        .eq('id', draftId);

      if (error) {
        console.error('Error approving draft:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in approveDraft:', error);
      return false;
    }
  }

  /**
   * Mark draft as sent
   */
  async markAsSent(draftId: string, emailId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('newsletter_drafts')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          email_id: emailId,
        })
        .eq('id', draftId);

      if (error) {
        console.error('Error marking draft as sent:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in markAsSent:', error);
      return false;
    }
  }

  /**
   * Discard draft
   */
  async discardDraft(draftId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('newsletter_drafts')
        .update({
          status: 'discarded',
        })
        .eq('id', draftId);

      if (error) {
        console.error('Error discarding draft:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in discardDraft:', error);
      return false;
    }
  }
}

// Singleton instance
let draftGeneratorInstance: DraftGenerator | null = null;

export function getDraftGenerator(): DraftGenerator {
  if (!draftGeneratorInstance) {
    draftGeneratorInstance = new DraftGenerator();
  }
  return draftGeneratorInstance;
}

export default DraftGenerator;




