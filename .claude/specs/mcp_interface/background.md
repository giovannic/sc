# MCP Interface for Shared Context - Background

## Overview

This specification describes the design and implementation of a Model Context Protocol (MCP) server that provides agentic access to the Shared Context (SC) system. The MCP server will be the primary method for agents to interact with shared contexts through a standardized protocol, complementing the REST API and web interface already defined in the SC architecture.

## Requirements

### Functional Requirements

1. **Dynamic Resource Access**
   - Expose shared contexts as MCP resources with URI pattern `context://{contextId}`
   - Support reading context entries with pagination (chronological and reverse-chronological order)
   - Support reading context README as a separate resource
   - Enable resource notifications when contexts are updated

2. **Context Mutations via Tools**
   - Provide a tool to create new shared contexts with optional initial entries and README
   - Provide a tool to add entries to existing contexts
   - Provide a tool to update README for existing contexts
   - Provide a tool to list available contexts with pagination

3. **Connection Management**
   - Support stdio transport for CLI/local process integration
   - Support HTTP/SSE transport for web-based agents
   - Handle server lifecycle properly (startup, shutdown, error handling)

4. **Protocol Compliance**
   - Use Zod schemas for input/output validation
   - Provide clear descriptions for all tools and resources
   - Return properly formatted MCP responses with both human-readable and structured content

### Non-Functional Requirements

1. **Integration with SC Server**
   - Connect to SC REST API (defined in `/server/src/openapi.json`)
   - Translate MCP requests to SC REST API calls
   - Handle API errors gracefully with appropriate MCP error responses

2. **Code Organization**
   - All code lives in the `mcp/` directory
   - Follow TypeScript SDK patterns and conventions
   - Maintain separation between transport, server logic, and API client

3. **Type Safety**
   - Use TypeScript throughout
   - Define comprehensive Zod schemas for all inputs/outputs
   - No `any` types without justification

## Design

### Architecture Overview

```
MCP Client (Agent)
      ↓
   Transport Layer (stdio or HTTP/SSE)
      ↓
   McpServer Instance
      ├── Resources: context://{id} (read contexts)
      ├── Tools: create/update/list operations
      └── Notifications: context changed events
      ↓
   SC REST API Client
      ↓
   SC Server REST API
```

### Directory Structure

```
mcp/
├── src/
│   ├── index.ts                 # Entry point
│   ├── server.ts                # McpServer setup and registration
│   ├── resources.ts             # Resource handlers (contexts)
│   ├── tools.ts                 # Tool handlers (mutations)
│   ├── client.ts                # SC REST API client
│   ├── schemas.ts               # Zod schema definitions
│   └── transport.ts             # Transport layer setup
├── package.json
├── tsconfig.json
└── README.md
```

### Key Components

#### 1. SC REST API Client (`client.ts`)
- Wrapper around fetch for SC REST API
- Methods for all CRUD operations (list, get, create, add entry, update readme)
- Handles error responses from SC server
- Type-safe responses matching OpenAPI schema

#### 2. Schema Definitions (`schemas.ts`)
- Zod schemas for MCP tool inputs/outputs
- Schemas for context entries, context summaries
- Validation happens automatically through McpServer

#### 3. Resource Handlers (`resources.ts`)
- Register dynamic resource: `context://{contextId}`
- Implement resource handler that fetches context from SC API
- Return paginated entries in human-readable format
- Support query parameters for order and pagination

#### 4. Tool Handlers (`tools.ts`)
- `create_context`: Create new shared context
- `add_entry`: Add entry to existing context
- `update_readme`: Update README for context
- `list_contexts`: List available contexts with pagination

#### 5. Server Setup (`server.ts`)
- Create McpServer instance
- Register all resources and tools
- Export server instance for transport layer to use

#### 6. Transport Layer (`transport.ts`)
- Export functions to setup stdio transport
- Export functions to setup HTTP/SSE transport
- Handle server lifecycle

#### 7. Entry Point (`index.ts`)
- Default: start server with stdio transport
- Can be imported to use with custom transport

### Design Decisions

1. **Dynamic Resources vs Static**
   - Use dynamic resources with URI templates (`context://{contextId}`) instead of listing all contexts
   - Resources are fetched on-demand from SC REST API
   - Avoids caching complexity and keeps data fresh

2. **Tools for All Mutations**
   - Create, update, and delete operations are tools
   - Tools can return structured content alongside human-readable text
   - Allows agents to parse responses reliably

3. **Resource Notifications**
   - When an entry is added via tool, call `server.sendResourceListChanged()`
   - Notifies clients that the resource has changed
   - Clients can re-fetch if needed

4. **Error Handling**
   - Throw errors from handlers - McpServer converts to JSON-RPC errors
   - Include context from SC API error responses
   - Use appropriate HTTP status codes in error messages

5. **No Caching**
   - All requests go directly to SC REST API
   - Simplifies implementation and avoids cache invalidation
   - SC API can implement caching if needed

### API Client Design

The SC REST API client will use the OpenAPI schema to understand available endpoints:

- `GET /contexts` - List contexts (query: limit, offset)
- `POST /contexts` - Create context (body: entries, readme)
- `GET /contexts/{contextId}/readme` - Get README
- `PUT /contexts/{contextId}/readme` - Update README
- `GET /contexts/{contextId}/context` - Get context entries (query: order, limit, offset)
- `POST /contexts/{contextId}/context` - Add entry (body: content)

### Response Format Example

**Tool: create_context**
```json
{
  "content": [
    {
      "type": "text",
      "text": "Created context with ID: 550e8400-e29b-41d4-a716-446655440000"
    }
  ],
  "structuredContent": {
    "contextId": "550e8400-e29b-41d4-a716-446655440000",
    "uri": "context://550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Resource: context://550e8400-e29b-41d4-a716-446655440000**
```json
{
  "contents": [
    {
      "uri": "context://550e8400-e29b-41d4-a716-446655440000",
      "text": "Context ID: 550e8400-e29b-41d4-a716-446655440000\n\n## README\n\nThis is a test context.\n\n## Entries (latest first)\n\n1. Entry 1 (2024-01-15 10:30:00 UTC)\n   Content here\n\n2. Entry 2 (2024-01-15 10:00:00 UTC)\n   More content"
    }
  ]
}
```

## Dependencies

- `@modelcontextprotocol/sdk` - MCP server implementation
- `zod` - Schema validation
- `typescript` - Type checking
- `ts-node` or `tsx` - Runtime for index.ts

## Implementation Timeline

1. Setup project structure and dependencies
2. Implement SC REST API client
3. Define Zod schemas
4. Implement resource handlers
5. Implement tool handlers
6. Setup McpServer with all registrations
7. Implement transport layer
8. Test with MCP client

## Success Criteria

- [x] MCP server starts without errors (stdio and HTTP)
- [x] Agents can create contexts via `create_context` tool
- [x] Agents can read contexts via `context://{id}` resource
- [x] Agents can add entries via `add_entry` tool
- [x] Agents can list contexts via `list_contexts` tool
- [x] Agents can update README via `update_readme` tool
- [x] All responses match expected schemas
- [x] Error handling works correctly
