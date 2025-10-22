/**
 * Content Templates for Different Platforms
 * Each platform has unique structure, tone, and formatting requirements
 */

import type { ContentCustomization } from '@/components/content-customizer';

export interface ContentTemplate {
  generatePrompt: (articles: any[], customization: ContentCustomization, userContext?: string) => string;
  formatOutput: (generatedContent: string, articles: any[], customization: ContentCustomization) => string;
  maxLength: number;
  structure: string;
}

// Helper to get tone description
function getToneInstructions(tone: string): string {
  const tones = {
    professional: 'formal, business-like, and polished. Use industry terminology and maintain credibility',
    casual: 'friendly, approachable, and conversational. Like talking to a friend over coffee',
    enthusiastic: 'energetic, exciting, and passionate. Show genuine excitement about the topic',
    educational: 'informative, clear, and teaching-focused. Explain concepts thoroughly',
    conversational: 'natural, relaxed dialogue. Use "you" and "we". Feel like a two-way conversation',
    authoritative: 'confident, expert, and commanding. Establish thought leadership'
  };
  return tones[tone as keyof typeof tones] || tones.professional;
}

// YOUTUBE SCRIPT TEMPLATE
export const youtubeScriptTemplate: ContentTemplate = {
  maxLength: 3000,
  structure: 'Hook → Intro → Sections (with timestamps) → CTA → Outro',
  
  generatePrompt: (articles, customization, userContext) => {
    const articlesText = articles.map((a, i) => `
Article ${i + 1}: ${a.title}
Source: ${a.source}
Summary: ${a.summary}
${a.bullet_points ? `Key Points: ${a.bullet_points.join(', ')}` : ''}
`).join('\n');

    const length = customization.length === 'short' ? '5-8 minutes' : customization.length === 'medium' ? '10-15 minutes' : '20+ minutes';

    return `Create an engaging YouTube video script about AI news. You're creating content for YouTube, so it needs to be:
- VISUAL and DESCRIPTIVE (suggest what viewers see)
- STORYTELLING format (take viewers on a journey)
- ENGAGING hooks and transitions
- PERSONAL and conversational
- Include TIMESTAMPS for each section

TONE: ${getToneInstructions(customization.tone)}
LENGTH: ${length} video script
AUDIENCE: ${customization.targetAudience.join(', ') || 'AI enthusiasts and tech professionals'}

${userContext ? `CREATOR'S NOTE: ${userContext}\n` : ''}

ARTICLES TO COVER:
${articlesText}

REQUIRED STRUCTURE:
[00:00] HOOK (First 15 seconds - grab attention immediately!)
- Start with a question, surprising fact, or bold statement
- Example: "You won't believe what OpenAI just announced..."

[00:15] INTRODUCTION (45 seconds)
- Welcome viewers
- Preview what's coming
- Why they should keep watching

[01:00] MAIN CONTENT (Split into 3-5 sections)
For each article:
- [TIMESTAMP] Section title
- Tell it as a STORY, not just facts
- Explain WHY it matters
- Add context and implications
- Suggest visuals: [Show: description of what to display]
- Use analogies and examples

${customization.includeCTA ? `[BEFORE END] CALL TO ACTION
- ${customization.ctaType === 'subscribe' ? 'Ask viewers to subscribe and hit the bell' : customization.ctaType === 'custom' ? customization.customCTA : 'Direct viewers to take action'}
` : ''}

[FINAL] OUTRO (30 seconds)
- Quick recap
- Thank viewers
- Tease next video
- End screen suggestions

IMPORTANT:
- Write EXACTLY what to say on camera
- Include stage directions in [brackets]
- Suggest B-roll and graphics
- Keep energy high throughout
- Use "you" and "we" to connect
- Add personality and humor where appropriate
- Make complex topics accessible

Generate a complete, word-for-word YouTube script that's ready to record.`;
  },

  formatOutput: (content, articles, customization) => {
    return `📹 YOUTUBE VIDEO SCRIPT\n\n${content}\n\n---\nBased on ${articles.length} articles | ${customization.length} format | ${customization.tone} tone`;
  }
};

