# YouTube, RSS & Twitter Custom Sources - Problem Statement

## 🎯 **Problem Overview**

Content creators and AI news curators need a unified system to aggregate content from their preferred sources (YouTube channels, Twitter accounts, RSS feeds) to create personalized AI news digests. Currently, users are limited to predefined RSS feeds and cannot include their favorite YouTube channels or Twitter accounts in their content curation workflow.

## 📋 **Requirements**

### **Core Functionality**
1. **Custom Source Management**: Allow users to add, edit, and remove their preferred sources
2. **Multi-Platform Support**: Support YouTube channels, Twitter accounts, and RSS feeds
3. **Real-time Content Fetching**: Fetch latest content from custom sources
4. **Source Type Filtering**: Filter content by platform type (RSS, YouTube, Twitter)
5. **Content Integration**: Integrate custom sources into the main AI news digest

### **Technical Requirements**
1. **No API Keys for YouTube**: Use RSS feeds instead of YouTube Data API
2. **Twitter API Integration**: Use existing Twitter API configuration
3. **Authentication**: Secure user-specific source management
4. **Error Handling**: Graceful handling of failed sources
5. **Performance**: Efficient content fetching and caching

## 🎨 **Frontend Requirements**

### **Sources Management Page (`/sources`)**
- **Add Source Form**:
  - Source Type Selector: `twitter`, `youtube`, `rss`, `newsletter`
  - Identifier Input: Handle, URL, or Channel ID
  - Source Name: Custom display name
  - Priority Weight: 1-10 slider
  - Enable/Disable Toggle

- **Source List**:
  - Display all user sources with metadata
  - Edit/Delete actions for each source
  - Status indicators (enabled/disabled, last fetched, errors)
  - Source type icons and visual indicators

- **Validation & Feedback**:
  - Real-time validation of source identifiers
  - Success/error toast notifications
  - Loading states during operations

### **AI News Page Integration**
- **Source Type Filter**:
  - Filter buttons: `RSS`, `YouTube`, `Twitter`
  - Show count of sources for each type
  - Default to showing all sources

- **Latest Content Display**:
  - "Latest from Your [Source Type] Sources" section
  - Show most recent content from selected source type
  - Empty states for no sources or no content
  - Login prompts for unauthenticated users

### **UI Components**
- **SourceTypeFilter**: Filter component for source types
- **SourceCard**: Individual source display component
- **AddSourceDialog**: Modal for adding new sources
- **SourceStatusBadge**: Status indicator component

## 🔧 **Backend Requirements**

### **Database Schema**
```sql
-- User Sources Table
CREATE TABLE user_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  source_type VARCHAR(20) NOT NULL, -- 'twitter', 'youtube', 'rss', 'newsletter'
  source_identifier TEXT NOT NULL,   -- Handle, URL, Channel ID
  source_name TEXT,                  -- Custom display name
  priority_weight INTEGER DEFAULT 5, -- 1-10
  enabled BOOLEAN DEFAULT true,
  metadata JSONB,                   -- Additional source metadata
  last_fetched_at TIMESTAMP,
  fetch_error TEXT,                  -- Last error message
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **API Endpoints**

#### **1. Sources Management API**
```typescript
// GET /api/sources
// - Fetch all user sources
// - Requires authentication
// - Returns: CustomSource[]

// POST /api/sources
// - Add new source
// - Body: { source_type, source_identifier, source_name, priority_weight }
// - Validates source before adding
// - Returns: { success, source?, error? }

// PUT /api/sources/[id]
// - Update existing source
// - Body: Partial<CustomSource>
// - Returns: { success, source?, error? }

// DELETE /api/sources/[id]
// - Delete source
// - Returns: { success }
```

#### **2. Custom Content API**
```typescript
// GET /api/custom-sources?sourceType=youtube|twitter|rss
// - Fetch latest content from sources of specific type
// - Requires authentication
// - Returns: FetchedContent[] with latest content
// - Includes source metadata and content details
```

### **Service Layer**

#### **CustomSourcesService**
```typescript
class CustomSourcesService {
  // Source Management
  async getUserSources(userId: string): Promise<CustomSource[]>
  async addSource(userId: string, source: AddSourceRequest): Promise<Result>
  async updateSource(sourceId: string, updates: Partial<CustomSource>): Promise<Result>
  async deleteSource(sourceId: string): Promise<Result>
  
  // Content Fetching
  async fetchAllContent(userId: string): Promise<FetchedContent[]>
  async fetchFromSource(source: CustomSource): Promise<FetchedContent[]>
  async fetchFromTwitter(source: CustomSource): Promise<FetchedContent[]>
  async fetchFromYouTube(source: CustomSource): Promise<FetchedContent[]>
  async fetchFromRSS(source: CustomSource): Promise<FetchedContent[]>
  
