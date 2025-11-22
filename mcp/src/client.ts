import * as Schemas from "./schemas.js";

/**
 * SC REST API client for interacting with Shared Context server.
 * Provides methods to create, read, and update shared contexts
 * with error handling and type validation.
 */
export class SCClient {
  private baseUrl: string;

  /**
   * Create a new SC REST API client.
   * @param baseUrl - Base URL of the SC server (default:
   *   http://localhost:3000)
   */
  constructor(baseUrl: string = "http://localhost:3000") {
    this.baseUrl = baseUrl;
  }

  /**
   * List all contexts with pagination.
   * @param limit - Maximum number of contexts to return
   *   (default: 20)
   * @param offset - Number of contexts to skip (default: 0)
   * @returns Promise resolving to a list of contexts with
   *   total count
   * @throws Error if the API request fails
   */
  async listContexts(
    limit: number = 20,
    offset: number = 0
  ): Promise<Schemas.ListContextsResponse> {
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
   * Create a new shared context.
   * @param request - Context creation request with optional
   *   initial entries and README
   * @returns Promise resolving to context ID and resource URI
   * @throws Error if the API request fails
   */
  async createContext(
    request: Schemas.CreateContextRequest
  ): Promise<Schemas.CreateContextResponse> {
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
  async getContext(
    contextId: string,
    order: "asc" | "desc" = "desc",
    limit: number = 20,
    offset: number = 0
  ): Promise<Schemas.GetContextResponse> {
    const url = new URL(
      `${this.baseUrl}/contexts/${contextId}/context`
    );
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
   * Get the README for a context.
   * @param contextId - UUID of the context
   * @returns Promise resolving to README content (may be null
   *   if not set)
   * @throws Error if the API request fails
   */
  async getReadme(
    contextId: string
  ): Promise<Schemas.GetReadmeResponse> {
    const response = await fetch(
      `${this.baseUrl}/contexts/${contextId}/readme`
    );

    if (!response.ok) {
      throw await this.parseError(response);
    }

    const data = await response.json();
    return Schemas.GetReadmeResponseSchema.parse(data);
  }

  /**
   * Update the README for a context.
   * @param contextId - UUID of the context
   * @param readme - New README content
   * @returns Promise resolving to success status
   * @throws Error if the API request fails
   */
  async updateReadme(
    contextId: string,
    readme: string
  ): Promise<Schemas.UpdateReadmeResponse> {
    const response = await fetch(
      `${this.baseUrl}/contexts/${contextId}/readme`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readme }),
      }
    );

    if (!response.ok) {
      throw await this.parseError(response);
    }

    const data = await response.json();
    return Schemas.UpdateReadmeResponseSchema.parse(data);
  }

  /**
   * Add a new entry to a context.
   * @param contextId - UUID of the context
   * @param content - Content of the entry
   * @returns Promise resolving to entry ID and timestamp
   * @throws Error if the API request fails
   */
  async addEntry(
    contextId: string,
    content: string
  ): Promise<Schemas.AddEntryResponse> {
    const response = await fetch(
      `${this.baseUrl}/contexts/${contextId}/context`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      }
    );

    if (!response.ok) {
      throw await this.parseError(response);
    }

    const data = await response.json();
    return Schemas.AddEntryResponseSchema.parse(data);
  }

  /**
   * Parse error response and throw a descriptive error.
   * @param response - Response object from failed API call
   * @throws Always throws an Error with message from API or
   *   HTTP status
   */
  private async parseError(response: Response): Promise<never> {
    let errorMessage: string;

    try {
      const data = (await response.json()) as unknown;
      const parsed = Schemas.ErrorResponseSchema.safeParse(data);
      errorMessage = parsed.success
        ? parsed.data.error
        : `HTTP ${response.status}`;
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }

    throw new Error(errorMessage);
  }
}
