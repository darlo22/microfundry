#!/usr/bin/env node
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.NODE_ENV = 'development';

console.log('Starting Fundry server directly...');

const serverProcess = spawn('npx', ['tsx', path.join(__dirname, 'server/index.ts')], {
  stdio: 'inherit',
  env: { 
    ...process.env,
    NODE_ENV: 'development'
  },
  cwd: __dirname
});

serverProcess.on('error', (error) => {
  console.error('Server startup error:', error);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('Shutting down server...');
  serverProcess.kill();
  process.exit(0);
});