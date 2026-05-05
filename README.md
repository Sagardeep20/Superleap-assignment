# Superleap CRM

A React-based Lead Management CRM application with full CRUD operations, status workflow management, and deep-linkable routing.

## Tech Stack

- **Framework: React 19 with Vite** — Fast development experience with HMR, TypeScript support out of the box, and optimized production builds.
- **State Management: Zustand + TanStack Query** — Zustand manages UI state (filters, dialogs) while TanStack Query handles server state (leads data, caching, invalidation).
- **Styling: Tailwind CSS + shadcn/ui** — Utility-first CSS for rapid development, shadcn/ui provides accessible, well-designed components (Dialog, Table, Button, etc.).
- **Mock API: json-server** — Simulates a REST API at localhost:4000 for CRUD operations without a backend.

## Setup Steps

```bash
# 1. Install dependencies
npm install

# 2. Start the mock API server (in a separate terminal)
npm run server

# 3. Start the development server (in a separate terminal)
npm run dev

# 4. Open http://localhost:5173
```

## Design Decisions

### Component & State Organization
- **Components**: Organized by feature (`leads/`), type (`forms/`, `ui/`), and layout (`layout/`).
- **Server State**: TanStack Query hooks in `src/hooks/useLeads.ts` handle all API calls with proper loading/error states.
- **UI State**: Zustand store in `src/stores/filterStore.ts` manages client-side search and status filter state.
- **Form State**: React Hook Form with Zod validation handles all form state locally.

### Enforcing Status Rules
- `src/lib/statusMachine.ts` contains the single source of truth for valid status transitions.
- `StatusTransitionMenu` component reads from this file to show only valid next statuses.
- Invalid transitions (CONVERTED → anything, LOST → anything) show a "Locked" state.
- Status rules are enforced on the client AND should be enforced on the mock server.

### Offline Support & Concurrent Edits
- **Offline**: Would implement optimistic updates with TanStack Query's `onMutate`/`onError` callbacks, storing pending changes in IndexedDB, then syncing when online.
- **Concurrent Edits**: Would add an `updated_at` timestamp field. On save, compare with server version; if mismatch, show conflict resolution UI letting user choose "Keep Mine" or "Keep Server" version.

### Improvements Given Another Week
1. Add proper error boundaries with retry UI
2. Implement optimistic delete with rollback on failure
3. Add unit tests with Vitest + React Testing Library
4. Add optimistic updates for status transitions
5. Implement proper loading skeletons matching actual content layout
6. Add keyboard navigation (Escape to close modals, Tab management)

## AI Usage Note

I used AI tools (OpenCode) throughout this project for:
- Generating boilerplate components from shadcn/ui
- Debugging TypeScript errors and understanding type inference
- Refactoring repeated logic into reusable hooks

I accepted AI suggestions for:
- Initial project structure and component organization
- TypeScript type definitions and generics
- CSS utility class combinations

I intentionally wrote by hand:
- The status machine logic in `src/lib/statusMachine.ts` (business logic that defines the lead workflow)
- Form validation schema in `src/lib/validators.ts` (input validation rules)
- API layer in `src/api/leads.ts` (exact HTTP methods and endpoints as specified)

I rejected AI suggestions that:
- Added unnecessary dependencies
- Over-complicated the routing when simple URL params suffice
- Suggested using `any` types instead of proper TypeScript types