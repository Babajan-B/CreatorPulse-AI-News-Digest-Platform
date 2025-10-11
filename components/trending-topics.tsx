"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TrendingUp, ExternalLink, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface TrendingTopic {
  keyword: string
  count: number
  url: string
  title: string
  platform: string
}

interface PlatformData {
  name: string
  icon: string
  topics: TrendingTopic[]
  color: string
}

export function TrendingTopics() {
  const [platforms, setPlatforms] = useState<PlatformData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformData | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    fetchTrendingTopics()
  }, [])

  const fetchTrendingTopics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/social/topics')
      const data = await response.json()
      
      if (data.success) {
        setPlatforms(data.platforms)
      }
    } catch (error) {
      console.error('Error fetching trending topics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlatformClick = (platform: PlatformData) => {
    setSelectedPlatform(platform)
    setDialogOpen(true)
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Trending on Social Media</h2>
          <p className="text-muted-foreground text-sm">
            Top AI discussions from tech communities
          </p>
        </div>
        <Link href="/social">
          <Button variant="ghost" size="sm" className="gap-1">
            View All
            <ExternalLink className="h-3 w-3" />
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-3 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {platforms.map((platform) => {
            // Map platform names to logo files
            const logoMap: { [key: string]: string } = {
              'Reddit': '/logos/reddit-logo.png',
              'Tech Communities': '/logos/tech-logo.png'
            };
            
            const logoPath = logoMap[platform.name];
            
            return (
              <Card key={platform.name} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Header */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-b">
                    <div className="w-6 h-6 flex items-center justify-center">
                      {logoPath ? (
                        <Image
                          src={logoPath}
                          alt={platform.name}
                          width={24}
                          height={24}
                          className="object-contain"
                        />
                      ) : (
                        <div className="text-lg">{platform.icon}</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{platform.name}</h3>
                    </div>
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      {platform.topics.length}
                    </Badge>
                  </div>

                  {/* Topics List */}
                  <div className="divide-y">
                    {platform.topics.slice(0, 5).map((topic, index) => (
                      <a
                        key={index}
                        href={topic.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 hover:bg-muted/50 transition-colors group"
                      >
                        <Badge variant="outline" className="text-xs font-semibold w-6 h-5 flex items-center justify-center p-0">
                          {index + 1}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium line-clamp-1 group-hover:text-primary transition-colors">
                            {topic.title}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs px-1.5 py-0">
                          {topic.keyword}
                        </Badge>
                        <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog for showing trending topics */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              {selectedPlatform && (() => {
                const logoMap: { [key: string]: string } = {
                  'Reddit': '/logos/reddit-logo.png',
                  'Tech Communities': '/logos/tech-logo.png'
                };
                const logoPath = logoMap[selectedPlatform.name];
                
                return logoPath ? (
                  <Image
                    src={logoPath}
                    alt={selectedPlatform.name}
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                ) : (
                  <span className="text-4xl">{selectedPlatform.icon}</span>
                );
              })()}
              <div>
                <div>{selectedPlatform?.name}</div>
                <div className="text-sm font-normal text-muted-foreground mt-1">
                  Trending AI Topics & Discussions
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {selectedPlatform?.topics.map((topic, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-1">
                      #{index + 1}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base mb-2 line-clamp-2">
                        {topic.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {topic.count} mentions
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {topic.keyword}
                        </Badge>
                      </div>
                      <a
                        href={topic.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        Read discussion
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
