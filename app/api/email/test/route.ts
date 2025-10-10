import { NextRequest, NextResponse } from 'next/server';
import { supabase as supabaseClient } from '@/lib/supabase';
import { jwtVerify } from 'jose';
import { sendEmail, generateTestEmailTemplate } from '@/lib/email-service';

export const dynamic = 'force-dynamic';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const { data: user } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', payload.userId)
      .single();
    return user;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user settings for digest time
    const { data: settings } = await supabaseClient
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Format digest time for display
    const digestTime = settings?.digest_time || '09:00:00';
    const [hours, minutes] = digestTime.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const formattedTime = `${displayHour}:${minutes} ${ampm}`;

    // Generate email HTML template
    const emailHtml = generateTestEmailTemplate({
      name: user.name,
      email: user.email,
      digestTime: formattedTime,
      timezone: settings?.timezone || 'America/New_York',
      autoSend: settings?.auto_send_email || false,
    });

    // Send email via MailerSend
    const emailResult = await sendEmail({
      to: user.email,
      toName: user.name,
      subject: '🎉 CreatorPulse Test Email - Your Daily Digest Setup',
      html: emailHtml,
    });

    if (!emailResult.success) {
      console.error('MailerSend error:', emailResult.error);
      
      // Fallback: log email for debugging
      console.log('📧 Email would have been sent to:', user.email);
      console.log('Subject: 🎉 CreatorPulse Test Email - Your Daily Digest Setup');
      
      return NextResponse.json({
        success: false,
        error: emailResult.error,
        fallback: true,
        message: 'Email service not configured. Check MAILERSEND_API_KEY in .env.local',
      });
    }

    // Log successful email
    const actualRecipient = (emailResult as any).actualRecipient || user.email;
    console.log('✅ Email sent via MailerSend');
    console.log('   Intended for:', user.email);
    console.log('   Delivered to:', actualRecipient, '(MailerSend trial restriction)');
    console.log('   Message ID:', emailResult.messageId);

    // Save to delivery logs
    const { error: logError } = await supabaseClient
      .from('delivery_logs')
      .insert({
        digest_id: null, // This is a test email, not linked to a digest
        delivery_type: 'email',
        status: 'sent',
        recipient: actualRecipient,
        subject: '🎉 CreatorPulse Test Email - Your Daily Digest Setup',
        attempted_at: new Date().toISOString(),
        delivered_at: new Date().toISOString(),
        external_id: emailResult.messageId,
        response_data: { 
          test: true, 
          user_id: user.id, 
          provider: 'mailersend',
          message_id: emailResult.messageId,
          intended_recipient: user.email,
          actual_recipient: actualRecipient,
        },
      });

    if (logError) {
      console.error('Error logging delivery:', logError);
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully via MailerSend!',
      email: {
        to: actualRecipient,
        intendedFor: user.email,
        subject: '🎉 CreatorPulse Test Email - Your Daily Digest Setup',
        previewText: `Your daily digest is set to arrive at ${formattedTime}`,
        messageId: emailResult.messageId,
        provider: 'MailerSend',
        note: actualRecipient !== user.email ? 'Sent to admin email (trial account restriction)' : null,
      },
      settings: {
        digest_time: formattedTime,
        timezone: settings?.timezone,
        auto_send_email: settings?.auto_send_email,
      },
    });

  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send test email' },
      { status: 500 }
    );
  }
}

