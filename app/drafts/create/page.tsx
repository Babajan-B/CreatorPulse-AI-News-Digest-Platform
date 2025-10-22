'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ArticleSelector } from '@/components/article-selector'
import { ContentTypeSelector, type ContentType } from '@/components/content-type-selector'
import { ContentCustomizer, type ContentCustomization } from '@/components/content-customizer'
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export default function CreateDraftPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedArticles, setSelectedArticles] = useState<string[]>([])
  const [contentType, setContentType] = useState<ContentType>()
  const [customization, setCustomization] = useState<ContentCustomization>({
    tone: 'professional',
    length: 'medium',
    targetAudience: [],
    includeTrends: true,
    includeStats: true,
    includeCTA: true,
    ctaType: 'subscribe',
    useVoiceMatching: true,
  })
  const [generating, setGenerating] = useState(false)

  const totalSteps = 3
  const progress = (step / totalSteps) * 100

  const canProceedToStep2 = selectedArticles.length > 0
  const canProceedToStep3 = contentType !== undefined

  const handleNext = () => {
    if (step === 1 && !canProceedToStep2) {
      toast.error('Please select at least one article to continue')
      return
    }
    if (step === 2 && !canProceedToStep3) {
      toast.error('Please select a content type to continue')
      return
    }
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleGenerate = async () => {
    if (!contentType) {
      toast.error('Please select a content type')
      return
    }

    setGenerating(true)
    try {
      const response = await fetch('/api/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          article_ids: selectedArticles,
          content_type: contentType,
          customization,
        }),
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
        toast.success('Content generated successfully!')
        router.push(`/drafts/${data.draft.id}`)
      } else {
        toast.error(data.error || 'Failed to generate content')
      }
    } catch (error) {
      console.error('Error generating content:', error)
      toast.error('Failed to generate content')
    } finally {
      setGenerating(false)
    }
  }

  const stepTitles = [
    'Select Articles',
    'Choose Content Type',
    'Customize Content',
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/drafts')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Drafts
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">Create New Content</h1>
          <p className="text-muted-foreground">
            Follow the steps to create your personalized content
          </p>
        </div>

        {/* Progress Bar */}
        <Card className="p-6 mb-8">
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              {stepTitles.map((title, index) => (
                <div
                  key={index}
                  className={`flex-1 text-center ${
                    step > index + 1
                      ? 'text-primary font-semibold'
                      : step === index + 1
                      ? 'text-primary font-bold'
                      : 'text-muted-foreground'
                  }`}
                >
                  <div className="mb-2">
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${
                        step > index + 1
                          ? 'bg-primary text-primary-foreground'
                          : step === index + 1
                          ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {index + 1}
                    </span>
                  </div>
                  {title}
                </div>
              ))}
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-center text-sm text-muted-foreground">
              Step {step} of {totalSteps}
            </p>
          </div>
        </Card>

        {/* Step Content */}
        <Card className="p-8 mb-8">
          {step === 1 && (
            <ArticleSelector
              selectedArticles={selectedArticles}
              onSelectionChange={setSelectedArticles}
            />
          )}

          {step === 2 && (
            <ContentTypeSelector
              selectedType={contentType}
              onSelect={setContentType}
            />
          )}

          {step === 3 && contentType && (
            <ContentCustomizer
              contentType={contentType}
              customization={customization}
              onChange={setCustomization}
            />
          )}
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <div>
            {step > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={generating}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Selection Summary */}
            {selectedArticles.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {selectedArticles.length} article{selectedArticles.length !== 1 ? 's' : ''} selected
                {contentType && ` • ${contentType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`}
              </div>
            )}

            {step < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={
                  (step === 1 && !canProceedToStep2) ||
                  (step === 2 && !canProceedToStep3)
                }
              >
                Next Step
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleGenerate}
                disabled={generating || !contentType}
                className="min-w-[200px]"
              >
                {generating ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Content
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

