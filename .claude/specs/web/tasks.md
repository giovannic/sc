# Tasks: Shared Context Web Interface

## Phase 1: Foundation (API & State)

### 1.1 Create Context Types
**Files**: Create `/src/lib/types/context.ts`
**Requirements**: FR-1, FR-2, FR-3, FR-4, FR-5
**Description**: Define TypeScript interfaces for context data structures used throughout the app
```typescript
- ContextEntry (id, content, timestamp)
- Context (id, uri, readme)
- CreateContextRequest
- ListContextsResponse
- GetContextResponse
```
**Acceptance Criteria**:
- [x] All interfaces properly typed with required/optional fields
- [x] Interfaces match SC API OpenAPI spec
- [x] No circular dependencies
- [x] Exports in barrel file if needed

**STATUS**: ✓ COMPLETED (in `/src/lib/types/index.ts`)

### 1.2 Create Context API Layer
**Files**: Create `/src/lib/apis/contexts/index.ts`
**Requirements**: FR-1, FR-2, FR-3, FR-4, FR-5
**Description**: Implement functional API calls to SC server following Open WebUI patterns
```typescript
Functions:
- createContext(token, data): Promise<{uri, contextId}>
- listContexts(token, limit?, offset?): Promise<ListContextsResponse>
- getContext(token, contextId, order?, limit?, offset?): Promise<GetContextResponse>
- getContextReadme(token, contextId): Promise<{readme}>
- updateContextReadme(token, contextId, readme): Promise<{success}>
- addContextEntry(token, contextId, content): Promise<{id, timestamp}>
```
**Acceptance Criteria**:
- [x] All functions use Bearer token authentication
- [x] Error handling follows existing try-catch-throw pattern
- [x] Base URL configurable via env var (`PUBLIC_SC_API_URL`)
- [x] Functions return properly typed responses
- [x] Follows existing API layer patterns (no class-based)
- [x] ~250 lines of code
- [x] Properly exported from `/src/lib/apis/index.ts`

**STATUS**: ✓ COMPLETED (feat/web_2 - 223 lines in `/src/lib/apis/contexts/index.ts`)

### 1.3 Add Context Stores
**Files**: Modify `/src/lib/stores/index.ts`
**Requirements**: All FR (state management)
**Description**: Add Svelte writable stores for context-related state
```typescript
New stores:
- contexts: Writable<Context[]>
- contextId: Writable<string | null>
- contextReadme: Writable<string>
- contextEntries: Writable<ContextEntry[]>
- contextTotal: Writable<number>
```
**Acceptance Criteria**:
- [x] All stores properly exported from `/src/lib/stores/index.ts`
- [x] Stores initialized with sensible defaults (empty arrays, null)
- [x] Store names follow existing naming convention
- [x] No conflicts with existing stores (chats, etc.)
- [x] Types properly imported from context.ts

**STATUS**: ✓ COMPLETED (in `/src/lib/stores/index.ts` lines 60-65)

---

## Phase 2: Routing & Layout

### 2.1 Create Contexts Layout Route
**Files**: Create `/src/routes/(app)/contexts/+layout.svelte`
**Requirements**: FR-1, FR-8
**Description**: Root layout for contexts section that loads and manages context list
```svelte
- Load all contexts on mount
- Set up pagination (default limit=50)
- Subscribe to contexts store
- Render Sidebar with context list
- Render `<slot />` for child routes
```
**Acceptance Criteria**:
- [x] Calls listContexts() API function with token
- [x] Updates contexts store with response
- [x] Error handling: toast on load failure, retry option
- [x] Sidebar rendered with list of contexts
- [x] Context selection updates contextId store
- [x] Loading state shown while fetching
- [x] Follows existing (app) layout patterns
- [x] ~100 lines

**STATUS**: ✓ COMPLETED (feat/web_2 - 134 lines, includes sidebar, loading state, context selection with navigation)

### 2.2 Create Contexts List Page (Placeholder)
**Files**: Create `/src/routes/(app)/contexts/+page.svelte`
**Requirements**: FR-1, FR-8
**Description**: Welcome/empty page for contexts root
```svelte
- Show "Select a context from sidebar" message
- OR show "Create first context" button
- Simple placeholder layout
```
**Acceptance Criteria**:
- [x] Displays when no context selected
- [x] Clear CTA to create or select context
- [x] Matches Open WebUI styling
- [x] ~50 lines

**STATUS**: ✓ COMPLETED (feat/web_2 - 9 lines placeholder with i18n support)

