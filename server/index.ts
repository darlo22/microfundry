import express from "express";
import session from "express-session";
import { createServer } from "http";
import passport from "passport";
import path from "path";
import { log, serveStatic, setupVite } from "./vite.js";
import { getStorage } from "./storage.js";
import "./auth.js";
import { setupRoutes } from "./routes.js";
import "./db.js";

const app = express();
const server = createServer(app);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

// Setup routes using the pattern in routes.ts
setupRoutes(app);

if (process.env.NODE_ENV === "production") {
  serveStatic(app);
} else {
  await setupVite(app, server);
}

const port = Number(process.env.PORT) || 5000;
server.listen(port, "0.0.0.0", () => {
  log(`serving on port ${port}`);
});