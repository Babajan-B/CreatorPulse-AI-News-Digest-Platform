"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Mail,
  FileText,
  Youtube,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  MessageSquare,
  Video,
  Newspaper,
} from "lucide-react"

export type ContentType =
  | "newsletter"
  | "youtube_script"
  | "linkedin_article"
  | "twitter_thread"
  | "instagram_post"
  | "facebook_post"
  | "reddit_post"
  | "blog_post"
  | "tiktok_script"

interface ContentTypeOption {
  id: ContentType
  name: string
  description: string
  icon: React.ReactNode
  category: "written" | "video" | "social"
  popular?: boolean
}

const contentTypes: ContentTypeOption[] = [
  {
    id: "newsletter",
    name: "Newsletter / Email",
    description: "Professional email digest with curated articles",
    icon: <Mail className="h-6 w-6" />,
    category: "written",
    popular: true,
  },
  {
    id: "youtube_script",
    name: "YouTube Script",
    description: "Timestamped video script with hooks and CTAs",
    icon: <Youtube className="h-6 w-6" />,
    category: "video",
    popular: true,
  },
  {
    id: "linkedin_article",
    name: "LinkedIn Article",
    description: "Professional long-form article with insights",
    icon: <Linkedin className="h-6 w-6" />,
    category: "written",
    popular: true,
  },
  {
    id: "twitter_thread",
    name: "Twitter/X Thread",
    description: "Engaging thread with 280-character tweets",
    icon: <Twitter className="h-6 w-6" />,
    category: "social",
  },
  {
    id: "instagram_post",
    name: "Instagram Post",
    description: "Visual-friendly caption with hashtags",
    icon: <Instagram className="h-6 w-6" />,
    category: "social",
  },
  {
    id: "facebook_post",
    name: "Facebook Post",
    description: "Engaging post for community engagement",
    icon: <Facebook className="h-6 w-6" />,
    category: "social",
  },
  {
    id: "reddit_post",
    name: "Reddit Post",
    description: "Conversational post with TL;DR",
    icon: <MessageSquare className="h-6 w-6" />,
    category: "social",
  },
  {
    id: "blog_post",
    name: "Blog Post",
    description: "SEO-optimized long-form content",
    icon: <Newspaper className="h-6 w-6" />,
    category: "written",
  },
  {
    id: "tiktok_script",
    name: "TikTok Script",
    description: "Short-form video script with hooks",
    icon: <Video className="h-6 w-6" />,
    category: "video",
  },
]

interface ContentTypeSelectorProps {
  onSelect: (type: ContentType) => void
  selectedType?: ContentType
}

export function ContentTypeSelector({
  onSelect,
  selectedType,
}: ContentTypeSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredTypes = selectedCategory
    ? contentTypes.filter((type) => type.category === selectedCategory)
    : contentTypes

  const categories = [
    { id: "written", name: "Written Content", emoji: "📝" },
    { id: "video", name: "Video Content", emoji: "🎥" },
    { id: "social", name: "Social Media", emoji: "📱" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Choose Content Type</h2>
        <p className="text-muted-foreground">
          What type of content do you want to create?
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex justify-center gap-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          All Types
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.emoji} {category.name}
          </Button>
        ))}
      </div>

      {/* Content Type Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTypes.map((type) => (
          <Card
            key={type.id}
            className={`p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
              selectedType === type.id
                ? "ring-2 ring-primary bg-primary/5"
                : "hover:border-primary/50"
            }`}
            onClick={() => onSelect(type.id)}
          >
            <div className="space-y-4">
              {/* Icon and Badge */}
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {type.icon}
                </div>
                {type.popular && (
                  <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
                    Popular
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{type.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {type.description}
                </p>
              </div>

              {/* Category Badge */}
              <div className="text-xs text-muted-foreground capitalize">
                {categories.find((c) => c.id === type.category)?.emoji}{" "}
                {type.category.replace("_", " ")}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredTypes.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No content types in this category</p>
        </div>
      )}
    </div>
  )
}

