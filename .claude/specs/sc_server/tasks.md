# SC Server - Task List

## Phase 1: API Specification

### Req 1.1: Define OpenAPI/JSON Schema for REST endpoints
- [x] Create `server/src/openapi.json` with formal OpenAPI 3.0 specification
  - Document all 6 REST endpoints (POST /contexts, GET /contexts, GET /readme, GET /context, POST /context, PUT /readme)
  - Include request/response schemas, status codes, error responses
  - Reference: background.md API Specification section

### Req 1.1b: Add list contexts endpoint to OpenAPI spec
- [x] Update `server/src/openapi.json` with GET /contexts endpoint
  - Include pagination query parameters (limit, offset)
  - Response includes array of contexts with id, uri, and readme
  - Include appropriate status codes and error responses

### Req 1.2: Set up project structure and dependencies
- [x] Create `server/package.json` with dependencies:
  - express, typescript, ts-node
  - pg (node-postgres)
  - ws (WebSocket library)
  - jest, supertest (testing)
  - @types/node, @types/express, @types/ws
- [x] Create `server/tsconfig.json` with strict TypeScript config
- [x] Create `server/.gitignore` for node_modules, dist, .env

### Req 1.3: Define TypeScript types
- [x] Create `server/src/types/index.ts` with interfaces:
  - Context (id, uri, readme, createdAt, updatedAt)
  - ContextEntry (id, contextId, content, createdAt)
  - API request/response types for all endpoints
  - SubscriptionMessage type for WebSocket

### Req 1.4: Set up Docker environment
- [x] Create `server/Dockerfile` for Node.js app with multi-stage build
- [x] Create `server/docker-compose.yml` with:
  - PostgreSQL 15 service (postgres_sc)
  - Node.js app service (sc_server)
  - Volume for PostgreSQL data persistence
  - Environment variables for database connection
- [x] Create `server/.env.example` with database connection details

### Req 1.5: Initialize test infrastructure
- [x] Create `server/jest.config.js` with test configuration
- [x] Create `server/test/setup.ts` for test utilities and helpers
- [x] Create placeholder test files:
  - `server/test/unit/contextService.test.ts`
  - `server/test/unit/subscriptionManager.test.ts`
  - `server/test/integration/api.test.ts`
  - `server/test/integration/websocket.test.ts`

---

## Phase 2: Database Layer (To be approved after Phase 1)

### Req 2.1: Database connection and migrations
- [x] Create `server/src/db/connection.ts` for PostgreSQL pool setup
- [x] Create `server/src/db/migrations.ts` with:
  - Create contexts table
  - Create context_entries table
  - Migration runner function
- [x] Create `server/src/db/queries.ts` with parameterized SQL queries

### Req 2.2: Database initialization tests
- [x] Unit tests for database connection
- [x] Integration tests for table creation

---

## Phase 3: Core Services (To be approved after Phase 2)

### Req 3.1: Context Service
- [ ] Implement `server/src/services/contextService.ts` with:
  - createContext(entries?, readme?)
  - getContext(contextId, order, limit, offset)
  - getReadme(contextId)
  - updateReadme(contextId, readme)
  - addEntry(contextId, content)
  - Unit tests for all methods

### Req 3.2: Subscription Manager
- [ ] Implement `server/src/services/subscriptionManager.ts` with:
  - subscribe(contextId, callback)
  - unsubscribe(contextId, subscriber)
  - broadcast(contextId, message)
  - Unit tests for all methods

---

## Phase 4: Routes & HTTP Layer (To be approved after Phase 3)

### Req 4.1: Express routes
- [ ] Create `server/src/routes/contexts.ts` with all 5 endpoints
- [ ] Create `server/src/app.ts` with Express app setup and route mounting
- [ ] Integration tests for all HTTP endpoints

---

## Phase 5: WebSocket Integration (To be approved after Phase 4)

### Req 5.1: WebSocket server
- [ ] Integrate WebSocket with `server/src/server.ts`
- [ ] Connect subscription manager to WebSocket messages
- [ ] End-to-end tests for WebSocket functionality

---

## Phase 6: Documentation (To be approved after Phase 5)

### Req 6.1: Server README
- [ ] Write `server/README.md` with:
  - Architecture overview
  - Setup instructions for dev environment
  - How to spin up PostgreSQL + Node.js
  - Database schema documentation
  - API endpoint examples
