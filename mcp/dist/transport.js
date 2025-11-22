import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
/**
 * Setup stdio transport for MCP server
 */
export async function setupStdioTransport(server) {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("[SC MCP Server] Started on stdio transport");
}
//# sourceMappingURL=transport.js.map