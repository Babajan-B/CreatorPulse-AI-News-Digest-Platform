// API Route: Get social media platform statistics
import { NextRequest, NextResponse } from 'next/server';
import { socialMediaService } from '@/lib/social-media-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching social media platform statistics...');

    const [platformStats, trendingHashtags, topAuthors] = await Promise.all([
      socialMediaService.getPlatformStats(),
      socialMediaService.getTrendingHashtags(20),
      socialMediaService.getTopAuthors(20)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        platforms: platformStats,
        trending_hashtags: trendingHashtags,
        top_authors: topAuthors,
        last_updated: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching social media stats:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch social media statistics',
      data: {
        platforms: {
          reddit: { active_sources: 0, total_posts: 0 },
          hackernews: { active_sources: 0, total_posts: 0 },
          lobsters: { active_sources: 0, total_posts: 0 },
          slashdot: { active_sources: 0, total_posts: 0 },
          producthunt: { active_sources: 0, total_posts: 0 },
          combined: { total_sources: 0, total_posts: 0 }
        },
        trending_hashtags: [],
        top_authors: []
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
