const fetch = require('node-fetch'); // we can just use native fetch in node 18+

async function test() {
  try {
    const res = await fetch('http://localhost:5001/api/admin/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Admin',
        email: 'testadmin@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      })
    });
    const data = await res.json();
    console.log(res.status, data);
  } catch(e) {
    console.error(e);
  }
}
test();
