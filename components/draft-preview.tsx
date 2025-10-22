"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Mail, 
  Youtube, 
  Linkedin, 
  Twitter, 
  Instagram, 
  Facebook,
  FileText,
  Link2,
  BookOpen,
  Clock,
  Eye,
  Download,
  Copy,
  Check
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface DraftPreviewProps {
  draft: any
  contentType?: string
  onEdit?: () => void
  onApprove?: () => void
}

export function DraftPreview({ draft, contentType, onEdit, onApprove }: DraftPreviewProps) {
  const [copied, setCopied] = useState(false)
  
  const type = contentType || draft.metadata?.content_type || 'newsletter'
  const customization = draft.metadata?.customization || {}

  const handleCopy = () => {
    const content = draft.content_intro || draft.content || ''
    navigator.clipboard.writeText(content)
    setCopied(true)
    toast.success('Content copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const content = draft.content_intro || draft.content || ''
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${draft.title || 'draft'}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Content downloaded')
  }

  const getContentTypeIcon = () => {
    switch (type) {
      case 'newsletter': return <Mail className="h-5 w-5" />
      case 'youtube_script': return <Youtube className="h-5 w-5" />
      case 'linkedin_article': return <Linkedin className="h-5 w-5" />
      case 'linkedin_post': return <Linkedin className="h-5 w-5" />
      case 'twitter_thread': return <Twitter className="h-5 w-5" />
      case 'instagram_caption': return <Instagram className="h-5 w-5" />
      case 'facebook_post': return <Facebook className="h-5 w-5" />
      case 'blog_post': return <FileText className="h-5 w-5" />
      case 'landing_page': return <Link2 className="h-5 w-5" />
      default: return <FileText className="h-5 w-5" />
    }
  }

  const getContentTypeName = () => {
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }

  const renderNewsletter = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">{draft.title}</h1>
        <p className="text-sm text-muted-foreground">
          {new Date(draft.generated_at || Date.now()).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      <Separator />

      {/* Introduction */}
      {draft.content_intro && (
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap leading-relaxed">{draft.content_intro}</div>
        </div>
      )}

      {/* Trending Topics */}
      {draft.trends_section?.top_3_trends && draft.trends_section.top_3_trends.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-pink-50 border-orange-200">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            🔥 Trending Topics to Watch
          </h3>
          <div className="space-y-4">
            {draft.trends_section.top_3_trends.map((trend: any, index: number) => (
              <div key={index} className="pb-4 last:pb-0 border-b last:border-0">
                <h4 className="font-semibold mb-1">{index + 1}. {trend.topic}</h4>
                <p className="text-sm text-muted-foreground">{trend.explainer}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Articles */}
      {draft.curated_articles && draft.curated_articles.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold">📚 Featured Articles</h3>
          {draft.curated_articles.map((article: any, index: number) => (
            <Card key={index} className="p-6">
              <div className="space-y-4">
                <div>
                  <Badge variant="secondary" className="mb-2">
                    Article {index + 1} of {draft.curated_articles.length}
                  </Badge>
                  <h4 className="text-lg font-bold mb-1">{article.title}</h4>
                  <p className="text-sm text-primary font-medium">{article.source}</p>
                </div>
                
                {article.summary && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm leading-relaxed">{article.summary}</p>
                  </div>
                )}

                {article.bullet_points && article.bullet_points.length > 0 && (
                  <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                    <h5 className="font-semibold text-sm mb-2">🔑 Key Points</h5>
                    <ul className="space-y-1 text-sm">
                      {article.bullet_points.map((point: string, i: number) => (
                        <li key={i}>• {point}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {article.commentary && (
                  <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                    <p className="text-sm italic">💭 {article.commentary}</p>
                  </div>
                )}

                {article.url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={article.url} target="_blank" rel="noopener noreferrer">
                      Read Full Article →
                    </a>
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Closing */}
      {draft.closing && (
        <>
          <Separator />
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap leading-relaxed bg-muted/30 p-6 rounded-lg">
              {draft.closing}
            </div>
          </div>
        </>
      )}
    </div>
  )

  const renderYouTubeScript = () => (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
        <div className="flex items-start gap-4">
          <Youtube className="h-8 w-8 text-red-600" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{draft.title}</h2>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {customization.length === 'brief' ? '5-7 min' : customization.length === 'medium' ? '10-15 min' : '15-20 min'}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {customization.tone || 'Professional'} tone
              </span>
            </div>
          </div>
        </div>
      </Card>

      <div className="prose prose-sm max-w-none">
        <div className="space-y-6 whitespace-pre-wrap leading-relaxed font-mono text-sm bg-gray-50 p-6 rounded-lg border">
          {draft.content_intro || draft.content}
        </div>
      </div>

      {draft.curated_articles && draft.curated_articles.length > 0 && (
        <Card className="p-4 bg-blue-50">
          <h4 className="font-semibold mb-2 text-sm">📎 Referenced Sources</h4>
          <ul className="space-y-1 text-xs">
            {draft.curated_articles.map((article: any, i: number) => (
              <li key={i}>
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {article.title}
                </a>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )

  const renderLinkedInPost = () => (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <div className="flex items-start gap-4">
          <Linkedin className="h-8 w-8 text-blue-600" />
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2">LinkedIn {type === 'linkedin_article' ? 'Article' : 'Post'}</h2>
            <div className="flex gap-3 text-sm">
              <Badge variant="secondary">{customization.tone || 'Professional'}</Badge>
              <Badge variant="secondary">{customization.length || 'Medium'} length</Badge>
              {customization.targetAudience && customization.targetAudience.length > 0 && (
                <Badge variant="outline">For: {customization.targetAudience.join(', ')}</Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="prose prose-sm max-w-none">
        <div className="whitespace-pre-wrap leading-relaxed bg-white p-6 rounded-lg border-2 shadow-sm">
          {draft.content_intro || draft.content}
        </div>
      </div>

      {customization.includeCTA && (
        <Card className="p-4 bg-green-50 border-green-200">
          <p className="text-sm font-medium">✅ Includes call-to-action: {customization.ctaType || 'subscribe'}</p>
        </Card>
      )}
    </div>
  )

  const renderTwitterThread = () => {
    const content = draft.content_intro || draft.content || ''
    const tweets = content.split('\n\n').filter((t: string) => t.trim())

    return (
      <div className="space-y-6">
        <Card className="p-6 bg-gradient-to-r from-sky-50 to-blue-50 border-sky-200">
          <div className="flex items-start gap-4">
            <Twitter className="h-8 w-8 text-sky-500" />
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2">Twitter Thread</h2>
              <p className="text-sm text-muted-foreground">{tweets.length} tweets</p>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {tweets.map((tweet: string, index: number) => (
            <Card key={index} className="p-4 bg-white border-2">
              <div className="flex gap-3">
                <Badge variant="secondary" className="h-6 w-6 flex items-center justify-center p-0">
                  {index + 1}
                </Badge>
                <div className="flex-1">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{tweet}</p>
                  <p className="text-xs text-muted-foreground mt-2">{tweet.length} characters</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const renderGenericContent = () => (
    <div className="space-y-6">
      <div className="prose prose-sm max-w-none">
        <div className="whitespace-pre-wrap leading-relaxed">
          {draft.content_intro || draft.content}
        </div>
      </div>

      {draft.curated_articles && draft.curated_articles.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-2">Referenced Articles</h4>
          <ul className="space-y-2 text-sm">
            {draft.curated_articles.map((article: any, i: number) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {article.title}
                </a>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )

  const renderContent = () => {
    switch (type) {
      case 'newsletter':
        return renderNewsletter()
      case 'youtube_script':
        return renderYouTubeScript()
      case 'linkedin_article':
      case 'linkedin_post':
        return renderLinkedInPost()
      case 'twitter_thread':
        return renderTwitterThread()
      default:
        return renderGenericContent()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getContentTypeIcon()}
          <div>
            <h3 className="text-lg font-semibold">{getContentTypeName()}</h3>
            <p className="text-sm text-muted-foreground">
              Generated {new Date(draft.generated_at || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              Edit
            </Button>
          )}
          {onApprove && (
            <Button className="bg-gradient-to-r from-primary to-accent" size="sm" onClick={onApprove}>
              Approve & Send
            </Button>
          )}
        </div>
      </div>

      {/* Customization Info */}
      {customization && Object.keys(customization).length > 0 && (
        <Card className="p-4 bg-muted/30">
          <div className="flex flex-wrap gap-2">
            {customization.tone && (
              <Badge variant="secondary">Tone: {customization.tone}</Badge>
            )}
            {customization.length && (
              <Badge variant="secondary">Length: {customization.length}</Badge>
            )}
            {customization.targetAudience && customization.targetAudience.length > 0 && (
              <Badge variant="secondary">Audience: {customization.targetAudience.join(', ')}</Badge>
            )}
            {customization.useVoiceMatching && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                🎯 Voice Matched
              </Badge>
            )}
          </div>
        </Card>
      )}

      <Separator />

      {/* Content Rendering */}
      <div className="bg-white rounded-lg border p-8 min-h-[400px]">
        {renderContent()}
      </div>
    </div>
  )
}

