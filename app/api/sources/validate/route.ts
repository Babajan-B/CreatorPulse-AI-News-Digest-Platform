/**
 * API Route: /api/sources/validate
 * Validate a source before adding
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCustomSourcesService } from '@/lib/custom-sources-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { source_type, source_identifier } = body;

    if (!source_type || !source_identifier) {
      return NextResponse.json(
        { error: 'source_type and source_identifier are required' },
        { status: 400 }
      );
    }

    const service = getCustomSourcesService();
    const validation = await service.validateSource(source_type, source_identifier);

    if (!validation.valid) {
      return NextResponse.json(
        { valid: false, error: validation.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      suggested_name: validation.suggested_name,
    });
  } catch (error: any) {
    console.error('Error in POST /api/sources/validate:', error);
    return NextResponse.json(
      { valid: false, error: error.message || 'Validation failed' },
      { status: 500 }
    );
  }
}




