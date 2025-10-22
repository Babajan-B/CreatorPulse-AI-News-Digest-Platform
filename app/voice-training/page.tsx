'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Upload, Loader2, CheckCircle2, FileText, Sparkles, TrendingUp } from 'lucide-react'

interface VoiceProfile {
  avgSentenceLength: number
  avgParagraphLength: number
  toneMarkers: string[]
  commonPhrases: string[]
  vocabularyLevel: string
  structurePattern: string
}

interface TrainingStatus {
  trained: boolean
  sample_count: number
  voice_profile: VoiceProfile | null
}

export default function VoiceTrainingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [status, setStatus] = useState<TrainingStatus | null>(null)
  const [samples, setSamples] = useState<string>('')
  const [testTopic, setTestTopic] = useState('Latest AI developments and GPT-4 updates')
  const [testResult, setTestResult] = useState<string>('')

  useEffect(() => {
    fetchTrainingStatus()
  }, [])

  const fetchTrainingStatus = async () => {
    try {
      const response = await fetch('/api/voice-training')
      const data = await response.json()
      
      if (data.success) {
        setStatus(data)
      } else {
        toast.error(data.error || 'Failed to load training status')
      }
    } catch (error) {
      console.error('Error fetching status:', error)
      toast.error('Failed to load training status')
    } finally {
      setLoading(false)
    }
  }

  const handleUploadSamples = async () => {
    if (!samples.trim()) {
      toast.error('Please paste at least one newsletter sample')
      return
    }

    // Split samples by double newline
    const sampleArray = samples
      .split('\n\n')
      .filter(s => s.trim().length > 100)

    if (sampleArray.length < 3) {
      toast.error('Please provide at least 3 newsletter samples (separated by double newlines)')
      return
    }

    if (sampleArray.length < 20) {
      toast.warning(`You have ${sampleArray.length} samples. Recommended: 20+ for best results.`)
    }

    setUploading(true)
    try {
      const response = await fetch('/api/voice-training/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: 'text',
          text_samples: sampleArray.map((content, i) => ({
            title: `Newsletter Sample ${i + 1}`,
            content: content.trim(),
            date: new Date().toISOString().split('T')[0]
          }))
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`✅ Successfully trained with ${sampleArray.length} samples!`)
        setSamples('')
        fetchTrainingStatus()
      } else {
        toast.error(data.error || 'Failed to upload samples')
      }
    } catch (error) {
      console.error('Error uploading samples:', error)
      toast.error('Failed to upload samples')
    } finally {
      setUploading(false)
    }
  }

  const handleTestGeneration = async () => {
    if (!testTopic.trim()) {
      toast.error('Please enter a topic to test')
      return
    }

    setTesting(true)
    setTestResult('')
    try {
      const response = await fetch('/api/voice-training/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: testTopic,
          key_points: ['Latest developments', 'Key features', 'Industry impact']
        })
      })

      const data = await response.json()

      if (data.success) {
        setTestResult(data.generated_content)
        toast.success('Test generation complete!')
      } else {
        toast.error(data.error || 'Failed to generate test content')
      }
    } catch (error) {
      console.error('Error testing generation:', error)
      toast.error('Failed to test generation')
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-lg text-muted-foreground">Loading training status...</p>
          </div>
        </div>
      </div>
    )
  }

  const trainingProgress = status?.trained 
    ? 100 
    : Math.min((status?.sample_count || 0) / 20 * 100, 100)

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight">Voice Training</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Train the AI to write in your unique style. Upload 20+ newsletter samples for best results.
        </p>
      </div>

      {/* Training Status Card */}
      <Card className="mb-6 p-6 border-border/50 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold mb-1">Training Status</h2>
            <p className="text-sm text-muted-foreground">
              {status?.trained 
                ? `✅ Trained with ${status.sample_count} samples` 
                : `${status?.sample_count || 0} / 20 samples uploaded`}
            </p>
          </div>
          {status?.trained && (
            <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Ready
            </Badge>
          )}
        </div>

        <Progress value={trainingProgress} className="h-2 mb-4" />

        {status?.voice_profile && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {status.voice_profile.avgSentenceLength.toFixed(0)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Avg Sentence Length</div>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {status.voice_profile.avgParagraphLength.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Sentences/Paragraph</div>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <div className="text-2xl font-bold text-primary capitalize">
                {status.voice_profile.vocabularyLevel}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Vocabulary Level</div>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {status.voice_profile.toneMarkers.length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Tone Markers</div>
            </div>
          </div>
        )}

        {status?.voice_profile && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-2">Tone Markers</Label>
              <div className="flex flex-wrap gap-1">
                {status.voice_profile.toneMarkers.slice(0, 5).map((tone, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {tone}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-2">Common Phrases</Label>
              <div className="flex flex-wrap gap-1">
                {status.voice_profile.commonPhrases.slice(0, 3).map((phrase, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {phrase}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Upload Section */}
      <Card className="mb-6 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Upload Training Samples</h2>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="samples" className="mb-2">
              Paste Your Newsletter Samples
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              Paste 3-20+ past newsletters. Separate each newsletter with a double newline (press Enter twice).
            </p>
            <Textarea
              id="samples"
              value={samples}
              onChange={(e) => setSamples(e.target.value)}
              placeholder="Newsletter 1 content here...

Newsletter 2 content here...

Newsletter 3 content here..."
              className="min-h-[300px] font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Current: {samples.split('\n\n').filter(s => s.trim().length > 100).length} samples detected
            </p>
          </div>

          <Button
            onClick={handleUploadSamples}
            disabled={uploading || !samples.trim()}
            className="w-full sm:w-auto"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading & Training...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload & Train
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Test Generation Section */}
      {status?.trained && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Test Voice Generation</h2>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="test-topic" className="mb-2">
                Topic to Write About
              </Label>
              <Textarea
                id="test-topic"
                value={testTopic}
                onChange={(e) => setTestTopic(e.target.value)}
                placeholder="Enter a topic for the AI to write about in your style..."
                className="min-h-[80px]"
              />
            </div>

            <Button
              onClick={handleTestGeneration}
              disabled={testing || !testTopic.trim()}
              className="w-full sm:w-auto"
            >
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Test Content
                </>
              )}
            </Button>

            {testResult && (
              <div className="mt-4">
                <Label className="mb-2">Generated Content (in your style)</Label>
                <Card className="p-4 bg-muted/30">
                  <p className="text-sm whitespace-pre-wrap">{testResult}</p>
                </Card>
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Does this sound like you? If not, try uploading more samples or samples that better represent your style.
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Help Section */}
      <Card className="mt-6 p-6 border-dashed">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <h3 className="font-semibold mb-2">Tips for Better Training</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Upload 20+ samples for best voice matching results</li>
              <li>• Use your best, most representative newsletters</li>
              <li>• Samples should be at least 200 words each</li>
              <li>• More samples = better voice matching (70%+ ready-to-send)</li>
              <li>• You can retrain anytime by uploading new samples</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}





