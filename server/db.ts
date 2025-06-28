import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema.js";

neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineConnect = false;

console.log("DATABASE_URL in db.ts:", process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 120000,
  connectionTimeoutMillis: 5000,
  maxUses: 10000,
  allowExitOnIdle: true,
});

pool.on("acquire", () => {
  console.log("Connection acquired");
});

// Add error handling for the pool
pool.on("error", (err) => {
  console.error("Database pool error:", err);
});

pool.on("connect", () => {
  console.log("Database connected");
});

pool.on("remove", () => {
  //console.log('Database connection removed');
});

export const db = drizzle({ client: pool, schema });
