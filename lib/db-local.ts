/**
 * Local SQLite Database (for development/testing)
 * Can be easily migrated to Supabase later
 */

import Database from 'better-sqlite3';
import path from 'path';
import { existsSync } from 'fs';

// Initialize SQLite database
const dbPath = path.join(process.cwd(), 'creatorpulse.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initializeDatabase() {
  console.log('🔧 Initializing local database...');

  // Articles table
  db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      source TEXT NOT NULL,
      source_logo TEXT,
      source_type TEXT DEFAULT 'rss',
      published_at TEXT NOT NULL,
      scraped_at TEXT DEFAULT CURRENT_TIMESTAMP,
      author TEXT,
      image_url TEXT,
      tags TEXT,
      quality_score REAL DEFAULT 5.0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_published_at ON articles(published_at DESC);
    CREATE INDEX IF NOT EXISTS idx_quality_score ON articles(quality_score DESC);
    CREATE INDEX IF NOT EXISTS idx_source ON articles(source);
  `);

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      settings TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    INSERT OR IGNORE INTO users (id, email, name) 
    VALUES ('guest-user', 'guest@creatorpulse.com', 'Guest User');
  `);

  // Digests table
  db.exec(`
    CREATE TABLE IF NOT EXISTS digests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      article_ids TEXT,
      generated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      delivered_at TEXT,
      status TEXT DEFAULT 'draft',
      email_sent INTEGER DEFAULT 0,
      linkedin_posted INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  console.log('✅ Local database initialized!');
  console.log(`📁 Database file: ${dbPath}\n`);
}

// Initialize on import
if (!existsSync(dbPath)) {
  initializeDatabase();
}

// ================================================
// ARTICLE OPERATIONS
// ================================================

export interface LocalArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  sourceLogo?: string;
  sourceType?: string;
  publishedAt: string;
  scrapedAt?: string;
  author?: string;
  imageUrl?: string;
  tags?: string[];
  qualityScore: number;
}

/**
 * Save articles to local database
 */
export function saveArticlesToLocal(articles: LocalArticle[]): { success: boolean; count: number } {
  try {
    const insert = db.prepare(`
      INSERT OR REPLACE INTO articles 
      (id, title, summary, url, source, source_logo, source_type, published_at, author, image_url, tags, quality_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((articlesToInsert) => {
      for (const article of articlesToInsert) {
        insert.run(
          article.id,
          article.title,
          article.summary,
          article.url,
          article.source,
          article.sourceLogo || null,
          article.sourceType || 'rss',
          article.publishedAt,
          article.author || null,
          article.imageUrl || null,
          article.tags ? JSON.stringify(article.tags) : null,
          article.qualityScore
        );
      }
    });

    insertMany(articles);
    console.log(`💾 Saved ${articles.length} articles to local database`);

    return { success: true, count: articles.length };
  } catch (error: any) {
    console.error('Error saving to local DB:', error);
    return { success: false, count: 0 };
  }
}

/**
 * Get articles from local database
 */
export function getArticlesFromLocal(options?: {
  limit?: number;
  minScore?: number;
  source?: string;
}): LocalArticle[] {
  try {
    let query = 'SELECT * FROM articles WHERE 1=1';
    const params: any[] = [];

    if (options?.minScore) {
      query += ' AND quality_score >= ?';
      params.push(options.minScore);
    }

    if (options?.source) {
      query += ' AND source = ?';
      params.push(options.source);
    }

    query += ' ORDER BY published_at DESC';

    if (options?.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }

    const stmt = db.prepare(query);
    const rows = stmt.all(...params) as any[];

    return rows.map(row => ({
      id: row.id,
      title: row.title,
      summary: row.summary,
      url: row.url,
      source: row.source,
      sourceLogo: row.source_logo,
      sourceType: row.source_type,
      publishedAt: row.published_at,
      scrapedAt: row.scraped_at,
      author: row.author,
      imageUrl: row.image_url,
      tags: row.tags ? JSON.parse(row.tags) : [],
      qualityScore: row.quality_score,
    }));
  } catch (error: any) {
    console.error('Error getting from local DB:', error);
    return [];
  }
}

/**
 * Get database statistics
 */
export function getLocalDBStats() {
  try {
    const totalResult = db.prepare('SELECT COUNT(*) as count FROM articles').get() as any;
    const recentResult = db.prepare(`
      SELECT COUNT(*) as count FROM articles 
      WHERE datetime(published_at) > datetime('now', '-7 days')
    `).get() as any;
    
    const sourcesResult = db.prepare(`
      SELECT source, COUNT(*) as count 
      FROM articles 
      GROUP BY source 
      ORDER BY count DESC
    `).all() as any[];

    const avgScoreResult = db.prepare('SELECT AVG(quality_score) as avg FROM articles').get() as any;

    return {
      total: totalResult.count,
      recent: recentResult.count,
      sources: sourcesResult,
      avgScore: avgScoreResult.avg || 0,
    };
  } catch (error) {
    console.error('Error getting DB stats:', error);
    return { total: 0, recent: 0, sources: [], avgScore: 0 };
  }
}

/**
 * Delete old articles (cleanup)
 */
export function deleteOldArticlesLocal(daysOld: number = 30): number {
  try {
    const result = db.prepare(`
      DELETE FROM articles 
      WHERE datetime(published_at) < datetime('now', '-' || ? || ' days')
    `).run(daysOld);

    console.log(`🗑️ Deleted ${result.changes} old articles`);
    return result.changes;
  } catch (error) {
    console.error('Error deleting old articles:', error);
    return 0;
  }
}

export default db;

