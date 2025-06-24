import express from "express";
import { registerRoutes } from "./server/routes";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static file serving
app.use('/uploads', express.static('uploads'));
app.use(express.static('.'));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

async function startServer() {
  try {
    const server = await registerRoutes(app);

    // Catch-all for client-side routing
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
        res.sendFile(path.join(process.cwd(), 'index.html'));
      }
    });

    // Error handling
    app.use((err: any, req: any, res: any, next: any) => {
      console.error('Server error:', err);
      if (!res.headersSent) {
        res.status(500).json({ message: "Internal Server Error" });
      }
    });

    const port = 5000;
    server.listen(port, '0.0.0.0', () => {
      console.log(`Fundry server running on port ${port}`);
      console.log(`Database connected successfully`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();