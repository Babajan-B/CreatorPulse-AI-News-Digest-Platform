/**
 * API Route: /api/voice-training
 * Voice training management
 */

import { NextRequest, NextResponse } from 'next/server';
import { getVoiceTrainer } from '@/lib/voice-trainer';
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

// GET - Get user's voice profile and samples
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const trainer = getVoiceTrainer();
    const profile = await trainer.getVoiceProfile(userId);
    const samples = await trainer.getUserSamples(userId);

    return NextResponse.json({
      success: true,
      voice_profile: profile,
      samples,
      trained: profile !== null,
      sample_count: samples.length,
    });
  } catch (error: any) {
    console.error('Error in GET /api/voice-training:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch voice training data' },
      { status: 500 }
    );
  }
}

// POST - Train voice from samples
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { samples } = body;

    if (!samples || !Array.isArray(samples) || samples.length === 0) {
      return NextResponse.json(
        { success: false, error: 'samples array is required' },
        { status: 400 }
      );
    }

    const trainer = getVoiceTrainer();
    const result = await trainer.trainVoice(userId, samples);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      profile: result.profile,
      message: `Voice trained successfully with ${samples.length} samples`,
    });
  } catch (error: any) {
    console.error('Error in POST /api/voice-training:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to train voice' },
      { status: 500 }
    );
  }
}

// DELETE - Reset voice training
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const trainer = getVoiceTrainer();
    const success = await trainer.resetVoice(userId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to reset voice training' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/voice-training:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reset voice training' },
      { status: 500 }
    );
  }
}

