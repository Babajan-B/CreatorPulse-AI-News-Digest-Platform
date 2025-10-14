"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Star, 
  ExternalLink, 
  Mail, 
  Share2, 
  Twitter, 
  Linkedin, 
  Facebook,
  Copy,
  Calendar,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { VoiceModelDialog } from "@/components/voice-model-dialog"
import { toast } from "sonner"

interface NewsCardProps {
  id: string
  title: string
  summary: string
  imageUrl: string
  source: string
  sourceLogo?: string
  qualityScore: number
  tags: string[]
  url: string
  publishedAt?: string
  author?: string
}

export function NewsCard({ 
  title, 
  summary, 
  imageUrl, 
  source, 
  sourceLogo, 
  qualityScore, 
  tags, 
  url,
  publishedAt,
  author
}: NewsCardProps) {
  const [sendingEmail, setSendingEmail] = useState(false)
  const [showVoiceDialog, setShowVoiceDialog] = useState(false)
  const [voiceTrained, setVoiceTrained] = useState(false)
  const [pendingAction, setPendingAction] = useState<'email' | 'social' | null>(null)

  useEffect(() => {
    fetch('/api/voice-training')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setVoiceTrained(data.trained || false)
        }
      })
      .catch(() => {})
  }, [])

  const getQualityColor = (score: number) => {
    if (score >= 8) return "text-[var(--quality-high)]"
    if (score >= 6) return "text-[var(--quality-medium)]"
    return "text-[var(--quality-low)]"
  }

  const getQualityBg = (score: number) => {
    if (score >= 8) return "bg-[var(--quality-high)]/10"
    if (score >= 6) return "bg-[var(--quality-medium)]/10"
    return "bg-[var(--quality-low)]/10"
  }

  const handleSendArticleEmail = async (useVoiceModel: boolean) => {
    setSendingEmail(true)
    try {
      const response = await fetch('/api/article/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          summary, 
          url, 
          source,
          publishedAt,
          use_voice_model: useVoiceModel
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(
          'Article sent via email!',
          {
            description: `Delivered to ${data.email.to} ${useVoiceModel ? 'with your voice' : 'with default style'}`,
            duration: 4000,
          }
        )
      } else {
        if (data.error.includes('Not authenticated')) {
          toast.error('Please login to send articles via email', {
            action: {
              label: 'Login',
              onClick: () => window.location.href = '/login',
            },
          })
        } else {
          toast.error(data.error || 'Failed to send email')
        }
      }
    } catch (error) {
      toast.error('An error occurred while sending')
    } finally {
      setSendingEmail(false)
    }
  }

  const handleEmailShare = () => {
    const subject = encodeURIComponent(title)
    const body = encodeURIComponent(`Check out this AI news article:\n\n${title}\n\n${summary}\n\nRead more: ${url}`)
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank')
    toast.success('Email compose opened')
  }

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`${title}\n\nRead more:`)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank')
    toast.success('Shared on Twitter/X')
  }

  const handleLinkedInShare = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
    toast.success('Shared on LinkedIn')
  }

  const handleFacebookShare = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
    toast.success('Shared on Facebook')
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard!')
  }

  const formatPublishDate = (dateString?: string) => {
    if (!dateString) return null
    try {
      const date = new Date(dateString)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch {
      return null
    }
  }

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden border-border/50 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Image */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          {sourceLogo && (
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-background bg-background shadow-md">
              <Image
                src={sourceLogo || "/placeholder.svg"}
                alt={source}
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
            {source}
          </Badge>
        </div>
        {/* Quality Score */}
        <div className="absolute right-3 top-3">
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-2.5 py-1 backdrop-blur-sm",
              getQualityBg(qualityScore),
            )}
          >
            <Star className={cn("h-3.5 w-3.5 fill-current", getQualityColor(qualityScore))} />
            <span className={cn("text-xs font-semibold", getQualityColor(qualityScore))}>
              {qualityScore.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Title */}
        <h3 className="mb-2 line-clamp-2 text-balance text-lg font-semibold leading-tight tracking-tight transition-colors group-hover:text-primary">
          {title}
        </h3>

        {/* Summary */}
        <p className="mb-4 line-clamp-3 flex-1 text-pretty text-sm leading-relaxed text-muted-foreground">{summary}</p>

        {/* Tags */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          {tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs font-normal">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Meta Info - Author and Date */}
        <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
          {publishedAt && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatPublishDate(publishedAt)}</span>
            </div>
          )}
          {author && publishedAt && (
            <span>•</span>
          )}
          {author && (
            <span className="line-clamp-1">{author}</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Read Article Button */}
          <Button
            asChild
            className="flex-1 bg-gradient-to-r from-primary to-accent font-medium transition-all hover:shadow-lg hover:shadow-primary/25"
          >
            <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
              Read
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>

          {/* Send via Email Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setPendingAction('email')
              setShowVoiceDialog(true)
            }}
            disabled={sendingEmail}
            className="border-accent/50 hover:border-accent hover:bg-accent/10"
            title="Send this article via email"
          >
            {sendingEmail ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4 text-accent" />
            )}
          </Button>

          {/* Share Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Share Article</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleEmailShare}>
                <Mail className="mr-2 h-4 w-4" />
                Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleTwitterShare}>
                <Twitter className="mr-2 h-4 w-4" />
                Twitter/X
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLinkedInShare}>
                <Linkedin className="mr-2 h-4 w-4" />
                LinkedIn
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleFacebookShare}>
                <Facebook className="mr-2 h-4 w-4" />
                Facebook
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleCopyLink}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Voice Model Selection Dialog */}
      <VoiceModelDialog
        open={showVoiceDialog}
        onOpenChange={setShowVoiceDialog}
        voiceTrained={voiceTrained}
        title={pendingAction === 'email' ? 'Send Article via Email' : 'Share Article'}
        description="Choose how to generate the article summary"
        onConfirm={async (useVoice) => {
          if (pendingAction === 'email') {
            await handleSendArticleEmail(useVoice)
          }
          setPendingAction(null)
        }}
      />
    </Card>
  )
}
