"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Brain, 
  Microscope, 
  TrendingUp, 
  Calendar,
  ExternalLink,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

interface UserMode {
  mode: 'ai_news' | 'science_breakthrough'
  displayName: string
  description: string
  icon: React.ReactNode
  color: string
}

interface TodayArticle {
  id: string
  title: string
  summary: string
  url: string
  source: string
  category: string
  importance_score: number
  bullet_points?: string[]
  hashtags?: string[]
}

interface ModeStats {
  totalArticles: number
  avgImportanceScore: number
  topCategories: { [key: string]: number }
  sourcesCount: number
}

export function ModeDashboard() {
  const [userMode, setUserMode] = useState<UserMode | null>(null)
  const [todayArticles, setTodayArticles] = useState<TodayArticle[]>([])
  const [stats, setStats] = useState<ModeStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const modeConfigs: UserMode[] = [
    {
      mode: 'ai_news',
      displayName: 'AI News',
      description: 'Latest AI developments, models, and tech breakthroughs',
      icon: <Brain className="h-6 w-6" />,
      color: 'from-blue-500 to-purple-600'
    },
    {
      mode: 'science_breakthrough',
      displayName: 'Science Breakthroughs',
      description: 'Medical research, scientific discoveries, and research breakthroughs',
      icon: <Microscope className="h-6 w-6" />,
      color: 'from-green-500 to-teal-600'
    }
  ]

  useEffect(() => {
    loadUserModeAndData()
  }, [])

  const loadUserModeAndData = async () => {
    try {
      setLoading(true)
      
      // Get user settings to determine mode
      const settingsResponse = await fetch('/api/user/settings')
      const settingsData = await settingsResponse.json()
      
      if (!settingsData.success) {
        // Default to AI News if not authenticated or no settings
        const defaultMode = modeConfigs[0]
        setUserMode(defaultMode)
        await loadTodayArticles(defaultMode.mode)
        return
      }

      const preferredMode = settingsData.settings?.preferred_mode || 'ai_news'
      const modeConfig = modeConfigs.find(m => m.mode === preferredMode) || modeConfigs[0]
      
      setUserMode(modeConfig)
      await loadTodayArticles(preferredMode)
      
    } catch (error) {
      console.error('Error loading user mode:', error)
      toast.error('Failed to load user preferences')
      
      // Fallback to AI News
      const defaultMode = modeConfigs[0]
      setUserMode(defaultMode)
      await loadTodayArticles(defaultMode.mode)
    } finally {
      setLoading(false)
    }
  }

  const loadTodayArticles = async (mode: 'ai_news' | 'science_breakthrough') => {
    try {
      const response = await fetch(`/api/dual-mode/today?mode=${mode}`)
      const data = await response.json()
      
      if (data.success) {
        setTodayArticles(data.articles || [])
        setStats(data.stats || null)
      } else {
        console.error('Failed to load today articles:', data.error)
        toast.error('Failed to load today\'s content')
      }
    } catch (error) {
      console.error('Error loading today articles:', error)
      toast.error('Failed to load today\'s content')
    }
  }

  const handleRefresh = async () => {
    if (!userMode) return
    
    setRefreshing(true)
    try {
      await loadTodayArticles(userMode.mode)
      toast.success('Content refreshed successfully!')
    } catch (error) {
      toast.error('Failed to refresh content')
    } finally {
      setRefreshing(false)
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading your content...</span>
        </div>
      </Card>
    )
  }

  if (!userMode) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Unable to load your preferences</p>
          <Button 
            onClick={loadUserModeAndData} 
            variant="outline" 
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Mode Header */}
      <Card className={`bg-gradient-to-r ${userMode.color} text-white border-0`}>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                {userMode.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{userMode.displayName}</h2>
                <p className="text-white/90 text-sm mt-1">{userMode.description}</p>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="secondary"
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-0"
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-2xl font-bold">{stats.totalArticles}</div>
                <div className="text-sm text-white/80">Articles Today</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-2xl font-bold">{stats.avgImportanceScore}</div>
                <div className="text-sm text-white/80">Avg Importance</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-2xl font-bold">{Object.keys(stats.topCategories).length}</div>
                <div className="text-sm text-white/80">Categories</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-2xl font-bold">{stats.sourcesCount}</div>
                <div className="text-sm text-white/80">Sources</div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Today's Top Articles */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Today's Top Articles</h3>
            <Badge variant="secondary">{todayArticles.length}</Badge>
          </div>

          {todayArticles.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No articles available for today</p>
              <p className="text-sm text-muted-foreground mt-2">
                Check back later or try refreshing
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayArticles.slice(0, 5).map((article, index) => (
                <div
                  key={article.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <Badge 
                      variant="outline" 
                      className="w-8 h-8 flex items-center justify-center p-0 flex-shrink-0 mt-1"
                    >
                      {index + 1}
                    </Badge>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium line-clamp-2 mb-2">
                            {article.title}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {article.summary}
                          </p>
                          
                          {/* Bullet Points */}
                          {article.bullet_points && article.bullet_points.length > 0 && (
                            <ul className="text-sm space-y-1 mb-3">
                              {article.bullet_points.slice(0, 2).map((point, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-muted-foreground">•</span>
                                  <span className="line-clamp-1">{point}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{article.source}</span>
                            <span>•</span>
                            <span>{article.category}</span>
                            <span>•</span>
                            <span>Score: {article.importance_score}</span>
                          </div>
                        </div>
                        
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 p-2 hover:bg-muted rounded-md transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                      
                      {/* Hashtags */}
                      {article.hashtags && article.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {article.hashtags.slice(0, 5).map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

