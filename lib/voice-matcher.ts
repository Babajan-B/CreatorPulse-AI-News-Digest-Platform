/**
 * Voice Matcher Service
 * Generates content that matches user's writing voice/style
 */

import { VoiceProfile } from './voice-trainer';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

export class VoiceMatcher {
  /**
   * Build voice-matched prompt for LLM
   */
  buildVoicePrompt(profile: VoiceProfile, samples: string[]): string {
    return `
You are writing in the authentic voice and style of this author. Match their writing style precisely.

VOICE CHARACTERISTICS:
- Average Sentence Length: ${profile.avgSentenceLength} words
- Paragraph Structure: ${profile.avgParagraphLength} sentences per paragraph
- Tone: ${profile.toneMarkers.join(', ')}
- Common Phrases: "${profile.commonPhrases.join('", "')}"
- Vocabulary Level: ${profile.vocabularyLevel}
- Structure Pattern: ${profile.structurePattern}
- Transition Words: ${profile.transitionWords.join(', ')}

PUNCTUATION STYLE:
- Exclamation marks: ${(profile.punctuationStyle.exclamation * 100).toFixed(1)}% of sentences
- Question marks: ${(profile.punctuationStyle.question * 100).toFixed(1)}% of sentences
- Uses semicolons: ${profile.punctuationStyle.semicolon > 0.01 ? 'Yes' : 'Rarely'}
- Uses em-dashes: ${profile.punctuationStyle.dash > 0.01 ? 'Yes' : 'Rarely'}

WRITING STYLE:
- Average Word Length: ${profile.writingStyle.avg_word_length} characters
- Adverb Frequency: ${(profile.writingStyle.adverb_frequency * 100).toFixed(1)}%
- Adjective Frequency: ${(profile.writingStyle.adjective_frequency * 100).toFixed(1)}%

WRITING EXAMPLES FROM THIS AUTHOR:
${samples.slice(0, 3).map((sample, i) => `
Example ${i + 1}:
${sample.substring(0, 500)}...
---
`).join('\n')}

INSTRUCTIONS:
- Match the sentence rhythm and average length (${profile.avgSentenceLength} words)
- Use similar vocabulary and phrases naturally
- Maintain the same tone and personality
- Follow the structural patterns observed
- Use punctuation in the same style
- Feel natural and authentic, not forced
- Aim for content that's 70%+ ready to send with minimal edits
`.trim();
  }

