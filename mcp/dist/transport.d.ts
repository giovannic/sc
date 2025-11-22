import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type { IncomingMessage, ServerResponse } from "node:http";
/**
 * Setup stdio transport for MCP server
 */
export declare function setupStdioTransport(server: Server): Promise<void>;
/**
 * Setup HTTP/SSE transport for MCP server
 *
 * Returns middleware that can be used with Express or similar
 * frameworks. Creates a fresh transport per request.
 *
 * @param server - The MCP server instance
 * @returns Middleware function for handling HTTP requests
 */
export declare function setupHttpTransport(server: Server): (req: IncomingMessage, res: ServerResponse, parsedBody?: unknown) => Promise<void>;
//# sourceMappingURL=transport.d.ts.map