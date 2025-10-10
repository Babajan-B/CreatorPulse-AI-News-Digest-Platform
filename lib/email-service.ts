/**
 * MailerSend Email Service
 * https://developers.mailersend.com/
 */

import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

// Initialize MailerSend
const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY || '',
});

// Default sender (uses verified domain from MailerSend)
const defaultSender = new Sender(
  process.env.MAILERSEND_FROM_EMAIL || '',
  process.env.MAILERSEND_FROM_NAME || 'CreatorPulse'
);

// Admin email for trial account (trial accounts can only send to admin)
const ADMIN_EMAIL = process.env.MAILERSEND_ADMIN_EMAIL || '';

interface SendEmailOptions {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using MailerSend
 * Note: Trial accounts can only send to admin email (bioinfo.pacer@gmail.com)
 */
export async function sendEmail(options: SendEmailOptions) {
  try {
    // Validate API key
    if (!process.env.MAILERSEND_API_KEY) {
      throw new Error('MAILERSEND_API_KEY not configured');
    }

    // For trial accounts, override recipient with admin email
    const recipientEmail = ADMIN_EMAIL;
    const recipientName = options.toName || options.to;

    // Add note to subject about trial restriction
    const subjectNote = recipientEmail !== options.to 
      ? ` [Trial: sent to ${recipientEmail}]` 
      : '';

    const recipients = [new Recipient(recipientEmail, recipientName)];

    const emailParams = new EmailParams()
      .setFrom(defaultSender)
      .setTo(recipients)
      .setSubject(options.subject + subjectNote)
      .setHtml(options.html)
      .setText(options.text || stripHtml(options.html));

    const response = await mailerSend.email.send(emailParams);

    return {
      success: true,
      messageId: response.body.message || 'sent',
      response: response,
      actualRecipient: recipientEmail,
      originalRecipient: options.to,
    };
  } catch (error: any) {
    console.error('MailerSend error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email',
      details: error,
    };
  }
}

/**
 * Strip HTML tags for plain text version
 */
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * Generate test email HTML template
 */
export function generateTestEmailTemplate(user: {
  name: string;
  email: string;
  digestTime: string;
  timezone: string;
  autoSend: boolean;
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CreatorPulse Test Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 48px 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 36px; font-weight: 700; letter-spacing: -0.5px;">
                ✨ CreatorPulse
              </h1>
              <p style="margin: 12px 0 0 0; color: rgba(255, 255, 255, 0.95); font-size: 16px; font-weight: 500;">
                Your AI Intelligence Hub
              </p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 48px 32px;">
              
              <h2 style="margin: 0 0 24px 0; color: #1a1a1a; font-size: 28px; font-weight: 700;">
                Test Email Successful! 🎉
              </h2>
              
              <p style="margin: 0 0 24px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Great news! Your email is configured correctly and ready to receive daily AI news digests from CreatorPulse.
              </p>
              
              <!-- Settings Box -->
              <div style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border-left: 4px solid #667eea; padding: 24px; margin: 32px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 20px 0; color: #2d3748; font-size: 20px; font-weight: 600;">
                  📊 Your Settings
                </h3>
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="font-size: 15px;">
                  <tr>
                    <td style="padding: 10px 0; color: #718096; font-weight: 500; width: 45%;">
                      <strong>Name:</strong>
                    </td>
                    <td style="padding: 10px 0; color: #2d3748; font-weight: 500;">
                      ${user.name}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #718096; font-weight: 500;">
                      <strong>Email:</strong>
                    </td>
                    <td style="padding: 10px 0; color: #2d3748; font-weight: 500;">
                      ${user.email}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #718096; font-weight: 500;">
                      <strong>Digest Time:</strong>
                    </td>
                    <td style="padding: 10px 0; color: #2d3748; font-weight: 500;">
                      ${user.digestTime}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #718096; font-weight: 500;">
                      <strong>Timezone:</strong>
                    </td>
                    <td style="padding: 10px 0; color: #2d3748; font-weight: 500;">
                      ${user.timezone}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #718096; font-weight: 500;">
                      <strong>Auto Email:</strong>
                    </td>
                    <td style="padding: 10px 0; color: #2d3748; font-weight: 500;">
                      ${user.autoSend ? '✅ Enabled' : '❌ Disabled'}
                    </td>
                  </tr>
                </table>
              </div>
              
              <h3 style="margin: 40px 0 20px 0; color: #2d3748; font-size: 22px; font-weight: 600;">
                🚀 What's Next?
              </h3>
              
              <ul style="margin: 0 0 32px 0; padding-left: 24px; color: #4a5568; font-size: 15px; line-height: 1.8;">
                <li style="margin-bottom: 12px;">
                  Your daily digest will arrive at <strong>${user.digestTime}</strong> (${user.timezone})
                </li>
                <li style="margin-bottom: 12px;">
                  We'll curate the best AI news from <strong>17+ premium sources</strong>
                </li>
                <li style="margin-bottom: 12px;">
                  Each article includes quality scores, summaries, and quick sharing actions
                </li>
                <li style="margin-bottom: 12px;">
                  Share articles directly to <strong>LinkedIn, Twitter, or email</strong>
                </li>
              </ul>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0 32px 0;">
                <a href="http://localhost:3000" 
                   style="display: inline-block; 
                          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: #ffffff; 
                          text-decoration: none; 
                          padding: 16px 40px; 
                          border-radius: 8px; 
                          font-weight: 600; 
                          font-size: 16px;
                          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
                  View Latest Digest →
                </a>
              </div>
              
              <p style="margin: 32px 0 0 0; padding-top: 32px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 14px; line-height: 1.6;">
                <strong>Powered by MailerSend</strong><br>
                This test email confirms your CreatorPulse email delivery is working perfectly.
              </p>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f7fafc; padding: 32px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 12px 0; color: #a0aec0; font-size: 13px; line-height: 1.5;">
                This is a test email from CreatorPulse<br>
                You're receiving this because you requested an email test
              </p>
              <p style="margin: 0; color: #cbd5e0; font-size: 12px;">
                © 2025 CreatorPulse. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export { mailerSend };

