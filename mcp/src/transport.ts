import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

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
