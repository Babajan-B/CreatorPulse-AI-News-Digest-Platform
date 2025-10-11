/**
 * Test Script for Dual-Mode Integration
 * Tests AI News vs Science Breakthroughs functionality
 */

import { DualModeService } from '../lib/dual-mode-service'
import { LLMService } from '../lib/llm-service'
import { encryptionService } from '../lib/encryption'

async function testDualModeIntegration() {
  console.log('🧪 Testing Dual-Mode Integration...\n')

  const dualModeService = new DualModeService()
  const llmService = new LLMService()

  try {
    // Test 1: Mode Configuration
    console.log('1️⃣ Testing Mode Configuration...')
    const aiConfig = dualModeService.getModeConfig('ai_news')
    const scienceConfig = dualModeService.getModeConfig('science_breakthrough')
    
    console.log('✅ AI News Config:', {
      mode: aiConfig.mode,
      fetchLimit: aiConfig.fetchLimit,
      topItems: aiConfig.topItems,
      summaryStyle: aiConfig.summaryStyle
    })
    
    console.log('✅ Science Config:', {
      mode: scienceConfig.mode,
      fetchLimit: scienceConfig.fetchLimit,
      topItems: scienceConfig.topItems,
      summaryStyle: scienceConfig.summaryStyle
    })

    // Test 2: Article Fetching
    console.log('\n2️⃣ Testing Article Fetching...')
    
    console.log('📰 Fetching AI News articles...')
    const aiArticles = await dualModeService.fetchArticlesByMode('ai_news', 5)
    console.log(`✅ Found ${aiArticles.length} AI news articles`)
    
    console.log('🔬 Fetching Science Breakthrough articles...')
    const scienceArticles = await dualModeService.fetchArticlesByMode('science_breakthrough', 5)
    console.log(`✅ Found ${scienceArticles.length} science articles`)

    // Test 3: LLM Service
    console.log('\n3️⃣ Testing LLM Service...')
    
    if (aiArticles.length > 0) {
      const aiArticle = aiArticles[0]
      console.log('🤖 Testing AI News summary generation...')
      const aiSummary = await llmService.generateContent(
        aiArticle.title,
        aiArticle.content,
        'ai_news',
        aiArticle.source
      )
      console.log('✅ AI News Summary:', aiSummary.summary.substring(0, 100) + '...')
    }

    if (scienceArticles.length > 0) {
      const scienceArticle = scienceArticles[0]
      console.log('🔬 Testing Science summary generation...')
      const scienceSummary = await llmService.generateContent(
        scienceArticle.title,
        scienceArticle.content,
        'research_focused',
        scienceArticle.source
      )
      console.log('✅ Science Summary:', scienceSummary.summary.substring(0, 100) + '...')
    }

    // Test 4: Top Articles with Summaries
    console.log('\n4️⃣ Testing Top Articles with Summaries...')
    
    console.log('📊 Getting top AI articles with summaries...')
    const topAIArticles = await dualModeService.getTopArticlesWithSummaries('ai_news', 3)
    console.log(`✅ Found ${topAIArticles.length} top AI articles with summaries`)
    
    console.log('📊 Getting top science articles with summaries...')
    const topScienceArticles = await dualModeService.getTopArticlesWithSummaries('science_breakthrough', 3)
    console.log(`✅ Found ${topScienceArticles.length} top science articles with summaries`)

    // Test 5: Mode Statistics
    console.log('\n5️⃣ Testing Mode Statistics...')
    
    const aiStats = await dualModeService.getModeStats('ai_news')
    console.log('✅ AI News Stats:', aiStats)
    
    const scienceStats = await dualModeService.getModeStats('science_breakthrough')
    console.log('✅ Science Stats:', scienceStats)

    // Test 6: Encryption Service
    console.log('\n6️⃣ Testing Encryption Service...')
    
    const testData = 'sensitive-api-key-12345'
    const userId = 'test-user-123'
    
    console.log('🔐 Testing encryption/decryption...')
    const encrypted = await encryptionService.encryptUserToken(testData, userId)
    const decrypted = await encryptionService.decryptUserToken(encrypted, userId)
    
    if (decrypted === testData) {
      console.log('✅ Encryption/Decryption working correctly')
    } else {
      console.log('❌ Encryption/Decryption failed')
    }

    console.log('\n🎉 All tests completed successfully!')
    
    return {
      success: true,
      results: {
        aiArticles: aiArticles.length,
        scienceArticles: scienceArticles.length,
        topAIArticles: topAIArticles.length,
        topScienceArticles: topScienceArticles.length,
        encryptionWorking: decrypted === testData
      }
    }

  } catch (error: any) {
    console.error('❌ Test failed:', error.message)
    return {
      success: false,
      error: error.message
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  testDualModeIntegration()
    .then(result => {
      console.log('\n📋 Test Results:', result)
      process.exit(result.success ? 0 : 1)
    })
    .catch(error => {
      console.error('💥 Test runner failed:', error)
      process.exit(1)
    })
}

export { testDualModeIntegration }
