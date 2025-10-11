// API Route: Send social media post via email
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email-service';
import { jwtVerify } from 'jose';
import { supabase as supabaseClient } from '@/lib/supabase';
import { format } from 'date-fns';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
)

export const dynamic = 'force-dynamic';

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload.userId as string
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const userId = await getUserFromToken(request)
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated. Please login to send emails.'
      }, { status: 401 });
    }

    // Get user data
    const { data: user, error: userError } = await supabaseClient
      .from('users')
      .select('email, name')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Get post data from request
    const body = await request.json();
    const { title, content, url, author, source, platform, created_at } = body;

    if (!title || !url) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    console.log('📧 Sending social media post via email...');
    console.log(`   To: ${user.email}`);
    console.log(`   Post: ${title.substring(0, 50)}...`);

    // Generate email HTML
    const emailHtml = generateSocialPostEmailTemplate({
      title,
      content,
      url,
      author: author || 'Unknown',
      source: source || 'Social Media',
      platform: platform || 'Unknown',
      created_at: created_at || new Date().toISOString(),
      userName: user.name || 'User'
    });

    // Send email
    const emailResult = await sendEmail({
      to: user.email,
      toName: user.name || user.email,
      subject: `Social Trending: ${title.substring(0, 60)}${title.length > 60 ? '...' : ''}`,
      html: emailHtml
    });

    if (emailResult.success) {
      console.log('✅ Social media post email sent successfully!');
      
      return NextResponse.json({
        success: true,
        email: {
          to: emailResult.actualRecipient || user.email,
          messageId: emailResult.messageId,
          post: {
            title,
            source,
            platform
          }
        },
        message: 'Social media post sent via email successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: emailResult.error || 'Failed to send email'
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error sending social media post email:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to send email'
    }, { status: 500 });
  }
}

/**
 * Generate HTML email template for social media posts
 */
function generateSocialPostEmailTemplate(params: {
  title: string;
  content: string;
  url: string;
  author: string;
  source: string;
  platform: string;
  created_at: string;
  userName: string;
}): string {
  const { title, content, url, author, source, platform, created_at, userName } = params;

  const formattedDate = format(new Date(created_at), 'MMMM d, yyyy h:mm a');

  const platformEmojis: { [key: string]: string } = {
    reddit: '🔴',
    hackernews: '🟠',
    lobsters: '🦞',
    slashdot: '⚡',
    producthunt: '🚀'
  };

  const platformEmoji = platformEmojis[platform.toLowerCase()] || '📱';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Social Trending - ${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      border-bottom: 3px solid #0066cc;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      background: linear-gradient(135deg, #0066cc, #00cc99);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .greeting {
      font-size: 18px;
      color: #666;
      margin-top: 10px;
    }
    .platform-badge {
      display: inline-block;
      padding: 6px 12px;
      background-color: #f0f0f0;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 15px;
      color: #555;
    }
    .post-title {
      font-size: 24px;
      font-weight: bold;
      color: #1a1a1a;
      margin: 20px 0;
      line-height: 1.3;
    }
    .meta-info {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      margin-bottom: 20px;
      padding: 15px;
      background-color: #f8f9fa;
      border-radius: 8px;
    }
    .meta-item {
      font-size: 14px;
      color: #666;
    }
    .meta-label {
      font-weight: 600;
      color: #333;
    }
    .content {
      font-size: 16px;
      color: #444;
      line-height: 1.8;
      margin: 25px 0;
      padding: 20px;
      background-color: #fafafa;
      border-left: 4px solid #0066cc;
      border-radius: 4px;
    }
    .cta-button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #0066cc, #00cc99);
      color: #ffffff;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 25px 0;
      transition: transform 0.2s;
    }
    .cta-button:hover {
      transform: translateY(-2px);
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      font-size: 14px;
      color: #888;
      text-align: center;
    }
    .footer-links {
      margin-top: 15px;
    }
    .footer-links a {
      color: #0066cc;
      text-decoration: none;
      margin: 0 10px;
    }
    @media only screen and (max-width: 600px) {
      .container {
        padding: 20px;
      }
      .post-title {
        font-size: 20px;
      }
      .content {
        font-size: 14px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">✨ CreatorPulse</div>
      <div class="greeting">Social Media Trending</div>
    </div>

    <div class="platform-badge">
      ${platformEmoji} ${platform.toUpperCase()} • ${source}
    </div>

    <h1 class="post-title">${title}</h1>

    <div class="meta-info">
      <div class="meta-item">
        <span class="meta-label">Author:</span> ${author}
      </div>
      <div class="meta-item">
        <span class="meta-label">Posted:</span> ${formattedDate}
      </div>
      <div class="meta-item">
        <span class="meta-label">Platform:</span> ${platform}
      </div>
    </div>

    <div class="content">
      ${content.substring(0, 500)}${content.length > 500 ? '...' : ''}
    </div>

    <center>
      <a href="${url}" class="cta-button" target="_blank">
        🔗 Read Full Discussion
      </a>
    </center>

    <div class="footer">
      <p>Hi ${userName},</p>
      <p>
        This trending discussion was shared from CreatorPulse, your AI-powered news and social media aggregator.
      </p>
      <div class="footer-links">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}">Visit CreatorPulse</a>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/settings">Manage Preferences</a>
      </div>
      <p style="margin-top: 20px; font-size: 12px;">
        © ${new Date().getFullYear()} CreatorPulse. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}
