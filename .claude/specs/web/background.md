# Background: Shared Context Web Interface

## Requirements

### 1. Feature Goals
- **Primary Goal**: Create a web interface for the Shared Context (SC) server that serves as the main method for human interaction with shared contexts
- **Scope**: Focus on context management (create, read, update via context entry additions), README management, and real-time updates
- **Not in Scope**: User authentication (assume token-based auth works), administrative features, data persistence beyond what SC server provides

### 2. Functional Requirements
From README.md and OpenAPI spec (`server/src/openapi.json`):

**Context Management**:
- FR-1: List all contexts with pagination (GET `/contexts?limit&offset`)
- FR-2: Create new context with optional initial entries and README (POST `/contexts`)
- FR-3: View context details: README and paginated context entries (GET `/contexts/{contextId}/readme`, GET `/contexts/{contextId}/context?order&limit&offset`)
- FR-4: Add new entry to context (POST `/contexts/{contextId}/context`)
- FR-5: Update README for a context (PUT `/contexts/{contextId}/readme`)

**Real-time Updates**:
- FR-6: Subscribe to context changes via WebSocket (WebSocket subscription model per README)
- FR-7: Display new entries as they're added without page refresh

**User Experience**:
- FR-8: Intuitive navigation between contexts (sidebar or dropdown)
- FR-9: Display README as summary/instructions for context
- FR-10: Chronological or reverse-chronological entry ordering
- FR-11: Responsive design that works on desktop and tablet

### 3. Non-Functional Requirements
- **Performance**: Paginated context entries (default 20 items per page)
- **Accessibility**: Follow WCAG 2.1 AA standards (inherit from Open WebUI)
- **Maintainability**: Follow Open WebUI code patterns and conventions
- **Code Reuse**: Minimize new code by adapting existing Open WebUI components (target: <800 lines of new code)
- **Testing**: E2E test coverage for critical user flows (create context, add entry)

---

## Analysis: Existing Codebase

### Open WebUI Architecture (from investigation)
- **Framework**: SvelteKit 2.x with Vite, Svelte 5, TypeScript, Tailwind CSS 4
- **Backend**: Python REST API at `/api/v1/*`
- **Authentication**: Bearer token in localStorage, validated at startup
- **State Management**: Svelte writable stores (reactive primitives)
- **Real-time**: Socket.IO for WebSocket communication
- **API Pattern**: Functional API layer in `/src/lib/apis/` (NOT class-based)
- **Error Handling**: Consistent try-catch-toast pattern across all APIs
- **Routing**: SvelteKit file-based routing with protected `(app)` group

### Key Components & Patterns
- **Chat Sidebar**: `/src/lib/components/layout/Sidebar.svelte` - reusable for contexts list
- **Message Display**: `/src/lib/components/chat/Messages.svelte` - adaptable for context entries
- **Message Rendering**: `/src/lib/components/chat/Messages/ContentRenderer.svelte` - works for entries
- **Modal Pattern**: `/src/lib/components/common/Modal.svelte` - usable for README editing
- **Input Pattern**: Simple form inputs with validation (can adapt MessageInput.svelte)
- **Store Pattern**: Global stores in `/src/lib/stores/index.ts` with subscriptions in components

### Reusable Assets
| Asset | Current Use | SC Adaptation |
|-------|------------|---|
| Sidebar UI | Chat list | Context list (same HTML structure) |
| Messages list | Chat messages | Context entries (remove role/model columns) |
| ContentRenderer | Message markdown | Entry markdown |
| Modal | Settings dialog | README editor |
| Toast notifications | Error/success | Entry added, context created |
| Store subscription pattern | Chat state | Context state |
| API error handling | All APIs | Context API |
| Layout structure | App layout | Works as-is |

### What Must Change
1. **Routes**: Add `/contexts/*` routes instead of chat routes
2. **Components**: Create simplified context-specific UI (no model/role/branching)
3. **API Layer**: New `/src/lib/apis/contexts/` folder with SC API integration
4. **Stores**: Add context-related stores (currentContext, entries, etc.)
5. **Input**: Simplified text-only entry input (no files, images, code execution)