  /**
   * Generate newsletter introduction with voice matching
   */
  async generateIntro(
    profile: VoiceProfile,
    samples: string[],
    context: {
      date: string;
      topTopics: string[];
      articleCount: number;
      mode?: 'ai_news' | 'science_breakthrough';
    }
  ): Promise<string> {
    const voicePrompt = this.buildVoicePrompt(profile, samples);
    const contentFocus = context.mode === 'science_breakthrough' 
      ? 'scientific research and breakthroughs' 
      : 'AI news, machine learning, and artificial intelligence developments';

    const prompt = `
${voicePrompt}

NOW WRITE A NEWSLETTER INTRODUCTION FOR AN ${context.mode === 'science_breakthrough' ? 'SCIENCE BREAKTHROUGH' : 'AI NEWS'} NEWSLETTER:

Date: ${context.date}
Top Topics Today: ${context.topTopics.join(', ')}
Articles Featured: ${context.articleCount}
Content Focus: ${contentFocus}

Write a brief, engaging introduction (2-3 paragraphs) for today's ${context.mode === 'science_breakthrough' ? 'science newsletter' : 'AI news newsletter'} that:
1. Welcomes readers with energy and enthusiasm
2. Highlights the key ${context.mode === 'science_breakthrough' ? 'scientific discoveries' : 'AI developments'} and exciting breakthroughs
3. Mentions specific topics like: ${context.topTopics.join(', ') || (context.mode === 'science_breakthrough' ? 'medical research, physics, biology' : 'GPT models, LLMs, AI startups, machine learning')}
4. Sets an exciting tone for the curated content below

IMPORTANT: This is an ${context.mode === 'science_breakthrough' ? 'SCIENCE RESEARCH' : 'ARTIFICIAL INTELLIGENCE'} newsletter, so focus ONLY on ${contentFocus}. Do NOT write about genetics unless it's one of today's topics.

Write ONLY the introduction text, nothing else. Match the author's voice perfectly.
    `.trim();

    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 500,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error generating intro:', error);
      return '';
    }
  }

  /**
   * Generate article commentary with voice matching
   */
  async generateCommentary(
    profile: VoiceProfile,
    samples: string[],
    article: {
      title: string;
      summary: string;
      keyPoints: string[];
      mode?: 'ai_news' | 'science_breakthrough';
    }
  ): Promise<string> {
    const voicePrompt = this.buildVoicePrompt(profile, samples);
    const contentContext = article.mode === 'science_breakthrough'
      ? 'scientific research and its implications for healthcare, technology, or society'
      : 'AI and machine learning developments and their impact on technology, business, or society';

    const prompt = `
${voicePrompt}

NOW WRITE A BRIEF COMMENTARY FOR THIS ${article.mode === 'science_breakthrough' ? 'SCIENCE' : 'AI NEWS'} ARTICLE:

Article Title: ${article.title}
Summary: ${article.summary}
Key Points:
${article.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Write a 2-3 sentence commentary that:
1. Adds personal insight or perspective about ${contentContext}
2. Explains why this ${article.mode === 'science_breakthrough' ? 'research' : 'AI development'} matters to the audience
3. Connects to broader themes or implications in ${article.mode === 'science_breakthrough' ? 'science and medicine' : 'AI and technology'}

IMPORTANT: Focus on ${contentContext}. Stay on topic.

Write ONLY the commentary text, nothing else. Match the author's voice perfectly.
    `.trim();

    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 300,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error generating commentary:', error);
      return '';
    }
  }

  /**
   * Generate newsletter closing with voice matching
   */
  async generateClosing(
    profile: VoiceProfile,
    samples: string[],
    context: {
      articleCount: number;
      topTrends: string[];
      mode?: 'ai_news' | 'science_breakthrough';
    }
  ): Promise<string> {
    const voicePrompt = this.buildVoicePrompt(profile, samples);
    const contentType = context.mode === 'science_breakthrough' ? 'science breakthroughs and research' : 'AI news and developments';

    const prompt = `
${voicePrompt}

NOW WRITE A NEWSLETTER CLOSING FOR AN ${context.mode === 'science_breakthrough' ? 'SCIENCE BREAKTHROUGH' : 'AI NEWS'} NEWSLETTER:

Articles Featured: ${context.articleCount} ${context.mode === 'science_breakthrough' ? 'scientific papers' : 'AI news articles'}
Emerging Trends: ${context.topTrends.join(', ')}
Content Focus: ${contentType}

Write a brief closing (1-2 paragraphs) that:
1. Wraps up today's ${context.mode === 'science_breakthrough' ? 'scientific discoveries' : 'AI news updates'}
2. Encourages readers to explore the ${context.mode === 'science_breakthrough' ? 'research papers' : 'articles'} or share their thoughts
3. Teases what's coming in the next edition (more ${contentType})
4. Ends with a personal sign-off

IMPORTANT: Stay on topic about ${contentType}. Do NOT mention genetics or other topics unless they were featured in today's articles.

Write ONLY the closing text, nothing else. Match the author's voice perfectly.
    `.trim();

    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 400,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error generating closing:', error);
      return '';
    }
  }

  /**
   * Generate trends section explainer with voice matching
   */
  async generateTrendsExplainer(
    profile: VoiceProfile,
    samples: string[],
    trends: Array<{
      topic: string;
      article_count: number;
      velocity: number;
    }>
  ): Promise<string> {
    const voicePrompt = this.buildVoicePrompt(profile, samples);

    const prompt = `
${voicePrompt}

NOW WRITE A "TRENDS TO WATCH" SECTION:

Emerging Trends:
${trends.map((t, i) => `${i + 1}. ${t.topic} (${t.article_count} articles, ${t.velocity.toFixed(0)}% growth)`).join('\n')}

Write a brief introduction to the trends section (2-3 paragraphs) that:
1. Highlights what's gaining momentum
2. Explains why these trends matter
3. Encourages readers to pay attention

Write ONLY the trends section text, nothing else. Match the author's voice perfectly.
    `.trim();

    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 500,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error generating trends explainer:', error);
      return '';
    }
  }

  /**
   * Score how well generated content matches the voice profile
   */
  async scoreVoiceMatch(
    generatedText: string,
    profile: VoiceProfile
  ): Promise<number> {
    // Simple scoring based on measurable metrics
    const doc = generatedText;
    const sentences = doc.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const words = doc.split(/\s+/).filter((w) => w.length > 0);

    const avgSentenceLength = words.length / sentences.length;
    const sentenceLengthDiff = Math.abs(avgSentenceLength - profile.avgSentenceLength);
    const sentenceLengthScore = Math.max(0, 1 - (sentenceLengthDiff / profile.avgSentenceLength));

    // Check for common phrases
    const phrasesFound = profile.commonPhrases.filter((phrase) =>
      generatedText.toLowerCase().includes(phrase)
    ).length;
    const phraseScore = phrasesFound / Math.max(1, profile.commonPhrases.length);

    // Check for transition words
    const transitionsFound = profile.transitionWords.filter((word) =>
      generatedText.toLowerCase().includes(word)
    ).length;
    const transitionScore = transitionsFound / Math.max(1, profile.transitionWords.length);

    // Calculate overall score (0-1)
    const overallScore = (
      sentenceLengthScore * 0.5 +
      phraseScore * 0.3 +
      transitionScore * 0.2
    );

    return parseFloat((overallScore * 100).toFixed(2));
  }

  /**
   * Test voice generation
   */
  async testVoiceGeneration(
    profile: VoiceProfile,
    samples: string[],
    testTopic: string
  ): Promise<{
    generated: string;
    score: number;
  }> {
    const voicePrompt = this.buildVoicePrompt(profile, samples);

    const prompt = `
${voicePrompt}

NOW WRITE A SHORT PARAGRAPH (3-5 sentences) ABOUT:
${testTopic}

Write ONLY the paragraph, nothing else. Match the author's voice perfectly.
    `.trim();

    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 300,
      });

      const generated = completion.choices[0]?.message?.content || '';
      const score = await this.scoreVoiceMatch(generated, profile);

      return { generated, score };
    } catch (error) {
      console.error('Error in test generation:', error);
      return { generated: '', score: 0 };
    }
  }
}

// Singleton instance
let voiceMatcherInstance: VoiceMatcher | null = null;

export function getVoiceMatcher(): VoiceMatcher {
  if (!voiceMatcherInstance) {
    voiceMatcherInstance = new VoiceMatcher();
  }
  return voiceMatcherInstance;
}

export default VoiceMatcher;

