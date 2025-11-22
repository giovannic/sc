import http from 'http';
import WebSocket from 'ws';
import { Pool } from 'pg';
import { createApp } from './app';
import { subscriptionManager } from './services/subscriptionManager';
import { initializeDb } from './db/migrations';

interface WebSocketWithContextId extends WebSocket {
  contextId?: string;
  subscriberId?: string;
}

export async function startServer(
  pool: Pool,
  port: number = 3000
): Promise<http.Server> {
  // Initialize database
  await initializeDb(pool);

  // Create Express app
  const app = createApp(pool);

  // Create HTTP server
  const server = http.createServer(app);

  // Create WebSocket server
  const wss = new WebSocket.Server({
    noServer: true,
  });

  // Handle WebSocket upgrades
  server.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url || '', 'http://localhost');
    const pathname = url.pathname;

    // Match /contexts/:contextId/subscribe
    const match = pathname.match(
      /^\/contexts\/([a-f0-9-]+)\/subscribe$/
    );

    if (match) {
      const contextId = match[1];

      wss.handleUpgrade(
        request,
        socket,
        head,
        (ws: WebSocket) => {
          const typedWs = ws as WebSocketWithContextId;
          typedWs.contextId = contextId;

          // Subscribe to context updates
          const subscriberId = subscriptionManager.subscribe(
            contextId,
            (message) => {
              try {
                if (
                  typedWs.readyState ===
                  WebSocket.OPEN
                ) {
                  typedWs.send(
                    JSON.stringify(message)
                  );
                }
              } catch {
                // Ignore send errors
              }
            }
          );

          typedWs.subscriberId = subscriberId;

          // Handle disconnect
          ws.on('close', () => {
            if (typedWs.contextId && typedWs.subscriberId) {
              subscriptionManager.unsubscribe(
                typedWs.contextId,
                typedWs.subscriberId
              );
            }
          });

          ws.on('error', () => {
            // Ignore errors
          });
        }
      );
    } else {
      socket.destroy();
    }
  });

  return new Promise((resolve) => {
    server.listen(port, () => {
      console.log(
        `Server listening on port ${port}`
      );
      resolve(server);
    });
  });
}

export function stopServer(
  server: http.Server
): Promise<void> {
  return new Promise((resolve) => {
    server.close(() => {
      resolve();
    });
  });
}
