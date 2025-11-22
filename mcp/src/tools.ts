import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { SCClient } from "./client.js";
import * as Schemas from "./schemas.js";

/**
 * Register all MCP tools.
 * Sets up tool handlers for create_context, add_entry,
 * update_readme, and list_contexts. Tools handle input
 * validation via Zod schemas and send resource update
 * notifications when context data changes.
 * @param server - The MCP server instance to register with
 * @param client - The SC REST API client for executing
 *   operations
 */
export function registerTools(
  server: Server,
  client: SCClient
): void {
  server.setRequestHandler(
    CallToolRequestSchema,
    async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "create_context":
          return handleCreateContext(client, args);
        case "add_entry":
          return handleAddEntry(server, client, args);
        case "update_readme":
          return handleUpdateReadme(server, client, args);
        case "list_contexts":
          return handleListContexts(client, args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    }
  );
}

/**
 * Handle create_context tool.
 * Creates a new shared context with optional initial entries
 * and README. Validates input using CreateContextToolInputSchema.
 * @param client - The SC REST API client
 * @param args - Tool arguments (entries array, readme string)
 * @returns Tool response with context ID and URI
 */
async function handleCreateContext(
  client: SCClient,
  args: Record<string, unknown> | undefined
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const input = Schemas.CreateContextToolInputSchema.parse(
      args ?? {}
    );
    const response = await client.createContext(input);

    return {
      content: [
        {
          type: "text",
          text: `Created context with ID: ${response.contextId}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating context: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
    };
  }
}

/**
 * Handle add_entry tool.
 * Adds a new entry to an existing context. Validates input
 * using AddEntryToolInputSchema. Sends resource update
 * notification to notify clients of context changes.
 * @param server - The MCP server instance for notifications
 * @param client - The SC REST API client
 * @param args - Tool arguments (contextId, content)
 * @returns Tool response with entry ID and timestamp
 */
async function handleAddEntry(
  server: Server,
  client: SCClient,
  args: Record<string, unknown> | undefined
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const input = Schemas.AddEntryToolInputSchema.parse(
      args ?? {}
    );
    const response = await client.addEntry(
      input.contextId,
      input.content
    );

    server.sendResourceUpdated({
      uri: `context://${input.contextId}`,
    });

    return {
      content: [
        {
          type: "text",
          text: `Added entry ${response.id} at ${new Date(
            response.timestamp
          ).toISOString()}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error adding entry: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
    };
  }
}

/**
 * Handle update_readme tool.
 * Updates the README for a context. Validates input using
 * UpdateReadmeToolInputSchema. Sends resource update
 * notification to notify clients of context changes.
 * @param server - The MCP server instance for notifications
 * @param client - The SC REST API client
 * @param args - Tool arguments (contextId, readme)
 * @returns Tool response with success status
 */
async function handleUpdateReadme(
  server: Server,
  client: SCClient,
  args: Record<string, unknown> | undefined
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const input = Schemas.UpdateReadmeToolInputSchema.parse(
      args ?? {}
    );
    await client.updateReadme(input.contextId, input.readme);

    server.sendResourceUpdated({
      uri: `context://${input.contextId}`,
    });

    return {
      content: [
        {
          type: "text",
          text: `Updated README for context ${input.contextId}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error updating README: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
    };
  }
}

/**
 * Handle list_contexts tool.
 * Lists available contexts with pagination support. Validates
 * input using ListContextsToolInputSchema. Returns formatted
 * text with context summaries and pagination info.
 * @param client - The SC REST API client
 * @param args - Tool arguments (limit, offset)
 * @returns Tool response with context list and total count
 */
async function handleListContexts(
  client: SCClient,
  args: Record<string, unknown> | undefined
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const input = Schemas.ListContextsToolInputSchema.parse(
      args ?? {}
    );
    const limit = input.limit ?? 20;
    const offset = input.offset ?? 0;

    const response = await client.listContexts(limit, offset);

    const contextList = response.contexts
      .map((ctx) => `- ${ctx.id}: ${ctx.readme || "(no readme)"}`)
      .join("\n");

    const text = `Found ${response.total} total contexts. ${
      response.contexts.length === 0
        ? "No contexts to display."
        : `Showing ${response.contexts.length} contexts:\n${contextList}`
    }`;

    return {
      content: [
        {
          type: "text",
          text,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error listing contexts: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
    };
  }
}
