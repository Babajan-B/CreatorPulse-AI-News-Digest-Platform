import { NextRequest, NextResponse } from 'next/server';
import { supabase as supabaseClient } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, digestTime = '09:00:00', timezone = 'America/New_York' } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseClient
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const { data: newUser, error: userError } = await supabaseClient
      .from('users')
      .insert({
        email,
        name: name || email.split('@')[0],
        password_hash: passwordHash,
        email_verified: false,
        is_active: true,
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating user:', userError);
      return NextResponse.json(
        { success: false, error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Create user settings
    const { error: settingsError } = await supabaseClient
      .from('user_settings')
      .insert({
        user_id: newUser.id,
        timezone,
        digest_time: digestTime,
        auto_send_email: true,
        email_notifications: true,
      });

    if (settingsError) {
      console.error('Error creating settings:', settingsError);
    }

    // Return user info (without password)
    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    });

  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Signup failed' },
      { status: 500 }
    );
  }
}

