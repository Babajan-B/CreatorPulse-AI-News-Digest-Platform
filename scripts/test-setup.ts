/**
 * Setup Verification Script
 * Tests all environment variables and API endpoints
 */

import { supabase as supabaseClient } from '../lib/supabase';
import { testGroq } from '../lib/llm-service';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
}

const results: TestResult[] = [];

function log(result: TestResult) {
  results.push(result);
  const icon = result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️' : '❌';
  console.log(`${icon} ${result.name}: ${result.message}`);
}

async function testEnvironmentVariables() {
  console.log('\n🔍 Testing Environment Variables...\n');

  // Required variables
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'JWT_SECRET',
    'GROQ_API_KEY',
    'MAILERSEND_API_KEY',
    'MAILERSEND_FROM_EMAIL',
    'ENCRYPTION_PASSWORD'
  ];

  for (const varName of required) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      log({
        name: varName,
        status: 'fail',
        message: 'Missing or empty'
      });
    } else {
      log({
        name: varName,
        status: 'pass',
        message: 'Configured'
      });
    }
  }

  // Optional variables
  const optional = [
    'TWITTER_BEARER_TOKEN',
    'YOUTUBE_API_KEY',
    'MAILERSEND_WEBHOOK_SECRET',
    'CRON_SECRET_TOKEN',
    'TWILIO_ACCOUNT_SID'
  ];

  for (const varName of optional) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      log({
        name: varName,
        status: 'warn',
        message: 'Optional - Not configured'
      });
    } else {
      log({
        name: varName,
        status: 'pass',
        message: 'Configured (optional)'
      });
    }
  }
}

async function testDatabaseConnection() {
  console.log('\n🗄️  Testing Database Connection...\n');

  try {
    const { data, error } = await supabaseClient
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      log({
        name: 'Database Connection',
        status: 'fail',
        message: `Error: ${error.message}`
      });
    } else {
      log({
        name: 'Database Connection',
        status: 'pass',
        message: 'Connected successfully'
      });
    }
  } catch (error: any) {
    log({
      name: 'Database Connection',
      status: 'fail',
      message: `Exception: ${error.message}`
    });
  }
}

async function testDatabaseTables() {
  console.log('\n📊 Testing Database Tables...\n');

  const tables = [
    'users',
    'user_settings',
    'feed_items',
    'user_sources',
    'trend_detection',
    'voice_training_samples',
    'newsletter_drafts',
    'draft_feedback',
    'engagement_analytics',
    'analytics_summary'
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabaseClient
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        log({
          name: `Table: ${table}`,
          status: 'fail',
          message: `Error: ${error.message}`
        });
      } else {
        log({
          name: `Table: ${table}`,
          status: 'pass',
          message: 'Table exists'
        });
      }
    } catch (error: any) {
      log({
        name: `Table: ${table}`,
        status: 'fail',
        message: `Exception: ${error.message}`
      });
    }
  }
}

async function testGroqAPI() {
  console.log('\n🤖 Testing Groq LLM API...\n');

  try {
    const result = await testGroq();
    if (result.success) {
      log({
        name: 'Groq API',
        status: 'pass',
        message: `Connected: ${result.message.substring(0, 50)}...`
      });
    } else {
      log({
        name: 'Groq API',
        status: 'fail',
        message: result.message
      });
    }
  } catch (error: any) {
    log({
      name: 'Groq API',
        status: 'fail',
        message: `Exception: ${error.message}`
    });
  }
}

async function testMailerSend() {
  console.log('\n📧 Testing MailerSend Configuration...\n');

  const apiKey = process.env.MAILERSEND_API_KEY;
  const fromEmail = process.env.MAILERSEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    log({
      name: 'MailerSend',
      status: 'fail',
      message: 'API key or from email not configured'
    });
    return;
  }

  // Just verify configuration, don't actually send
  log({
    name: 'MailerSend Config',
    status: 'pass',
    message: `From: ${fromEmail}`
  });
}

async function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 SETUP VERIFICATION SUMMARY');
  console.log('='.repeat(60) + '\n');

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warnings = results.filter(r => r.status === 'warn').length;

  console.log(`✅ Passed:   ${passed}`);
  console.log(`❌ Failed:   ${failed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`📝 Total:    ${results.length}\n`);

  if (failed === 0) {
    console.log('🎉 Setup verification complete! All required tests passed.');
    console.log('✨ You\'re ready to start using CreatorPulse!\n');
    console.log('Next steps:');
    console.log('1. Train your voice with 20+ newsletter samples');
    console.log('2. Add custom sources (Twitter, YouTube, RSS)');
    console.log('3. Generate your first draft');
    console.log('4. Review and send!\n');
  } else {
    console.log('❌ Setup incomplete. Please fix the failures above.');
    console.log('📖 See SETUP_INSTRUCTIONS.md for detailed setup guide.\n');

    // Print failed tests
    const failedTests = results.filter(r => r.status === 'fail');
    if (failedTests.length > 0) {
      console.log('Failed tests:');
      failedTests.forEach(test => {
        console.log(`  - ${test.name}: ${test.message}`);
      });
      console.log();
    }
  }

  if (warnings > 0) {
    console.log('⚠️  Optional features not configured:');
    const warnTests = results.filter(r => r.status === 'warn');
    warnTests.forEach(test => {
      console.log(`  - ${test.name}`);
    });
    console.log();
  }
}

async function main() {
  console.log('\n🚀 CreatorPulse - Setup Verification\n');
  console.log('Testing your configuration...\n');

  await testEnvironmentVariables();
  await testDatabaseConnection();
  await testDatabaseTables();
  await testGroqAPI();
  await testMailerSend();
  await printSummary();

  process.exit(0);
}

main().catch(error => {
  console.error('\n❌ Setup verification failed:', error);
  process.exit(1);
});




