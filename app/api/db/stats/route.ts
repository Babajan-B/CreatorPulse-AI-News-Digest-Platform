import { NextResponse } from 'next/server';
import { supabase as supabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get feed items count
    const { count: feedCount } = await supabaseClient
      .from('feed_items')
      .select('*', { count: 'exact', head: true });

    // Get recent items (last 24h)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { count: recentCount } = await supabaseClient
      .from('feed_items')
      .select('*', { count: 'exact', head: true })
      .gte('published_at', oneDayAgo.toISOString());

    // Get source breakdown
    const { data: sources } = await supabaseClient
      .from('feed_items')
      .select('source_name');

    const sourceBreakdown: Record<string, number> = {};
    sources?.forEach((item: any) => {
      sourceBreakdown[item.source_name] = (sourceBreakdown[item.source_name] || 0) + 1;
    });

    // Get average score
    const { data: scores } = await supabaseClient
      .from('item_scores')
      .select('final_score');

    const avgScore = scores && scores.length > 0
      ? scores.reduce((acc: number, s: any) => acc + (s.final_score || 0), 0) / scores.length
      : 0;

    return NextResponse.json({
      success: true,
      database: 'supabase',
      stats: {
        total: feedCount || 0,
        recent: recentCount || 0,
        sources: Object.entries(sourceBreakdown).map(([name, count]) => ({ name, count })),
        avgScore: avgScore.toFixed(2),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        database: 'supabase',
        error: error.message,
        stats: { total: 0, recent: 0, sources: [], avgScore: 0 },
      },
      { status: 200 } // Return 200 even on error for graceful handling
    );
  }
}

