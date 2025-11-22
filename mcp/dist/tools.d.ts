import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SCClient } from "./client.js";
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
export declare function registerTools(server: Server, client: SCClient): void;
//# sourceMappingURL=tools.d.ts.map