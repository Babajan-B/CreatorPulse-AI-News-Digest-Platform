/**
 * Database Setup Script for CreatorPulse
 * 
 * This script creates the database schema in Supabase
 * Run with: npx tsx scripts/setup-database.ts
 */

import { Client } from 'pg';
import fs from 'fs/promises';
import path from 'path';

const DATABASE_URL = 'postgresql://postgres:proteins123@db.ctyfqincrtzvrnrglnpw.supabase.co:5432/postgres';

async function setupDatabase() {
  const client = new Client({
    connectionString: DATABASE_URL,
  });

  try {
    console.log('🔗 Connecting to Supabase database...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Read schema file
    const schemaPath = path.join(process.cwd(), 'supabase', 'schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf-8');

    console.log('📋 Executing database schema...\n');

    // Execute the schema
    await client.query(schema);

    console.log('✅ Database schema created successfully!\n');

    // Verify tables were created
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('📊 Created tables:');
    tablesResult.rows.forEach((row) => {
      console.log(`  ✓ ${row.table_name}`);
    });

    console.log('\n🎉 Database setup complete!');
    console.log('\nNext steps:');
    console.log('  1. Start your Next.js app: npm run dev');
    console.log('  2. Visit http://localhost:3000');
    console.log('  3. Articles will be automatically saved to database');

  } catch (error: any) {
    console.error('❌ Error setting up database:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Check your DATABASE_URL is correct');
    console.error('  2. Ensure Supabase project is active');
    console.error('  3. Verify database connection settings');
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupDatabase();

