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
 * Setup stdio transport for MCP server.
 * Connects the MCP server to stdio (standard input/output) for
 * CLI-based agents and local process integration. This is the
 * primary transport for direct CLI usage.
 * @param server - The MCP server instance to connect
 * @throws Error if connection setup fails
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
 * Setup HTTP/SSE transport for MCP server.
 * Returns middleware that can be used with Express or similar
 * frameworks for web-based agents. Creates session-aware
 * transports that can handle streaming HTTP requests with
 * Server-Sent Events (SSE). Sessions are tracked and reused
 * for requests with matching session IDs.
 * @param server - The MCP server instance to connect
 * @returns Middleware function for handling HTTP requests
 *   with signature (req, res, parsedBody?) => Promise<void>
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
   * Middleware handler for HTTP requests.
   * Processes incoming HTTP requests, managing sessions via
   * x-mcp-session header. Reuses existing transports for
   * requests with the same session ID, or creates new
   * sessions. Delegates request handling to the transport.
   * @param req - Incoming HTTP request
   * @param res - HTTP response object
   * @param parsedBody - Optional parsed request body
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
