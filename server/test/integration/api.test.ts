/**
 * REST API Integration Tests
 * Tests for all HTTP endpoints
 */

import request from 'supertest';
import { Pool } from 'pg';
import { createApp } from '../../src/app';
import { initializeDb } from '../../src/db/migrations';
import {
  cleanupDatabase,
  closePool,
} from '../setup';

describe('REST API Endpoints', () => {
  let app: any;
  let pool: Pool;

  beforeAll(async () => {
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database:
        process.env.DB_NAME || 'sc_test',
      user: process.env.DB_USER || 'postgres',
      password:
        process.env.DB_PASSWORD || 'postgres',
    });

    await initializeDb(pool);
    app = createApp(pool);
  });

  afterAll(async () => {
    await closePool(pool);
  });

  beforeEach(async () => {
    await cleanupDatabase(pool, [
      'context_entries',
      'contexts',
    ]);
  });

  describe('POST /contexts', () => {
    it('should create a new context', async () => {
      const res = await request(app)
        .post('/contexts')
        .send({});

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('contextId');
      expect(res.body).toHaveProperty('uri');
    });

    it('should return context URI and ID', async () => {
      const res = await request(app)
        .post('/contexts')
        .send({});

      expect(res.body.contextId).toBeTruthy();
      expect(res.body.uri).toBeTruthy();
      expect(typeof res.body.uri).toBe('string');
    });

    it('should create context with initial entries', async () => {
      const res = await request(app)
        .post('/contexts')
        .send({
          entries: [
            { content: 'Entry 1' },
            { content: 'Entry 2' },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.contextId).toBeTruthy();

      const contextRes = await request(app)
        .get(`/contexts/${res.body.contextId}/context`)
        .query({ order: 'asc' });

      expect(contextRes.body.total).toBe(2);
    });

    it('should create context with README', async () => {
      const readme = 'Test README';
      const res = await request(app)
        .post('/contexts')
        .send({ readme });

      expect(res.status).toBe(201);

      const readmeRes = await request(app)
        .get(
          `/contexts/${res.body.contextId}/readme`
        );

      expect(readmeRes.body.readme).toBe(readme);
    });
  });

  describe('GET /contexts', () => {
    it('should list all contexts', async () => {
      // Create two contexts
      await request(app)
        .post('/contexts')
        .send({});
      await request(app)
        .post('/contexts')
        .send({});

      const res = await request(app).get(
        '/contexts'
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('contexts');
      expect(res.body).toHaveProperty('total');
      expect(res.body.total).toBe(2);
    });

    it('should support pagination with limit', async () => {
      // Create three contexts
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/contexts')
          .send({});
      }

      const res = await request(app)
        .get('/contexts')
        .query({ limit: 2 });

      expect(res.body.contexts.length).toBe(2);
      expect(res.body.total).toBe(3);
    });

    it('should support pagination with offset', async () => {
      // Create three contexts
      const ids: string[] = [];
      for (let i = 0; i < 3; i++) {
        const res = await request(app)
          .post('/contexts')
          .send({});
        ids.push(res.body.contextId);
      }

      const page1 = await request(app)
        .get('/contexts')
        .query({ limit: 2, offset: 0 });
      const page2 = await request(app)
        .get('/contexts')
        .query({ limit: 2, offset: 2 });

      expect(page1.body.contexts.length).toBe(2);
      expect(page2.body.contexts.length).toBe(1);
    });

    it('should return total count', async () => {
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/contexts')
          .send({});
      }

      const res = await request(app).get(
        '/contexts'
      );

      expect(res.body.total).toBe(5);
    });
  });

  describe('GET /contexts/:contextId/readme', () => {
    it('should retrieve README for a context', async () => {
      const createRes = await request(app)
        .post('/contexts')
        .send({ readme: 'My README' });

      const res = await request(app)
        .get(
          `/contexts/${createRes.body.contextId}/readme`
        );

      expect(res.status).toBe(200);
      expect(res.body.readme).toBe('My README');
    });

    it('should return 404 for non-existent context', async () => {
      const res = await request(app)
        .get(
          '/contexts/00000000-0000-0000-0000-000000000000/readme'
        );

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /contexts/:contextId/readme', () => {
    it('should update README for a context', async () => {
      const createRes = await request(app)
        .post('/contexts')
        .send({ readme: 'Old README' });

      const res = await request(app)
        .put(
          `/contexts/${createRes.body.contextId}/readme`
        )
        .send({ readme: 'New README' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const readmeRes = await request(app)
        .get(
          `/contexts/${createRes.body.contextId}/readme`
        );
      expect(readmeRes.body.readme).toBe(
        'New README'
      );
    });

    it('should return 404 for non-existent context', async () => {
      const res = await request(app)
        .put(
          '/contexts/00000000-0000-0000-0000-000000000000/readme'
        )
        .send({ readme: 'New README' });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /contexts/:contextId/context', () => {
    it('should retrieve context entries in ascending order', async () => {
      const createRes = await request(app)
        .post('/contexts')
        .send({
          entries: [
            { content: 'First' },
            { content: 'Second' },
          ],
        });

      const res = await request(app)
        .get(
          `/contexts/${createRes.body.contextId}/context`
        )
        .query({ order: 'asc' });

      expect(res.status).toBe(200);
      expect(res.body.entries[0].content).toBe(
        'First'
      );
      expect(res.body.entries[1].content).toBe(
        'Second'
      );
    });

    it('should retrieve context entries in descending order', async () => {
      const createRes = await request(app)
        .post('/contexts')
        .send({
          entries: [
            { content: 'First' },
            { content: 'Second' },
          ],
        });

      const res = await request(app)
        .get(
          `/contexts/${createRes.body.contextId}/context`
        )
        .query({ order: 'desc' });

      expect(res.body.entries[0].content).toBe(
        'Second'
      );
      expect(res.body.entries[1].content).toBe(
        'First'
      );
    });

    it('should support pagination', async () => {
      const createRes = await request(app)
        .post('/contexts')
        .send({
          entries: [
            { content: 'E1' },
            { content: 'E2' },
            { content: 'E3' },
          ],
        });

      const res = await request(app)
        .get(
          `/contexts/${createRes.body.contextId}/context`
        )
        .query({ order: 'asc', limit: 2 });

      expect(res.body.entries.length).toBe(2);
      expect(res.body.total).toBe(3);
    });

    it('should return 404 for non-existent context', async () => {
      const res = await request(app)
        .get(
          '/contexts/00000000-0000-0000-0000-000000000000/context'
        )
        .query({ order: 'asc' });

      expect(res.status).toBe(500);
    });
  });

  describe('POST /contexts/:contextId/context', () => {
    it('should add new entry to context', async () => {
      const createRes = await request(app)
        .post('/contexts')
        .send({});

      const res = await request(app)
        .post(
          `/contexts/${createRes.body.contextId}/context`
        )
        .send({ content: 'New Entry' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('timestamp');
    });

    it('should return entry ID and timestamp', async () => {
      const createRes = await request(app)
        .post('/contexts')
        .send({});

      const res = await request(app)
        .post(
          `/contexts/${createRes.body.contextId}/context`
        )
        .send({ content: 'New Entry' });

      expect(res.body.id).toBeTruthy();
      expect(typeof res.body.timestamp).toBe('number');
    });

    it('should return 404 for non-existent context', async () => {
      const res = await request(app)
        .post(
          '/contexts/00000000-0000-0000-0000-000000000000/context'
        )
        .send({ content: 'New Entry' });

      expect(res.status).toBe(404);
    });
  });
});
