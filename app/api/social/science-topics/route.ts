import { NextRequest, NextResponse } from 'next/server'
import { RedditService } from '@/lib/reddit-service'
import { rssSocialService } from '@/lib/rss-social-service'
import { ALL_SOCIAL_SOURCES } from '@/lib/social-sources'

export const dynamic = 'force-dynamic'

const redditService = new RedditService()

// Science-related keywords for filtering
const SCIENCE_KEYWORDS = [
  'research', 'study', 'science', 'medical', 'health', 'medicine', 'biology', 'chemistry', 'physics',
  'clinical', 'trial', 'drug', 'vaccine', 'cancer', 'disease', 'treatment', 'therapy', 'diagnosis',
  'breakthrough', 'discovery', 'publication', 'journal', 'peer review', 'data', 'analysis',
  'experiment', 'laboratory', 'lab', 'genetics', 'genome', 'protein', 'molecule', 'cell',
  'neuroscience', 'brain', 'cognition', 'psychology', 'behavior', 'mental health',
  'epidemiology', 'public health', 'prevention', 'screening', 'biomarker', 'pharmaceutical',
  'biotech', 'innovation', 'patent', 'FDA', 'approval', 'regulatory', 'evidence-based',
  'systematic review', 'meta-analysis', 'randomized', 'controlled trial', 'cohort study',
  'case study', 'observational', 'longitudinal', 'cross-sectional', 'retrospective',
  'prospective', 'blinded', 'placebo', 'statistical significance', 'p-value', 'confidence interval'
]

interface TrendingTopic {
  keyword: string
  count: number
  platforms: string[]
  posts: Array<{
    title: string
    url: string
    platform: string
    score?: number
  }>
}

function extractScienceKeywords(text: string): string[] {
  const words = text.toLowerCase().split(/\s+/)
  return SCIENCE_KEYWORDS.filter(keyword => 
    words.some(word => word.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(word))
  )
}

function calculateScienceTrendingScore(post: any, platform: string): number {
  const text = `${post.title} ${post.content || post.summary || ''}`.toLowerCase()
  const scienceKeywords = extractScienceKeywords(text)
  
  // Base score from platform-specific metrics
  let score = 0
  if (platform === 'reddit') {
    score = (post.score || 0) + (post.num_comments || 0) * 2
  } else {
    score = post.score || 0
  }
  
  // Boost for science keywords
  score += scienceKeywords.length * 10
  
  // Additional boosts for specific science terms
  if (text.includes('breakthrough')) score += 50
  if (text.includes('clinical trial')) score += 40
  if (text.includes('study shows')) score += 30
  if (text.includes('research')) score += 20
  if (text.includes('medical')) score += 15
  
  return score
}

async function getScienceTrendingTopics(): Promise<TrendingTopic[]> {
  const allPosts: any[] = []
  const platformMap = new Map<string, any[]>()
  
  try {
    // Fetch from Reddit science-related subreddits
    const redditSubreddits = ['science', 'medicine', 'biology', 'chemistry', 'physics', 'neuroscience']
    
    for (const subreddit of redditSubreddits) {
      try {
        const posts = await redditService.getTrendingPosts(subreddit, 10)
        const sciencePosts = posts.filter(post => {
          const text = `${post.title} ${post.content || ''}`.toLowerCase()
          return SCIENCE_KEYWORDS.some(keyword => text.includes(keyword))
        })
        
        allPosts.push(...sciencePosts.map(post => ({
          ...post,
          platform: 'reddit',
          science_score: calculateScienceTrendingScore(post, 'reddit')
        })))
      } catch (error) {
        console.error(`Error fetching from r/${subreddit}:`, error)
      }
    }
    
    // Fetch from other RSS sources
    for (const source of ALL_SOCIAL_SOURCES) {
      if (source.id === 'reddit') continue // Skip reddit as we handled it above
      
      try {
        const posts = await rssSocialService.fetchPosts(source.url, 15)
        const sciencePosts = posts.filter(post => {
          const text = `${post.title} ${post.summary || ''}`.toLowerCase()
          return SCIENCE_KEYWORDS.some(keyword => text.includes(keyword))
        })
        
        allPosts.push(...sciencePosts.map(post => ({
          ...post,
          platform: source.name.toLowerCase(),
          science_score: calculateScienceTrendingScore(post, source.name.toLowerCase())
        })))
      } catch (error) {
        console.error(`Error fetching from ${source.name}:`, error)
      }
    }
    
    // Sort by science score and get top posts
    const topPosts = allPosts
      .sort((a, b) => (b.science_score || 0) - (a.science_score || 0))
      .slice(0, 100)
    
    // Group by platforms
    topPosts.forEach(post => {
      if (!platformMap.has(post.platform)) {
        platformMap.set(post.platform, [])
      }
      platformMap.get(post.platform)!.push(post)
    })
    
    // Extract trending keywords
    const keywordMap = new Map<string, { count: number, platforms: Set<string>, posts: any[] }>()
    
    topPosts.forEach(post => {
      const keywords = extractScienceKeywords(`${post.title} ${post.content || post.summary || ''}`)
      
      keywords.forEach(keyword => {
        if (!keywordMap.has(keyword)) {
          keywordMap.set(keyword, { count: 0, platforms: new Set(), posts: [] })
        }
        
        const entry = keywordMap.get(keyword)!
        entry.count++
        entry.platforms.add(post.platform)
        entry.posts.push({
          title: post.title,
          url: post.url || post.link,
          platform: post.platform,
          score: post.science_score
        })
      })
    })
    
    // Convert to trending topics
    const trendingTopics: TrendingTopic[] = Array.from(keywordMap.entries())
      .filter(([keyword, data]) => data.count >= 2) // At least 2 mentions
      .map(([keyword, data]) => ({
        keyword,
        count: data.count,
        platforms: Array.from(data.platforms),
        posts: data.posts
          .sort((a, b) => (b.score || 0) - (a.score || 0))
          .slice(0, 3) // Top 3 posts per keyword
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20) // Top 20 trending science topics
    
    return trendingTopics
    
  } catch (error) {
    console.error('Error fetching science trending topics:', error)
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔬 Fetching science trending topics...')
    
    const trendingTopics = await getScienceTrendingTopics()
    
    // Group by platforms
    const redditTopics = trendingTopics.filter(topic => topic.platforms.includes('reddit'))
    const techCommunityTopics = trendingTopics.filter(topic => 
      topic.platforms.some(platform => platform !== 'reddit')
    )
    
    const response = {
      success: true,
      data: {
        reddit: {
          name: 'Reddit Science',
          icon: '/logos/reddit-logo.png',
          topics: redditTopics.slice(0, 10),
          totalTopics: redditTopics.length
        },
        tech_communities: {
          name: 'Science Communities',
          icon: '/logos/tech-logo.png',
          topics: techCommunityTopics.slice(0, 10),
          totalTopics: techCommunityTopics.length
        }
      },
      totalTopics: trendingTopics.length,
      timestamp: new Date().toISOString()
    }
    
    console.log(`🔬 Found ${trendingTopics.length} science trending topics`)
    console.log(`📊 Reddit: ${redditTopics.length}, Tech Communities: ${techCommunityTopics.length}`)
    
    return NextResponse.json(response)
    
  } catch (error: any) {
    console.error('Error in science topics API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch science trending topics',
        details: error.message 
      },
      { status: 500 }
    )
  }
}



