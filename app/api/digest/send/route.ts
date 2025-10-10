import { NextRequest, NextResponse } from 'next/server';
import { supabase as supabaseClient } from '@/lib/supabase';
import { sendEmail } from '@/lib/email-service';
import { generateDailyDigestEmail } from '@/lib/email-templates';
import { jwtVerify } from 'jose';

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

    const body = await request.json();
    const { articles } = body;

    if (!articles || articles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No articles provided' },
        { status: 400 }
      );
    }

    console.log(`📧 Sending daily digest email to ${user.email}...`);
    console.log(`   Articles: ${articles.length}`);

    // Generate email HTML
    const emailHtml = generateDailyDigestEmail(articles, user.name || 'Reader');

    // Send via MailerSend
    const emailResult = await sendEmail({
      to: user.email,
      toName: user.name,
      subject: `🎯 Your Daily AI Digest - ${articles.length} Top Articles (${new Date().toLocaleDateString()})`,
      html: emailHtml,
    });

    if (!emailResult.success) {
      return NextResponse.json({
        success: false,
        error: emailResult.error,
      });
    }

    // Log to delivery_logs
    const { error: logError } = await supabaseClient
      .from('delivery_logs')
      .insert({
        digest_id: null,
        delivery_type: 'email',
        status: 'sent',
        recipient: (emailResult as any).actualRecipient || user.email,
        subject: `Daily AI Digest - ${articles.length} Articles`,
        attempted_at: new Date().toISOString(),
        delivered_at: new Date().toISOString(),
        external_id: emailResult.messageId,
        response_data: {
          provider: 'mailersend',
          message_id: emailResult.messageId,
          article_count: articles.length,
        },
      });

    if (logError) {
      console.error('Error logging delivery:', logError);
    }

    console.log(`✅ Daily digest sent successfully!`);

    return NextResponse.json({
      success: true,
      message: 'Daily digest sent successfully!',
      email: {
        to: (emailResult as any).actualRecipient || user.email,
        subject: `Daily AI Digest - ${articles.length} Articles`,
        messageId: emailResult.messageId,
        articleCount: articles.length,
      },
    });

  } catch (error: any) {
    console.error('Send digest error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send digest' },
      { status: 500 }
    );
  }
}

