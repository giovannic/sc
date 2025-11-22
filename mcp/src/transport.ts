import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  StdioServerTransport,
} from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  StreamableHTTPServerTransport,
} from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";

/**
 * Setup stdio transport for MCP server
 */
export async function setupStdioTransport(
  server: Server
): Promise<void> {
  const transport = new StdioServerTransport();

  await server.connect(transport);

  console.error(
    "[SC MCP Server] Started on stdio transport"
  );
}

/**
 * Setup HTTP/SSE transport for MCP server
 *
 * Returns middleware that can be used with Express or similar
 * frameworks. Creates a fresh transport per request.
 *
 * @param server - The MCP server instance
 * @returns Middleware function for handling HTTP requests
 */
export function setupHttpTransport(
  server: Server
): (
  req: IncomingMessage,
  res: ServerResponse,
  parsedBody?: unknown
) => Promise<void> {
  // Map to track active sessions
  const sessions = new Map<
    string,
    StreamableHTTPServerTransport
  >();

  /**
   * Middleware handler for HTTP requests
   */
  return async (
    req: IncomingMessage,
    res: ServerResponse,
    parsedBody?: unknown
  ): Promise<void> => {
    // Extract session ID from header if present
    const sessionId =
      (req.headers["x-mcp-session"] as string) || undefined;

    let transport: StreamableHTTPServerTransport;

    if (sessionId && sessions.has(sessionId)) {
      // Reuse existing session
      transport = sessions.get(sessionId)!;
    } else {
      // Create new session
      const newSessionId = randomUUID();
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => newSessionId,
        onsessioninitialized: (id: string) => {
          sessions.set(id, transport);
        },
        onsessionclosed: (id: string) => {
          sessions.delete(id);
        },
      });

      // Connect transport to server
      await server.connect(transport);
    }

    // Handle the request
    await transport.handleRequest(req, res, parsedBody);
  };
}
