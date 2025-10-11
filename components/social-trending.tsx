"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  MessageCircle, 
  Heart, 
  Share, 
  TrendingUp, 
  ExternalLink,
  RefreshCw,
  Search,
  Calendar,
  User,
  Hash,
  Mail,
  Twitter,
  Linkedin,
  Facebook,
  Link as LinkIcon
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

interface SocialMediaPost {
  id: string;
  title: string;
  content: string;
  author: string;
  source: string;
  url: string;
  score: number;
  comments: number;
  shares?: number;
  engagement_rate?: number;
  created_at: string;
  image?: string;
  trending_score: number;
  platform: 'reddit' | 'linkedin';
  category: string;
  trending_reason: string;
  hashtags?: string[];
  mentions?: string[];
}

interface TrendingStats {
  platforms: {
    reddit: { active_sources: number; total_posts: number };
    hackernews: { active_sources: number; total_posts: number };
    lobsters: { active_sources: number; total_posts: number };
    slashdot: { active_sources: number; total_posts: number };
    producthunt: { active_sources: number; total_posts: number };
    combined: { total_sources: number; total_posts: number };
  };
  trending_hashtags: Array<{ hashtag: string; count: number; platforms: string[] }>;
  top_authors: Array<{ author: string; platform: string; posts_count: number; total_score: number; avg_engagement: number }>;
}

