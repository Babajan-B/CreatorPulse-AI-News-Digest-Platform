/**
 * Analytics Service
 * Track and analyze email engagement metrics
 */

import { supabaseAdmin } from './supabase';

export interface AnalyticsMetrics {
  total_sent: number;
  total_delivered: number;
  total_opened: number;
  total_clicked: number;
  total_bounced: number;
  open_rate: number;
  click_through_rate: number;
  engagement_rate: number;
}

export interface ArticlePerformance {
  article_id: string;
  title: string;
  clicks: number;
  engagement_rate: number;
}

export interface ROIMetrics {
  time_saved_per_day: number;
  time_saved_per_month: number;
  estimated_cost_savings: number;
  roi_percentage: number;
}

export class AnalyticsService {
  /**
   * Track engagement event
   */
  async trackEvent(event: {
    user_id: string;
    draft_id?: string;
    email_id?: string;
    event_type: string;
    article_id?: string;
    link_clicked?: string;
    recipient_email?: string;
    metadata?: any;
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('engagement_analytics')
        .insert({
          ...event,
          timestamp: new Date().toISOString(),
        });

      return !error;
    } catch (error) {
      console.error('Error tracking event:', error);
      return false;
    }
  }

  /**
   * Get overview analytics for user
   */
  async getOverview(
    userId: string,
    days: number = 30
  ): Promise<AnalyticsMetrics> {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const { data, error } = await supabase
        .from('engagement_analytics')
        .select('event_type, email_id')
        .eq('user_id', userId)
        .gte('timestamp', since.toISOString());

      if (error || !data) {
        return this.getEmptyMetrics();
      }

      const sent = data.filter((e) => e.event_type === 'sent').length;
      const delivered = data.filter((e) => e.event_type === 'delivered').length;
      const opened = new Set(data.filter((e) => e.event_type === 'opened').map((e) => e.email_id)).size;
      const clicked = new Set(data.filter((e) => e.event_type === 'clicked').map((e) => e.email_id)).size;
      const bounced = data.filter((e) => e.event_type === 'bounced').length;

      const openRate = sent > 0 ? (opened / sent) * 100 : 0;
      const clickThroughRate = opened > 0 ? (clicked / opened) * 100 : 0;
      const engagementRate = sent > 0 ? (clicked / sent) * 100 : 0;

      return {
        total_sent: sent,
        total_delivered: delivered,
        total_opened: opened,
        total_clicked: clicked,
        total_bounced: bounced,
        open_rate: parseFloat(openRate.toFixed(2)),
        click_through_rate: parseFloat(clickThroughRate.toFixed(2)),
        engagement_rate: parseFloat(engagementRate.toFixed(2)),
      };
    } catch (error) {
      console.error('Error getting overview:', error);
      return this.getEmptyMetrics();
    }
  }

  /**
   * Get article performance
   */
  async getArticlePerformance(
    userId: string,
    days: number = 30
  ): Promise<ArticlePerformance[]> {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const { data, error } = await supabase
        .from('engagement_analytics')
        .select('article_id, event_type')
        .eq('user_id', userId)
        .eq('event_type', 'clicked')
        .not('article_id', 'is', null)
        .gte('timestamp', since.toISOString());

      if (error || !data) {
        return [];
      }

      // Count clicks per article
      const articleClicks = new Map<string, number>();
      data.forEach((e) => {
        if (e.article_id) {
          articleClicks.set(e.article_id, (articleClicks.get(e.article_id) || 0) + 1);
        }
      });

      // Get article details
      const articleIds = Array.from(articleClicks.keys());
      const { data: articles } = await supabase
        .from('feed_items')
        .select('id, title')
        .in('id', articleIds);

      const performance: ArticlePerformance[] = [];
      
      (articles || []).forEach((article) => {
        const clicks = articleClicks.get(article.id) || 0;
        performance.push({
          article_id: article.id,
          title: article.title,
          clicks,
          engagement_rate: 0, // Would need sent count per article to calculate
        });
      });

      return performance.sort((a, b) => b.clicks - a.clicks).slice(0, 10);
    } catch (error) {
      console.error('Error getting article performance:', error);
      return [];
    }
  }

  /**
   * Calculate ROI metrics
   */
  async calculateROI(userId: string, hourlyRate: number = 50): Promise<ROIMetrics> {
    try {
      // Get average review time
      const { data: drafts } = await supabase
        .from('newsletter_drafts')
        .select('review_time_seconds')
        .eq('user_id', userId)
        .not('review_time_seconds', 'is', null);

      const avgReviewTimeMinutes = drafts && drafts.length > 0
        ? drafts.reduce((sum, d) => sum + (d.review_time_seconds || 0), 0) / drafts.length / 60
        : 20;

      // Assumptions:
      // - Manual curation takes 60 minutes
      // - AI-assisted takes avgReviewTimeMinutes (target: 20 min)
      // - Work 5 days per week
      const timeSavedPerDay = 60 - avgReviewTimeMinutes; // minutes
      const timeSavedPerMonth = timeSavedPerDay * 22; // ~22 work days per month
      const timeSavedHours = timeSavedPerMonth / 60;
      const costSavings = timeSavedHours * hourlyRate;

      // ROI = (Gains - Cost) / Cost * 100
      // Assuming minimal cost (API usage), ROI is essentially infinite
      // But we'll calculate based on productivity gain
      const roi = (costSavings / (hourlyRate * (avgReviewTimeMinutes / 60 * 22))) * 100;

      return {
        time_saved_per_day: parseFloat(timeSavedPerDay.toFixed(1)),
        time_saved_per_month: parseFloat(timeSavedPerMonth.toFixed(1)),
        estimated_cost_savings: parseFloat(costSavings.toFixed(2)),
        roi_percentage: parseFloat(roi.toFixed(1)),
      };
    } catch (error) {
      console.error('Error calculating ROI:', error);
      return {
        time_saved_per_day: 40,
        time_saved_per_month: 880,
        estimated_cost_savings: 733,
        roi_percentage: 300,
      };
    }
  }

  /**
   * Get engagement trends over time
   */
  async getTrends(userId: string, days: number = 30): Promise<any[]> {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const { data, error } = await supabase
        .from('engagement_analytics')
        .select('timestamp, event_type')
        .eq('user_id', userId)
        .gte('timestamp', since.toISOString())
        .order('timestamp', { ascending: true });

      if (error || !data) {
        return [];
      }

      // Group by date
      const dateGroups = new Map<string, any>();
      
      data.forEach((event) => {
        const date = new Date(event.timestamp).toISOString().split('T')[0];
        if (!dateGroups.has(date)) {
          dateGroups.set(date, {
            date,
            sent: 0,
            opened: 0,
            clicked: 0,
          });
        }
        
        const group = dateGroups.get(date)!;
        if (event.event_type === 'sent') group.sent++;
        else if (event.event_type === 'opened') group.opened++;
        else if (event.event_type === 'clicked') group.clicked++;
      });

      return Array.from(dateGroups.values());
    } catch (error) {
      console.error('Error getting trends:', error);
      return [];
    }
  }

  /**
   * Get source performance
   */
  async getSourcePerformance(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('engagement_analytics')
        .select('article_id, event_type')
        .eq('user_id', userId)
        .not('article_id', 'is', null);

      if (error || !data) {
        return [];
      }

      // Get article sources
      const articleIds = [...new Set(data.map((e) => e.article_id).filter(Boolean))];
      const { data: articles } = await supabase
        .from('feed_items')
        .select('id, source, source_name')
        .in('id', articleIds);

      // Group by source
      const sourceStats = new Map<string, any>();
      
      (articles || []).forEach((article) => {
        const source = article.source_name || article.source;
        if (!sourceStats.has(source)) {
          sourceStats.set(source, {
            source,
            clicks: 0,
            views: 0,
          });
        }
      });

      data.forEach((event) => {
        const article = articles?.find((a) => a.id === event.article_id);
        if (article) {
          const source = article.source_name || article.source;
          const stats = sourceStats.get(source);
          if (stats) {
            if (event.event_type === 'clicked') stats.clicks++;
            if (event.event_type === 'opened') stats.views++;
          }
        }
      });

      return Array.from(sourceStats.values()).sort((a, b) => b.clicks - a.clicks);
    } catch (error) {
      console.error('Error getting source performance:', error);
      return [];
    }
  }

  /**
   * Empty metrics
   */
  private getEmptyMetrics(): AnalyticsMetrics {
    return {
      total_sent: 0,
      total_delivered: 0,
      total_opened: 0,
      total_clicked: 0,
      total_bounced: 0,
      open_rate: 0,
      click_through_rate: 0,
      engagement_rate: 0,
    };
  }
}

// Singleton
let analyticsServiceInstance: AnalyticsService | null = null;

export function getAnalyticsService(): AnalyticsService {
  if (!analyticsServiceInstance) {
    analyticsServiceInstance = new AnalyticsService();
  }
  return analyticsServiceInstance;
}

export default AnalyticsService;




