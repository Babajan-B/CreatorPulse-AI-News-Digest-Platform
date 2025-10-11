// Social Media Sources Configuration
export interface SocialSource {
  id: string;
  name: string;
  platform: 'reddit' | 'hackernews' | 'lobsters' | 'slashdot' | 'producthunt';
  type: 'subreddit' | 'feed' | 'topic';
  url: string;
  rss_url?: string;
  category: string;
  description: string;
  active: boolean;
}

export const REDDIT_SOURCES: SocialSource[] = [
  {
    id: 'r-artificial',
    name: 'r/artificial',
    platform: 'reddit',
    type: 'subreddit',
    url: 'https://www.reddit.com/r/artificial/',
    category: 'ai_general',
    description: 'General AI discussions and news',
    active: true
  },
  {
    id: 'r-machinelearning',
    name: 'r/MachineLearning',
    platform: 'reddit',
    type: 'subreddit',
    url: 'https://www.reddit.com/r/MachineLearning/',
    category: 'ai_research',
    description: 'Machine learning research and papers',
    active: false // Disabled to reduce API calls
  },
  {
    id: 'r-openai',
    name: 'r/OpenAI',
    platform: 'reddit',
    type: 'subreddit',
    url: 'https://www.reddit.com/r/OpenAI/',
    category: 'ai_companies',
    description: 'OpenAI news and discussions',
    active: true
  },
  {
    id: 'r-chatgpt',
    name: 'r/ChatGPT',
    platform: 'reddit',
    type: 'subreddit',
    url: 'https://www.reddit.com/r/ChatGPT/',
    category: 'ai_applications',
    description: 'ChatGPT discussions and use cases',
    active: false // Disabled to reduce API calls
  },
  {
    id: 'r-localllama',
    name: 'r/LocalLLaMA',
    platform: 'reddit',
    type: 'subreddit',
    url: 'https://www.reddit.com/r/LocalLLaMA/',
    category: 'ai_models',
    description: 'Local LLM discussions and models',
    active: false // Disabled to reduce API calls
  }
];

export const HACKERNEWS_SOURCES: SocialSource[] = [
  {
    id: 'hn-frontpage',
    name: 'Hacker News',
    platform: 'hackernews',
    type: 'feed',
    url: 'https://news.ycombinator.com/',
    rss_url: 'https://news.ycombinator.com/rss',
    category: 'tech_news',
    description: 'Top stories from Hacker News',
    active: true
  }
];

export const LOBSTERS_SOURCES: SocialSource[] = [
  {
    id: 'lobsters-frontpage',
    name: 'Lobsters',
    platform: 'lobsters',
    type: 'feed',
    url: 'https://lobste.rs/',
    rss_url: 'https://lobste.rs/rss',
    category: 'tech_news',
    description: 'Computing-focused community',
    active: true
  },
  {
    id: 'lobsters-ai',
    name: 'Lobsters AI',
    platform: 'lobsters',
    type: 'topic',
    url: 'https://lobste.rs/t/ai',
    rss_url: 'https://lobste.rs/t/ai.rss',
    category: 'ai_news',
    description: 'AI-tagged stories on Lobsters',
    active: true
  },
  {
    id: 'lobsters-ml',
    name: 'Lobsters Machine Learning',
    platform: 'lobsters',
    type: 'topic',
    url: 'https://lobste.rs/t/ml',
    rss_url: 'https://lobste.rs/t/ml.rss',
    category: 'ai_news',
    description: 'Machine learning stories',
    active: true
  }
];

export const SLASHDOT_SOURCES: SocialSource[] = [
  {
    id: 'slashdot-all',
    name: 'Slashdot',
    platform: 'slashdot',
    type: 'feed',
    url: 'https://slashdot.org/',
    rss_url: 'http://rss.slashdot.org/Slashdot/slashdotMain',
    category: 'tech_news',
    description: 'News for nerds, stuff that matters',
    active: true
  }
];

export const PRODUCTHUNT_SOURCES: SocialSource[] = [
  {
    id: 'ph-today',
    name: 'Product Hunt',
    platform: 'producthunt',
    type: 'feed',
    url: 'https://www.producthunt.com/',
    rss_url: 'https://www.producthunt.com/feed',
    category: 'products',
    description: 'Today\'s top products',
    active: true
  }
];

export const ALL_SOCIAL_SOURCES = [
  ...REDDIT_SOURCES, 
  ...HACKERNEWS_SOURCES, 
  ...LOBSTERS_SOURCES, 
  ...SLASHDOT_SOURCES, 
  ...PRODUCTHUNT_SOURCES
];

export const getSourcesByPlatform = (platform: 'reddit' | 'hackernews' | 'lobsters' | 'slashdot' | 'producthunt') => {
  return ALL_SOCIAL_SOURCES.filter(source => source.platform === platform);
};

export const getSourcesByCategory = (category: string) => {
  return ALL_SOCIAL_SOURCES.filter(source => source.category === category);
};

export const getActiveSources = () => {
  return ALL_SOCIAL_SOURCES.filter(source => source.active);
};

export const getAllRSSFeeds = () => {
  return ALL_SOCIAL_SOURCES.filter(source => source.rss_url).map(source => source.rss_url);
};
