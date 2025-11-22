import { Server } from "@modelcontextprotocol/sdk/server/index.js";
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
export declare function registerResources(server: Server, client: SCClient): void;
//# sourceMappingURL=resources.d.ts.map