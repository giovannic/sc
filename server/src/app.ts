import express from 'express';
import { Pool } from 'pg';
import { createContextsRouter } from './routes/contexts';

export function createApp(pool: Pool): express.Application {
  const app = express();

  // Middleware
  app.use(express.json());

  // Routes
  const contextsRouter = createContextsRouter(pool);
  app.use('/contexts', contextsRouter);

  return app;
}
