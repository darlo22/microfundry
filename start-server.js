const { spawn } = require('child_process');
const path = require('path');

// Kill any existing processes
const killall = spawn('killall', ['tsx'], { stdio: 'ignore' });
killall.on('close', () => {
  // Start the server
  const server = spawn('tsx', ['server/index.ts'], {
    cwd: process.cwd(),
    env: { ...process.env, NODE_ENV: 'development' },
    stdio: 'inherit'
  });

  server.on('error', (err) => {
    console.error('Server error:', err);
  });

  server.on('close', (code) => {
    console.log(`Server exited with code ${code}`);
  });

  // Keep the process alive
  process.on('SIGINT', () => {
    server.kill();
    process.exit(0);
  });
});