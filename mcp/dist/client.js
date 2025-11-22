import * as Schemas from "./schemas.js";
/**
 * SC REST API client for interacting with Shared Context server
 */
export class SCClient {
    constructor(baseUrl = "http://localhost:3000") {
        this.baseUrl = baseUrl;
    }
    /**
     * List all contexts with pagination
     */
    async listContexts(limit = 20, offset = 0) {
        const url = new URL(`${this.baseUrl}/contexts`);
        url.searchParams.append("limit", limit.toString());
        url.searchParams.append("offset", offset.toString());
        const response = await fetch(url.toString());
        if (!response.ok) {
            throw await this.parseError(response);
        }
        const data = await response.json();
        return Schemas.ListContextsResponseSchema.parse(data);
    }
    /**
     * Create a new shared context
     */
    async createContext(request) {
        const response = await fetch(`${this.baseUrl}/contexts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request),
        });
        if (!response.ok) {
            throw await this.parseError(response);
        }
        const data = await response.json();
        return Schemas.CreateContextResponseSchema.parse(data);
    }
    /**
     * Get context entries with pagination
     */
    async getContext(contextId, order = "desc", limit = 20, offset = 0) {
        const url = new URL(`${this.baseUrl}/contexts/${contextId}/context`);
        url.searchParams.append("order", order);
        url.searchParams.append("limit", limit.toString());
        url.searchParams.append("offset", offset.toString());
        const response = await fetch(url.toString());
        if (!response.ok) {
            throw await this.parseError(response);
        }
        const data = await response.json();
        return Schemas.GetContextResponseSchema.parse(data);
    }
    /**
     * Get context README
     */
    async getReadme(contextId) {
        const response = await fetch(`${this.baseUrl}/contexts/${contextId}/readme`);
        if (!response.ok) {
            throw await this.parseError(response);
        }
        const data = await response.json();
        return Schemas.GetReadmeResponseSchema.parse(data);
    }
    /**
     * Update context README
     */
    async updateReadme(contextId, readme) {
        const response = await fetch(`${this.baseUrl}/contexts/${contextId}/readme`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ readme }),
        });
        if (!response.ok) {
            throw await this.parseError(response);
        }
        const data = await response.json();
        return Schemas.UpdateReadmeResponseSchema.parse(data);
    }
    /**
     * Add entry to context
     */
    async addEntry(contextId, content) {
        const response = await fetch(`${this.baseUrl}/contexts/${contextId}/context`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content }),
        });
        if (!response.ok) {
            throw await this.parseError(response);
        }
        const data = await response.json();
        return Schemas.AddEntryResponseSchema.parse(data);
    }
    /**
     * Parse error response and throw descriptive error
     */
    async parseError(response) {
        let errorMessage;
        try {
            const data = (await response.json());
            const parsed = Schemas.ErrorResponseSchema.safeParse(data);
            errorMessage = parsed.success
                ? parsed.data.error
                : `HTTP ${response.status}`;
        }
        catch {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
    }
}
//# sourceMappingURL=client.js.map