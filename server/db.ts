import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure Neon for better connection handling
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineConnect = false;
neonConfig.subtls = undefined;
neonConfig.wsProxy = undefined;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Enhanced pool configuration for Replit environment
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 5, // Reduced pool size for stability
  idleTimeoutMillis: 60000, // Increased idle timeout
  connectionTimeoutMillis: 10000, // Increased connection timeout
  allowExitOnIdle: true
});

// Enhanced error handling with reconnection logic
pool.on('error', (err: any) => {
  console.error('Database pool error:', err.message);
  if (err.code === 'XX000' || err.message?.includes('Control plane')) {
    console.log('Control plane error detected, will retry on next connection...');
  }
});

pool.on('connect', (client) => {
  console.log('Database connected successfully');
});

pool.on('remove', (client) => {
  console.log('Database connection removed from pool');
});

// Create database instance with enhanced error handling
export const db = drizzle({ client: pool, schema });

// Add health check function
export async function checkDatabaseHealth() {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  try {
    await pool.end();
    console.log('Database pool closed gracefully');
  } catch (error) {
    console.error('Error closing database pool:', error);
  }
});