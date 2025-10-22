"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, FileText, Star, Rss } from "lucide-react"

interface StatsDashboardProps {
  totalArticles: number
  averageQuality: number
  topTopics: string[]
  activeSources: number
}

export function StatsDashboard({ totalArticles, averageQuality, topTopics, activeSources }: StatsDashboardProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Articles */}
      <Card className="group relative overflow-hidden border-border/50 bg-card p-6 transition-all hover:shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Articles</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">{totalArticles}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
            <FileText className="h-6 w-6" />
          </div>
        </div>
      </Card>

      {/* Average Quality */}
      <Card className="group relative overflow-hidden border-border/50 bg-card p-6 transition-all hover:shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Avg Quality</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">{isNaN(averageQuality) ? '0.0' : averageQuality.toFixed(1)}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent/20">
            <Star className="h-6 w-6" />
          </div>
        </div>
      </Card>

      {/* Top Topics */}
      <Card className="group relative overflow-hidden border-border/50 bg-card p-6 transition-all hover:shadow-lg sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">Top Topics</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {topTopics.slice(0, 3).map((topic) => (
                <Badge key={topic} variant="secondary" className="text-xs font-medium">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-3/10 text-[var(--quality-high)] transition-colors group-hover:bg-chart-3/20">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>
      </Card>

      {/* Active Sources */}
      <Card className="group relative overflow-hidden border-border/50 bg-card p-6 transition-all hover:shadow-lg sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Active Sources</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">{activeSources}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-4/10 text-[var(--quality-medium)] transition-colors group-hover:bg-chart-4/20">
            <Rss className="h-6 w-6" />
          </div>
        </div>
      </Card>
    </div>
  )
}
