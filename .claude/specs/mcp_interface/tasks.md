# MCP Interface for Shared Context - Tasks

## Task List

### Setup & Infrastructure

- [x] **1.1** Create `mcp/` directory structure with `src/`, `package.json`, `tsconfig.json`
  - Ref: Requirement 2.2 (Code Organization)
  - Creates: `mcp/package.json`, `mcp/tsconfig.json`, `mcp/src/`
  - Install dependencies: `@modelcontextprotocol/sdk`, `zod`, `typescript`

- [x] **1.2** Create `src/schemas.ts` with Zod schemas for all data types
  - Ref: Requirement 4.3 (Type Safety) & Design (Schema Definitions)
  - Create schemas for: Context, ContextEntry, CreateContextRequest/Response, AddEntryRequest/Response, UpdateReadmeRequest/Response, ListContextsRequest/Response
  - All schemas should match OpenAPI definitions from `/server/src/openapi.json`

### SC REST API Client

- [x] **2.1** Create `src/client.ts` with base HTTP client for SC REST API
  - Ref: Requirement 3.1 (Integration with SC Server)
  - Implement fetch wrapper with configurable base URL
  - Add methods: `listContexts()`, `createContext()`, `getReadme()`, `updateReadme()`, `getContext()`, `addEntry()`
  - All methods return typed responses

- [x] **2.2** Add error handling to SC REST API client
  - Ref: Design (Error Handling)
  - Parse SC API error responses and convert to descriptive error messages
  - Throw errors with context (status code, error message from API)

### MCP Server Core

- [x] **3.1** Create `src/server.ts` with McpServer instance initialization
  - Ref: Design (Server Setup)
  - Create and export McpServer instance
  - Set name and version information

- [x] **3.2** Create `src/tools.ts` and register `create_context` tool
  - Ref: Requirement 2.2.1 & Design (Tool Handlers)
  - Input: optional `entries` array, optional `readme` string
  - Output: structured content with `contextId` and `uri`
  - Call SC API client's `createContext()` method
  - Use schemas from `schemas.ts` for validation

- [x] **3.3** Register `add_entry` tool in `src/tools.ts`
  - Ref: Requirement 2.2.2 & Design (Tool Handlers)
  - Input: `contextId` (UUID), `content` (string)
  - Output: structured content with entry `id` and `timestamp`
  - Call SC API client's `addEntry()` method

- [x] **3.4** Register `update_readme` tool in `src/tools.ts`
  - Ref: Requirement 2.2.3 & Design (Tool Handlers)
  - Input: `contextId` (UUID), `readme` (string)
  - Output: success boolean in structured content
  - Call SC API client's `updateReadme()` method

- [x] **3.5** Register `list_contexts` tool in `src/tools.ts`
  - Ref: Requirement 2.2.4 & Design (Tool Handlers)
  - Input: optional `limit` (integer, default 20), optional `offset` (integer, default 0)
  - Output: array of context summaries with total count
  - Call SC API client's `listContexts()` method

### MCP Resources

- [x] **4.1** Create `src/resources.ts` with dynamic resource handler
  - Ref: Requirement 2.1 & Design (Resource Handlers, Dynamic Resources)
  - Register resource with URI pattern `context://{contextId}`
  - Extract `contextId` from URI template parameter
  - Fetch context entries from SC API using `getContext()` method
  - Return formatted text with entries in human-readable format

- [x] **4.2** Add README to resource response in `src/resources.ts`
  - Ref: Requirement 2.1.2
  - Fetch README from SC API using `getReadme()` method
  - Include README in resource response at top
  - Handle null/missing README gracefully

- [x] **4.3** Add pagination support to resource handler in `src/resources.ts`
  - Ref: Requirement 2.1.3
  - Support `order` query parameter (asc/desc)
  - Support `limit` and `offset` query parameters
  - Include total count in formatted output

- [x] **4.4** Implement resource notifications in `src/tools.ts`
  - Ref: Requirement 2.1.4 & Design (Resource Notifications)
  - After `add_entry` tool succeeds, call `server.sendResourceListChanged()`
  - After `update_readme` tool succeeds, call `server.sendResourceListChanged()`

### Transport & Entry Point

- [x] **5.1** Create `src/transport.ts` with stdio transport setup
  - Ref: Requirement 2.3.1 & Design (Transport Layer)
  - Export `setupStdioTransport()` function
  - Creates `StdioServerTransport` and connects to McpServer
  - Handles errors and shutdown gracefully

- [ ] **5.2** Add HTTP/SSE transport to `src/transport.ts`
  - Ref: Requirement 2.3.2 & Design (Transport Layer)
  - Export `setupHttpTransport()` function that returns Express middleware
  - Creates fresh transport instance per request
  - Handles streaming responses

- [x] **5.3** Create `src/index.ts` as entry point
  - Ref: Design (Entry Point)
  - Default: starts server with stdio transport
  - Can be imported for custom transport usage
  - Add graceful shutdown handlers (SIGINT, SIGTERM)

- [x] **5.4** Create `mcp/README.md` documenting MCP server usage
  - Ref: Design (Directory Structure)
  - Document how to run the server (stdio mode)
  - Document available tools and resources
  - Provide example requests

### Testing & Validation

- [ ] **6.1** Verify MCP server starts with stdio transport
  - Ref: Success Criteria (line 1)
  - Run `index.ts` and verify no startup errors

- [ ] **6.2** Test `create_context` tool end-to-end
  - Ref: Success Criteria (line 2)
  - Create context via tool, verify response structure
  - Verify context is created on SC server

- [ ] **6.3** Test `context://{id}` resource end-to-end
  - Ref: Success Criteria (line 3)
  - Create context, read it via resource URI
  - Verify entries are formatted correctly

- [ ] **6.4** Test `add_entry` tool end-to-end
  - Ref: Success Criteria (line 4)
  - Add entry to existing context
  - Verify entry appears in resource

- [ ] **6.5** Test `list_contexts` tool
  - Ref: Success Criteria (line 5)
  - List contexts with pagination
  - Verify structure and pagination work

- [ ] **6.6** Test `update_readme` tool
  - Ref: Success Criteria (line 6)
  - Update README, fetch context via resource
  - Verify README changes appear

- [ ] **6.7** Verify error handling
  - Ref: Success Criteria (line 8)
  - Test with invalid contextId
  - Test with malformed requests
  - Verify errors are properly formatted as MCP errors

### Documentation

- [ ] **7.1** Add JSDoc comments to all exported functions
  - Ref: Requirement 4.2 (Protocol Compliance)
  - Document tool inputs/outputs
  - Document resource behavior

## Dependency Graph

```
1.1 → 1.2 → 2.1 → 2.2 → 3.1 → 3.2 → 3.3 → 3.4 → 3.5 → 4.1 → 4.2 → 4.3 → 4.4 → 5.1 → 5.2 → 5.3
                                                                                      ↓
                                                                                  6.1-6.7
                                                                                      ↓
                                                                                  7.1-7.2
```

## Notes

- Tasks are ordered for sequential implementation
- Each task is atomic and touches 1-3 files maximum
- All tasks reference specific requirements and design sections
- Testing tasks (6.x) depend on all implementation being complete
- Documentation tasks (7.x) are final pass

## Acceptance Criteria

All tasks must be completed with:
- Code compiles without TypeScript errors
- All Zod schemas validate correctly
- MCP server responds to all tool/resource requests
- Error handling works as specified
- Code follows patterns from MCP TypeScript SDK
