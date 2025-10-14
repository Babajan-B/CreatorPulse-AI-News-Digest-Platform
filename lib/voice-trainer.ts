/**
 * Voice Training Service
 * Analyzes user's writing style and creates a voice profile for matching
 */

import compromise from 'compromise';
import { supabaseAdmin } from './supabase';

export interface VoiceProfile {
  avgSentenceLength: number;
  avgParagraphLength: number;
  toneMarkers: string[];
  commonPhrases: string[];
  vocabularyLevel: string;
  structurePattern: string;
  transitionWords: string[];
  punctuationStyle: {
    exclamation: number;
    question: number;
    semicolon: number;
    colon: number;
    dash: number;
  };
  writingStyle: {
    passive_voice_ratio: number;
    adverb_frequency: number;
    adjective_frequency: number;
    avg_word_length: number;
  };
  sample_count: number;
}

export interface TrainingSample {
  id?: string;
  user_id: string;
  title?: string;
  content: string;
  published_date?: string;
  style_analysis?: any;
  word_count?: number;
  sentence_count?: number;
}

export class VoiceTrainer {
  /**
   * Analyze a single text sample
   */
  analyzeSample(text: string): any {
    const doc = compromise(text);
    
    // Basic metrics
    const sentences = doc.sentences().out('array');
    const words = doc.terms().out('array');
    const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);

    // Sentence analysis
    const sentenceLengths = sentences.map((s) => s.split(/\s+/).length);
    const avgSentenceLength = sentenceLengths.length > 0
      ? sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length
      : 0;

    // Word analysis
    const wordLengths = words.map((w) => w.length);
    const avgWordLength = wordLengths.length > 0
      ? wordLengths.reduce((a, b) => a + b, 0) / wordLengths.length
      : 0;

    // Punctuation analysis
    const exclamationCount = (text.match(/!/g) || []).length;
    const questionCount = (text.match(/\?/g) || []).length;
    const semicolonCount = (text.match(/;/g) || []).length;
    const colonCount = (text.match(/:/g) || []).length;
    const dashCount = (text.match(/—|–/g) || []).length;

    // Grammar analysis
    const adverbs = doc.adverbs().out('array');
    const adjectives = doc.adjectives().out('array');
    
    // Tone markers (simplified)
    const toneMarkers: string[] = [];
    if (exclamationCount / sentences.length > 0.1) toneMarkers.push('exciting');
    if (questionCount / sentences.length > 0.1) toneMarkers.push('inquisitive');
    if (avgSentenceLength > 20) toneMarkers.push('formal');
    if (avgSentenceLength < 15) toneMarkers.push('conversational');

    // Common transition words
    const transitionWords = [
      'however', 'moreover', 'furthermore', 'therefore', 'meanwhile',
      'interestingly', 'notably', 'importantly', 'specifically', 'additionally',
    ];
    const foundTransitions = transitionWords.filter((word) =>
      text.toLowerCase().includes(word)
    );

