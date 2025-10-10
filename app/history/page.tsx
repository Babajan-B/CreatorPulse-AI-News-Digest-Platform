'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, TrendingUp, FileText, Star, ExternalLink, Download, RefreshCw, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface DigestHistory {
  id: string
  date: string
  articlesCount: number
  averageQuality: number
  topTopics: string[]
  status: "completed" | "processing" | "failed"
  sources?: string[]
  items?: Array<{
    id: string
    title: string
    source: string
    url: string
    publishedAt: string
    imageUrl?: string
  }>
}

function getStatusColor(status: DigestHistory["status"]) {
  switch (status) {
    case "completed":
      return "bg-[var(--quality-high)]/10 text-[var(--quality-high)] border-[var(--quality-high)]/20"
    case "processing":
      return "bg-[var(--quality-medium)]/10 text-[var(--quality-medium)] border-[var(--quality-medium)]/20"
    case "failed":
      return "bg-destructive/10 text-destructive border-destructive/20"
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default function HistoryPage() {
  const [history, setHistory] = useState<DigestHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchHistory = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true)
      const response = await fetch('/api/history?limit=30')
      const data = await response.json()

      if (data.success) {
        setHistory(data.history)
        if (showToast) {
          toast.success(`Loaded ${data.count} days of history`)
        }
      } else {
        toast.error('Failed to load history')
      }
    } catch (error) {
      console.error('Error fetching history:', error)
      toast.error('Failed to load history')
    } finally {
      setLoading(false)
      if (showToast) setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-lg text-muted-foreground">Loading history...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="mb-2 text-balance text-4xl font-bold tracking-tight">Digest History</h1>
          <p className="text-pretty text-lg text-muted-foreground">
            View your past AI news collection - {history.length} days archived
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchHistory(true)}
          disabled={refreshing}
          className="transition-all hover:border-primary hover:bg-primary/5"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {history.length === 0 ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="text-center">
            <Calendar className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-xl font-semibold">No History Yet</h3>
            <p className="mt-2 text-muted-foreground">
              Start collecting articles to build your history
            </p>
            <Button asChild className="mt-4">
              <a href="/">Browse Articles</a>
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Timeline */}
          <div className="relative space-y-6">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 h-full w-0.5 bg-gradient-to-b from-primary via-accent to-transparent sm:left-6" />

            {history.map((digest, index) => (
          <div key={digest.id} className="relative pl-12 sm:pl-16">
            {/* Timeline dot */}
            <div className="absolute left-0 top-6 flex h-8 w-8 items-center justify-center rounded-full border-4 border-background bg-gradient-to-br from-primary to-accent sm:left-2">
              <Calendar className="h-4 w-4 text-primary-foreground" />
            </div>

            {/* Content Card */}
            <Card className="group overflow-hidden border-border/50 bg-card transition-all duration-300 hover:shadow-lg">
              <div className="p-6">
                {/* Header */}
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="mb-1 text-xl font-semibold">{formatDate(digest.date)}</h3>
                    <p className="text-sm text-muted-foreground">Digest #{digest.id}</p>
                  </div>
                  <Badge variant="outline" className={getStatusColor(digest.status)}>
                    {digest.status.charAt(0).toUpperCase() + digest.status.slice(1)}
                  </Badge>
                </div>

                {/* Stats Grid */}
                <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Articles</p>
                      <p className="text-lg font-semibold">{digest.articlesCount}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <Star className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Quality</p>
                      <p className="text-lg font-semibold">{digest.averageQuality.toFixed(1)}</p>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center gap-3 rounded-lg bg-muted/50 p-3 sm:col-span-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--quality-high)]/10 text-[var(--quality-high)]">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Topics</p>
                      <p className="text-lg font-semibold">{digest.topTopics.length}</p>
                    </div>
                  </div>
                </div>

                {/* Topics */}
                <div className="mb-4">
                  <p className="mb-2 text-sm font-medium text-muted-foreground">Top Topics</p>
                  <div className="flex flex-wrap gap-2">
                    {digest.topTopics.map((topic) => (
                      <Badge key={topic} variant="secondary" className="font-normal">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Sources */}
                {digest.sources && digest.sources.length > 0 && (
                  <div className="mb-4">
                    <p className="mb-2 text-sm font-medium text-muted-foreground">
                      Sources ({digest.sources.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {digest.sources.map((source) => (
                        <Badge
                          key={source}
                          variant="outline"
                          className="bg-muted/50 font-normal"
                        >
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sample Articles */}
                {digest.items && digest.items.length > 0 && (
                  <div className="mb-4">
                    <p className="mb-2 text-sm font-medium text-muted-foreground">
                      Sample Articles
                    </p>
                    <div className="space-y-2">
                      {digest.items.slice(0, 3).map((item) => (
                        <a
                          key={item.id}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-start gap-3 rounded-lg border border-border/50 bg-muted/30 p-3 transition-all hover:border-primary/50 hover:bg-muted/50"
                        >
                          <div className="flex-1">
                            <h4 className="mb-1 line-clamp-1 text-sm font-medium group-hover:text-primary">
                              {item.title}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {item.source} • {new Date(item.publishedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    className="flex-1 transition-all hover:border-primary hover:bg-primary/5 bg-transparent"
                    asChild
                  >
                    <a href="/" className="flex items-center justify-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      View All Articles
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 transition-all hover:border-accent hover:bg-accent/5 bg-transparent"
                    onClick={() => {
                      toast.success('Export feature coming soon!')
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        ))}
          </div>

          {/* Summary Stats */}
          <div className="mt-8 rounded-lg border border-border/50 bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold">Collection Summary</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">
                  {history.reduce((acc, h) => acc + h.articlesCount, 0)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Total Articles</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-accent">
                  {history.length}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Days Tracked</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-[var(--quality-high)]">
                  {(
                    history.reduce((acc, h) => acc + h.averageQuality, 0) / history.length
                  ).toFixed(1)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Avg Quality</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">
                  {[...new Set(history.flatMap((h) => h.sources || []))].length}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Unique Sources</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
