# 🎯 CreatorPulse - AI News Digest Platform

A modern, AI-powered news aggregation platform that curates and delivers personalized AI news digests via email.

![CreatorPulse Dashboard](https://img.shields.io/badge/Status-Live-green)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)
![Groq AI](https://img.shields.io/badge/Groq-AI-purple)

## ✨ Features

### 🏠 **Smart Dashboard**
- **50+ Real Articles** from 19 premium AI news sources
- **AI-Enhanced Summaries** powered by Groq Llama 3.3 70B
- **Quality Scoring** system (6.0-9.0 range)
- **Topic Filtering** with 10+ AI categories
- **Real-time Search** with AI-powered results

### 📧 **Daily Email Digest**
- **5 Top Articles** automatically selected daily
- **AI-Generated Summaries** for each article
- **Beautiful HTML Templates** with professional design
- **Scheduled Delivery** at user's preferred time
- **Individual Article Sharing** via email

### 🔐 **User Management**
- **Secure Authentication** with JWT tokens
- **User Preferences** for digest timing and content
- **Profile Management** with email settings
- **Settings Dashboard** for customization

### 🎨 **Modern UI/UX**
- **Responsive Design** works on all devices
- **Dark/Light Mode** support
- **Smooth Animations** and transitions
- **Professional Typography** and spacing
- **Scrolling Source Animation** with brand logos

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- MailerSend account
- Groq API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Babajan-B/CreatorPulse---AI-News-Digest-Platform.git
cd CreatorPulse---AI-News-Digest-Platform
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local with your actual credentials
nano .env.local
```

4. **Database Setup**
```bash
# Run the database schema setup
npm run db:setup
```

5. **Start Development Server**
```bash
npm run dev
```

Visit `http://localhost:3001` to see your application!

## 🔧 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_supabase_database_url

# JWT Secret
JWT_SECRET=your_secure_jwt_secret

# MailerSend Email Service
MAILERSEND_API_KEY=your_mailersend_api_key
MAILERSEND_FROM_EMAIL=your_verified_sender_email
MAILERSEND_FROM_NAME=CreatorPulse
MAILERSEND_ADMIN_EMAIL=your_admin_email

# Groq AI Service
GROQ_API_KEY=your_groq_api_key
```

### 🔑 Getting API Keys

#### Supabase
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get URL and anon key from Settings > API
4. Get database URL from Settings > Database

#### MailerSend
1. Sign up at [mailersend.com](https://mailersend.com)
2. Verify your domain
3. Get API key from Account > API Tokens
4. Note: Trial accounts can only send to admin email

#### Groq
1. Create account at [console.groq.com](https://console.groq.com)
2. Generate API key from API Keys section
3. Free tier includes 14,400 requests/day

## 📊 Database Schema

The application uses a comprehensive PostgreSQL schema with 10 tables:

- **users** - User accounts and authentication
- **user_settings** - User preferences and digest settings
- **feed_items** - RSS articles and content
- **item_scores** - Quality scoring for articles
- **digests** - Daily digest records
- **digest_items** - Articles included in digests
- **delivery_logs** - Email delivery tracking
- **user_interactions** - User engagement data

See `supabase/COMPLETE_SCHEMA.sql` for full schema details.

## 🎯 RSS Sources

CreatorPulse aggregates content from 19 premium AI news sources:

### Research & Academic
- MIT News AI
- Papers with Code
- The Gradient

### Tech Companies
- Google AI Blog
- OpenAI Blog
- DeepMind News
- Microsoft AI Blog
- NVIDIA AI Blog
- Anthropic Blog
- Hugging Face Blog

### Industry Publications
- TechCrunch AI
- Towards Data Science
- Analytics Vidhya
- MarkTechPost
- AI Trends
- Machine Learning Mastery
- AIwire
- AI Blog
- Stability AI

## 🤖 AI Integration

### Groq Llama 3.3 70B
- **Ultra-fast inference** (~1-2 seconds)
- **Article summarization** with 2-3 sentence summaries
- **Bullet point extraction** for key takeaways
- **Hashtag generation** for social sharing
- **JSON output format** for structured data

### Email Templates
- **Beautiful HTML design** with gradients and professional styling
- **Responsive layout** works on all email clients
- **AI-enhanced content** with summaries and bullet points
- **Brand consistency** with CreatorPulse styling

## 📧 Email System

### Daily Digest Features
- **5 top articles** selected from last 24 hours
- **AI summaries** generated for each article
- **Full summaries** limited to 300 words
- **Direct links** to original articles
- **Professional formatting** with gradients and typography

### Individual Article Sharing
- **One-click sharing** from article cards
- **AI-enhanced emails** with summaries
- **Professional templates** for single articles
- **Delivery tracking** logged in database

## 🎨 UI Components

### Modern Design System
- **shadcn/ui** components with Tailwind CSS
- **Consistent spacing** and typography
- **Dark mode support** with theme switching
- **Responsive grid** layouts
- **Smooth animations** and transitions

### Key Components
- **NewsCard** - Article display with sharing options
- **PlatformIcons** - Scrolling source animation
- **StatsDashboard** - Analytics and metrics
- **TopicFilter** - Content categorization
- **AISearchBar** - Intelligent search interface

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on git push

### Manual Deployment
```bash
npm run build
npm start
```

## 📈 Performance

- **50+ articles** loaded in ~2 seconds
- **AI processing** completes in 1-2 seconds
- **Email delivery** via MailerSend in ~5 seconds
- **Database queries** optimized with indexes
- **Image optimization** with Next.js Image component

## 🔒 Security

- **JWT authentication** with secure tokens
- **Password hashing** with bcryptjs
- **Environment variables** for sensitive data
- **CORS protection** and rate limiting
- **Input validation** and sanitization

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** for the amazing React framework
- **Supabase** for the backend infrastructure
- **Groq** for ultra-fast AI inference
- **MailerSend** for reliable email delivery
- **shadcn/ui** for beautiful UI components
- **Tailwind CSS** for utility-first styling

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Babajan-B/CreatorPulse---AI-News-Digest-Platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Babajan-B/CreatorPulse---AI-News-Digest-Platform/discussions)

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Babajan-B/CreatorPulse---AI-News-Digest-Platform&type=Date)](https://star-history.com/#Babajan-B/CreatorPulse---AI-News-Digest-Platform&Date)

---

**Built with ❤️ by [Babajan-B](https://github.com/Babajan-B)**

*CreatorPulse - Your AI News Intelligence Platform*