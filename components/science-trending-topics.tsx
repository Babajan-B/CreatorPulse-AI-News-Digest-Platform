"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, ExternalLink, ChevronRight } from 'lucide-react'
import Image from 'next/image'

interface ScienceTopic {
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

interface PlatformData {
  name: string
  icon: string
  topics: ScienceTopic[]
  totalTopics: number
}

interface ScienceTrendingData {
  reddit: PlatformData
  tech_communities: PlatformData
  totalTopics: number
}

export function ScienceTrendingTopics() {
  const [data, setData] = useState<ScienceTrendingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState<'reddit' | 'tech_communities' | null>(null)

  useEffect(() => {
    async function fetchScienceTrendingTopics() {
      try {
        const response = await fetch('/api/social/science-topics')
        const result = await response.json()
        
        if (result.success) {
          setData(result.data)
        } else {
          console.error('Failed to fetch science trending topics:', result.error)
        }
      } catch (error) {
        console.error('Error fetching science trending topics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchScienceTrendingTopics()
  }, [])

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-emerald-600" />
          <h2 className="text-xl font-semibold">Science Trending on Social Media</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-emerald-600" />
          <h2 className="text-xl font-semibold">Science Trending on Social Media</h2>
        </div>
        <Card className="p-8 text-center">
          <p className="text-emerald-600">No science trending topics available at the moment.</p>
        </Card>
      </div>
    )
  }

  const platforms = [
    { key: 'reddit' as const, data: data.reddit },
    { key: 'tech_communities' as const, data: data.tech_communities }
  ]

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-emerald-600" />
        <h2 className="text-xl font-semibold">Science Trending on Social Media</h2>
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
          {data.totalTopics} Topics
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {platforms.map(({ key, data: platformData }) => (
          <Dialog key={key}>
            <DialogTrigger asChild>
              <Card className="p-4 cursor-pointer hover:shadow-md transition-all border-emerald-200 hover:border-emerald-300">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <Image
                      src={platformData.icon}
                      alt={platformData.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-emerald-800 truncate">{platformData.name}</h3>
                    <p className="text-sm text-emerald-600">
                      {platformData.totalTopics} science topics trending
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-emerald-600" />
                </div>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="relative w-8 h-8">
                    <Image
                      src={platformData.icon}
                      alt={platformData.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  {platformData.name} - Science Trending Topics
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {platformData.topics.length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                    <p className="text-emerald-600">No science topics trending on {platformData.name} right now.</p>
                  </div>
                ) : (
                  platformData.topics.map((topic, index) => (
                    <div key={topic.keyword} className="border border-emerald-200 rounded-lg p-4 bg-emerald-50/50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300">
                              #{index + 1}
                            </Badge>
                            <h4 className="font-semibold text-emerald-800 capitalize">
                              {topic.keyword}
                            </h4>
                            <Badge variant="secondary" className="bg-emerald-200 text-emerald-800">
                              {topic.count} mentions
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            {topic.posts.slice(0, 3).map((post, postIndex) => (
                              <div key={postIndex} className="flex items-start gap-2 p-2 bg-white rounded border border-emerald-100">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-800 line-clamp-2">
                                    {post.title}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs bg-emerald-100 text-emerald-700">
                                      {post.platform}
                                    </Badge>
                                    {post.score && (
                                      <span className="text-xs text-emerald-600">
                                        Score: {Math.round(post.score)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <a
                                  href={post.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-shrink-0 p-1 hover:bg-emerald-100 rounded transition-colors"
                                >
                                  <ExternalLink className="h-4 w-4 text-emerald-600" />
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  )
}



