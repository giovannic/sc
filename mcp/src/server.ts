import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * Create and configure MCP server instance
 */
export function createMCPServer(): Server {
  const server = new Server(
    {
      name: "sc-mcp-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    }
  );

  // Register request handlers
  server.setRequestHandler(
    ListResourcesRequestSchema,
    async () => ({
      resources: [
        {
          uri: "context://{contextId}",
          name: "Shared Context Resource",
          description:
            "Read shared context entries and README",
          mimeType: "text/plain",
        },
      ],
    })
  );

  server.setRequestHandler(
    ReadResourceRequestSchema,
    async (request) => {
      throw new Error(
        `Resource handler not yet implemented: ${request.params.uri}`
      );
    }
  );

  server.setRequestHandler(
    CallToolRequestSchema,
    async (request) => {
      throw new Error(
        `Tool ${request.params.name} not yet implemented`
      );
    }
  );

  return server;
}

/**
 * Get or create the singleton MCP server
 */
let mcpServer: Server | undefined;

export function getMCPServer(): Server {
  if (!mcpServer) {
    mcpServer = createMCPServer();
  }
  return mcpServer;
}