  // Validation
  async validateSource(type: string, identifier: string): Promise<ValidationResult>
}
```

## 🔄 **Data Flow**

### **1. Adding Sources**
```
User Input → Frontend Validation → API Call → Backend Validation → 
Database Storage → Success Response → UI Update
```

### **2. Content Fetching**
```
Source Type Filter → API Request → Service Layer → Platform-Specific Fetching → 
Content Processing → Response → Frontend Display
```

### **3. YouTube RSS Integration**
```
YouTube URL/Handle → URL Parsing → Channel Page Fetch → Channel ID Extraction → 
RSS URL Generation → RSS Feed Parsing → Content Extraction → Response
```

## 📊 **Expected Outputs**

### **Frontend Outputs**
1. **Sources List**: Table/cards showing all user sources with metadata
2. **Filtered Content**: Latest content from selected source type
3. **Empty States**: Helpful messages when no sources exist
4. **Error States**: Clear error messages for failed operations
5. **Loading States**: Spinners and skeleton loaders during operations

### **Backend Outputs**
1. **FetchedContent[]**: Standardized content format for all platforms
2. **Validation Results**: Success/error responses with detailed messages
3. **Source Metadata**: Additional information about sources
4. **Error Handling**: Graceful degradation for failed sources

### **Content Format**
```typescript
interface FetchedContent {
  title: string;           // Article/video/tweet title
  content: string;         // Main content/description
  url: string;            // Original URL
  source_type: string;     // 'youtube', 'twitter', 'rss'
  source_name: string;     // Display name of source
  author: string;          // Creator/author name
  published_at: Date;      // Publication date
  metadata: {
    video_id?: string;     // YouTube video ID
    tweet_id?: string;     // Twitter tweet ID
    thumbnail?: string;    // Media thumbnail URL
    duration?: string;     // Video duration
    retweet_count?: number; // Twitter metrics
    like_count?: number;   // Social engagement
  };
}
```

## 🚀 **Implementation Strategy**

### **Phase 1: Core Infrastructure**
1. Database schema setup
2. Basic API endpoints
3. Authentication integration
4. Source management UI

### **Phase 2: Platform Integration**
1. YouTube RSS implementation
2. Twitter API integration
3. RSS feed parsing
4. Content standardization

### **Phase 3: Frontend Integration**
1. Sources management page
2. AI News page filtering
3. Latest content display
4. Error handling and validation

### **Phase 4: Optimization**
1. Caching implementation
2. Performance optimization
3. Error recovery
4. User experience improvements

## 🔍 **Technical Challenges**

### **1. YouTube Integration**
- **Challenge**: No API key requirement
- **Solution**: Use YouTube RSS feeds (`https://www.youtube.com/feeds/videos.xml?channel_id=UCxxxxxx`)
- **Implementation**: URL parsing → Channel page fetch → Channel ID extraction → RSS URL generation

### **2. Twitter API Limitations**
- **Challenge**: Rate limits and authentication complexity
- **Solution**: Use existing Twitter API configuration with proper error handling
- **Implementation**: Bearer token authentication with fallback strategies

### **3. Content Standardization**
- **Challenge**: Different platforms have different content formats
- **Solution**: Unified `FetchedContent` interface with platform-specific metadata
- **Implementation**: Platform-specific parsers with common output format

### **4. Performance Optimization**
- **Challenge**: Multiple API calls and content fetching
- **Solution**: Caching, parallel processing, and efficient data structures
- **Implementation**: Redis caching, Promise.all for parallel requests

## 📈 **Success Metrics**

### **Functional Metrics**
- ✅ Users can add YouTube channels, Twitter accounts, and RSS feeds
- ✅ Content filtering by source type works correctly
- ✅ Latest content displays from custom sources
- ✅ Error handling works gracefully
- ✅ Authentication and security are properly implemented

### **Performance Metrics**
- ✅ Source addition completes within 2 seconds
- ✅ Content fetching completes within 5 seconds
- ✅ UI responds within 200ms for user interactions
- ✅ Error recovery works within 1 second

### **User Experience Metrics**
- ✅ Intuitive source management interface
- ✅ Clear error messages and feedback
- ✅ Responsive design across devices
- ✅ Accessible to screen readers and keyboard navigation

## 🎯 **Current Status**

### **✅ Completed**
- Database schema implemented
- Custom sources service created
- YouTube RSS integration working
- Twitter API integration configured
- Sources management page implemented
- AI News page filtering added
- Authentication system integrated
- Error handling implemented

### **🔄 In Progress**
- YouTube URL parsing optimization
- Performance improvements
- Error recovery mechanisms

### **📋 Next Steps**
- Enhanced caching implementation
- Advanced filtering options
- Bulk source operations
- Source analytics and insights
- Content recommendation system

---

*This document serves as the comprehensive problem statement and technical specification for the YouTube, RSS, and Twitter custom sources feature in CreatorPulse.*
