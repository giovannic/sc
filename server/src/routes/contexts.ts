import { Router, Request, Response } from 'express';
import { contextService } from '../services/contextService';
import { subscriptionManager } from '../services/subscriptionManager';
import {
  CreateContextRequest,
  GetContextParams,
  AddEntryRequest,
  UpdateReadmeRequest,
  ListContextsParams,
  ErrorResponse,
} from '../types/index';
import { Pool } from 'pg';

export function createContextsRouter(pool: Pool): Router {
  const router = Router();

  // POST /contexts - Create a new context
  router.post(
    '/',
    async (req: Request<{}, {}, CreateContextRequest>, res) => {
      try {
        const { entries, readme } = req.body;
        const result = await contextService.createContext(
          entries,
          readme
        );
        res.status(201).json(result);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        const errorResponse: ErrorResponse = {
          error: message,
        };
        res.status(500).json(errorResponse);
      }
    }
  );

  // GET /contexts - List all contexts
  router.get('/', async (req: Request, res) => {
    try {
      const limit = Math.min(
        parseInt(req.query.limit as string) || 20,
        100
      );
      const offset = parseInt(req.query.offset as string) || 0;

      const query = `
        SELECT id, uri, readme FROM contexts
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `;
      const countQuery =
        'SELECT COUNT(*) as count FROM contexts';

      const [result, countResult] = await Promise.all([
        pool.query(query, [limit, offset]),
        pool.query(countQuery),
      ]);

      const contexts = result.rows.map((row) => ({
        id: row.id,
        uri: row.uri,
        readme: row.readme || null,
      }));

      const total = parseInt(
        countResult.rows[0].count,
        10
      );

      res.status(200).json({
        contexts,
        total,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error';
      const errorResponse: ErrorResponse = {
        error: message,
      };
      res.status(500).json(errorResponse);
    }
  });

  // GET /contexts/:contextId/readme - Get context readme
  router.get('/:contextId/readme', async (req: Request, res) => {
    try {
      const { contextId } = req.params;
      const readme = await contextService.getReadme(
        contextId
      );
      res.status(200).json({ readme });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error';
      const errorResponse: ErrorResponse = {
        error: message,
      };
      const status =
        message === 'Context not found' ? 404 : 500;
      res.status(status).json(errorResponse);
    }
  });

  // GET /contexts/:contextId/context - Get paginated context entries
  router.get('/:contextId/context', async (req: Request, res) => {
    try {
      const { contextId } = req.params;
      const order =
        (req.query.order as 'asc' | 'desc') || 'asc';
      const limit = Math.min(
        parseInt(req.query.limit as string) || 20,
        100
      );
      const offset = parseInt(req.query.offset as string) || 0;

      const result = await contextService.getContext(
        contextId,
        order,
        limit,
        offset
      );
      res.status(200).json(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error';
      const errorResponse: ErrorResponse = {
        error: message,
      };
      res.status(500).json(errorResponse);
    }
  });

  // POST /contexts/:contextId/context - Add new entry to context
  router.post(
    '/:contextId/context',
    async (
      req: Request<{ contextId: string }, {}, AddEntryRequest>,
      res
    ) => {
      try {
        const { contextId } = req.params;
        const { content } = req.body;

        if (!content || typeof content !== 'string') {
          const errorResponse: ErrorResponse = {
            error: 'Invalid content',
          };
          res.status(400).json(errorResponse);
          return;
        }

        const result = await contextService.addEntry(
          contextId,
          content
        );

        // Broadcast to subscribers
        subscriptionManager.broadcast(contextId, {
          type: 'update',
          id: result.id,
          content,
          timestamp: result.timestamp,
        });

        res.status(201).json(result);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        const errorResponse: ErrorResponse = {
          error: message,
        };
        const status =
          message === 'Context not found' ? 404 : 500;
        res.status(status).json(errorResponse);
      }
    }
  );

  // PUT /contexts/:contextId/readme - Update context readme
  router.put(
    '/:contextId/readme',
    async (
      req: Request<
        { contextId: string },
        {},
        UpdateReadmeRequest
      >,
      res
    ) => {
      try {
        const { contextId } = req.params;
        const { readme } = req.body;

        if (readme === undefined || readme === null) {
          const errorResponse: ErrorResponse = {
            error: 'Invalid readme',
          };
          res.status(400).json(errorResponse);
          return;
        }

        const success =
          await contextService.updateReadme(
            contextId,
            readme
          );

        res.status(200).json({ success });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        const errorResponse: ErrorResponse = {
          error: message,
        };
        const status =
          message === 'Context not found' ? 404 : 500;
        res.status(status).json(errorResponse);
      }
    }
  );

  return router;
}
