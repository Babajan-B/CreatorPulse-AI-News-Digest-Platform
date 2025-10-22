# 🚀 CreatorPulse - Complete Setup Instructions

**Time to Complete:** 30-45 minutes  
**Difficulty:** Moderate

---

## 📋 Prerequisites

Before starting, ensure you have:
- [ ] Node.js 18+ installed
- [ ] npm or pnpm installed
- [ ] Supabase account
- [ ] MailerSend account
- [ ] Groq API account

---

## STEP 1: Configure Environment Variables (5 minutes)

### 1.1 Create `.env.local` file

```bash
cd /Users/jaan/Desktop/New-Assigmnet-10-9-25/creatorpulse
touch .env.local
```

### 1.2 Fill in Required Variables

Open `.env.local` and add (see `ENV_TEMPLATE.md` for details):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret_32_chars
GROQ_API_KEY=your_groq_key
MAILERSEND_API_KEY=your_mailersend_key
MAILERSEND_FROM_EMAIL=noreply@yourdomain.com
MAILERSEND_FROM_NAME=CreatorPulse
MAILERSEND_ADMIN_EMAIL=admin@yourdomain.com
ENCRYPTION_PASSWORD=your_strong_password_48_chars
```

**Generate secrets:**
```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Encryption Password
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"

# Cron Token (optional)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## STEP 2: Run Database Migration (2 minutes)

### 2.1 Open Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in left sidebar

### 2.2 Run Migration SQL

Copy the entire contents of `supabase/MISSING_FEATURES_SCHEMA.sql` and paste into the SQL editor, then click "Run".

**Expected result:** 10 new tables created

```sql
✅ user_sources
✅ trend_detection  
✅ keyword_mentions
✅ voice_training_samples
✅ newsletter_drafts
✅ draft_feedback
✅ learning_insights
✅ engagement_analytics
✅ analytics_summary
✅ delivery_schedules
```

### 2.3 Verify Tables

Run this query to verify:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'user_sources', 'trend_detection', 'keyword_mentions',
    'voice_training_samples', 'newsletter_drafts', 'draft_feedback',
    'learning_insights', 'engagement_analytics', 'analytics_summary',
    'delivery_schedules'
  )
ORDER BY table_name;
```

Should return 10 rows.

---

## STEP 3: Install Dependencies (2 minutes)

All dependencies should already be installed, but verify:

```bash
cd /Users/jaan/Desktop/New-Assigmnet-10-9-25/creatorpulse

# Check if dependencies are installed
ls node_modules | grep -E "(twitter-api-v2|googleapis|compromise|natural|papaparse|tiptap|diff|twilio)"

# If any are missing, install:
npm install
```

**Expected packages:**
- ✅ twitter-api-v2
- ✅ googleapis
- ✅ compromise
- ✅ natural
- ✅ papaparse
- ✅ @tiptap/react @tiptap/starter-kit
- ✅ diff
- ✅ twilio

---

## STEP 4: Start the Server (1 minute)

```bash
cd /Users/jaan/Desktop/New-Assigmnet-10-9-25/creatorpulse
npm run dev
```

Server should start at: **http://localhost:3000**

**Check for errors:**
- ❌ "GROQ_API_KEY not configured" → Add to `.env.local`
- ❌ "Failed to connect to Supabase" → Check Supabase URL/key
- ✅ "Ready on http://localhost:3000" → Success!

---

## STEP 5: Test API Endpoints (10 minutes)

### 5.1 Get Your Auth Token

First, log in to get an auth token:

```bash
# Login
curl http://localhost:3000/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "password": "yourpassword"
  }'

# Save the token from response
TOKEN="your_token_here"
```

### 5.2 Test New Endpoints

```bash
# Test Trends API
curl http://localhost:3000/api/trends

# Test Sources API (needs auth)
curl http://localhost:3000/api/sources \
  -H "Cookie: auth-token=$TOKEN"

# Test Voice Training API (needs auth)
curl http://localhost:3000/api/voice-training \
  -H "Cookie: auth-token=$TOKEN"

# Test Analytics API (needs auth)
curl http://localhost:3000/api/analytics \
  -H "Cookie: auth-token=$TOKEN"

# Test Draft Generation (needs auth)
curl http://localhost:3000/api/drafts \
  -H "Cookie: auth-token=$TOKEN"
