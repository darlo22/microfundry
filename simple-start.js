const { spawn } = require('child_process');

console.log('Starting Fundry server...');

const server = spawn('tsx', ['server-direct.ts'], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
});

server.on('error', (err) => {
  console.error('Server startup error:', err);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

// Keep process alive
process.on('SIGINT', () => {
  server.kill();
  process.exit(0);
});