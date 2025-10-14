# 📄 Product Requirements Document (PRD)
## CreatorPulse - AI-Powered News Intelligence Platform

---

**Version:** 1.0  
**Last Updated:** October 14, 2025  
**Document Owner:** Product Team  
**Status:** ✅ Active Development

---

## 📑 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Vision](#product-vision)
3. [Problem Statement](#problem-statement)
4. [Target Users](#target-users)
5. [Core Features](#core-features)
6. [User Stories](#user-stories)
7. [Technical Requirements](#technical-requirements)
8. [System Architecture](#system-architecture)
9. [Data Requirements](#data-requirements)
10. [UI/UX Requirements](#uiux-requirements)
11. [Success Metrics](#success-metrics)
12. [Security & Privacy](#security--privacy)
13. [Future Roadmap](#future-roadmap)

---

## 1. Executive Summary

### Product Overview
**CreatorPulse** is an AI-powered news intelligence platform that aggregates, curates, and delivers personalized AI and science news digests. It combines RSS feed aggregation, AI-powered summarization, social media trend detection, voice-matched content generation, and email delivery into a unified platform.

### Key Differentiators
- **Dual-Mode Content**: AI News + Science Breakthroughs
- **Voice Matching**: Learns user's writing style for personalized content
- **Trend Detection**: Real-time social media integration
- **Quality Scoring**: Intelligent article ranking (0-10 scale)
- **Email-First**: Beautiful, AI-enhanced email digests

### Business Goals
1. Save users 40+ minutes daily on content curation
2. Achieve 70%+ voice match accuracy for draft generation
3. Deliver 5-10 high-quality articles daily
4. Track and prove ROI through analytics

---

## 2. Product Vision

### Vision Statement
*"Empower professionals and content creators with AI-powered intelligence that transforms information overload into actionable insights, delivered in their unique voice."*

### Mission
To create the world's most intelligent news curation platform that:
- Eliminates manual content scanning
- Surfaces emerging trends automatically
- Generates publication-ready content
- Provides measurable ROI

### Success Criteria
- **Time Savings**: <20 minutes to review and approve newsletter
- **Content Quality**: 70%+ of generated content ready to publish
- **User Satisfaction**: 4.5+ star rating
- **Engagement**: 35%+ email open rate, 8%+ CTR

---

## 3. Problem Statement

### User Pain Points

#### 1. Information Overload
- **Problem**: 50+ news sources, 100+ articles daily
- **Impact**: 2-3 hours/day spent scanning content
- **Cost**: $100-150 lost productivity daily

#### 2. Content Curation Fatigue
- **Problem**: Manual selection, reading, summarizing
- **Impact**: Inconsistent quality, missed trends
- **Cost**: Burnout, decreased engagement

#### 3. Writing Time
- **Problem**: 45-60 minutes to write newsletter
- **Impact**: Delayed delivery, reduced frequency
- **Cost**: Lost audience growth

#### 4. Trend Discovery
- **Problem**: Missing emerging topics
- **Impact**: Outdated content, low relevance
- **Cost**: Reduced subscriber value

#### 5. Analytics Blindness
- **Problem**: No visibility into what works
- **Impact**: No optimization, guesswork
- **Cost**: Declining engagement over time

---

## 4. Target Users

### Primary Personas

#### Persona 1: The Content Creator
**Demographics:**
- Age: 28-45
- Role: Newsletter writer, blogger, influencer
- Tech-savvy: High

**Needs:**
- Daily content ideas
- Quick curation
- Voice consistency
- Engagement analytics

**Pain Points:**
- Time-consuming research
- Writer's block
- Maintaining quality
- Tracking performance

#### Persona 2: The Tech Professional
**Demographics:**
- Age: 25-40
- Role: Developer, researcher, product manager
- Tech-savvy: Very High

**Needs:**
- Stay updated on AI/tech
- Quality over quantity
- Trend awareness
- Time efficiency

**Pain Points:**
- Too many sources
- Signal vs noise
- Limited time
- Information fragmentation

#### Persona 3: The Science Enthusiast
**Demographics:**
- Age: 30-55
- Role: Researcher, educator, healthcare professional
- Tech-savvy: Medium-High

**Needs:**
- Scientific breakthroughs
- Research summaries
- Credible sources
- Easy sharing

**Pain Points:**
- Jargon-heavy content
- Scattered sources
- Time to digest
- Verification

---

## 5. Core Features

### 5.1 Content Aggregation System

#### RSS Feed Integration
**Requirements:**
- Support 50+ RSS feeds (AI + Science)
- Fetch articles every 6 hours
- De-duplicate by URL
- Handle feed errors gracefully

**Sources:**
- **AI News (19 sources)**: TechCrunch AI, OpenAI Blog, DeepMind, MIT News, etc.
- **Science (19 sources)**: Nature, Science, PLOS, Cell, etc.
- **Social (5 platforms)**: Reddit, Hacker News, Lobsters, Slashdot, Product Hunt

**Quality Filters:**
- Minimum content length: 200 characters
- Published within 7 days
- Valid image URL (preferred)
- Author attribution (preferred)

---

### 5.2 AI Summarization Engine

#### LLM Integration (Groq Llama 3.3 70B)
**Requirements:**
- **Response Time**: <2 seconds per article
- **Rate Limit**: 14,400 requests/day (free tier)
- **Output Format**: Structured JSON

**Capabilities:**

1. **Article Summarization**
   - 2-3 sentence summary
   - Plain language (no jargon)
   - Key takeaway highlighted

2. **Bullet Point Extraction**
   - 3-5 key points
   - Action-oriented
   - Prioritized by importance

3. **Hashtag Generation**
   - 5-7 relevant tags
   - SEO-optimized
   - Platform-appropriate

4. **Voice Matching** (Advanced)
   - Analyze writing patterns
   - Match tone and style
   - Generate in user's voice

**Example Output:**
```json
{
  "summary": "OpenAI released GPT-5, featuring 10x faster inference and multimodal capabilities. The model achieves near-human performance on complex reasoning tasks.",
  "bullet_points": [
    "10x faster inference than GPT-4",
    "Native support for images, audio, and video",
    "95% accuracy on graduate-level reasoning tests"
  ],
  "hashtags": [
    "#AI", "#GPT5", "#OpenAI", "#MachineLearning", 
    "#ArtificialIntelligence", "#TechNews"
  ]
}
```

---

### 5.3 Quality Scoring System

#### Scoring Algorithm
**Formula:** 
```
Base Score (5.0) + Source Reputation (0-2) + Recency (0-1.5) + 
Content Length (0-1) + Media (0-0.5) = Quality Score (0-10)
```

**Factors:**

1. **Source Reputation** (0-2 points)
   - Premium sources: +2.0 (MIT, OpenAI, Nature, Science)
   - Standard sources: +1.0
   - New sources: +0.5

2. **Recency Score** (0-1.5 points)
   - <24 hours: +1.5
   - 1-3 days: +1.0
   - 4-7 days: +0.5
   - >7 days: 0

3. **Content Depth** (0-1.0 points)
   - >1000 chars: +1.0
   - 500-999 chars: +0.5
   - <500 chars: 0

4. **Media Quality** (0-0.5 points)
   - High-res image: +0.5
   - Low-res image: +0.3
   - No image: 0

**Display:**
- 8.0-10.0: ⭐ High Quality (Green)
- 6.0-7.9: ⭐ Medium Quality (Yellow)
- 0.0-5.9: ⭐ Lower Quality (Red)

---

### 5.4 Social Media Trend Detection

#### Platforms Monitored
1. **Reddit**: r/artificial, r/OpenAI
2. **Hacker News**: AI-related posts
3. **Lobsters**: Technology discussions
4. **Slashdot**: Tech news
5. **Product Hunt**: AI products

#### Detection Algorithm
**Method:** TF-IDF + Spike Detection

**Process:**
1. Fetch top posts (10-20 per platform)
2. Extract keywords using compromise.js
3. Calculate TF-IDF scores
4. Detect volume spikes (2x baseline)
5. Rank by trending score

**Trending Score Formula:**
```
Trending Score = (Engagement × 0.4) + (Recency × 0.3) + 
                 (AI Relevance × 0.2) + (Platform Weight × 0.1)
```

**Engagement Metrics:**
- Upvotes/points
- Comments count
- Share count
- Time since posted

---

### 5.5 Voice Training & Matching

#### Training Process

**Requirements:**
- Minimum: 20 newsletter samples
- Recommended: 50+ samples
- Format: Plain text or CSV

**Analysis:**
1. **Lexical Analysis**
   - Average sentence length
   - Word complexity (Flesch-Kincaid)
   - Vocabulary diversity

2. **Structural Patterns**
   - Paragraph length
   - Section structure
   - Use of lists vs paragraphs

3. **Stylistic Elements**
   - Tone (formal/casual)
   - Use of humor
   - Technical depth
   - Personal pronouns frequency

4. **Topic Preferences**
   - Favorite topics
   - Coverage depth
   - Example frequency

**Voice Profile Storage:**
```json
{
  "avg_sentence_length": 18.5,
  "readability_score": 65.2,
  "tone": "professional-casual",
  "humor_frequency": 0.15,
  "technical_depth": "intermediate",
  "personal_pronoun_ratio": 0.08,
  "favorite_topics": ["AI ethics", "LLMs", "Startups"],
  "structure_preference": "bullet-heavy"
}
```

---

### 5.6 Draft Generation

#### Newsletter Structure

**Components:**
1. **Intro (100-150 words)**
   - Hook: Trending topic or news
   - Context: Why it matters
   - Preview: What's covered

2. **Trending Topics (3 items)**
   - Social media highlights
   - Emerging discussions
   - Community buzz

3. **Top Articles (5-10 items)**
   - Title + source
   - AI summary (2-3 sentences)
   - Key points (3-5 bullets)
   - Read more link

4. **Closing (50-100 words)**
   - Call-to-action
   - Personal sign-off
   - Social links

**Generation Time:** <30 seconds

**Voice Match Target:** 70%+ similarity

---

### 5.7 Email Delivery System

#### MailerSend Integration

**Features:**
- Beautiful HTML templates
- Responsive design
- Dark mode support (coming soon)
- Inline images
- Click tracking
- Open tracking

**Template Variants:**
1. **AI News Digest** (Purple/Blue gradient)
2. **Science Breakthrough Digest** (Green gradient)
3. **Single Article Share** (Standard)
4. **Test Email** (Verification)

**Scheduling:**
- User-defined time
- Timezone support
- Daily frequency
- Pause/resume capability

**Delivery Tracking:**
- Sent timestamp
- Delivered status
- Open count
- Click count
- Bounce handling

---

### 5.8 Analytics & ROI Tracking

#### Metrics Tracked

**Email Metrics:**
- Emails sent
- Delivery rate
- Open rate
- Click-through rate (CTR)
- Bounce rate
- Spam complaints

**Content Metrics:**
- Articles curated
- Drafts generated
- Voice match score
- Review time
- Edit frequency

**ROI Calculation:**
```
Time Saved = (Manual Time - Review Time) × Frequency
ROI = Time Saved × Hourly Rate
```

**Example:**
- Manual: 60 min/day
- With CreatorPulse: 15 min/day
- Savings: 45 min/day × 30 days = 22.5 hrs/month
- ROI: 22.5 hrs × $50/hr = $1,125/month

**Dashboard Display:**
- 30-day trends
- Engagement heatmap
- Top articles by clicks
- Best performing topics
- Time savings calculator

---

### 5.9 User Management

#### Authentication
- JWT-based tokens
- Email + password
- Password hashing (bcryptjs)
- Session management
- Token expiration: 7 days

#### User Settings
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "digest_time": "09:00",
  "timezone": "America/New_York",
  "auto_send": true,
  "mode": "ai_news",
  "max_articles": 10,
  "min_quality_score": 7.0,
  "preferred_sources": ["OpenAI", "MIT"],
  "excluded_topics": ["crypto"]
}
```

---

## 6. User Stories

### Epic 1: Content Discovery

**US-1.1:** As a user, I want to see 50+ curated AI articles daily, so I don't miss important news.
- **Acceptance Criteria:**
  - Dashboard shows 50+ articles
  - Articles sorted by quality score
  - Published within 7 days
  - Display source, date, summary

**US-1.2:** As a user, I want to filter articles by topic, so I can focus on relevant content.
- **Acceptance Criteria:**
  - 10+ topic filters available
  - Multiple selection allowed
  - Real-time filtering
  - Filter count displayed

**US-1.3:** As a user, I want to search articles with AI, so I can find specific information quickly.
- **Acceptance Criteria:**
  - Search bar prominent
  - AI-powered relevance ranking
  - Highlights matches
  - Returns results <2 seconds

---

### Epic 2: Email Digest

**US-2.1:** As a user, I want to receive daily email digests, so I stay updated without visiting the site.
- **Acceptance Criteria:**
  - Email arrives at scheduled time
  - Contains 5-10 top articles
  - AI summaries included
  - Professional formatting
  - Unsubscribe option

**US-2.2:** As a user, I want to customize digest settings, so I receive relevant content.
- **Acceptance Criteria:**
  - Set delivery time
  - Choose timezone
  - Select max articles
  - Set quality threshold
  - Pause/resume option

**US-2.3:** As a user, I want to share individual articles via email, so I can forward interesting content.
- **Acceptance Criteria:**
  - One-click email share
  - Pre-filled template
  - AI summary included
  - Delivery confirmation

---

### Epic 3: Trend Detection

**US-3.1:** As a user, I want to see trending AI topics from social media, so I catch emerging discussions.
- **Acceptance Criteria:**
  - Top 5 trends displayed
  - Updated every 15 minutes
  - Shows source platforms
  - Engagement metrics visible

**US-3.2:** As a user, I want trend notifications, so I'm alerted to breaking news.
- **Acceptance Criteria:**
  - Real-time spike detection
  - Browser notifications
  - Email alerts (optional)
  - Customizable threshold

---

### Epic 4: Voice Training

**US-4.1:** As a content creator, I want to train the AI on my writing style, so drafts match my voice.
- **Acceptance Criteria:**
  - Upload 20+ samples
  - CSV or text format
  - Training completes <5 min
  - Voice profile displayed

**US-4.2:** As a content creator, I want to test voice matching, so I verify quality before generating drafts.
- **Acceptance Criteria:**
  - Generate test content
  - Compare to samples
  - Match score displayed
  - Feedback option

---

### Epic 5: Draft Generation

**US-5.1:** As a content creator, I want AI to generate newsletter drafts, so I save time writing.
- **Acceptance Criteria:**
  - Generate in <30 seconds
  - Includes intro, articles, closing
  - Matches my voice (70%+)
  - Editable inline

**US-5.2:** As a content creator, I want to review and edit drafts, so I maintain quality control.
- **Acceptance Criteria:**
  - Rich text editor
  - Track changes
  - Save progress
  - Approve & send

**US-5.3:** As a content creator, I want the AI to learn from my edits, so future drafts improve.
- **Acceptance Criteria:**
  - Track all changes
  - Analyze patterns
  - Update voice profile
  - Show improvement metrics

---

### Epic 6: Analytics

**US-6.1:** As a user, I want to see email engagement metrics, so I know what content resonates.
- **Acceptance Criteria:**
  - Open rate
  - Click-through rate
  - Top clicked articles
  - 30-day trends

**US-6.2:** As a user, I want ROI calculations, so I justify the time investment.
- **Acceptance Criteria:**
  - Time saved calculated
  - Monetary value shown
  - Monthly summary
  - Export to CSV

---

## 7. Technical Requirements

### 7.1 Technology Stack

#### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5+
- **Styling:** Tailwind CSS 4
- **UI Library:** shadcn/ui (Radix UI + Tailwind)
- **State:** React hooks (useState, useEffect)
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod

#### Backend
- **Runtime:** Node.js 18+
- **API:** Next.js API Routes
- **Database:** PostgreSQL (Supabase)
- **ORM:** Supabase Client
- **Authentication:** JWT (jose library)

#### AI/ML
- **LLM:** Groq Llama 3.3 70B
- **NLP:** compromise.js, natural
- **Voice Analysis:** Custom TF-IDF implementation

#### Email
- **Provider:** MailerSend
- **Templating:** Custom HTML/CSS
- **Tracking:** Webhooks

#### Social Media
- **Twitter:** twitter-api-v2
- **YouTube:** googleapis
- **Reddit:** Custom API client
- **Hacker News:** Firebase API

---

### 7.2 Performance Requirements

#### Response Times
- Dashboard load: <2 seconds
- Article search: <1 second
- AI summarization: <2 seconds per article
- Draft generation: <30 seconds
- Email delivery: <5 seconds

#### Scalability
- Support 1,000 concurrent users
- Process 500 articles/hour
- Handle 10,000 emails/day
- Store 100,000+ articles

#### Availability
- Uptime: 99.5%
- Database backup: Daily
- Error recovery: Automatic retry (3x)

---

### 7.3 API Specifications

#### Authentication
```
POST /api/auth/signup
POST /api/auth/login
GET /api/auth/me
POST /api/auth/logout
```

#### Articles
```
GET /api/articles?limit=50&minScore=7&topic=AI
GET /api/article?id={id}
POST /api/article/send
```

#### Trends
```
GET /api/trends
GET /api/social/topics
GET /api/science/topics
```

#### Voice Training
```
GET /api/voice-training
POST /api/voice-training/upload
POST /api/voice-training/test
```

#### Drafts
```
GET /api/drafts
POST /api/drafts
GET /api/drafts/{id}
PUT /api/drafts/{id}
POST /api/drafts/{id}/approve
```

#### Analytics
```
GET /api/analytics
GET /api/analytics/email
GET /api/analytics/roi
```

#### Sources
```
GET /api/sources
POST /api/sources
PUT /api/sources/{id}
DELETE /api/sources/{id}
```

---

## 8. System Architecture

### 8.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                   User Browser                      │
│              (Next.js Frontend)                     │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│              Next.js API Routes                     │
│     (Authentication, Business Logic)                │
└──────┬──────────────────────────────────────────────┘
       │
       ├──────────────┬──────────────┬─────────────────┐
       ▼              ▼              ▼                 ▼
┌──────────┐  ┌──────────┐  ┌──────────┐   ┌──────────────┐
│ Supabase │  │   Groq   │  │MailerSend│   │ Social APIs  │
│PostgreSQL│  │   LLM    │  │  Email   │   │ (Twitter etc)│
└──────────┘  └──────────┘  └──────────┘   └──────────────┘
```

### 8.2 Data Flow

#### Content Aggregation Flow
```
RSS Feeds → Parser → Quality Score → Database → Dashboard
   ↓
Social APIs → Trend Detection → Cache → Dashboard
```

#### Draft Generation Flow
```
User Request → Fetch Articles → AI Summarize → 
Voice Match → Generate Draft → Store → User Review → 
Edit → Approve → Email Send → Track Engagement
```

---

### 8.3 Database Schema

#### Core Tables (10 tables)

**1. users**
```sql
id UUID PRIMARY KEY
email TEXT UNIQUE NOT NULL
name TEXT
password_hash TEXT NOT NULL
created_at TIMESTAMPTZ DEFAULT NOW()
```

**2. user_settings**
```sql
user_id UUID REFERENCES users(id)
digest_time TEXT DEFAULT '09:00'
timezone TEXT DEFAULT 'UTC'
auto_send BOOLEAN DEFAULT true
mode TEXT DEFAULT 'ai_news'
settings JSONB
```

**3. feed_items** (articles)
```sql
id TEXT PRIMARY KEY
title TEXT NOT NULL
summary TEXT
url TEXT UNIQUE NOT NULL
source TEXT NOT NULL
quality_score DECIMAL(3,2)
published_at TIMESTAMPTZ
tags TEXT[]
metadata JSONB
```

**4. item_scores** (quality tracking)
```sql
feed_item_id TEXT REFERENCES feed_items(id)
relevance_score DECIMAL(3,2)
recency_score DECIMAL(3,2)
source_reliability_score DECIMAL(3,2)
final_score DECIMAL(3,2)
```

**5. digests**
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
title TEXT
article_ids TEXT[]
generated_at TIMESTAMPTZ
status TEXT DEFAULT 'draft'
```

**6. voice_training_samples**
```sql
user_id UUID REFERENCES users(id)
sample_text TEXT NOT NULL
sample_date DATE
metadata JSONB
analyzed BOOLEAN DEFAULT false
```

**7. newsletter_drafts**
```sql
user_id UUID REFERENCES users(id)
content JSONB
voice_match_score DECIMAL(3,2)
status TEXT DEFAULT 'draft'
created_at TIMESTAMPTZ
```

**8. engagement_analytics**
```sql
digest_id UUID REFERENCES digests(id)
event_type TEXT
recipient_email TEXT
event_timestamp TIMESTAMPTZ
metadata JSONB
```

**9. trend_detection**
```sql
id UUID PRIMARY KEY
keyword TEXT
platform TEXT
trending_score DECIMAL(5,2)
first_detected TIMESTAMPTZ
peak_time TIMESTAMPTZ
```

**10. user_sources**
```sql
user_id UUID REFERENCES users(id)
source_type TEXT
source_identifier TEXT
priority_weight INTEGER
enabled BOOLEAN DEFAULT true
```

---

## 9. Data Requirements

### 9.1 Data Sources

#### RSS Feeds (38 total)

**AI News (19 sources):**
1. MIT News - AI
2. OpenAI Blog
3. DeepMind
4. Google AI Blog
5. Microsoft AI Blog
6. NVIDIA AI Blog
7. Anthropic Blog
8. Hugging Face Blog
9. TechCrunch AI
10. The Verge AI
11. VentureBeat AI
12. Wired AI
13. Towards Data Science
14. Analytics Vidhya
15. Machine Learning Mastery
16. Papers with Code
17. The Gradient
18. MarkTechPost
19. AI Trends

**Science Breakthroughs (19 sources):**
1. Nature News
2. Science Magazine
3. PLOS Biology
4. Cell
5. The Lancet
6. New England Journal of Medicine (NEJM)
7. PNAS
8. Nature Biotechnology
9. Nature Medicine
10. Science Daily
11. EurekAlert!
12. ScienceNews
13. Phys.org
14. Medical Xpress
15. ACS News
16. NIH News
17. CDC Updates
18. WHO News
19. BioMed Central

#### Social Media Platforms
1. **Reddit**
   - Subreddits: r/artificial, r/OpenAI, r/MachineLearning
   - Metrics: Upvotes, comments

2. **Hacker News**
   - Front page stories
   - Metrics: Points, comments

3. **Lobsters**
   - Tech discussions
   - Metrics: Upvotes

4. **Slashdot**
   - Tech news
   - Metrics: Comments, shares

5. **Product Hunt**
   - AI products
   - Metrics: Upvotes, reviews

---

### 9.2 Data Retention

**Article Data:**
- Store: 90 days
- Archive: 1 year
- Purge: After 1 year

**User Data:**
- Active accounts: Indefinite
- Inactive accounts (180 days): Anonymize

**Analytics Data:**
- Detailed: 90 days
- Aggregated: 2 years
- Retention: GDPR compliant

---

### 9.3 Data Privacy

**User Data Protection:**
- Email: Encrypted at rest
- Password: Bcrypt hashed
- API keys: Encrypted

**GDPR Compliance:**
- Data export: Available
- Data deletion: Supported
- Consent management: Implemented

---

## 10. UI/UX Requirements

### 10.1 Design Principles

1. **Clarity Over Cleverness**
   - Simple, intuitive interfaces
   - Clear call-to-actions
   - Minimal cognitive load

2. **Speed & Efficiency**
   - Fast page loads (<2s)
   - Keyboard shortcuts
   - Bulk actions

3. **Accessibility**
   - WCAG 2.1 AA compliant
   - Screen reader friendly
   - Keyboard navigation

4. **Responsive Design**
   - Mobile-first approach
   - Tablet optimized
   - Desktop enhanced

---

### 10.2 Key Pages

#### Dashboard (/)
**Layout:**
```
┌─────────────────────────────────────────────┐
│  Header: Logo, Search, Mode Switch, Profile │
├─────────────────────────────────────────────┤
│  Stats: Articles, Quality, Topics, Sources  │
├─────────────────────────────────────────────┤
│  Trending Topics (Carousel)                 │
├─────────────────────────────────────────────┤
│  Topic Filters (Pills)                      │
├─────────────────────────────────────────────┤
│  Article Grid (3 columns)                   │
│  ┌──────┐ ┌──────┐ ┌──────┐               │
│  │ Card │ │ Card │ │ Card │               │
│  └──────┘ └──────┘ └──────┘               │
└─────────────────────────────────────────────┘
```

**Article Card:**
- Image (16:9)
- Source logo + name
- Quality score (stars)
- Title
- Summary (3 lines)
- Tags (3 max)
- Actions: Read, Email, Share

---

#### Settings (/settings)
**Sections:**
1. **Profile**
   - Name
   - Email
   - Password change

2. **Digest Settings**
   - Delivery time
   - Timezone
   - Auto-send toggle
   - Max articles
   - Quality threshold

3. **Content Preferences**
   - Mode (AI/Science)
   - Preferred sources
   - Excluded topics

4. **Voice Training**
   - Upload samples
   - Training status
   - Voice profile

5. **Analytics**
   - Email stats
   - ROI calculator
   - Export data

---

#### Voice Training (/voice-training)
**Components:**
1. Upload Area
   - Drag & drop
   - File browser
   - CSV/Text support

2. Sample List
   - File name
   - Date
   - Word count
   - Delete option

3. Training Status
   - Progress bar
   - Samples analyzed
   - Voice match score

4. Test Generation
   - Sample topic input
   - Generate button
   - Output comparison

---

#### Draft Editor (/drafts/[id])
**Layout:**
```
┌─────────────────────────────────────────────┐
│  Title, Status, Voice Score                 │
├─────────────────────────────────────────────┤
│                                             │
│  Rich Text Editor                           │
│  - Intro                                    │
│  - Trending Topics                          │
│  - Articles (editable)                      │
│  - Closing                                  │
│                                             │
├─────────────────────────────────────────────┤
│  [Save Draft]  [Preview]  [Approve & Send] │
└─────────────────────────────────────────────┘
```

---

### 10.3 Color Palette

#### AI News Mode
- Primary: #667eea (Purple)
- Accent: #764ba2 (Deep Purple)
- Success: #48bb78 (Green)
- Warning: #f6ad55 (Orange)
- Error: #f56565 (Red)

#### Science Mode
- Primary: #48bb78 (Green)
- Accent: #38a169 (Teal)
- Success: #4299e1 (Blue)
- Warning: #ed8936 (Orange)
- Error: #e53e3e (Red)

#### Neutral
- Background: #ffffff (Light), #1a202c (Dark)
- Text: #1a202c (Light), #f7fafc (Dark)
- Border: #e2e8f0
- Muted: #718096

---

### 10.4 Typography

- **Headings:** Geist Sans (system font fallback)
- **Body:** -apple-system, BlinkMacSystemFont, Segoe UI, Roboto
- **Code:** Geist Mono

**Scale:**
- H1: 2.25rem (36px)
- H2: 1.875rem (30px)
- H3: 1.5rem (24px)
- Body: 1rem (16px)
- Small: 0.875rem (14px)

---

## 11. Success Metrics

### 11.1 Key Performance Indicators (KPIs)

#### Product Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Daily Active Users (DAU) | 1,000+ | Google Analytics |
| Email Open Rate | 35%+ | MailerSend |
| Click-Through Rate (CTR) | 8%+ | MailerSend |
| Voice Match Score | 70%+ | Internal |
| Draft Review Time | <20 min | Analytics |
| Time Savings | 40+ min/day | User survey |

#### Business Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Monthly Active Users (MAU) | 5,000+ | Database |
| User Retention (30-day) | 60%+ | Cohort analysis |
| Newsletter Frequency | 3+/week | Analytics |
| Customer Satisfaction | 4.5+/5 | NPS survey |
| ROI per User | $1,000+/mo | Calculator |

#### Technical Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| API Response Time | <2s | Monitoring |
| Uptime | 99.5%+ | StatusPage |
| Error Rate | <1% | Sentry |
| Page Load Speed | <2s | Lighthouse |

---

### 11.2 Success Criteria by Phase

#### Phase 1: MVP (Months 1-2)
- ✅ 50+ articles aggregated daily
- ✅ AI summarization working
- ✅ Email delivery functional
- ✅ Basic dashboard live

#### Phase 2: Voice Training (Month 3)
- ⏳ Voice training implemented
- ⏳ Draft generation working
- ⏳ 70%+ voice match achieved
- ⏳ 100+ users trained

#### Phase 3: Social Integration (Month 4)
- ⏳ 5 social platforms integrated
- ⏳ Trending topics detected
- ⏳ Real-time updates working
- ⏳ User notifications enabled

#### Phase 4: Analytics (Month 5)
- ⏳ Email tracking live
- ⏳ ROI calculator working
- ⏳ Export functionality
- ⏳ Dashboard insights

#### Phase 5: Scale (Month 6+)
- ⏳ 5,000+ MAU
- ⏳ Enterprise features
- ⏳ API access
- ⏳ White-label option

---

## 12. Security & Privacy

### 12.1 Security Measures

#### Authentication
- JWT tokens with 7-day expiration
- Password hashing (bcryptjs, 10 rounds)
- Rate limiting (100 requests/min)
- HTTPS only

#### Data Protection
- Database encryption at rest
- API key encryption
- PII anonymization
- GDPR compliance

#### API Security
- CORS protection
- Input validation (Zod)
- SQL injection prevention
- XSS protection

---

### 12.2 Privacy Policy

**Data Collection:**
- Email (account creation)
- Name (optional)
- Usage analytics (anonymized)
- Email engagement (opt-in)

**Data Usage:**
- Service delivery
- Product improvement
- Analytics (aggregated)
- No selling to third parties

**User Rights:**
- Access data
- Export data
- Delete account
- Opt-out of analytics

---

## 13. Future Roadmap

### 13.1 Short-Term (3-6 months)

**Q1 2026:**
- ✅ Voice training UI
- ✅ Draft editor
- ⏳ Mobile app (React Native)
- ⏳ Browser extension

**Q2 2026:**
- ⏳ Team collaboration
- ⏳ Custom branding
- ⏳ Advanced analytics
- ⏳ A/B testing

---

### 13.2 Medium-Term (6-12 months)

**Q3 2026:**
- Multi-language support
- Video content integration
- Podcast transcription
- Advanced search (vector DB)

**Q4 2026:**
- Enterprise tier
- API access
- Webhooks
- White-label solution

---

### 13.3 Long-Term (12+ months)

**2027:**
- AI content generation
- Custom LLM fine-tuning
- Social media posting
- CMS integrations
- Community features

---

## 14. Appendices

### Appendix A: Glossary

- **CTR**: Click-Through Rate
- **DAU**: Daily Active Users
- **LLM**: Large Language Model
- **MAU**: Monthly Active Users
- **NLP**: Natural Language Processing
- **PRD**: Product Requirements Document
- **ROI**: Return on Investment
- **TF-IDF**: Term Frequency-Inverse Document Frequency

### Appendix B: References

1. [Groq API Documentation](https://console.groq.com/docs)
2. [MailerSend Documentation](https://developers.mailersend.com/)
3. [Supabase Documentation](https://supabase.com/docs)
4. [Next.js Documentation](https://nextjs.org/docs)
5. [shadcn/ui Components](https://ui.shadcn.com/)

---

## 15. Implementation Status & Recent Updates

### Current Implementation Status (December 14, 2025)

#### Core Features - Completed
- Content Aggregation: 38+ RSS feeds (AI + Science), 5 social platforms
- AI Summarization: Groq Llama 3.3 70B integration
- Quality Scoring: 0-10 scale with multiple factors
- Email Delivery: MailerSend integration with beautiful templates
- User Authentication: JWT-based with httpOnly cookies
- Analytics Dashboard: Email metrics, ROI tracking, performance insights
- Newsletter Drafts: AI-powered draft generation with voice matching
- Social Trending: Reddit, Hacker News, Lobsters, Slashdot, Product Hunt
- Dual Mode: AI News + Science Breakthroughs

#### Recent Fixes (December 14, 2025)
1. Date Filtering: Articles limited to last 7 days, trending to last 48 hours
2. Analytics Dashboard: Complete dashboard with ROI calculator added
3. Draft Authentication: Fixed 401 errors with JWT cookie verification
4. Draft Review: Added missing getStatusBadge function
5. Email Sending: Implemented full email delivery on draft approval
6. AI Mode Prompts: Fixed generic prompts to focus on AI/Science topics
7. Import Fixes: Resolved supabase import issues in draft-generator and trend-detection

#### Pages Available
- / - AI News Dashboard
- /science - Science Breakthrough Dashboard
- /social - Social Media Trends
- /analytics - Analytics & ROI Dashboard
- /drafts - Newsletter Draft Management
- /drafts/[id] - Draft Editor
- /voice-training - Voice Training System
- /sources - Custom Source Management
- /settings - User Settings
- /history - Email History
- /login - Authentication
- /signup - User Registration

#### API Endpoints Functional
- /api/articles - Fetch articles (with 7-day filter)
- /api/social/topics - Trending topics (48-hour filter)
- /api/drafts - Draft CRUD operations
- /api/drafts/[id]/approve - Approve & send via email
- /api/analytics - Performance metrics
- /api/voice-training - Voice profile management
- /api/digest/send - Send digest emails
- /api/auth/* - Authentication endpoints

#### Known Limitations
- MailerSend trial accounts send to admin email only
- Voice training requires 20+ newsletter samples
- Social media trending cached for 2 hours
- Some RSS feeds may timeout (Lobsters occasionally)

#### Performance Metrics
- Dashboard load: <2 seconds
- AI summarization: <2 seconds per article
- Draft generation: 10-15 seconds
- Email delivery: <5 seconds
- Social trending fetch: 1-10 seconds (cached 2 hours)
- Article filtering: Last 7 days only (fresh content)

### Deployment Checklist
- [ ] Configure environment variables (.env.local)
- [ ] Run database migrations (supabase/QUICK_SETUP.sql)
- [ ] Add MailerSend API key and verified domain
- [ ] Add Groq API key for AI features
- [ ] (Optional) Configure Twitter/YouTube API keys
- [ ] (Optional) Upload voice training samples
- [ ] Test email delivery
- [ ] Set up MailerSend webhooks for analytics

---

**Document Status:** ✅ Active  
**Last Updated:** December 14, 2025
**Version:** 1.1
**Next Review:** January 2026  
**Feedback:** product@creatorpulse.com

---

*This PRD is a living document and will be updated as the product evolves.*
*For historical documentation, see docs-backup/ folder.*

