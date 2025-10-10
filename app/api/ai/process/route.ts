import { NextRequest, NextResponse } from 'next/server';
import { processArticleWithAI } from '@/lib/llm-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, summary, url, source } = body;

    if (!title || !summary) {
      return NextResponse.json(
        { success: false, error: 'Title and summary are required' },
        { status: 400 }
      );
    }

    console.log('🤖 Processing article with Groq (Llama 3.3 70B)...');
    console.log('   Title:', title.substring(0, 60) + '...');

    const result = await processArticleWithAI({
      title,
      summary,
      url: url || '',
      source: source || 'Unknown',
    });

    if (!result) {
      return NextResponse.json({
        success: false,
        error: 'AI processing failed or not configured',
      });
    }

    console.log('✅ AI processing complete');
    console.log('   Summary:', result.aiSummary.substring(0, 100) + '...');
    console.log('   Bullets:', result.bulletPoints.length);
    console.log('   Hashtags:', result.hashtags.length);

    return NextResponse.json({
      success: true,
      result: {
        aiSummary: result.aiSummary,
        bulletPoints: result.bulletPoints,
        hashtags: result.hashtags,
      },
      model: 'llama-3.3-70b-versatile',
      provider: 'Groq',
    });

  } catch (error: any) {
    console.error('AI processing error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'AI processing failed',
      },
      { status: 500 }
    );
  }
}

