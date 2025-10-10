import { NextResponse } from 'next/server';
import { testGroq } from '@/lib/llm-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('🧪 Testing Groq LLM connection...');

    const result = await testGroq();

    return NextResponse.json({
      success: result.success,
      message: result.message,
      model: 'llama-3.3-70b-versatile',
      provider: 'Groq',
      configured: !!process.env.GROQ_API_KEY,
    });

  } catch (error: any) {
    console.error('Gemini test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gemini test failed',
      },
      { status: 500 }
    );
  }
}

