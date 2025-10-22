# Article IDs and RSS Feed Health - Fixed

**Date:** October 18, 2025  
**Status:** ✅ Complete

## Issues Fixed

### 1. "No Articles Found with Provided IDs" Error

**Problem:**
- Frontend was sending article URLs as IDs
- Backend was looking for database UUIDs
- This caused draft generation to fail with "No articles found with the provided IDs"

**Root Cause:**
- When articles were fetched from RSS feeds, they used URLs/GUIDs as IDs
- When saved to database, they got assigned UUIDs
- Frontend was sending the original URLs, but database queries expected UUIDs

**Solution:**
```typescript
// In draft-generator.ts - Added fallback to search by URL
// First try by UUID
let { data: articles, error: articlesError } = await supabase
  .from('articles')
  .select('*')
  .in('id', articleIds)
  .order('quality_score', { ascending: false });

// If no articles found by ID, try by URL (for backward compatibility)
if (!articles || articles.length === 0) {
  console.log('🔄 No articles found by ID, trying by URL...');
  const result = await supabase
    .from('articles')
    .select('*')
    .in('url', articleIds)
    .order('quality_score', { ascending: false });
  
  articles = result.data;
  articlesError = result.error;
}
```

```typescript
// In app/api/articles/route.ts - Ensured database UUIDs are always returned
// Save and wait for database IDs
const saveResult = await saveFeedItems(feedItems);

// Now fetch from database to get proper UUIDs
const dbResult = await getRecentFeedItems(7, limitNumber);
if (dbResult.success && dbResult.items.length > 0) {
  return NextResponse.json({
    articles: dbResult.items.map((item: any) => ({
      id: item.id, // This is the database UUID
      // ... other fields
    })),
  });
}
```

### 2. RSS Feed Health Monitoring

**Problem:**
- User reported only seeing 1-2 RSS feeds active
- No visibility into which feeds were working vs. failing
- Silent failures made debugging difficult

**Solution:**
Added comprehensive logging to track feed health:

```typescript
// In rss-parser.ts
export async function parseRSSFeed(url: string, sourceName: string): Promise<RSSArticle[]> {
  try {
    console.log(`📡 Fetching: ${sourceName}`);
    const feed = await parser.parseURL(url);
    // ... parsing logic
    console.log(`✅ ${sourceName}: ${articles.length} articles`);
    return articles;
  } catch (error: any) {
    console.error(`❌ ${sourceName} FAILED: ${error.message}`);
    return [];
  }
}
```

```typescript
// Added timeout monitoring
const timeoutPromise = new Promise<RSSArticle[]>((resolve) => {
  setTimeout(() => {
    console.error(`⏱️ ${source.name}: TIMEOUT (10s)`);
    resolve([]);
  }, 10000); // 10 second timeout
});

// Summary statistics
const successfulFeeds = results.filter(r => r.length > 0).length;
console.log(`\n📊 Feed Results: ${successfulFeeds}/${rssSources.length} feeds successful\n`);
```

## RSS Feed Configuration

Total feeds configured: **17 enabled + 2 disabled**

### Enabled Feeds (17):
1. DeepMind News & Blog
2. TechCrunch Generative AI
3. TechCrunch AI
4. The Gradient
5. Machine Learning Mastery
6. Berkeley AI Research (BAIR)
7. AI Trends
8. Analytics Vidhya
9. Google Research Blog
10. Hugging Face Blog RSS
11. VentureBeat AI
12. Wired AI
13. Distill.pub
14. Import AI Newsletter
15. Sebastian Raschka Blog
16. Andrej Karpathy Blog
17. CMU Machine Learning Blog

### Disabled Feeds (2):
- ArXiv CS.AI (Research Papers)
- ArXiv CS.LG (Machine Learning Papers)

## How to Monitor Feed Health

### In Server Logs:
```
🔄 Fetching 17 RSS feeds...

📡 Fetching: DeepMind News & Blog
✅ DeepMind News & Blog: 12 articles

📡 Fetching: TechCrunch Generative AI
✅ TechCrunch Generative AI: 45 articles

📡 Fetching: Distill.pub
❌ Distill.pub FAILED: getaddrinfo ENOTFOUND distill.pub

⏱️ Sebastian Raschka Blog: TIMEOUT (10s)

📊 Feed Results: 15/17 feeds successful

📅 Filtered to 54 articles from last 7 days (from 954 total)
```

### Key Metrics:
- **Success Rate:** X/17 feeds successful
- **Article Count:** Total vs. Recent (last 7 days)
- **Timeout Tracking:** 10-second timeout per feed
- **Error Details:** Specific error messages for failed feeds

## Benefits

### For Users:
✅ Draft generation now works reliably with selected articles  
✅ Articles always have proper database IDs  
✅ No more "no articles found" errors  

### For Developers:
✅ Clear visibility into RSS feed health  
✅ Easy debugging with detailed logs  
✅ Timeout protection prevents hanging requests  
✅ Backward compatibility with URL-based lookups  

## Files Modified

1. **`lib/draft-generator.ts`**
   - Added fallback logic to search by URL if UUID lookup fails
   - Enhanced error messages with context

2. **`app/api/articles/route.ts`**
   - Changed from async background save to synchronous save
   - Always fetch from database after save to get UUIDs
   - Return proper database IDs to frontend

3. **`lib/rss-parser.ts`**
   - Added per-feed logging (📡, ✅, ❌, ⏱️)
   - Added success rate summary
   - Enhanced error messages with feed names

## Testing

To verify RSS feeds are working:

1. Check server logs when fetching articles:
   ```bash
   # Look for this pattern in logs
   📊 Feed Results: 15/17 feeds successful
   ```

2. Test article selection:
   - Go to `/drafts/create`
   - Select articles
   - Click "Generate"
   - Should work without "no articles found" error

3. Monitor feed health:
   ```bash
   # In server logs, grep for failed feeds
   grep "❌" logs.txt
   grep "⏱️" logs.txt
   ```

## Next Steps

1. Consider adding a `/api/feeds/health` endpoint for real-time feed monitoring
2. Add automatic retry logic for failed feeds
3. Implement feed health dashboard in admin panel
4. Store feed success rates in database for trend analysis

---

**Impact:** 🟢 High - Core functionality restored  
**User Experience:** ⬆️ Significantly improved  
**Developer Experience:** ⬆️ Much better debugging

