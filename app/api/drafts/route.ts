/**
 * API Route: /api/drafts
 * Manage newsletter drafts
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDraftGenerator } from '@/lib/draft-generator';
import { supabase as supabaseClient } from '@/lib/supabase';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

// Helper to get user from JWT token
async function getUserFromToken(request: NextRequest): Promise<{ id: string; email: string } | null> {
  try {
    // Try to get token from Authorization header or cookie
    let token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      token = request.cookies.get('auth-token')?.value;
    }
    
    if (!token) {
      return null;
    }

    // Verify JWT
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    return {
      id: payload.userId as string,
      email: payload.email as string
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// GET - List user's drafts
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      // Return empty drafts for unauthenticated users (guest mode)
      return NextResponse.json({ 
        success: true,
        drafts: [], 
        count: 0,
        message: 'Login to view your drafts' 
      });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20');

    const generator = getDraftGenerator();
    const drafts = await generator.getUserDrafts(user.id, { status, limit });

    return NextResponse.json({ success: true, drafts, count: drafts.length });
  } catch (error: any) {
    console.error('Error in GET /api/drafts:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch drafts' },
      { status: 500 }
    );
  }
}

// POST - Generate new draft
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: 'Please login to generate drafts',
        needsAuth: true 
      }, { status: 401 });
    }

    const body = await request.json();
    const { 
      article_ids, 
      max_articles = 10, 
      include_trends = true, 
      mode,
      content_type,
      customization 
    } = body;

    // Check if this is a new-style request (with content_type) or old-style
    const isNewStyle = !!content_type;

    // Get user's preferred mode from settings if not provided
    let userMode = mode || 'ai_news';
    
    if (!mode && !isNewStyle) {
      const { data: settings } = await supabaseClient
        .from('user_settings')
        .select('preferred_mode')
        .eq('user_id', user.id)
        .single();
      
      userMode = settings?.preferred_mode || 'ai_news';
    }

    const generator = getDraftGenerator();
    
    // Use new content generation if content_type is provided
    if (isNewStyle) {
      const result = await generator.generateContentDraft(user.id, {
        articleIds: article_ids,
        contentType: content_type,
        customization: customization || {
          tone: 'professional',
          length: 'medium',
          targetAudience: [],
          includeTrends: true,
          includeStats: true,
          includeCTA: true,
          ctaType: 'subscribe',
          useVoiceMatching: true,
        },
      });

      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }

      return NextResponse.json({ success: true, draft: result.draft }, { status: 201 });
    }

    // Fall back to old-style newsletter generation
    const result = await generator.generateDraft(user.id, {
      articleIds: article_ids,
      maxArticles: max_articles,
      includeTrends: include_trends,
      mode: userMode as 'ai_news' | 'science_breakthrough',
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, draft: result.draft }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/drafts:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate draft' },
      { status: 500 }
    );
  }
}




