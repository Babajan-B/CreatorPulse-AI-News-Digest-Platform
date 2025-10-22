"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import type { ContentType } from "./content-type-selector"

export interface ContentCustomization {
  tone: "professional" | "casual" | "enthusiastic" | "educational" | "conversational" | "authoritative"
  length: "very_short" | "short" | "medium" | "long" | "custom"
  customLength?: number
  targetAudience: string[]
  includeTrends: boolean
  includeStats: boolean
  includeCTA: boolean
  ctaType: "subscribe" | "website" | "download" | "custom" | "none"
  customCTA?: string
  personalInsights?: string
  useVoiceMatching: boolean
}

interface ContentCustomizerProps {
  contentType: ContentType
  customization: ContentCustomization
  onChange: (customization: ContentCustomization) => void
}

const toneOptions = [
  { id: "professional", label: "Professional", emoji: "👔", description: "Formal and business-like" },
  { id: "casual", label: "Casual", emoji: "😊", description: "Friendly and approachable" },
  { id: "enthusiastic", label: "Enthusiastic", emoji: "🎉", description: "Energetic and exciting" },
  { id: "educational", label: "Educational", emoji: "📚", description: "Informative and clear" },
  { id: "conversational", label: "Conversational", emoji: "💬", description: "Like talking to a friend" },
  { id: "authoritative", label: "Authoritative", emoji: "🎯", description: "Expert and confident" },
]

const lengthOptions = {
  newsletter: {
    very_short: "2-3 min read (400-600 words)",
    short: "5-7 min read (800-1000 words)",
    medium: "8-12 min read (1200-1800 words)",
    long: "15+ min read (2000+ words)",
  },
  youtube_script: {
    very_short: "2-3 min video (400-600 words)",
    short: "5-8 min video (800-1200 words)",
    medium: "10-15 min video (1500-2200 words)",
    long: "20+ min video (3000+ words)",
  },
  linkedin_article: {
    very_short: "1-2 min read (200-400 words)",
    short: "3-5 min read (600-800 words)",
    medium: "6-10 min read (1000-1500 words)",
    long: "12+ min read (1800+ words)",
  },
  twitter_post: {
    very_short: "1 tweet (50-100 chars)",
    short: "2-3 tweets (150-280 chars)",
    medium: "Thread (280+ chars)",
    long: "Long thread (500+ chars)",
  },
  instagram_caption: {
    very_short: "Quick post (50-100 words)",
    short: "Standard post (100-200 words)",
    medium: "Detailed post (200-300 words)",
    long: "Story post (300+ words)",
  },
  default: {
    very_short: "Very short (50-100 words)",
    short: "Short (100-250 words)",
    medium: "Medium (250-500 words)",
    long: "Long (500+ words)",
  },
}

const ctaOptions = [
  { id: "subscribe", label: "Subscribe/Follow", description: "Encourage audience to subscribe" },
  { id: "website", label: "Visit Website", description: "Direct to your website" },
  { id: "download", label: "Download Resource", description: "Offer a download" },
  { id: "custom", label: "Custom CTA", description: "Write your own" },
  { id: "none", label: "No CTA", description: "Skip call-to-action" },
]

