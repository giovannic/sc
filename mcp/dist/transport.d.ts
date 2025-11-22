import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type { IncomingMessage, ServerResponse } from "node:http";
/**
 * Setup stdio transport for MCP server.
 * Connects the MCP server to stdio (standard input/output) for
 * CLI-based agents and local process integration. This is the
 * primary transport for direct CLI usage.
 * @param server - The MCP server instance to connect
 * @throws Error if connection setup fails
 */
export declare function setupStdioTransport(server: Server): Promise<void>;
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
export declare function setupHttpTransport(server: Server): (req: IncomingMessage, res: ServerResponse, parsedBody?: unknown) => Promise<void>;
//# sourceMappingURL=transport.d.ts.map