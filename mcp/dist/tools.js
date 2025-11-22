import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import * as Schemas from "./schemas.js";
/**
 * Register all MCP tools
 */
export function registerTools(server, client) {
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
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
    });
}
/**
 * Tool: create_context
 * Creates a new shared context with optional initial entries
 */
async function handleCreateContext(client, args) {
    try {
        const input = Schemas.CreateContextToolInputSchema.parse(args ?? {});
        const response = await client.createContext(input);
        return {
            content: [
                {
                    type: "text",
                    text: `Created context with ID: ${response.contextId}`,
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error creating context: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
        };
    }
}
/**
 * Tool: add_entry
 * Add a new entry to an existing context
 */
async function handleAddEntry(server, client, args) {
    try {
        const input = Schemas.AddEntryToolInputSchema.parse(args ?? {});
        const response = await client.addEntry(input.contextId, input.content);
        server.sendResourceUpdated({
            uri: `context://${input.contextId}`,
        });
        return {
            content: [
                {
                    type: "text",
                    text: `Added entry ${response.id} at ${new Date(response.timestamp).toISOString()}`,
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error adding entry: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
        };
    }
}
/**
 * Tool: update_readme
 * Update the README for a context
 */
async function handleUpdateReadme(server, client, args) {
    try {
        const input = Schemas.UpdateReadmeToolInputSchema.parse(args ?? {});
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
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error updating README: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
        };
    }
}
/**
 * Tool: list_contexts
 * List available contexts with pagination
 */
async function handleListContexts(client, args) {
    try {
        const input = Schemas.ListContextsToolInputSchema.parse(args ?? {});
        const limit = input.limit ?? 20;
        const offset = input.offset ?? 0;
        const response = await client.listContexts(limit, offset);
        const contextList = response.contexts
            .map((ctx) => `- ${ctx.id}: ${ctx.readme || "(no readme)"}`)
            .join("\n");
        const text = `Found ${response.total} total contexts. ${response.contexts.length === 0
            ? "No contexts to display."
            : `Showing ${response.contexts.length} contexts:\n${contextList}`}`;
        return {
            content: [
                {
                    type: "text",
                    text,
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error listing contexts: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
        };
    }
}
//# sourceMappingURL=tools.js.map