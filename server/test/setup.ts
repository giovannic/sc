/**
 * Test Setup and Utilities
 * Common test helpers and configuration
 */

import { Pool } from 'pg';

/**
 * Create a test database connection pool
 * Uses environment variables or test defaults
 */
export function createTestPool(): Pool {
  return new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'sc_test',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  });
}

/**
 * Helper to clean up database tables
 */
export async function cleanupDatabase(
  pool: Pool,
  tables: string[]
): Promise<void> {
  const client = await pool.connect();
  try {
    for (const table of tables) {
      await client.query(`TRUNCATE TABLE ${table} CASCADE`);
    }
  } finally {
    client.release();
  }
}

/**
 * Helper to close database connection pool
 */
export async function closePool(pool: Pool): Promise<void> {
  await pool.end();
}

/**
 * Create a unique context URI for testing
 */
export function createTestUri(prefix: string = 'test'): string {
  return `${prefix}_${Date.now()}_${Math.random()
    .toString(36)
    .substring(7)}`;
}

/**
 * Parse JSON response from HTTP test
 */
export function parseJSON(text: string): any {
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`Failed to parse JSON: ${text}`);
  }
}
