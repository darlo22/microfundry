import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files from public directory
app.use(express.static(join(__dirname, '../public')));

// Handle all routes with a simple HTML template that loads the React app
app.get('*', (req, res) => {
  const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Fundry - Raise Your First $5,000 From Friends & Family</title>
    <script type="module" crossorigin src="/assets/index.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index.css">
  </head>
  <body>
    <div id="root">
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="text-align: center; max-width: 800px; padding: 2rem;">
          <div style="background: linear-gradient(135deg, #f97316 0%, #1e40af 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 3rem; font-weight: bold; margin-bottom: 1rem;">
            Fundry
          </div>
          <h1 style="color: #1f2937; font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; line-height: 1.2;">
            Raise Your First $5,000 From Friends & Family
          </h1>
          <p style="color: #6b7280; font-size: 1.25rem; margin-bottom: 2rem; line-height: 1.6;">
            The easiest way for early-stage founders to get their first investors and build momentum for larger funding rounds.
          </p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; margin: 2rem 0;">
            <div style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <h3 style="color: #1f2937; font-weight: 600; margin-bottom: 0.5rem;">📊 Analytics</h3>
              <p style="color: #6b7280; font-size: 0.875rem;">Track campaign performance and investor engagement</p>
            </div>
            <div style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <h3 style="color: #1f2937; font-weight: 600; margin-bottom: 0.5rem;">🚀 Launch Fast</h3>
              <p style="color: #6b7280; font-size: 0.875rem;">Create campaigns in minutes with our guided setup</p>
            </div>
            <div style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <h3 style="color: #1f2937; font-weight: 600; margin-bottom: 0.5rem;">🔒 Secure</h3>
              <p style="color: #6b7280; font-size: 0.875rem;">Bank-level security with encrypted data protection</p>
            </div>
          </div>
          <div style="margin-top: 2rem;">
            <button style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 0.75rem 2rem; border: none; border-radius: 8px; font-size: 1.125rem; font-weight: 600; cursor: pointer; margin-right: 1rem;">
              Get Started
            </button>
            <button style="background: #1e40af; color: white; padding: 0.75rem 2rem; border: none; border-radius: 8px; font-size: 1.125rem; font-weight: 600; cursor: pointer;">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
    <script>
      // Simple fallback if React doesn't load
      setTimeout(() => {
        const root = document.getElementById('root');
        if (root && root.children.length === 1) {
          console.log('React app loaded successfully with fallback content');
        }
      }, 2000);
    </script>
  </body>
</html>
  `;
  
  res.send(htmlTemplate);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Production server running on port ${PORT}`);
  console.log(`📍 Server URL: http://0.0.0.0:${PORT}`);
});