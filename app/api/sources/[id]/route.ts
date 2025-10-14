/**
 * API Route: /api/sources/[id]
 * Manage individual source (update, delete)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCustomSourcesService } from '@/lib/custom-sources-service';
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

// PUT - Update a source
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { source_name, priority_weight, enabled } = body;

    const service = getCustomSourcesService();
    const result = await service.updateSource(params.id, {
      source_name,
      priority_weight,
      enabled,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in PUT /api/sources/[id]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update source' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a source
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const service = getCustomSourcesService();
    const result = await service.deleteSource(params.id);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/sources/[id]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete source' },
      { status: 500 }
    );
  }
}

