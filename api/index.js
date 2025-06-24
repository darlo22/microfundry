const express = require('express');
const { createServer } = require('http');
const { nanoid } = require('nanoid');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static landing page for root requests
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
        <title>Fundry - Equity Crowdfunding Platform</title>
        <style>
          body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
          .container { display: flex; justify-content: center; align-items: center; height: 100vh; background: linear-gradient(135deg, #f97316 0%, #1e40af 100%); }
          .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); text-align: center; max-width: 400px; }
          .logo { color: #f97316; font-size: 48px; font-weight: bold; margin-bottom: 16px; }
          .subtitle { color: #64748b; margin-bottom: 24px; }
          .btn { background: #f97316; color: white; padding: 12px 24px; border: none; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-block; cursor: pointer; transition: background-color 0.2s; }
          .btn:hover { background: #ea580c; }
          .features { text-align: left; margin-top: 24px; }
          .feature { display: flex; align-items: center; margin-bottom: 8px; color: #64748b; font-size: 14px; }
          .feature-icon { color: #f97316; margin-right: 8px; font-weight: bold; }
          .notice { margin-top: 24px; padding: 16px; background: #fee2e2; border-radius: 8px; color: #dc2626; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="logo">Fundry</div>
            <p class="subtitle">Equity Crowdfunding Platform</p>
            <div class="features">
              <div class="feature">
                <span class="feature-icon">✓</span>
                Create fundraising campaigns
              </div>
              <div class="feature">
                <span class="feature-icon">✓</span>
                Connect with investors
              </div>
              <div class="feature">
                <span class="feature-icon">✓</span>
                Secure SAFE agreements
              </div>
            </div>
            <div class="notice">
              <strong>Status:</strong> Full platform operational on Replit with comprehensive $100,000 maximum campaign goal enforcement across all endpoints.
            </div>
            <a href="https://micro-fundry-darlington2.replit.app" class="btn" style="margin-top: 24px;">Access Full Platform</a>
          </div>
        </div>
      </body>
    </html>
  `);
});

// Default API response
app.get('/api/*', (req, res) => {
  res.status(200).json({ 
    message: 'Fundry API - Limited deployment version',
    fullPlatform: 'https://micro-fundry-darlington2.replit.app'
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Fundry deployment server running on port ${port}`);
});

module.exports = app;