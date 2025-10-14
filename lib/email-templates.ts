/**
 * Email Templates for CreatorPulse
 */

interface DigestArticle {
  title: string;
  aiSummary: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  bulletPoints?: string[];
  hashtags?: string[];
}

interface DigestEmailOptions {
  mode?: 'ai_news' | 'science_breakthrough';
  userName: string;
  articles: DigestArticle[];
}

/**
 * Generate daily digest email HTML (legacy function)
 */
export function generateDailyDigestEmail(articles: DigestArticle[], userName: string) {
  return generateDualModeDigestEmail({
    articles,
    userName,
    mode: 'ai_news'
  });
}

/**
 * Generate dual-mode digest email HTML
 */
export function generateDualModeDigestEmail(options: DigestEmailOptions) {
  const { articles, userName, mode = 'ai_news' } = options;
  
  // Mode-specific styling and content
  const modeConfig = {
    ai_news: {
      title: 'AI News Digest',
      icon: '🧠',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      accentColor: '#667eea',
      summaryLabel: '📝 AI Summary'
    },
    science_breakthrough: {
      title: 'Science Breakthrough Digest',
      icon: '🔬',
      gradient: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
      accentColor: '#48bb78',
      summaryLabel: '🔬 Research Summary'
    }
  };
  
  const config = modeConfig[mode];
  
  const articlesHtml = articles.map((article, index) => `
    <div style="margin-bottom: 40px; padding-bottom: 32px; border-bottom: 1px solid #e2e8f0;">
      <!-- Article Number -->
      <div style="display: inline-block; background: ${config.gradient}; color: white; padding: 6px 14px; border-radius: 6px; font-weight: 600; font-size: 14px; margin-bottom: 16px;">
        ${config.icon} Article ${index + 1} of ${articles.length}
      </div>
      
      <!-- Title -->
      <h2 style="margin: 16px 0 12px 0; color: #1a1a1a; font-size: 22px; font-weight: 700; line-height: 1.4;">
        ${article.title}
      </h2>
      
      <!-- Source & Date -->
      <div style="margin-bottom: 16px; color: #718096; font-size: 13px;">
        <strong style="color: ${config.accentColor};">${article.source}</strong> • ${new Date(article.publishedAt).toLocaleDateString()}
      </div>
      
      <!-- AI/Research Summary -->
      <div style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border-left: 4px solid ${config.accentColor}; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <h3 style="margin: 0 0 12px 0; color: #2d3748; font-size: 16px; font-weight: 600;">
          ${config.summaryLabel}
        </h3>
        <p style="margin: 0; color: #4a5568; font-size: 15px; line-height: 1.7;">
          ${article.aiSummary}
        </p>
      </div>
      
      <!-- Key Points (if available) -->
      ${article.bulletPoints && article.bulletPoints.length > 0 ? `
        <div style="background: #fff5f5; border-left: 4px solid #f56565; padding: 16px; margin: 16px 0; border-radius: 8px;">
          <h4 style="margin: 0 0 12px 0; color: #2d3748; font-size: 14px; font-weight: 600;">
            🔑 Key Points
          </h4>
          <ul style="margin: 0; padding-left: 20px; color: #4a5568; font-size: 14px; line-height: 1.6;">
            ${article.bulletPoints.map(point => `<li style="margin-bottom: 4px;">${point}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      <!-- Full Summary (max 300 words) -->
      <div style="margin: 20px 0;">
        <h3 style="margin: 0 0 12px 0; color: #2d3748; font-size: 16px; font-weight: 600;">
          📄 Full Summary
        </h3>
        <p style="margin: 0; color: #4a5568; font-size: 14px; line-height: 1.7;">
          ${article.summary.substring(0, 1000)}${article.summary.length > 1000 ? '...' : ''}
        </p>
      </div>
      
      <!-- Read More Button -->
      <div style="text-align: center; margin-top: 24px;">
        <a href="${article.url}" 
           style="display: inline-block; 
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                  color: white; 
                  text-decoration: none; 
                  padding: 12px 32px; 
                  border-radius: 6px; 
                  font-weight: 600; 
                  font-size: 14px;
                  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
          Read Full Article →
        </a>
      </div>
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Daily AI News Digest - CreatorPulse</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="650" style="max-width: 650px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: ${config.gradient}; padding: 48px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 38px; font-weight: 700; letter-spacing: -0.5px;">
                ${config.icon} CreatorPulse
              </h1>
              <p style="margin: 12px 0 8px 0; color: rgba(255, 255, 255, 0.95); font-size: 18px; font-weight: 500;">
                Your Daily ${config.title}
              </p>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.85); font-size: 14px;">
                ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="padding: 40px 40px 32px 40px;">
              <h2 style="margin: 0 0 16px 0; color: #1a1a1a; font-size: 26px; font-weight: 700;">
                Good Morning, ${userName}! 👋
              </h2>
              <p style="margin: 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Here are your top <strong>${articles.length} ${mode === 'ai_news' ? 'AI news articles' : 'scientific breakthroughs'}</strong> for today, carefully curated and AI-enhanced just for you.
              </p>
            </td>
          </tr>
          
          <!-- Articles -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              ${articlesHtml}
              
              <!-- View More -->
              <div style="text-align: center; margin-top: 40px; padding-top: 32px; border-top: 2px solid #e2e8f0;">
                <a href="http://localhost:3001" 
                   style="display: inline-block; 
                          background: white;
                          color: #667eea; 
                          text-decoration: none; 
                          padding: 14px 36px; 
                          border: 2px solid #667eea;
                          border-radius: 6px; 
                          font-weight: 600; 
                          font-size: 15px;">
                  View All Articles in CreatorPulse →
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); padding: 32px 40px; border-top: 1px solid #e2e8f0;">
              <div style="text-align: center; margin-bottom: 20px;">
                <p style="margin: 0 0 12px 0; color: #4a5568; font-size: 14px; line-height: 1.6;">
                  <strong>📊 Your Digest Settings:</strong><br>
                  Delivery Time: Daily at your preferred time<br>
                  Sources: 17 Premium AI News Feeds<br>
                  Quality Filter: Only the best articles
                </p>
              </div>
              
              <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0 0 8px 0; color: #a0aec0; font-size: 13px;">
                  Powered by Groq AI • Delivered by MailerSend
                </p>
                <p style="margin: 0; color: #cbd5e0; font-size: 12px;">
                  © 2025 CreatorPulse. All rights reserved.
                </p>
                <p style="margin: 12px 0 0 0;">
                  <a href="http://localhost:3001/settings" style="color: #667eea; text-decoration: none; font-size: 12px;">
                    Update Preferences
                  </a>
                </p>
              </div>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate single article email HTML
 */
export function generateArticleEmail(article: {
  title: string;
  aiSummary: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
}, userName: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${article.title} - CreatorPulse</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">
                ✨ CreatorPulse
              </h1>
              <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                AI News Article
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 28px; font-weight: 700; line-height: 1.3;">
                ${article.title}
              </h2>
              
              <!-- Meta -->
              <div style="margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #718096; font-size: 14px;">
                  <strong style="color: #667eea;">${article.source}</strong> • 
                  ${new Date(article.publishedAt).toLocaleDateString()}
                </p>
              </div>
              
              <!-- AI Summary -->
              <div style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border-left: 4px solid #667eea; padding: 24px; margin: 28px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 12px 0; color: #2d3748; font-size: 18px; font-weight: 600;">
                  📝 AI Summary
                </h3>
                <p style="margin: 0; color: #4a5568; font-size: 16px; line-height: 1.7; font-weight: 500;">
                  ${article.aiSummary}
                </p>
              </div>
              
              <!-- Full Summary -->
              <div style="margin: 28px 0;">
                <h3 style="margin: 0 0 16px 0; color: #2d3748; font-size: 18px; font-weight: 600;">
                  📄 Summary
                </h3>
                <p style="margin: 0; color: #4a5568; font-size: 15px; line-height: 1.8;">
                  ${article.summary}
                </p>
              </div>
              
              <!-- Read More Button -->
              <div style="text-align: center; margin-top: 36px;">
                <a href="${article.url}" 
                   style="display: inline-block; 
                          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          text-decoration: none; 
                          padding: 16px 48px; 
                          border-radius: 8px; 
                          font-weight: 600; 
                          font-size: 16px;
                          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
                  Read Full Article →
                </a>
              </div>
              
              <p style="margin: 32px 0 0 0; padding-top: 28px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 14px; text-align: center; line-height: 1.6;">
                <strong>Shared by CreatorPulse</strong><br>
                Your AI-powered news intelligence platform
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f7fafc; padding: 28px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; color: #a0aec0; font-size: 12px;">
                Powered by Groq AI & MailerSend
              </p>
              <p style="margin: 0; color: #cbd5e0; font-size: 11px;">
                © 2025 CreatorPulse. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate newsletter draft email HTML
 */
export function generateNewsletterDraftEmail(options: {
  draft: any;
  userName: string;
}) {
  const { draft, userName } = options;
  const articles = draft.curated_articles || [];
  const trends = draft.trends_section?.top_3_trends || [];

  // Generate articles HTML
  const articlesHtml = articles.map((article: any, index: number) => `
    <div style="margin-bottom: 40px; padding-bottom: 32px; border-bottom: 1px solid #e2e8f0;">
      <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 6px 14px; border-radius: 6px; font-weight: 600; font-size: 14px; margin-bottom: 16px;">
        📰 Article ${index + 1} of ${articles.length}
      </div>
      
      <h2 style="margin: 16px 0 12px 0; color: #1a1a1a; font-size: 22px; font-weight: 700; line-height: 1.4;">
        ${article.title}
      </h2>
      
      <div style="margin-bottom: 16px; color: #718096; font-size: 13px;">
        <strong style="color: #667eea;">${article.source}</strong>
      </div>
      
      <div style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <p style="margin: 0; color: #4a5568; font-size: 15px; line-height: 1.7;">
          ${article.summary}
        </p>
      </div>
      
      ${article.bullet_points && article.bullet_points.length > 0 ? `
        <div style="background: #fff5f5; border-left: 4px solid #f56565; padding: 16px; margin: 16px 0; border-radius: 8px;">
          <h4 style="margin: 0 0 12px 0; color: #2d3748; font-size: 14px; font-weight: 600;">
            🔑 Key Points
          </h4>
          <ul style="margin: 0; padding-left: 20px; color: #4a5568; font-size: 14px; line-height: 1.6;">
            ${article.bullet_points.map((point: string) => `<li style="margin-bottom: 4px;">${point}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      ${article.commentary ? `
        <div style="background: linear-gradient(135deg, #fef5ff 0%, #f3e8ff 100%); border-left: 4px solid #9f7aea; padding: 16px; margin: 16px 0; border-radius: 8px;">
          <p style="margin: 0; color: #4a5568; font-size: 14px; line-height: 1.6; font-style: italic;">
            💭 ${article.commentary}
          </p>
        </div>
      ` : ''}
      
      <div style="text-align: center; margin-top: 24px;">
        <a href="${article.url}" 
           style="display: inline-block; 
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                  color: white; 
                  text-decoration: none; 
                  padding: 12px 32px; 
                  border-radius: 6px; 
                  font-weight: 600; 
                  font-size: 14px;
                  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
          Read Full Article →
        </a>
      </div>
    </div>
  `).join('');

  // Generate trends HTML
  const trendsHtml = trends.length > 0 ? `
    <div style="background: linear-gradient(135deg, #fff5f7 0%, #fef5ff 100%); border-radius: 12px; padding: 32px; margin: 40px 0;">
      <h3 style="margin: 0 0 24px 0; color: #2d3748; font-size: 24px; font-weight: 700;">
        🔥 Trending Topics to Watch
      </h3>
      <div>
        ${trends.map((trend: any, index: number) => `
          <div style="margin-bottom: 20px; padding-bottom: 20px; ${index < trends.length - 1 ? 'border-bottom: 1px solid #e2e8f0;' : ''}">
            <h4 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 18px; font-weight: 600;">
              ${index + 1}. ${trend.topic}
            </h4>
            <p style="margin: 0; color: #4a5568; font-size: 14px; line-height: 1.6;">
              ${trend.explainer}
            </p>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${draft.title} - CreatorPulse Newsletter</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="650" style="max-width: 650px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 48px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 38px; font-weight: 700; letter-spacing: -0.5px;">
                ✨ CreatorPulse Newsletter
              </h1>
              <p style="margin: 12px 0 8px 0; color: rgba(255, 255, 255, 0.95); font-size: 18px; font-weight: 500;">
                ${draft.title}
              </p>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.85); font-size: 14px;">
                ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </td>
          </tr>
          
          <!-- Introduction -->
          <tr>
            <td style="padding: 40px 40px 32px 40px;">
              <div style="color: #4a5568; font-size: 16px; line-height: 1.7; white-space: pre-wrap;">
                ${draft.content_intro}
              </div>
            </td>
          </tr>
          
          <!-- Trending Topics -->
          ${trendsHtml ? `
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              ${trendsHtml}
            </td>
          </tr>
          ` : ''}
          
          <!-- Articles -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <h3 style="margin: 0 0 24px 0; color: #2d3748; font-size: 24px; font-weight: 700;">
                📚 Today's Top Articles
              </h3>
              ${articlesHtml}
            </td>
          </tr>
          
          <!-- Closing -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <div style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border-radius: 12px; padding: 32px;">
                <div style="color: #4a5568; font-size: 16px; line-height: 1.7; white-space: pre-wrap;">
                  ${draft.closing}
                </div>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); padding: 32px 40px; border-top: 1px solid #e2e8f0;">
              <div style="text-align: center;">
                <p style="margin: 0 0 8px 0; color: #a0aec0; font-size: 13px;">
                  Created with CreatorPulse AI • Delivered by MailerSend
                </p>
                <p style="margin: 0; color: #cbd5e0; font-size: 12px;">
                  © 2025 CreatorPulse. All rights reserved.
                </p>
                <p style="margin: 16px 0 0 0;">
                  <a href="http://localhost:3000" style="color: #667eea; text-decoration: none; font-size: 12px;">
                    Visit CreatorPulse
                  </a>
                </p>
              </div>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

