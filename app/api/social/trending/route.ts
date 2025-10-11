// API Route: Get trending social media content
import { NextRequest, NextResponse } from 'next/server';
import { socialMediaService } from '@/lib/social-media-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const platform = searchParams.get('platform') as 'reddit' | 'linkedin' | null;
    const category = searchParams.get('category') || null;

    console.log(`📱 Fetching trending content - limit: ${limit}, platform: ${platform}, category: ${category}`);

    let result;

    if (platform) {
      // Get posts from specific platform
      result = await socialMediaService.getPostsByPlatform(platform, limit);
    } else if (category) {
      // Get posts by category
      result = await socialMediaService.getPostsByCategory(category, limit);
    } else {
      // Get all trending content
      const trendingContent = await socialMediaService.getTrendingContent(limit);
      result = trendingContent.combined;
    }

    return NextResponse.json({
      success: true,
      data: result,
      count: result.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching trending content:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch trending content',
      data: [],
      count: 0,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
