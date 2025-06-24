// Simple server startup script to bypass vite.config.ts issues
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

process.env.NODE_ENV = 'development';

// Start the server directly
const serverProcess = spawn('node', [
  '--loader', 'tsx/esm',
  resolve(__dirname, 'server/index.ts')
], {
  stdio: 'inherit',
  env: { ...process.env }
});

serverProcess.on('error', (error) => {
  console.error('Failed to start server:', error);
});

serverProcess.on('exit', (code) => {
  console.log(`Server process exited with code ${code}`);
});