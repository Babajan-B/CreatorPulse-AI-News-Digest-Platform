import { NextRequest, NextResponse } from 'next/server';
import { fetchAllRSSFeeds } from '@/lib/rss-parser';
import { saveFeedItems, getRecentFeedItems, type FeedItem } from '@/lib/db-complete';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit');
    const useCache = searchParams.get('cache') === 'true';
    const limitNumber = limit ? parseInt(limit, 10) : 50;
    
    console.log(`API: Fetching articles (limit: ${limitNumber}, cache: ${useCache})...`);
    
    // Try to get from Supabase database first if cache is enabled
    if (useCache) {
      const dbResult = await getRecentFeedItems(7, limitNumber);
      if (dbResult.success && dbResult.items.length > 0) {
        console.log(`📦 Returning ${dbResult.items.length} articles from Supabase`);
        return NextResponse.json({
          success: true,
          count: dbResult.items.length,
          articles: dbResult.items.map((item: any) => ({
            id: item.id,
            title: item.title,
            summary: item.summary,
            url: item.url,
            source: item.source_name,
            sourceLogo: item.source_logo,
            qualityScore: 8.0, // Will be from scores table later
            publishedAt: item.published_at,
            author: item.author,
            imageUrl: item.image_url,
            tags: item.tags || [],
          })),
          cached: true,
          database: 'supabase',
        });
      }
    }
    
    // Fetch from RSS feeds
    const articles = await fetchAllRSSFeeds(limitNumber);
    
    // Save to Supabase as feed_items (MUST WAIT to get database IDs)
    if (articles.length > 0) {
      const feedItems: FeedItem[] = articles.map(a => ({
        id: a.id,
        title: a.title,
        summary: a.summary,
        url: a.url,
        source_name: a.source,
        source_url: a.url, // Original source URL
        source_type: 'rss',
        source_logo: a.sourceLogo,
        author: a.author,
        published_at: a.publishedAt,
        image_url: a.imageUrl,
        tags: a.tags,
      }));

      // Save and wait for database IDs
      const saveResult = await saveFeedItems(feedItems);
      if (saveResult.success) {
        console.log(`💾 Saved ${saveResult.count} items to database`);
      } else {
        console.error('Error saving feed items:', saveResult.error);
      }
      
      // Now fetch from database to get proper UUIDs
      const dbResult = await getRecentFeedItems(7, limitNumber);
      if (dbResult.success && dbResult.items.length > 0) {
        console.log(`✅ Returning ${dbResult.items.length} articles with database IDs`);
        return NextResponse.json({
          success: true,
          count: dbResult.items.length,
          articles: dbResult.items.map((item: any) => ({
            id: item.id, // This is the database UUID
            title: item.title,
            summary: item.summary,
            url: item.url,
            source: item.source_name,
            sourceLogo: item.source_logo,
            qualityScore: 8.0, // Will be from scores table later
            publishedAt: item.published_at,
            author: item.author,
            imageUrl: item.image_url,
            tags: item.tags || [],
          })),
          cached: false,
          database: 'supabase',
        });
      }
    }
    
    // Fallback: return RSS articles if database save failed
    console.warn('⚠️ Returning RSS articles without database IDs');
    return NextResponse.json({
      success: true,
      count: articles.length,
      articles,
      cached: false,
      database: 'supabase',
    });
  } catch (error: any) {
    console.error('API Error fetching articles:', error);
    
    // Try to fallback to Supabase
    try {
      const dbResult = await getRecentFeedItems(7, 50);
      if (dbResult.success && dbResult.items.length > 0) {
        console.log(`📦 Fallback: Returning ${dbResult.items.length} articles from Supabase`);
        return NextResponse.json({
          success: true,
          count: dbResult.items.length,
          articles: dbResult.items.map((item: any) => ({
            id: item.id,
            title: item.title,
            summary: item.summary,
            url: item.url,
            source: item.source_name,
            sourceLogo: item.source_logo,
            qualityScore: 8.0,
            publishedAt: item.published_at,
            author: item.author,
            imageUrl: item.image_url,
            tags: item.tags || [],
          })),
          cached: true,
          fallback: true,
          database: 'supabase',
        });
      }
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch articles',
        articles: [],
      },
      { status: 500 }
    );
  }
}