export function ContentCustomizer({
  contentType,
  customization,
  onChange,
}: ContentCustomizerProps) {
  const contentTypeName = contentType.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
  const lengthLabels = (lengthOptions as any)[contentType] || lengthOptions.default

  const updateCustomization = (updates: Partial<ContentCustomization>) => {
    onChange({ ...customization, ...updates })
  }

  const addAudienceTag = (tag: string) => {
    if (tag && !customization.targetAudience.includes(tag)) {
      updateCustomization({
        targetAudience: [...customization.targetAudience, tag],
      })
    }
  }

  const removeAudienceTag = (tag: string) => {
    updateCustomization({
      targetAudience: customization.targetAudience.filter((t) => t !== tag),
    })
  }

  const [audienceInput, setAudienceInput] = useState("")

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Customize Your Content</h2>
        <p className="text-muted-foreground">
          Personalize your {contentTypeName.toLowerCase()} for your audience
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Tone Selection */}
          <Card className="p-6 space-y-4">
            <div>
              <Label className="text-base font-semibold">🎭 Tone & Style</Label>
              <p className="text-sm text-muted-foreground">How should your content sound?</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {toneOptions.map((tone) => (
                <div
                  key={tone.id}
                  className={`cursor-pointer rounded-lg border-2 p-3 transition-all hover:shadow-md ${
                    customization.tone === tone.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => updateCustomization({ tone: tone.id as any })}
                >
                  <div className="text-2xl mb-1">{tone.emoji}</div>
                  <div className="font-medium text-sm">{tone.label}</div>
                  <div className="text-xs text-muted-foreground">{tone.description}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Length Selection */}
          <Card className="p-6 space-y-4">
            <div>
              <Label className="text-base font-semibold">📏 Content Length</Label>
              <p className="text-sm text-muted-foreground">How long should it be?</p>
            </div>
            <div className="space-y-3">
              {(["very_short", "short", "medium", "long"] as const).map((length) => (
                <div
                  key={length}
                  className={`cursor-pointer rounded-lg border-2 p-3 transition-all hover:shadow-md ${
                    customization.length === length
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => updateCustomization({ length })}
                >
                  <div className="font-medium capitalize">{length.replace('_', ' ')}</div>
                  <div className="text-xs text-muted-foreground">{lengthLabels[length]}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Target Audience */}
          <Card className="p-6 space-y-4">
            <div>
              <Label className="text-base font-semibold">👥 Target Audience</Label>
              <p className="text-sm text-muted-foreground">Who is this for?</p>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., AI Developers, Tech Enthusiasts"
                value={audienceInput}
                onChange={(e) => setAudienceInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    addAudienceTag(audienceInput)
                    setAudienceInput("")
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => {
                  addAudienceTag(audienceInput)
                  setAudienceInput("")
                }}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {customization.targetAudience.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeAudienceTag(tag)}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Additional Options */}
          <Card className="p-6 space-y-4">
            <div>
              <Label className="text-base font-semibold">✨ Additional Options</Label>
              <p className="text-sm text-muted-foreground">Enhance your content</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="trends"
                  checked={customization.includeTrends}
                  onCheckedChange={(checked) =>
                    updateCustomization({ includeTrends: checked as boolean })
                  }
                />
                <label htmlFor="trends" className="text-sm font-medium cursor-pointer">
                  Include trending topics and social media insights
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="stats"
                  checked={customization.includeStats}
                  onCheckedChange={(checked) =>
                    updateCustomization({ includeStats: checked as boolean })
                  }
                />
                <label htmlFor="stats" className="text-sm font-medium cursor-pointer">
                  Add statistics and data points
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cta"
                  checked={customization.includeCTA}
                  onCheckedChange={(checked) =>
                    updateCustomization({ includeCTA: checked as boolean })
                  }
                />
                <label htmlFor="cta" className="text-sm font-medium cursor-pointer">
                  Include call-to-action
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="voice"
                  checked={customization.useVoiceMatching}
                  onCheckedChange={(checked) =>
                    updateCustomization({ useVoiceMatching: checked as boolean })
                  }
                />
                <label htmlFor="voice" className="text-sm font-medium cursor-pointer">
                  Match my writing voice
                </label>
              </div>
            </div>
          </Card>

          {/* CTA Type */}
          {customization.includeCTA && (
            <Card className="p-6 space-y-4">
              <div>
                <Label className="text-base font-semibold">📢 Call-to-Action Type</Label>
                <p className="text-sm text-muted-foreground">What action should readers take?</p>
              </div>
              <div className="space-y-2">
                {ctaOptions.map((cta) => (
                  <div
                    key={cta.id}
                    className={`cursor-pointer rounded-lg border-2 p-3 transition-all hover:shadow-md ${
                      customization.ctaType === cta.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => updateCustomization({ ctaType: cta.id as any })}
                  >
                    <div className="font-medium text-sm">{cta.label}</div>
                    <div className="text-xs text-muted-foreground">{cta.description}</div>
                  </div>
                ))}
              </div>
              {customization.ctaType === "custom" && (
                <Input
                  placeholder="Enter your custom CTA..."
                  value={customization.customCTA || ""}
                  onChange={(e) => updateCustomization({ customCTA: e.target.value })}
                />
              )}
            </Card>
          )}

          {/* Personal Insights */}
          <Card className="p-6 space-y-4">
            <div>
              <Label className="text-base font-semibold">💡 Personal Insights (Optional)</Label>
              <p className="text-sm text-muted-foreground">Add your own thoughts or context</p>
            </div>
            <Textarea
              placeholder="Share your perspective, add context, or include specific points you want to mention..."
              rows={4}
              value={customization.personalInsights || ""}
              onChange={(e) => updateCustomization({ personalInsights: e.target.value })}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}

