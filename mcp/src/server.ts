import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * Create and configure a new MCP server instance.
 * Sets up request handlers for listing resources, reading
 * resources, and calling tools. Handlers are registered
 * later via registerResources and registerTools.
 * @returns A configured MCP Server instance
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
 * Get or create the singleton MCP server instance.
 * Ensures only one server instance exists throughout the
 * application lifecycle. Subsequent calls return the same
 * instance created on first call.
 * @returns The singleton MCP Server instance
 */
let mcpServer: Server | undefined;

export function getMCPServer(): Server {
  if (!mcpServer) {
    mcpServer = createMCPServer();
  }
  return mcpServer;
}
