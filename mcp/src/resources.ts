import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ReadResourceRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { SCClient } from "./client.js";

/**
 * Register resource handlers for context://{contextId}
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
 * Handle reading a context resource
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