// LINKEDIN ARTICLE TEMPLATE
export const linkedinArticleTemplate: ContentTemplate = {
  maxLength: 1500,
  structure: 'Headline → Hook → Professional Insights → Sections → Expert Take → CTA',
  
  generatePrompt: (articles, customization, userContext) => {
    const articlesText = articles.map((a, i) => `
Article ${i + 1}: ${a.title}
Source: ${a.source}
Summary: ${a.summary}
`).join('\n');

    return `Create a professional LinkedIn article about AI developments. LinkedIn is a PROFESSIONAL NETWORK, so:
- Lead with BUSINESS IMPACT and career insights
- Use professional language but be approachable
- Include statistics and credible sources
- Add YOUR professional perspective
- End with thought-provoking questions for engagement

TONE: ${getToneInstructions(customization.tone)} (but always professional for LinkedIn)
AUDIENCE: ${customization.targetAudience.join(', ') || 'Business professionals, AI leaders, tech professionals'}

${userContext ? `YOUR PERSPECTIVE: ${userContext}\n` : ''}

ARTICLES:
${articlesText}

STRUCTURE:

**HEADLINE** (Attention-grabbing, professional)
Example: "3 AI Developments That Will Transform Your Industry in 2025"

**OPENING HOOK** (2-3 sentences)
- Start with a surprising insight or question
- Establish why this matters to professionals
- Example: "While you were in meetings today, AI took another leap forward..."

**MAIN SECTIONS** (3-5 key points)
For each development:

**1. [Descriptive Title]**
- What happened (facts)
- Why it matters for business
- Real-world implications
- Career/industry impact

**YOUR EXPERT TAKE** (Professional insight)
- Share your perspective as a thought leader
- Connect dots between developments
- Predict implications
- Add nuance and context

**KEY TAKEAWAYS** (Bullet points)
- 3-5 actionable insights
- Each should be specific and valuable

${customization.includeCTA ? `**ENGAGEMENT CTA**
- Ask a thought-provoking question
- Invite professional discussion
- ${customization.ctaType === 'custom' ? customization.customCTA : 'Encourage readers to share their thoughts'}
` : ''}

**HASHTAGS** (5-10 relevant)
#ArtificialIntelligence #TechLeadership #Innovation #FutureOfWork [add more]

WRITING STYLE:
- Professional but conversational
- Use "I" for your insights, "you" for the reader
- Include specific examples and data
- Break into short paragraphs (2-3 lines max)
- Use bold and formatting for readability
- Credibility is key - cite sources

Generate a complete LinkedIn article that positions you as a thought leader.`;
  },

  formatOutput: (content, articles, customization) => {
    return `💼 LINKEDIN ARTICLE\n\n${content}\n\n---\nProfessional insights on ${articles.length} developments | ${customization.tone} tone`;
  }
};

