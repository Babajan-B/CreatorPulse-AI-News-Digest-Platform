/**
 * API Route: /api/feedback
 * Submit and analyze feedback
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFeedbackAnalyzer } from '@/lib/feedback-analyzer';
import { supabase } from '@/lib/supabase';

// POST - Submit feedback
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    
    const analyzer = getFeedbackAnalyzer();
    const success = await analyzer.submitFeedback({
      user_id: user.id,
      ...body,
    });

    if (!success) {
      return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in POST /api/feedback:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

// GET - Get insights
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const analyzer = getFeedbackAnalyzer();
    const insights = await analyzer.getInsights(user.id);

    return NextResponse.json({ insights });
  } catch (error: any) {
    console.error('Error in GET /api/feedback:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch insights' },
      { status: 500 }
    );
  }
}





