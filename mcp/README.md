# SC MCP Server - Model Context Protocol Integration

Model Context Protocol (MCP) server for the Shared Context (SC) system.
Provides agentic access to shared contexts through a standardized MCP interface.

## Features

- **Dynamic Resource Access**: Read shared contexts via `context://{contextId}` resources
- **Context Mutations**: Create, update, and add entries to contexts via MCP tools
- **Pagination**: Support for paginated context listing and entry retrieval
- **Type Safety**: Full TypeScript with Zod schema validation
- **Error Handling**: Graceful error handling with descriptive messages
- **Hot Reloading**: Development server with automatic reload on TypeScript changes
- **Node Inspector**: Debug mode with Chrome DevTools support

## Development Environment Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- SC Server running (typically on `localhost:3000`)

### Installation

```bash
npm install
```

### Quick Start - Development

```bash
npm run dev
```

- Server starts in stdio transport mode
- Auto-reloads on TypeScript file changes via nodemon
- Connects to SC Server at `http://localhost:3000` by default
- Logs appear in terminal

### Quick Start - Production

```bash
npm run build
npm start
```

### Debug Mode

```bash
npm run dev:debug
```

- Node Inspector available at localhost:9232
- Open `chrome://inspect` in Chrome DevTools
- Server reloads automatically on file changes

### Environment Variables

```bash
SC_SERVER_URL=http://localhost:3000 npm run dev
```

| Variable | Default | Description |
|----------|---------|-------------|
| `SC_SERVER_URL` | `http://localhost:3000` | SC Server base URL |

## Claude Desktop Integration

### Installation Steps

1. **Build the MCP server:**
   ```bash
   cd /Users/gc1610/projects/sc/mcp
   npm install
   npm run build
   ```

2. **Open Claude Desktop configuration file:**
   ```bash
   open ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

3. **For Development (with hot reloading):**
   Add to your `mcpServers` config:
   ```json
   {
     "mcpServers": {
       "sc-dev": {
         "command": "npm",
         "args": ["run", "dev"],
         "cwd": "/Users/gc1610/projects/sc/mcp",
         "env": {
           "SC_SERVER_URL": "http://localhost:3000"
         }
       }
     }
   }
   ```

4. **For Production (pre-built):**
   Add to your `mcpServers` config:
   ```json
   {
     "mcpServers": {
       "sc": {
         "command": "node",
         "args": ["/Users/gc1610/projects/sc/mcp/dist/index.js"],
         "env": {
           "SC_SERVER_URL": "http://localhost:3000"
         }
       }
     }
   }
   ```

5. **Restart Claude Desktop** to load the configuration

6. **Verify installation:**
   - Claude should show "SC" or "SC-Dev" in the MCP servers list
   - You should be able to see the available tools in Claude's tool list

### Configuration Notes

- **Development config** (`npm run dev`) provides hot reloading but requires
  npm to be installed
- **Production config** uses pre-built JavaScript for faster startup
- Change `SC_SERVER_URL` if your server runs on a different host/port
- Use absolute paths for both `cwd` (dev) and file paths (production)

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

## Testing

Currently testing is done through integration with SC Server. To test tools:

1. Ensure SC Server is running (`npm run dev` in `/server`)
2. Start the MCP server (`npm run dev`)
3. Tools are accessible through Claude Desktop or MCP client libraries

## Troubleshooting

### MCP Server doesn't connect to Claude Desktop

1. Check Claude Desktop logs:
   ```bash
   tail -f ~/Library/Logs/Claude/mcp.log
   ```

2. Verify config path is correct:
   ```bash
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

3. Ensure development server is running:
   ```bash
   cd /Users/gc1610/projects/sc/mcp && npm run dev
   ```

### Cannot connect to SC Server

1. Check SC Server is running:
   ```bash
   curl http://localhost:3000/contexts
   ```

2. Verify environment variable:
   ```bash
   echo $SC_SERVER_URL
   ```

3. Update Claude Desktop config with correct `SC_SERVER_URL`

### TypeScript compilation errors

Run the TypeScript compiler:
```bash
npx tsc --noEmit
```

## Technology Stack

| Component | Library | Version |
|-----------|---------|---------|
| Protocol | Model Context Protocol | ^1.0.0 |
| Validation | Zod | ^3.22.4 |
| Runtime | Node.js | 18+ |
| Language | TypeScript | ^5.3.3 |
| Execution | tsx | ^4.7.0 |
| Auto-reload | nodemon | ^3.0.2 |

## Performance Considerations

- Hot reloading via nodemon adds minimal overhead in development
- Production build is pre-compiled for faster startup
- MCP server is stateless (all state in SC Server)
- Linear performance scaling with number of contexts/entries
