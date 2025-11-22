import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ReadResourceRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { SCClient } from "./client.js";

/**
 * Register resource handlers for context://{contextId}.
 * Sets up a dynamic resource handler that responds to requests
 * for contexts using the context:// URI scheme. Fetches
 * context entries and README from the SC API, formatting them
 * as human-readable text. Supports pagination via query
 * parameters (order, limit, offset).
 * @param server - The MCP server instance to register with
 * @param client - The SC REST API client for fetching data
 */
export function registerResources(
  server: Server,
  client: SCClient
): void {
  server.setRequestHandler(
    ReadResourceRequestSchema,
    async (request) => {
      const uri = request.params.uri;

      // Parse context://{contextId} URI
      const match = uri.match(/^context:\/\/(.+)$/);
      if (!match) {
        throw new Error(`Invalid context URI: ${uri}`);
      }

      const contextId = match[1];
      return handleReadContextResource(
        client,
        contextId,
        request.params
      );
    }
  );
}

/**
 * Handle reading a context resource.
 * Fetches context entries and README, formats them as
 * human-readable text with metadata (timestamps, entry IDs).
 * Supports pagination and ordering of entries.
 * @param client - The SC REST API client
 * @param contextId - UUID of the context to read
 * @param params - Request parameters (order, limit, offset)
 * @returns MCP resource response with formatted content
 * @throws Error if context not found or API request fails
 */
async function handleReadContextResource(
  client: SCClient,
  contextId: string,
  params: Record<string, unknown>
): Promise<{
  contents: Array<{ uri: string; mimeType: string; text: string }>;
}> {
  try {
    // Extract query parameters
    const order = (params.order as string) ?? "desc";
    const limit = (params.limit as number) ?? 20;
    const offset = (params.offset as number) ?? 0;

    // Fetch README
    let readmeText = "";
    try {
      const readmeResp = await client.getReadme(contextId);
      readmeText = readmeResp.readme
        ? `## README\n\n${readmeResp.readme}\n\n`
        : "";
    } catch {
      // README not found, continue without it
    }

    // Fetch context entries
    const contextResp = await client.getContext(
      contextId,
      order as "asc" | "desc",
      limit,
      offset
    );

    // Format entries
    const entriesText = contextResp.entries
      .map(
        (entry, index) =>
          `${index + 1}. Entry ${entry.id.substring(0, 8)}... ` +
          `(${new Date(entry.timestamp).toISOString()})\n` +
          `   ${entry.content
            .split("\n")
            .join("\n   ")}`
      )
      .join("\n\n");

    const text =
      `Context ID: ${contextId}\n\n` +
      readmeText +
      (contextResp.entries.length > 0
        ? `## Entries (order: ${order}, ` +
          `total: ${contextResp.total})\n\n${entriesText}`
        : `## Entries\n\nNo entries (total: ${contextResp.total})`);

    return {
      contents: [
        {
          uri: `context://${contextId}`,
          mimeType: "text/plain",
          text,
        },
      ],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to read context ${contextId}: ${message}`);
  }
}
