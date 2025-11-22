import * as Schemas from "./schemas.js";

/**
 * SC REST API client for interacting with Shared Context server
 */
export class SCClient {
  private baseUrl: string;

  constructor(baseUrl: string = "http://localhost:3000") {
    this.baseUrl = baseUrl;
  }

  /**
   * List all contexts with pagination
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
   * Create a new shared context
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
   * Get context entries with pagination
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
   * Get context README
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
   * Update context README
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
   * Add entry to context
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
   * Parse error response and throw descriptive error
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
