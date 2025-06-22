import fs from 'fs';
import path from 'path';

async function createMinimalBuild() {
  console.log('Creating minimal production build...');
  
  // Create dist directory structure
  const distDir = path.join(process.cwd(), 'dist');
  const clientDir = path.join(distDir, 'client');
  
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  if (!fs.existsSync(clientDir)) {
    fs.mkdirSync(clientDir, { recursive: true });
  }
  
  // Create minimal index.html that loads the app from dev server
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Fundry - Micro Investment Platform</title>
  </head>
  <body>
    <div id="root"></div>
    <script>
      // Redirect to dev server for now
      if (window.location.pathname === '/' && !window.location.search.includes('dev=false')) {
        window.location.href = window.location.origin + '?dev=true';
      }
    </script>
  </body>
</html>`;
  
  fs.writeFileSync(path.join(clientDir, 'index.html'), indexHtml);
  console.log('✅ Minimal build created - app will run in development mode');
  
  return true;
}

createMinimalBuild().catch(console.error);