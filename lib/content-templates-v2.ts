/**
 * Content Templates V2 - Professional, Structured, Platform-Specific
 * - Removed asterisks for professional look
 * - Added very_short length option
 * - Structured social media format: Hook → Insight → Highlights → Takeaway → CTA → Hashtags
 * - Strict length enforcement
 */

import type { ContentCustomization } from '@/components/content-customizer';

export interface ContentTemplate {
  generatePrompt: (articles: any[], customization: ContentCustomization, userContext?: string) => string;
  formatOutput: (generatedContent: string, articles: any[], customization: ContentCustomization) => string;
  maxLength: number;
  structure: string;
}

// Length limits (strict enforcement)
const lengthLimits = {
  very_short: { minWords: 30, maxWords: 100, maxTokens: 150 },
  short: { minWords: 100, maxWords: 250, maxTokens: 350 },
  medium: { minWords: 250, maxWords: 500, maxTokens: 700 },
  long: { minWords: 500, maxWords: 1000, maxTokens: 1400 },
};

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

// Helper to enforce word count
function enforceLength(content: string, length: string): string {
  const limits = lengthLimits[length as keyof typeof lengthLimits] || lengthLimits.medium;
  const words = content.trim().split(/\s+/);
  
  if (words.length > limits.maxWords) {
    return words.slice(0, limits.maxWords).join(' ') + '...';
  }
  
  return content;
}

