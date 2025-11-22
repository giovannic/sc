import { Pool } from 'pg';
import { runMigrations } from '../../src/db/migrations';
import {
  createContext,
  getContext,
  listContexts,
  updateContextReadme,
  addContextEntry,
  getContextEntries,
} from '../../src/db/queries';
import { cleanupDatabase, createTestUri } from '../setup';

describe('Database Integration Tests', () => {
  let testPool: Pool;

  beforeAll(async () => {
    testPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'sc_test',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });

    // Mock the pool module for migrations
    jest.doMock('../../src/db/connection', () => ({
      query: (text: string, values?: unknown[]) =>
        testPool.query(text, values),
    }));
  });

  afterAll(async () => {
    await testPool.end();
  });

  describe('Table Creation', () => {
    it('should create contexts table with correct schema', async () => {
      const result = await testPool.query(
        `SELECT table_name FROM information_schema.tables
         WHERE table_name = 'contexts' AND table_schema = 'public'`
      );
      expect(result.rows.length).toBeGreaterThan(0);
    });

    it('should create context_entries table with correct schema', async () => {
      const result = await testPool.query(
        `SELECT table_name FROM information_schema.tables
         WHERE table_name = 'context_entries' AND table_schema = 'public'`
      );
      expect(result.rows.length).toBeGreaterThan(0);
    });

    it('should have proper foreign key constraint', async () => {
      const result = await testPool.query(
        `SELECT constraint_name FROM information_schema.table_constraints
         WHERE table_name = 'context_entries'
         AND constraint_type = 'FOREIGN KEY'`
      );
      expect(result.rows.length).toBeGreaterThan(0);
    });

    it('should have index on context_entries', async () => {
      const result = await testPool.query(
        `SELECT indexname FROM pg_indexes
         WHERE tablename = 'context_entries'
         AND indexname LIKE 'idx_%'`
      );
      expect(result.rows.length).toBeGreaterThan(0);
    });
  });

  describe('Context Operations', () => {
    beforeEach(async () => {
      await cleanupDatabase(testPool, [
        'context_entries',
        'contexts',
      ]);
    });

    it('should create a context with URI', async () => {
      const testUri = createTestUri('ctx');
      const context = await createContext(testUri);

      expect(context.id).toBeDefined();
      expect(context.uri).toBe(testUri);
      expect(context.readme).toBeNull();
      expect(context.createdAt).toBeDefined();
    });

    it('should create a context with initial readme', async () => {
      const testUri = createTestUri('ctx');
      const readme = 'This is a test context';

      const context = await createContext(testUri, readme);

      expect(context.uri).toBe(testUri);
      expect(context.readme).toBe(readme);
    });

    it('should retrieve a context by ID', async () => {
      const testUri = createTestUri('ctx');
      const created = await createContext(testUri, 'Test readme');
      const retrieved = await getContext(created.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.uri).toBe(testUri);
      expect(retrieved?.readme).toBe('Test readme');
    });

    it('should list contexts with pagination', async () => {
      await createContext(createTestUri('ctx1'));
      await createContext(createTestUri('ctx2'));
      await createContext(createTestUri('ctx3'));

      const result = await listContexts(10, 0);

      expect(result.total).toBeGreaterThanOrEqual(3);
      expect(result.contexts.length).toBeGreaterThanOrEqual(3);
    });

    it('should respect limit and offset in list', async () => {
      await createContext(createTestUri('ctx1'));
      await createContext(createTestUri('ctx2'));
      await createContext(createTestUri('ctx3'));

      const result = await listContexts(2, 0);

      expect(result.contexts.length).toBeLessThanOrEqual(2);
    });

    it('should update context readme', async () => {
      const testUri = createTestUri('ctx');
      const context = await createContext(testUri);
      const newReadme = 'Updated readme text';

      const success = await updateContextReadme(
        context.id,
        newReadme
      );

      expect(success).toBe(true);

      const updated = await getContext(context.id);
      expect(updated?.readme).toBe(newReadme);
    });
  });

  describe('Context Entry Operations', () => {
    let contextId: string;

    beforeEach(async () => {
      await cleanupDatabase(testPool, [
        'context_entries',
        'contexts',
      ]);
      const context = await createContext(createTestUri('ctx'));
      contextId = context.id;
    });

    it('should add entry to context', async () => {
      const entry = await addContextEntry(
        contextId,
        'Test entry content'
      );

      expect(entry.id).toBeDefined();
      expect(entry.contextId).toBe(contextId);
      expect(entry.content).toBe('Test entry content');
      expect(entry.createdAt).toBeDefined();
    });

    it('should retrieve entries in asc order', async () => {
      await addContextEntry(contextId, 'First');
      await addContextEntry(contextId, 'Second');
      await addContextEntry(contextId, 'Third');

      const result = await getContextEntries(
        contextId,
        'asc',
        10,
        0
      );

      expect(result.entries).toHaveLength(3);
      expect(result.entries[0].content).toBe('First');
      expect(result.entries[2].content).toBe('Third');
    });

    it('should retrieve entries in desc order', async () => {
      await addContextEntry(contextId, 'First');
      await addContextEntry(contextId, 'Second');
      await addContextEntry(contextId, 'Third');

      const result = await getContextEntries(
        contextId,
        'desc',
        10,
        0
      );

      expect(result.entries).toHaveLength(3);
      expect(result.entries[0].content).toBe('Third');
      expect(result.entries[2].content).toBe('First');
    });

    it('should respect limit and offset', async () => {
      await addContextEntry(contextId, 'First');
      await addContextEntry(contextId, 'Second');
      await addContextEntry(contextId, 'Third');

      const result = await getContextEntries(
        contextId,
        'asc',
        2,
        0
      );

      expect(result.total).toBe(3);
      expect(result.entries).toHaveLength(2);
    });
  });
});
