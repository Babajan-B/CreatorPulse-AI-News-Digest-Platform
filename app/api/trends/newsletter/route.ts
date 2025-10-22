/**
 * API Route: /api/trends/newsletter
 * Get top 3 trends for newsletter
 */

import { NextResponse } from 'next/server';
import { getTrendDetectionService } from '@/lib/trend-detection-service';

export async function GET() {
  try {
    const service = getTrendDetectionService();
    const trends = await service.getTopTrendsForNewsletter();

    const trendsWithExplainers = trends.map((trend) => ({
      ...trend,
      explainer: service.generateTrendExplainer(trend),
    }));

    return NextResponse.json({
      trends: trendsWithExplainers,
      count: trendsWithExplainers.length,
    });
  } catch (error: any) {
    console.error('Error in GET /api/trends/newsletter:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch newsletter trends' },
      { status: 500 }
    );
  }
}