// Helper to remove asterisks and markdown formatting
function cleanFormatting(content: string): string {
  return content
    .replace(/\*\*/g, '') // Remove bold
    .replace(/\*/g, '')   // Remove italic/emphasis
    .replace(/#+ /g, '')  // Remove markdown headers
    .trim();
}

// ============================================================================
// SOCIAL MEDIA TEMPLATES (With Emojis & Hashtags)
// Structure: Hook → Insight → Highlights → Takeaway → CTA → Hashtags
// ============================================================================

// TWITTER / X POST
export const twitterPostTemplate: ContentTemplate = {
  maxLength: 280,
  structure: 'Hook → Insight → Highlights → Takeaway → CTA → Hashtags',
  
  generatePrompt: (articles, customization, userContext) => {
    const articlesText = articles.map((a, i) => `
Article ${i + 1}: ${a.title}
Source: ${a.source}
Summary: ${a.summary}
`).join('\n');

    const wordLimit = lengthLimits[customization.length as keyof typeof lengthLimits] || lengthLimits.short;

    return `Create a Twitter/X post about AI news following this EXACT structure (do NOT label sections):

1. HOOK (Opening line with emoji to grab attention)
2. MAIN INSIGHT (1-2 sentences with key message)
3. HIGHLIGHTS (2-3 short bullet points with emojis)
4. IMPLICATION (One sentence takeaway)
5. CALL TO ACTION (Engagement prompt)
6. HASHTAGS (3-5 relevant hashtags)

TONE: ${getToneInstructions(customization.tone)}
LENGTH: ${customization.length === 'very_short' ? '50-100 characters' : '150-280 characters'} (STRICT LIMIT - must fit in one tweet!)
AUDIENCE: ${customization.targetAudience.join(', ') || 'Tech professionals'}

${userContext ? `CREATOR'S NOTE: ${userContext}\n` : ''}

ARTICLES TO COVER:
${articlesText}

STRICT RULES:
- DO NOT use asterisks or markdown formatting
- DO NOT label sections (no "Hook:", no "Main Insight:", etc.)
- Use 2-3 emojis naturally in content
- Keep it conversational and engaging
- Maximum ${wordLimit.maxWords} words TOTAL
- Add 3-5 hashtags at the END only
- Make it viral-worthy!

Example format (DO NOT copy, create original):
🚀 OpenAI just changed everything.

GPT-5 launches with multimodal AI that can process video, audio, and text simultaneously. Early tests show 40% improvement in reasoning.

Key wins:
✅ Real-time context understanding
✅ 60% fewer hallucinations
✅ Native multimodal processing

This reshapes how we build AI products.

What will you create with this?

#AI #OpenAI #GPT5 #TechNews #Innovation

Generate a viral Twitter post NOW (no labels, just the content):`;
  },
  
  formatOutput: (content, articles, customization) => {
    let cleaned = cleanFormatting(content);
    cleaned = enforceLength(cleaned, customization.length);
    return cleaned;
  }
};

// LINKEDIN POST
export const linkedinPostTemplate: ContentTemplate = {
  maxLength: 3000,
  structure: 'Hook → Insight → Highlights → Takeaway → CTA → Hashtags',
  
  generatePrompt: (articles, customization, userContext) => {
    const articlesText = articles.map((a, i) => `
Article ${i + 1}: ${a.title}
Source: ${a.source}
Summary: ${a.summary}
`).join('\n');

    const wordLimit = lengthLimits[customization.length as keyof typeof lengthLimits] || lengthLimits.medium;

    return `Create a LinkedIn post about AI news following this EXACT structure (do NOT label sections):

1. HOOK (Professional opening with emoji)
2. MAIN INSIGHT (Context paragraph with line breaks for readability)
3. HIGHLIGHTS (Key takeaways with checkmark emojis)
4. IMPLICATION (Business/career takeaway)
5. CALL TO ACTION (Professional engagement prompt)
6. HASHTAGS (3-4 professional hashtags)

TONE: ${getToneInstructions(customization.tone)} (keep professional for LinkedIn!)
LENGTH: ${wordLimit.minWords}-${wordLimit.maxWords} words
AUDIENCE: ${customization.targetAudience.join(', ') || 'Business professionals and tech leaders'}

${userContext ? `CREATOR'S NOTE: ${userContext}\n` : ''}

ARTICLES TO COVER:
${articlesText}

STRICT RULES:
- DO NOT use asterisks or markdown formatting
- DO NOT label sections
- Use 2-4 emojis professionally (🎯 ✅ 💡 🚀)
- Add line breaks between paragraphs
- Use checkmarks for bullet points
- Maximum ${wordLimit.maxWords} words
- Add 3-4 professional hashtags at END
- Make it thought-leadership quality

Example format (DO NOT copy, create original):
🎯 The AI landscape just shifted dramatically.

OpenAI's GPT-5 release represents more than incremental progress. This marks a fundamental change in how AI systems process and understand multi-modal information.

Key developments:
✅ 40% improvement in complex reasoning tasks
✅ Native multimodal processing (text, image, video, audio)
✅ Enhanced safety features with 60% reduction in hallucinations
✅ Real-time context understanding across formats

This has profound implications for enterprise AI adoption. Companies that integrate these capabilities early will gain significant competitive advantages in automation and decision-making.

The question isn't whether to adopt advanced AI, but how quickly your organization can adapt.

💬 How is your team preparing for this shift? What challenges do you foresee?

#ArtificialIntelligence #TechLeadership #Innovation #EnterpriseAI

Generate a professional LinkedIn post NOW (no labels, just content):`;
  },
  
  formatOutput: (content, articles, customization) => {
    let cleaned = cleanFormatting(content);
    cleaned = enforceLength(cleaned, customization.length);
    return cleaned;
  }
};

// INSTAGRAM CAPTION
export const instagramCaptionTemplate: ContentTemplate = {
  maxLength: 2200,
  structure: 'Hook → Insight → Highlights → Takeaway → CTA → Hashtags',
  
  generatePrompt: (articles, customization, userContext) => {
    const articlesText = articles.map((a, i) => `
Article ${i + 1}: ${a.title}
Source: ${a.source}
Summary: ${a.summary}
`).join('\n');

    const wordLimit = lengthLimits[customization.length as keyof typeof lengthLimits] || lengthLimits.medium;

    return `Create an Instagram caption about AI news following this EXACT structure (do NOT label sections):

1. HOOK (Attention-grabbing first line with emoji)
2. MAIN INSIGHT (Story/context with line breaks)
3. HIGHLIGHTS (Key points with emojis)
4. IMPLICATION (Emotional connection or takeaway)
5. CALL TO ACTION (Engagement prompt with emoji)
6. HASHTAGS (10-15 hashtags in separate block at end)

TONE: ${getToneInstructions(customization.tone)}
LENGTH: ${wordLimit.minWords}-${wordLimit.maxWords} words
AUDIENCE: ${customization.targetAudience.join(', ') || 'Tech enthusiasts and creators'}

${userContext ? `CREATOR'S NOTE: ${userContext}\n` : ''}

ARTICLES TO COVER:
${articlesText}

STRICT RULES:
- DO NOT use asterisks or markdown formatting
- DO NOT label sections
- Use 3-5 emojis in content naturally
- Add line breaks for readability (Instagram style)
- Maximum ${wordLimit.maxWords} words (before hashtags)
- Add "." line breaks before hashtags
- Use 10-15 hashtags at END in separate block
- Make it engaging and visual

Example format (DO NOT copy, create original):
✨ The AI revolution just hit another milestone.

OpenAI dropped GPT-5 today and honestly, the capabilities are mind-blowing. 🤯

Imagine an AI that can watch a video, listen to audio, read text, and understand ALL of it simultaneously. That's not science fiction anymore. That's today.

Key wins:
🚀 40% smarter reasoning
🎯 Real-time multimodal processing
✨ 60% fewer mistakes
🔥 Game-changing for creators

This changes everything for content creators. We can now build tools that understand our vision across every format.

💭 What excites you most about AI? What concerns you? Let me know in the comments! 👇
.
.
.
#AI #ArtificialIntelligence #OpenAI #GPT5 #TechNews #Innovation #FutureTech #MachineLearning #DeepLearning #TechTrends #AITools #ContentCreator #DigitalInnovation #TechCommunity #AIRevolution

Generate an engaging Instagram caption NOW (no labels, just content):`;
  },
  
  formatOutput: (content, articles, customization) => {
    let cleaned = cleanFormatting(content);
    cleaned = enforceLength(cleaned, customization.length);
    return cleaned;
  }
};

// FACEBOOK POST
export const facebookPostTemplate: ContentTemplate = {
  maxLength: 5000,
  structure: 'Hook → Insight → Highlights → Takeaway → CTA → Hashtags',
  
  generatePrompt: (articles, customization, userContext) => {
    const articlesText = articles.map((a, i) => `
Article ${i + 1}: ${a.title}
Source: ${a.source}
Summary: ${a.summary}
`).join('\n');

    const wordLimit = lengthLimits[customization.length as keyof typeof lengthLimits] || lengthLimits.medium;

    return `Create a Facebook post about AI news following this EXACT structure (do NOT label sections):

1. HOOK (Conversational opening with emoji)
2. MAIN INSIGHT (Paragraphs with questions/engagement hooks)
3. HIGHLIGHTS (Key points with emojis)
4. IMPLICATION (Personal/relatable takeaway)
5. CALL TO ACTION (Question to spark comments)
6. HASHTAGS (2-3 broad hashtags only)

TONE: ${getToneInstructions(customization.tone)} (keep it conversational!)
LENGTH: ${wordLimit.minWords}-${wordLimit.maxWords} words
AUDIENCE: ${customization.targetAudience.join(', ') || 'General tech-interested audience'}

${userContext ? `CREATOR'S NOTE: ${userContext}\n` : ''}

ARTICLES TO COVER:
${articlesText}

STRICT RULES:
- DO NOT use asterisks or markdown formatting
- DO NOT label sections
- Use 2-3 emojis naturally
- Write in paragraphs (Facebook style)
- Ask questions to drive engagement
- Maximum ${wordLimit.maxWords} words
- Add only 2-3 broad hashtags at END
- Make it feel like talking to friends

Example format (DO NOT copy, create original):
🔥 Big news in the AI world today!

OpenAI just announced GPT-5, and honestly, this is next-level stuff. Remember when GPT-4 came out and we thought THAT was impressive? Well, this makes GPT-4 look like a calculator.

Here's what's changed:

The new model can now understand video, audio, images, and text all at once. Like, imagine showing it a video and having a conversation about what's happening in real-time. That's the reality now.

It's also way smarter - 40% better at reasoning through complex problems, and it makes 60% fewer mistakes. For anyone using AI for work or creativity, this is huge.

🤖 ➡️ 🧠 ➡️ 🚀

For creators and businesses, this opens up completely new possibilities. Things we couldn't do last week are suddenly on the table.

What would YOU build with this kind of technology? I'm curious what use cases you're thinking about!

#AI #Technology #Innovation

Generate a conversational Facebook post NOW (no labels, just content):`;
  },
  
  formatOutput: (content, articles, customization) => {
    let cleaned = cleanFormatting(content);
    cleaned = enforceLength(cleaned, customization.length);
    return cleaned;
  }
};

// ============================================================================
// VIDEO SCRIPT TEMPLATES (NO Hashtags, Minimal Emojis)
// ============================================================================

// YOUTUBE SCRIPT
export const youtubeScriptTemplate: ContentTemplate = {
  maxLength: 3000,
  structure: 'Hook → Intro → Main Content (story format) → Key Insights → CTA → Outro',
  
  generatePrompt: (articles, customization, userContext) => {
    const articlesText = articles.map((a, i) => `
Article ${i + 1}: ${a.title}
Source: ${a.source}
Summary: ${a.summary}
`).join('\n');

    const length = customization.length === 'very_short' ? '2-3 minutes' : customization.length === 'short' ? '5-8 minutes' : customization.length === 'medium' ? '10-15 minutes' : '20+ minutes';

    return `Create a YouTube video script about AI news. This needs to be STORY-driven, engaging, and ready to record.

TONE: ${getToneInstructions(customization.tone)}
LENGTH: ${length} video (word-for-word script)
AUDIENCE: ${customization.targetAudience.join(', ') || 'AI enthusiasts and tech professionals'}

${userContext ? `CREATOR'S NOTE: ${userContext}\n` : ''}

ARTICLES TO COVER:
${articlesText}

REQUIRED STRUCTURE (with timestamps):

[HOOK - 0:00]
Grab attention in first 15 seconds with question, surprising fact, or bold statement.

[INTRO - 0:15]
Welcome viewers, preview what's coming, why they should watch.

[MAIN CONTENT - 1:00]
Tell the story! Don't just list facts. Create a narrative:
- Set up context ("Here's what you need to know...")
- Build tension ("But here's where it gets interesting...")
- Explain implications ("This changes everything because...")
- Use analogies and examples
- Suggest visuals: [Show: description]

[KEY INSIGHTS - ${length === '2-3 minutes' ? '2:00' : '8:00'}]
3-5 key takeaways in clear, memorable format.

${customization.includeCTA ? `[CALL TO ACTION - Before end]
${customization.ctaType === 'subscribe' ? 'Ask viewers to subscribe, like, and hit notification bell' : customization.customCTA || 'Direct viewers to take action'}
` : ''}

[OUTRO - Final 30 seconds]
Quick recap, thank viewers, tease next video.

STRICT RULES:
- DO NOT use asterisks or markdown formatting
- DO NOT use hashtags (YouTube doesn't need them in script)
- Minimal emojis (only in CTA if needed)
- Write word-for-word what to say on camera
- Include [stage directions] in brackets
- Suggest B-roll: [Show: description]
- Use "you" and "we" to connect
- Tell it like a STORY, not a news report
- Make complex topics accessible
- Add personality and conversational flow

Generate a complete YouTube script NOW (ready to record):`;
  },
  
  formatOutput: (content, articles, customization) => {
    let cleaned = cleanFormatting(content);
    // Don't enforce strict word limit for YouTube (varies by length)
    return cleaned;
  }
};

// Export all templates
export const contentTemplates: Record<string, ContentTemplate> = {
  twitter_post: twitterPostTemplate,
  linkedin_post: linkedinPostTemplate,
  linkedin_article: linkedinPostTemplate, // Use same for article
  instagram_caption: instagramCaptionTemplate,
  facebook_post: facebookPostTemplate,
  youtube_script: youtubeScriptTemplate,
  tiktok_script: youtubeScriptTemplate, // Similar structure
  newsletter: linkedinPostTemplate, // Adapt LinkedIn template
  blog_article: linkedinPostTemplate, // Adapt LinkedIn template
};

