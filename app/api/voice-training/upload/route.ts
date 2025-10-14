/**
 * API Route: /api/voice-training/upload
 * Upload newsletter samples (CSV or text)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getVoiceTrainer } from '@/lib/voice-trainer';
import { jwtVerify } from 'jose';
import Papa from 'papaparse';

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
    const { csv_content, text_samples, format = 'csv' } = body;

    let samples: any[] = [];

    if (format === 'csv' && csv_content) {
      // Parse CSV
      const parsed = Papa.parse(csv_content, {
        header: true,
        skipEmptyLines: true,
      });

      if (parsed.errors.length > 0) {
        return NextResponse.json(
          { error: 'Invalid CSV format' },
          { status: 400 }
        );
      }

      samples = parsed.data.map((row: any) => ({
        title: row.title || row.subject || '',
        content: row.content || row.body || '',
        published_date: row.date || row.published_date || null,
      }));
    } else if (format === 'text' && text_samples) {
      // Parse text samples (array of objects)
      samples = text_samples.map((sample: any) => ({
        title: sample.title || '',
        content: sample.content || '',
        published_date: sample.date || null,
      }));
    } else {
      return NextResponse.json(
        { error: 'Invalid format or missing content' },
        { status: 400 }
      );
    }

    // Filter out invalid samples
    samples = samples.filter((s) => s.content && s.content.length > 100);

    if (samples.length === 0) {
      return NextResponse.json(
        { error: 'No valid samples found' },
        { status: 400 }
      );
    }

    // Train voice
    const trainer = getVoiceTrainer();
    const result = await trainer.trainVoice(userId, samples);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      samples_processed: samples.length,
      profile: result.profile,
    });
  } catch (error: any) {
    console.error('Error in POST /api/voice-training/upload:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload samples' },
      { status: 500 }
    );
  }
}

