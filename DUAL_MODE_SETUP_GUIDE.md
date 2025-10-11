# Dual-Mode Setup Guide

## Overview

Your AI News web app now supports **two distinct modes**:

1. **AI News** - Latest AI developments, models, and tech news
2. **Science Breakthroughs** - Medical research, scientific discoveries, and breakthroughs

## 🚀 Quick Setup

### 1. Database Updates

Run the database migration to add the `preferred_mode` field:

```sql
-- Run this in your Supabase SQL editor
ALTER TABLE user_settings 
ADD COLUMN preferred_mode VARCHAR(50) DEFAULT 'ai_news';

ALTER TABLE user_settings 
ADD CONSTRAINT check_preferred_mode 
CHECK (preferred_mode IN ('ai_news', 'science_breakthrough'));

CREATE INDEX idx_user_settings_preferred_mode ON user_settings(preferred_mode);
```

### 2. Environment Variables

Add these to your `.env.local`:

```bash
# Encryption for sensitive data
ENCRYPTION_PASSWORD=your-secure-encryption-password-here

# Optional: Cron job security
CRON_SECRET_TOKEN=your-cron-secret-token
```

### 3. Test the Integration

```bash
# Run the test script
npm run ts-node scripts/test-dual-mode-integration.ts
```

## 📋 Features Implemented

### ✅ User Settings
- **Mode Selection**: Users can choose between "AI News" and "Science Breakthroughs"
- **Persistent Storage**: Preference saved in `user_settings.preferred_mode`
- **Settings UI**: Updated settings page with mode selection dropdown

### ✅ Dual Content Sources
- **AI News**: Existing RSS feeds (TechCrunch, The Verge, etc.)
- **Science Breakthroughs**: 19+ scientific sources including:
  - Nature Medicine, PLOS Medicine, Frontiers in Medicine
  - New England Journal of Medicine, medRxiv
  - Nature, Science, Cell, Neuron
  - arXiv Physics, ChemRxiv, Nature Biotechnology

### ✅ Smart Content Processing
- **Mode-Specific Summaries**: 
  - AI News: Engaging, tech-focused summaries
  - Science: Research-focused, methodology-aware summaries
- **Importance Scoring**: Articles ranked by relevance and source weight
- **Top 5 Selection**: Best articles selected for daily digest

### ✅ Enhanced Email System
- **Mode-Specific Templates**: Different styling for AI vs Science content
- **Personalized Subjects**: "AI News Digest" vs "Science Breakthrough Digest"
- **Rich Content**: Bullet points, hashtags, and research highlights

### ✅ Secure API Key Management
- **Encrypted Storage**: AES-256-GCM encryption for sensitive data
- **User-Specific Keys**: Each user's keys encrypted with unique password
- **API Key Validation**: Format validation for different providers

### ✅ Homepage Dashboard
- **Mode Display**: Shows user's selected mode with custom styling
- **Today's Content**: Displays top articles for the selected mode
- **Statistics**: Mode-specific stats (articles count, sources, etc.)

## 🔧 API Endpoints

### New Endpoints

1. **`/api/dual-mode/today`** - Get today's content based on user mode
2. **`/api/cron/daily-digest`** - Daily cron job for personalized digests
3. **`/api/user/api-keys`** - Manage encrypted API keys (if implemented)

### Updated Endpoints

1. **`/api/user/settings`** - Now includes `preferred_mode` field
2. **Email Templates** - Mode-specific styling and content

## 📊 How It Works

### User Flow
1. **First Login**: User selects their preferred mode (AI News or Science)
2. **Daily Digest**: Cron job fetches 50 articles, ranks by importance
3. **AI Processing**: Top 5 articles get mode-specific summaries
4. **Email Delivery**: Personalized digest sent via MailerSend

### Content Ranking
- **Source Weight**: Nature (10), Science (10), PLOS (9), etc.
- **Recency**: Newer articles get higher scores
- **Keywords**: Mode-specific keywords boost relevance
- **Content Quality**: Longer, detailed content preferred

### Email Templates
- **AI News**: Blue gradient, 🧠 icon, tech-focused language
- **Science**: Green gradient, 🔬 icon, research-focused language

## 🛠️ Configuration

### Science Sources Configuration
Edit `lib/science-sources.ts` to:
- Add/remove scientific journals
- Adjust source weights
- Enable/disable specific categories

### Mode Settings
Edit `lib/dual-mode-service.ts` to:
- Change fetch limits (default: 50 articles)
- Adjust top articles count (default: 5)
- Modify importance scoring algorithm

### Email Templates
Edit `lib/email-templates.ts` to:
- Customize mode-specific styling
- Add/remove email sections
- Modify content formatting

## 🔐 Security Features

### Encryption
- **AES-256-GCM**: Industry-standard encryption
- **User-Specific Keys**: Each user's data encrypted separately
- **Salt & IV**: Random salt and initialization vectors
- **Secure Storage**: Encrypted values stored in database

### API Key Management
- **Format Validation**: Validates API key formats per provider
- **Secure Retrieval**: Keys decrypted only when needed
- **Usage Tracking**: Last used timestamps for monitoring
- **Active/Inactive**: Toggle keys without deletion

## 📈 Monitoring & Analytics

### Delivery Logs
All email deliveries are logged in `delivery_logs` table:
- Success/failure status
- Mode information
- Article count
- Delivery timestamps

### User Statistics
Track user engagement:
- Mode preferences
- Email open rates
- Article click-through rates
- Source popularity

## 🚀 Deployment

### Vercel Cron Jobs
Set up daily cron job in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-digest",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### Environment Variables
Ensure all required environment variables are set:
- `GROQ_API_KEY`
- `MAILERSEND_API_KEY`
- `ENCRYPTION_PASSWORD`
- `CRON_SECRET_TOKEN` (optional)

## 🧪 Testing

### Manual Testing
1. **Settings**: Change mode in user settings
2. **Homepage**: Verify mode dashboard shows correct content
3. **Email**: Send test digest for each mode
4. **API**: Test `/api/dual-mode/today` endpoint

### Automated Testing
Run the test script:
```bash
npm run ts-node scripts/test-dual-mode-integration.ts
```

## 📝 Next Steps

### Potential Enhancements
1. **LinkedIn Integration**: Post digests to LinkedIn based on user preference
2. **Image Generation**: Generate images for top articles
3. **Push Notifications**: Real-time notifications for breaking news
4. **User Feedback**: Rate articles to improve recommendations
5. **Custom Sources**: Allow users to add their own RSS feeds

### Performance Optimization
1. **Caching**: Implement Redis for article caching
2. **CDN**: Use CDN for static assets
3. **Database Indexing**: Optimize database queries
4. **Rate Limiting**: Implement API rate limiting

## 🆘 Troubleshooting

### Common Issues

1. **No Science Articles**: Check RSS feed URLs and network connectivity
2. **Email Not Sending**: Verify MailerSend API key and quota
3. **Encryption Errors**: Ensure ENCRYPTION_PASSWORD is set
4. **Mode Not Saving**: Check database schema and API endpoints

### Debug Mode
Enable debug logging by setting:
```bash
DEBUG=dual-mode:*
```

## 📞 Support

For issues or questions:
1. Check the logs in `/tmp/creatorpulse-server.log`
2. Run the test script to verify functionality
3. Check database schema matches the migration
4. Verify all environment variables are set

---

**🎉 Congratulations!** Your AI News app now supports dual-mode content delivery with secure encryption and personalized user experiences!
