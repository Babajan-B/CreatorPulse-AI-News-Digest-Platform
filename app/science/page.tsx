"use client"

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Microscope, 
  Calendar,
  ExternalLink,
  Loader2,
  RefreshCw,
  BookOpen,
  Users,
  TrendingUp,
  ArrowLeft,
  FlaskConical,
  Send,
  Share2,
  Mail,
  Twitter,
  Linkedin,
  Facebook,
  Copy,
  Rss,
  Mic,
  FileText
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { VoiceModelDialog } from '@/components/voice-model-dialog'
import { toast } from 'sonner'
import { StatsDashboard } from '@/components/stats-dashboard'
import { ScienceTrendingTopics } from '@/components/science-trending-topics'

interface ScienceArticle {
  id: string
  title: string
  summary: string
  content: string
  url: string
  source: string
  category: string
  published_at: string
  importance_score: number
  bullet_points?: string[]
  hashtags?: string[]
}

interface ScienceStats {
  totalArticles: number
  topCategories: Record<string, number>
  avgImportanceScore: number
  sourcesCount: number
}

export default function SciencePage() {
  const router = useRouter()
  const [articles, setArticles] = useState<ScienceArticle[]>([])
  const [stats, setStats] = useState<ScienceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [sendingDigest, setSendingDigest] = useState(false)
  const [sendingEmail, setSendingEmail] = useState<string | null>(null)
  const [voiceTrained, setVoiceTrained] = useState(false)
  const [sourcesCount, setSourcesCount] = useState(0)
  const [showVoiceDialog, setShowVoiceDialog] = useState(false)
  const [pendingArticle, setPendingArticle] = useState<ScienceArticle | null>(null)

  useEffect(() => {
    loadScienceContent()
  }, [])

  // Fetch voice training and sources status
  useEffect(() => {
    Promise.all([
      fetch('/api/voice-training').then(r => r.json()),
      fetch('/api/sources').then(r => r.json())
    ]).then(([voiceData, sourcesData]) => {
      if (voiceData.success) {
        setVoiceTrained(voiceData.trained || false)
      }
      if (sourcesData.success) {
        setSourcesCount(sourcesData.sources?.length || 0)
      }
    }).catch(() => {})
  }, [])

  const loadScienceContent = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dual-mode/today?mode=science_breakthrough')
      const data = await response.json()
      
      if (data.success) {
        setArticles(data.articles || [])
        setStats(data.stats || null)
      } else {
        console.error('Failed to load science content:', data.error)
        toast.error('Failed to load science content')
      }
    } catch (error) {
      console.error('Error loading science content:', error)
      toast.error('Failed to load science content')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await loadScienceContent()
      toast.success('Science content refreshed!')
    } catch (error) {
      toast.error('Failed to refresh content')
    } finally {
      setRefreshing(false)
    }
  }

  const handleSendDigest = async () => {
    setSendingDigest(true)
    try {
      const top5Articles = articles.slice(0, 5).map(article => ({
        title: article.title,
        summary: article.summary,
        url: article.url,
        source: article.source,
        publishedAt: article.published_at,
        bulletPoints: article.bullet_points,
        hashtags: article.hashtags
      }))

      const response = await fetch('/api/science/send-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articles: top5Articles }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(
          `Science digest sent to ${data.email.to}!`,
          {
            description: `${data.email.articleCount} research articles with summaries`,
            duration: 5000,
          }
        )
      } else {
        if (data.error?.includes('Not authenticated')) {
          toast.error('Please login to send digest', {
            action: {
              label: 'Login',
              onClick: () => window.location.href = '/login',
            },
          })
        } else {
          toast.error(data.error || 'Failed to send digest')
        }
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setSendingDigest(false)
    }
  }

  const handleSendArticleEmail = async (article: ScienceArticle, useVoiceModel: boolean) => {
    setSendingEmail(article.id)
    try {
      const response = await fetch('/api/science/send-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: article.title,
          summary: article.summary,
          url: article.url,
          source: article.source,
          publishedAt: article.published_at,
          bulletPoints: article.bullet_points,
          hashtags: article.hashtags,
          use_voice_model: useVoiceModel
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(
          'Research article sent via email!',
          {
            description: `Delivered to ${data.email.to}`,
            duration: 4000,
          }
        )
      } else {
        if (data.error?.includes('Not authenticated')) {
          toast.error('Please login to send articles via email', {
            action: {
              label: 'Login',
              onClick: () => window.location.href = '/login',
            },
          })
        } else {
          toast.error(data.error || 'Failed to send email')
        }
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setSendingEmail(null)
    }
  }

  const handleShare = (article: ScienceArticle, platform: string) => {
    const text = `${article.title} - ${article.source}`
    const url = article.url

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
        break
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
        break
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
        break
      case 'copy':
        navigator.clipboard.writeText(url)
        toast.success('Link copied to clipboard!')
        break
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medical': return <FlaskConical className="h-4 w-4" />
      case 'biology': return <BookOpen className="h-4 w-4" />
      case 'physics': return <TrendingUp className="h-4 w-4" />
      case 'neuroscience': return <Users className="h-4 w-4" />
      case 'chemistry': return <FlaskConical className="h-4 w-4" />
      case 'technology': return <Microscope className="h-4 w-4" />
      default: return <BookOpen className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'medical': return 'bg-red-100 text-red-700 border-red-200'
      case 'biology': return 'bg-green-100 text-green-700 border-green-200'
      case 'physics': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'neuroscience': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'chemistry': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'technology': return 'bg-cyan-100 text-cyan-700 border-cyan-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const topTopics = useMemo(() => {
    if (!stats) return []
    return Object.keys(stats.topCategories).slice(0, 5)
  }, [stats])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-emerald-700 text-lg">Loading latest science breakthroughs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
            <Microscope className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
              Science Breakthroughs
            </h1>
            <p className="text-emerald-600">Latest research discoveries and scientific innovations</p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/select-mode')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Switch Mode
          </Button>
          
          <Button
            onClick={() => router.push('/sources')}
            variant={sourcesCount > 0 ? "outline" : "default"}
            size="sm"
            className="gap-2"
          >
            <Rss className="h-4 w-4" />
            {sourcesCount > 0 ? `Custom Sources (${sourcesCount})` : 'Add Custom Sources'}
          </Button>
          
          <Button
            onClick={() => router.push('/voice-training')}
            variant={voiceTrained ? "outline" : "default"}
            size="sm"
            className="gap-2"
          >
            <Mic className="h-4 w-4" />
            {voiceTrained ? 'Voice Trained ✓' : 'Train Voice'}
          </Button>
          
          <Button
            onClick={() => router.push('/drafts')}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Generate Newsletter
          </Button>
          
          <div className="ml-auto flex gap-2">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          <Button
            onClick={handleSendDigest}
            disabled={sendingDigest || articles.length === 0}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {sendingDigest ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Send Digest
              </>
            )}
          </Button>
        </div>
      </div>
      </div>

      {/* Stats Dashboard */}
      <div className="mb-8">
        <StatsDashboard
          totalArticles={stats?.totalArticles || articles.length}
          averageQuality={stats?.avgImportanceScore || 0}
          topTopics={topTopics}
          activeSources={stats?.sourcesCount || 15}
        />
      </div>

      {/* Trending Topics from Social Media (Science-focused) */}
      <div className="mb-8">
        <ScienceTrendingTopics />
      </div>

      {/* Today's Research Articles */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="h-5 w-5 text-emerald-600" />
          <h2 className="text-xl font-semibold">Today's Top Research</h2>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
            {articles.length} Papers
          </Badge>
        </div>

        {articles.length === 0 ? (
          <Card className="p-12 text-center bg-white">
            <Microscope className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
            <p className="text-emerald-600 text-lg mb-2">No research papers available today</p>
            <p className="text-emerald-500 text-sm">Check back later for latest scientific breakthroughs</p>
          </Card>
        ) : (
          <div className="grid gap-6">
            {articles.map((article, index) => (
              <Card key={article.id} className="p-0 hover:shadow-lg transition-all overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                {/* Card Header with Index */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Badge 
                        variant="secondary" 
                        className="bg-white/20 text-white border-white/30 backdrop-blur-sm flex-shrink-0"
                      >
                        #{index + 1}
                      </Badge>
                      <h3 className="text-lg font-semibold text-white leading-tight">
                        {article.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        onClick={() => {
                          setPendingArticle(article)
                          setShowVoiceDialog(true)
                        }}
                        disabled={sendingEmail === article.id}
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                      >
                        {sendingEmail === article.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Mail className="h-4 w-4" />
                        )}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Share Article</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleShare(article, 'twitter')}>
                            <Twitter className="h-4 w-4 mr-2" />
                            Share on Twitter
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShare(article, 'linkedin')}>
                            <Linkedin className="h-4 w-4 mr-2" />
                            Share on LinkedIn
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShare(article, 'facebook')}>
                            <Facebook className="h-4 w-4 mr-2" />
                            Share on Facebook
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleShare(article, 'copy')}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Link
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-white/20 rounded-md transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 text-white" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  {/* Article Summary */}
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {article.summary}
                  </p>
                  
                  {/* Research Findings */}
                  {article.bullet_points && article.bullet_points.length > 0 && (
                    <div className="bg-white border border-emerald-200 rounded-lg p-4 mb-4">
                      <h4 className="text-sm font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                        <FlaskConical className="h-4 w-4" />
                        Key Research Findings
                      </h4>
                      <ul className="space-y-2">
                        {article.bullet_points.slice(0, 3).map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-emerald-500 mt-1 flex-shrink-0">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Article Metadata */}
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <BookOpen className="h-4 w-4" />
                      <span className="font-medium">{article.source}</span>
                    </div>
                    <Badge variant="outline" className={getCategoryColor(article.category)}>
                      {getCategoryIcon(article.category)}
                      <span className="ml-1 capitalize">{article.category}</span>
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <TrendingUp className="h-4 w-4" />
                      <span>Impact: {article.importance_score}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(article.published_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {/* Research Tags */}
                  {article.hashtags && article.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {article.hashtags.slice(0, 6).map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Voice Model Selection Dialog */}
      <VoiceModelDialog
        open={showVoiceDialog}
        onOpenChange={setShowVoiceDialog}
        voiceTrained={voiceTrained}
        title="Send Science Article via Email"
        description="Choose how to generate the article summary"
        onConfirm={async (useVoice) => {
          if (pendingArticle) {
            await handleSendArticleEmail(pendingArticle, useVoice)
          }
          setPendingArticle(null)
        }}
      />
    </div>
  )
}
