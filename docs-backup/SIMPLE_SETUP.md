# ✅ Simple Setup - Just 3 Steps!

---

## Step 1: Add New Tables (2 minutes)

### Go to Supabase:
1. https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** (left sidebar)

### Run This SQL:

**Open file:** `ADD_NEW_TABLES.sql`  
**Copy all** the SQL  
**Paste** into Supabase SQL Editor  
**Click RUN**

**Expected:** "New tables added successfully!" ✅

---

## Step 2: Add Service Role Key (1 minute)

### Get the key:
1. Still in Supabase → **Settings** → **API**
2. Copy the **`service_role`** key (the long secret one)

### Add to .env.local:
```bash
nano /Users/jaan/Desktop/New-Assigmnet-10-9-25/creatorpulse/.env.local
```

Add this line at the end:
```env
SUPABASE_SERVICE_ROLE_KEY=paste_your_copied_key_here
```

Save (Ctrl+O, Enter, Ctrl+X)

---

## Step 3: Restart Server (30 seconds)

```bash
cd /Users/jaan/Desktop/New-Assigmnet-10-9-25/creatorpulse
pkill -9 -f "next dev"
npm run dev
```

---

## ✅ Done! Now Test:

### Voice Training:
1. Visit http://localhost:3000/voice-training
2. Copy samples from `training.md`
3. Paste and Upload
4. Should work! ✅

### Custom Sources:
1. Visit http://localhost:3000/sources
2. Click "Add Source"
3. Add a source
4. Should save! ✅

---

## 🎯 What Was Added:

**7 New Tables:**
1. `user_sources` - Twitter, YouTube, RSS
2. `voice_training_samples` - Your newsletters
3. `newsletter_drafts` - Generated drafts
4. `draft_feedback` - Your reactions
5. `engagement_analytics` - Email tracking
6. `analytics_summary` - Stats
7. `delivery_schedules` - Delivery prefs
8. `trend_detection` - Trending topics
9. `keyword_mentions` - Keyword tracking
10. `learning_insights` - Learning data

**Plus:**
- Updated `user_settings` with 4 new columns

---

**That's it! 3 simple steps, then everything works! 🚀**

