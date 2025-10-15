## CreatorPulse – 3‑Minute Video Script (Speaking Notes)

### 0:00 – 0:10 Hook
Hi, I’m [Your Name]. In three minutes, I’ll show you how I built CreatorPulse, an AI-powered workflow that turns 3–5 hours of manual research into a 15–20 minute review process for creators.

### 0:10 – 0:30 Problem → Outcome
Problem: Creators waste hours scanning sources, curating links, writing summaries, and formatting newsletters. This kills consistency and reach.
Outcome: CreatorPulse automates source aggregation, surfaces real-time trends, and generates voice-matched newsletter drafts—ready to review, approve, and email.

### 0:30 – 0:50 Architecture Snapshot
- Frontend: Next.js 15 (App Router), Tailwind, shadcn/ui
- Backend: Next.js API routes + Supabase (Postgres)
- AI: Groq Llama 3.3 70B for summaries and voice-matched copy
- Email: MailerSend (HTML templates + analytics)
- Auth: JWT in httpOnly cookies

### 0:50 – 1:15 Database & Data Flow (Supabase)
- Tables for users, user_settings, feed_items (articles), drafts, trends, delivery_logs, analytics.
- Indexed by `published_at`, `quality_score`, and tags for fast queries.
- Articles cached; fresh filter shows only last 7 days. Social trends limited to 48 hours.

### 1:15 – 1:45 Content Ingestion & Intelligence
- 38+ RSS feeds (AI + Science) fetched in parallel, scored by source reputation, recency, depth, and media.
- Social trending from Reddit, Hacker News, Lobsters, Slashdot, Product Hunt with spike detection (TF‑IDF + engagement).
- Groq generates: concise summaries, bullet points, hashtags, and—most importantly—voice‑matched intros, commentary, and closings.

### 1:45 – 2:15 Product Flow (Demo Narrative)
1) Dashboard: Curated, recent, high‑quality articles with topic filters and AI search.
2) Trends: Real‑time topics from the last 48 hours.
3) Drafts: Click “Generate Draft” → AI writes intro, per‑article commentary, closing, and assembles a complete newsletter.
4) Review & Edit: Make light edits; status badges show pending/approved/sent.
5) Approve & Send: MailerSend delivers responsive HTML emails; opens and clicks tracked.
6) Analytics: Open rate, CTR, top sources, and ROI (time saved × hourly rate).

### 2:15 – 2:40 Key Fixes & Quality Bar
- Mode‑aware prompts (AI vs Science) to avoid off‑topic content.
- JWT from cookies fixed unauthorized issues across draft routes.
- Freshness guarantees: 7‑day article filter, 48‑hour social filter, 2‑hour Reddit cache.
- Next.js 15 params handling updated; stable, fast, secure.

### 2:40 – 2:55 Results
- Time cut: 3–5 hours → 15–20 minutes (≈91% reduction)
- 70%+ voice match accuracy
- <2s dashboard loads; 10–15s draft generation; <5s email send
- $63k+ annual ROI at $50/hr

### 2:55 – 3:00 Close
CreatorPulse lets creators focus on judgment and storytelling—while AI handles the grind. Thanks for watching.


