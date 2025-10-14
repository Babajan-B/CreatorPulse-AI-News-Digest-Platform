"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  TrendingUp,
  Mail,
  MousePointerClick,
  DollarSign,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  RefreshCw,
  Loader2,
  Eye,
  Target,
  Award,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnalyticsData {
  overview: {
    total_sent: number
    total_delivered: number
    total_opened: number
    total_clicked: number
    total_bounced: number
    open_rate: number
    click_through_rate: number
    engagement_rate: number
  }
  article_performance: Array<{
    article_id: string
    title: string
    clicks: number
    engagement_rate: number
  }>
  source_performance: Array<{
    source: string
    articles_sent: number
    total_clicks: number
    avg_engagement: number
  }>
  roi: {
    time_saved_per_day: number
    time_saved_per_month: number
    estimated_cost_savings: number
    roi_percentage: number
  }
  trends: Array<{
    date: string
    sent: number
    opened: number
    clicked: number
  }>
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState(30)
  const [hourlyRate, setHourlyRate] = useState(50)

  useEffect(() => {
    loadAnalytics()
  }, [timeRange, hourlyRate])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics?days=${timeRange}&hourly_rate=${hourlyRate}`)
      const data = await response.json()
      
      if (response.ok) {
        setAnalytics(data)
      } else {
        console.error('Failed to load analytics:', data.error)
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadAnalytics()
    setRefreshing(false)
  }

  const exportData = () => {
    if (!analytics) return
    
    const csvContent = `
Analytics Report - ${new Date().toLocaleDateString()}

EMAIL METRICS
Total Sent: ${analytics.overview.total_sent}
Total Delivered: ${analytics.overview.total_delivered}
Total Opened: ${analytics.overview.total_opened}
Total Clicked: ${analytics.overview.total_clicked}
Open Rate: ${analytics.overview.open_rate}%
Click-Through Rate: ${analytics.overview.click_through_rate}%

ROI METRICS
Time Saved Per Day: ${analytics.roi.time_saved_per_day} minutes
Time Saved Per Month: ${(analytics.roi.time_saved_per_month / 60).toFixed(1)} hours
Cost Savings: $${analytics.roi.estimated_cost_savings.toFixed(2)}
ROI: ${analytics.roi.roi_percentage}%

TOP ARTICLES
${analytics.article_performance.slice(0, 10).map((article, i) => 
  `${i + 1}. ${article.title} - ${article.clicks} clicks (${article.engagement_rate.toFixed(1)}%)`
).join('\n')}
    `.trim()

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `creatorpulse-analytics-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-purple-700 text-lg">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Analytics Data</h3>
            <p className="text-muted-foreground mb-4">
              Start sending digests to see your analytics
            </p>
            <Button onClick={() => router.push('/')}>Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getTrendDirection = (current: number, previous: number) => {
    if (current > previous) return 'up'
    if (current < previous) return 'down'
    return 'neutral'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Track your email performance and ROI
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(parseInt(e.target.value))}
                className="px-4 py-2 border rounded-lg bg-white"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
              
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                size="icon"
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
              
              <Button onClick={exportData} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Total Sent */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Total Sent</CardDescription>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.overview.total_sent}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.overview.total_delivered} delivered
              </p>
            </CardContent>
          </Card>

          {/* Open Rate */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Open Rate</CardDescription>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.overview.open_rate}%</div>
              <div className="flex items-center gap-1 mt-1">
                {analytics.overview.open_rate > 35 ? (
                  <>
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600">Above average</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-3 w-3 text-amber-500" />
                    <span className="text-xs text-amber-600">Below target (35%)</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Click-Through Rate */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Click-Through Rate</CardDescription>
                <MousePointerClick className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.overview.click_through_rate}%</div>
              <div className="flex items-center gap-1 mt-1">
                {analytics.overview.click_through_rate > 8 ? (
                  <>
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600">Excellent</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-3 w-3 text-amber-500" />
                    <span className="text-xs text-amber-600">Below target (8%)</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Engagement Rate */}
          <Card className="border-l-4 border-l-pink-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Engagement Rate</CardDescription>
                <Target className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.overview.engagement_rate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.overview.total_clicked} total clicks
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ROI Section */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="bg-gradient-to-br from-purple-500 to-blue-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Return on Investment
              </CardTitle>
              <CardDescription className="text-purple-100">
                Time and cost savings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-purple-100 mb-1">Monthly Cost Savings</div>
                <div className="text-4xl font-bold">
                  ${analytics.roi.estimated_cost_savings.toFixed(0)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-purple-400">
                <div>
                  <div className="text-sm text-purple-100">Time Saved/Day</div>
                  <div className="text-2xl font-semibold">{analytics.roi.time_saved_per_day} min</div>
                </div>
                <div>
                  <div className="text-sm text-purple-100">Time Saved/Month</div>
                  <div className="text-2xl font-semibold">
                    {(analytics.roi.time_saved_per_month / 60).toFixed(1)} hrs
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-purple-400">
                <div className="text-sm text-purple-100 mb-2">ROI Calculation</div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Hourly Rate: ${hourlyRate}</span>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(parseInt(e.target.value) || 50)}
                    className="w-20 px-2 py-1 rounded bg-white/20 border border-white/30 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Time Savings Breakdown
              </CardTitle>
              <CardDescription>How CreatorPulse saves your time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Manual Research</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: '100%' }} />
                    </div>
                    <span className="text-sm font-medium w-16 text-right">120 min</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Content Curation</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: '50%' }} />
                    </div>
                    <span className="text-sm font-medium w-16 text-right">60 min</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Writing & Editing</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: '40%' }} />
                    </div>
                    <span className="text-sm font-medium w-16 text-right">45 min</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">With CreatorPulse</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      -93% time
                    </Badge>
                    <span className="text-lg font-bold text-green-600">15 min</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Articles */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Performing Articles
            </CardTitle>
            <CardDescription>Most clicked articles in your digests</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.article_performance.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No article data yet. Send some digests to see performance!
              </p>
            ) : (
              <div className="space-y-3">
                {analytics.article_performance.slice(0, 10).map((article, index) => (
                  <div
                    key={article.article_id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Badge variant="secondary" className="flex-shrink-0">
                        #{index + 1}
                      </Badge>
                      <span className="text-sm font-medium truncate">{article.title}</span>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-semibold">{article.clicks}</div>
                        <div className="text-xs text-muted-foreground">clicks</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-600">
                          {article.engagement_rate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">engaged</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Source Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Source Performance
            </CardTitle>
            <CardDescription>Which sources drive the most engagement</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.source_performance.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No source data yet
              </p>
            ) : (
              <div className="space-y-3">
                {analytics.source_performance.slice(0, 10).map((source, index) => (
                  <div
                    key={source.source}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium">{source.source}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm font-semibold">{source.articles_sent}</div>
                        <div className="text-xs text-muted-foreground">articles</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{source.total_clicks}</div>
                        <div className="text-xs text-muted-foreground">clicks</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-blue-600">
                          {source.avg_engagement.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">engagement</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

