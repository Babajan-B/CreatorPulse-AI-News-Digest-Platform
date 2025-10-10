/**
 * LLM Service - Groq (Ultra-Fast Inference)
 * Generates summaries, bullet points, and hashtags for articles
 */

import Groq from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

// Model configuration
const MODEL = 'llama-3.3-70b-versatile'; // Fast and powerful

interface Article {
  title: string;
  summary: string;
  url: string;
  source: string;
}

interface ProcessedContent {
  aiSummary: string;
  bulletPoints: string[];
  hashtags: string[];
}

/**
 * Generate AI summary, bullet points, and hashtags for an article
 */
export async function processArticleWithAI(article: Article): Promise<ProcessedContent | null> {
  try {
    if (!process.env.GROQ_API_KEY) {
      console.warn('GROQ_API_KEY not configured');
      return null;
    }

    const prompt = `You are an AI assistant helping to create concise, engaging summaries for a daily AI news digest.

Article Details:
Title: ${article.title}
Source: ${article.source}
Summary: ${article.summary}

Please provide:

1. AI SUMMARY (2-3 sentences, engaging and informative, focus on key insights and impact)
2. BULLET POINTS (3-5 key takeaways, each 1 sentence max)
3. HASHTAGS (5-7 relevant hashtags for social media, no spaces)

Format your response EXACTLY as JSON:
{
  "summary": "Your 2-3 sentence summary here",
  "bullets": ["First key takeaway", "Second key takeaway", "Third key takeaway"],
  "hashtags": ["AI", "MachineLearning", "TechNews", "Innovation", "AIResearch"]
}

Important:
- Keep summary concise and impactful
- Bullet points should be specific and actionable
- Hashtags should be relevant to AI/tech audience
- Use proper capitalization for hashtags (e.g., MachineLearning not machinelearning)
- Return ONLY valid JSON, no additional text`;

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error('No response from Groq');
    }

    const parsed = JSON.parse(responseText);

    return {
      aiSummary: parsed.summary || '',
      bulletPoints: parsed.bullets || [],
      hashtags: parsed.hashtags || [],
    };

  } catch (error: any) {
    console.error('LLM processing error:', error.message);
    return null;
  }
}

/**
 * Generate digest summary from multiple articles
 */
export async function generateDigestSummary(articles: Article[]): Promise<string> {
  try {
    if (!process.env.GROQ_API_KEY) {
      return 'Daily AI News Digest - Top stories from leading AI sources';
    }

    const articlesList = articles
      .slice(0, 5) // Top 5 articles
      .map((a, i) => `${i + 1}. ${a.title} (${a.source})`)
      .join('\n');

    const prompt = `Create a compelling 2-sentence overview for a daily AI news digest featuring these top stories:

${articlesList}

Write an engaging introduction that:
- Highlights the main themes across these articles
- Creates excitement about the latest AI developments
- Is suitable for an email subject line or opening paragraph
- Maximum 2 sentences

Return only the text, no JSON, no formatting.`;

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 256,
    });

    return completion.choices[0]?.message?.content || 'Your daily curated AI news digest.';

  } catch (error: any) {
    console.error('Digest summary error:', error.message);
    return 'Your daily curated AI news digest featuring the latest developments in artificial intelligence.';
  }
}

/**
 * Test Groq integration
 */
export async function testGroq(): Promise<{ success: boolean; message: string }> {
  try {
    if (!process.env.GROQ_API_KEY) {
      return {
        success: false,
        message: 'GROQ_API_KEY not configured',
      };
    }

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'user',
          content: 'Say "Hello from Groq!" in a creative way.',
        },
      ],
      temperature: 1,
      max_tokens: 100,
    });

    const text = completion.choices[0]?.message?.content || 'No response';

    return {
      success: true,
      message: text,
    };

  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to connect to Groq',
    };
  }
}

export { groq as llmClient };
