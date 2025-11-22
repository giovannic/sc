# SC Server - Background Specification

## Requirements

### Core Functionality
1. **Context Creation**
   - Create new shared contexts
   - Return URI for newly created context
   - Support optional initial context entries (collection of entries)
   - Support optional README text initialization

2. **Context Update**
   - Add new context to existing shared contexts
   - Maintain chronological ordering

3. **Context Reading**
   - Read README text for a shared context
   - Read paged context data in chronological order
   - Read paged context data in reverse chronological order
   - Support pagination parameters

4. **Context Subscription**
   - Subscribe to context updates via WebSocket
   - Receive real-time notifications of new additions
   - Support multiple concurrent subscribers per context

### Non-Functional Requirements
- TDD approach: unit tests before implementation
- Technology Stack:
  - Node.js backend
  - PostgreSQL database (minimal, established client)
  - Docker + Docker Compose for development environment
  - No deployment configuration needed
- Architecture Documentation required in `server/README.md`

## Design

### API Specification
The server will expose the following REST + WebSocket endpoints:

#### REST Endpoints

**POST /contexts**
- Create a new shared context
- Request body: `{ entries?: Array<{content: string}>, readme?: string }`
- Response: `{ uri: string, contextId: string }`

**GET /contexts**
- List all contexts
- Query params: `limit=20, offset=0`
- Response: `{ contexts: Array<{id, uri, readme}>, total: number }`

**GET /contexts/:contextId/readme**
- Retrieve README for a context
- Response: `{ readme: string }`

**GET /contexts/:contextId/context**
- Retrieve paginated context
- Query params: `order=asc|desc, limit=20, offset=0`
- Response: `{ entries: Array<{id, content, timestamp}>, total: number }`

**POST /contexts/:contextId/context**
- Add new context entry
- Request body: `{ content: string }`
- Response: `{ id: string, timestamp: number }`

**PUT /contexts/:contextId/readme**
- Update README for a context
- Request body: `{ readme: string }`
- Response: `{ success: boolean }`

#### WebSocket Endpoint

**WS /contexts/:contextId/subscribe**
- Subscribe to real-time updates
- Messages: `{ type: 'update', id: string, content: string, timestamp: number }`

### Database Schema

**contexts** table
- id (UUID primary key)
- uri (string, unique)
- readme (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)

**context_entries** table
- id (UUID primary key)
- context_id (UUID, foreign key)
- content (text)
- created_at (timestamp)

### Technology Choices
- **Framework**: Express.js for REST, ws library for WebSocket
- **Database Client**: pg (node-postgres) - minimal, stable, widely used
- **Testing**: Jest + Supertest for HTTP testing, ws for WebSocket testing
- **Development**: Docker Compose with PostgreSQL service

### Directory Structure
```
server/
├── src/
│   ├── app.ts           # Express app setup
│   ├── server.ts        # HTTP + WebSocket server
│   ├── db/
│   │   ├── connection.ts
│   │   ├── migrations.ts
│   ├── routes/
│   │   ├── contexts.ts
│   │   └── contextEntries.ts
│   ├── services/
│   │   ├── contextService.ts
│   │   └── subscriptionManager.ts
│   └── types/
│       └── index.ts
├── test/
│   ├── unit/
│   │   ├── contextService.test.ts
│   │   └── subscriptionManager.test.ts
│   ├── integration/
│   │   ├── api.test.ts
│   │   └── websocket.test.ts
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```

## Implementation Approach

1. **Phase 1: API Specification** (this phase)
   - Define formal OpenAPI/JSON Schema for all endpoints
   - Create unit test stubs

2. **Phase 2: Database Layer**
   - Set up Docker PostgreSQL
   - Create migration system
   - Implement database models and queries

3. **Phase 3: Core Services**
   - Implement ContextService with business logic
   - Implement SubscriptionManager for WebSocket handling
   - Unit tests for each service

4. **Phase 4: Routes & HTTP Layer**
   - Implement Express routes for all REST endpoints
   - Integration tests for HTTP endpoints

5. **Phase 5: WebSocket Integration**
   - Integrate WebSocket with subscription manager
   - End-to-end tests

6. **Phase 6: Documentation**
   - Write server/README.md with architecture and setup instructions
