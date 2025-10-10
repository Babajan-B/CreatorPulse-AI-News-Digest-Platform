import { NextRequest, NextResponse } from 'next/server';
import { supabase as supabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') || '30';
    const limitNumber = parseInt(limit, 10);

    // Get feed items grouped by date
    const { data: items, error } = await supabaseClient
      .from('feed_items')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(limitNumber);

    if (error) {
      console.error('Error fetching history:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        history: [],
      });
    }

    // Group items by date
    const groupedByDate: Record<string, any[]> = {};
    items?.forEach(item => {
      const date = new Date(item.published_at).toISOString().split('T')[0];
      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }
      groupedByDate[date].push(item);
    });

    // Create history entries
    const history = Object.entries(groupedByDate).map(([date, dateItems]) => {
      // Calculate average quality (mock for now, can be from item_scores)
      const avgQuality = dateItems.length > 0 
        ? (Math.random() * 2 + 7).toFixed(1) // 7.0 - 9.0 range
        : 0;

      // Extract top topics
      const allTags = dateItems.flatMap(item => item.tags || []);
      const tagCounts: Record<string, number> = {};
      allTags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
      
      const topTopics = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag]) => tag);

      // Get unique sources
      const sources = [...new Set(dateItems.map(item => item.source_name))];

      return {
        id: date,
        date: date,
        articlesCount: dateItems.length,
        averageQuality: parseFloat(avgQuality),
        topTopics: topTopics.length > 0 ? topTopics : ['AI', 'Technology'],
        status: 'completed' as const,
        sources: sources,
        items: dateItems.slice(0, 5).map(item => ({
          id: item.id,
          title: item.title,
          source: item.source_name,
          url: item.url,
          publishedAt: item.published_at,
          imageUrl: item.image_url,
        })),
      };
    });

    return NextResponse.json({
      success: true,
      count: history.length,
      history: history.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    });

  } catch (error: any) {
    console.error('API Error fetching history:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch history',
        history: [],
      },
      { status: 500 }
    );
  }
}

