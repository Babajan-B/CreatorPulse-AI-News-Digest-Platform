/**
 * Test Database Connection
 */

import { Client } from 'pg';

// Supabase connection from environment variables
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Supabase
  },
});

async function testConnection() {
  try {
    console.log('🔗 Testing connection to Supabase...');
    console.log('Using DATABASE_URL from environment variables\n');

    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Test query
    const result = await client.query('SELECT NOW() as current_time, version()');
    console.log('📊 Database info:');
    console.log('  Time:', result.rows[0].current_time);
    console.log('  Version:', result.rows[0].version.split('on')[0].trim());

    // Check existing tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log(`\n📋 Existing tables (${tablesResult.rows.length}):`);
    if (tablesResult.rows.length > 0) {
      tablesResult.rows.forEach((row) => {
        console.log(`  ✓ ${row.table_name}`);
      });
    } else {
      console.log('  (No tables yet - run setup-database.ts to create them)');
    }

    console.log('\n✅ Connection test successful!');
    console.log('\nNext: Run setup-database.ts to create tables');

  } catch (error: any) {
    console.error('❌ Connection failed:', error.message);
    console.error('\nDetails:', error);
  } finally {
    await client.end();
  }
}

testConnection();

