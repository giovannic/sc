import { query } from './connection';
import { Context, ContextEntry } from '../types/index';

// Context queries
export async function createContext(
  uri: string,
  readme?: string
): Promise<Context> {
  const result = await query(
    `INSERT INTO contexts (uri, readme)
     VALUES ($1, $2)
     RETURNING id, uri, readme, created_at, updated_at`,
    [uri, readme || null]
  );
  return result.rows[0];
}

export async function getContext(
  contextId: string
): Promise<Context | null> {
  const result = await query(
    `SELECT id, uri, readme, created_at, updated_at
     FROM contexts WHERE id = $1`,
    [contextId]
  );
  return result.rows[0] || null;
}

export async function listContexts(
  limit: number,
  offset: number
): Promise<{
  contexts: Context[];
  total: number;
}> {
  const contextResult = await query(
    `SELECT id, uri, readme, created_at, updated_at
     FROM contexts
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  const countResult = await query(
    'SELECT COUNT(*) as count FROM contexts'
  );

  return {
    contexts: contextResult.rows,
    total: parseInt(countResult.rows[0].count, 10),
  };
}

export async function updateContextReadme(
  contextId: string,
  readme: string
): Promise<boolean> {
  const result = await query(
    `UPDATE contexts
     SET readme = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2`,
    [readme, contextId]
  );
  return result.rowCount !== null && result.rowCount > 0;
}

// Context entry queries
export async function addContextEntry(
  contextId: string,
  content: string
): Promise<ContextEntry> {
  const result = await query(
    `INSERT INTO context_entries (context_id, content)
     VALUES ($1, $2)
     RETURNING id, context_id, content, created_at`,
    [contextId, content]
  );
  return result.rows[0];
}

export async function getContextEntries(
  contextId: string,
  order: 'asc' | 'desc',
  limit: number,
  offset: number
): Promise<{
  entries: ContextEntry[];
  total: number;
}> {
  const orderClause = order === 'asc' ? 'ASC' : 'DESC';

  const entriesResult = await query(
    `SELECT id, context_id, content, created_at
     FROM context_entries
     WHERE context_id = $1
     ORDER BY created_at ${orderClause}
     LIMIT $2 OFFSET $3`,
    [contextId, limit, offset]
  );

  const countResult = await query(
    'SELECT COUNT(*) as count FROM context_entries WHERE context_id = $1',
    [contextId]
  );

  return {
    entries: entriesResult.rows,
    total: parseInt(countResult.rows[0].count, 10),
  };
}
