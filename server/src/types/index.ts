// Domain Models
export interface Context {
  id: string;
  uri: string;
  readme: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContextEntry {
  id: string;
  contextId: string;
  content: string;
  createdAt: Date;
}

// Request Types
export interface CreateContextRequest {
  entries?: Array<{ content: string }>;
  readme?: string;
}

export interface AddEntryRequest {
  content: string;
}

export interface UpdateReadmeRequest {
  readme: string;
}

// Response Types
export interface CreateContextResponse {
  uri: string;
  contextId: string;
}

export interface GetReadmeResponse {
  readme: string | null;
}

export interface UpdateReadmeResponse {
  success: boolean;
}

export interface ContextSummary {
  id: string;
  uri: string;
  readme: string | null;
}

export interface ListContextsResponse {
  contexts: ContextSummary[];
  total: number;
}

export interface ContextEntryResponse {
  id: string;
  content: string;
  timestamp: number;
}

export interface GetContextResponse {
  entries: ContextEntryResponse[];
  total: number;
}

export interface AddEntryResponse {
  id: string;
  timestamp: number;
}

export interface ErrorResponse {
  error: string;
}

// WebSocket Types
export interface SubscriptionMessage {
  type: 'update';
  id: string;
  content: string;
  timestamp: number;
}

// Query Parameters
export interface PaginationParams {
  limit: number;
  offset: number;
}

export interface GetContextParams extends PaginationParams {
  order: 'asc' | 'desc';
}

export interface ListContextsParams extends PaginationParams {}
