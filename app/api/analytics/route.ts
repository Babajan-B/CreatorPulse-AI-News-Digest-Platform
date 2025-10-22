/**
 * API Route: /api/analytics
 * Get analytics overview
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsService } from '@/lib/analytics-service';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const hourlyRate = parseFloat(searchParams.get('hourly_rate') || '50');

    const analytics = getAnalyticsService();
    
    const overview = await analytics.getOverview(user.id, days);
    const articlePerformance = await analytics.getArticlePerformance(user.id, days);
    const sourcePerformance = await analytics.getSourcePerformance(user.id);
    const roi = await analytics.calculateROI(user.id, hourlyRate);
    const trends = await analytics.getTrends(user.id, days);

    return NextResponse.json({
      overview,
      article_performance: articlePerformance,
      source_performance: sourcePerformance,
      roi,
      trends,
    });
  } catch (error: any) {
    console.error('Error in GET /api/analytics:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}





