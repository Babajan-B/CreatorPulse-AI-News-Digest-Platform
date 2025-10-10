import { NextRequest, NextResponse } from 'next/server';
import { supabase as supabaseClient } from '@/lib/supabase';
import { sendEmail } from '@/lib/email-service';
import { generateArticleEmail } from '@/lib/email-templates';
import { processArticleWithAI } from '@/lib/llm-service';
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
    const { title, summary, url, source, publishedAt } = body;

    if (!title || !summary || !url) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log(`📧 Sending article via email...`);
    console.log(`   To: ${user.email}`);
    console.log(`   Article: ${title.substring(0, 60)}...`);

    // Process article with AI to get enhanced summary
    const aiResult = await processArticleWithAI({
      title,
      summary,
      url,
      source: source || 'Unknown',
    });

    const aiSummary = aiResult?.aiSummary || summary.substring(0, 200);

    // Limit summary to 300 words
    const words = summary.split(' ');
    const limitedSummary = words.length > 300 
      ? words.slice(0, 300).join(' ') + '...' 
      : summary;

    // Generate email HTML
    const emailHtml = generateArticleEmail(
      {
        title,
        aiSummary,
        summary: limitedSummary,
        url,
        source: source || 'Unknown',
        publishedAt: publishedAt || new Date().toISOString(),
      },
      user.name || 'Reader'
    );

    // Send via MailerSend
    const emailResult = await sendEmail({
      to: user.email,
      toName: user.name,
      subject: `📰 ${title.substring(0, 70)}${title.length > 70 ? '...' : ''}`,
      html: emailHtml,
    });

    if (!emailResult.success) {
      return NextResponse.json({
        success: false,
        error: emailResult.error,
      });
    }

    // Log to delivery_logs
    await supabaseClient
      .from('delivery_logs')
      .insert({
        digest_id: null,
        delivery_type: 'email',
        status: 'sent',
        recipient: (emailResult as any).actualRecipient || user.email,
        subject: title.substring(0, 100),
        attempted_at: new Date().toISOString(),
        delivered_at: new Date().toISOString(),
        external_id: emailResult.messageId,
        response_data: {
          provider: 'mailersend',
          message_id: emailResult.messageId,
          article_url: url,
          has_ai_summary: !!aiResult,
        },
      });

    console.log(`✅ Article email sent successfully!`);

    return NextResponse.json({
      success: true,
      message: 'Article sent via email!',
      email: {
        to: (emailResult as any).actualRecipient || user.email,
        subject: title.substring(0, 70),
        messageId: emailResult.messageId,
      },
    });

  } catch (error: any) {
    console.error('Send article error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send article' },
      { status: 500 }
    );
  }
}

