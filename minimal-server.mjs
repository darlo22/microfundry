import express from 'express';
import { createServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Start Vite dev server
const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'spa',
  root: process.cwd(),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@assets': path.resolve(__dirname, 'attached_assets'),
    }
  }
});

app.use(vite.middlewares);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const port = 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Fundry server running on http://localhost:${port}`);
});