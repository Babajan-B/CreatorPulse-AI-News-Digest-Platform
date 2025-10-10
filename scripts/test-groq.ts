/**
 * Test Groq Integration
 */

import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY || '';

console.log('🚀 Testing Groq LLM integration...\n');

const groq = new Groq({ apiKey });

async function testGroq() {
  try {
    // Test basic connection
    console.log('1. Testing basic connection...');
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Say hello in a creative way!' }],
      model: 'llama-3.3-70b-versatile',
      temperature: 1,
      max_tokens: 100,
    });
    
    const message = chatCompletion.choices[0]?.message?.content;
    console.log('✅ Response:', message);
    
    // Test article processing
    console.log('\n2. Testing article processing...');
    const articlePrompt = `
      You are an expert AI news analyst. Your task is to read the following article and provide:
      1. A concise, 2-3 sentence summary of the article.
      2. 3-5 key bullet points highlighting the most important takeaways.
      3. 5-7 relevant hashtags for social media sharing.

      Format your response as a JSON object with the following keys: "aiSummary", "bulletPoints" (an array of strings), and "hashtags" (an array of strings).

      Article Title: OpenAI Announces GPT-5 with Revolutionary Reasoning Capabilities
      Article Summary: OpenAI has unveiled GPT-5, featuring advanced reasoning abilities that allow the model to solve complex problems through multi-step thinking. The model demonstrates significant improvements in mathematics, coding, and scientific reasoning tasks.
    `;

    const articleCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: articlePrompt }],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1024,
    });

    const articleResult = articleCompletion.choices[0]?.message?.content;
    console.log('✅ Article Processing Result:');
    console.log(JSON.parse(articleResult || '{}', null, 2));
    
    console.log('\n🎉 Groq integration test completed successfully!');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('API key')) {
      console.log('\n💡 Make sure to set GROQ_API_KEY in your environment variables.');
    }
  }
}

testGroq();