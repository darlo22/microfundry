import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Add proper MIME type for TypeScript files before static middleware
app.use((req, res, next) => {
  if (req.path.endsWith('.tsx') || req.path.endsWith('.ts')) {
    res.type('application/javascript');
  }
  next();
});

// Serve static files from root directory for simple frontend
app.use(express.static(path.join(__dirname, "..")));

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

app.listen(PORT, () => {
  console.log(`[express] serving on port ${PORT}`);
});