import { NextRequest, NextResponse } from 'next/server';
import { supabase as supabaseClient } from '@/lib/supabase';
import { processArticleWithAI } from '@/lib/llm-service';
import { jwtVerify } from 'jose';

export const dynamic = 'force-dynamic';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const { data: user } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', payload.userId)
      .single();
    return user;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { limit = 5 } = await request.json().catch(() => ({}));

    console.log(`📰 Generating daily digest for ${user.email} (${limit} articles)...`);

    // Get top articles from last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { data: articles, error } = await supabaseClient
      .from('feed_items')
      .select('*')
      .gte('published_at', oneDayAgo.toISOString())
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error || !articles || articles.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No articles available for digest',
      });
    }

    console.log(`Processing ${articles.length} articles with AI...`);

    // Process each article with AI
    const processedArticles = [];
    for (const article of articles) {
      const aiResult = await processArticleWithAI({
        title: article.title,
        summary: article.summary || '',
        url: article.url,
        source: article.source_name,
      });

      processedArticles.push({
        id: article.id,
        title: article.title,
        summary: article.summary?.substring(0, 300) || '',
        aiSummary: aiResult?.aiSummary || article.summary?.substring(0, 200) || '',
        bulletPoints: aiResult?.bulletPoints || [],
        hashtags: aiResult?.hashtags || [],
        url: article.url,
        source: article.source_name,
        publishedAt: article.published_at,
        imageUrl: article.image_url,
      });
    }

    console.log(`✅ Processed ${processedArticles.length} articles with AI`);

    // Create digest in database
    const today = new Date().toISOString().split('T')[0];
    const { data: digest, error: digestError } = await supabaseClient
      .from('digests')
      .insert({
        user_id: user.id,
        title: `Daily AI News Digest - ${new Date().toLocaleDateString()}`,
        digest_date: today,
        status: 'generated',
        total_items: processedArticles.length,
        generated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (digestError) {
      console.error('Error creating digest:', digestError);
    }

    return NextResponse.json({
      success: true,
      digest: {
        id: digest?.id,
        articles: processedArticles,
        count: processedArticles.length,
        date: today,
      },
    });

  } catch (error: any) {
    console.error('Digest generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate digest' },
      { status: 500 }
    );
  }
}

