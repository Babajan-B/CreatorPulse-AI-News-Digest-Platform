"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MatrixHero } from "@/components/matrix-hero"
import { StatsDashboard } from "@/components/stats-dashboard"
import { NewsCard } from "@/components/news-card"
import { AISearchBar } from "@/components/ai-search-bar"
import { TopicFilter } from "@/components/topic-filter"
import { SourceTypeFilter } from "@/components/source-type-filter"
import { IntroPage } from "@/components/intro-page"
import { PlatformIcons } from "@/components/platform-icons"
import { TrendingTopics } from "@/components/trending-topics"
import { VoiceModelDialog } from "@/components/voice-model-dialog"
import { Button } from "@/components/ui/button"
import { Rss, Mic, FileText, ArrowLeft, Youtube, Twitter } from "lucide-react"
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
  const [selectedSourceType, setSelectedSourceType] = useState<string | null>(null)
  const [customSources, setCustomSources] = useState<any[]>([])
  const [customSourcesCount, setCustomSourcesCount] = useState<Record<string, number>>({})
  const [showIntro, setShowIntro] = useState(true)
  const [articles, setArticles] = useState<Article[]>(mockArticles)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sendingDigest, setSendingDigest] = useState(false)
  const [modeChecked, setModeChecked] = useState(false)
  const [voiceTrained, setVoiceTrained] = useState(false)
  const [sourcesCount, setSourcesCount] = useState(0)
  const [showVoiceDialog, setShowVoiceDialog] = useState(false)
  const [pendingDigestAction, setPendingDigestAction] = useState(false)

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
      } else {
        // If no intro seen, set mode checked to show main content
        setModeChecked(true)
      }
    }
  }, [router])

  // Fetch custom sources
  useEffect(() => {
    const fetchCustomSources = async () => {
      try {
        // Try to get sources for authenticated user first
        const response = await fetch('/api/sources')
        const data = await response.json()
        
        if (data.success) {
          // Convert sources to count by type
          const counts: Record<string, number> = {}
          data.sources.forEach((source: any) => {
            counts[source.source_type] = (counts[source.source_type] || 0) + 1
          })
          setCustomSourcesCount(counts)
          // Store basic source info for filtering
          setCustomSources(data.sources)
        } else if (data.error === 'Unauthorized') {
          // User not logged in, show empty state
          setCustomSources([])
          setCustomSourcesCount({})
        }
      } catch (error) {
        console.error('Error fetching custom sources:', error)
        setCustomSources([])
        setCustomSourcesCount({})
      }
    }

    fetchCustomSources()
  }, [])

  // Fetch latest content when source type is selected
  useEffect(() => {
    const fetchLatestContent = async () => {
      if (!selectedSourceType) return

      try {
        const response = await fetch(`/api/custom-sources?sourceType=${selectedSourceType}`)
        const data = await response.json()
        
        if (data.success) {
          console.log(`🎯 Received ${data.sources.length} sources with content for ${selectedSourceType}`)
          // Update sources with latest content
          setCustomSources(prevSources => {
            const updatedSources = prevSources.map(source => {
              const sourceWithContent = data.sources.find((s: any) => s.id === source.id)
              if (sourceWithContent) {
                console.log(`📺 Updated ${source.source_name} with ${sourceWithContent.latestContent?.length || 0} latest items`)
              }
              return sourceWithContent || source
            })
            return updatedSources
          })
        } else if (data.error === 'Unauthorized') {
          // User not authenticated, don't try to fetch content
          console.log('User not authenticated, cannot fetch latest content')
        }
      } catch (error) {
        console.error('Error fetching latest content:', error)
      }
    }

    fetchLatestContent()
  }, [selectedSourceType])

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

  // Fetch real RSS articles
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Force fresh data with cache-busting parameter
        const response = await fetch('/api/articles?limit=50&cache=false&t=' + Date.now())
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

  const handleSendDigest = async (useVoiceModel: boolean) => {
    setSendingDigest(true)
    try {
      // First generate digest
      const generateResponse = await fetch('/api/digest/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 5, use_voice_model: useVoiceModel }),
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
    let filtered = articles

    // Filter by topic
    if (selectedTopic) {
      filtered = filtered.filter((article) => article.tags.includes(selectedTopic))
    }

    // Filter by source type (custom sources)
    if (selectedSourceType) {
      const customSourceNames = customSources
        .filter(source => source.source_type === selectedSourceType)
        .map(source => source.source_name)
      
      filtered = filtered.filter((article) => 
        customSourceNames.some(name => 
          article.source.toLowerCase().includes(name.toLowerCase())
        )
      )
    }

    return filtered
  }, [articles, selectedTopic, selectedSourceType, customSources])

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
    <>
      <div className="min-h-screen bg-background">
      {/* Hero Section - Matrix Animation */}
      <MatrixHero />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="mb-2 text-balance text-3xl font-bold tracking-tight sm:text-4xl text-gradient">Today's AI Digest</h2>
          <p className="text-pretty text-lg text-muted-foreground mb-4">
            Curated news and insights from the world of artificial intelligence
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="mb-8">
        <div className="flex flex-wrap gap-2">
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
            <button
              onClick={() => {
                setPendingDigestAction(true)
                setShowVoiceDialog(true)
              }}
              disabled={sendingDigest || loading}
              className="rounded-lg border-2 border-accent bg-accent/10 px-4 py-2 text-sm font-medium text-accent shadow-md transition-all hover:bg-accent/20 hover:shadow-lg disabled:opacity-50"
            >
              {sendingDigest ? '📧 Sending...' : '📧 Send Daily Digest'}
            </button>
            
            <button
              onClick={() => {
                setLoading(true)
                // Force fresh data
                fetch('/api/articles?limit=50&cache=false&t=' + Date.now())
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

      <div className="mb-8 space-y-6">
        <TopicFilter topics={allTopics} selectedTopic={selectedTopic} onTopicChange={setSelectedTopic} />
        
        {/* Source Type Filter - Always show, but with different content based on custom sources */}
        <SourceTypeFilter 
          sourceTypes={Object.keys(customSourcesCount).length > 0 ? Object.keys(customSourcesCount) : ['rss', 'youtube', 'twitter']} 
          selectedSourceType={selectedSourceType} 
          onSourceTypeChange={setSelectedSourceType}
          customSourcesCount={customSourcesCount}
        />
      </div>

      {(selectedTopic || selectedSourceType) && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredArticles.length} article{filteredArticles.length !== 1 ? "s" : ""}
            {selectedTopic && (
              <> for <span className="font-semibold text-foreground">{selectedTopic}</span></>
            )}
            {selectedSourceType && (
              <> from <span className="font-semibold text-foreground">{selectedSourceType}</span> sources</>
            )}
          </p>
        </div>
      )}

      {/* News Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredArticles.map((article, index) => (
          <NewsCard key={`${article.id}-${index}`} {...article} />
        ))}
      </div>

      {/* Custom Sources Latest Content */}
      {selectedSourceType && (
        <div className="mt-12">
          <h3 className="mb-6 text-2xl font-bold text-foreground">
            Latest from Your {selectedSourceType === 'twitter' ? 'Twitter/X' : selectedSourceType === 'youtube' ? 'YouTube' : selectedSourceType.toUpperCase()} Sources
          </h3>
          {customSources.filter(s => s.source_type === selectedSourceType).length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {customSources
                .filter(source => source.source_type === selectedSourceType)
                .map((source) => (
                <div key={source.id} className="rounded-lg border bg-card p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      {selectedSourceType === 'twitter' && <Twitter className="h-5 w-5 text-primary" />}
                      {selectedSourceType === 'youtube' && <Youtube className="h-5 w-5 text-primary" />}
                      {selectedSourceType === 'rss' && <Rss className="h-5 w-5 text-primary" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{source.source_name}</h4>
                      <p className="text-sm text-muted-foreground">{source.source_identifier}</p>
                    </div>
                  </div>
                  
                  {source.latestContent && source.latestContent.length > 0 ? (
                    <div className="space-y-3">
                      {source.latestContent.map((content: any, index: number) => (
                        <div key={index} className="rounded-md bg-muted/50 p-3">
                          <h5 className="font-medium text-sm text-foreground line-clamp-2">
                            {content.title}
                          </h5>
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                            {content.content}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {new Date(content.published_at).toLocaleDateString()}
                            </span>
                            <a 
                              href={content.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline"
                            >
                              View →
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">
                        {source.error ? `Error: ${source.error}` : 'No recent content'}
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-4 text-xs text-muted-foreground">
                    Total content: {source.totalContent || 0}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 bg-muted/20 p-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                {selectedSourceType === 'twitter' && <Twitter className="h-8 w-8 text-primary" />}
                {selectedSourceType === 'youtube' && <Youtube className="h-8 w-8 text-primary" />}
                {selectedSourceType === 'rss' && <Rss className="h-8 w-8 text-primary" />}
              </div>
              <h4 className="mb-2 text-lg font-semibold text-foreground">No {selectedSourceType === 'twitter' ? 'Twitter/X' : selectedSourceType === 'youtube' ? 'YouTube' : selectedSourceType.toUpperCase()} Sources</h4>
              <p className="mb-4 text-sm text-muted-foreground">
                {customSources.length === 0 ? 
                  'Please login to add custom sources and see personalized content.' :
                  `Add ${selectedSourceType === 'twitter' ? 'Twitter accounts' : selectedSourceType === 'youtube' ? 'YouTube channels' : 'RSS feeds'} to see content here.`
                }
              </p>
              <div className="flex gap-2">
                {customSources.length === 0 ? (
                  <Button onClick={() => router.push('/login')} className="gap-2">
                    Login to Add Sources
                  </Button>
                ) : (
                  <Button onClick={() => router.push('/sources')} className="gap-2">
                    <Rss className="h-4 w-4" />
                    Add Sources
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {filteredArticles.length === 0 && (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 bg-muted/20 p-8 text-center">
          <p className="text-lg font-medium text-muted-foreground">No articles found for this topic</p>
          <p className="mt-2 text-sm text-muted-foreground">Try selecting a different technology filter</p>
        </div>
      )}

        {/* Voice Model Selection Dialog */}
        <VoiceModelDialog
          open={showVoiceDialog}
          onOpenChange={setShowVoiceDialog}
          voiceTrained={voiceTrained}
          title="Send Daily Digest"
          description="Choose how to generate your daily digest content"
          onConfirm={async (useVoice) => {
            if (pendingDigestAction) {
              await handleSendDigest(useVoice)
              setPendingDigestAction(false)
            }
          }}
        />
      </div>

      {/* Footer Statistics - Rytr Inspired */}
      <footer className="bg-[#1B0F0D] py-16 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">8,000,000+</div>
              <div className="text-lg text-gray-300">happy content creators, marketers & entrepreneurs</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.9/5</div>
              <div className="text-lg text-gray-300">satisfaction rating from 1000+ reviews on Capterra, G2 & more</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">25,000,000+</div>
              <div className="text-lg text-gray-300">hours and $500 million+ saved in content curation so far</div>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </>
  )
}
