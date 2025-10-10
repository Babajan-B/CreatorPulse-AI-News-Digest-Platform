/**
 * List Available Gemini Models
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = 'AIzaSyB3MGb0q8Ksjlm2d9914q992ITiZHeo2jc';

console.log('🔍 Checking available Gemini models...\n');

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    // Try to list models
    const models = await genAI.listModels();
    
    console.log('✅ Available models:\n');
    for await (const model of models) {
      console.log(`📦 ${model.name}`);
      console.log(`   Display Name: ${model.displayName}`);
      console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(', ')}`);
      console.log();
    }

  } catch (error: any) {
    console.error('❌ Error listing models:', error.message);
    console.log('\n⚠️  Your API key might need the Generative Language API enabled.');
    console.log('\n📝 To enable:');
    console.log('  1. Go to: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com');
    console.log('  2. Click "Enable API"');
    console.log('  3. Wait a few minutes');
    console.log('  4. Test again\n');
  }
}

listModels();

