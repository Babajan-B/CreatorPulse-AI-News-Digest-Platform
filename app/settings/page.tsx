'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { 
  Save, User as UserIcon, Clock, Mail, Loader2, Send, Check, 
  Settings as SettingsIcon, Bell 
} from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
  created_at: string
  last_login_at: string
}

interface UserSettings {
  timezone: string
  digest_time: string
  max_items_per_digest: number
  min_quality_score: number
  topics_of_interest: string[]
  auto_send_email: boolean
  email_notifications: boolean
  preferred_mode: 'ai_news' | 'science_breakthrough'
}

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sendingTest, setSendingTest] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [settings, setSettings] = useState<UserSettings | null>(null)

  // Fetch user and settings
  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch('/api/user/settings').then(r => r.json())
    ]).then(([userData, settingsData]) => {
      if (userData.success) {
        setUser(userData.user)
      } else {
        router.push('/login')
        return
      }
      
      if (settingsData.success) {
        setSettings(settingsData.settings)
      }
    })
    .catch(error => {
      console.error('Error loading data:', error)
      toast.error('Failed to load settings')
    })
    .finally(() => setLoading(false))
  }, [router])

  const handleSaveSettings = async () => {
    if (!settings) return
    
    setSaving(true)
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Settings saved successfully!')
        setSettings(data.settings)
      } else {
        toast.error(data.error || 'Failed to save settings')
      }
    } catch (error) {
      toast.error('An error occurred while saving')
      console.error('Save error:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleTestEmail = async () => {
    setSendingTest(true)
    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        toast.success(
          `Test email sent to ${data.email.to}!`,
          {
            description: data.email.previewText,
            duration: 5000,
          }
        )
      } else {
        toast.error(data.error || 'Failed to send test email')
      }
    } catch (error) {
      toast.error('An error occurred while sending test email')
      console.error('Test email error:', error)
    } finally {
      setSendingTest(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-lg text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !settings) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Please log in to access settings</p>
            <Button asChild className="mt-4">
              <a href="/login">Go to Login</a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Generate time options (every hour)
  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0')
    return {
      value: `${hour}:00:00`,
      label: `${i === 0 ? 12 : i > 12 ? i - 12 : i}:00 ${i >= 12 ? 'PM' : 'AM'}`,
    }
  })

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-balance text-4xl font-bold tracking-tight">Settings</h1>
        <p className="text-pretty text-lg text-muted-foreground">
          Manage your CreatorPulse preferences and email delivery
        </p>
      </div>

      {/* User Info Card */}
      <Card className="mb-6 border-border/50 bg-gradient-to-br from-primary/5 to-accent/5 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-2xl font-bold text-primary-foreground">
            {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
              <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
              {user.last_login_at && (
                <span>Last login {new Date(user.last_login_at).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-3">
          <TabsTrigger value="profile" className="gap-2">
            <UserIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Email & Digest</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <SettingsIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Preferences</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-border/50 p-6">
            <h2 className="mb-6 text-xl font-semibold">Profile Information</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Full Name</Label>
                <Input
                  id="profile-name"
                  value={user.name}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-email">Email Address</Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={user.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  This is where your daily digest will be delivered
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-id">User ID</Label>
                <Input
                  id="user-id"
                  value={user.id}
                  disabled
                  className="font-mono text-xs bg-muted"
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Email & Digest Tab */}
        <TabsContent value="email" className="space-y-6">
          <Card className="border-border/50 p-6">
            <h2 className="mb-6 text-xl font-semibold">Email Digest Settings</h2>
            <div className="space-y-6">
              {/* Auto Email Toggle */}
              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-email" className="text-base">
                    Automatic Email Delivery
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive daily digest emails automatically
                  </p>
                </div>
                <Switch
                  id="auto-email"
                  checked={settings.auto_send_email}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, auto_send_email: checked })
                  }
                />
              </div>

              {/* Digest Time */}
              <div className="space-y-2">
                <Label htmlFor="digest-time">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Daily Delivery Time
                  </div>
                </Label>
                <Select
                  value={settings.digest_time}
                  onValueChange={(value) =>
                    setSettings({ ...settings, digest_time: value })
                  }
                >
                  <SelectTrigger id="digest-time">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {timeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Your digest will be sent at this time every day
                </p>
              </div>

              {/* Timezone */}
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  value={settings.timezone}
                  onChange={(e) =>
                    setSettings({ ...settings, timezone: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Your timezone for accurate delivery timing
                </p>
              </div>

              {/* Test Email Button */}
              <div className="rounded-lg border-2 border-dashed border-border/50 bg-accent/5 p-4">
                <div className="mb-3">
                  <h3 className="font-medium">Test Email Delivery</h3>
                  <p className="text-sm text-muted-foreground">
                    Send a test email to {user.email} to verify your settings
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleTestEmail}
                  disabled={sendingTest}
                  className="w-full sm:w-auto"
                >
                  {sendingTest ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending test email...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Test Email
                    </>
                  )}
                </Button>
              </div>

              <Button
                onClick={handleSaveSettings}
                disabled={saving}
                className="w-full bg-gradient-to-r from-primary to-accent sm:w-auto"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Email Settings
                  </>
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card className="border-border/50 p-6">
            <h2 className="mb-6 text-xl font-semibold">Digest Preferences</h2>
            <div className="space-y-6">
              {/* Content Mode Selection */}
              <div className="space-y-2">
                <Label htmlFor="content-mode">Content Mode</Label>
                <Select
                  value={settings.preferred_mode}
                  onValueChange={(value: 'ai_news' | 'science_breakthrough') =>
                    setSettings({ ...settings, preferred_mode: value })
                  }
                >
                  <SelectTrigger id="content-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ai_news">
                      <div className="flex flex-col">
                        <span className="font-medium">AI News</span>
                        <span className="text-xs text-muted-foreground">
                          Latest AI developments, models, and tech news
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="science_breakthrough">
                      <div className="flex flex-col">
                        <span className="font-medium">Science Breakthroughs</span>
                        <span className="text-xs text-muted-foreground">
                          Medical research, scientific discoveries, and breakthroughs
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose between AI news or scientific breakthrough content
                </p>
              </div>

              {/* Max Items */}
              <div className="space-y-2">
                <Label htmlFor="max-items">Maximum Articles per Digest</Label>
                <Select
                  value={settings.max_items_per_digest.toString()}
                  onValueChange={(value) =>
                    setSettings({ ...settings, max_items_per_digest: parseInt(value) })
                  }
                >
                  <SelectTrigger id="max-items">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 articles</SelectItem>
                    <SelectItem value="10">10 articles</SelectItem>
                    <SelectItem value="15">15 articles</SelectItem>
                    <SelectItem value="20">20 articles</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Min Quality Score */}
              <div className="space-y-2">
                <Label htmlFor="min-quality">Minimum Quality Score</Label>
                <Select
                  value={settings.min_quality_score.toString()}
                  onValueChange={(value) =>
                    setSettings({ ...settings, min_quality_score: parseFloat(value) })
                  }
                >
                  <SelectTrigger id="min-quality">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.50">0.5 - Include all articles</SelectItem>
                    <SelectItem value="0.60">0.6 - Good quality</SelectItem>
                    <SelectItem value="0.70">0.7 - High quality</SelectItem>
                    <SelectItem value="0.80">0.8 - Premium only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Email Notifications */}
              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notif" className="text-base">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about new articles
                  </p>
                </div>
                <Switch
                  id="email-notif"
                  checked={settings.email_notifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, email_notifications: checked })
                  }
                />
              </div>

              <Button
                onClick={handleSaveSettings}
                disabled={saving}
                className="w-full bg-gradient-to-r from-primary to-accent sm:w-auto"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Preferences
                  </>
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
