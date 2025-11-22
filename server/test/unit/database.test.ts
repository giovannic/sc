import { Pool } from 'pg';
import {
  query,
  getConnection,
  close,
} from '../../src/db/connection';

describe('Database Connection', () => {
  let testPool: Pool;

  beforeAll(() => {
    testPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'sc_test',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });
  });

  afterAll(async () => {
    await testPool.end();
  });

  describe('query function', () => {
    it('should execute a simple query', async () => {
      const result = await query('SELECT 1 as value');
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].value).toBe(1);
    });

    it('should execute a parameterized query', async () => {
      const result = await query(
        'SELECT $1::text as greeting',
        ['hello']
      );
      expect(result.rows[0].greeting).toBe('hello');
    });
  });

  describe('getConnection function', () => {
    it('should return a pooled client', async () => {
      const client = await getConnection();
      expect(client).toBeDefined();
      expect(typeof client.query).toBe('function');
      client.release();
    });

    it('should allow multiple concurrent connections', async () => {
      const clients = await Promise.all([
        getConnection(),
        getConnection(),
        getConnection(),
      ]);

      expect(clients).toHaveLength(3);
      clients.forEach((client) => {
        client.release();
      });
    });
  });

  describe('close function', () => {
    it('should close the pool', async () => {
      await close();
    });
  });
});
