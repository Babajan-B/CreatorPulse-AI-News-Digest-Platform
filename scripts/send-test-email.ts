import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

const mailerSend = new MailerSend({
  apiKey: 'mlsn.6d8926b356b1d5515e282ef12279646d0d8ee37f79d43c97a8170dfa6c18c100',
});

async function sendTest() {
  try {
    console.log('📧 Sending test email to: bioinfo.pacer@gmail.com\n');

    const sentFrom = new Sender(
      'info@test-q3enl6k7oym42vwr.mlsender.net',
      'CreatorPulse'
    );
    
    const recipients = [
      new Recipient('bioinfo.pacer@gmail.com', 'CreatorPulse Admin')
    ];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject('✅ CreatorPulse Email Test - MailerSend Integration')
      .setHtml(`
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f5f5f5;">
          <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 36px;">✨ CreatorPulse</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your AI Intelligence Hub</p>
            </div>
            <div style="padding: 40px;">
              <h2 style="color: #1a1a1a; margin: 0 0 24px 0; font-size: 28px;">Email Test Successful! 🎉</h2>
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Great news! MailerSend is now fully integrated with your CreatorPulse platform and ready to deliver daily AI news digests.
              </p>
              <div style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border-left: 4px solid #667eea; padding: 24px; margin: 32px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 20px 0; color: #2d3748; font-size: 20px;">✅ Integration Status</h3>
                <table cellpadding="0" cellspacing="0" style="width: 100%; font-size: 15px;">
                  <tr>
                    <td style="padding: 10px 0; color: #718096; width: 45%;"><strong>MailerSend:</strong></td>
                    <td style="padding: 10px 0; color: #2d3748;">✅ Connected</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #718096;"><strong>Sender Domain:</strong></td>
                    <td style="padding: 10px 0; color: #2d3748;">test-q3enl6k7oym42vwr.mlsender.net</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #718096;"><strong>Admin Email:</strong></td>
                    <td style="padding: 10px 0; color: #2d3748;">bioinfo.pacer@gmail.com</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #718096;"><strong>Status:</strong></td>
                    <td style="padding: 10px 0; color: #2d3748;">🚀 Ready to Send</td>
                  </tr>
                </table>
              </div>
              <h3 style="margin: 40px 0 20px 0; color: #2d3748; font-size: 22px;">🎯 What's Working</h3>
              <ul style="margin: 0 0 32px 0; padding-left: 24px; color: #4a5568; font-size: 15px; line-height: 1.8;">
                <li style="margin-bottom: 12px;"><strong>User Authentication</strong> - Login/signup system complete</li>
                <li style="margin-bottom: 12px;"><strong>RSS Integration</strong> - 17 AI news sources</li>
                <li style="margin-bottom: 12px;"><strong>Database</strong> - Supabase with 30+ articles</li>
                <li style="margin-bottom: 12px;"><strong>Email Delivery</strong> - MailerSend configured & tested</li>
              </ul>
              <div style="text-align: center; margin: 40px 0 32px 0;">
                <a href="http://localhost:3001" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
                  Open CreatorPulse Dashboard →
                </a>
              </div>
              <p style="margin: 32px 0 0 0; padding-top: 32px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 14px; line-height: 1.6;">
                <strong>Powered by MailerSend</strong><br>
                This email confirms your CreatorPulse email integration is working perfectly.
              </p>
            </div>
            <div style="background: #f7fafc; padding: 32px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 12px 0; color: #a0aec0; font-size: 13px;">
                This is a test email from CreatorPulse
              </p>
              <p style="margin: 0; color: #cbd5e0; font-size: 12px;">
                © 2025 CreatorPulse. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `)
      .setText('MailerSend integration test successful! Your CreatorPulse platform is ready to send emails.');

    const response = await mailerSend.email.send(emailParams);

    console.log('✅ EMAIL SENT SUCCESSFULLY!\n');
    console.log('Status Code:', response.statusCode);
    console.log('Message:', response.body.message || 'Email queued for delivery');
    console.log('\n📬 Check your inbox: bioinfo.pacer@gmail.com');
    console.log('📊 MailerSend Activity: https://www.mailersend.com/activity');
    console.log('\n🎉 Your CreatorPulse can now send real emails!\n');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.body) {
      console.log('\nDetails:');
      console.log('Status:', error.statusCode);
      console.log('Message:', error.body.message);
      console.log('Errors:', JSON.stringify(error.body.errors, null, 2));
    }
  }
}

sendTest();
