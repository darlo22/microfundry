#!/usr/bin/env node

import { build } from 'vite';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Starting optimized Fundry production build...');

// Clean previous builds
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true });
}
if (fs.existsSync('client/dist')) {
  fs.rmSync('client/dist', { recursive: true });
}

// Set Node.js memory limit
process.env.NODE_OPTIONS = '--max-old-space-size=8192';

try {
  // Build frontend with Vite programmatically
  console.log('Building frontend...');
  await build({
    mode: 'production',
    build: {
      outDir: 'client/dist',
      minify: 'terser',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-select'],
            charts: ['recharts'],
            forms: ['react-hook-form', '@hookform/resolvers'],
            query: ['@tanstack/react-query']
          }
        }
      }
    }
  });
  
  console.log('Frontend build completed successfully!');
  
  // Build backend
  console.log('Building backend...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --minify', { stdio: 'inherit' });
  
  console.log('Backend build completed successfully!');
  
  // Create production package.json
  const prodPackage = {
    name: 'fundry-production',
    version: '1.0.0',
    type: 'module',
    scripts: {
      start: 'node index.js'
    }
  };
  
  fs.writeFileSync('dist/package.json', JSON.stringify(prodPackage, null, 2));
  
  console.log('✓ Production build completed successfully!');
  console.log('✓ Frontend: client/dist');
  console.log('✓ Backend: dist');
  console.log('✓ Ready for deployment');
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}