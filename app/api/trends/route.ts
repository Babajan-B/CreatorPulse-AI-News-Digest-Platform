/**
 * API Route: /api/trends
 * Fetch trending topics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTrendDetectionService } from '@/lib/trend-detection-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const service = getTrendDetectionService();
    const trends = await service.getTrendingTopics(limit);

    return NextResponse.json({ trends, count: trends.length });
  } catch (error: any) {
    console.error('Error in GET /api/trends:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch trends' },
      { status: 500 }
    );
  }
}

// POST - Manually trigger trend detection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { timeWindow = '24h', minArticleCount = 3, topN = 10 } = body;

    const service = getTrendDetectionService();
    const trends = await service.detectTrends({
      timeWindow,
      minArticleCount,
      topN,
    });

    return NextResponse.json({
      trends,
      count: trends.length,
      detected_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in POST /api/trends:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to detect trends' },
      { status: 500 }
    );
  }
}





