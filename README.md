# Shared Context (SC)

SC is a web service which provides an on-demand shared context for humans and agents, for the purpose of collaboration. This can be used as an alternative to multi-agent orchestration for ad-hoc tasks, where you do not want to specify a closed formal system.

SC can be accessed through a web interface or Model Context Protocol. It provides support for synchronous actions such as context creation, reading and updating. It also provides support for asynchronous actions through a publish/subscribe protocol. Please note that MCP support for asynchronous actions is new and experimental at the time of writing [1].

# Usage

SC usage is best described through its endpoints:

*Creation*

Create a new shared context and get an associated URI. Optionally includes a context to intialise with and a `README` text. This URI can be used to subscribe to changes.

*Update*

Add new context to an existing shared context.

*Read*

Read the context, either:

 * the `README` - which can serve as a summary, a shared prompt or a general instructions for interacting with the context
 * paged context in chronolocical or reverse chronological order

*Subscribe*

Receive updates through websockets of new additions to a shared context

## Web-interface

The web interface is a fork of Open WebUI designed to integrate with an SC server with the above endpoints. The new features are:

 * creation and updating of README for shared contexts
 * notifications on receipt of new shared context

## MCP server

The MCP server provides tight integration with agents through MCP methods for interacting with the above endpoints.

# Development Environment

This is a monorepo with three main components, each with its own development
environment and hot reloading for efficient debugging.

## Project Structure

```
sc/
├── server/          # Node.js REST + WebSocket API (Express)
├── web/             # SvelteKit web UI (git submodule)
├── mcp/             # Model Context Protocol server
├── .claude/specs/   # Detailed specifications
└── README.md        # This file
```

## Quick Start - All Three Services

Run each command in a separate terminal:

### Terminal 1: Database & Server

```bash
cd /Users/gc1610/projects/sc/server
npm install
docker-compose up     # Starts PostgreSQL + runs server in dev mode
# Server listens on http://localhost:3000
```

### Terminal 2: Web UI

```bash
cd /Users/gc1610/projects/sc/web
nvm use 22
npm install --legacy-peer-deps
export NODE_OPTIONS=--max-old-space-size=4096
npm run dev          # Vite dev server with HMR
# Web UI available at http://localhost:5173
```

### Terminal 3: MCP Server (for Claude Desktop integration)

```bash
cd /Users/gc1610/projects/sc/mcp
npm install
npm run dev          # Starts with hot reload
```

Then configure Claude Desktop (see `mcp/README.md` for details).

## Component-Specific Documentation

### Server (`/server`)
- REST API and WebSocket server
- PostgreSQL database with migrations
- Hot reload with nodemon + ts-node
- Debug mode with Node Inspector
- Full test suite with Jest

**See `server/README.md` for:**
- Installation steps
- API endpoint reference
- Database schema
- Debugging instructions
- Performance notes

### Web (`/web`)
- SvelteKit frontend with Vite build tool
- Hot module reloading (HMR)
- Svelte 5 with TypeScript
- Tailwind CSS styling
- Git submodule from feat/web branch

**See `web/DEVELOPMENT.md` for:**
- Node version requirements (22.x)
- Memory flag explanation
- Submodule workflow
- Browser debugging
- Integration with SC Server

### MCP (`/mcp`)
- Model Context Protocol server
- Provides tools for Claude/agents
- Hot reload with nodemon + tsx
- Node Inspector debugging
- Zod validation

**See `mcp/README.md` for:**
- Installation steps
- Claude Desktop integration recipe
- Available tools and resources
- Development and production configs
- Troubleshooting

## Key Features of Dev Environment

### ✅ Hot Reloading

All three components auto-reload on file changes:
- **Server**: nodemon + ts-node (500ms reload)
- **Web**: Vite HMR (typically <500ms per component)
- **MCP**: nodemon + tsx

### ✅ Debugging

Multiple debugging options available:
- **Server**: Node Inspector at localhost:9229 (`npm run dev:debug`)
- **Web**: Browser DevTools (F12) with Svelte DevTools extension
- **MCP**: Node Inspector at localhost:9232 (`npm run dev:debug`)

