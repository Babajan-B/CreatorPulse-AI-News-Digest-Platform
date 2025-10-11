// API Route: Search social media content
import { NextRequest, NextResponse } from 'next/server';
import { socialMediaService } from '@/lib/social-media-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '25');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Search query is required',
        data: [],
        count: 0,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    console.log(`🔍 Searching social media for: "${query}" (limit: ${limit})`);

    const results = await socialMediaService.searchPosts(query.trim(), limit);

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
      query: query.trim(),
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error searching social media:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to search social media',
      data: [],
      count: 0,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
