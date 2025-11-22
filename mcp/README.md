# SC MCP Server

Model Context Protocol (MCP) server for the Shared Context (SC) system.
Provides agentic access to shared contexts through a standardized MCP interface.

## Features

- **Dynamic Resource Access**: Read shared contexts via `context://{contextId}` resources
- **Context Mutations**: Create, update, and add entries to contexts via MCP tools
- **Pagination**: Support for paginated context listing and entry retrieval
- **Type Safety**: Full TypeScript with Zod schema validation
- **Error Handling**: Graceful error handling with descriptive messages

## Installation

```bash
npm install
```

## Running

### Stdio Transport (default)

```bash
npm run dev
```

or

```bash
npm run build
npm start
```

SC Server URL can be configured via environment variable:

```bash
SC_SERVER_URL=http://localhost:3000 npm run dev
```

## Available Tools

### create_context

Create a new shared context with optional initial entries and README.

**Input:**
- `entries` (optional): Array of `{ content: string }`
- `readme` (optional): README text

**Output:**
- Text response with context ID and URI

### add_entry

Add an entry to an existing context.

**Input:**
- `contextId` (required): UUID of the context
- `content` (required): Entry content

**Output:**
- Text response with entry ID and timestamp
- Triggers resource update notification

### update_readme

Update the README for a context.

**Input:**
- `contextId` (required): UUID of the context
- `readme` (required): New README text

**Output:**
- Text response confirming update
- Triggers resource update notification

### list_contexts

List available contexts with pagination.

**Input:**
- `limit` (optional): Number of contexts (default: 20)
- `offset` (optional): Skip count (default: 0)

**Output:**
- Text response with context list and total count

## Available Resources

### context://{contextId}

Read a shared context with all entries and README.

**Query Parameters:**
- `order` (optional): `asc` or `desc` (default: `desc`)
- `limit` (optional): Number of entries (default: 20)
- `offset` (optional): Skip count (default: 0)

**Output:**
- Formatted text with context ID, README, and entries

## Project Structure

```
mcp/
├── src/
│   ├── index.ts        # Entry point
│   ├── server.ts       # MCP server setup
│   ├── tools.ts        # Tool handlers
│   ├── resources.ts    # Resource handlers
│   ├── client.ts       # SC REST API client
│   ├── schemas.ts      # Zod schema definitions
│   └── transport.ts    # Transport layer
├── package.json
├── tsconfig.json
└── README.md
```

## Configuration

### Environment Variables

- `SC_SERVER_URL`: Base URL for SC REST API (default: `http://localhost:3000`)

## Type Safety

All tool inputs and resource reads are validated using Zod schemas defined in
`src/schemas.ts`. The schemas match the OpenAPI definitions from the SC server.

## Error Handling

- Tool errors are caught and returned as error content in responses
- Resource read errors include descriptive messages
- SC API errors are parsed and re-thrown with context
