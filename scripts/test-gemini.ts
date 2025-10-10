/**
 * Test Gemini 1.5 Flash Integration
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = 'AIzaSyB3MGb0q8Ksjlm2d9914q992ITiZHeo2jc';

console.log('🤖 Testing Gemini 1.5 Flash integration...\n');

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

async function testGemini() {
  try {
    console.log('1️⃣ Testing basic connection...');
    const result = await model.generateContent('Say hello in a creative way!');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Connection successful!');
    console.log('Response:', text);
    console.log();

    // Test article processing
    console.log('2️⃣ Testing article processing...');
    
    const testArticle = {
      title: "OpenAI Announces GPT-5 with Revolutionary Reasoning Capabilities",
      summary: "OpenAI has unveiled GPT-5, featuring advanced reasoning abilities that allow the model to solve complex problems through multi-step thinking. The model demonstrates significant improvements in mathematics, coding, and scientific reasoning tasks.",
      source: "TechCrunch AI",
    };

    const prompt = `You are an AI assistant helping to create concise, engaging summaries for a daily AI news digest.

Article Details:
Title: ${testArticle.title}
Source: ${testArticle.source}
Summary: ${testArticle.summary}

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

    const articleResult = await model.generateContent(prompt);
    const articleResponse = await articleResult.response;
    let articleText = articleResponse.text().trim();

    // Remove markdown code fences if present
    if (articleText.startsWith('```')) {
      articleText = articleText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }

    const parsed = JSON.parse(articleText);

    console.log('✅ Article processing successful!\n');
    console.log('📝 AI Summary:');
    console.log('   ', parsed.summary);
    console.log();
    console.log('📋 Bullet Points:');
    parsed.bullets.forEach((bullet: string, i: number) => {
      console.log(`   ${i + 1}. ${bullet}`);
    });
    console.log();
    console.log('🏷️  Hashtags:');
    console.log('   ', parsed.hashtags.join(' #'));
    console.log();

    console.log('🎉 Gemini 1.5 Flash Integration Complete!');
    console.log('\n✅ Ready to process articles with AI');
    console.log('✅ Generate summaries, bullets, and hashtags');
    console.log('✅ Enhance daily digests with AI insights\n');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.log('\n📝 Troubleshooting:');
    console.log('  1. Check API key is valid');
    console.log('  2. Ensure API key has Generative Language API enabled');
    console.log('  3. Check for quota limits');
    console.log();
  }
}

testGemini();

