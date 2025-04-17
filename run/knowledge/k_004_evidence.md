# UI Components and VTable Components

**Confidence:** 0.9

**Sources:**

- /Users/jesselee/dev/mcp-vtable/packages/ui/package.json
- /Users/jesselee/dev/mcp-vtable/apps/web/src/app/\_components/VTable/index.tsx
- /Users/jesselee/dev/mcp-vtable/apps/web/src/app/\_components/VTable/vtable-types.ts
- /Users/jesselee/dev/mcp-vtable/apps/web/src/app/\_components/VTable/state/vtable-query.tsx
- /Users/jesselee/dev/mcp-vtable/apps/web/src/app/\_components/VTable/state/vtable-context.tsx

**Summary:**
The mcp-vtable project uses shadcn/ui components implemented as a shared UI package. The VTable component is a complex component that combines these UI components with state management using React Context and data fetching using React Query via tRPC. The component structure is modular with separate files for the main component, types, state management, and data fetching. The state management includes a refresh mechanism to handle table updates, and the data fetching transforms the API data into a format compatible with @tanstack/react-table.

---

## UI Components

The UI package (@construct/ui) contains shadcn/ui components built on top of:

- Radix UI primitives (@radix-ui/react-\*)
- TailwindCSS with class-variance-authority, clsx, and tailwind-merge
- Form handling with react-hook-form

Key components used by VTable include:

- Table components (table, tableHeader, tableBody, tableFooter)
- Button, Input, Label, Popover, Select, Skeleton components

## VTable Component Structure

The VTable component has the following structure:

- `index.tsx`: Main component with Suspense and ErrorBoundary wrappers
- `vtable-types.ts`: TypeScript types for the component
- `state/vtable-context.tsx`: Context provider for table state
- `state/vtable-query.tsx`: Data fetching and transformation using React Query

## State Management

The state management uses a React Context with:

- A refresh counter to force table re-renders when needed
- A refresh function to increment the counter

## Data Fetching and Integration

The data fetching uses React Query via tRPC with:

- `useSuspenseQuery` for data fetching
- Data transformation to format API data for @tanstack/react-table
- Column definitions with custom cell renderers based on column types

## Key Dependencies

- @tanstack/react-table for table rendering
- React Query via tRPC for data fetching
- luxon for date formatting
- shadcn/ui components for UI elements

These components need to be migrated to use Convex instead of tRPC while maintaining the same functionality and UI.
