import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import path from "path";
import fs from "fs";
import { registerRoutes } from "./routes";
import { setupVite, log } from "./vite";
import { setupProduction } from "./production";

// Add process-level error handlers to prevent crashes
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit the process, just log the error
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log the error
});

const app = express();
const isProduction = false; // Force development mode for proper React app loading

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add cache-busting headers to prevent stale content
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Mount static files before any other middleware
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path, stat) => {
    if (stat.size > 1024 * 1024) {
      res.setHeader('Content-Type', 'video/mp4');
    }
  },
}));

// Serve static files from uploads directory with proper MIME types
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path, stat) => {
    // Set video MIME type for large files (likely videos)
    if (stat.size > 1024 * 1024) {
      res.setHeader('Content-Type', 'video/mp4');
    } else if (path.endsWith('.mp4')) {
      res.setHeader('Content-Type', 'video/mp4');
    } else if (path.endsWith('.mov')) {
      res.setHeader('Content-Type', 'video/quicktime');
    } else if (path.endsWith('.webm')) {
      res.setHeader('Content-Type', 'video/webm');
    } else if (path.endsWith('.avi')) {
      res.setHeader('Content-Type', 'video/x-msvideo');
    }
    // Enable range requests for video streaming
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }
}));

// Serve assets (logos, etc.)
app.use('/assets', express.static('client/src/assets'));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Add process error handlers to prevent crashes
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit the process
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process
});

(async () => {
  try {
    // Register API routes FIRST, which creates and returns the HTTP server
    const server = await registerRoutes(app);
    console.log('✅ API routes registered');
    
    if (isProduction) {
      // Production: Serve built static files
      const productionReady = setupProduction(app);
      if (!productionReady) {
        console.log('⚠️ Production build not found, falling back to development mode');
        // Setup Vite development server as fallback
        await setupVite(app, server);
        console.log('✅ Running in fallback development mode');
      }
    } else {
      // Development: Setup Vite development server
      await setupVite(app, server);
      console.log('✅ Running in development mode with Vite server');
    }

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error('Server error:', err);
      
      // Ensure response is sent if not already sent
      if (!res.headersSent) {
        res.status(status).json({ message });
      }
      // Don't re-throw the error to prevent crashes
    });

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
