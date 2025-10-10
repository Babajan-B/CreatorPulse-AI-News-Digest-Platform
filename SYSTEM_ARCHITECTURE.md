# 🏗️ CreatorPulse System Architecture

## 📊 Complete Database Schema

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CREATORPULSE DATABASE SCHEMA                      │
│                         (PostgreSQL)                                 │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│       USERS          │     User Authentication & Accounts
├──────────────────────┤
│ id (UUID) PK         │
│ email (TEXT) UNIQUE  │
│ name (TEXT)          │
│ password_hash (TEXT) │
│ email_verified (BOOL)│
│ is_active (BOOL)     │
│ last_login_at (TS)   │
│ created_at (TS)      │
│ updated_at (TS)      │
└──────────────────────┘
         │
         ├─────────────────────────────────────────────────────┐
         │                                                     │
         ▼                                                     ▼
┌──────────────────────┐                          ┌──────────────────────┐
│   USER_SETTINGS      │                          │   USER_API_KEYS      │
├──────────────────────┤                          ├──────────────────────┤
│ id (BIGSERIAL) PK    │  User Preferences       │ id (BIGSERIAL) PK    │
│ user_id (UUID) FK    │  & Automation           │ user_id (UUID) FK    │
│ timezone (TEXT)      │                          │ llm_provider (TEXT)  │
│ digest_time (TIME)   │                          │ llm_api_key (TEXT)   │
│ max_items_per_digest │                          │ llm_model (TEXT)     │
│ min_quality_score    │                          │ image_provider       │
│ topics_of_interest[] │                          │ image_api_key        │
│ auto_generate_digest │                          │ linkedin_token       │
│ auto_send_email      │                          │ twitter_api_key      │
│ auto_post_linkedin   │                          │ created_at (TS)      │
│ email_notifications  │                          │ updated_at (TS)      │
└──────────────────────┘                          └──────────────────────┘


┌──────────────────────────────────────────────────────────────────────┐
│                       CONTENT PIPELINE                                │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│     FEED_ITEMS       │     Raw RSS Content
├──────────────────────┤     (Articles, News, Blogs)
│ id (TEXT) PK         │
│ title (TEXT)         │
│ summary (TEXT)       │
│ content (TEXT)       │
│ url (TEXT) UNIQUE    │     ← Prevents duplicates
│ source_name (TEXT)   │
│ source_url (TEXT)    │
│ source_type (TEXT)   │     [rss|website|twitter|bluesky]
│ source_logo (TEXT)   │
│ author (TEXT)        │
│ published_at (TS)    │
│ scraped_at (TS)      │
│ image_url (TEXT)     │
│ tags[] (TEXT[])      │
│ metadata (JSONB)     │
│ created_at (TS)      │
└──────────────────────┘
         │
         ▼
┌──────────────────────┐
│    ITEM_SCORES       │     Daily Quality Scoring
├──────────────────────┤
│ id (BIGSERIAL) PK    │
│ feed_item_id (FK)    │
│ score_date (DATE)    │     ← One score per day per item
│ relevance_score      │
│ recency_score        │
│ source_reliability   │
│ engagement_score     │
│ final_score (CALC)   │     ← Weighted average
│ scored_at (TS)       │
└──────────────────────┘
         │
         ▼
┌──────────────────────┐
│      DIGESTS         │     Daily Digest (1 per user per day)
├──────────────────────┤
│ id (UUID) PK         │
│ user_id (UUID) FK    │
│ title (TEXT)         │
│ digest_date (DATE)   │     ← Unique per user
│ status (TEXT)        │     [draft|generating|generated|delivered]
│ generated_at (TS)    │
│ delivered_at (TS)    │
│ email_sent (BOOL)    │
│ email_sent_at (TS)   │
│ linkedin_posted (BOOL)│
│ linkedin_posted_at   │
│ summary (TEXT)       │     ← Overall digest summary
│ image_url (TEXT)     │     ← Generated digest image
│ total_items (INT)    │
│ avg_quality_score    │
└──────────────────────┘
         │
         ▼
┌──────────────────────┐
│   DIGEST_ITEMS       │     Selected Items + AI Processing
├──────────────────────┤
│ id (BIGSERIAL) PK    │
│ digest_id (UUID) FK  │
│ feed_item_id (FK)    │
│ position (INT)       │     ← Order in digest (1, 2, 3...)
│ ai_summary (TEXT)    │     ← LLM-generated summary ✨
│ bullet_points[]      │     ← Key takeaways ✨
│ hashtags[]           │     ← Social media hashtags ✨
│ generated_image_url  │     ← Item-specific image ✨
│ processed_at (TS)    │
│ user_relevance_score │
│ selected_at (TS)     │
└──────────────────────┘


┌──────────────────────────────────────────────────────────────────────┐
│                    USER INTERACTIONS & TRACKING                       │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│ USER_INTERACTIONS    │     Bookmarks, Reads, Clicks, Shares
├──────────────────────┤
│ id (BIGSERIAL) PK    │
│ user_id (UUID) FK    │
│ feed_item_id (FK)    │
│ bookmarked (BOOL)    │
│ bookmarked_at (TS)   │
│ read (BOOL)          │
│ read_at (TS)         │
│ clicked (BOOL)       │
│ clicked_at (TS)      │
│ shared (BOOL)        │
│ shared_at (TS)       │
│ share_platform       │     [email|twitter|linkedin|facebook]
│ user_rating (1-5)    │
└──────────────────────┘


