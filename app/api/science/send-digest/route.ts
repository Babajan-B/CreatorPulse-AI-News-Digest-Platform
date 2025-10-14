import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email-service'
import { generateDualModeDigestEmail } from '@/lib/email-templates'
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

    // Get articles from request body
    const body = await request.json()
    const { articles } = body

    if (!articles || articles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No articles provided' },
        { status: 400 }
      )
    }

    // Format articles for email template
    const emailArticles = articles.map((article: any) => ({
      title: article.title,
      aiSummary: article.summary,
      summary: article.summary,
      url: article.url,
      source: article.source,
      publishedAt: article.publishedAt || new Date().toISOString(),
      bulletPoints: article.bulletPoints || [],
      hashtags: article.hashtags || []
    }))

    // Generate email subject
    const subject = `🔬 Your Science Breakthroughs Digest - ${articles.length} Top Research Papers (${new Date().toLocaleDateString()})`

    // Generate email HTML using the dual-mode template
    const emailHtml = generateDualModeDigestEmail({
      articles: emailArticles,
      userName: user.name || 'Researcher',
      mode: 'science_breakthrough'
    })

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
          email_type: 'science_digest',
          article_count: articles.length,
          status: 'sent',
          sent_at: new Date().toISOString()
        })
    } catch (logError) {
      console.error('Error logging email delivery:', logError)
    }

    return NextResponse.json({
      success: true,
      email: {
        to: user.email,
        articleCount: articles.length
      }
    })

  } catch (error: any) {
    console.error('Error sending science digest:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}




