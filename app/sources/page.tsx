'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus, Trash2, Edit, ExternalLink, Twitter, Youtube, Rss, Loader2 } from 'lucide-react'

interface Source {
  id: string
  source_type: 'twitter' | 'youtube' | 'rss' | 'newsletter'
  source_identifier: string
  source_name: string
  priority_weight: number
  enabled: boolean
  last_fetched_at: string | null
  created_at: string
}

export default function SourcesPage() {
  const router = useRouter()
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // Form state
  const [sourceType, setSourceType] = useState<'twitter' | 'youtube' | 'rss' | 'newsletter'>('twitter')
  const [sourceIdentifier, setSourceIdentifier] = useState('')
  const [sourceName, setSourceName] = useState('')
  const [priorityWeight, setPriorityWeight] = useState(5)

  useEffect(() => {
    fetchSources()
  }, [])

  const fetchSources = async () => {
    try {
      const response = await fetch('/api/sources')
      const data = await response.json()
      
      if (data.success) {
        setSources(data.sources)
      } else {
        toast.error(data.error || 'Failed to load sources')
      }
    } catch (error) {
      console.error('Error fetching sources:', error)
      toast.error('Failed to load sources')
    } finally {
      setLoading(false)
    }
  }

  const handleAddSource = async () => {
    if (!sourceIdentifier.trim()) {
      toast.error('Please enter a source identifier')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_type: sourceType,
          source_identifier: sourceIdentifier,
          source_name: sourceName || undefined,
          priority_weight: priorityWeight
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Source added successfully')
        setIsDialogOpen(false)
        resetForm()
        fetchSources()
      } else {
        toast.error(data.error || 'Failed to add source')
      }
    } catch (error) {
      console.error('Error adding source:', error)
      toast.error('Failed to add source')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSource = async (id: string) => {
    if (!confirm('Are you sure you want to delete this source?')) return

    try {
      const response = await fetch(`/api/sources/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Source deleted')
        fetchSources()
      } else {
        toast.error(data.error || 'Failed to delete source')
      }
    } catch (error) {
      console.error('Error deleting source:', error)
      toast.error('Failed to delete source')
    }
  }

  const handleToggleSource = async (id: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/sources/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Source ${enabled ? 'enabled' : 'disabled'}`)
        fetchSources()
      } else {
        toast.error(data.error || 'Failed to update source')
      }
    } catch (error) {
      console.error('Error toggling source:', error)
      toast.error('Failed to update source')
    }
  }

  const resetForm = () => {
    setSourceType('twitter')
    setSourceIdentifier('')
    setSourceName('')
    setPriorityWeight(5)
  }

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'twitter': return <Twitter className="h-5 w-5 text-blue-500" />
      case 'youtube': return <Youtube className="h-5 w-5 text-red-500" />
      case 'rss': return <Rss className="h-5 w-5 text-orange-500" />
      default: return <Rss className="h-5 w-5 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-lg text-muted-foreground">Loading sources...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight">Custom Sources</h1>
          <p className="text-lg text-muted-foreground">
            Manage your Twitter, YouTube, and RSS content sources
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Source
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Source</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="source-type">Source Type</Label>
                <Select value={sourceType} onValueChange={(value: any) => setSourceType(value)}>
                  <SelectTrigger id="source-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="twitter">
                      <div className="flex items-center gap-2">
                        <Twitter className="h-4 w-4" />
                        Twitter Handle
                      </div>
                    </SelectItem>
                    <SelectItem value="youtube">
                      <div className="flex items-center gap-2">
                        <Youtube className="h-4 w-4" />
                        YouTube Channel
                      </div>
                    </SelectItem>
                    <SelectItem value="rss">
                      <div className="flex items-center gap-2">
                        <Rss className="h-4 w-4" />
                        RSS Feed
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="source-identifier">
                  {sourceType === 'twitter' && 'Twitter Handle (e.g., @username)'}
                  {sourceType === 'youtube' && 'YouTube Channel ID'}
                  {sourceType === 'rss' && 'RSS Feed URL'}
                </Label>
                <Input
                  id="source-identifier"
                  value={sourceIdentifier}
                  onChange={(e) => setSourceIdentifier(e.target.value)}
                  placeholder={
                    sourceType === 'twitter' ? '@elonmusk' :
                    sourceType === 'youtube' ? 'UC_channel_id' :
                    'https://example.com/feed.xml'
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="source-name">Display Name (Optional)</Label>
                <Input
                  id="source-name"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  placeholder="My Favorite Source"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority Weight (1-10)</Label>
                <Input
                  id="priority"
                  type="number"
                  min="1"
                  max="10"
                  value={priorityWeight}
                  onChange={(e) => setPriorityWeight(parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Higher priority sources are ranked higher in your digest
                </p>
              </div>

              <Button
                onClick={handleAddSource}
                disabled={saving}
                className="w-full"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Source
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sources List */}
      {sources.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">No custom sources yet</h3>
          <p className="mb-4 text-muted-foreground">
            Add Twitter handles, YouTube channels, or RSS feeds to customize your content
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Source
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sources.map((source) => (
            <Card key={source.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getSourceIcon(source.source_type)}
                  <div>
                    <h3 className="font-semibold">
                      {source.source_name || source.source_identifier}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {source.source_identifier}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Priority: {source.priority_weight}/10</span>
                      {source.last_fetched_at && (
                        <span>• Last fetched: {new Date(source.last_fetched_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={source.enabled}
                    onCheckedChange={(enabled) => handleToggleSource(source.id, enabled)}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleDeleteSource(source.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
                {source.source_type === 'rss' && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={source.source_identifier} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}




