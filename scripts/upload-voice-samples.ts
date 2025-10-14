/**
 * Voice Training Sample Upload Helper
 * Helps you upload newsletter samples for voice training
 */

import fs from 'fs';
import path from 'path';
import { parse } from 'papaparse';
import { supabase as supabaseClient } from '../lib/supabase';
import { VoiceTrainer } from '../lib/voice-trainer';

interface TrainingSample {
  title: string;
  content: string;
  published_date?: string;
}

async function getUserId(): Promise<string | null> {
  console.log('🔍 Finding user...');
  
  const { data: users, error } = await supabaseClient
    .from('users')
    .select('id, email')
    .limit(5);

  if (error || !users || users.length === 0) {
    console.error('❌ No users found. Please create a user account first.');
    return null;
  }

  console.log('\n📋 Available users:');
  users.forEach((user, index) => {
    console.log(`  ${index + 1}. ${user.email} (${user.id})`);
  });

  // For automation, use first user
  const userId = users[0].id;
  console.log(`\n✅ Using user: ${users[0].email}\n`);
  
  return userId;
}

async function uploadFromTextFile(userId: string, filePath: string) {
  console.log(`📄 Reading text file: ${filePath}`);

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n\n'); // Assume double newline separates samples

  const samples: TrainingSample[] = lines
    .filter(line => line.trim().length > 100) // Minimum 100 chars
    .map((content, index) => ({
      title: `Newsletter Sample ${index + 1}`,
      content: content.trim(),
      published_date: new Date().toISOString().split('T')[0]
    }));

  console.log(`Found ${samples.length} samples`);
  return samples;
}

async function uploadFromCSV(userId: string, filePath: string) {
  console.log(`📊 Reading CSV file: ${filePath}`);

  const content = fs.readFileSync(filePath, 'utf-8');
  
  return new Promise<TrainingSample[]>((resolve, reject) => {
    parse(content, {
      header: true,
      complete: (results) => {
        const samples: TrainingSample[] = results.data
          .filter((row: any) => row.content && row.content.length > 100)
          .map((row: any) => ({
            title: row.title || `Newsletter Sample`,
            content: row.content,
            published_date: row.date || row.published_date || new Date().toISOString().split('T')[0]
          }));

        console.log(`Found ${samples.length} samples in CSV`);
        resolve(samples);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

async function uploadFromJSON(userId: string, filePath: string) {
  console.log(`📦 Reading JSON file: ${filePath}`);

  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);

  let samples: TrainingSample[] = [];

  if (Array.isArray(data)) {
    samples = data.filter(item => item.content && item.content.length > 100);
  } else if (data.text_samples) {
    samples = data.text_samples.filter((item: any) => item.content && item.content.length > 100);
  }

  console.log(`Found ${samples.length} samples in JSON`);
  return samples;
}

async function saveSamples(userId: string, samples: TrainingSample[]) {
  console.log(`\n💾 Saving ${samples.length} samples to database...`);

  const trainer = new VoiceTrainer();
  
  // Insert samples
  for (let i = 0; i < samples.length; i++) {
    const sample = samples[i];
    
    try {
      const { error } = await supabaseClient
        .from('voice_training_samples')
        .insert({
          user_id: userId,
          title: sample.title,
          content: sample.content,
          published_date: sample.published_date,
          word_count: sample.content.split(/\s+/).length,
          sentence_count: sample.content.split(/[.!?]+/).length
        });

      if (error) {
        console.error(`❌ Error saving sample ${i + 1}:`, error.message);
      } else {
        console.log(`✅ Saved sample ${i + 1}/${samples.length}`);
      }
    } catch (error: any) {
      console.error(`❌ Exception saving sample ${i + 1}:`, error.message);
    }
  }

  console.log('\n🔄 Analyzing writing style...');
  
  // Analyze and save voice profile
  try {
    const allSamples = samples.map(s => ({
      id: '',
      user_id: userId,
      title: s.title,
      content: s.content,
      published_date: s.published_date || null,
      style_analysis: null,
      word_count: s.content.split(/\s+/).length,
      sentence_count: s.content.split(/[.!?]+/).length,
      created_at: new Date().toISOString()
    }));

    const profile = await trainer.analyzeWritingStyle(allSamples);
    
    // Update user settings with voice profile
    const { error: updateError } = await supabaseClient
      .from('user_settings')
      .update({
        voice_trained: true,
        voice_training_count: samples.length,
        voice_profile: profile
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('❌ Error updating voice profile:', updateError.message);
    } else {
      console.log('✅ Voice profile saved successfully!');
    }

    console.log('\n📊 Voice Profile Summary:');
    console.log(`  - Average sentence length: ${profile.avgSentenceLength.toFixed(1)} words`);
    console.log(`  - Average paragraph length: ${profile.avgParagraphLength.toFixed(1)} sentences`);
    console.log(`  - Tone markers: ${profile.toneMarkers.slice(0, 5).join(', ')}`);
    console.log(`  - Common phrases: ${profile.commonPhrases.slice(0, 3).join(', ')}`);
    console.log(`  - Vocabulary level: ${profile.vocabularyLevel}`);

  } catch (error: any) {
    console.error('❌ Error analyzing style:', error.message);
  }
}

async function main() {
  console.log('\n🎤 Voice Training Sample Upload Tool\n');
  console.log('This tool helps you upload newsletter samples for voice training.\n');

  // Get command line arguments
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage:');
    console.log('  npm run tsx scripts/upload-voice-samples.ts <file_path>');
    console.log('\nSupported formats:');
    console.log('  - .txt  (plain text, separated by double newlines)');
    console.log('  - .csv  (columns: title, content, date)');
    console.log('  - .json (array of {title, content, date})');
    console.log('\nExample:');
    console.log('  npm run tsx scripts/upload-voice-samples.ts samples.csv');
    console.log();
    process.exit(1);
  }

  const filePath = args[0];

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  // Get user ID
  const userId = await getUserId();
  if (!userId) {
    process.exit(1);
  }

  // Load samples based on file extension
  let samples: TrainingSample[] = [];
  const ext = path.extname(filePath).toLowerCase();

  try {
    if (ext === '.txt') {
      samples = await uploadFromTextFile(userId, filePath);
    } else if (ext === '.csv') {
      samples = await uploadFromCSV(userId, filePath);
    } else if (ext === '.json') {
      samples = await uploadFromJSON(userId, filePath);
    } else {
      console.error(`❌ Unsupported file format: ${ext}`);
      console.log('Supported formats: .txt, .csv, .json');
      process.exit(1);
    }
  } catch (error: any) {
    console.error(`❌ Error reading file: ${error.message}`);
    process.exit(1);
  }

  // Check sample count
  if (samples.length < 20) {
    console.warn(`\n⚠️  Warning: Only ${samples.length} samples found.`);
    console.warn('Recommended: 20+ samples for best voice matching results.');
    console.log('\nContinue anyway? (yes/no)');
    // For automation, continue
    console.log('Continuing...\n');
  }

  if (samples.length === 0) {
    console.error('❌ No valid samples found in file.');
    process.exit(1);
  }

  // Save samples
  await saveSamples(userId, samples);

  console.log('\n✅ Voice training complete!');
  console.log('\nNext steps:');
  console.log('1. Test voice generation: npm run tsx scripts/test-voice-generation.ts');
  console.log('2. Generate first draft: curl http://localhost:3000/api/drafts -X POST ...');
  console.log();

  process.exit(0);
}

main().catch(error => {
  console.error('\n❌ Upload failed:', error);
  process.exit(1);
});




