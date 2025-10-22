"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Star, Calendar, Filter, TrendingUp } from "lucide-react"
import { toast } from "sonner"

interface Article {
  id: string
  title: string
  summary: string
  source: string
  qualityScore: number
  publishedAt: string
  tags: string[]
  url: string
}

interface ArticleSelectorProps {
  onSelectionChange: (selectedIds: string[]) => void
  selectedArticles: string[]
}

export function ArticleSelector({ onSelectionChange, selectedArticles }: ArticleSelectorProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const [minQuality, setMinQuality] = useState(7)
  const [maxDaysOld, setMaxDaysOld] = useState(7) // NEW: Custom date filter
  const [trendingTopics, setTrendingTopics] = useState<string[]>([])
  const [availableSources, setAvailableSources] = useState<string[]>([])

  useEffect(() => {
    fetchArticles()
  }, [])

  useEffect(() => {
    filterArticles()
  }, [articles, searchQuery, selectedTopic, selectedSource, minQuality, maxDaysOld])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      // Force fresh data, no cache
      const response = await fetch('/api/articles?limit=100&cache=false&t=' + Date.now())
      const data = await response.json()
      
      if (data.success && data.articles) {
        setArticles(data.articles)
        
        // Extract trending topics
        const topicsMap = new Map<string, number>()
        data.articles.forEach((article: Article) => {
          article.tags.forEach((tag: string) => {
            topicsMap.set(tag, (topicsMap.get(tag) || 0) + 1)
          })
        })
        
        const sortedTopics = Array.from(topicsMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([topic]) => topic)
        
        setTrendingTopics(sortedTopics)
        
        // Extract unique sources
        const sourcesSet = new Set<string>()
        data.articles.forEach((article: Article) => {
          if (article.source) {
            sourcesSet.add(article.source)
          }
        })
        
        const sortedSources = Array.from(sourcesSet).sort()
        setAvailableSources(sortedSources)
      } else {
        toast.error("Failed to load articles")
      }
    } catch (error) {
      toast.error("Error fetching articles")
    } finally {
      setLoading(false)
    }
  }

  const filterArticles = () => {
    let filtered = [...articles]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.summary.toLowerCase().includes(query) ||
          article.source.toLowerCase().includes(query) ||
          article.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    // Filter by selected topic
    if (selectedTopic) {
      filtered = filtered.filter((article) =>
        article.tags.includes(selectedTopic)
      )
    }

    // Filter by selected source
    if (selectedSource) {
      filtered = filtered.filter((article) =>
        article.source === selectedSource
      )
    }

    // Filter by quality score
    filtered = filtered.filter((article) => article.qualityScore >= minQuality)

    // NEW: Filter by date (custom days)
    if (maxDaysOld > 0) {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - maxDaysOld)
      
      filtered = filtered.filter((article) => {
        const publishedDate = new Date(article.publishedAt)
        return publishedDate >= cutoffDate
      })
    }

    setFilteredArticles(filtered)
  }

  const handleToggleArticle = (articleId: string) => {
    const newSelection = selectedArticles.includes(articleId)
      ? selectedArticles.filter((id) => id !== articleId)
      : [...selectedArticles, articleId]
    
    onSelectionChange(newSelection)
  }

  const handleSelectAll = () => {
    onSelectionChange(filteredArticles.map((article) => article.id))
  }

  const handleClearAll = () => {
    onSelectionChange([])
  }

  const getQualityColor = (score: number) => {
    if (score >= 8) return "text-green-600"
    if (score >= 6) return "text-blue-600"
    return "text-yellow-600"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 24) return `${hours} hours ago`
    const days = Math.floor(hours / 24)
    return `${days} days ago`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading articles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by keywords, topics, or sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Quality Filter */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Min Quality:</span>
          <div className="flex gap-2">
            {[6, 7, 8, 9].map((score) => (
              <Button
                key={score}
                variant={minQuality === score ? "default" : "outline"}
                size="sm"
                onClick={() => setMinQuality(score)}
              >
                {score}+ <Star className="ml-1 h-3 w-3" />
              </Button>
            ))}
          </div>
        </div>

        {/* NEW: Date Filter */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Published Within:</span>
          <div className="flex gap-2">
            {[1, 3, 7, 14, 30].map((days) => (
              <Button
                key={days}
                variant={maxDaysOld === days ? "default" : "outline"}
                size="sm"
                onClick={() => setMaxDaysOld(days)}
              >
                <Calendar className="mr-1 h-3 w-3" />
                {days === 1 ? 'Today' : days === 7 ? '1 Week' : days === 14 ? '2 Weeks' : days === 30 ? '1 Month' : `${days} Days`}
              </Button>
            ))}
          </div>
        </div>

        {/* Trending Topics */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <TrendingUp className="h-4 w-4 text-primary" />
            Trending Topics
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingTopics.map((topic) => (
              <Badge
                key={topic}
                variant={selectedTopic === topic ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() =>
                  setSelectedTopic(selectedTopic === topic ? null : topic)
                }
              >
                {topic}
              </Badge>
            ))}
          </div>
        </div>

        {/* RSS Sources Filter */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Filter className="h-4 w-4 text-primary" />
            Filter by RSS Source ({availableSources.length} sources)
          </div>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {availableSources.map((source) => (
              <Badge
                key={source}
                variant={selectedSource === source ? "default" : "secondary"}
                className="cursor-pointer hover:bg-primary/80 transition-colors"
                onClick={() =>
                  setSelectedSource(selectedSource === source ? null : source)
                }
              >
                {source}
              </Badge>
            ))}
          </div>
          {selectedSource && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedSource(null)}
              className="text-xs"
            >
              Clear source filter
            </Button>
          )}
        </div>
      </div>

      {/* Selection Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {selectedArticles.length} of {filteredArticles.length} articles selected
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            Select All
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearAll}>
            Clear All
          </Button>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredArticles.map((article) => (
          <Card
            key={article.id}
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedArticles.includes(article.id)
                ? "ring-2 ring-primary bg-primary/5"
                : ""
            }`}
            onClick={() => handleToggleArticle(article.id)}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={selectedArticles.includes(article.id)}
                onCheckedChange={() => handleToggleArticle(article.id)}
                className="mt-1"
              />
              <div className="flex-1 space-y-2">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-tight line-clamp-2">
                    {article.title}
                  </h3>
                  <div className={`flex items-center gap-1 text-sm font-medium ${getQualityColor(article.qualityScore)}`}>
                    <Star className="h-3 w-3 fill-current" />
                    {article.qualityScore.toFixed(1)}
                  </div>
                </div>

                {/* Summary */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {article.summary}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-medium text-primary">{article.source}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(article.publishedAt)}
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {article.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {article.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{article.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-lg font-medium text-muted-foreground">
            No articles found matching your filters
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Try adjusting your search or quality filters
          </p>
        </div>
      )}
    </div>
  )
}

