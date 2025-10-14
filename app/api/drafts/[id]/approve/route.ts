/**
 * API Route: /api/drafts/[id]/approve
 * Approve and send draft via email
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDraftGenerator } from '@/lib/draft-generator';
import { sendEmail } from '@/lib/email-service';
import { generateNewsletterDraftEmail } from '@/lib/email-templates';
import { supabase as supabaseClient } from '@/lib/supabase';
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: 'Please login to approve drafts',
        needsAuth: true 
      }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { review_time_seconds } = body;

    // Get draft content
    const generator = getDraftGenerator();
    const draft = await generator.getDraft(id);

    if (!draft) {
      return NextResponse.json(
        { success: false, error: 'Draft not found' },
        { status: 404 }
      );
    }

    // Get user details
    const { data: userData } = await supabaseClient
      .from('users')
      .select('email, name')
      .eq('id', user.id)
      .single();

    if (!userData) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    console.log(`📧 Sending newsletter draft to ${userData.email}...`);
    console.log(`   Draft: ${draft.title}`);
    console.log(`   Articles: ${draft.curated_articles?.length || 0}`);

    // Generate email HTML from draft
    const emailHtml = generateNewsletterDraftEmail({
      draft,
      userName: userData.name || 'Reader'
    });

    // Send email via MailerSend
    const emailResult = await sendEmail({
      to: userData.email,
      toName: userData.name,
      subject: `📬 ${draft.title}`,
      html: emailHtml,
    });

    if (!emailResult.success) {
      return NextResponse.json({
        success: false,
        error: `Failed to send email: ${emailResult.error}`,
      }, { status: 500 });
    }

    // Approve draft and mark as sent
    const approveSuccess = await generator.approveDraft(id, review_time_seconds || 0);
    
    if (approveSuccess && emailResult.messageId) {
      await generator.markAsSent(id, emailResult.messageId);
    }

    // Log delivery
    await supabaseClient
      .from('delivery_logs')
      .insert({
        digest_id: id,
        delivery_type: 'email',
        status: 'sent',
        recipient: (emailResult as any).actualRecipient || userData.email,
        subject: draft.title,
        attempted_at: new Date().toISOString(),
        delivered_at: new Date().toISOString(),
        external_id: emailResult.messageId,
        response_data: {
          provider: 'mailersend',
          message_id: emailResult.messageId,
          article_count: draft.curated_articles?.length || 0,
          review_time_seconds,
        },
      });

    console.log(`✅ Newsletter draft sent successfully!`);

    return NextResponse.json({ 
      success: true,
      message: 'Draft approved and sent via email!',
      email: {
        to: (emailResult as any).actualRecipient || userData.email,
        messageId: emailResult.messageId,
        articleCount: draft.curated_articles?.length || 0,
      }
    });
  } catch (error: any) {
    console.error('Error in POST /api/drafts/[id]/approve:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to approve draft' },
      { status: 500 }
    );
  }
}




