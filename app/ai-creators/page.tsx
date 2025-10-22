'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { RefreshCcw, Twitter, Youtube, ExternalLink, Heart, Repeat2, MessageCircle, Eye, ThumbsUp, Loader2, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

interface Creator {
  id: string
  name: string
  handle: string
  platform: string
  title?: string
  category: string
  avatar_url?: string
  verified: boolean
  profile_url: string
  follower_count?: number
  content: any[]
}

export default function AICreatorsPage() {
  const [activeTab, setActiveTab] = useState<'twitter' | 'youtube'>('twitter')
  const [creators, setCreators] = useState<Creator[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<string | null>(null)

  useEffect(() => {
    fetchCreators(activeTab)
  }, [activeTab])

  const fetchCreators = async (platform: 'twitter' | 'youtube') => {
    setLoading(true)
    try {
      const response = await fetch(`/api/ai-creators?platform=${platform}`)
      const data = await response.json()

      if (data.success) {
        setCreators(data.data.creators)
        setLastRefresh(data.data.lastRefresh)
      } else {
        toast.error(data.error || 'Failed to load creators')
      }
    } catch (error) {
      console.error('Error fetching creators:', error)
      toast.error('Failed to load creators')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const response = await fetch('/api/ai-creators/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: activeTab })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Refreshed! Fetched ${data.data.itemsFetched} new items from ${data.data.creatorsRefreshed} creators`)
        fetchCreators(activeTab) // Reload data
      } else {
        toast.error(data.error || 'Failed to refresh content')
      }
    } catch (error) {
      console.error('Error refreshing:', error)
      toast.error('Failed to refresh content')
    } finally {
      setRefreshing(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'founder': return 'bg-purple-500/10 text-purple-700 dark:text-purple-300'
      case 'researcher': return 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
      case 'educator': return 'bg-green-500/10 text-green-700 dark:text-green-300'
      case 'creator': return 'bg-orange-500/10 text-orange-700 dark:text-orange-300'
      default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-lg text-muted-foreground">Loading AI creators...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold tracking-tight">AI Creators & Videos</h1>
            <p className="text-lg text-muted-foreground">
              Latest insights from top AI thought leaders and creators
            </p>
          </div>

          {/* Refresh Button */}
          <div className="flex items-center gap-4">
            {lastRefresh && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Last updated</p>
                <p className="text-sm font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(lastRefresh), { addSuffix: true })}
                </p>
              </div>
            )}
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2"
            >
              {refreshing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCcw className="h-4 w-4" />
                  Refresh Content
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Info Banner */}
        <Card className="mt-4 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30 p-4">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 dark:text-blue-400 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
            <div className="flex-1 text-sm text-blue-800 dark:text-blue-200">
              <strong>Manual Refresh:</strong> Click the refresh button to fetch new content. To conserve API usage, you can refresh once every 10 minutes per platform.
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'twitter' | 'youtube')}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="twitter" className="gap-2">
            <Twitter className="h-4 w-4" />
            X (Twitter)
          </TabsTrigger>
          <TabsTrigger value="youtube" className="gap-2">
            <Youtube className="h-4 w-4" />
            YouTube
          </TabsTrigger>
        </TabsList>

        {/* Twitter Content */}
        <TabsContent value="twitter" className="mt-6 space-y-6">
          {creators.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <Twitter className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tweets yet</h3>
              <p className="text-muted-foreground mb-4">Click the refresh button to fetch the latest tweets</p>
              <Button onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
                Refresh Now
              </Button>
            </Card>
          ) : (
            creators.map((creator) => (
              <Card key={creator.id} className="overflow-hidden">
                {/* Creator Header */}
                <div className="border-b bg-muted/30 p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2 border-background shadow-lg">
                      <AvatarImage src={creator.avatar_url} alt={creator.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-lg">
                        {creator.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold">{creator.name}</h3>
                        {creator.verified && (
                          <svg className="h-5 w-5 text-blue-500" viewBox="0 0 22 22" fill="currentColor">
                            <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path>
                          </svg>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{creator.title}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={getCategoryColor(creator.category)}>
                          {creator.category}
                        </Badge>
                        <a
                          href={creator.profile_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        >
                          @{creator.handle}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tweets */}
                <div className="p-6 space-y-4">
                  {creator.content.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No recent tweets</p>
                  ) : (
                    creator.content.map((tweet: any) => (
                      <div key={tweet.id} className="border-l-2 border-blue-500 pl-4 py-2 hover:bg-accent/50 rounded-r transition-colors">
                        <p className="text-sm mb-2 whitespace-pre-wrap">{tweet.content}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {tweet.created_at_twitter && !isNaN(new Date(tweet.created_at_twitter).getTime()) 
                              ? formatDistanceToNow(new Date(tweet.created_at_twitter), { addSuffix: true })
                              : 'Unknown date'
                            }
                          </span>
                          <span className="flex items-center gap-1">
                            <Repeat2 className="h-3 w-3" />
                            {tweet.retweet_count?.toLocaleString() || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {tweet.like_count?.toLocaleString() || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {tweet.reply_count?.toLocaleString() || 0}
                          </span>
                          <a
                            href={tweet.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 ml-auto"
                          >
                            View on X
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {/* YouTube Content */}
        <TabsContent value="youtube" className="mt-6 space-y-6">
          {creators.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <Youtube className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No videos yet</h3>
              <p className="text-muted-foreground mb-4">Click the refresh button to fetch the latest videos</p>
              <Button onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
                Refresh Now
              </Button>
            </Card>
          ) : (
            creators.map((creator) => (
              <Card key={creator.id} className="overflow-hidden">
                {/* Creator Header */}
                <div className="border-b bg-muted/30 p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2 border-background shadow-lg">
                      <AvatarImage src={creator.avatar_url} alt={creator.name} />
                      <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-600 text-white font-bold text-lg">
                        {creator.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold">{creator.name}</h3>
                        {creator.verified && (
                          <svg className="h-5 w-5 text-red-500" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z"/>
                          </svg>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{creator.title}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={getCategoryColor(creator.category)}>
                          {creator.category}
                        </Badge>
                        <a
                          href={creator.profile_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                        >
                          {creator.name}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Videos */}
                <div className="p-6 space-y-3">
                  {creator.content.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No recent videos</p>
                  ) : (
                    creator.content.map((video: any) => (
                      <a
                        key={video.id}
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <div className="flex gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                          {/* Video Thumbnail */}
                          <div className="relative w-40 h-24 flex-shrink-0 bg-gray-200 dark:bg-gray-800 rounded overflow-hidden">
                            <img
                              src={video.thumbnail_url}
                              alt={video.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = `https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg`;
                              }}
                            />
                            <div className="absolute bottom-1 right-1 bg-black/90 text-white text-xs px-1.5 py-0.5 rounded">
                              <Youtube className="h-3 w-3" />
                            </div>
                          </div>

                          {/* Video Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium line-clamp-2 mb-1">
                              {video.title}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {video.published_at && !isNaN(new Date(video.published_at).getTime()) 
                                  ? formatDistanceToNow(new Date(video.published_at), { addSuffix: true })
                                  : 'Unknown date'
                                }
                              </span>
                              {video.view_count > 0 && (
                                <span className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {video.view_count.toLocaleString()}
                                </span>
                              )}
                              {video.like_count > 0 && (
                                <span className="flex items-center gap-1">
                                  <ThumbsUp className="h-3 w-3" />
                                  {video.like_count.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </a>
                    ))
                  )}
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
