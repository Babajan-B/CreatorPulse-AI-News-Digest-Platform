# 🔑 Environment Variables Configuration Guide

## Quick Setup

Create a `.env.local` file in the `creatorpulse` folder with these variables:

```bash
# Copy this template
cp ENV_TEMPLATE.md .env.local
# Then edit .env.local with your actual keys
```

---

## Required Environment Variables

### 1. Supabase (Database)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.your-project.supabase.co:5432/postgres
```

**How to get:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Settings → API → Copy URL and anon key
4. Settings → Database → Copy Connection string

---

### 2. JWT Authentication
```env
JWT_SECRET=your-secure-random-string-minimum-32-characters-long
```

**How to generate:**
```bash
# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online generator
# Visit: https://generate-secret.vercel.app/32
```

---

### 3. Groq AI (LLM Service)
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
```

**How to get:**
1. Go to https://console.groq.com
2. Sign up / Log in
3. Click "Create API Key"
4. Copy the key (starts with `gsk_`)
5. **Free tier:** 14,400 requests/day

---

### 4. MailerSend (Email Service)
```env
MAILERSEND_API_KEY=your_mailersend_api_key
MAILERSEND_FROM_EMAIL=noreply@yourdomain.com
MAILERSEND_FROM_NAME=CreatorPulse
MAILERSEND_ADMIN_EMAIL=admin@yourdomain.com
MAILERSEND_WEBHOOK_SECRET=your_webhook_secret
```

**How to get:**
1. Go to https://mailersend.com
2. Sign up / Log in
3. Verify your domain (Settings → Domains)
4. Generate API Token (Settings → API Tokens)
5. **Free tier:** 12,000 emails/month

---

### 5. Encryption Password
```env
ENCRYPTION_PASSWORD=your-very-strong-password-at-least-32-characters-long
```

**Important:**
- Must be at least 32 characters
- Used to encrypt user API keys in database
- **NEVER change this** after creating user data
- **NEVER commit to Git**

**Generate strong password:**
```bash
openssl rand -base64 48
```

---

## Optional Environment Variables

### 6. Twitter API (for Twitter source integration)
```env
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_BEARER_TOKEN=your_bearer_token
```

**How to get:**
1. Go to https://developer.twitter.com/en/portal/dashboard
2. Create a new app
3. Generate keys in "Keys and Tokens" tab
4. **Cost:** Free tier available (limited)

---

### 7. YouTube Data API (for YouTube source integration)
```env
YOUTUBE_API_KEY=your_youtube_api_key
```

**How to get:**
1. Go to https://console.cloud.google.com
2. Create a new project
3. Enable "YouTube Data API v3"
4. Create credentials → API Key
5. **Free tier:** 10,000 units/day

---

### 8. Cron Job Secret (security)
```env
CRON_SECRET_TOKEN=your-random-token
```

**Generate:**
```bash
openssl rand -hex 32
```

---

### 9. Twilio WhatsApp (for WhatsApp delivery - optional)
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

**How to get:**
1. Go to https://www.twilio.com/console
2. Create account
3. Get Account SID and Auth Token
4. Set up WhatsApp sandbox
5. **Cost:** Pay-as-you-go pricing

---

### 10. Application Settings
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
MIN_TRAINING_SAMPLES=20
TARGET_VOICE_MATCH_SCORE=0.70
REVIEW_TIME_GOAL_MINUTES=20
```

---

## Complete .env.local Template

Create this file: `/Users/jaan/Desktop/New-Assigmnet-10-9-25/creatorpulse/.env.local`

```env
# ===================================
# SUPABASE (Required)
# ===================================
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=

# ===================================
# AUTHENTICATION (Required)
# ===================================
JWT_SECRET=

# ===================================
# GROQ AI (Required)
# ===================================
GROQ_API_KEY=

# ===================================
# MAILERSEND (Required)
# ===================================
MAILERSEND_API_KEY=
MAILERSEND_FROM_EMAIL=
MAILERSEND_FROM_NAME=CreatorPulse
MAILERSEND_ADMIN_EMAIL=
MAILERSEND_WEBHOOK_SECRET=

# ===================================
# ENCRYPTION (Required)
# ===================================
ENCRYPTION_PASSWORD=

# ===================================
# TWITTER (Optional)
# ===================================
TWITTER_API_KEY=
TWITTER_API_SECRET=
TWITTER_BEARER_TOKEN=

# ===================================
# YOUTUBE (Optional)
# ===================================
YOUTUBE_API_KEY=

# ===================================
# CRON (Optional)
# ===================================
CRON_SECRET_TOKEN=

# ===================================
# WHATSAPP (Optional)
# ===================================
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=

# ===================================
# APPLICATION
# ===================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
MIN_TRAINING_SAMPLES=20
TARGET_VOICE_MATCH_SCORE=0.70
REVIEW_TIME_GOAL_MINUTES=20
```

---

## Verification Checklist

After creating `.env.local`, verify:

- [ ] All required variables have values (no empty strings)
- [ ] Supabase URL starts with `https://`
- [ ] Groq API key starts with `gsk_`
- [ ] JWT Secret is at least 32 characters
- [ ] Encryption password is at least 32 characters
- [ ] Email addresses are valid
- [ ] File is NOT committed to Git (in `.gitignore`)

---

## Testing Configuration

Test your configuration:

```bash
# Start the development server
cd /Users/jaan/Desktop/New-Assigmnet-10-9-25/creatorpulse
npm run dev
```

Visit http://localhost:3000 and check the console for any missing environment variable warnings.

---

## Security Best Practices

1. **Never commit `.env.local`** to Git
2. **Use different keys** for development and production
3. **Rotate keys regularly** (every 90 days)
4. **Use strong encryption passwords** (48+ characters)
5. **Restrict API key permissions** when possible
6. **Monitor API usage** to detect unauthorized access

---

## Troubleshooting

### Error: "GROQ_API_KEY not configured"
- Check `.env.local` exists in `/creatorpulse` folder
- Verify key starts with `gsk_`
- Restart the development server

### Error: "Failed to connect to Supabase"
- Verify URL and anon key are correct
- Check network connection
- Ensure Supabase project is not paused

### Error: "Email send failed"
- Verify MailerSend API key
- Check sender email is verified in MailerSend
- Verify domain is verified

### Error: "Database migration failed"
- Check DATABASE_URL is correct
- Ensure you have database permissions
- Run SQL in Supabase SQL editor directly

---

**Next Step:** Once `.env.local` is configured, proceed to TASK 2 (Database Migration)
