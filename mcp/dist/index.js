/**
 * SC MCP Server - Entry point module.
 * This module initializes and starts the MCP server with
 * stdio transport by default. It can be imported to use with
 * custom transports via the server and client exports.
 */
import { getMCPServer } from "./server.js";
import { SCClient } from "./client.js";
import { registerTools } from "./tools.js";
import { registerResources } from "./resources.js";
import { setupStdioTransport } from "./transport.js";
/**
 * Initialize and start the SC MCP Server.
 * Creates MCP server instance, initializes SC REST API
 * client, registers all tools and resources, and starts
 * stdio transport. Environment variable SC_SERVER_URL can
 * override the default SC server base URL.
 * @throws Error if server initialization or startup fails
 */
async function main() {
    const scBaseUrl = process.env.SC_SERVER_URL || "http://localhost:3000";
    // Create MCP server
    const server = getMCPServer();
    // Create SC REST API client
    const scClient = new SCClient(scBaseUrl);
    // Register handlers
    registerTools(server, scClient);
    registerResources(server, scClient);
    // Start with stdio transport
    await setupStdioTransport(server);
}
// Handle shutdown gracefully
process.on("SIGINT", () => {
    console.error("[SC MCP Server] Received SIGINT, shutting down");
    process.exit(0);
});
process.on("SIGTERM", () => {
    console.error("[SC MCP Server] Received SIGTERM, shutting down");
    process.exit(0);
});
// Start server
main().catch((error) => {
    console.error("[SC MCP Server] Failed to start:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map