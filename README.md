# Superleap CRM

A React-based customer relationship management application built as 
a frontend intern assessment. The application supports full CRUD 
operations on leads with enforced business rules for status 
transitions, along with a Kanban board view for visual pipeline 
management. Two assessment levels are completed: Level 1 
(Core CRUD + Status Rules) and Level 2 (Kanban Board).

## Tech Stack

**Framework** — React 19 with Vite provides modern concurrent 
features and fast development builds with instant hot module 
replacement. TypeScript is used throughout for type safety and 
precise modeling of the Lead data shape and Status enum. The Vite 
dev server is configured with historyApiFallback so all client-side 
routes work correctly on hard refresh.

**State Management** — TanStack Query handles all server state 
(fetching, caching, deduplication, automatic invalidation), while 
Zustand manages client-side UI state (search query, status filter) 
with minimal boilerplate. React Hook Form handles form state locally 
without polluting global state.

**Styling** — Tailwind CSS enables utility-first styling without 
context switching. shadcn/ui provides accessible, unstyled components 
(Dialog, Table, Button, Select, DropdownMenu) built on Radix UI 
primitives that can be fully customized.

**Mock API** — A custom Node.js Express server provided separately 
by Superleap runs on port 4000 with RESTful endpoints. Axios serves 
as the HTTP client with a configured base instance, and all API 
calls are wrapped in TanStack Query hooks.

**Router** — react-router-dom v7 handles /leads and /board routes 
with full deep-linking support — refreshing on any URL works 
correctly.

**Drag and Drop** — @dnd-kit provides modular, accessible 
drag-and-drop functionality for the Kanban board, chosen over 
alternatives for its active maintenance and React 18+ support.

## Setup

The application requires two parts running simultaneously:

**Step 1 — Start the mock server**

The mock server is provided separately by Superleap and is not 
included in this repository. Navigate to the mock server folder, 
then run:

```bash
npm install
npm start
```

The server will start on http://localhost:4000.

**Step 2 — Install and start the frontend**

In this repository, run:

```bash
npm install
npm run dev
```

The app will be available at http://localhost:5173

## Project Structure

```text
src/
├── api/                     # Axios instance and HTTP functions (leads.ts)
├── components/
│   ├── forms/               # LeadForm (create/edit modal), DeleteConfirmDialog
│   ├── leads/               # LeadTable, LeadRow, LeadCard, StatusBadge, StatusTransitionMenu
│   ├── layout/              # Navbar
│   └── ui/                  # shadcn/ui primitives (Button, Dialog, Select, etc.)
├── hooks/                   # TanStack Query hooks (useLeads, useCreateLead, etc.)
├── lib/                     # Business logic: statusMachine.ts, validators.ts
├── pages/                   # LeadsPage (/leads), BoardPage (/board)
├── stores/                  # Zustand store: filterStore.ts
└── types/                   # TypeScript interfaces for Lead, Status, etc.)
```

## Design Decisions

### Component, State, and Async Logic

Server state lives entirely in TanStack Query with queryKey: 
`['leads']`. Every mutation automatically invalidates this key to 
trigger a refetch. UI state (searchQuery, selectedStatus) lives in 
a Zustand store (useFilterStore) so both list and board views share 
the same filter state without prop drilling. Form state is managed 
locally by React Hook Form with Zod schema validation, isolated from 
global state. Components follow single responsibility: LeadRow 
renders one row, LeadCard renders one kanban card, StatusBadge 
renders one badge.

Every mutation uses mutateAsync inside a try/catch block. Server 
errors are extracted from `error.response?.data?.error` and 
displayed inline in the form. Sonner toast notifications show 
success or error feedback for every async operation. Loading states 
appear as skeleton components during initial fetch and spinner 
indicators inside action buttons during mutations. Every async path 
has explicit loading and error states with retry options.

### Status Transition Enforcement

A single source of truth — `src/lib/statusMachine.ts` — defines a 
TRANSITIONS map: NEW → [CONTACTED, LOST], CONTACTED → [QUALIFIED, 
LOST], QUALIFIED → [CONVERTED, LOST], CONVERTED → [] (terminal), 
LOST → [] (terminal). The functions `getValidTransitions(status)` 
returns allowed next statuses and `isTerminal(status)` identifies 
terminal states.

In the list view, StatusTransitionMenu calls getValidTransitions() 
to render only valid options in the dropdown. In the kanban board, 
on every drag end event, getValidTransitions() is checked before 
any API call — invalid drop targets cause the card to snap back 
with a toast error and no network request. On valid drops, the card 
moves immediately as an optimistic update — if the API call fails, 
the card reverts to its original column and an error toast explains 
what happened. For CONVERTED and LOST leads, isTerminal() returns 
true, a lock icon renders, and no status-change controls appear. 
Both views use identical statusMachine functions, ensuring rules 
cannot diverge.

### Offline Support and Concurrent Edits

Offline support is not implemented but would use TanStack Query's 
onMutate callback for optimistic updates, serializing pending 
changes to IndexedDB. On reconnect, a sync function would replay 
the queue with per-item error states for failed syncs.

Concurrent edits would add an updated_at timestamp to every lead. 
On save, the client compares local updated_at against the server 
response. If they differ, a conflict resolution modal appears with 
"Keep mine" and "Keep server" options — no silent overwrites.

### Improvements Given Another Week

1. Unit and integration tests with Vitest and React Testing Library 
   — statusMachine.ts and validators.ts are already isolated and 
   easy to test
2. Keyboard navigation improvements: Escape to close modals, proper 
   Tab order inside dialogs
3. Error boundaries with per-section retry UI
4. URL-encoded filter state so a filtered URL like 
   /leads?status=NEW is shareable and survives a hard refresh

### Known Trade-offs

Filter state (search, status) is shared between /leads and /board 
via Zustand, persisting within a session but resetting on hard 
refresh. URL param encoding is listed as a planned improvement 
above.

Delete uses a loading state rather than optimistic removal, which 
is the safer choice for a mock API that can return unexpected 
errors.

## Drag and Drop Library

@dnd-kit was chosen over react-beautiful-dnd (no longer maintained, 
no React 18+ support) and react-dnd (heavier, more boilerplate). 
@dnd-kit is modular (core, sortable, utilities), actively 
maintained, and has built-in keyboard and screen reader 
accessibility. Kanban columns scroll independently with a fixed 
maximum height so the board stays readable regardless of how many 
cards are in a column.

## AI Usage Note

AI tools were used as a productivity assistant, not as the primary 
author. shadcn/ui component boilerplate was scaffolded with AI to 
avoid repetitive setup. TypeScript type definitions and @dnd-kit 
integration patterns were refined with AI assistance. Core logic 
was written by hand: statusMachine.ts (the transition rules), 
validators.ts (the Zod schemas), and leads.ts (the API layer) were 
implemented manually to ensure exact business rule enforcement. 
Every AI suggestion was reviewed — over-engineered patterns were 
rejected (for example, a proposed complex middleware layer for 
status validation was replaced with a simple lookup map). Implicit 
any types suggested by AI were replaced with proper TypeScript 
definitions throughout.

## Demo Video

👉 https://www.loom.com/share/17e27222b23849ccb8fb646c770851b5