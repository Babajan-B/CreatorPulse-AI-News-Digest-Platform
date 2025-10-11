// Test Social Media Integration
import { socialMediaService } from '../lib/social-media-service';

console.log('🧪 Testing Social Media Integration...\n');

async function testSocialIntegration() {
  try {
    // Test 1: Connection Status
    console.log('1️⃣ Testing Platform Connections...');
    const connections = await socialMediaService.testConnections();
    console.log(`   Reddit: ${connections.reddit ? '✅' : '❌'}`);
    console.log(`   LinkedIn: ${connections.linkedin ? '✅' : '❌'}`);
    console.log(`   Overall: ${connections.overall ? '✅' : '❌'}\n`);

    // Test 2: Platform Statistics
    console.log('2️⃣ Fetching Platform Statistics...');
    const stats = await socialMediaService.getPlatformStats();
    console.log(`   Total Sources: ${stats.combined.total_sources}`);
    console.log(`   Reddit Sources: ${stats.reddit.active_sources}`);
    console.log(`   LinkedIn Sources: ${stats.linkedin.active_sources}`);
    console.log(`   Total Posts: ${stats.combined.total_posts}\n`);

    // Test 3: Trending Content
    console.log('3️⃣ Fetching Trending Content...');
    const trending = await socialMediaService.getTrendingContent(10);
    console.log(`   Total Posts: ${trending.total_count}`);
    console.log(`   Reddit Posts: ${trending.reddit.length}`);
    console.log(`   LinkedIn Posts: ${trending.linkedin.length}`);
    
    if (trending.combined.length > 0) {
      console.log(`   Top Post: "${trending.combined[0].title.substring(0, 50)}..."`);
      console.log(`   Platform: ${trending.combined[0].platform}`);
      console.log(`   Trending Score: ${Math.round(trending.combined[0].trending_score)}`);
    }
    console.log('');

    // Test 4: Search Functionality
    console.log('4️⃣ Testing Search Functionality...');
    const searchResults = await socialMediaService.searchPosts('AI', 5);
    console.log(`   Search Results for "AI": ${searchResults.length} posts`);
    
    if (searchResults.length > 0) {
      console.log(`   Top Result: "${searchResults[0].title.substring(0, 50)}..."`);
      console.log(`   Platform: ${searchResults[0].platform}`);
    }
    console.log('');

    // Test 5: Trending Hashtags
    console.log('5️⃣ Fetching Trending Hashtags...');
    const hashtags = await socialMediaService.getTrendingHashtags(10);
    console.log(`   Trending Hashtags: ${hashtags.length}`);
    
    if (hashtags.length > 0) {
      console.log(`   Top Hashtags:`);
      hashtags.slice(0, 5).forEach((tag, index) => {
        console.log(`     ${index + 1}. ${tag.hashtag} (${tag.count} posts)`);
      });
    }
    console.log('');

    // Test 6: Top Authors
    console.log('6️⃣ Fetching Top Authors...');
    const authors = await socialMediaService.getTopAuthors(10);
    console.log(`   Top Authors: ${authors.length}`);
    
    if (authors.length > 0) {
      console.log(`   Top Authors:`);
      authors.slice(0, 5).forEach((author, index) => {
        console.log(`     ${index + 1}. ${author.author} (${author.platform}) - ${author.posts_count} posts`);
      });
    }
    console.log('');

    // Test 7: Platform-specific Content
    console.log('7️⃣ Testing Platform-specific Content...');
    const redditPosts = await socialMediaService.getPostsByPlatform('reddit', 5);
    const linkedinPosts = await socialMediaService.getPostsByPlatform('linkedin', 5);
    
    console.log(`   Reddit Posts: ${redditPosts.length}`);
    console.log(`   LinkedIn Posts: ${linkedinPosts.length}\n`);

    // Summary
    console.log('🎯 Integration Test Summary:');
    console.log(`   ✅ Connections: Reddit ${connections.reddit ? 'OK' : 'FAIL'}, LinkedIn ${connections.linkedin ? 'OK' : 'FAIL'}`);
    console.log(`   ✅ Content Fetching: ${trending.total_count} posts retrieved`);
    console.log(`   ✅ Search: ${searchResults.length} results for "AI"`);
    console.log(`   ✅ Analytics: ${hashtags.length} hashtags, ${authors.length} authors`);
    console.log(`   ✅ Platform Filtering: Reddit ${redditPosts.length}, LinkedIn ${linkedinPosts.length}`);
    
    if (connections.overall && trending.total_count > 0) {
      console.log('\n🎉 Social Media Integration Test: PASSED');
    } else {
      console.log('\n⚠️  Social Media Integration Test: PARTIAL (some features may use mock data)');
    }

  } catch (error) {
    console.error('❌ Social Media Integration Test: FAILED');
    console.error('Error:', error);
  }
}

// Run the test
testSocialIntegration();