---

## Design

### 1. Data Models

```typescript
// /src/lib/types/context.ts (NEW)
export interface ContextEntry {
  id: string;           // UUID from SC API
  content: string;      // Entry text (markdown)
  timestamp: number;    // Unix timestamp in milliseconds
}

export interface Context {
  id: string;          // UUID from SC API
  uri: string;         // Unique context URI
  readme: string | null; // README content
}

export interface CreateContextRequest {
  entries?: Array<{ content: string }>;
  readme?: string;
}

export interface ListContextsResponse {
  contexts: Context[];
  total: number;
}

export interface GetContextResponse {
  entries: ContextEntry[];
  total: number;
}
```

### 2. API Layer Design

**File**: `/src/lib/apis/contexts/index.ts` (~250 lines)

**Functions**:
```typescript
// Functional API pattern matching existing codebase
export const createContext = (token, data: CreateContextRequest) => Promise<{uri, contextId}>
export const listContexts = (token, limit?, offset?) => Promise<ListContextsResponse>
export const getContext = (token, contextId, order?, limit?, offset?) => Promise<GetContextResponse>
export const getContextReadme = (token, contextId) => Promise<{readme}>
export const updateContextReadme = (token, contextId, readme) => Promise<{success}>
export const addContextEntry = (token, contextId, content) => Promise<{id, timestamp}>
```

**Pattern**:
- Bearer token authentication (inherit from existing pattern)
- Error handling: try-catch with console.error and throw
- Response parsing: .json() then return
- Base URL: `$env.PUBLIC_SC_API_URL` (configurable)

### 3. State Management Design

**Add to `/src/lib/stores/index.ts`**:
```typescript
export const contexts: Writable<Context[]>        // All contexts
export const contextId: Writable<string | null>   // Current context ID
export const contextReadme: Writable<string>      // Current context README
export const contextEntries: Writable<ContextEntry[]> // Current context entries
export const contextTotal: Writable<number>       // Total entries for pagination
```

**Subscription Pattern** (in components):
```svelte
<script>
  import { contextEntries, contextId } from '$lib/stores';

  $: entries = $contextEntries;
  $: id = $contextId;
</script>
```

### 4. Route Structure

**New Routes**:
```
/src/routes/(app)/
├── contexts/
│   ├── +layout.svelte              (Fetch contexts list, render sidebar)
│   ├── +page.svelte                (Empty or welcome page)
│   └── [contextId]/
│       ├── +page.svelte            (Main context viewer)
│       └── +layout.svelte          (Fetch context details)
```

**Route Responsibilities**:
- `/contexts` layout: Load all contexts, set up WebSocket subscription
- `/contexts/[contextId]` layout: Load context readme, initial entries
- `/contexts/[contextId]` page: Render context with entries, input

### 5. Component Structure

**New Components** (~600 lines total):

1. **`/src/lib/components/context/ContextViewer.svelte`** (~250 lines)
   - Main container for context display
   - Renders README section with edit button
   - Renders paginated entries list
   - Renders add-entry input
   - Handles scrolling for pagination

2. **`/src/lib/components/context/ContextReadmeEditor.svelte`** (~100 lines)
   - Modal with markdown editor for README
   - Save/cancel buttons
   - Reuse Modal.svelte component

3. **`/src/lib/components/context/ContextEntries.svelte`** (~150 lines)
   - List of entries with timestamps
   - Render markdown content via ContentRenderer.svelte
   - Infinite scroll for pagination
   - Real-time update on new entries

4. **`/src/lib/components/context/AddEntryInput.svelte`** (~100 lines)
   - Simple text input + submit button
   - Disabled while submitting
   - Show loading spinner
   - Error toast on failure

**Adapted Components** (minor changes):
- Sidebar.svelte: Loop over contexts instead of chats
- +layout.svelte: Load contexts instead of chats

### 6. WebSocket Integration Design

**Location**: `(app)/+layout.svelte`

**Implementation**:
```typescript
// Subscribe to context updates when context changes
$: if ($contextId) {
  // Connect to WS for this context
  socket?.emit('subscribe', { contextId: $contextId });
  socket?.on('context:update', (entry) => {
    contextEntries.update(e => [...e, entry]);
  });
}
```

