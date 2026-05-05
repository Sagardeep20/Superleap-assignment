# Superleap CRM

## Overview

A React-based Lead Management CRM application that enables users to manage leads through a complete CRUD interface with enforced status workflow rules. The application supports two views: a traditional list/table view and a Kanban board with drag-and-drop status transitions.

## Tech Stack

- **Framework**: React 19 with Vite — Fast development with hot module replacement and built-in TypeScript support.

- **State Management**: Zustand + TanStack Query — Zustand manages client-side UI state (search queries, filter selections) with minimal boilerplate. TanStack Query handles all server state with built-in caching, deduplication, and automatic invalidation on mutations.

- **Styling**: Tailwind CSS + shadcn/ui — Utility-first CSS for rapid development. shadcn/ui components (Dialog, Table, Button, Select, DropdownMenu) are built on Radix primitives with full accessibility support.

- **Mock API**: json-server (at http://localhost:4000) with Axios as the HTTP client — Simulates a REST backend for CRUD operations without requiring a real backend server.

## Setup

```bash
npm install
npx json-server --watch db.json --port 4000
npm run dev
```

## Features

- **Lead CRUD**: Create, read, update, and delete leads with a modal-based form
- **Status Transitions**: Enforced workflow (NEW → CONTACTED → QUALIFIED → CONVERTED, with LOST as terminal from any state)
- **Search & Filtering**: Client-side search by name/email, filter by status
- **Kanban Board**: Drag-and-drop cards between status columns using @dnd-kit
- **Empty/Loading/Error States**: Skeleton loaders, error messages with retry, empty state with clear filters
- **View/Edit/Delete Actions**: Each row/card has dedicated action buttons
- **Locked States**: CONVERTED and LOST leads cannot be modified

## Design Decisions

### Component Organization

```
src/
├── api/          # HTTP client layer (Axios → localhost:4000)
├── components/
│   ├── forms/    # LeadForm, DeleteConfirmDialog
│   ├── leads/    # LeadTable, LeadRow, LeadCard, StatusBadge, StatusTransitionMenu
│   ├── layout/   # Navbar
│   └── ui/       # shadcn/ui primitives
├── hooks/        # TanStack Query hooks
├── lib/          # Business logic (statusMachine.ts, validators.ts)
├── pages/        # LeadsPage, BoardPage
├── stores/       # Zustand store (filterStore.ts)
└── types/        # TypeScript interfaces
```

### State Management

- **Server State**: All API calls wrapped in TanStack Query hooks with `queryKey: ['leads']`. Mutations automatically invalidate queries to trigger refetch.

- **UI State**: Zustand store (`useFilterStore`) maintains `searchQuery` and `selectedStatus` globally. Both list and board views share this state.

- **Form State**: React Hook Form manages form state locally with Zod schema validation.

### Async Logic & Error Handling

- Every mutation uses `mutateAsync` with try/catch blocks
- Server errors extracted from `error.response?.data?.error` displayed inline in forms
- Toast notifications (sonner) provide success/error feedback for all async operations
- Loading states: spinners in buttons, skeleton components during data fetch

### Status Transition Enforcement

- **Single source of truth**: `src/lib/statusMachine.ts` defines `TRANSITIONS` mapping each status to valid next statuses
- **Table view**: `StatusTransitionMenu` calls `getValidTransitions(lead.status)` to show only valid options in dropdown
- **Locked UI**: `isTerminal()` checks if transitions array is empty; displays lock icon for CONVERTED/LOST

### Invalid Transition Handling

- **Kanban board**: Drag-and-drop checks `getValidTransitions()` before API call; invalid drops show toast error and card snaps back
- **Locked leads**: If lead's current status is terminal, no UI allows status change
- Both dropdown menu and drag-and-drop enforce identical rules

### Offline Support & Concurrent Edits

- **Offline**: Would use TanStack Query's `onMutate` for optimistic updates, storing pending changes in IndexedDB, then sync when online
- **Concurrent Edits**: Would add `updated_at` timestamp field; on save, compare timestamps and show conflict resolution UI (Keep Mine / Keep Server)

### Improvements Given Another Week

1. Implement optimistic delete with rollback on failure
2. Add unit tests with Vitest + React Testing Library
3. Add keyboard navigation (Escape to close modals, Tab management)
4. Implement error boundaries with retry UI
5. Add drag-and-drop smooth animations

### Drag and Drop Library: @dnd-kit

Chosen over react-beautiful-dnd and react-dnd for:
- Modern and actively maintained with React 19 support
- Built-in accessibility (screen reader, keyboard navigation)
- Modular imports (core, sortable, utilities)
- Lightweight with no heavy dependencies

## AI Usage Note

AI tools were used as an assistant throughout development, not as the primary implementation method. The shadcn/ui component boilerplate was generated via AI to accelerate setup. TypeScript type definitions and @dnd-kit integration patterns were refined with AI assistance.

**Core logic was written manually**: The status machine rules in `statusMachine.ts`, validation schemas in `validators.ts`, and exact API endpoints in `leads.ts` were implemented by hand to ensure exact business rule enforcement. I reviewed and modified all AI suggestions, rejecting over-engineered solutions (e.g., complex routing when simple URL params suffice) and replacing implicit `any` types with proper TypeScript definitions.

This approach demonstrates critical thinking: using AI for productivity while maintaining ownership of the core business logic.

## Demo Video

👉 [Add Loom link here]

## Additional Requirements

- Clean project structure with single-responsibility components
- Loading states on every async action (skeletons, spinners)
- Error states with retry functionality
- Valid transitions enforced via dropdown and drag-drop
- Locked states (CONVERTED, LOST) display lock icon and prevent all modifications
- Semantic HTML: `<table>` for list view, `<button>` for all clickable elements, `<form>` for inputs