import * as Schemas from "./schemas.js";
/**
 * SC REST API client for interacting with Shared Context server
 */
export declare class SCClient {
    private baseUrl;
    constructor(baseUrl?: string);
    /**
     * List all contexts with pagination
     */
    listContexts(limit?: number, offset?: number): Promise<Schemas.ListContextsResponse>;
    /**
     * Create a new shared context
     */
    createContext(request: Schemas.CreateContextRequest): Promise<Schemas.CreateContextResponse>;
    /**
     * Get context entries with pagination
     */
    getContext(contextId: string, order?: "asc" | "desc", limit?: number, offset?: number): Promise<Schemas.GetContextResponse>;
    /**
     * Get context README
     */
    getReadme(contextId: string): Promise<Schemas.GetReadmeResponse>;
    /**
     * Update context README
     */
    updateReadme(contextId: string, readme: string): Promise<Schemas.UpdateReadmeResponse>;
    /**
     * Add entry to context
     */
    addEntry(contextId: string, content: string): Promise<Schemas.AddEntryResponse>;
    /**
     * Parse error response and throw descriptive error
     */
    private parseError;
}
//# sourceMappingURL=client.d.ts.map