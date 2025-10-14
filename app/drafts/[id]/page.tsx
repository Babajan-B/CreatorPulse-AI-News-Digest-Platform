'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { 
  Save, Send, Eye, Edit3, Loader2, ArrowLeft, Clock, 
  ThumbsUp, ThumbsDown, CheckCircle2 
} from 'lucide-react'

interface Article {
  title: string
  summary: string
  url: string
  source: string
  commentary?: string
}

interface Draft {
  id: string
  title: string
  content_intro: string
  curated_articles: Article[]
  trends_section: any
  closing: string
  commentary: string
  status: string
  generated_at: string
  review_time_seconds: number | null
}

export default function DraftEditorPage() {
  const router = useRouter()
  const params = useParams()
  const draftId = params.id as string

  const [draft, setDraft] = useState<Draft | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [approving, setApproving] = useState(false)
  const [mode, setMode] = useState<'edit' | 'preview'>('preview')
  const [startTime] = useState(Date.now())
  
  // Editable fields
  const [editedIntro, setEditedIntro] = useState('')
  const [editedClosing, setEditedClosing] = useState('')
  const [editCount, setEditCount] = useState(0)

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      pending: { 
        className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
        label: 'Pending Review'
      },
      approved: { 
        className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
        label: 'Approved'
      },
      sent: { 
        className: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
        label: 'Sent'
      },
      discarded: { 
        className: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20',
        label: 'Discarded'
      }
    }

    const variant = variants[status] || variants.pending

    return (
      <Badge variant="outline" className={variant.className}>
        {variant.label}
      </Badge>
    )
  }

  useEffect(() => {
    fetchDraft()
  }, [draftId])

  const fetchDraft = async () => {
    try {
      const response = await fetch(`/api/drafts/${draftId}`)
      const data = await response.json()
      
      if (data.success) {
        setDraft(data.draft)
        setEditedIntro(data.draft.content_intro || '')
        setEditedClosing(data.draft.closing || '')
      } else {
        toast.error(data.error || 'Failed to load draft')
        router.push('/drafts')
      }
    } catch (error) {
      console.error('Error fetching draft:', error)
      toast.error('Failed to load draft')
      router.push('/drafts')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!draft) return

    setSaving(true)
    try {
      const response = await fetch(`/api/drafts/${draftId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_intro: editedIntro,
          closing: editedClosing,
          edit_count: editCount + 1
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Draft saved successfully!')
        setEditCount(editCount + 1)
      } else {
        toast.error(data.error || 'Failed to save draft')
      }
    } catch (error) {
      console.error('Error saving draft:', error)
      toast.error('Failed to save draft')
    } finally {
      setSaving(false)
    }
  }

  const handleApproveAndSend = async () => {
    if (!draft) return

    const reviewTimeSeconds = Math.round((Date.now() - startTime) / 1000)

    setApproving(true)
    try {
      const response = await fetch(`/api/drafts/${draftId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          review_time_seconds: reviewTimeSeconds
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Draft approved and sent successfully!')
        router.push('/drafts')
      } else {
        toast.error(data.error || 'Failed to send draft')
      }
    } catch (error) {
      console.error('Error approving draft:', error)
      toast.error('Failed to send draft')
    } finally {
      setApproving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-lg text-muted-foreground">Loading draft...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!draft) return null

  const reviewTimeMinutes = Math.round((Date.now() - startTime) / 1000 / 60)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/drafts')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Drafts
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">{draft.title}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Review time: {reviewTimeMinutes} min
                {reviewTimeMinutes < 20 && <span className="text-green-600 ml-1">✓ Under 20 min goal!</span>}
              </span>
              <span>• {draft.curated_articles.length} articles</span>
            </div>
          </div>
          {getStatusBadge(draft.status)}
        </div>
      </div>

      {/* Mode Toggle */}
      <Tabs value={mode} onValueChange={(v) => setMode(v as 'edit' | 'preview')} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="preview" className="gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="edit" className="gap-2">
            <Edit3 className="h-4 w-4" />
            Edit
          </TabsTrigger>
        </TabsList>

        {/* Preview Mode */}
        <TabsContent value="preview" className="space-y-6">
          {/* Introduction */}
          <Card className="p-6">
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground">INTRODUCTION</h3>
            <p className="whitespace-pre-wrap text-base leading-relaxed">{editedIntro}</p>
          </Card>

          {/* Articles */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">CURATED ARTICLES</h3>
            {draft.curated_articles.map((article, index) => (
              <Card key={index} className="p-6">
                <div className="mb-3 flex items-start justify-between">
                  <h4 className="flex-1 text-lg font-semibold">{article.title}</h4>
                  <Badge variant="outline">{article.source}</Badge>
                </div>
                <p className="mb-3 text-muted-foreground">{article.summary}</p>
                {article.commentary && (
                  <div className="rounded-lg border-l-4 border-primary bg-primary/5 p-3">
                    <p className="text-sm italic">{article.commentary}</p>
                  </div>
                )}
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm text-primary hover:underline"
                >
                  Read full article →
                </a>
              </Card>
            ))}
          </div>

          {/* Trends Section */}
          {draft.trends_section?.top_3_trends && draft.trends_section.top_3_trends.length > 0 && (
            <Card className="p-6 bg-gradient-to-br from-accent/10 to-primary/10">
              <h3 className="mb-4 text-lg font-semibold">🔥 Trends to Watch</h3>
              <div className="space-y-3">
                {draft.trends_section.top_3_trends.map((trend: any, index: number) => (
                  <div key={index}>
                    <h4 className="font-semibold">{index + 1}. {trend.topic}</h4>
                    <p className="text-sm text-muted-foreground">{trend.explainer}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Closing */}
          <Card className="p-6">
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground">CLOSING</h3>
            <p className="whitespace-pre-wrap text-base leading-relaxed">{editedClosing}</p>
          </Card>
        </TabsContent>

        {/* Edit Mode */}
        <TabsContent value="edit" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-3 text-sm font-semibold">Introduction</h3>
            <Textarea
              value={editedIntro}
              onChange={(e) => setEditedIntro(e.target.value)}
              className="min-h-[150px]"
              placeholder="Edit your introduction..."
            />
          </Card>

          <Card className="p-6 border-dashed">
            <p className="text-sm text-muted-foreground">
              Article content and commentary editing coming soon. For now, use the preview to review content.
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="mb-3 text-sm font-semibold">Closing</h3>
            <Textarea
              value={editedClosing}
              onChange={(e) => setEditedClosing(e.target.value)}
              className="min-h-[150px]"
              placeholder="Edit your closing..."
            />
          </Card>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving} variant="outline">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            <Button onClick={() => setMode('preview')} variant="ghost">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      {draft.status === 'pending' && (
        <Card className="p-6 border-primary/50 bg-primary/5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Ready to send?</h3>
              <p className="text-sm text-muted-foreground">
                Review time: {reviewTimeMinutes} min {reviewTimeMinutes < 20 ? '(✓ Under goal!)' : ''}
              </p>
            </div>
            <Button
              onClick={handleApproveAndSend}
              disabled={approving}
              className="gap-2 bg-gradient-to-r from-green-600 to-green-500"
            >
              {approving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Approve & Send
                </>
              )}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}




