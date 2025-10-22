/**
 * API Route: /api/sources/fetch
 * Fetch content from user's custom sources
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCustomSourcesService } from '@/lib/custom-sources-service';
import { supabase } from '@/lib/supabase';

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

    const service = getCustomSourcesService();
    const content = await service.fetchAllContent(user.id);

    return NextResponse.json({
      content,
      count: content.length,
      fetched_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in POST /api/sources/fetch:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch content from sources' },
      { status: 500 }
    );
  }
}





