import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineConnect = false;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  maxUses: 1000,
  allowExitOnIdle: false
});

// Add comprehensive error handling for the pool with retry logic
pool.on('error', (err: any) => {
  console.error('Database pool error:', err);
  // Log specific connection errors for debugging
  if (err.code === '57P01') {
    console.log('Database connection terminated by administrator, pool will retry...');
  }
});

pool.on('connect', (client) => {
  console.log('Database connected successfully');
});

pool.on('remove', (client) => {
  console.log('Database connection removed from pool');
});

// Enhanced database operation wrapper with retry logic
export async function safeDbOperation<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      console.error(`Database operation failed (attempt ${attempt}/${maxRetries}):`, error.code || error.message);
      
      // If it's a connection error, wait before retrying
      if (error.code === '57P01' || error.code === 'ECONNRESET' || error.message?.includes('connection')) {
        if (attempt < maxRetries) {
          const delay = attempt * 1000; // Exponential backoff
          console.log(`Retrying database operation in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      // If it's not a retryable error, throw immediately
      if (!error.code || !['57P01', 'ECONNRESET', 'ECONNREFUSED'].includes(error.code)) {
        throw error;
      }
    }
  }
  
  throw lastError;
}

// Handle process cleanup
process.on('SIGINT', async () => {
  console.log('Closing database pool...');
  try {
    await pool.end();
  } catch (err) {
    console.error('Error closing pool:', err);
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Closing database pool...');
  try {
    await pool.end();
  } catch (err) {
    console.error('Error closing pool:', err);
  }
  process.exit(0);
});

export const db = drizzle({ client: pool, schema });