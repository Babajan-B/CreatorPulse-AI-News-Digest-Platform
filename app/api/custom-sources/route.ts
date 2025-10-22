import { NextRequest, NextResponse } from 'next/server'
import { getCustomSourcesService } from '@/lib/custom-sources-service'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'

// Helper function to get user from JWT cookie
async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  
  if (!token) {
    return null
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    return payload.userId as string
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sourceType = searchParams.get('sourceType')
    
    // Get authenticated user
    const userId = await getUserFromToken(request)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const customSourcesService = getCustomSourcesService()
    
    // Get user's custom sources
    const sources = await customSourcesService.getUserSources(userId)
    
    // Filter by source type if specified
    const filteredSources = sourceType 
      ? sources.filter(source => source.source_type === sourceType)
      : sources

    // Get latest content from each source
    console.log(`🔍 Fetching content for ${filteredSources.length} sources of type: ${sourceType || 'all'}`)
    const sourcesWithContent = await Promise.all(
      filteredSources.map(async (source) => {
        try {
          console.log(`📺 Fetching content for ${source.source_type}: ${source.source_name} (${source.source_identifier})`)
          const content = await customSourcesService.fetchFromSource(source)
          console.log(`✅ Fetched ${content.length} items for ${source.source_name}`)
          return {
            ...source,
            latestContent: content.slice(0, 1), // Get only the latest item
            totalContent: content.length
          }
        } catch (error) {
          console.error(`❌ Error fetching content for source ${source.id} (${source.source_name}):`, error)
          return {
            ...source,
            latestContent: [],
            totalContent: 0,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      })
    )

    // Group by source type for statistics
    const sourceTypeStats = sources.reduce((acc, source) => {
      acc[source.source_type] = (acc[source.source_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      success: true,
      sources: sourcesWithContent,
      sourceTypeStats,
      totalSources: sources.length
    })

  } catch (error) {
    console.error('Error fetching custom sources:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch custom sources' 
      },
      { status: 500 }
    )
  }
}
