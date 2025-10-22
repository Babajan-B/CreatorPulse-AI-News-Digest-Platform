/**
 * Feedback Analyzer Service
 * Analyzes user feedback and extracts learning insights
 */

import { supabaseAdmin } from './supabase';

export interface FeedbackRecord {
  id?: string;
  user_id: string;
  draft_id?: string;
  article_id?: string;
  section_type?: 'intro' | 'article' | 'trend' | 'closing' | 'overall';
  reaction?: 'thumbs_up' | 'thumbs_down' | 'neutral';
  edit_applied?: boolean;
  original_text?: string;
  edited_text?: string;
  feedback_notes?: string;
}

export interface LearningInsight {
  user_id: string;
  insight_type: 'source_quality' | 'voice_refinement' | 'content_preference';
  insight_data: any;
  confidence_score: number;
}

export class FeedbackAnalyzer {
  /**
   * Submit feedback
   */
  async submitFeedback(feedback: FeedbackRecord): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('draft_feedback')
        .insert(feedback);

      if (error) {
        console.error('Error submitting feedback:', error);
        return false;
      }

      // Analyze and generate insights
      await this.analyzeFeedback(feedback.user_id);

      return true;
    } catch (error) {
      console.error('Error in submitFeedback:', error);
      return false;
    }
  }

  /**
   * Analyze user feedback and extract insights
   */
  async analyzeFeedback(userId: string): Promise<void> {
    try {
      // Get all feedback for user
      const { data: feedbacks } = await supabase
        .from('draft_feedback')
        .select('*')
        .eq('user_id', userId);

      if (!feedbacks || feedbacks.length < 5) {
        // Need minimum feedback to generate insights
        return;
      }

      // 1. Analyze source quality
      await this.analyzeSourceQuality(userId, feedbacks);

      // 2. Analyze voice refinement needs
      await this.analyzeVoiceRefinement(userId, feedbacks);

      // 3. Analyze content preferences
      await this.analyzeContentPreferences(userId, feedbacks);
    } catch (error) {
      console.error('Error in analyzeFeedback:', error);
    }
  }

  /**
   * Analyze which sources get positive feedback
   */
  private async analyzeSourceQuality(userId: string, feedbacks: any[]): Promise<void> {
    const sourceFeedback = new Map<string, { positive: number; negative: number }>();

    for (const feedback of feedbacks) {
      if (feedback.article_id && feedback.reaction) {
        // Get article source
        const { data: article } = await supabase
          .from('feed_items')
          .select('source, source_name')
          .eq('id', feedback.article_id)
          .single();

        if (article) {
          const source = article.source_name || article.source;
          if (!sourceFeedback.has(source)) {
            sourceFeedback.set(source, { positive: 0, negative: 0 });
          }

          const stats = sourceFeedback.get(source)!;
          if (feedback.reaction === 'thumbs_up') {
            stats.positive++;
          } else if (feedback.reaction === 'thumbs_down') {
            stats.negative++;
          }
        }
      }
    }

    // Generate insights
    const insights: any[] = [];
    sourceFeedback.forEach((stats, source) => {
      const total = stats.positive + stats.negative;
      if (total >= 3) {
        const score = stats.positive / total;
        insights.push({
          source,
          positive_rate: score,
          total_feedback: total,
          recommendation: score > 0.7 ? 'boost' : score < 0.3 ? 'reduce' : 'maintain',
        });
      }
    });

    if (insights.length > 0) {
      await supabaseAdmin.from('learning_insights').insert({
        user_id: userId,
        insight_type: 'source_quality',
        insight_data: { sources: insights },
        confidence_score: Math.min(1, feedbacks.length / 20),
      });
    }
  }

  /**
   * Analyze voice refinement needs
   */
  private async analyzeVoiceRefinement(userId: string, feedbacks: any[]): Promise<void> {
    const editPatterns: any[] = [];

    for (const feedback of feedbacks) {
      if (feedback.edit_applied && feedback.original_text && feedback.edited_text) {
        const originalLength = feedback.original_text.split(/\s+/).length;
        const editedLength = feedback.edited_text.split(/\s+/).length;
        const lengthChange = ((editedLength - originalLength) / originalLength) * 100;

        editPatterns.push({
          section_type: feedback.section_type,
          length_change: lengthChange,
          original_length: originalLength,
          edited_length: editedLength,
        });
      }
    }

    if (editPatterns.length >= 3) {
      const avgLengthChange = editPatterns.reduce((sum, p) => sum + p.length_change, 0) / editPatterns.length;

      const insight = {
        avg_length_change: avgLengthChange,
        pattern: avgLengthChange > 10 ? 'user_prefers_longer' : avgLengthChange < -10 ? 'user_prefers_shorter' : 'length_ok',
        edit_count: editPatterns.length,
        recommendation: 'adjust_voice_profile',
      };

      await supabaseAdmin.from('learning_insights').insert({
        user_id: userId,
        insight_type: 'voice_refinement',
        insight_data: insight,
        confidence_score: Math.min(1, editPatterns.length / 10),
      });
    }
  }

  /**
   * Analyze content preferences
   */
  private async analyzeContentPreferences(userId: string, feedbacks: any[]): Promise<void> {
    const topicFeedback = new Map<string, { positive: number; negative: number }>();

    for (const feedback of feedbacks) {
      if (feedback.article_id && feedback.reaction) {
        const { data: article } = await supabase
          .from('feed_items')
          .select('topic')
          .eq('id', feedback.article_id)
          .single();

        if (article && article.topic) {
          if (!topicFeedback.has(article.topic)) {
            topicFeedback.set(article.topic, { positive: 0, negative: 0 });
          }

          const stats = topicFeedback.get(article.topic)!;
          if (feedback.reaction === 'thumbs_up') {
            stats.positive++;
          } else if (feedback.reaction === 'thumbs_down') {
            stats.negative++;
          }
        }
      }
    }

    const insights: any[] = [];
    topicFeedback.forEach((stats, topic) => {
      const total = stats.positive + stats.negative;
      if (total >= 2) {
        const score = stats.positive / total;
        insights.push({
          topic,
          positive_rate: score,
          total_feedback: total,
          preference: score > 0.6 ? 'high' : score < 0.4 ? 'low' : 'medium',
        });
      }
    });

    if (insights.length > 0) {
      await supabaseAdmin.from('learning_insights').insert({
        user_id: userId,
        insight_type: 'content_preference',
        insight_data: { topics: insights },
        confidence_score: Math.min(1, feedbacks.length / 15),
      });
    }
  }

  /**
   * Get learning insights for user
   */
  async getInsights(userId: string): Promise<LearningInsight[]> {
    try {
      const { data, error } = await supabase
        .from('learning_insights')
        .select('*')
        .eq('user_id', userId)
        .eq('applied', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching insights:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getInsights:', error);
      return [];
    }
  }

  /**
   * Mark insight as applied
   */
  async markInsightApplied(insightId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('learning_insights')
        .update({ applied: true, applied_at: new Date().toISOString() })
        .eq('id', insightId);

      return !error;
    } catch (error) {
      console.error('Error marking insight applied:', error);
      return false;
    }
  }

  /**
   * Apply insights to improve system
   */
  async applyInsights(userId: string): Promise<{
    source_adjustments: any[];
    voice_adjustments: any;
    content_filters: any[];
  }> {
    const insights = await this.getInsights(userId);
    
    const result = {
      source_adjustments: [],
      voice_adjustments: {},
      content_filters: [],
    };

    for (const insight of insights) {
      if (insight.insight_type === 'source_quality') {
        result.source_adjustments = insight.insight_data.sources || [];
      } else if (insight.insight_type === 'voice_refinement') {
        result.voice_adjustments = insight.insight_data;
      } else if (insight.insight_type === 'content_preference') {
        result.content_filters = insight.insight_data.topics || [];
      }

      // Mark as applied
      if (insight.id) {
        await this.markInsightApplied(insight.id);
      }
    }

    return result;
  }
}

// Singleton
let feedbackAnalyzerInstance: FeedbackAnalyzer | null = null;

export function getFeedbackAnalyzer(): FeedbackAnalyzer {
  if (!feedbackAnalyzerInstance) {
    feedbackAnalyzerInstance = new FeedbackAnalyzer();
  }
  return feedbackAnalyzerInstance;
}

export default FeedbackAnalyzer;





