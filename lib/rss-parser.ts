import Parser from 'rss-parser';
import fs from 'fs/promises';
import path from 'path';

export interface RSSArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  sourceLogo: string;
  publishedAt: string;
  author?: string;
  imageUrl?: string;
  tags: string[];
  qualityScore: number;
}

export interface DataSource {
  name: string;
  type: string;
  url: string;
  enabled: boolean;
  parameters?: Record<string, any>;
}

export interface Config {
  project_name: string;
  data_sources: DataSource[];
}

// Initialize RSS parser
const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['content:encoded', 'contentEncoded'],
      ['description', 'description'],
    ],
  },
});

// Load config.json
export async function loadConfig(): Promise<Config> {
  const configPath = path.join(process.cwd(), 'config.json');
  const configData = await fs.readFile(configPath, 'utf-8');
  return JSON.parse(configData);
}

// Extract image URL from RSS item
function extractImageUrl(item: any): string | undefined {
  // Try media:content
  if (item.mediaContent && item.mediaContent.$?.url) {
    return item.mediaContent.$.url;
  }
  
  // Try media:thumbnail
  if (item.mediaThumbnail && item.mediaThumbnail.$?.url) {
    return item.mediaThumbnail.$.url;
  }
  
  // Try to find image in content
  if (item.contentEncoded) {
    const imgMatch = item.contentEncoded.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch) return imgMatch[1];
  }
  
  // Try enclosure
  if (item.enclosure && item.enclosure.type?.startsWith('image/')) {
    return item.enclosure.url;
  }
  
  return undefined;
}

// Generate quality score based on various factors
function calculateQualityScore(item: any, sourceName: string): number {
  let score = 5.0; // Base score
  
  // Boost for reputable sources
  const premiumSources = ['DeepMind', 'Google Research', 'OpenAI', 'Berkeley', 'MIT'];
  if (premiumSources.some(s => sourceName.includes(s))) {
    score += 2.0;
  }
  
  // Boost for having an image
  if (extractImageUrl(item)) {
    score += 0.5;
  }
  
  // Boost for recent articles (within last 7 days)
  const pubDate = new Date(item.pubDate || item.isoDate);
  const daysSincePublished = (Date.now() - pubDate.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSincePublished < 1) score += 1.5;
  else if (daysSincePublished < 3) score += 1.0;
  else if (daysSincePublished < 7) score += 0.5;
  
  // Boost for longer, more detailed content
  const contentLength = (item.contentSnippet || item.summary || '').length;
  if (contentLength > 500) score += 0.5;
  if (contentLength > 1000) score += 0.5;
  
  // Cap at 10.0
  return Math.min(10.0, score);
}

// Get logo path for source
function getSourceLogo(sourceName: string): string {
  const logoMap: Record<string, string> = {
    'DeepMind': '/logos/deepmind.jpg',
    'Google Research': '/logos/google-research.jpg',
    'TechCrunch': '/logos/techcrunch.jpg',
    'VentureBeat': '/logos/venturebeat.jpg',
    'Wired': '/logos/wired.jpg',
    'Hugging Face': '/logos/huggingface.jpg',
    'Berkeley': '/logos/bair.jpg',
    'CMU': '/logos/cmu-ml.jpg',
    'ML Mastery': '/logos/ml-mastery.jpg',
    'Analytics Vidhya': '/logos/analytics-vidhya.jpg',
    'The Gradient': '/logos/the-gradient.jpg',
    'Distill': '/logos/distill.jpg',
    'Import AI': '/logos/import-ai.jpg',
    'Karpathy': '/logos/karpathy.jpg',
  };
  
  // Find matching logo
  for (const [key, logo] of Object.entries(logoMap)) {
    if (sourceName.includes(key)) {
      return logo;
    }
  }
  
  return '/placeholder-logo.svg';
}

// Extract tags from content
function extractTags(item: any, sourceName: string): string[] {
  const tags: string[] = [];
  
  // Use RSS categories if available
  if (item.categories && Array.isArray(item.categories)) {
    tags.push(...item.categories.slice(0, 4));
  }
  
  // Add source-based tags
  if (sourceName.includes('TechCrunch')) tags.push('Industry News');
  if (sourceName.includes('Research') || sourceName.includes('Berkeley') || sourceName.includes('CMU')) {
    tags.push('Research');
  }
  if (sourceName.includes('AI') || sourceName.includes('Artificial Intelligence')) {
    tags.push('AI');
  }
  
  // Ensure we have at least some tags
  if (tags.length === 0) {
    tags.push('AI', 'Machine Learning');
  }
  
  return [...new Set(tags)].slice(0, 4);
}

// Parse a single RSS feed
export async function parseRSSFeed(url: string, sourceName: string): Promise<RSSArticle[]> {
  try {
    const feed = await parser.parseURL(url);
    
    const articles: RSSArticle[] = feed.items.map((item, index) => ({
      id: item.guid || item.link || `${sourceName}-${index}`,
      title: item.title || 'Untitled',
      summary: item.contentSnippet || item.summary || item.content || 'No summary available',
      url: item.link || '#',
      source: sourceName,
      sourceLogo: getSourceLogo(sourceName),
      publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
      author: item.creator || item.author,
      imageUrl: extractImageUrl(item),
      tags: extractTags(item, sourceName),
      qualityScore: calculateQualityScore(item, sourceName),
    }));
    
    return articles;
  } catch (error) {
    console.error(`Error parsing RSS feed from ${sourceName}:`, error);
    return [];
  }
}

// Fetch all RSS feeds from config
export async function fetchAllRSSFeeds(limit?: number): Promise<RSSArticle[]> {
  const config = await loadConfig();
  const rssSources = config.data_sources.filter(
    source => source.type === 'rss' && source.enabled
  );
  
  console.log(`Fetching ${rssSources.length} RSS feeds...`);
  
  // Fetch all feeds in parallel with timeout
  const fetchPromises = rssSources.map(async (source) => {
    const timeoutPromise = new Promise<RSSArticle[]>((resolve) => {
      setTimeout(() => resolve([]), 10000); // 10 second timeout
    });
    
    const fetchPromise = parseRSSFeed(source.url, source.name);
    
    return Promise.race([fetchPromise, timeoutPromise]);
  });
  
  const results = await Promise.all(fetchPromises);
  const allArticles = results.flat();
  
  // FILTER: Only articles from last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentArticles = allArticles.filter(article => {
    const publishedDate = new Date(article.publishedAt);
    return publishedDate >= sevenDaysAgo;
  });
  
  console.log(`📅 Filtered to ${recentArticles.length} articles from last 7 days (from ${allArticles.length} total)`);
  
  // Sort by quality score and published date
  const sortedArticles = recentArticles.sort((a, b) => {
    const scoreDiff = b.qualityScore - a.qualityScore;
    if (Math.abs(scoreDiff) > 0.5) return scoreDiff;
    
    // If scores are close, sort by date
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
  
  // Limit results if specified
  const limitedArticles = limit ? sortedArticles.slice(0, limit) : sortedArticles;
  
  console.log(`Fetched ${limitedArticles.length} recent articles from ${rssSources.length} sources`);
  
  return limitedArticles;
}

