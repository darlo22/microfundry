import dotenv from "dotenv";
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import path from "path";

function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logger middleware
app.use((req, _res, next) => {
  log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Serve static files from uploads directory with proper MIME types
app.use(
  "/uploads",
  express.static("uploads", {
    setHeaders: (res, path, stat) => {
      if (stat.size > 1024 * 1024) {
        res.setHeader("Content-Type", "video/mp4");
      } else if (path.endsWith(".mp4")) {
        res.setHeader("Content-Type", "video/mp4");
      } else if (path.endsWith(".mov")) {
        res.setHeader("Content-Type", "video/quicktime");
      } else if (path.endsWith(".webm")) {
        res.setHeader("Content-Type", "video/webm");
      } else if (path.endsWith(".avi")) {
        res.setHeader("Content-Type", "video/x-msvideo");
      }
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Cache-Control", "public, max-age=3600");
    },
  })
);

// Serve assets (logos, etc.)
app.use("/assets", express.static("client/src/assets"));

// JSON response logger for /api routes
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    const start = Date.now();
    let capturedJsonResponse: Record<string, any> | undefined;

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      capturedJsonResponse = body;
      return originalJson(body);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      let logLine = `${req.method} ${req.path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        const jsonStr = JSON.stringify(capturedJsonResponse);
        logLine += ` :: ${jsonStr.length > 80 ? jsonStr.slice(0, 79) + "…" : jsonStr}`;
      }
      log(logLine);
    });
  }
  next();
});

(async () => {
  try {
    const server = await registerRoutes(app);

    // Error handler middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error("Server error:", err);
      if (!res.headersSent) {
        res.status(status).json({ message });
      }
    });

    // Serve React app for non-api and non-uploads requests
    app.use(express.static("."));
    app.get("*", (req, res) => {
      if (!req.path.startsWith("/api") && !req.path.startsWith("/uploads")) {
        res.sendFile(path.join(process.cwd(), "index.html"));
      }
    });

    const port = process.env.PORT ? Number(process.env.PORT) : 5000;

    server.listen(
      {
        port,
        host: "0.0.0.0",
        reusePort: true,
      },
      () => {
        log(`serving on port ${port}`);
      }
    );

    server.on("error", (error) => {
      console.error("Server error:", error);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
})();

export default app;
