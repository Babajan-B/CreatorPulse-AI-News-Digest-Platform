import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email-service'
import { jwtVerify } from 'jose'
import { supabase as supabaseClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
)

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

function generateScienceArticleEmail(article: any, userName: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Research Article - ${article.title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f0fdf4;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f0fdf4; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table cellpadding="0" cellspacing="0" border="0" width="650" style="max-width: 650px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); padding: 48px 40px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 38px; font-weight: 700; letter-spacing: -0.5px;">
                    🔬 CreatorPulse
                  </h1>
                  <p style="margin: 12px 0 8px 0; color: rgba(255, 255, 255, 0.95); font-size: 18px; font-weight: 500;">
                    Science Breakthrough
                  </p>
                  <p style="margin: 0; color: rgba(255, 255, 255, 0.85); font-size: 14px;">
                    ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </td>
              </tr>

              <!-- Greeting -->
              <tr>
                <td style="padding: 40px 40px 32px 40px;">
                  <h2 style="margin: 0 0 16px 0; color: #1a1a1a; font-size: 26px; font-weight: 700;">
                    Hello, ${userName}! 👋
                  </h2>
                  <p style="margin: 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                    Here's an important research article we thought you'd be interested in:
                  </p>
                </td>
              </tr>

              <!-- Article -->
              <tr>
                <td style="padding: 0 40px 40px 40px;">
                  <div style="margin-bottom: 32px; padding-bottom: 32px; border-bottom: 1px solid #e2e8f0;">
                    
                    <!-- Title -->
                    <h2 style="margin: 16px 0 12px 0; color: #1a1a1a; font-size: 22px; font-weight: 700; line-height: 1.4;">
                      ${article.title}
                    </h2>

                    <!-- Source & Date -->
                    <div style="margin-bottom: 16px; color: #718096; font-size: 13px;">
                      <strong style="color: #10b981;">${article.source}</strong> • ${new Date(article.publishedAt || new Date()).toLocaleDateString()}
                    </div>

                    <!-- Research Summary -->
                    <div style="background: linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%); border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 8px;">
                      <h3 style="margin: 0 0 12px 0; color: #2d3748; font-size: 16px; font-weight: 600;">
                        🔬 Research Summary
                      </h3>
                      <p style="margin: 0; color: #4a5568; font-size: 15px; line-height: 1.7;">
                        ${article.summary}
                      </p>
                    </div>

                    <!-- Key Findings (if available) -->
                    ${article.bulletPoints && article.bulletPoints.length > 0 ? `
                      <div style="background: #fff5f5; border-left: 4px solid #10b981; padding: 16px; margin: 16px 0; border-radius: 8px;">
                        <h4 style="margin: 0 0 12px 0; color: #2d3748; font-size: 14px; font-weight: 600;">
                          🔑 Key Research Findings
                        </h4>
                        <ul style="margin: 0; padding-left: 20px; color: #4a5568; font-size: 14px; line-height: 1.6;">
                          ${article.bulletPoints.map((point: string) => `<li style="margin-bottom: 4px;">${point}</li>`).join('')}
                        </ul>
                      </div>
                    ` : ''}

                    <!-- Tags -->
                    ${article.hashtags && article.hashtags.length > 0 ? `
                      <div style="margin-top: 16px;">
                        ${article.hashtags.slice(0, 6).map((tag: string) => 
                          `<span style="display: inline-block; background: #d1fae5; color: #059669; padding: 4px 12px; border-radius: 12px; font-size: 12px; margin-right: 6px; margin-bottom: 6px;">${tag}</span>`
                        ).join('')}
                      </div>
                    ` : ''}

                    <!-- Read More Button -->
                    <div style="text-align: center; margin-top: 24px;">
                      <a href="${article.url}" target="_blank" rel="noopener noreferrer"
                         style="display: inline-block; background: #10b981; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 15px;">
                        Read Full Research Paper &rarr;
                      </a>
                    </div>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f0fdf4; padding: 32px 40px; text-align: center; color: #718096; font-size: 12px;">
                  <p style="margin: 0 0 8px 0;">
                    You are receiving this email because you subscribed to CreatorPulse Science Breakthroughs.
                  </p>
                  <p style="margin: 0;">
                    © ${new Date().getFullYear()} CreatorPulse. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const userId = await getUserFromToken(request)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get user details
    const { data: user, error: userError } = await supabaseClient
      .from('users')
      .select('email, name')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Get article from request body
    const body = await request.json()
    const { title, summary, url, source, publishedAt, bulletPoints, hashtags } = body

    if (!title || !url) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const article = {
      title,
      summary: summary || '',
      url,
      source: source || 'Unknown Source',
      publishedAt: publishedAt || new Date().toISOString(),
      bulletPoints: bulletPoints || [],
      hashtags: hashtags || []
    }

    // Generate email subject
    const subject = `🔬 Research Article: ${title}`

    // Generate email HTML
    const emailHtml = generateScienceArticleEmail(article, user.name || 'Researcher')

    // Send email
    const emailResult = await sendEmail({
      to: user.email,
      toName: user.name,
      subject,
      html: emailHtml,
    })

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: emailResult.error || 'Failed to send email' },
        { status: 500 }
      )
    }

    // Log delivery
    try {
      await supabaseClient
        .from('email_delivery_logs')
        .insert({
          user_id: userId,
          email_to: user.email,
          email_type: 'science_article',
          article_count: 1,
          status: 'sent',
          sent_at: new Date().toISOString()
        })
    } catch (logError) {
      console.error('Error logging email delivery:', logError)
    }

    return NextResponse.json({
      success: true,
      email: {
        to: user.email
      }
    })

  } catch (error: any) {
    console.error('Error sending science article:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}