    return {
      sentence_count: sentences.length,
      word_count: words.length,
      paragraph_count: paragraphs.length,
      avg_sentence_length: avgSentenceLength,
      avg_paragraph_length: paragraphs.length > 0 ? sentences.length / paragraphs.length : 0,
      avg_word_length: avgWordLength,
      punctuation: {
        exclamation: exclamationCount,
        question: questionCount,
        semicolon: semicolonCount,
        colon: colonCount,
        dash: dashCount,
      },
      adverb_count: adverbs.length,
      adjective_count: adjectives.length,
      tone_markers: toneMarkers,
      transition_words: foundTransitions,
    };
  }

  /**
   * Create voice profile from multiple samples
   */
  createVoiceProfile(samples: TrainingSample[]): VoiceProfile {
    if (samples.length === 0) {
      throw new Error('At least one sample is required');
    }

    // Analyze all samples
    const analyses = samples.map((sample) => this.analyzeSample(sample.content));

    // Calculate averages
    const avgSentenceLength = analyses.reduce((sum, a) => sum + a.avg_sentence_length, 0) / analyses.length;
    const avgParagraphLength = analyses.reduce((sum, a) => sum + a.avg_paragraph_length, 0) / analyses.length;
    const avgWordLength = analyses.reduce((sum, a) => sum + a.avg_word_length, 0) / analyses.length;

    // Aggregate tone markers
    const allToneMarkers = analyses.flatMap((a) => a.tone_markers);
    const toneFrequency = new Map<string, number>();
    allToneMarkers.forEach((tone) => {
      toneFrequency.set(tone, (toneFrequency.get(tone) || 0) + 1);
    });
    const toneMarkers = Array.from(toneFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((e) => e[0]);

    // Aggregate transition words
    const allTransitions = analyses.flatMap((a) => a.transition_words);
    const transitionFrequency = new Map<string, number>();
    allTransitions.forEach((word) => {
      transitionFrequency.set(word, (transitionFrequency.get(word) || 0) + 1);
    });
    const transitionWords = Array.from(transitionFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map((e) => e[0]);

    // Extract common phrases (2-3 word sequences)
    const allTexts = samples.map((s) => s.content).join(' ');
    const commonPhrases = this.extractCommonPhrases(allTexts);

    // Calculate punctuation style
    const totalPunctuation = {
      exclamation: 0,
      question: 0,
      semicolon: 0,
      colon: 0,
      dash: 0,
    };
    
    analyses.forEach((a) => {
      totalPunctuation.exclamation += a.punctuation.exclamation;
      totalPunctuation.question += a.punctuation.question;
      totalPunctuation.semicolon += a.punctuation.semicolon;
      totalPunctuation.colon += a.punctuation.colon;
      totalPunctuation.dash += a.punctuation.dash;
    });

    const totalSentences = analyses.reduce((sum, a) => sum + a.sentence_count, 0);
    const punctuationStyle = {
      exclamation: totalPunctuation.exclamation / totalSentences,
      question: totalPunctuation.question / totalSentences,
      semicolon: totalPunctuation.semicolon / totalSentences,
      colon: totalPunctuation.colon / totalSentences,
      dash: totalPunctuation.dash / totalSentences,
    };

    // Determine vocabulary level
    let vocabularyLevel = 'intermediate';
    if (avgWordLength > 6) vocabularyLevel = 'advanced';
    if (avgWordLength < 5) vocabularyLevel = 'simple';

    // Determine structure pattern (simplified)
    const structurePattern = avgParagraphLength > 5 ? 'detailed-analytical' : 'concise-direct';

    // Calculate writing style metrics
    const totalWords = analyses.reduce((sum, a) => sum + a.word_count, 0);
    const totalAdverbs = analyses.reduce((sum, a) => sum + a.adverb_count, 0);
    const totalAdjectives = analyses.reduce((sum, a) => sum + a.adjective_count, 0);

    return {
      avgSentenceLength: parseFloat(avgSentenceLength.toFixed(2)),
      avgParagraphLength: parseFloat(avgParagraphLength.toFixed(2)),
      toneMarkers,
      commonPhrases,
      vocabularyLevel,
      structurePattern,
      transitionWords,
      punctuationStyle: {
        exclamation: parseFloat(punctuationStyle.exclamation.toFixed(4)),
        question: parseFloat(punctuationStyle.question.toFixed(4)),
        semicolon: parseFloat(punctuationStyle.semicolon.toFixed(4)),
        colon: parseFloat(punctuationStyle.colon.toFixed(4)),
        dash: parseFloat(punctuationStyle.dash.toFixed(4)),
      },
      writingStyle: {
        passive_voice_ratio: 0, // TODO: Implement passive voice detection
        adverb_frequency: totalAdverbs / totalWords,
        adjective_frequency: totalAdjectives / totalWords,
        avg_word_length: parseFloat(avgWordLength.toFixed(2)),
      },
      sample_count: samples.length,
    };
  }

  /**
   * Extract common 2-3 word phrases
   */
  extractCommonPhrases(text: string, topN: number = 5): string[] {
    const doc = compromise(text);
    const sentences = doc.sentences().out('array');
    
    const phrases = new Map<string, number>();
    
    sentences.forEach((sentence) => {
      const words = sentence.toLowerCase().split(/\s+/);
      
      // Extract 2-word phrases
      for (let i = 0; i < words.length - 1; i++) {
        const phrase = `${words[i]} ${words[i + 1]}`;
        if (phrase.length > 5) {
          phrases.set(phrase, (phrases.get(phrase) || 0) + 1);
        }
      }
      
      // Extract 3-word phrases
      for (let i = 0; i < words.length - 2; i++) {
        const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
        if (phrase.length > 8) {
          phrases.set(phrase, (phrases.get(phrase) || 0) + 1);
        }
      }
    });

    return Array.from(phrases.entries())
      .filter((e) => e[1] >= 2) // At least 2 occurrences
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map((e) => e[0]);
  }

  /**
   * Save training sample to database
   */
  async saveSample(sample: TrainingSample): Promise<string | null> {
    try {
      const analysis = this.analyzeSample(sample.content);
      
      const { data, error } = await supabaseAdmin
        .from('voice_training_samples')
        .insert({
          user_id: sample.user_id,
          title: sample.title,
          content: sample.content,
          published_date: sample.published_date,
          style_analysis: analysis,
          word_count: analysis.word_count,
          sentence_count: analysis.sentence_count,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error saving sample:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error('Error in saveSample:', error);
      return null;
    }
  }

  /**
   * Get user's training samples
   */
  async getUserSamples(userId: string): Promise<TrainingSample[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('voice_training_samples')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching samples:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserSamples:', error);
      return [];
    }
  }

  /**
   * Update user's voice profile in settings
   */
  async updateVoiceProfile(userId: string, profile: VoiceProfile): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('user_settings')
        .update({
          voice_profile: profile,
          voice_trained: true,
          voice_training_count: profile.sample_count,
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating voice profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateVoiceProfile:', error);
      return false;
    }
  }

  /**
   * Get user's voice profile
   */
  async getVoiceProfile(userId: string): Promise<VoiceProfile | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('user_settings')
        .select('voice_profile, voice_trained, voice_training_count')
        .eq('user_id', userId)
        .single();

      if (error || !data?.voice_trained) {
        return null;
      }

      return data.voice_profile as VoiceProfile;
    } catch (error) {
      console.error('Error in getVoiceProfile:', error);
      return null;
    }
  }

  /**
   * Train or retrain voice from samples
   */
  async trainVoice(userId: string, samples: TrainingSample[]): Promise<{
    success: boolean;
    profile?: VoiceProfile;
    error?: string;
  }> {
    try {
      if (samples.length < 3) {
        return {
          success: false,
          error: 'At least 3 samples are required for training. 20+ samples recommended for best results.',
        };
      }

      // Save samples to database
      for (const sample of samples) {
        await this.saveSample({ ...sample, user_id: userId });
      }

      // Create voice profile
      const profile = this.createVoiceProfile(samples);

      // Update user settings
      const updated = await this.updateVoiceProfile(userId, profile);

      if (!updated) {
        return {
          success: false,
          error: 'Failed to save voice profile',
        };
      }

      return {
        success: true,
        profile,
      };
    } catch (error: any) {
      console.error('Error in trainVoice:', error);
      return {
        success: false,
        error: error.message || 'Failed to train voice',
      };
    }
  }

  /**
   * Delete all training samples and reset voice profile
   */
  async resetVoice(userId: string): Promise<boolean> {
    try {
      // Delete samples
      await supabase
        .from('voice_training_samples')
        .delete()
        .eq('user_id', userId);

      // Reset settings
      await supabase
        .from('user_settings')
        .update({
          voice_profile: {},
          voice_trained: false,
          voice_training_count: 0,
        })
        .eq('user_id', userId);

      return true;
    } catch (error) {
      console.error('Error in resetVoice:', error);
      return false;
    }
  }
}

// Singleton instance
let voiceTrainerInstance: VoiceTrainer | null = null;

export function getVoiceTrainer(): VoiceTrainer {
  if (!voiceTrainerInstance) {
    voiceTrainerInstance = new VoiceTrainer();
  }
  return voiceTrainerInstance;
}

export default VoiceTrainer;

