"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { StatsDashboard } from "@/components/stats-dashboard"
import { NewsCard } from "@/components/news-card"
import { AISearchBar } from "@/components/ai-search-bar"
import { TopicFilter } from "@/components/topic-filter"
import { IntroPage } from "@/components/intro-page"
import { PlatformIcons } from "@/components/platform-icons"
import { TrendingTopics } from "@/components/trending-topics"
import { toast } from "sonner"

interface Article {
  id: string
  title: string
  summary: string
  imageUrl?: string
  source: string
  sourceLogo: string
  qualityScore: number
  tags: string[]
  url: string
  author?: string
  publishedAt: string
}

const mockArticles: Article[] = [
  {
    id: "1",
    title: "OpenAI Announces GPT-5: The Next Generation of Language Models",
    summary:
      "OpenAI unveils GPT-5 with groundbreaking multimodal capabilities, improved reasoning, and enhanced safety features. The model shows significant improvements in complex problem-solving and creative tasks.",
    imageUrl: "/futuristic-ai-technology-neural-network.jpg",
    source: "TechCrunch",
    sourceLogo: "/logos/techcrunch.jpg",
    qualityScore: 9.2,
    tags: ["AI", "OpenAI", "GPT-5", "Machine Learning"],
    url: "#",
  },
  {
    id: "2",
    title: "Meta Releases Open-Source AI Model Rivaling Proprietary Solutions",
    summary:
      "Meta's latest open-source AI model demonstrates performance comparable to closed-source alternatives, marking a significant shift in the AI landscape and democratizing access to advanced AI technology.",
    imageUrl: "/open-source-code-collaboration-technology.jpg",
    source: "The Verge",
    sourceLogo: "/logos/theverge.jpg",
    qualityScore: 8.7,
    tags: ["Meta", "Open Source", "AI Models"],
    url: "#",
  },
  {
    id: "3",
    title: "AI-Powered Drug Discovery Leads to Breakthrough in Cancer Treatment",
    summary:
      "Researchers using AI algorithms have identified a promising new compound for cancer treatment, reducing drug discovery time from years to months and opening new possibilities for personalized medicine.",
    imageUrl: "/medical-research-laboratory-microscope.jpg",
    source: "Nature",
    sourceLogo: "/logos/nature.jpg",
    qualityScore: 9.5,
    tags: ["Healthcare", "Drug Discovery", "Cancer Research", "Biotechnology"],
    url: "#",
  },
  {
    id: "4",
    title: "Google DeepMind's AlphaFold 3 Predicts Protein Structures with 99% Accuracy",
    summary:
      "The latest iteration of AlphaFold achieves unprecedented accuracy in protein structure prediction, accelerating biological research and drug development across multiple fields of study.",
    imageUrl: "/protein-structure-molecular-biology.jpg",
    source: "Science Daily",
    sourceLogo: "/logos/sciencedaily.jpg",
    qualityScore: 9.1,
    tags: ["DeepMind", "Protein Folding", "Biotechnology"],
    url: "#",
  },
  {
    id: "5",
    title: "AI Regulation Framework Proposed by EU Parliament",
    summary:
      "The European Parliament introduces comprehensive AI regulation framework focusing on transparency, accountability, and ethical use of artificial intelligence systems across member states.",
    imageUrl: "/european-parliament-government-building.jpg",
    source: "Reuters",
    sourceLogo: "/logos/reuters.jpg",
    qualityScore: 7.8,
    tags: ["Regulation", "EU", "AI Policy", "Ethics"],
    url: "#",
  },
  {
    id: "6",
    title: "Anthropic's Claude 3 Shows Improved Reasoning Capabilities",
    summary:
      "Anthropic releases Claude 3 with enhanced reasoning abilities and better understanding of complex instructions, positioning itself as a strong competitor in the AI assistant market.",
    imageUrl: "/artificial-intelligence-brain-neural-pathways.jpg",
    source: "VentureBeat",
    sourceLogo: "/logos/venturebeat.jpg",
    qualityScore: 8.4,
    tags: ["Anthropic", "Claude", "AI Assistants", "Machine Learning"],
    url: "#",
  },
  {
    id: "7",
    title: "AI-Generated Content Detection Tools Reach 95% Accuracy",
    summary:
      "New detection algorithms can now identify AI-generated text, images, and videos with remarkable accuracy, addressing concerns about misinformation and content authenticity.",
    imageUrl: "/digital-fingerprint-security-verification.jpg",
    source: "MIT Technology Review",
    sourceLogo: "/logos/mit-tech-review.jpg",
    qualityScore: 8.0,
    tags: ["Content Detection", "Security", "Misinformation"],
    url: "#",
  },
  {
    id: "8",
    title: "Startup Raises $100M for AI-Powered Climate Change Solutions",
    summary:
      "A promising startup secures major funding to develop AI systems that optimize renewable energy distribution and predict climate patterns with unprecedented accuracy.",
    imageUrl: "/renewable-energy-solar-panels-wind-turbines.jpg",
    source: "Bloomberg",
    sourceLogo: "/logos/bloomberg.jpg",
    qualityScore: 7.5,
    tags: ["Climate Tech", "Funding", "Renewable Energy"],
    url: "#",
  },
  {
    id: "9",
    title: "AI Coding Assistants Now Write 40% of Code at Major Tech Companies",
    summary:
      "Industry report reveals that AI-powered coding tools like GitHub Copilot and others are now responsible for a significant portion of code written at leading technology companies.",
    imageUrl: "/programmer-coding-on-multiple-monitors.jpg",
    source: "GitHub Blog",
    sourceLogo: "/logos/github.jpg",
    qualityScore: 8.2,
    tags: ["Developer Tools", "Coding", "Productivity"],
    url: "#",
  },
]

