const { Client } = require('pg');
const fs = require('fs');

async function runMigration() {
  console.log('🚀 Starting database migration...\n');

  // Read the migration SQL
  const sql = fs.readFileSync('supabase/MISSING_FEATURES_SCHEMA.sql', 'utf8');
  
  // Connection string from .env.local
  const connectionString = 'postgresql://postgres:protei@db.dptkbsqxxtjuyksucnky.supabase.co:5432/postgres';
  
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('�� Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');

    console.log('📊 Running migration SQL...');
    console.log('   (This may take 30-60 seconds)\n');
    
    await client.query(sql);
    
    console.log('✅ Migration completed successfully!\n');
    
    // Verify tables created
    console.log('🔍 Verifying tables...');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN (
          'user_sources', 'trend_detection', 'keyword_mentions',
          'voice_training_samples', 'newsletter_drafts', 'draft_feedback',
          'learning_insights', 'engagement_analytics', 'analytics_summary',
          'delivery_schedules'
        )
      ORDER BY table_name;
    `);
    
    console.log(`\n✅ Created ${result.rows.length} tables:`);
    result.rows.forEach(row => {
      console.log(`   ✅ ${row.table_name}`);
    });
    
    console.log('\n🎉 Database migration complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Add SUPABASE_SERVICE_ROLE_KEY to .env.local');
    console.log('   2. Restart server: npm run dev');
    console.log('   3. Try voice training again!\n');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('   - Check database connection string');
    console.error('   - Verify database password is correct');
    console.error('   - Check network connection');
    console.error('   - Try running SQL manually in Supabase dashboard\n');
  } finally {
    await client.end();
  }
}

runMigration();