### 2.3 Create Context Detail Layout Route
**Files**: Create `/src/routes/(app)/contexts/[contextId]/+layout.svelte`
**Requirements**: FR-3
**Description**: Load specific context details (readme + initial entries)
```svelte
- Extract contextId from route params
- Load context readme
- Load initial context entries (first 20)
- Update contextId store
- Render `<slot />` for detail page
```
**Acceptance Criteria**:
- [ ] Validates contextId exists (catch 404, redirect to /contexts)
- [ ] Calls getContextReadme() and getContext() in parallel
- [ ] Updates contextReadme and contextEntries stores
- [ ] Handles loading and error states
- [ ] WebSocket subscription initialized here (if supported)
- [ ] ~120 lines

### 2.4 Create Context Detail Page
**Files**: Create `/src/routes/(app)/contexts/[contextId]/+page.svelte`
**Requirements**: FR-3, FR-4, FR-10, FR-11
**Description**: Main context viewer page that renders the full context interface
```svelte
- Import and render ContextViewer component
- Pass stores as props (or use context)
- Handle responsive layout
```
**Acceptance Criteria**:
- [ ] Renders ContextViewer with full layout
- [ ] Responsive on mobile/tablet/desktop
- [ ] Handles 404 redirects properly
- [ ] ~30 lines (mostly component composition)

---

## Phase 3: UI Components

### 3.1 Create ContextViewer Component
**Files**: Create `/src/lib/components/context/ContextViewer.svelte`
**Requirements**: FR-3, FR-4, FR-9, FR-10, FR-11
**Description**: Main container component that orchestrates readme and entries display
```svelte
Layout:
- README section (collapsible, with edit button)
- Entries list (ContextEntries component)
- Add entry input (AddEntryInput component)
- Pagination controls
```
**Acceptance Criteria**:
- [ ] Subscribes to contextReadme and contextEntries stores
- [ ] README shown/hidden toggle with smooth animation
- [ ] Edit README button opens modal (future: ContextReadmeEditor)
- [ ] Renders entries list via ContextEntries component
- [ ] Renders input via AddEntryInput component
- [ ] Pagination: "Load more" button at bottom
- [ ] Loads next 20 entries on pagination
- [ ] Error handling: show error toast on load failure
- [ ] Loading spinner while fetching
- [ ] Matches Open WebUI styling (Tailwind classes)
- [ ] ~250 lines

### 3.2 Create ContextEntries Component
**Files**: Create `/src/lib/components/context/ContextEntries.svelte`
**Requirements**: FR-3, FR-10
**Description**: Display list of context entries with markdown rendering
```svelte
- Loop over contextEntries from store
- For each entry: render timestamp + content
- Render content via ContentRenderer (reuse from chat)
- Handle empty state
- Handle loading state
```
**Acceptance Criteria**:
- [ ] Subscribes to contextEntries store
- [ ] Renders entries in chronological order (timestamp asc)
- [ ] Shows timestamp for each entry (human-readable format, use dayjs)
- [ ] Entry content rendered as markdown via ContentRenderer
- [ ] Syntax highlighting for code blocks (inherited from ContentRenderer)
- [ ] Empty state message: "No entries yet"
- [ ] Loading skeleton or spinner
- [ ] Responsive: works on mobile (single column)
- [ ] ~150 lines

### 3.3 Create AddEntryInput Component
**Files**: Create `/src/lib/components/context/AddEntryInput.svelte`
**Requirements**: FR-4
**Description**: Simple text input for adding new entries to context
```svelte
- Text input field
- Submit button (or Enter key)
- Loading state during submission
- Clear on success
- Error handling
```
**Acceptance Criteria**:
- [ ] Text input field with placeholder "Add an entry..."
- [ ] Submit button next to input
- [ ] Support Enter key to submit (Shift+Enter for newline)
- [ ] Disabled while submitting (show spinner)
- [ ] Calls addContextEntry() API with context ID and content
- [ ] Clears input on success
- [ ] Updates contextEntries store optimistically (add entry immediately)
- [ ] Toast notification: "Entry added"
- [ ] Error toast on failure: "Failed to add entry"
- [ ] Validation: don't submit empty input
- [ ] Auto-focus when context selected
- [ ] ~100 lines