**Note**: Depends on SC server exposing WebSocket endpoint. If not available, fall back to polling.

### 7. UI/UX Design

**Layout**:
```
┌────────────────────────────────────┐
│ Navigation Bar (contexts dropdown)  │
├────────┬────────────────────────────┤
│        │ README (collapsible)       │
│ Sidebar│ ──────────────────────────  │
│ (list) │ Entries (paginated list)   │
│        │ ──────────────────────────  │
│ Ctx 1  │ + Add Entry Input          │
│ Ctx 2  │                            │
│ Ctx 3  │                            │
│ ...    │                            │
└────────┴────────────────────────────┘
```

**README Display**:
- Shown at top of context view
- Collapsed by default (show first 100 chars)
- Expandable, renders markdown
- Edit button opens modal

**Entries**:
- Chronological by default (order=asc)
- Timestamp on each entry
- Markdown rendering with syntax highlighting
- 20 entries per page
- "Load more" button at bottom or infinite scroll

**Entry Input**:
- Text field at bottom of entries list
- Auto-focus when context selected
- Submit button / Enter to send
- Show spinner while submitting
- Disabled during submission

### 8. Error Handling & Edge Cases

**Error States**:
- Network error creating context → Toast with "Try again" button
- Network error loading entries → Show error message, "Retry" button
- Network error adding entry → Toast, keep text in input for retry
- Context not found (404) → Show "Context not found" message, redirect to contexts list
- Unauthorized (401) → Redirect to login

**Edge Cases**:
- Empty context (no entries) → Show "No entries yet" message
- Empty README → Show placeholder "No README set"
- Very long entries → Truncate display, show "Read more" button
- Rapid entry additions → Debounce requests, show optimistic UI
- WebSocket disconnect → Show warning banner, retry connection

### 9. Performance Considerations

- **Pagination**: Load 20 entries at a time (default from SC API)
- **Component Splitting**: Keep ContextViewer ~250 lines max
- **Store Subscriptions**: Unsubscribe on unmount
- **WebSocket**: Single connection shared across contexts
- **Markdown Rendering**: ContentRenderer already optimized (inherited from chats)

### 10. Implementation Strategy

**Phase 1: Foundation** (Day 1)
- Create context API layer
- Add types and stores
- Create basic routes and layout

**Phase 2: UI Components** (Day 1-2)
- Build ContextViewer container
- Build ContextEntries list
- Build AddEntryInput
- Adapt Sidebar for contexts

**Phase 3: Features** (Day 2)
- README display and editing
- Pagination
- Real-time updates (if SC API supports)

**Phase 4: Polish** (Day 2-3)
- Error handling
- Loading states
- Responsive design
- Edge case handling

**Phase 5: E2E Testing** (Day 3)
- Create Cypress test for creating a context
- Create Cypress test for adding an entry to a context
- Verify both tests pass with real SC server

---

## Summary

This design leverages Open WebUI's proven patterns to integrate SC API with **minimal new code** (~600-800 lines) and **maximum code reuse** (~80% of existing patterns). The key is simplification: removing chat-specific concepts (models, roles, code execution) and focusing on pure context entry management. The architecture is extensible for future features like entry editing, deletion, or tagging without major refactoring.

---

## Testing Strategy

### Cypress E2E Tests
Two critical user flows should be covered with E2E tests:

1. **Create Context Flow**
   - Navigate to contexts page
   - Click "Create context" button
   - Fill in README text
   - Add initial entry
   - Submit form
   - Verify context appears in list and is navigable

2. **Add Entry to Context Flow**
   - Navigate to existing context
   - View README and existing entries
   - Fill in entry input field
   - Submit entry
   - Verify new entry appears in list immediately (or after refresh)
   - Verify entry displays with timestamp

**Test Location**: `/cypress/e2e/contexts.cy.ts` (following existing Open WebUI pattern)

**Mocking Strategy**:
- Use cy.intercept() to mock SC API responses
- OR use real SC test server if available
- Tests should be runnable in CI/CD pipeline
