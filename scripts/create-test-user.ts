/**
 * Create Test User in Supabase
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = 'https://dptkbsqxxtjuyksucnky.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwdGtic3F4eHRqdXlrc3Vjbmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMzIwNDQsImV4cCI6MjA3NTYwODA0NH0.ZxRfS0hk_eVTjJXdcl5KRyhCzodxuHrKEFG68MUSXmE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
  console.log('🔗 Creating test user in Supabase...\n');

  try {
    const testEmail = 'test@creatorpulse.com';
    const testPassword = 'test123456';
    const testName = 'Test User';

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', testEmail)
      .single();

    if (existingUser) {
      console.log('ℹ️  Test user already exists');
      console.log('   Email:', testEmail);
      console.log('   Password:', testPassword);
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(testPassword, 10);

    // Create user
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        email: testEmail,
        name: testName,
        password_hash: passwordHash,
        email_verified: true,
        is_active: true,
      })
      .select()
      .single();

    if (userError) {
      console.error('❌ Error creating user:', userError);
      return;
    }

    console.log('✅ Test user created successfully!\n');
    console.log('User details:');
    console.log('  ID:', newUser.id);
    console.log('  Email:', newUser.email);
    console.log('  Name:', newUser.name);

    // Create user settings
    const { error: settingsError } = await supabase
      .from('user_settings')
      .insert({
        user_id: newUser.id,
        timezone: 'America/New_York',
        digest_time: '09:00:00',
        max_items_per_digest: 10,
        auto_send_email: true,
        email_notifications: true,
      });

    if (settingsError) {
      console.error('\n⚠️  Error creating settings:', settingsError);
    } else {
      console.log('\n✅ User settings created');
      console.log('  Daily digest time: 9:00 AM');
      console.log('  Timezone: America/New_York');
      console.log('  Auto email: Enabled');
    }

    console.log('\n🎉 Setup complete!');
    console.log('\nLogin credentials:');
    console.log('  📧 Email:', testEmail);
    console.log('  🔒 Password:', testPassword);
    console.log('\nYou can now login at: http://localhost:3000/login');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTestUser();

