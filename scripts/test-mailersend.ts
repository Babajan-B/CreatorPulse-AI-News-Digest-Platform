/**
 * Test MailerSend Integration
 */

import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

const apiKey = 'mlsn.6d8926b356b1d5515e282ef12279646d0d8ee37f79d43c97a8170dfa6c18c100';

console.log('🔗 Testing MailerSend connection...\n');

const mailerSend = new MailerSend({
  apiKey: apiKey,
});

async function testEmail() {
  try {
    console.log('📧 Preparing test email...');
    
    const sentFrom = new Sender('noreply@trial-z86org8n9n0gew13.mlsender.net', 'CreatorPulse Test');
    
    const recipients = [
      new Recipient('test@creatorpulse.com', 'Test User')
    ];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject('🎉 MailerSend Integration Test - CreatorPulse')
      .setHtml(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; padding: 40px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 32px;">✨ CreatorPulse</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">MailerSend Integration Test</p>
            </div>
            <div style="padding: 40px;">
              <h2 style="color: #333; margin: 0 0 20px 0;">Success! 🎉</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                MailerSend is working perfectly with your CreatorPulse platform!
              </p>
              <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; border-radius: 4px;">
                <h3 style="margin: 0 0 15px 0; color: #333;">✅ Test Results:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #666;">
                  <li>API connection successful</li>
                  <li>Email delivery working</li>
                  <li>HTML rendering perfect</li>
                  <li>Ready for production</li>
                </ul>
              </div>
              <div style="text-align: center; margin: 40px 0 20px 0;">
                <a href="http://localhost:3000/settings" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-weight: bold;">
                  Go to Settings →
                </a>
              </div>
            </div>
            <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #999; font-size: 12px; margin: 0;">Powered by MailerSend • CreatorPulse 2025</p>
            </div>
          </div>
        </body>
        </html>
      `)
      .setText('MailerSend integration test successful! Your CreatorPulse platform is ready to send emails.');

    console.log('📤 Sending email via MailerSend...');
    console.log('From:', sentFrom.email);
    console.log('To:', recipients[0].email);
    console.log();

    const response = await mailerSend.email.send(emailParams);

    console.log('✅ Email sent successfully!\n');
    console.log('Response:', response.statusCode);
    console.log('Message:', response.body.message || 'Email queued for delivery');
    console.log('\n🎉 MailerSend Integration Complete!');
    console.log('\nCheck your inbox at: test@creatorpulse.com');
    console.log('Or check MailerSend activity: https://www.mailersend.com/activity\n');

    return true;

  } catch (error: any) {
    console.error('❌ Email sending failed:', error.message);
    console.error('\nDetails:', error);
    console.log('\n📝 Troubleshooting:');
    console.log('  1. Check API token is valid');
    console.log('  2. Verify sender email in MailerSend dashboard');
    console.log('  3. Check API token has "Email - Full Access" scope');
    console.log('  4. Visit MailerSend activity log for details');
    return false;
  }
}

testEmail();