```

**Expected responses:**
- ✅ 200 OK with JSON data
- ❌ 401 Unauthorized → Check auth token
- ❌ 500 Error → Check server logs

---

## STEP 6: Train Your Voice (20 minutes)

### 6.1 Prepare Training Data

You need **20+ newsletter samples**. Format options:

**Option A: Text Array**
```json
{
  "format": "text",
  "text_samples": [
    {
      "title": "My Newsletter #1",
      "content": "Full content here...",
      "date": "2025-01-01"
    },
    ...20 more samples
  ]
}
```

**Option B: CSV File**
```csv
title,content,date
"Newsletter 1","Full text...","2025-01-01"
"Newsletter 2","More text...","2025-01-02"
...
```

### 6.2 Upload Samples

```bash
# Using text format
curl http://localhost:3000/api/voice-training/upload \
  -X POST \
  -H "Cookie: auth-token=$TOKEN" \
  -H "Content-Type: application/json" \
  -d @training_samples.json

# Using CSV format
curl http://localhost:3000/api/voice-training/upload \
  -X POST \
  -H "Cookie: auth-token=$TOKEN" \
  -F "format=csv" \
  -F "file=@newsletters.csv"
```

### 6.3 Verify Training

```bash
# Check training status
curl http://localhost:3000/api/voice-training \
  -H "Cookie: auth-token=$TOKEN"

# Should return:
# {
#   "trained": true,
#   "sample_count": 20,
#   "voice_profile": {...}
# }
```

### 6.4 Test Voice Generation

```bash
curl http://localhost:3000/api/voice-training/test \
  -X POST \
  -H "Cookie: auth-token=$TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Latest AI developments",
    "key_points": ["GPT-4 updates", "New model releases"]
  }'
```

**Success criteria:**
- Generated text matches your writing style
- Sentence length similar to your samples
- Tone and vocabulary feel authentic
- 70%+ ready to send (subjective assessment)

---

## STEP 7: Add Custom Sources (Optional, 10 minutes)

### 7.1 Add Twitter Source

```bash
curl http://localhost:3000/api/sources \
  -X POST \
  -H "Cookie: auth-token=$TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "source_type": "twitter",
    "source_identifier": "@elonmusk",
    "source_name": "Elon Musk",
    "priority_weight": 8
  }'
```

### 7.2 Add YouTube Channel

```bash
curl http://localhost:3000/api/sources \
  -X POST \
  -H "Cookie: auth-token=$TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "source_type": "youtube",
    "source_identifier": "UC_channel_id_here",
    "source_name": "AI Explained",
    "priority_weight": 7
  }'
```

### 7.3 Add Custom RSS Feed

```bash
curl http://localhost:3000/api/sources \
  -X POST \
  -H "Cookie: auth-token=$TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "source_type": "rss",
    "source_identifier": "https://example.com/feed.xml",
    "source_name": "Custom Newsletter",
    "priority_weight": 6
  }'
```

### 7.4 List Your Sources

```bash
curl http://localhost:3000/api/sources \
  -H "Cookie: auth-token=$TOKEN"
```

---

## STEP 8: Generate First Draft (5 minutes)

### 8.1 Generate Draft

```bash
curl http://localhost:3000/api/drafts \
  -X POST \
  -H "Cookie: auth-token=$TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "max_articles": 10,
    "include_trends": true
  }'
```

**Response will include:**
- Draft ID
- Title (voice-matched)
- Intro paragraph (your style)
- 10 curated articles with commentary
- Top 3 trends to watch
- Closing paragraph

### 8.2 Get Draft

```bash
curl http://localhost:3000/api/drafts/DRAFT_ID \
  -H "Cookie: auth-token=$TOKEN"
```

### 8.3 Review & Edit Draft

Start a timer (target: <20 minutes):

```bash
# Update draft
curl http://localhost:3000/api/drafts/DRAFT_ID \
  -X PUT \
  -H "Cookie: auth-token=$TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content_intro": "Your edited intro...",
    "curated_articles": [...],
    "closing": "Your edited closing..."
  }'
```

### 8.4 Approve & Send

```bash
curl http://localhost:3000/api/drafts/DRAFT_ID/approve \
  -X POST \
  -H "Cookie: auth-token=$TOKEN"
