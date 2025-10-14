/**
 * API Route: /api/webhooks/mailersend
 * MailerSend webhook handler for email events
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsService } from '@/lib/analytics-service';
import crypto from 'crypto';

/**
 * Verify MailerSend webhook signature
 */
function verifySignature(signature: string | null, payload: any): boolean {
  if (!signature || !process.env.MAILERSEND_WEBHOOK_SECRET) {
    return false;
  }

  try {
    const hmac = crypto.createHmac('sha256', process.env.MAILERSEND_WEBHOOK_SECRET);
    hmac.update(JSON.stringify(payload));
    const expectedSignature = hmac.digest('hex');
    
    return signature === expectedSignature;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('signature');
    const payload = await request.json();

    // Verify webhook signature (optional but recommended)
    // if (!verifySignature(signature, payload)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    const analytics = getAnalyticsService();

    // Process webhook event
    const { type, data } = payload;

    if (!type || !data) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Extract event data
    const emailId = data.email?.message_id || data.message_id;
    const recipient = data.email?.recipient?.email || data.recipient;
    const timestamp = data.timestamp || new Date().toISOString();

    // Map MailerSend event types to our system
    let eventType = type.replace('activity.', '');
    
    // Get user ID from email metadata (if available)
    // You would typically include user_id in the email's custom headers or tags
    const userId = data.email?.tags?.find((t: string) => t.startsWith('user_'))?.replace('user_', '');
    const draftId = data.email?.tags?.find((t: string) => t.startsWith('draft_'))?.replace('draft_', '');

    if (userId) {
      // Track the event
      await analytics.trackEvent({
        user_id: userId,
        draft_id: draftId,
        email_id: emailId,
        event_type: eventType,
        recipient_email: recipient,
        metadata: {
          user_agent: data.user_agent,
          ip: data.ip,
          url: data.url,
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// GET - Webhook verification endpoint
export async function GET() {
  return NextResponse.json({ status: 'Webhook endpoint active' });
}




