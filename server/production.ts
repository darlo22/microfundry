import express, { type Express } from "express";
import path from "path";
import fs from "fs";

export function setupProduction(app: Express) {
  const distPath = path.resolve(process.cwd(), 'dist');
  const clientPath = path.resolve(distPath, 'client');
  
  // Check if production build exists
  if (!fs.existsSync(clientPath)) {
    console.log('⚠️ Production build not found at dist/client');
    return false;
  }
  
  // Serve static files from dist/client
  app.use(express.static(clientPath, {
    maxAge: '1y',
    etag: true,
    lastModified: true
  }));
  
  // Fallback route for client-side routing (SPA)
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ message: 'API endpoint not found' });
    }
    
    const indexPath = path.join(clientPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(500).send('Production build corrupted. Please rebuild the application.');
    }
  });
  
  console.log('✅ Serving production build from dist/client');
  return true;
}