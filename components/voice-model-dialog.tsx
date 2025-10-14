'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Loader2, Send, Sparkles, Zap } from 'lucide-react'

interface VoiceModelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (useVoice: boolean) => Promise<void>
  title: string
  description: string
  voiceTrained: boolean
}

export function VoiceModelDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  voiceTrained
}: VoiceModelDialogProps) {
  const [useVoiceModel, setUseVoiceModel] = useState(voiceTrained)
  const [sending, setSending] = useState(false)

  const handleConfirm = async () => {
    setSending(true)
    try {
      await onConfirm(useVoiceModel)
      onOpenChange(false)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Label>Choose Content Style:</Label>
          <RadioGroup
            value={useVoiceModel ? "voice" : "default"}
            onValueChange={(value) => setUseVoiceModel(value === "voice")}
          >
            {voiceTrained && (
              <div className="flex items-center space-x-2 rounded-lg border p-4 cursor-pointer hover:bg-accent/5">
                <RadioGroupItem value="voice" id="voice" />
                <Label htmlFor="voice" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="font-semibold">Your Voice Style</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Content written in your unique writing style (70%+ ready-to-send)
                  </p>
                </Label>
              </div>
            )}
            
            <div className="flex items-center space-x-2 rounded-lg border p-4 cursor-pointer hover:bg-accent/5">
              <RadioGroupItem value="default" id="default" />
              <Label htmlFor="default" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-accent" />
                  <span className="font-semibold">Default LLM Model</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Standard AI-generated summaries (professional, neutral tone)
                </p>
              </Label>
            </div>
          </RadioGroup>

          {!voiceTrained && (
            <div className="rounded-lg bg-orange-500/10 p-3 text-sm text-orange-700 dark:text-orange-400">
              ℹ️ Train your voice first to unlock personalized content generation
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleConfirm}
            disabled={sending}
            className="flex-1 gap-2"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send {useVoiceModel && voiceTrained ? 'with Your Voice' : 'with Default'}
              </>
            )}
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            disabled={sending}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}




