
import fetch from 'node-fetch';

async function test() {
  try {
    console.log('Testing /api/health...');
    const resHealth = await fetch('http://localhost:3000/api/health');
    const dataHealth = await resHealth.json();
    console.log('Health check response:', dataHealth);

    console.log('Testing /api/register (POST)...');
    const resReg = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email: 'test@example.com', password: 'password' })
    });
    console.log('Register status:', resReg.status);
    const dataReg = await resReg.json();
    console.log('Register response:', dataReg);

    console.log('Testing /api/login (POST) again...');
    const resLogin = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password' })
    });
    console.log('Login status:', resLogin.status);
    const dataLogin = await resLogin.json();
    console.log('Login response:', dataLogin);
  } catch (err) {
    console.error('Test failed:', err);
  }
}

test();
