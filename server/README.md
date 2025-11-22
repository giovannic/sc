# SC Server - Shared Context Server

A production-ready Node.js server for managing shared contexts with real-time
WebSocket subscriptions.

## Architecture Overview

The SC Server implements a distributed context management system with the
following components:

### High-Level Architecture

```
┌─────────────┐         ┌──────────────────┐
│   Client    │◄────────┤  HTTP + WebSocket │
└─────────────┘         └──────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
              ┌─────▼────┐         ┌──────▼──┐
              │  Express │         │ ws (wss)│
              │   (REST) │         │ Server  │
              └─────┬────┘         └──────┬──┘
                    │                     │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Business Logic &   │
                    │  Subscription Mgmt  │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   PostgreSQL DB     │
                    └─────────────────────┘
```

### Core Components

#### 1. Express HTTP Server (`src/app.ts`)
- Handles REST API endpoints for context management
- JSON request/response bodies
- Routes mounted under `/contexts`
- Middleware: JSON body parser

#### 2. WebSocket Server (`src/server.ts`)
- Manages real-time subscriptions to context updates
- Upgrades HTTP connections to WebSocket at `/contexts/:contextId/subscribe`
- Automatic cleanup on client disconnect
- Built with the `ws` library

#### 3. Database Layer
- **Connection Pool** (`src/db/connection.ts`): PostgreSQL connection pooling
  using `pg` library (max 20 connections, 30s idle timeout)
- **Migrations** (`src/db/migrations.ts`): Schema initialization with two tables
  and an index

#### 4. Core Services

**ContextService** (`src/services/contextService.ts`)
- `createContext()`: Create new contexts with optional initial entries
- `getContext()`: Fetch paginated entries (ascending/descending)
- `addEntry()`: Add new entry to context
- `getReadme()`: Retrieve context README
- `updateReadme()`: Update context README

**SubscriptionManager** (`src/services/subscriptionManager.ts`)
- `subscribe()`: Register callback for context updates
- `unsubscribe()`: Remove callback
- `broadcast()`: Send message to all subscribers of a context

#### 5. Routes (`src/routes/contexts.ts`)
RESTful endpoints for all context operations:
- POST /contexts - Create context
- GET /contexts - List contexts
- GET /contexts/:contextId/readme - Get README
- GET /contexts/:contextId/context - Get context entries (paginated)
- POST /contexts/:contextId/context - Add entry
- PUT /contexts/:contextId/readme - Update README

## Database Schema

### contexts table
```sql
CREATE TABLE contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uri VARCHAR(255) UNIQUE NOT NULL,
  readme TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### context_entries table
```sql
CREATE TABLE context_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  context_id UUID NOT NULL REFERENCES contexts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_context_entries_context_id_created_at
  ON context_entries(context_id, created_at);
```

The index optimizes pagination queries on context entries.

## Development Environment Setup

### Prerequisites
- Node.js 18+ & npm
- PostgreSQL 15+ running on localhost:5432
- PostgreSQL client tools (psql) - optional, for direct DB access

### Quick Start - Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```
   Adjust the values if your PostgreSQL uses different credentials or port.

3. **Ensure PostgreSQL is running:**
   ```bash
   # macOS with Homebrew
   brew services start postgresql

   # Linux (Ubuntu/Debian)
   sudo systemctl start postgresql

   # Manual start
   postgres -D /usr/local/var/postgres
   ```

