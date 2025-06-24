// Direct server startup bypassing vite config issues
import { execSync } from 'child_process';

process.env.NODE_ENV = 'development';

try {
  execSync('npx tsx server/index.ts', { 
    stdio: 'inherit',
    cwd: '/home/runner/workspace'
  });
} catch (error) {
  console.error('Server startup failed:', error);
}