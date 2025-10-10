/**
 * Test Supabase Client Connection
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dptkbsqxxtjuyksucnky.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwdGtic3F4eHRqdXlrc3Vjbmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMzIwNDQsImV4cCI6MjA3NTYwODA0NH0.ZxRfS0hk_eVTjJXdcl5KRyhCzodxuHrKEFG68MUSXmE';

console.log('🔗 Testing Supabase client connection...');
console.log(`URL: ${supabaseUrl}\n`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  try {
    // Test 1: Check if we can query (will fail if no tables, but connection works)
    console.log('Test 1: Checking connection...');
    const { data, error } = await supabase
      .from('_unknown_table_test_')
      .select('*')
      .limit(1);

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('✅ Connection successful! (No tables yet, but connection works)\n');
        
        // Test 2: Try to list tables
        console.log('Test 2: Checking for existing tables...');
        const { data: tables, error: tablesError } = await supabase
          .rpc('exec_sql', {
            query: `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;`
          });

        if (tablesError) {
          console.log('ℹ️  Cannot list tables (function not available)');
          console.log('   This is normal - we\'ll create tables next\n');
        } else if (tables) {
          console.log(`📋 Found ${tables.length} existing tables`);
          console.log(tables);
        }

        console.log('\n✅ Supabase connection is WORKING!');
        console.log('\nNext step: Create database tables');
        console.log('Run: npm run db:setup\n');
        return true;
      } else {
        console.log('❌ Unexpected error:', error.message);
        return false;
      }
    }

    console.log('✅ Connection successful!');
    return true;

  } catch (err: any) {
    console.log('❌ Connection failed:', err.message);
    console.log('\nPossible issues:');
    console.log('  1. Check if Supabase project exists');
    console.log('  2. Verify project reference (dptkbsqxxtjuyksucnky)');
    console.log('  3. Check API key is correct');
    console.log('  4. Ensure project is not paused');
    return false;
  }
}

test();

