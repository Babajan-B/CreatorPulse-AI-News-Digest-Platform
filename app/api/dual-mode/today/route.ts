import { NextRequest, NextResponse } from 'next/server'
import { DualModeService, UserMode } from '@/lib/dual-mode-service'
import { jwtVerify } from 'jose'

const dualModeService = new DualModeService()

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

export async function GET(request: NextRequest) {
  try {
    // Get user authentication
    const userId = await getUserFromToken(request)
    
    // Get mode from query parameter or user settings
    const { searchParams } = new URL(request.url)
    const modeParam = searchParams.get('mode') as UserMode
    
    let mode: UserMode = 'ai_news' // default
    
    if (modeParam && ['ai_news', 'science_breakthrough'].includes(modeParam)) {
      mode = modeParam
    } else if (userId) {
      // Try to get user's preferred mode from settings
      try {
        const { createClient } = await import('@/lib/supabase')
        const supabase = createClient()
        
        const { data: settings } = await supabase
          .from('user_settings')
          .select('preferred_mode')
          .eq('user_id', userId)
          .single()
          
        if (settings?.preferred_mode) {
          mode = settings.preferred_mode
        }
      } catch (error) {
        console.log('Could not fetch user settings, using default mode')
      }
    }

    console.log(`📊 Fetching today's content for mode: ${mode}`)

    // Get top articles with summaries (limit to 10 for homepage)
    const articles = await dualModeService.getTopArticlesWithSummaries(mode, 10)
    
    // Get mode statistics
    const stats = await dualModeService.getModeStats(mode)

    console.log(`✅ Found ${articles.length} articles for ${mode} mode`)

    return NextResponse.json({
      success: true,
      mode,
      articles,
      stats,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Error fetching today\'s dual-mode content:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch today\'s content',
      mode: 'ai_news',
      articles: [],
      stats: {
        totalArticles: 0,
        avgImportanceScore: 0,
        topCategories: {},
        sourcesCount: 0
      }
    }, { status: 500 })
  }
}
