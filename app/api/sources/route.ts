import { NextResponse } from 'next/server';
import { loadConfig } from '@/lib/rss-parser';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = await loadConfig();
    
    const sources = config.data_sources.map(source => ({
      name: source.name,
      type: source.type,
      enabled: source.enabled,
      url: source.url,
    }));
    
    const stats = {
      total: sources.length,
      enabled: sources.filter(s => s.enabled).length,
      disabled: sources.filter(s => !s.enabled).length,
      byType: {
        rss: sources.filter(s => s.type === 'rss').length,
        website: sources.filter(s => s.type === 'website').length,
        twitter: sources.filter(s => s.type === 'twitter').length,
        bluesky: sources.filter(s => s.type === 'bluesky').length,
      },
    };
    
    return NextResponse.json({
      success: true,
      sources,
      stats,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to load sources',
      },
      { status: 500 }
    );
  }
}

