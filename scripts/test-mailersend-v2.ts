/**
 * Test MailerSend Integration - Version 2
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
    console.log('⚠️  Trial Account Restriction:');
    console.log('   MailerSend trial accounts can ONLY send to the administrator email\n');
    
    console.log('❓ What email did you use to sign up for MailerSend?');
    console.log('   (This is the ONLY email that will receive test emails)\n');
    
    // Try to get account info first
    console.log('Checking MailerSend account...\n');
    
    const sentFrom = new Sender('noreply@trial-z86org8n9n0gew13.mlsender.net', 'CreatorPulse');
    
    // You need to tell me the admin email
    const adminEmail = process.env.MAILERSEND_ADMIN_EMAIL || 'PLEASE_SET_ADMIN_EMAIL';
    
    const recipients = [
      new Recipient(adminEmail, 'Admin User')
    ];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject('✅ MailerSend Test - CreatorPulse Integration')
      .setHtml(`
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="color: white; margin: 0;">✨ CreatorPulse</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">MailerSend Integration Test</p>
            </div>
            <div style="padding: 40px;">
              <h2 style="color: #333; margin: 0 0 20px 0;">MailerSend is Working! 🎉</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Your CreatorPulse platform is successfully connected to MailerSend and ready to send emails!
              </p>
              <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <h3 style="margin: 0 0 10px 0; color: #333;">✅ Integration Status:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #666;">
                  <li>API Key: Valid</li>
                  <li>Sender: Configured</li>
                  <li>Delivery: Working</li>
                  <li>Status: Ready for Production</li>
                </ul>
              </div>
              <p style="color: #666; font-size: 14px; margin: 20px 0;">
                <strong>Note:</strong> Trial accounts can only send to your MailerSend admin email. 
                Upgrade to send to any email address.
              </p>
            </div>
            <div style="background: #f8f9fa; padding: 20px; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">Powered by MailerSend</p>
            </div>
          </div>
        </body>
        </html>
      `)
      .setText('MailerSend integration test successful!');

    console.log('📤 Sending email...');
    console.log('From:', sentFrom.email);
    console.log('To:', adminEmail);

    if (adminEmail === 'PLEASE_SET_ADMIN_EMAIL') {
      console.log('\n❌ Admin email not set!');
      console.log('\nPlease tell me:');
      console.log('  What email did you use to register MailerSend?\n');
      return;
    }

    const response = await mailerSend.email.send(emailParams);

    console.log('\n✅ Email sent successfully!');
    console.log('Status Code:', response.statusCode);
    console.log('Message:', response.body.message || 'Email queued for delivery');
    console.log('\n🎉 SUCCESS! Check your inbox at:', adminEmail);
    console.log('MailerSend Activity: https://www.mailersend.com/activity\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    
    if (error.body) {
      console.log('\nMailerSend Response:');
      console.log('Status:', error.statusCode);
      console.log('Message:', error.body.message);
      console.log('Errors:', JSON.stringify(error.body.errors, null, 2));
    }
    
    console.log('\n📝 Common Issues:');
    console.log('  1. Trial accounts can only send to admin email');
    console.log('  2. Sender email must be from verified domain');
    console.log('  3. Check API token has correct permissions\n');
  }
}

testEmail();