### ✅ Easy Parallel Development

Run all three services simultaneously in separate terminals with
independent logs for easy troubleshooting.

### ✅ Database

- PostgreSQL 15 via Docker Compose
- Automatic schema migrations
- Persistent data across server reloads
- Easy reset: `docker-compose down -v && docker-compose up`

## Common Development Tasks

### Restart Services

```bash
# Server + Database
docker-compose down && docker-compose up

# Web UI (just press Ctrl+C and re-run)
npm run dev

# MCP (just press Ctrl+C and re-run)
npm run dev
```

### Run Tests

```bash
# Server tests
cd server && npm test

# Server tests in watch mode
cd server && npm test:watch

# Web frontend tests
cd web && npm run test:frontend

# Web E2E tests
cd web && npm run cy:open
```

### Build for Production

```bash
# Server: builds to dist/
cd server && npm run build

# Web: builds to build/
cd web && npm run build

# MCP: builds to dist/
cd mcp && npm run build
```

### Run Production Build Locally

```bash
# Server (after npm run build)
npm start

# Web (after npm run build)
npm run preview

# MCP (after npm run build)
npm start
```

## Environment Variables

### Server
- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Server port (default 3000)
- `NODE_ENV`: development or production

### MCP
- `SC_SERVER_URL`: SC Server URL (default http://localhost:3000)

### Web
- `VITE_SC_SERVER_URL`: SC Server URL (optional)

## Typical Development Workflow

1. **Start all services** in separate terminals
2. **Edit code** in your favorite editor
3. **Changes auto-reload** (see file saving)
4. **Test in browser** at http://localhost:5173
5. **View logs** in respective terminals
6. **Use debuggers** as needed (Node Inspector or browser DevTools)
7. **Run tests** before committing: `npm test` in component folder
8. **Build and verify**: `npm run build`

## Troubleshooting

### Services Won't Start

```bash
# Check if ports are in use
lsof -i :3000    # Server port
lsof -i :5432    # PostgreSQL port
lsof -i :5173    # Web UI port

# Kill processes if needed
kill -9 <PID>
```

### Cannot Connect to SC Server from Web

1. Verify server is running: `curl http://localhost:3000/contexts`
2. Check browser console for errors (F12)
3. Verify network tab shows requests to localhost:3000

### Out of Memory During Web Build

```bash
export NODE_OPTIONS=--max-old-space-size=8192
npm run dev
```

### Database Connection Failed

```bash
# Check PostgreSQL is running
docker-compose ps

# View logs
docker-compose logs postgres_sc

# Restart
docker-compose down && docker-compose up
```

### Changes Not Hot Reloading

- **Server**: Check logs for nodemon errors, ensure src/ files are saved
- **Web**: Clear `.svelte-kit` directory if HMR fails
- **MCP**: Check terminal for tsx compilation errors

## Architecture Overview

```
Claude Desktop
    ↓ (MCP stdio)
┌─────────────────────────────────────┐
│  MCP Server (localhost:9232 debug)  │
│  - Tools: create_context, add_entry │
│  - Resources: context://...         │
└──────────────┬──────────────────────┘
               ↓ (HTTP REST calls)
   ┌───────────────────────────────────┐
   │ SC Server (localhost:3000)         │
   │ - Express HTTP API                │
   │ - WebSocket subscriptions         │
   │ ↓                                 │
   │ PostgreSQL Database               │
   └───────────┬───────────────────────┘
               ↑ (HTTP REST calls)
┌──────────────────────────────────────┐
│ Web UI (localhost:5173)              │
│ - SvelteKit + Vite HMR              │
│ - Browser DevTools for debugging    │
└──────────────────────────────────────┘
```

## Additional Resources

- [SC Server API Docs](./server/README.md)
- [Web UI Development Guide](./web/DEVELOPMENT.md)
- [MCP Integration Guide](./mcp/README.md)
- [Specifications](./claude/specs/)

# References

[1] - https://github.com/modelcontextprotocol/modelcontextprotocol/issues/982