### 3.4 Create ContextReadmeEditor Component
**Files**: Create `/src/lib/components/context/ContextReadmeEditor.svelte`
**Requirements**: FR-5, FR-9
**Description**: Modal dialog for editing context README
```svelte
- Reuse Modal.svelte component
- Textarea for markdown editing
- Save/Cancel buttons
- Show loading state during save
```
**Acceptance Criteria**:
- [ ] Renders in Modal (reuse existing Modal.svelte)
- [ ] Textarea with contextReadme value
- [ ] Save button calls updateContextReadme()
- [ ] Cancel button closes modal without saving
- [ ] Shows loading spinner while saving
- [ ] Toast on success: "README updated"
- [ ] Toast on error: "Failed to update README"
- [ ] Markdown preview toggle (optional for MVP, can add later)
- [ ] ~100 lines

### 3.5 Adapt Sidebar for Contexts
**Files**: Modify `/src/lib/components/layout/Sidebar.svelte`
**Requirements**: FR-1, FR-8
**Description**: Minimal adaptation of Sidebar to show contexts instead of chats
**Current behavior**: Shows chat list with folder navigation
**Needed changes**:
- [ ] Loop over contexts store instead of chats
- [ ] Remove folder/tag logic (not in SC)
- [ ] Click context to navigate to `/contexts/[contextId]`
- [ ] Show context URI instead of chat title
- [ ] Remove "New chat" button (or replace with "New context")
- [ ] Keep pagination/scroll behavior for large context lists
**Acceptance Criteria**:
- [ ] Sidebar displays all contexts
- [ ] Clicking context navigates to detail page
- [ ] Current context highlighted
- [ ] Sidebar collapses on mobile
- [ ] "New context" button visible
- [ ] ~20 lines of changes (minimal adaptation)

---

## Phase 4: Features & Polish

### 4.1 Implement README Display & Edit
**Files**: Modify `/src/lib/components/context/ContextViewer.svelte` (integrate ContextReadmeEditor)
**Requirements**: FR-5, FR-9
**Description**: Add README section with display/edit toggle
**Acceptance Criteria**:
- [ ] README rendered at top of context view
- [ ] Shown collapsed (first 100 chars) by default
- [ ] Expandable to show full markdown
- [ ] Edit button opens ContextReadmeEditor modal
- [ ] Edit button disabled if README empty (show "Add README" instead)
- [ ] Updated README reflected immediately in store
- [ ] Markdown rendering uses ContentRenderer
- [ ] ~30 lines of integration code

### 4.2 Implement Pagination
**Files**: Modify `/src/lib/components/context/ContextViewer.svelte`
**Requirements**: FR-1, FR-3
**Description**: Add pagination UI and logic for loading more entries
**Acceptance Criteria**:
- [ ] Load first 20 entries on page load
- [ ] "Load more" button at bottom of entries list
- [ ] Button disabled while loading
- [ ] Shows spinner while fetching
- [ ] Loads next 20 entries and appends to list
- [ ] Tracks total count from API response
- [ ] Hides button when all entries loaded
- [ ] Error handling: "Failed to load more" toast
- [ ] ~50 lines

### 4.3 Implement Real-time Updates (WebSocket)
**Files**: Modify `/src/routes/(app)/contexts/[contextId]/+layout.svelte`
**Requirements**: FR-6, FR-7
**Description**: Subscribe to context updates via WebSocket
**Note**: Only if SC API supports WebSocket. If not, skip this task.
**Acceptance Criteria**:
- [ ] Socket connection initialized in (app) layout
- [ ] Subscribe to context updates when contextId changes
- [ ] Listen for 'context:entry:added' or similar event
- [ ] New entries added to contextEntries store immediately
- [ ] Unsubscribe on unmount or contextId change
- [ ] Reconnection handling (warn user if disconnected)
- [ ] ~100 lines (or defer if not MVP)

### 4.4 Error Handling & Edge Cases
**Files**: Modify all components
**Requirements**: All FR
**Description**: Implement comprehensive error handling and edge cases
**Acceptance Criteria**:
- [ ] Network errors show toast with "Retry" option
- [ ] 404 errors redirect to /contexts with message
- [ ] 401 errors redirect to login
- [ ] Empty context (no entries) shows "No entries yet"
- [ ] Empty README shows "No README set"
- [ ] Very long entries truncated in preview
- [ ] Loading states shown for all async operations
- [ ] Disabled states on buttons during submission
- [ ] Proper null/undefined checks
- [ ] ~100 lines distributed across components

