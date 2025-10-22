# 🚀 CreatorPulse - Project Overview

**Last Updated:** October 21, 2025  
**Version:** 1.0  
**Status:** Production Ready

---

## 📋 Table of Contents

1. [Project Summary](#project-summary)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Key Features](#key-features)
5. [Architecture](#architecture)
6. [Data Flow](#data-flow)
7. [API Endpoints](#api-endpoints)
8. [Database Schema](#database-schema)
9. [Environment Variables](#environment-variables)
10. [Setup Instructions](#setup-instructions)
11. [Development Guide](#development-guide)
12. [Deployment](#deployment)
13. [Troubleshooting](#troubleshooting)

---

## 📌 Project Summary

**CreatorPulse** is an AI-powered content curation and generation platform designed to help content creators stay informed about AI/ML developments and generate high-quality, platform-specific content.

### **Core Purpose**
Automates the content creation workflow by:
- **Aggregating** AI news from 30+ RSS feeds and social media
- **Curating** top-quality articles using AI scoring
- **Generating** platform-specific content (Twitter, LinkedIn, YouTube, etc.)
- **Delivering** personalized newsletters via email

### **Problem Statement**
Creators lose valuable time manually researching and curating content, which slows consistency and limits reach.

### **Solution**
CreatorPulse automates source aggregation, surfaces emerging trends, and streamlines content packaging for faster, higher-quality output.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **State Management:** React Server Components + Client Components

### **Backend**
- **Runtime:** Node.js 18+
- **API:** Next.js API Routes
- **Authentication:** JWT (JSON Web Tokens) with httpOnly cookies

### **Database**
- **Primary:** Supabase (PostgreSQL)
- **ORM:** Supabase Client SDK
- **Caching:** In-memory cache for articles

### **AI/ML Services**
- **LLM:** Groq Llama 3.3 70B
- **Content Generation:** Custom AI templates
- **Voice Matching:** AI-powered personalization

### **External Services**
- **Email:** MailerSend
- **RSS Parsing:** Custom RSS parser with quality scoring
- **Social Media:** Reddit, Hacker News, Lobsters, Slashdot, Product Hunt

---

## 📁 Project Structure

```
creatorpulse/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── articles/      # Article fetching
│   │   ├── auth/          # Authentication endpoints
│   │   ├── drafts/        # Draft generation & management
│   │   ├── social/        # Social media integration
│   │   └── ...
│   ├── drafts/            # Draft management pages
│   ├── history/           # User history
│   ├── settings/          # User settings
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
│
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── matrix-hero.tsx   # Animated hero section
│   ├── news-card.tsx     # Article display
│   ├── article-selector.tsx  # Article selection UI
│   ├── content-customizer.tsx  # Content customization
│   └── ...
│
├── lib/                   # Core business logic
│   ├── supabase.ts       # Database client
│   ├── auth.ts           # Authentication
│   ├── rss-parser.ts     # RSS feed parsing
│   ├── llm-service.ts    # AI/LLM integration
│   ├── email-service.ts  # Email sending
│   ├── draft-generator.ts  # Content generation
│   ├── content-templates-v2.ts  # Content templates
│   ├── social-media-service.ts  # Social media
│   └── ...
│
├── public/               # Static assets
│   ├── logos/           # Platform logos
│   └── ...
│
├── scripts/             # Utility scripts
│   ├── add-sources.ts   # Add RSS feeds
│   ├── create-admin.ts  # Create admin user
│   └── ...
│
├── supabase/            # Database schemas
│   ├── schema.sql       # Main schema
│   └── QUICK_SETUP.sql  # Quick setup
│
├── config.json          # RSS feed configuration
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── next.config.mjs      # Next.js config
└── .env.local           # Environment variables
```

---

## ✨ Key Features

### **1. News Aggregation**
- **30+ RSS Feeds** from top AI sources (OpenAI, Google AI, TechCrunch, etc.)
- **Quality Scoring** (0-10 scale) based on:
  - Recency (last 7 days)
  - Content length
  - Source reputation
- **Topic Filtering** (10+ AI categories)
- **Real-time Search** with AI-powered results

### **2. Social Media Integration**
- **Reddit** - AI subreddits (/r/MachineLearning, /r/artificial, etc.)
- **Hacker News** - AI-related discussions
- **Lobsters** - Tech community
- **Slashdot** - Tech news
- **Product Hunt** - AI products

### **3. Content Generation**
- **Platform-Specific Templates:**
  - Twitter/X Posts
  - LinkedIn Articles
  - Instagram Captions
  - YouTube Scripts
  - Blog Posts
  - Newsletters
- **Customization Options:**
  - Length (very short, short, medium, long)
  - Tone (professional, casual, technical, educational)
  - Audience targeting
  - Custom CTA
- **AI-Powered:**
  - Uses Groq Llama 3.3 70B
  - Voice matching for personalization
  - Emoji and hashtag integration

### **4. Newsletter System**
- **Daily Digests** - Top 5 articles automatically selected
- **AI Summaries** - Generated for each article
- **Beautiful HTML Templates** - Professional design
- **Scheduled Delivery** - User's preferred time
- **Draft Management** - Review before sending

### **5. Authentication & User Management**
- **JWT-based Authentication** - Secure token management
- **User Profiles** - Preferences and settings
- **Role-based Access** - Admin, user roles
- **Session Management** - Automatic token refresh

---

## 🏗️ Architecture

### **High-Level Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  Next.js 15 + React + Tailwind CSS + shadcn/ui             │
│  (Server Components + Client Components)                     │
└────────────┬────────────────────────────────────────────────┘
             │
             │ HTTP/REST
             ▼
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER                               │
│  Next.js API Routes (app/api/*)                             │
│  - Authentication (JWT)                                      │
│  - Data fetching & caching                                   │
│  - Content generation                                        │
└────────────┬────────────────────────────────────────────────┘
             │
             │
    ┌────────┴────────┬──────────────┬──────────────┐
    ▼                 ▼              ▼              ▼
┌─────────┐     ┌──────────┐  ┌──────────┐  ┌──────────┐
│Database │     │   AI/ML  │  │   Email  │  │   RSS    │
│Supabase │     │   Groq   │  │MailerSend│  │  Feeds   │
│PostgreSQL     │Llama 3.3 │  │          │  │  (30+)   │
└─────────┘     └──────────┘  └──────────┘  └──────────┘
```

### **Key Components**

1. **RSS Parser (`lib/rss-parser.ts`)**
   - Fetches and parses RSS feeds
   - Calculates quality scores
   - Filters recent articles (last 7 days)
   - Handles errors and timeouts

2. **LLM Service (`lib/llm-service.ts`)**
   - Integrates with Groq Llama 3.3 70B
   - Generates summaries and content
   - Singleton pattern for efficiency
   - Error handling and retries

3. **Draft Generator (`lib/draft-generator.ts`)**
   - Creates platform-specific content
   - Uses content templates
   - Voice matching for personalization
   - Supports multiple content types

4. **Content Templates (`lib/content-templates-v2.ts`)**
   - Platform-specific formatting
   - Length control (very short to long)
   - Emoji and hashtag integration
   - Professional output (no asterisks)

5. **Email Service (`lib/email-service.ts`)**
   - MailerSend integration
   - HTML email templates
   - Delivery tracking
   - Error handling

---

## 🔄 Data Flow

### **Article Aggregation Flow**

```
RSS Feeds (30+) → RSS Parser → Quality Scoring → 
In-Memory Cache → Database Storage (nightly) → 
Frontend Display → User Selection
```

### **Content Generation Flow**

```
User Selects Articles → Article Selector Component →
Content Customizer (type, length, tone) →
Draft Generator API →
LLM Service (Groq) → Content Templates →
Generated Draft → Draft Preview →
User Approval → Email Delivery (optional)
```

### **Authentication Flow**

```
User Login → Auth API → JWT Generation →
Set httpOnly Cookie → Verify Token →
Protected Routes → Refresh Token (if needed)
```

---

## 🔌 API Endpoints

### **Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify JWT token

### **Articles**
- `GET /api/articles` - Fetch articles (with filters)
- `GET /api/article/[id]` - Get single article

### **Drafts**
- `GET /api/drafts` - List user's drafts
- `POST /api/drafts` - Generate new draft
- `GET /api/drafts/[id]` - Get draft details
- `PUT /api/drafts/[id]` - Update draft
- `DELETE /api/drafts/[id]` - Delete draft
- `POST /api/drafts/[id]/approve` - Approve and send

### **Social Media**
- `GET /api/social/reddit` - Get Reddit posts
- `GET /api/social/hackernews` - Get Hacker News posts
- `GET /api/social/trending` - Get trending topics

### **Analytics**
- `GET /api/analytics` - Get user analytics
- `GET /api/analytics/performance` - Content performance

---

## 🗄️ Database Schema

### **Key Tables**

#### **users**
```sql
- id (uuid, primary key)
- email (text, unique)
- password_hash (text)
- name (text)
- created_at (timestamp)
- role (text) - 'user' or 'admin'
```

#### **feed_items**
```sql
- id (uuid, primary key)
- title (text)
- content (text)
- url (text, unique)
- published_at (timestamp)
- source (text)
- quality_score (numeric)
- topics (text[])
- created_at (timestamp)
```

#### **drafts**
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key)
- title (text)
- content (text)
- metadata (jsonb) - content type, customization
- status (text) - 'draft', 'sent', 'scheduled'
- created_at (timestamp)
- sent_at (timestamp)
```

#### **email_analytics**
```sql
- id (uuid, primary key)
- draft_id (uuid, foreign key)
- email (text)
- opened (boolean)
- clicked (boolean)
- opened_at (timestamp)
- clicked_at (timestamp)
```

---

## 🔐 Environment Variables

Required variables in `.env.local`:

```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Authentication
JWT_SECRET=your_jwt_secret_key

# AI/ML
GROQ_API_KEY=your_groq_api_key

# Email
MAILERSEND_API_KEY=your_mailersend_api_key

# Twitter/X (Optional)
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret
```

---

## 🚀 Setup Instructions

### **Prerequisites**
- Node.js 18+ and npm/pnpm
- Supabase account
- Groq API key
- MailerSend API key

### **Installation Steps**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd creatorpulse
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

4. **Set up database**
   ```bash
   # Run the schema in Supabase SQL Editor
   cat supabase/QUICK_SETUP.sql
   ```

5. **Add RSS feeds**
   ```bash
   npm run add-sources
   ```

6. **Create admin user**
   ```bash
   npm run create-admin
   ```

7. **Run development server**
   ```bash
   npm run dev
   ```

8. **Open browser**
   ```
   http://localhost:3000
   ```

---

## 👨‍💻 Development Guide

### **Key Commands**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types
```

### **Adding New Features**

1. **New API Route**
   - Create file in `app/api/[route]/route.ts`
   - Export GET, POST, PUT, DELETE handlers
   - Use `getUserFromToken()` for authentication

2. **New Component**
   - Create in `components/[name].tsx`
   - Use TypeScript for type safety
   - Follow existing component patterns

3. **New Library Function**
   - Create in `lib/[name].ts`
   - Export functions/classes
   - Add error handling

4. **New Content Template**
   - Edit `lib/content-templates-v2.ts`
   - Add new template with `generatePrompt` and `formatOutput`

### **Code Style**
- **TypeScript:** Strict mode enabled
- **Formatting:** Prettier (via .prettierrc)
- **Linting:** ESLint (via .eslintrc)
- **Components:** Functional components with hooks
- **Naming:** camelCase for functions, PascalCase for components

---

## 🌐 Deployment

### **Vercel (Recommended)**

1. **Connect repository**
   - Import project in Vercel dashboard
   - Select Next.js framework preset

2. **Configure environment variables**
   - Add all variables from `.env.local`
   - Save and deploy

3. **Set up domain** (optional)
   - Add custom domain in settings
   - Update DNS records

### **Other Platforms**
- **Netlify:** Use Next.js build plugin
- **Railway:** Connect GitHub repo
- **Self-hosted:** Run `npm run build` and `npm run start`

---

## 🔧 Troubleshooting

### **Common Issues**

1. **Database Connection Error**
   - Verify `NEXT_PUBLIC_SUPABASE_URL` and keys
   - Check network connectivity
   - Ensure schema is set up correctly

2. **JWT Authentication Error**
   - Verify `JWT_SECRET` is set
   - Check token expiration
   - Clear cookies and login again

3. **RSS Feed Not Loading**
   - Check `config.json` for valid URLs
   - Verify network access to RSS feeds
   - Check logs for parsing errors

4. **Content Generation Failing**
   - Verify `GROQ_API_KEY` is valid
   - Check API rate limits
   - Review error messages in console

5. **Email Not Sending**
   - Verify `MAILERSEND_API_KEY`
   - Check email templates
   - Review MailerSend logs

---

## 📚 Additional Resources

- **README.md** - Project overview and quick start
- **PRD.md** - Complete product requirements
- **PRESENTATION_SIMPLE.md** - 7-slide presentation
- **docs-backup/** - Historical documentation

---

## 🤝 Contributing

When contributing to this project:
1. Follow the existing code style
2. Add TypeScript types
3. Test thoroughly before committing
4. Update documentation as needed
5. Create descriptive commit messages

---

## 📄 License

This project is proprietary and confidential.

---

**For questions or support, contact the development team.**

