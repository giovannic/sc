import { StdioServerTransport, } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport, } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from "node:crypto";
/**
 * Setup stdio transport for MCP server
 */
export async function setupStdioTransport(server) {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("[SC MCP Server] Started on stdio transport");
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
export function setupHttpTransport(server) {
    // Map to track active sessions
    const sessions = new Map();
    /**
     * Middleware handler for HTTP requests
     */
    return async (req, res, parsedBody) => {
        // Extract session ID from header if present
        const sessionId = req.headers["x-mcp-session"] || undefined;
        let transport;
        if (sessionId && sessions.has(sessionId)) {
            // Reuse existing session
            transport = sessions.get(sessionId);
        }
        else {
            // Create new session
            const newSessionId = randomUUID();
            transport = new StreamableHTTPServerTransport({
                sessionIdGenerator: () => newSessionId,
                onsessioninitialized: (id) => {
                    sessions.set(id, transport);
                },
                onsessionclosed: (id) => {
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
//# sourceMappingURL=transport.js.map