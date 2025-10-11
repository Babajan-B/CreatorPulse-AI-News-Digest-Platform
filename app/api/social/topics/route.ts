// API Route: Get AI-focused trending topics from social media by platform
import { NextRequest, NextResponse } from 'next/server';
import { socialMediaService } from '@/lib/social-media-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface TrendingTopic {
  keyword: string;
  count: number;
  url: string;
  title: string;
  platform: string;
}

interface PlatformData {
  name: string;
  icon: string;
  topics: TrendingTopic[];
  color: string;
}

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching AI-focused trending topics from social media...');

    // Fetch trending content
    const trendingContent = await socialMediaService.getTrendingContent(100);

    // AI-related keywords to filter for
    const aiKeywords = new Set([
      'ai', 'artificial', 'intelligence', 'llm', 'llms', 'gpt', 'chatgpt', 
      'model', 'models', 'training', 'neural', 'network', 'machine', 
      'learning', 'deep', 'transformer', 'agent', 'agents', 'openai',
      'anthropic', 'claude', 'gemini', 'mistral', 'llama', 'alpaca',
      'stable', 'diffusion', 'midjourney', 'dalle', 'sora', 'video',
      'generative', 'prompt', 'fine-tuning', 'rlhf', 'alignment',
      'reasoning', 'inference', 'embeddings', 'vector', 'rag', 'retrieval'
    ]);

    // Group posts by platform and filter AI-related
    const platformMap = new Map<string, typeof trendingContent.combined>();

    trendingContent.combined.forEach(post => {
      // Check if post is AI-related
      const titleLower = post.title.toLowerCase();
      const contentLower = post.content.toLowerCase();
      const isAIRelated = Array.from(aiKeywords).some(keyword => 
        titleLower.includes(keyword) || contentLower.includes(keyword)
      );

      if (isAIRelated) {
        if (!platformMap.has(post.platform)) {
          platformMap.set(post.platform, []);
        }
        platformMap.get(post.platform)!.push(post);
      }
    });

    // Debug: Log what platforms have AI content
    console.log('Platforms with AI content:', Array.from(platformMap.keys()));
    platformMap.forEach((posts, platform) => {
      console.log(`  ${platform}: ${posts.length} AI posts`);
    });

    // Build platform data - Reddit separate, others combined
    const platforms: PlatformData[] = [];

    // 1. Reddit (separate)
    const redditPosts = platformMap.get('reddit') || [];
    console.log(`📱 Reddit AI posts (filtered): ${redditPosts.length}`);
    console.log(`📱 Reddit all posts: ${trendingContent.reddit?.length || 0}`);
    
    // Use AI-filtered posts if available, otherwise use all Reddit posts
    const redditTopics = redditPosts.length > 0 ? redditPosts : (trendingContent.reddit || []);
    const topRedditPosts = redditTopics
      .sort((a, b) => b.trending_score - a.trending_score)
      .slice(0, 10);

    console.log(`📱 Top Reddit posts to show: ${topRedditPosts.length}`);

    // Always show Reddit card, even with empty topics
    platforms.push({
      name: 'Reddit',
      icon: '🔴',
      color: 'hover:border-orange-500',
      topics: topRedditPosts.map(post => {
        const words = post.title.toLowerCase().split(/\s+/);
        const foundKeyword = words.find(word => aiKeywords.has(word)) || 'AI';

        return {
          keyword: foundKeyword.toUpperCase(),
          count: post.score + post.comments,
          url: post.url,
          title: post.title,
          platform: post.platform
        };
      })
    });

    // 2. Tech Communities (all others combined)
    const otherPlatforms = ['hackernews', 'lobsters', 'slashdot', 'producthunt'];
    const allOtherPosts: typeof trendingContent.combined = [];

    otherPlatforms.forEach(platform => {
      const posts = platformMap.get(platform) || [];
      allOtherPosts.push(...posts);
      console.log(`  ${platform} AI posts: ${posts.length}`);
    });

    console.log(`🌐 Total Tech Communities AI posts: ${allOtherPosts.length}`);

    // If no AI posts found in other platforms, use all posts from those platforms
    const techTopics = allOtherPosts.length > 0 ? allOtherPosts : [
      ...trendingContent.hackernews,
      ...trendingContent.lobsters,
      ...trendingContent.slashdot,
      ...trendingContent.producthunt
    ];

    const topOtherPosts = techTopics
      .sort((a, b) => b.trending_score - a.trending_score)
      .slice(0, 10);

    if (topOtherPosts.length > 0) {
      platforms.push({
        name: 'Tech Communities',
        icon: '🌐',
        color: 'hover:border-blue-500',
        topics: topOtherPosts.map(post => {
          const words = post.title.toLowerCase().split(/\s+/);
          const foundKeyword = words.find(word => aiKeywords.has(word)) || 'AI';

          // Get platform icon for display
          const platformIcons: { [key: string]: string } = {
            'hackernews': '🟠',
            'lobsters': '🦞',
            'slashdot': '⚡',
            'producthunt': '🚀'
          };

          return {
            keyword: foundKeyword.toUpperCase(),
            count: post.score + post.comments,
            url: post.url,
            title: `${platformIcons[post.platform] || '📱'} ${post.title}`,
            platform: post.platform
          };
        })
      });
    }

    const activePlatforms = platforms;
    
    console.log(`✅ Final platforms: ${activePlatforms.map(p => p.name).join(', ')}`);

    console.log(`✅ Found AI topics on ${activePlatforms.length} platforms`);

    return NextResponse.json({
      success: true,
      platforms: activePlatforms,
      total_platforms: activePlatforms.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching trending topics:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch trending topics',
      platforms: [],
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
