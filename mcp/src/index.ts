import { getMCPServer } from "./server.js";
import { SCClient } from "./client.js";
import { registerTools } from "./tools.js";
import { registerResources } from "./resources.js";
import { setupStdioTransport } from "./transport.js";

/**
 * Entry point for SC MCP Server
 * Starts server with stdio transport by default
 */
async function main(): Promise<void> {
  const scBaseUrl =
    process.env.SC_SERVER_URL || "http://localhost:3000";

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
