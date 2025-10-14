// Reddit Cache with twice-daily updates
import { RedditPost } from './reddit-service';

interface CacheEntry {
  data: RedditPost[];
  timestamp: number;
  nextUpdate: number;
}

class RedditCache {
  private cache: Map<string, CacheEntry> = new Map();
  private updateInterval = 2 * 60 * 60 * 1000; // 2 hours for fresh trending content

  /**
   * Get cached data if available and not expired
   */
  get(key: string): RedditPost[] | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    
    // Check if we should update
    if (now >= entry.nextUpdate) {
      console.log(`⏰ Cache expired for ${key}, needs update`);
      return null;
    }

    const timeUntilNext = Math.round((entry.nextUpdate - now) / 1000 / 60);
    console.log(`📦 Using cached Reddit data for ${key} (next update in ${timeUntilNext} minutes)`);
    
    return entry.data;
  }

  /**
   * Set cache data with 2-hour expiry for fresh trending
   */
  set(key: string, data: RedditPost[]): void {
    const now = Date.now();
    const entry: CacheEntry = {
      data,
      timestamp: now,
      nextUpdate: now + this.updateInterval
    };

    this.cache.set(key, entry);
    
    const nextUpdateTime = new Date(entry.nextUpdate).toLocaleTimeString();
    console.log(`💾 Cached Reddit data for ${key} (next update at ${nextUpdateTime})`);
  }

  /**
   * Check if cache exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    return Date.now() < entry.nextUpdate;
  }

  /**
   * Get cache info
   */
  getInfo(key: string): { cached: boolean; nextUpdate?: string; minutesUntilUpdate?: number } {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return { cached: false };
    }

    const now = Date.now();
    const minutesUntilUpdate = Math.round((entry.nextUpdate - now) / 1000 / 60);
    const nextUpdateTime = new Date(entry.nextUpdate).toLocaleString();

    return {
      cached: true,
      nextUpdate: nextUpdateTime,
      minutesUntilUpdate
    };
  }

  /**
   * Clear cache for a specific key
   */
  clear(key: string): void {
    this.cache.delete(key);
    console.log(`🗑️  Cleared cache for ${key}`);
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    this.cache.clear();
    console.log(`🗑️  Cleared all Reddit cache`);
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }
}

// Export singleton instance
export const redditCache = new RedditCache();
