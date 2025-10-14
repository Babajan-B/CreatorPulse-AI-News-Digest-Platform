/**
 * API Route: /api/drafts/[id]
 * Manage individual draft
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDraftGenerator } from '@/lib/draft-generator';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

// Helper to get user from JWT token
async function getUserFromToken(request: NextRequest): Promise<{ id: string; email: string } | null> {
  try {
    let token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      token = request.cookies.get('auth-token')?.value;
    }
    
    if (!token) {
      return null;
    }

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

// GET - Get single draft
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: 'Please login to view drafts',
        needsAuth: true 
      }, { status: 401 });
    }

    const { id } = await params;
    const generator = getDraftGenerator();
    const draft = await generator.getDraft(id);

    if (!draft) {
      return NextResponse.json({ 
        success: false,
        error: 'Draft not found' 
      }, { status: 404 });
    }

    if (draft.user_id !== user.id) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized access to this draft' 
      }, { status: 403 });
    }

    return NextResponse.json({ success: true, draft });
  } catch (error: any) {
    console.error('Error in GET /api/drafts/[id]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch draft' },
      { status: 500 }
    );
  }
}

// PUT - Update draft
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: 'Please login to update drafts',
        needsAuth: true 
      }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const generator = getDraftGenerator();
    const success = await generator.updateDraft(id, body);

    if (!success) {
      return NextResponse.json({ 
        success: false,
        error: 'Failed to update draft' 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in PUT /api/drafts/[id]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update draft' },
      { status: 500 }
    );
  }
}

// DELETE - Delete draft
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: 'Please login to delete drafts',
        needsAuth: true 
      }, { status: 401 });
    }

    const { id } = await params;
    const generator = getDraftGenerator();
    const success = await generator.deleteDraft(id, user.id);

    if (!success) {
      return NextResponse.json({ 
        success: false,
        error: 'Failed to delete draft' 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/drafts/[id]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete draft' },
      { status: 500 }
    );
  }
}




