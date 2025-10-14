// Quick test to check what's failing
const fetch = require('node-fetch');

async function test() {
  console.log('Testing voice training API...\n');
  
  // First login
  console.log('1. Logging in...');
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'bioinfo.pacer@gmail.com',
      password: 'your_password_here' // Replace with actual password
    })
  });
  
  const loginData = await loginRes.json();
  console.log('Login response:', loginData);
  
  if (!loginData.success) {
    console.log('❌ Login failed. Please update password in script.');
    return;
  }
  
  // Get cookie
  const cookie = loginRes.headers.get('set-cookie');
  console.log('\n2. Got auth cookie');
  
  // Test voice training status
  console.log('\n3. Checking voice training status...');
  const statusRes = await fetch('http://localhost:3000/api/voice-training', {
    headers: { 'Cookie': cookie }
  });
  
  const statusData = await statusRes.json();
  console.log('Status response:', JSON.stringify(statusData, null, 2));
  
  if (statusData.error) {
    console.log('\n❌ Error:', statusData.error);
  } else {
    console.log('\n✅ Voice training API working!');
    console.log('Trained:', statusData.trained);
    console.log('Samples:', statusData.sample_count);
  }
}

test().catch(console.error);
