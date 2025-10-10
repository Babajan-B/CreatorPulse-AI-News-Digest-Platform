# 🗄️ CreatorPulse Database Setup Guide

## ⚠️ Current Status

The database connection string you provided isn't accessible yet. You need to set up your Supabase project first.

---

## 🚀 Quick Setup (3 Steps)

### **Step 1: Create Supabase Project**

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"New Project"**
3. Fill in:
   - **Name:** CreatorPulse
   - **Database Password:** proteins123 (or your choice)
   - **Region:** Choose closest to you
4. Click **"Create new project"**
5. Wait 2-3 minutes for provisioning

---

### **Step 2: Get Your Connection Details**

Once project is ready:

1. Go to **Settings** → **Database**
2. Find **Connection string** section
3. Copy these values:

```
Host: db.xxxxx.supabase.co
Database name: postgres
Port: 5432
User: postgres
Password: [your password]
```

4. Go to **Settings** → **API**
5. Copy:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon/public key:** `eyJhbGciOiJIUzI1NiIsInR...`

---

### **Step 3: Run Database Setup**

#### **Option A: Using Supabase SQL Editor (Recommended)**

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy the entire contents of `supabase/schema.sql`
4. Paste into SQL editor
5. Click **"Run"**
6. ✅ Tables created!

#### **Option B: Using Setup Script**

1. Update `scripts/setup-database.ts` with your actual connection string
2. Run:
```bash
npx tsx scripts/setup-database.ts
```

---

## 📋 **What Gets Created**

### **Database 1: Articles (News Data)**

#### **`articles` Table**
Stores all fetched news articles

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Unique article ID |
| title | TEXT | Article title |
| summary | TEXT | Article summary |
| content | TEXT | Full content (optional) |
| url | TEXT | Article URL (unique) |
| source | TEXT | Source name |
| source_logo | TEXT | Logo path |
| source_type | TEXT | rss/website/twitter |
| published_at | TIMESTAMP | When article was published |
| scraped_at | TIMESTAMP | When we fetched it |
| author | TEXT | Author name |
| image_url | TEXT | Featured image |
| tags | TEXT[] | Topic tags |
| quality_score | DECIMAL | 0.0-10.0 score |
| metadata | JSONB | Additional data |

**Indexes:** published_at, source, quality_score, tags, scraped_at

---

### **Database 2: Users & Digests**

#### **`users` Table**
User accounts and preferences

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | User ID |
| email | TEXT | Email (unique) |
| name | TEXT | User name |
| settings | JSONB | User preferences |
| created_at | TIMESTAMP | Account created |
| updated_at | TIMESTAMP | Last updated |

#### **`user_credentials` Table**
Secure storage for API keys

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Credential ID |
| user_id | UUID | User reference |
| llm_api_key | TEXT | OpenAI/Anthropic key |
| llm_provider | TEXT | Provider name |
| image_api_key | TEXT | DALL·E/Stability key |
| image_provider | TEXT | Provider name |
| linkedin_access_token | TEXT | LinkedIn OAuth |
| twitter_api_key | TEXT | Twitter API |

#### **`digests` Table**
Generated news digests

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Digest ID |
| user_id | UUID | User reference |
| title | TEXT | Digest title |
| article_ids | TEXT[] | Article IDs |
| generated_at | TIMESTAMP | Generation time |
| delivered_at | TIMESTAMP | Delivery time |
| status | TEXT | draft/generated/delivered |
| email_sent | BOOLEAN | Email sent? |
| linkedin_posted | BOOLEAN | Posted to LinkedIn? |

#### **`user_article_interactions` Table**
Track user engagement

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Interaction ID |
| user_id | UUID | User reference |
| article_id | TEXT | Article reference |
| bookmarked | BOOLEAN | Bookmarked? |
| read | BOOLEAN | Read? |
| read_at | TIMESTAMP | When read |

---

## 🔧 **How It Works**

### **Article Flow:**
```
RSS Feeds
    ↓
Fetch & Parse
    ↓
Calculate Quality Score
    ↓
Save to Database (articles table)
    ↓
Display in Frontend
```

### **User Flow:**
```
User visits site
    ↓
Creates/logs in (users table)
    ↓
Views articles from database
    ↓
Generates digest (digests table)
    ↓
Saves preferences (users.settings)
```

---

## 🎯 **Current Implementation**

### **What's Already Done:**