```

**This will:**
1. Mark draft as approved
2. Generate final email HTML
3. Send via MailerSend
4. Log delivery

---

## STEP 9: Set Up MailerSend Webhook (3 minutes)

### 9.1 Configure Webhook

1. Go to https://mailersend.com/dashboard
2. Navigate to: Settings → Webhooks
3. Click "Add Webhook"
4. Enter details:
   - **Name:** CreatorPulse Analytics
   - **URL:** `https://yourdomain.com/api/webhooks/mailersend`
   - **Events:** Select all:
     - ✅ activity.sent
     - ✅ activity.delivered
     - ✅ activity.opened
     - ✅ activity.clicked
     - ✅ activity.bounced
     - ✅ activity.spam_complaint
   - **Enabled:** Yes

5. Copy the "Webhook Secret"

### 9.2 Add Secret to Environment

Add to `.env.local`:
```env
MAILERSEND_WEBHOOK_SECRET=your_copied_secret_here
```

### 9.3 Restart Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

### 9.4 Test Webhook

Send a test email and check if analytics are being tracked:

```bash
curl http://localhost:3000/api/analytics \
  -H "Cookie: auth-token=$TOKEN"
```

---

## STEP 10: View Analytics (5 minutes)

### 10.1 Get Analytics Overview

```bash
curl http://localhost:3000/api/analytics \
  -H "Cookie: auth-token=$TOKEN"
```

**Response includes:**
```json
{
  "overview": {
    "total_sent": 10,
    "total_opened": 8,
    "total_clicked": 5,
    "open_rate": 80.0,
    "ctr": 62.5,
    "engagement_rate": 50.0
  },
  "article_performance": [...],
  "source_performance": [...],
  "roi": {
    "time_saved_minutes": 40,
    "monthly_value": 733.33
  }
}
```

### 10.2 Check ROI Calculation

Based on:
- **Manual curation time:** 60 min/day
- **Review time with CreatorPulse:** 20 min/day
- **Time saved:** 40 min/day
- **Hourly rate:** $50/hour
- **Monthly ROI:** $733.33

---

## ✅ Setup Complete!

You've successfully set up:
- [x] Environment configuration
- [x] Database with 10 new tables
- [x] Voice training system
- [x] Custom source connections
- [x] Draft generation workflow
- [x] Email delivery
- [x] Analytics tracking

---

## 🎯 Next Steps

### Build UI Pages (Optional)

The backend is 100% functional via API. Building UI pages is optional but recommended:

1. **Source Management Page** (`app/sources/page.tsx`)
2. **Voice Training Page** (`app/voice-training/page.tsx`)
3. **Draft Editor Page** (`app/drafts/[id]/page.tsx`)
4. **Analytics Dashboard** (`app/analytics/page.tsx`)

### Daily Usage Workflow

1. **Morning (08:00):** System auto-generates draft
2. **Review (08:05-08:25):** Review and edit draft (<20 min)
3. **Approve (08:25):** Approve and send
4. **Monitor:** Check analytics dashboard for engagement
5. **Feedback:** Give 👍/👎 reactions to improve system

---

## 🆘 Troubleshooting

### Server won't start
- Check `.env.local` exists
- Verify all required variables are set
- Run `npm install` to ensure dependencies

### API returns 401 Unauthorized
- Get new auth token via `/api/auth/login`
- Check cookie is being sent with requests
- Verify JWT_SECRET in `.env.local`

### Voice training fails
- Ensure you have 20+ samples
- Check samples have content (not empty)
- Verify GROQ_API_KEY is valid

### Draft generation is slow
- First generation takes 30-60 seconds
- Check Groq API rate limits
- Verify internet connection

### Email not sending
- Verify MailerSend API key
- Check sender email is verified
- Ensure recipient email is valid
- Check MailerSend dashboard for errors

### Analytics not tracking
- Verify webhook is configured
- Check MAILERSEND_WEBHOOK_SECRET
- Test webhook with curl
- Check engagement_analytics table

---

## 📚 Documentation

- **`PLAN.md`** - Full project plan and roadmap
- **`ENV_TEMPLATE.md`** - Environment variables guide
- **`IMPLEMENTATION_SUMMARY.md`** - What was built
- **`task.md`** - Task completion status
- **Supabase SQL:** `supabase/MISSING_FEATURES_SCHEMA.sql`

---

## 🎉 Success Metrics

After setup, you should achieve:
- ✅ Voice match score: 70%+
- ✅ Draft review time: <20 minutes
- ✅ Time saved: 40+ min/day
- ✅ ROI: $733/month (at $50/hr)
- ✅ Email open rate: 30%+
- ✅ Click-through rate: 10%+

---

**Questions?** Check the documentation or API responses for error messages.

**Ready to build?** Start with voice training, then generate your first draft!