// TWITTER THREAD TEMPLATE
export const twitterThreadTemplate: ContentTemplate = {
  maxLength: 2800, // 10 tweets x 280 chars
  structure: 'Hook Tweet → Content Tweets → Summary Tweet',
  
  generatePrompt: (articles, customization, userContext) => {
    const articlesText = articles.map((a, i) => `
Article ${i + 1}: ${a.title}
Summary: ${a.summary}
`).join('\n');

    const maxTweets = customization.length === 'short' ? '5-7 tweets' : customization.length === 'medium' ? '8-12 tweets' : '15-20 tweets';

    return `Create an engaging Twitter/X thread about AI news. Twitter threads need to be:
- PUNCHY and CONCISE (max 280 characters per tweet)
- Start with a HOOK that stops scrolling
- Each tweet should be valuable on its own
- Use line breaks and emojis strategically
- End with engagement ask

TONE: ${getToneInstructions(customization.tone)}
LENGTH: ${maxTweets}
AUDIENCE: ${customization.targetAudience.join(', ') || 'Tech Twitter, AI enthusiasts'}

${userContext ? `PERSONAL NOTE: ${userContext}\n` : ''}

ARTICLES:
${articlesText}

THREAD STRUCTURE:

**TWEET 1 - HOOK** (280 chars max)
- Start with a bold statement or question
- Create curiosity gap
- Use emoji to catch attention
- Example: "🚨 OpenAI just changed everything. Here's what nobody is telling you about the GPT-5 announcement (thread) 🧵"

**TWEETS 2-4 - CONTEXT**
- Set up the story
- Explain why this matters
- Build anticipation
- Each tweet = one complete idea

**TWEETS 5-X - MAIN CONTENT**
For each article/point:
- One tweet = one insight
- Use emojis to add visual interest 🎯 💡 🔥 ⚡
- Add line breaks for readability
- Include specific facts/numbers when possible
- Make each tweet retweetable on its own

**SECOND TO LAST TWEET - KEY TAKEAWAY**
- Summarize the most important point
- "The bottom line:"
- Make it memorable

**FINAL TWEET - CTA**
${customization.includeCTA ? `- ${customization.ctaType === 'subscribe' ? 'Follow for more AI insights' : customization.ctaType === 'custom' ? customization.customCTA : 'Encourage engagement'}
- Ask a question to drive replies
- "What do you think about this? 👇"
` : '- Ask an engaging question to drive discussion'}

FORMATTING RULES:
- Number tweets: "1/" "2/" etc.
- Each tweet MUST be under 280 characters
- Use emojis (but not too many)
- Add line breaks for readability
- Make punchy, tweetable statements
- Use "you" to engage directly
- Be conversational and authentic

Generate a complete Twitter thread with each tweet clearly marked and character-counted.`;
  },

  formatOutput: (content, articles, customization) => {
    // Split into individual tweets and format
    const tweets = content.split(/\d+\//).filter(t => t.trim());
    return `🐦 TWITTER THREAD\n\n${tweets.map((tweet, i) => `${i + 1}/ ${tweet.trim()}`).join('\n\n')}\n\n---\nTotal tweets: ${tweets.length} | ${customization.tone} tone`;
  }
};

// INSTAGRAM POST TEMPLATE
export const instagramPostTemplate: ContentTemplate = {
  maxLength: 2200, // Instagram caption limit
  structure: 'Hook → Visual Description → Story → Value → Hashtags',
  
  generatePrompt: (articles, customization, userContext) => {
    const articlesText = articles.map((a, i) => `
Article ${i + 1}: ${a.title}
Summary: ${a.summary}
`).join('\n');

    return `Create an engaging Instagram post caption about AI news. Instagram is VISUAL-FIRST, so:
- Start with an emoji hook
- Write for mobile scrolling
- Suggest what the carousel/image should show
- Use line breaks generously
- Include storytelling and emotion
- End with hashtags

TONE: ${getToneInstructions(customization.tone)} (but always engaging and visual)
AUDIENCE: ${customization.targetAudience.join(', ') || 'Tech enthusiasts, creators, professionals'}

${userContext ? `YOUR VOICE: ${userContext}\n` : ''}

ARTICLES:
${articlesText}

INSTAGRAM POST STRUCTURE:

**EMOJI HOOK** (First line)
🚨 🔥 💡 ⚡ [Choose relevant emoji]
Grab attention immediately

**OPENING** (2-3 lines)
- Bold statement or question
- Create curiosity
- Make them want to keep reading

**MAIN CONTENT**
- Tell a STORY, don't just list facts
- Break into short paragraphs (1-2 lines each)
- Use plenty of line breaks

- Add emojis to break up text
- Make it scannable

- Share insights and implications
- Connect to audience's interests

**VALUE PROPOSITION**
Why should your audience care?
What can they do with this information?

${customization.includeCTA ? `**CALL TO ACTION**
${customization.ctaType === 'subscribe' ? '👉 Follow for daily AI insights' : customization.ctaType === 'custom' ? customization.customCTA : '💬 What do you think? Comment below!'}

` : ''}**ENGAGEMENT QUESTION**
Ask something to drive comments
Example: "Which one surprised you most? 👇"

---

**CAROUSEL/IMAGE SUGGESTIONS:**
Slide 1: [Describe what image/text to show]
Slide 2: [Next slide content]
[Continue for 5-10 slides if carousel]

**HASHTAGS** (Mix of sizes - 20-30 total)
#ArtificialIntelligence #AI #MachineLearning #Tech #Innovation
#TechNews #AINews #FutureTech #Technology #DigitalTransformation
[Add more relevant hashtags]

WRITING STYLE:
- Emoji-enhanced but not overwhelming
- Short paragraphs (1-2 lines)
- Conversational and personal
- Mobile-optimized formatting
- Story-driven
- Value-focused

Generate an Instagram caption that stops the scroll and drives engagement.`;
  },

  formatOutput: (content, articles, customization) => {
    return `📸 INSTAGRAM POST\n\n${content}\n\n---\nBased on ${articles.length} articles | Instagram-optimized | ${customization.tone} tone`;
  }
};

// Content type mapping
export const contentTemplates: Record<string, ContentTemplate> = {
  newsletter: {
    maxLength: 2000,
    structure: 'Intro → Articles → Trends → Closing',
    generatePrompt: (articles, customization) => `Generate a newsletter with introduction, ${articles.length} article summaries, and closing.`,
    formatOutput: (content) => content
  },
  youtube_script: youtubeScriptTemplate,
  linkedin_article: linkedinArticleTemplate,
  twitter_thread: twitterThreadTemplate,
  instagram_post: instagramPostTemplate,
  facebook_post: {
    maxLength: 2000,
    structure: 'Hook → Story → Value → Engagement',
    generatePrompt: (articles, customization, userContext) => {
      const articlesText = articles.map(a => `${a.title}: ${a.summary}`).join('\n');
      return `Create a Facebook post about: ${articlesText}. Make it conversational, community-focused, and engagement-driven. Tone: ${customization.tone}. Include questions to drive comments.`;
    },
    formatOutput: (content) => `📘 FACEBOOK POST\n\n${content}`
  },
  reddit_post: {
    maxLength: 3000,
    structure: 'TL;DR → Detailed Content → Discussion',
    generatePrompt: (articles, customization, userContext) => {
      const articlesText = articles.map(a => `${a.title}: ${a.summary}`).join('\n');
      return `Create a Reddit post about: ${articlesText}. Start with TL;DR. Use markdown formatting. Be detailed and informative. Add discussion questions. Tone: ${customization.tone}. Reddit users value depth and authenticity.`;
    },
    formatOutput: (content) => `🔴 REDDIT POST\n\n${content}`
  },
  blog_post: {
    maxLength: 2500,
    structure: 'Title → Intro → Sections → Conclusion → SEO',
    generatePrompt: (articles, customization, userContext) => {
      const articlesText = articles.map(a => `${a.title}: ${a.summary}`).join('\n');
      return `Create an SEO-optimized blog post about: ${articlesText}. Include: catchy title, introduction, multiple sections with subheadings, conclusion, and SEO keywords. Tone: ${customization.tone}. Length: ${customization.length}.`;
    },
    formatOutput: (content) => `📝 BLOG POST\n\n${content}`
  },
  tiktok_script: {
    maxLength: 500,
    structure: 'Hook (3s) → Value → CTA',
    generatePrompt: (articles, customization, userContext) => {
      const mainArticle = articles[0];
      return `Create a 30-60 second TikTok script about: ${mainArticle.title}. Start with a 3-second hook. Make it fast-paced, trendy, and valuable. Include what to show on screen. Tone: ${customization.tone}. TikTok style: quick cuts, text overlays, trending sounds.`;
    },
    formatOutput: (content) => `🎵 TIKTOK SCRIPT\n\n${content}`
  },
};

