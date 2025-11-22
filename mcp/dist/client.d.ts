import * as Schemas from "./schemas.js";
/**
 * SC REST API client for interacting with Shared Context server.
 * Provides methods to create, read, and update shared contexts
 * with error handling and type validation.
 */
export declare class SCClient {
    private baseUrl;
    /**
     * Create a new SC REST API client.
     * @param baseUrl - Base URL of the SC server (default:
     *   http://localhost:3000)
     */
    constructor(baseUrl?: string);
    /**
     * List all contexts with pagination.
     * @param limit - Maximum number of contexts to return
     *   (default: 20)
     * @param offset - Number of contexts to skip (default: 0)
     * @returns Promise resolving to a list of contexts with
     *   total count
     * @throws Error if the API request fails
     */
    listContexts(limit?: number, offset?: number): Promise<Schemas.ListContextsResponse>;
    /**
     * Create a new shared context.
     * @param request - Context creation request with optional
     *   initial entries and README
     * @returns Promise resolving to context ID and resource URI
     * @throws Error if the API request fails
     */
    createContext(request: Schemas.CreateContextRequest): Promise<Schemas.CreateContextResponse>;
    /**
     * Get context entries with pagination and ordering.
     * @param contextId - UUID of the context to fetch
     * @param order - Sort order for entries: "asc" for
     *   oldest-first, "desc" for newest-first (default: "desc")
     * @param limit - Maximum number of entries to return
     *   (default: 20)
     * @param offset - Number of entries to skip (default: 0)
     * @returns Promise resolving to context entries with total
     *   count
     * @throws Error if the API request fails
     */
    getContext(contextId: string, order?: "asc" | "desc", limit?: number, offset?: number): Promise<Schemas.GetContextResponse>;
    /**
     * Get the README for a context.
     * @param contextId - UUID of the context
     * @returns Promise resolving to README content (may be null
     *   if not set)
     * @throws Error if the API request fails
     */
    getReadme(contextId: string): Promise<Schemas.GetReadmeResponse>;
    /**
     * Update the README for a context.
     * @param contextId - UUID of the context
     * @param readme - New README content
     * @returns Promise resolving to success status
     * @throws Error if the API request fails
     */
    updateReadme(contextId: string, readme: string): Promise<Schemas.UpdateReadmeResponse>;
    /**
     * Add a new entry to a context.
     * @param contextId - UUID of the context
     * @param content - Content of the entry
     * @returns Promise resolving to entry ID and timestamp
     * @throws Error if the API request fails
     */
    addEntry(contextId: string, content: string): Promise<Schemas.AddEntryResponse>;
    /**
     * Parse error response and throw a descriptive error.
     * @param response - Response object from failed API call
     * @throws Always throws an Error with message from API or
     *   HTTP status
     */
    private parseError;
}
//# sourceMappingURL=client.d.ts.map