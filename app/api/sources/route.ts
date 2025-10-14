/**
 * API Route: /api/sources
 * Manage user custom sources (Twitter, YouTube, RSS)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCustomSourcesService } from '@/lib/custom-sources-service';
import { supabase } from '@/lib/supabase';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Helper function to get user from JWT cookie
async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    return null;
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload.userId as string;
  } catch (error) {
    return null;
  }
}

// GET - List all sources for user
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const service = getCustomSourcesService();
    const sources = await service.getUserSources(userId);
    const stats = await service.getSourceStats(userId);

    return NextResponse.json({ success: true, sources, stats });
  } catch (error: any) {
    console.error('Error in GET /api/sources:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch sources' },
      { status: 500 }
    );
  }
}

// POST - Add a new source
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { source_type, source_identifier, source_name, priority_weight } = body;

    if (!source_type || !source_identifier) {
      return NextResponse.json(
        { error: 'source_type and source_identifier are required' },
        { status: 400 }
      );
    }

    const service = getCustomSourcesService();
    const result = await service.addSource(userId, {
      source_type,
      source_identifier,
      source_name,
      priority_weight,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, source: result.source }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/sources:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add source' },
      { status: 500 }
    );
  }
}