┌──────────────────────┐
│   DELIVERY_LOGS      │     Email & Social Media Delivery
├──────────────────────┤
│ id (BIGSERIAL) PK    │
│ digest_id (UUID) FK  │
│ delivery_type (TEXT) │     [email|linkedin|twitter|webhook]
│ status (TEXT)        │     [pending|sending|sent|failed]
│ recipient (TEXT)     │
│ attempted_at (TS)    │
│ delivered_at (TS)    │
│ error_message (TEXT) │
│ external_id (TEXT)   │     ← Email ID, LinkedIn post ID
│ response_data (JSON) │
└──────────────────────┘
```

---

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DAILY PIPELINE                               │
└─────────────────────────────────────────────────────────────────────┘

1. FETCH RSS FEEDS (17 sources)
   ↓
   ├── Parse XML/JSON
   ├── Extract: title, summary, url, author, image
   ├── Normalize tags
   └── Calculate basic score
   ↓
2. SAVE TO feed_items
   ↓
   ├── Deduplicate by URL
   ├── Store raw content
   └── ✅ Success: Saved 50 articles
   ↓
3. CALCULATE SCORES → item_scores
   ↓
   ├── Relevance: Match user interests
   ├── Recency: Newer = higher score
   ├── Reliability: Source reputation
   ├── Engagement: Likes, shares, comments
   └── Final Score: Weighted average
   ↓
4. GENERATE DIGEST → digests
   ↓
   ├── Select top N items (by score)
   ├── Create digest record
   └── Status: 'generating'
   ↓
5. PROCESS ITEMS → digest_items
   ↓
   ├── Send to LLM for summary
   ├── Extract bullet points
   ├── Generate hashtags
   ├── Generate image URL
   └── Status: 'generated'
   ↓
6. DELIVER
   ↓
   ├── Email → SMTP → delivery_logs
   ├── LinkedIn → API → delivery_logs
   └── Status: 'delivered'
   ↓
7. TRACK INTERACTIONS
   ↓
   ├── Email opened → user_interactions
   ├── Link clicked → user_interactions
   ├── Bookmarked → user_interactions
   └── Shared → user_interactions
```

---

## 🎨 Frontend Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        NEXT.JS FRONTEND                              │
└─────────────────────────────────────────────────────────────────────┘

app/
├── page.tsx                    → Homepage (News Digest View)
│   ├── Fetches: /api/articles
│   ├── Displays: NewsCard components
│   └── Features: Filter, search, refresh
│
├── settings/
│   └── page.tsx                → User Settings
│       ├── Saves to: user_settings table
│       └── API keys: user_api_keys table
│
├── history/
│   └── page.tsx                → Digest History
│       ├── Fetches: /api/digests
│       └── Shows: Past digests with items
│
└── api/
    ├── articles/
    │   └── route.ts            → Fetch RSS → Save to feed_items
    │       ├── GET ?limit=50
    │       └── GET ?cache=true → From database
    │
    ├── digest/
    │   ├── generate/           → Generate daily digest
    │   ├── today/              → Get today's digest
    │   └── [id]/               → Get specific digest
    │
    ├── user/
    │   ├── bookmark/           → Bookmark article
    │   └── bookmarks/          → Get user's bookmarks
    │
    └── db/
        └── stats/              → Database statistics
            └── route.ts
```

---

## 🔒 Security Features

```
┌─────────────────────────────────────────────────────────────────────┐
│                      ROW LEVEL SECURITY (RLS)                        │
└─────────────────────────────────────────────────────────────────────┘

✅ user_settings       → Users only see their own settings
✅ user_api_keys       → Users only see their own API keys
✅ user_interactions   → Users only see their own interactions
✅ digests             → Users only see their own digests
✅ digest_items        → Users only see items from their digests

🌍 feed_items          → PUBLIC READ (everyone can read articles)
🌍 item_scores         → PUBLIC READ (everyone can see scores)
```

---

## 📊 Key Relationships

```
users (1) ──────→ (M) user_settings
users (1) ──────→ (M) user_api_keys
users (1) ──────→ (M) digests
users (1) ──────→ (M) user_interactions

feed_items (1) ──→ (M) item_scores
feed_items (1) ──→ (M) digest_items
feed_items (1) ──→ (M) user_interactions

digests (1) ─────→ (M) digest_items
digests (1) ─────→ (M) delivery_logs

M = Many, 1 = One
```

---

## ⚡ Performance Optimizations

### **Indexes Created:**
```sql
✅ feed_items.published_at DESC     → Fast date sorting
✅ feed_items.source_name            → Fast filtering by source
✅ feed_items.url                    → Fast duplicate checking
✅ item_scores.final_score DESC      → Fast quality sorting
✅ digests.user_id                   → Fast user lookup
✅ digests.digest_date DESC          → Fast date lookup
✅ user_interactions.user_id         → Fast user interactions
```

### **Unique Constraints:**
```sql
✅ users.email                       → One email per user
✅ feed_items.url                    → One article per URL (no dupes)
✅ item_scores(feed_item_id, date)   → One score per day per item
✅ digests(user_id, date)            → One digest per day per user
✅ digest_items(digest_id, position) → Fixed position per item
```

---

## 🎯 Summary

**Total Tables:** 10  
**Total Indexes:** 25+  
**Total Constraints:** 15+  
**Foreign Keys:** 12  
**Triggers:** 5 (auto-update timestamps)  

**Features Enabled:**
- ✅ User authentication
- ✅ Daily digest pipeline
- ✅ Quality scoring
- ✅ AI summaries, bullets, hashtags
- ✅ Image tracking
- ✅ Delivery tracking
- ✅ User interactions
- ✅ Multi-user support
- ✅ Analytics ready

---

**Your complete, production-ready system architecture! 🚀**

