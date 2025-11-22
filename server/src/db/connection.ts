import { Pool, PoolClient } from 'pg';

const DATABASE_URL =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.POSTGRES_USER || 'sc_user'}:${
    process.env.POSTGRES_PASSWORD || 'sc_password'
  }@${process.env.POSTGRES_HOST || 'localhost'}:${
    process.env.POSTGRES_PORT || 5432
  }/${process.env.POSTGRES_DB || 'sc_server'}`;

const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
});

export async function getConnection(): Promise<PoolClient> {
  return pool.connect();
}

export async function query(text: string, values?: unknown[]) {
  return pool.query(text, values);
}

export async function close(): Promise<void> {
  await pool.end();
}

export { pool };
