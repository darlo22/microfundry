// Quick test to check if deployment is working
import https from 'https';

const url = 'https://micro-fundry-darlington2.replit.app';

https.get(url, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Deployment is working!');
      console.log('Response contains HTML:', data.includes('<html>'));
      console.log('Response contains React app:', data.includes('div id="root"'));
    } else {
      console.log('❌ Deployment error');
      console.log('Response:', data);
    }
  });
}).on('error', (err) => {
  console.log('❌ Request failed:', err.message);
});