1. ✅ **Supabase client** installed (`@supabase/supabase-js`)
2. ✅ **Database schema** created (`supabase/schema.sql`)
3. ✅ **Database utilities** (`lib/db.ts`) with functions:
   - `saveArticles()` - Save to database
   - `getArticles()` - Fetch with filters
   - `getRecentArticles()` - Get last N days
   - `deleteOldArticles()` - Cleanup
   - `upsertUser()` - Create/update user
   - `createDigest()` - Generate digest
   - `getUserDigests()` - Get user's digests
   - `getArticleStats()` - Analytics

4. ✅ **API integration** (`app/api/articles/route.ts`):
   - Fetches RSS feeds
   - Saves to database automatically
   - Falls back to database if RSS fails
   - Supports cache mode

5. ✅ **Setup script** (`scripts/setup-database.ts`)

---

## ⚡ **Quick Start (After Supabase is Ready)**

### **1. Update Connection**

Edit `scripts/setup-database.ts` line 9:
```typescript
const DATABASE_URL = 'postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres';
```

### **2. Run Setup**
```bash
npx tsx scripts/setup-database.ts
```

### **3. Verify**
```bash
# Check if tables exist
curl http://localhost:3000/api/db/init
```

### **4. Test**
```bash
# Fetch articles (will save to DB)
curl "http://localhost:3000/api/articles?limit=10"

# Use cached articles from DB
curl "http://localhost:3000/api/articles?limit=10&cache=true"
```

---

## 📊 **Benefits of Database Integration**

### **Performance:**
- ✅ **Faster loads** - Cached articles load instantly
- ✅ **Reduced API calls** - Don't re-fetch same articles
- ✅ **Offline support** - Works when RSS feeds are down

### **Features Enabled:**
- ✅ **User accounts** - Multi-user support
- ✅ **Bookmarks** - Save favorite articles
- ✅ **Read tracking** - Mark articles as read
- ✅ **Digest history** - Store past digests
- ✅ **Analytics** - Track popular topics, sources
- ✅ **Search** - Full-text search in database

### **Reliability:**
- ✅ **Fallback** - Database serves as backup if RSS fails
- ✅ **Deduplication** - Same article not stored twice (URL unique constraint)
- ✅ **Data persistence** - Articles don't disappear on refresh

---

## 🔍 **Testing Without Supabase**

The app works WITHOUT database! It will:
- ✅ Fetch from RSS feeds
- ✅ Display articles
- ✅ Use in-memory cache
- ⚠️ No persistence (reloads on refresh)
- ⚠️ No user accounts
- ⚠️ No digest history

---

## 🛠️ **Alternative: Local PostgreSQL**

If you want to test locally:

```bash
# Install PostgreSQL
brew install postgresql

# Start PostgreSQL
brew services start postgresql

# Create database
createdb creatorpulse

# Update DATABASE_URL
DATABASE_URL=postgresql://localhost:5432/creatorpulse

# Run setup
npx tsx scripts/setup-database.ts
```

---

## 📞 **Need Help?**

### **Issue: Can't connect to Supabase**
1. Verify project exists at supabase.com
2. Check project is not paused
3. Verify connection string is correct
4. Check firewall/network settings

### **Issue: Tables not created**
1. Check SQL syntax in schema.sql
2. Run SQL directly in Supabase SQL Editor
3. Check Supabase logs for errors

### **Issue: API not saving to DB**
1. Check console logs for errors
2. Verify Supabase client is initialized
3. Test connection: `curl http://localhost:3000/api/db/init`

---

## 🎯 **Next Steps After Database Setup**

Once database is connected:

1. ✅ Articles will auto-save when fetched
2. ✅ Use cache mode for faster loads
3. ✅ Add user authentication
4. ✅ Implement digest generation
5. ✅ Add bookmark feature
6. ✅ Track read status
7. ✅ Build analytics dashboard

---

## 📝 **Your Current Database URL**

```
Host: db.ctyfqincrtzvrnrglnpw.supabase.co
Database: postgres
User: postgres
Password: proteins123
Port: 5432
```

**⚠️ Important:** This URL needs to point to an actual Supabase project. Create one at [supabase.com](https://supabase.com) first!

---

## 🎉 **What You Have Now**

Even without database connection, your app has:
- ✅ Live RSS fetching (17 sources)
- ✅ 50+ real articles
- ✅ Quality scoring
- ✅ Beautiful UI
- ✅ Sharing features
- ✅ Publish dates
- ✅ Source icons

**Database will add:**
- 🚀 **10x faster loads** (caching)
- 🚀 **Multi-user support**
- 🚀 **Digest history**
- 🚀 **Bookmarks & tracking**
- 🚀 **Full analytics**

---

**Ready to set up Supabase? Follow Step 1 above! 🚀**