### 4.5 Responsive Design & Mobile
**Files**: All components
**Requirements**: FR-11
**Description**: Ensure UI works on mobile/tablet/desktop
**Acceptance Criteria**:
- [ ] Sidebar collapses on mobile (hamburger menu if needed)
- [ ] README section readable on small screens
- [ ] Entries list readable on mobile (single column)
- [ ] Input field full-width on mobile
- [ ] Buttons tap-friendly (48px min height)
- [ ] No horizontal scroll on mobile
- [ ] Tested on mobile viewport (375px width)
- [ ] Uses Tailwind responsive classes (sm:, md:, lg:)
- [ ] ~50 lines of responsive styling

---

## Phase 5: Testing

### 5.1 Create Cypress E2E Test for Creating Context
**Files**: Create `/cypress/e2e/contexts.cy.ts`
**Requirements**: Testing requirement (create context flow)
**Description**: E2E test for creating a new shared context with initial entry
```typescript
Test steps:
1. Navigate to /contexts
2. Click "New context" or "Create context" button
3. Fill in README text
4. Add initial entry
5. Submit form
6. Verify context appears in sidebar
7. Verify context page loads with README and entry
8. Verify entry displays with timestamp
```
**Acceptance Criteria**:
- [ ] Test file created and follows Open WebUI Cypress pattern
- [ ] Uses cy.intercept() to mock or use real SC API
- [ ] Test is idempotent (can run multiple times)
- [ ] Test uses data-testid attributes for element selection
- [ ] All assertions pass with real SC server
- [ ] Clear, descriptive test names and comments
- [ ] ~80 lines

### 5.2 Create Cypress E2E Test for Adding Entry
**Files**: Modify `/cypress/e2e/contexts.cy.ts`
**Requirements**: Testing requirement (add entry flow)
**Description**: E2E test for adding entry to existing context
```typescript
Test steps:
1. Create or navigate to existing context
2. View context page with README and entries
3. Fill in entry input field
4. Submit entry (click button or press Enter)
5. Verify new entry appears in list
6. Verify entry displays with timestamp
7. Verify input cleared and ready for next entry
```
**Acceptance Criteria**:
- [ ] Test added to same file as 5.1
- [ ] Tests run in sequence or independently
- [ ] Uses context ID from previous test or creates new context
- [ ] Verifies optimistic UI (entry appears before server response)
- [ ] Verifies timestamp is displayed
- [ ] Verifies entry content rendered correctly
- [ ] Error cases tested: empty input, network error
- [ ] All assertions pass with real SC server
- [ ] ~80 lines

### 5.3 Add data-testid Attributes to Components
**Files**: Modify all components created in Phase 3
**Requirements**: Testing
**Description**: Add data-testid attributes for Cypress element selection
**Elements to tag**:
- [ ] Context list items: `data-testid="context-item-{id}"`
- [ ] "New context" button: `data-testid="new-context-btn"`
- [ ] Entry input: `data-testid="entry-input"`
- [ ] Submit button: `data-testid="submit-entry-btn"`
- [ ] README edit button: `data-testid="edit-readme-btn"`
- [ ] README content: `data-testid="readme-content"`
- [ ] Entries list: `data-testid="entries-list"`
- [ ] Entry item: `data-testid="entry-{id}"`
- [ ] Modal save button: `data-testid="save-readme-btn"`
**Acceptance Criteria**:
- [ ] All key interactive elements have unique testids
- [ ] Testids follow naming convention
- [ ] No changes to styling or functionality
- [ ] Tests can reliably select elements via testid

---

## Summary

**Total Tasks**: 18 tasks across 5 phases
**Estimated LOC**: ~1,200 lines (130% of target, but includes comments and tests)
**Code reuse**: 80% (UI patterns, stores, error handling from Open WebUI)
**Atomic tasks**: Each task completable in 15-30 minutes
**Interdependencies**: Tasks 2.1-2.4 depend on 1.1-1.3; Phase 3 depends on Phase 2; Phase 4 enhances Phase 3; Phase 5 is independent

**Execution order**:
1. Phase 1 (Foundation) - **Day 1, Morning** (~1.5 hours)
2. Phase 2 (Routing) - **Day 1, Late Morning** (~1 hour)
3. Phase 3 (Components) - **Day 1, Afternoon** (~2 hours)
4. Phase 4 (Features) - **Day 2, Morning** (~2 hours)
5. Phase 5 (Testing) - **Day 2, Afternoon** (~1.5 hours)

**Total estimated time**: 8 hours for experienced developer
