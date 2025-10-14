'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { FileText, Loader2, Plus, Clock, CheckCircle2, XCircle, Send, Eye } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Draft {
  id: string
  title: string
  status: 'pending' | 'approved' | 'sent' | 'discarded'
  generated_at: string
  reviewed_at: string | null
  sent_at: string | null
  review_time_seconds: number | null
  edit_count: number
  curated_articles: any[]
}

export default function DraftsPage() {
  const router = useRouter()
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetchDrafts()
  }, [])

  const fetchDrafts = async () => {
    try {
      const response = await fetch('/api/drafts')
      const data = await response.json()
      
      if (data.success) {
        setDrafts(data.drafts || [])
        if (data.message) {
          // Show gentle message if not logged in
          console.log(data.message)
        }
      } else {
        toast.error(data.error || 'Failed to load drafts')
      }
    } catch (error) {
      console.error('Error fetching drafts:', error)
      toast.error('Failed to load drafts')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateDraft = async () => {
    setGenerating(true)
    try {
      const response = await fetch('/api/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          max_articles: 10,
          include_trends: true
        })
      })

      const data = await response.json()

      if (data.needsAuth) {
        toast.error('Please login to generate drafts', {
          action: {
            label: 'Login',
            onClick: () => router.push('/login'),
          },
        })
        return
      }

      if (data.success && data.draft) {
        toast.success('Draft generated successfully!')
        router.push(`/drafts/${data.draft.id}`)
      } else {
        toast.error(data.error || 'Failed to generate draft')
      }
    } catch (error) {
      console.error('Error generating draft:', error)
      toast.error('Failed to generate draft')
    } finally {
      setGenerating(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />
      case 'sent':
        return <Send className="h-4 w-4 text-green-500" />
      case 'discarded':
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
      approved: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
      sent: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
      discarded: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20'
    }
    
    return (
      <Badge className={variants[status] || ''}>
        <span className="flex items-center gap-1">
          {getStatusIcon(status)}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-lg text-muted-foreground">Loading drafts...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight">Newsletter Drafts</h1>
          <p className="text-lg text-muted-foreground">
            AI-generated drafts in your unique writing style
          </p>
        </div>
        
        <Button
          onClick={handleGenerateDraft}
          disabled={generating}
          className="gap-2 bg-gradient-to-r from-primary to-accent"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Generate New Draft
            </>
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Drafts</div>
          <div className="mt-1 text-2xl font-bold">{drafts.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Pending Review</div>
          <div className="mt-1 text-2xl font-bold text-yellow-600">
            {drafts.filter(d => d.status === 'pending').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Sent</div>
          <div className="mt-1 text-2xl font-bold text-green-600">
            {drafts.filter(d => d.status === 'sent').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Avg Review Time</div>
          <div className="mt-1 text-2xl font-bold">
            {drafts.filter(d => d.review_time_seconds).length > 0
              ? Math.round(drafts.reduce((sum, d) => sum + (d.review_time_seconds || 0), 0) / 
                  drafts.filter(d => d.review_time_seconds).length / 60)
              : 0} min
          </div>
        </Card>
      </div>

      {/* Drafts List */}
      {drafts.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">No drafts yet</h3>
          <p className="mb-4 text-muted-foreground">
            Generate your first AI-powered newsletter draft in your writing style
          </p>
          <Button
            onClick={handleGenerateDraft}
            disabled={generating}
            className="gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Generate First Draft
              </>
            )}
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <Card key={draft.id} className="p-6 hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{draft.title}</h3>
                    {getStatusBadge(draft.status)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Generated {formatDistanceToNow(new Date(draft.generated_at), { addSuffix: true })}
                    </span>
                    {draft.review_time_seconds && (
                      <span>• Review time: {Math.round(draft.review_time_seconds / 60)} min</span>
                    )}
                    <span>• {draft.curated_articles?.length || 0} articles</span>
                    {draft.edit_count > 0 && (
                      <span>• {draft.edit_count} edits</span>
                    )}
                  </div>

                  {draft.sent_at && (
                    <div className="text-sm text-green-600 dark:text-green-400">
                      ✓ Sent {formatDistanceToNow(new Date(draft.sent_at), { addSuffix: true })}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/drafts/${draft.id}`)}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    {draft.status === 'pending' ? 'Review' : 'View'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}