export function SocialTrending() {
  const [trendingPosts, setTrendingPosts] = useState<SocialMediaPost[]>([])
  const [stats, setStats] = useState<TrendingStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'reddit' | 'hackernews' | 'lobsters' | 'slashdot' | 'producthunt'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchTrendingContent = async (platform?: 'reddit' | 'hackernews' | 'lobsters' | 'slashdot' | 'producthunt') => {
    try {
      setLoading(true)
      
      const url = platform 
        ? `/api/social/trending?platform=${platform}&limit=25`
        : '/api/social/trending?limit=100'
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.success) {
        setTrendingPosts(data.data)
      } else {
        toast.error('Failed to fetch trending content')
      }
    } catch (error) {
      console.error('Error fetching trending content:', error)
      toast.error('Error fetching trending content')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/social/stats')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const searchPosts = async (query: string) => {
    if (!query.trim()) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/social/search?q=${encodeURIComponent(query)}&limit=25`)
      const data = await response.json()
      
      if (data.success) {
        setTrendingPosts(data.data)
        toast.success(`Found ${data.count} results for "${query}"`)
      } else {
        toast.error('Search failed')
      }
    } catch (error) {
      console.error('Error searching:', error)
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrendingContent()
    fetchStats()
  }, [])

  const filteredPosts = activeTab === 'all' 
    ? trendingPosts 
    : trendingPosts.filter(post => post.platform === activeTab)

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'reddit':
        return '🔴'
      case 'hackernews':
        return '🟠'
      case 'lobsters':
        return '🦞'
      case 'slashdot':
        return '⚡'
      case 'producthunt':
        return '🚀'
      default:
        return '📱'
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'reddit':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'hackernews':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'lobsters':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'slashdot':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'producthunt':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleSendEmail = async (post: SocialMediaPost) => {
    try {
      const response = await fetch('/api/social/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: post.title,
          content: post.content,
          url: post.url,
          author: post.author,
          source: post.source,
          platform: post.platform,
          created_at: post.created_at
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Post sent via email!', {
          description: `Sent to ${data.email.to}`,
          duration: 5000
        })
      } else {
        if (data.error?.includes('Not authenticated')) {
          toast.error('Please login to send emails', {
            action: {
              label: 'Login',
              onClick: () => window.location.href = '/login'
            }
          })
        } else {
          toast.error(data.error || 'Failed to send email')
        }
      }
    } catch (error) {
      console.error('Error sending email:', error)
      toast.error('Failed to send email')
    }
  }

  const handleShareTwitter = (post: SocialMediaPost) => {
    const text = `${post.title}\n\n${post.content.substring(0, 200)}...`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(post.url)}`
    window.open(url, '_blank', 'width=550,height=420')
    toast.success('Opening Twitter share dialog')
  }

  const handleShareLinkedIn = (post: SocialMediaPost) => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(post.url)}`
    window.open(url, '_blank', 'width=550,height=420')
    toast.success('Opening LinkedIn share dialog')
  }

  const handleShareFacebook = (post: SocialMediaPost) => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(post.url)}`
    window.open(url, '_blank', 'width=550,height=420')
    toast.success('Opening Facebook share dialog')
  }

  const handleCopyLink = async (post: SocialMediaPost) => {
    try {
      await navigator.clipboard.writeText(post.url)
      toast.success('Link copied to clipboard!')
    } catch (error) {
      console.error('Error copying link:', error)
      toast.error('Failed to copy link')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Social Media Trending</h2>
            <p className="text-muted-foreground">
              Latest discussions from Reddit, Hacker News, Lobsters, Slashdot, and Product Hunt
            </p>
          </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchTrendingContent()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sources</CardTitle>
              <Hash className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.platforms.combined.total_sources}</div>
              <p className="text-xs text-muted-foreground">
                Across 5 platforms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.platforms.combined.total_posts}</div>
              <p className="text-xs text-muted-foreground">
                From all platforms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trending Hashtags</CardTitle>
              <Hash className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.trending_hashtags.length}</div>
              <p className="text-xs text-muted-foreground">
                Most active: {stats.trending_hashtags[0]?.hashtag || 'N/A'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Authors</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.top_authors.length}</div>
              <p className="text-xs text-muted-foreground">
                Leading: {stats.top_authors[0]?.author || 'N/A'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search social media posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchPosts(searchQuery)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm"
              />
            </div>
            <Button onClick={() => searchPosts(searchQuery)} disabled={!searchQuery.trim()}>
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="reddit">Reddit</TabsTrigger>
          <TabsTrigger value="hackernews">HN</TabsTrigger>
          <TabsTrigger value="lobsters">Lobsters</TabsTrigger>
          <TabsTrigger value="slashdot">Slashdot</TabsTrigger>
          <TabsTrigger value="producthunt">PH</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading trending content...
            </div>
          ) : filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No trending content found</h3>
                  <p className="text-muted-foreground">
                    Try refreshing or checking back later for new discussions.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getPlatformColor(post.platform)}>
                            {getPlatformIcon(post.platform)} {post.platform}
                          </Badge>
                          <Badge variant="outline">{post.category}</Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        
                        <h3 className="font-semibold text-lg leading-tight mb-2 line-clamp-2">
                          {post.title}
                        </h3>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {post.author}
                          </span>
                          <span>{post.source}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSendEmail(post)}
                          title="Send via Email"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Share className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleShareTwitter(post)}>
                              <Twitter className="mr-2 h-4 w-4" />
                              Share on Twitter/X
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleShareLinkedIn(post)}>
                              <Linkedin className="mr-2 h-4 w-4" />
                              Share on LinkedIn
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleShareFacebook(post)}>
                              <Facebook className="mr-2 h-4 w-4" />
                              Share on Facebook
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCopyLink(post)}>
                              <LinkIcon className="mr-2 h-4 w-4" />
                              Copy Link
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {post.content}
                    </p>

                    {/* Hashtags */}
                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.hashtags.slice(0, 5).map((hashtag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {hashtag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Engagement Stats */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {post.score}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {post.comments}
                        </span>
                        {post.shares && (
                          <span className="flex items-center gap-1">
                            <Share className="h-3 w-3" />
                            {post.shares}
                          </span>
                        )}
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Trending: {Math.round(post.trending_score)}
                        </span>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a href={post.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View
                        </a>
                      </Button>
                    </div>

                    {/* Trending Reason */}
                    <div className="mt-2 text-xs text-muted-foreground">
                      {post.trending_reason}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