4. **Create the database (if it doesn't exist):**
   ```bash
   createdb sc_server -U sc_user
   # or with psql
   psql -U postgres -c "CREATE DATABASE sc_server OWNER sc_user;"
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```
   - Server runs with nodemon + ts-node and auto-reloads on file changes
   - Database schema is automatically initialized with migrations on first startup
   - Listens on http://localhost:3000

6. **Verify server is running:**
   ```bash
   curl http://localhost:3000/contexts
   ```

7. **Debug with Node Inspector:**
   ```bash
   npm run dev:debug
   ```
   - Node Inspector available at localhost:9229
   - Open `chrome://inspect` in Chrome DevTools to debug
   - Server reloads automatically on file changes

8. **Run tests:**
   ```bash
   npm test           # Single run
   npm run test:watch # Watch mode (auto-rerun on changes)
   ```

## API Endpoints

All responses include appropriate HTTP status codes. Timestamps are Unix
milliseconds.

### Create Context
```
POST /contexts
Content-Type: application/json

{
  "entries": [
    { "content": "Initial entry 1" },
    { "content": "Initial entry 2" }
  ],
  "readme": "Context description"
}

Response (201):
{
  "uri": "a7c8d9e0-b1c2-3d4e-5f6a-7b8c9d0e1f2a",
  "contextId": "a7c8d9e0-b1c2-3d4e-5f6a-7b8c9d0e1f2a"
}
```

### List All Contexts
```
GET /contexts?limit=20&offset=0

Response (200):
{
  "contexts": [
    {
      "id": "a7c8d9e0-b1c2-3d4e-5f6a-7b8c9d0e1f2a",
      "uri": "a7c8d9e0-b1c2-3d4e-5f6a-7b8c9d0e1f2a",
      "readme": "Context description"
    }
  ],
  "total": 42
}
```

### Get Context README
```
GET /contexts/:contextId/readme

Response (200):
{
  "readme": "Context description"
}
```

### Get Context Entries (Paginated)
```
GET /contexts/:contextId/context?order=asc&limit=20&offset=0

Query parameters:
- order: 'asc' (oldest first) or 'desc' (newest first)
- limit: Number of entries per page (default 20)
- offset: Pagination offset (default 0)

Response (200):
{
  "entries": [
    {
      "id": "e7c8d9e0-b1c2-3d4e-5f6a-7b8c9d0e1f2a",
      "content": "Entry content",
      "timestamp": 1700000000000
    }
  ],
  "total": 100
}
```

### Add Context Entry
```
POST /contexts/:contextId/context
Content-Type: application/json

{
  "content": "New entry content"
}

Response (201):
{
  "id": "e7c8d9e0-b1c2-3d4e-5f6a-7b8c9d0e1f2a",
  "timestamp": 1700000000000
}
```

### Update Context README
```
PUT /contexts/:contextId/readme
Content-Type: application/json

{
  "readme": "Updated description"
}

Response (200):
{
  "success": true
}
```

### Subscribe to Context Updates (WebSocket)
```
WS /contexts/:contextId/subscribe

Connection upgrade:
GET /contexts/:contextId/subscribe HTTP/1.1
Upgrade: websocket
Connection: Upgrade

Messages received (on context updates):
{
  "type": "update",
  "id": "e7c8d9e0-b1c2-3d4e-5f6a-7b8c9d0e1f2a",
  "content": "New entry content",
  "timestamp": 1700000000000
}
```

## Configuration

Environment variables (see `.env.example`):

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_DB` | sc_server | Database name |
| `POSTGRES_USER` | sc_user | Database user |
| `POSTGRES_PASSWORD` | sc_password | Database password |
| `POSTGRES_HOST` | localhost | Database host |
| `POSTGRES_PORT` | 5432 | Database port |
| `DATABASE_URL` | auto-generated | Full connection string (overrides above) |
| `NODE_ENV` | development | Environment (development/production) |
| `PORT` | 3000 | Server port |

## Project Structure

```
server/
├── src/
│   ├── app.ts                    # Express app setup
│   ├── server.ts                 # HTTP + WebSocket server
│   ├── db/
│   │   ├── connection.ts         # PostgreSQL pool
│   │   ├── migrations.ts         # Schema initialization
│   │   └── queries.ts            # SQL queries
│   ├── routes/
│   │   └── contexts.ts           # REST endpoints
│   ├── services/
│   │   ├── contextService.ts     # Business logic
│   │   └── subscriptionManager.ts# WebSocket subscriptions
│   └── types/
│       └── index.ts              # TypeScript interfaces
├── test/
│   ├── unit/
│   │   ├── contextService.test.ts
│   │   └── subscriptionManager.test.ts
│   ├── integration/
│   │   ├── api.test.ts
│   │   └── websocket.test.ts
│   └── setup.ts                  # Test utilities
├── .env.example                  # Environment template
├── docker-compose.yml            # Docker Compose config
├── Dockerfile                    # Container image
├── jest.config.js                # Jest test config
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript config
└── README.md                     # This file
```

## Build & Deploy

### Build for Production
```bash
npm run build
# Outputs compiled JavaScript to dist/

npm start
# Runs dist/server.js
```

### Using Docker
```bash
# Build image
docker build -t sc-server .

# Run with external PostgreSQL
docker run -e DATABASE_URL=postgresql://... -p 3000:3000 sc-server
```

Or use Docker Compose for complete setup:
```bash
docker-compose up -d
```

## Testing

### Run All Tests
```bash
npm test
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### Test Organization
- **Unit Tests**: Isolated service logic without database
- **Integration Tests**: Full HTTP requests and WebSocket connections

## Technology Stack

| Component | Library | Version |
|-----------|---------|---------|
| HTTP Server | Express | ^4.18.2 |
| WebSocket | ws | ^8.15.1 |
| Database | pg (node-postgres) | ^8.11.3 |
| UUID Generation | uuid | ^9.0.1 |
| Testing | Jest + Supertest | ^29.7.0, ^6.3.3 |
| Language | TypeScript | ^5.3.3 |
| Runtime | Node.js | 18+ |
| Database | PostgreSQL | 15 |

## Troubleshooting

### Database Connection Failures
- Verify PostgreSQL is running: `psql -U sc_user -h localhost -d sc_server`
- Check environment variables in `.env`
- Ensure port 5432 is not already in use

### WebSocket Connection Issues
- Verify server is running: `curl http://localhost:3000/contexts`
- Check that context ID is valid (UUID format)
- Ensure client supports WebSocket upgrades

### Port Already in Use
- Change `PORT` environment variable
- Or kill the process: `lsof -i :3000` and `kill -9 <PID>`

## Performance Considerations

1. **Database Pooling**: Max 20 concurrent connections, 30s idle timeout
2. **Index on context_entries**: Optimizes pagination queries
3. **WebSocket Broadcasting**: Linear O(n) where n = subscribers to a context
4. **Memory**: UUID generation uses `uuid` library (minimal overhead)

## Security Notes

- SQL queries use parameterized statements (no SQL injection)
- WebSocket paths validated against UUID pattern
- No authentication/authorization implemented (add as needed)
- Database credentials in environment variables (never in code)

## Contributing

Follow TypeScript strict mode. Line length limit of 80 characters. Run tests
before committing.
