# 🚀 CreatorPulse - Complete Setup Guide

## Prerequisites

- Node.js 18+ installed
- npm or pnpm package manager
- Supabase account
- API keys for external services

---

## 1. Database Setup

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### Step 2: Run Database Migrations
1. Open Supabase SQL Editor
2. Run the complete schema:

```sql
-- Run supabase/COMPLETE_SCHEMA.sql first (existing tables)
-- Then run supabase/MISSING_FEATURES_SCHEMA.sql (new features)
```

3. Verify all tables are created:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

---

## 2. Install Dependencies

```bash
cd creatorpulse

# Install all dependencies
npm install --legacy-peer-deps

# Or if you prefer pnpm
pnpm install
```

---

## 3. Configure Environment Variables

### Step 1: Create .env.local
```bash
cp ENV_TEMPLATE.md .env.local
```

### Step 2: Get Required API Keys

**Supabase:**
- Project URL: From Supabase dashboard
- Anon Key: From Settings > API

**Groq (Required):**
1. Visit [console.groq.com](https://console.groq.com)
2. Sign up / Login
3. Create API key
4. Add to `GROQ_API_KEY`

**MailerSend (Required):**
1. Visit [mailersend.com](https://mailersend.com)
2. Create account
3. Generate API token
4. Add domain and verify
5. Add to `MAILERSEND_API_KEY`

**Twitter (Optional):**
1. Visit [developer.twitter.com](https://developer.twitter.com)
2. Create app (Elevated access required)
3. Generate Bearer Token
4. Add to `TWITTER_BEARER_TOKEN`

**YouTube (Optional):**
1. Visit [console.cloud.google.com](https://console.cloud.google.com)
2. Create project
3. Enable YouTube Data API v3
4. Create API key
5. Add to `YOUTUBE_API_KEY`

---

## 4. Test the Installation

### Step 1: Start Development Server
```bash
npm run dev
# or
pnpm dev
```

Visit `http://localhost:3000`

### Step 2: Test API Endpoints

**Test Authentication:**
```bash
curl http://localhost:3000/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

**Test Voice Training:**
```bash
curl http://localhost:3000/api/voice-training \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Test Trends:**
```bash
curl http://localhost:3000/api/trends
```

---

## 5. Configure MailerSend Webhook

### Step 1: Set Up Webhook
1. Go to MailerSend dashboard > Webhooks
2. Create new webhook
3. URL: `https://yourdomain.com/api/webhooks/mailersend`
4. Select events:
   - `activity.sent`
   - `activity.delivered`
   - `activity.opened`
   - `activity.clicked`
   - `activity.bounced`

### Step 2: Add Webhook Secret
1. Copy webhook signing secret
2. Add to `.env.local` as `MAILERSEND_WEBHOOK_SECRET`

---

## 6. Test Core Features

### Voice Training
```bash
# Upload newsletter samples
curl http://localhost:3000/api/voice-training/upload \
  -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "text",
    "text_samples": [
      {
        "title": "Newsletter 1",
        "content": "Your newsletter content here...",
        "date": "2025-01-01"
      }
    ]
  }'

# Test voice generation
curl http://localhost:3000/api/voice-training/test \
  -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"test_topic": "AI breakthroughs"}'
```

### Custom Sources
```bash
# Add Twitter source
curl http://localhost:3000/api/sources \
  -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "source_type": "twitter",
    "source_identifier": "@elonmusk",
    "priority_weight": 8
  }'

# Fetch content
curl http://localhost:3000/api/sources/fetch \
  -X POST \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Draft Generation
```bash
# Generate draft
curl http://localhost:3000/api/drafts \
  -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "max_articles": 10,
    "include_trends": true
  }'

# List drafts
curl http://localhost:3000/api/drafts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Trend Detection
```bash
# Trigger trend detection
curl http://localhost:3000/api/trends \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "timeWindow": "24h",
    "minArticleCount": 3,
    "topN": 10
  }'

# Get top 3 for newsletter
curl http://localhost:3000/api/trends/newsletter
```

---

## 7. Deploy to Production

### Vercel Deployment

1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Update Webhook URL
After deployment, update MailerSend webhook URL:
```
https://your-domain.vercel.app/api/webhooks/mailersend
```

---

## 8. Scheduled Jobs

### Set Up Cron Job (Vercel)

Create `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/daily-digest",
      "schedule": "0 8 * * *"
    },
    {
      "path": "/api/trends",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

---

## 9. Monitoring & Debugging

### Enable Debug Logging
```env
DEBUG=true
LOG_LEVEL=debug
```

### Check Logs
```bash
# Development
npm run dev

# Production (Vercel)
vercel logs
```

### Common Issues

**1. Database Connection Failed**
- Check Supabase URL and keys
- Verify RLS policies are set up

**2. Voice Training Not Working**
- Ensure you have 20+ samples
- Check GROQ_API_KEY is valid

**3. Email Not Sending**
- Verify MailerSend API key
- Check domain is verified in MailerSend

**4. Twitter/YouTube Not Working**
- Verify API keys are correct
- Check API quotas haven't been exceeded

---

## 10. Usage Workflow

### Typical User Flow:

1. **Sign Up / Login**
   - Create account
   - Set preferences

2. **Train Voice** (One-time setup)
   - Upload 20+ past newsletters
   - Test voice generation
   - Adjust if needed

3. **Add Custom Sources** (Optional)
   - Connect Twitter accounts
   - Add YouTube channels
   - Configure RSS feeds

4. **Generate Daily Draft**
   - System runs at 8 AM local time
   - Generates draft with voice matching
   - Includes trending topics

5. **Review & Edit** (Target: <20 min)
   - Review generated draft
   - Make minor edits
   - Approve and send

6. **Track Performance**
   - View open rates
   - Analyze CTR
   - Calculate ROI

7. **Provide Feedback**
   - 👍/👎 on articles
   - System learns preferences
   - Improves over time

---

## 11. API Documentation

Full API documentation:
- See `IMPLEMENTATION_COMPLETE.md` for all endpoints
- Use Postman collection (coming soon)
- Swagger docs (coming soon)

---

## 12. Support

For issues or questions:
1. Check `IMPLEMENTATION_COMPLETE.md`
2. Review error logs
3. Verify environment variables
4. Test API endpoints individually

---

## 🎉 You're All Set!

The system is now ready to:
✅ Aggregate content from multiple sources
✅ Detect emerging trends
✅ Generate voice-matched newsletter drafts
✅ Learn from your feedback
✅ Track engagement analytics
✅ Save you 40+ minutes per day

**Next:** Start training your voice with past newsletters!




