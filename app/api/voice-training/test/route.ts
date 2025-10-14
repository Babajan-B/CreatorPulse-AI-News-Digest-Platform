/**
 * API Route: /api/voice-training/test
 * Test voice generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getVoiceTrainer } from '@/lib/voice-trainer';
import { getVoiceMatcher } from '@/lib/voice-matcher';
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

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { topic, key_points } = body;
    const test_topic = topic || 'artificial intelligence breakthroughs';

    const trainer = getVoiceTrainer();
    const profile = await trainer.getVoiceProfile(userId);

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Voice profile not found. Please train your voice first.' },
        { status: 404 }
      );
    }

    const samples = await trainer.getUserSamples(userId);
    const sampleTexts = samples.map((s) => s.content);

    const matcher = getVoiceMatcher();
    const result = await matcher.testVoiceGeneration(profile, sampleTexts, test_topic);

    return NextResponse.json({
      success: true,
      generated_content: result.generated,
      voice_match_score: result.score,
      profile_summary: {
        avg_sentence_length: profile.avgSentenceLength,
        tone: profile.toneMarkers.join(', '),
        vocabulary: profile.vocabularyLevel,
        sample_count: profile.sample_count,
      },
    });
  } catch (error: any) {
    console.error('Error in POST /api/voice-training/test:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to test voice generation' },
      { status: 500 }
    );
  }
}

