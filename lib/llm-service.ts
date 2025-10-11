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

interface LLMContentRequest {
  title: string;
  content: string;
  source: string;
  mode?: 'ai_news' | 'research_focused';
}

/**
 * LLM Service Class for Dual-Mode Content Generation
 */
export class LLMService {
  private groq: any;
  private model: string;

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY || '',
    });
    this.model = MODEL;
  }

  /**
   * Generate content based on mode (AI News or Science Breakthroughs)
   */
  async generateContent(
    title: string,
    content: string,
    mode: 'ai_news' | 'research_focused' = 'ai_news',
    source?: string
  ): Promise<{
    summary: string;
    bullet_points: string[];
    hashtags: string[];
  }> {
    try {
      if (!process.env.GROQ_API_KEY) {
        console.warn('GROQ_API_KEY not configured');
        return this.getFallbackContent(title, mode);
      }

      const prompt = this.buildPrompt(title, content, mode, source);
      
      const completion = await this.groq.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
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
        summary: parsed.summary || '',
        bullet_points: parsed.bullets || [],
        hashtags: parsed.hashtags || [],
      };

    } catch (error: any) {
      console.error('LLM processing error:', error.message);
      return this.getFallbackContent(title, mode);
    }
  }

  /**
   * Build prompt based on mode
   */
  private buildPrompt(
    title: string,
    content: string,
    mode: 'ai_news' | 'research_focused',
    source?: string
  ): string {
    if (mode === 'ai_news') {
      return this.buildAINewsPrompt(title, content, source);
    } else {
      return this.buildResearchPrompt(title, content, source);
    }
  }

  /**
   * Build AI News prompt
   */
  private buildAINewsPrompt(title: string, content: string, source?: string): string {
    return `You are an AI assistant helping to create concise, engaging summaries for a daily AI news digest.

Article Details:
Title: ${title}
Source: ${source || 'Unknown'}
Content: ${content.substring(0, 2000)}...

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
- Use proper capitalization for hashtags
- Return ONLY valid JSON, no additional text`;
  }

  /**
   * Build Research-focused prompt
   */
  private buildResearchPrompt(title: string, content: string, source?: string): string {
    return `You are a scientific communication expert helping to create research-focused summaries for breakthrough science discoveries.

Research Details:
Title: ${title}
Source: ${source || 'Scientific Journal'}
Content: ${content.substring(0, 2000)}...

Please provide:

1. RESEARCH SUMMARY (2-3 sentences, scientifically accurate, focus on methodology, findings, and clinical/scientific significance)
2. KEY FINDINGS (3-5 research highlights, each 1 sentence max, focus on data, results, and implications)
3. HASHTAGS (5-7 relevant scientific hashtags, no spaces)

Format your response EXACTLY as JSON:
{
  "summary": "Your 2-3 sentence research summary here",
  "bullets": ["Key finding 1", "Key finding 2", "Key finding 3"],
  "hashtags": ["Science", "Research", "Breakthrough", "Medicine", "Discovery"]
}

Important:
- Use scientific language and precision
- Focus on research methodology and results
- Highlight clinical or scientific significance
- Include relevant scientific hashtags
- Return ONLY valid JSON, no additional text`;
  }

  /**
   * Get fallback content when LLM fails
   */
  private getFallbackContent(title: string, mode: 'ai_news' | 'research_focused'): {
    summary: string;
    bullet_points: string[];
    hashtags: string[];
  } {
    if (mode === 'ai_news') {
      return {
        summary: `Latest AI development: ${title}. This breakthrough represents significant progress in artificial intelligence technology.`,
        bullet_points: [
          'Key advancement in AI technology',
          'Potential impact on industry',
          'Latest development in the field'
        ],
        hashtags: ['AI', 'Technology', 'Innovation', 'Breakthrough', 'TechNews']
      };
    } else {
      return {
        summary: `Scientific breakthrough: ${title}. This research represents a significant advancement in scientific understanding.`,
        bullet_points: [
          'Important scientific discovery',
          'Potential research implications',
          'Latest breakthrough in the field'
        ],
        hashtags: ['Science', 'Research', 'Breakthrough', 'Discovery', 'Innovation']
      };
    }
  }
}

/**
 * Generate AI summary, bullet points, and hashtags for an article (legacy function)
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
