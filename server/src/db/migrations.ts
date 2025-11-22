import { query } from './connection';

const CREATE_CONTEXTS_TABLE = `
  CREATE TABLE IF NOT EXISTS contexts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uri VARCHAR(255) UNIQUE NOT NULL,
    readme TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

const CREATE_CONTEXT_ENTRIES_TABLE = `
  CREATE TABLE IF NOT EXISTS context_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    context_id UUID NOT NULL REFERENCES contexts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

const CREATE_CONTEXT_ENTRIES_INDEX = `
  CREATE INDEX IF NOT EXISTS
    idx_context_entries_context_id_created_at
  ON context_entries(context_id, created_at);
`;

export async function initializeDb(
  pool: any
): Promise<void> {
  try {
    await query(CREATE_CONTEXTS_TABLE);
    await query(CREATE_CONTEXT_ENTRIES_TABLE);
    await query(CREATE_CONTEXT_ENTRIES_INDEX);
    console.log('Migrations completed successfully');
  } catch (err) {
    console.error('Error running migrations:', err);
    throw err;
  }
}

export async function runMigrations(): Promise<void> {
  return initializeDb(null);
}
