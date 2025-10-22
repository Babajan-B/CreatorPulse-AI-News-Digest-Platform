# 🔧 Voice Training Troubleshooting Guide

**Issue:** Failed to save training model  
**Status:** Multiple potential fixes

---

## ✅ What I Fixed

### 1. Removed All Emojis ✅
- Cleaned `training.md` - removed all emojis and non-ASCII characters
- Pure text only now
- Better for NLP processing

---

## 🔍 Common Errors & Solutions

### Error 1: "relation 'voice_training_samples' does not exist"

**Cause:** Database tables not created yet

**Solution:** Run the database migration

**Steps:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in left sidebar
4. Copy the entire contents of `supabase/MISSING_FEATURES_SCHEMA.sql`
5. Paste into SQL editor
6. Click **Run**
7. Wait for "Success" message

**Verify tables created:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('voice_training_samples', 'user_sources');
```

Should return both tables.

---

### Error 2: "Unauthorized" or "auth.uid() is null"

**Cause:** Missing Supabase Service Role Key

**Solution:** Add service role key to `.env.local`

**Steps:**
1. Go to Supabase Dashboard → **Settings** → **API**
2. Copy the **`service_role`** secret key (NOT the anon key)
3. Add to `.env.local`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your_service_role_key
   ```
4. Restart server:
   ```bash
   pkill -9 -f "next dev"
   npm run dev
   ```

---

### Error 3: "Failed to analyze writing style"

**Cause:** Missing NLP dependencies

**Solution:** Install required packages

```bash
cd /Users/jaan/Desktop/New-Assigmnet-10-9-25/creatorpulse
npm install compromise natural papaparse
```

---

### Error 4: "Sample content too short"

**Cause:** Samples must be >100 words each

**Solution:** Use the provided `training.md` file - all samples are 250-350 words

---

### Error 5: "GROQ_API_KEY not configured"

**Cause:** Missing or invalid Groq API key

**Solution:** Check `.env.local`

```env
GROQ_API_KEY=gsk_your_actual_key_here
```

Get key from: https://console.groq.com

---

## 🎯 Step-by-Step Fix Process

### Step 1: Verify Database Tables

**Run this in Supabase SQL Editor:**
```sql
-- Check if tables exist
SELECT 'voice_training_samples' as table_name, COUNT(*) as exists
FROM information_schema.tables 
WHERE table_name = 'voice_training_samples'
UNION ALL
SELECT 'user_settings', COUNT(*) 
FROM information_schema.tables 
WHERE table_name = 'user_settings';
```

**Expected result:**
- voice_training_samples: 1
- user_settings: 1

**If 0:** Run `supabase/MISSING_FEATURES_SCHEMA.sql`

---

### Step 2: Verify Environment Variables

**Run this:**
```bash
cd /Users/jaan/Desktop/New-Assigmnet-10-9-25/creatorpulse

echo "Checking environment..."
grep -E "^(GROQ_API_KEY|SUPABASE_SERVICE_ROLE_KEY|NEXT_PUBLIC_SUPABASE)" .env.local | cut -d'=' -f1
```

**Should show:**
- GROQ_API_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

**If missing any:** Add them to `.env.local`

---

### Step 3: Restart Server

**Always restart after environment changes:**
```bash
# Kill all servers
pkill -9 -f "next dev"
pkill -9 -f "npm run dev"

# Start fresh
cd /Users/jaan/Desktop/New-Assigmnet-10-9-25/creatorpulse
npm run dev
```

---

### Step 4: Test Voice Training

**Via UI:**
1. Visit http://localhost:3000/voice-training
2. Open `training.md` 
3. Copy ONE sample first (test with small data)
4. Paste and click "Upload & Train"
5. Check browser console for errors (F12)

**Expected:** Should save successfully or show specific error

---

## 🆘 Debug Mode

### Check Server Logs

**In your terminal where server is running, look for:**
```
POST /api/voice-training/upload 200 in 1500ms  ← Success
POST /api/voice-training/upload 500 in 50ms    ← Error
```

**Error messages will show why it failed.**

---

### Check Browser Console

1. Open http://localhost:3000/voice-training
2. Press **F12** or **Cmd+Option+I**
3. Go to **Console** tab
4. Try uploading
5. Look for error messages

**Common errors:**
- "Failed to fetch" → Server not running
- "401 Unauthorized" → Not logged in
- "500 Internal Server Error" → Check server logs

---

## 🔑 Most Likely Issue: Missing Service Role Key

**This is probably the issue!**

### Quick Fix:

1. **Get your service role key:**
   - https://supabase.com/dashboard
   - Your project → Settings → API
   - Copy **`service_role`** key

2. **Add to .env.local:**
   ```bash
   nano /Users/jaan/Desktop/New-Assigmnet-10-9-25/creatorpulse/.env.local
   ```
   
   Add this line:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
   ```

3. **Restart:**
   ```bash
   pkill -9 -f "next dev"
   cd /Users/jaan/Desktop/New-Assigmnet-10-9-25/creatorpulse
   npm run dev
   ```

4. **Try again:**
   - Visit http://localhost:3000/voice-training
   - Upload samples
   - Should work now!

---

## 📋 Checklist Before Training

- [ ] Database migration run (`MISSING_FEATURES_SCHEMA.sql`)
- [ ] `voice_training_samples` table exists
- [ ] `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
- [ ] `GROQ_API_KEY` in `.env.local`
- [ ] Server restarted after env changes
- [ ] Logged in to the app
- [ ] `training.md` emojis removed ✅ (done)

---

## 💡 Alternative: Simpler Test

**Test with just one sample:**

```bash
# Copy just Newsletter Sample 1 from training.md
# Paste into UI
# If this works, the issue was file size or format
# If this fails, the issue is database/auth
```

---

## 🎯 Most Likely Solution

**90% chance this fixes it:**

1. Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
2. Restart server
3. Try voice training again

**That's it!**

---

**Still having issues?** Share the exact error message and I'll help debug further! 🚀

