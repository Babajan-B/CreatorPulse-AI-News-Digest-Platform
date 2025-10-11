import { NextRequest, NextResponse } from 'next/server'
import { supabase as supabaseClient } from '@/lib/supabase'
import { DualModeService, UserMode } from '@/lib/dual-mode-service'
import { sendEmail } from '@/lib/email-service'
import { generateDualModeDigestEmail } from '@/lib/email-templates'

export const dynamic = 'force-dynamic'

const dualModeService = new DualModeService()

/**
 * Daily Cron Job - Send personalized digests based on user mode
 * This endpoint should be called by a cron service (Vercel Cron, GitHub Actions, etc.)
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Starting daily digest cron job...')

    // Verify this is a legitimate cron request (optional security)
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.CRON_SECRET_TOKEN
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all users with auto-send enabled
    const { data: users, error: usersError } = await supabaseClient
      .from('users')
      .select(`
        id,
        email,
        name,
        user_settings!inner(
          auto_send_email,
          preferred_mode,
          digest_time,
          max_items_per_digest,
          timezone
        )
      `)
      .eq('user_settings.auto_send_email', true)

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    if (!users || users.length === 0) {
      console.log('📭 No users with auto-send enabled')
      return NextResponse.json({
        success: true,
        message: 'No users to send digests to',
        processed: 0
      })
    }

    console.log(`👥 Found ${users.length} users with auto-send enabled`)

    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    // Process each user
    for (const user of users) {
      try {
        const settings = user.user_settings[0] // Get first (should be only) settings
        const mode = (settings?.preferred_mode as UserMode) || 'ai_news'
        const maxItems = settings?.max_items_per_digest || 5

        console.log(`📧 Processing ${user.email} (mode: ${mode}, items: ${maxItems})`)

        // Get top articles for user's preferred mode
        const articles = await dualModeService.getTopArticlesWithSummaries(mode, maxItems)

        if (articles.length === 0) {
          console.log(`⚠️  No articles found for ${user.email} in ${mode} mode`)
          continue
        }

        // Convert to email format
        const emailArticles = articles.map(article => ({
          id: article.id,
          title: article.title,
          summary: article.summary || '',
          aiSummary: article.summary || '',
          bulletPoints: article.bullet_points || [],
          hashtags: article.hashtags || [],
          url: article.url,
          source: article.source,
          publishedAt: article.published_at,
          imageUrl: undefined // Science sources typically don't have images
        }))

        // Generate email subject based on mode
        const modeDisplayName = mode === 'ai_news' ? 'AI News' : 'Science Breakthroughs'
        const subject = `🎯 Your Daily ${modeDisplayName} Digest - ${articles.length} Top Articles (${new Date().toLocaleDateString()})`

        // Generate email HTML
        const emailHtml = generateDualModeDigestEmail({
          articles: emailArticles,
          userName: user.name || 'Reader',
          mode
        })

        // Send email
        const emailResult = await sendEmail({
          to: user.email,
          toName: user.name,
          subject,
          html: emailHtml,
        })

        if (!emailResult.success) {
          throw new Error(`Email send failed: ${emailResult.error}`)
        }

        // Log delivery
        await supabaseClient
          .from('delivery_logs')
          .insert({
            digest_id: null,
            delivery_type: 'email',
            status: 'sent',
            recipient: user.email,
            subject,
            attempted_at: new Date().toISOString(),
            delivered_at: new Date().toISOString(),
            external_id: emailResult.messageId,
            response_data: {
              provider: 'mailersend',
              message_id: emailResult.messageId,
              article_count: articles.length,
              mode,
              user_id: user.id
            },
          })

        successCount++
        console.log(`✅ Sent digest to ${user.email}`)

      } catch (error: any) {
        errorCount++
        const errorMsg = `Failed to process ${user.email}: ${error.message}`
        errors.push(errorMsg)
        console.error(`❌ ${errorMsg}`)

        // Log failed delivery
        await supabaseClient
          .from('delivery_logs')
          .insert({
            digest_id: null,
            delivery_type: 'email',
            status: 'failed',
            recipient: user.email,
            subject: 'Daily Digest',
            attempted_at: new Date().toISOString(),
            error_message: error.message,
            response_data: {
              error: error.message,
              user_id: user.id
            },
          })
      }
    }

    console.log(`🎉 Daily digest cron completed: ${successCount} sent, ${errorCount} failed`)

    return NextResponse.json({
      success: true,
      message: 'Daily digest cron completed',
      stats: {
        totalUsers: users.length,
        successful: successCount,
        failed: errorCount,
        errors: errors.slice(0, 10) // Limit error details
      },
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Daily digest cron error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Daily digest cron failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

/**
 * Manual trigger endpoint for testing
 */
export async function POST(request: NextRequest) {
  try {
    // Get user from request (for testing specific user)
    const { userId, mode, limit } = await request.json().catch(() => ({}))
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId required for manual trigger' },
        { status: 400 }
      )
    }

    console.log(`🧪 Manual digest trigger for user ${userId}`)

    // Get user data
    const { data: user, error: userError } = await supabaseClient
      .from('users')
      .select(`
        id,
        email,
        name,
        user_settings!inner(preferred_mode, max_items_per_digest)
      `)
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const settings = user.user_settings[0]
    const userMode = (mode || settings?.preferred_mode || 'ai_news') as UserMode
    const maxItems = limit || settings?.max_items_per_digest || 5

    // Get articles
    const articles = await dualModeService.getTopArticlesWithSummaries(userMode, maxItems)

    if (articles.length === 0) {
      return NextResponse.json({
        success: false,
        error: `No articles found for ${userMode} mode`
      })
    }

    // Convert to email format
    const emailArticles = articles.map(article => ({
      id: article.id,
      title: article.title,
      summary: article.summary || '',
      aiSummary: article.summary || '',
      bulletPoints: article.bullet_points || [],
      hashtags: article.hashtags || [],
      url: article.url,
      source: article.source,
      publishedAt: article.published_at,
      imageUrl: undefined
    }))

    const modeDisplayName = userMode === 'ai_news' ? 'AI News' : 'Science Breakthroughs'
    const subject = `🧪 Test: Daily ${modeDisplayName} Digest - ${articles.length} Articles`

    const emailHtml = generateDualModeDigestEmail({
      articles: emailArticles,
      userName: user.name || 'Reader',
      mode: userMode
    })

    const emailResult = await sendEmail({
      to: user.email,
      toName: user.name,
      subject,
      html: emailHtml,
    })

    if (!emailResult.success) {
      return NextResponse.json({
        success: false,
        error: `Email send failed: ${emailResult.error}`
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Test digest sent successfully',
      email: {
        to: user.email,
        subject,
        messageId: emailResult.messageId,
        articleCount: articles.length,
        mode: userMode
      }
    })

  } catch (error: any) {
    console.error('Manual digest trigger error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