export default function HomePage() {
  const router = useRouter()
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [showIntro, setShowIntro] = useState(true)
  const [articles, setArticles] = useState<Article[]>(mockArticles)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sendingDigest, setSendingDigest] = useState(false)
  const [modeChecked, setModeChecked] = useState(false)

  // Check if user has seen intro
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const hasSeenIntro = localStorage.getItem("hasSeenIntro")
      if (hasSeenIntro) {
        setShowIntro(false)
        // After intro is completed, check mode preference
        const preferredMode = localStorage.getItem('preferred_mode')
        if (!preferredMode) {
          router.push('/select-mode')
        } else if (preferredMode === 'science_breakthrough') {
          router.push('/science')
        } else {
          setModeChecked(true)
        }
      }
    }
  }, [router])

  // Fetch real RSS articles
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/articles?limit=50')
        const data = await response.json()
        
        if (data.success && data.articles.length > 0) {
          setArticles(data.articles)
          console.log(`Loaded ${data.articles.length} real articles from RSS feeds`)
        } else {
          console.log('No articles found, using mock data')
        }
      } catch (err: any) {
        console.error('Error fetching articles:', err)
        setError(err.message)
        // Keep using mock data on error
      } finally {
        setLoading(false)
      }
    }

    if (!showIntro) {
      fetchArticles()
    }
  }, [showIntro])

  const handleIntroComplete = () => {
    localStorage.setItem("hasSeenIntro", "true")
    setShowIntro(false)
    
    // After intro, check for mode preference
    const preferredMode = localStorage.getItem('preferred_mode')
    if (!preferredMode) {
      router.push('/select-mode')
    } else if (preferredMode === 'science_breakthrough') {
      router.push('/science')
    } else {
      setModeChecked(true)
    }
  }

  const handleSendDigest = async () => {
    setSendingDigest(true)
    try {
      // First generate digest
      const generateResponse = await fetch('/api/digest/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 5 }),
      })

      const generateData = await generateResponse.json()

      if (!generateData.success) {
        if (generateData.error.includes('Not authenticated')) {
          toast.error('Please login to send digest', {
            action: {
              label: 'Login',
              onClick: () => window.location.href = '/login',
            },
          })
          return
        }
        toast.error(generateData.error || 'Failed to generate digest')
        return
      }

      // Then send via email
      const sendResponse = await fetch('/api/digest/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articles: generateData.digest.articles }),
      })

      const sendData = await sendResponse.json()

      if (sendData.success) {
        toast.success(
          `Daily digest sent to ${sendData.email.to}!`,
          {
            description: `${sendData.email.articleCount} articles with AI summaries`,
            duration: 5000,
          }
        )
      } else {
        toast.error(sendData.error || 'Failed to send digest')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setSendingDigest(false)
    }
  }

  const allTopics = useMemo(() => {
    const topicsSet = new Set<string>()
    articles.forEach((article) => {
      article.tags.forEach((tag) => topicsSet.add(tag))
    })
    return Array.from(topicsSet).sort()
  }, [articles])

  const filteredArticles = useMemo(() => {
    if (!selectedTopic) return articles
    return articles.filter((article) => article.tags.includes(selectedTopic))
  }, [selectedTopic, articles])

  const stats = {
    totalArticles: filteredArticles.length,
    averageQuality: filteredArticles.reduce((acc, article) => acc + article.qualityScore, 0) / filteredArticles.length,
    topTopics: allTopics.slice(0, 5),
    activeSources: new Set(articles.map((a) => a.source)).size,
  }

  // Show loading only if we're on client side and checking mode preferences
  if (typeof window !== 'undefined' && !showIntro && !modeChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  if (showIntro) {
    return <IntroPage onComplete={handleIntroComplete} />
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="mb-2 text-balance text-4xl font-bold tracking-tight sm:text-5xl">Today's AI Digest</h1>
          <p className="text-pretty text-lg text-muted-foreground">
            Curated news and insights from the world of artificial intelligence
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSendDigest}
            disabled={sendingDigest || loading}
            className="rounded-lg border-2 border-accent bg-accent/10 px-4 py-2 text-sm font-medium text-accent shadow-md transition-all hover:bg-accent/20 hover:shadow-lg disabled:opacity-50"
          >
            {sendingDigest ? '📧 Sending...' : '📧 Send Daily Digest'}
          </button>
          
          <button
            onClick={() => {
              setLoading(true)
              fetch('/api/articles?limit=50')
                .then(res => res.json())
                .then(data => {
                  if (data.success) setArticles(data.articles)
                  setLoading(false)
                })
                .catch(() => setLoading(false))
            }}
            disabled={loading}
            className="rounded-lg bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-medium text-primary-foreground shadow-md transition-all hover:shadow-lg disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh Feed'}
          </button>
        </div>
      </div>

      <PlatformIcons />

      <div className="mb-8">
        <AISearchBar />
      </div>


      {/* Trending Topics from Social Media */}
      <TrendingTopics />

      {/* Stats Dashboard */}
      <div className="mb-8">
        <StatsDashboard
          totalArticles={stats.totalArticles}
          averageQuality={stats.averageQuality}
          topTopics={stats.topTopics}
          activeSources={stats.activeSources}
        />
      </div>

      {/* Loading/Error States */}
      {loading && (
        <div className="mb-8 rounded-lg border border-border bg-muted/50 p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading fresh AI news from {stats.activeSources} sources...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-8 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4 text-center">
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            Using cached data. Live feed temporarily unavailable.
          </p>
        </div>
      )}

      <div className="mb-8">
        <TopicFilter topics={allTopics} selectedTopic={selectedTopic} onTopicChange={setSelectedTopic} />
      </div>

      {selectedTopic && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredArticles.length} article{filteredArticles.length !== 1 ? "s" : ""} for{" "}
            <span className="font-semibold text-foreground">{selectedTopic}</span>
          </p>
        </div>
      )}

      {/* News Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredArticles.map((article) => (
          <NewsCard key={article.id} {...article} />
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 bg-muted/20 p-8 text-center">
          <p className="text-lg font-medium text-muted-foreground">No articles found for this topic</p>
          <p className="mt-2 text-sm text-muted-foreground">Try selecting a different technology filter</p>
        </div>
      )}
    </div>
  )
}
