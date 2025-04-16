# Service Repository Pattern in mcp-vtable

**Confidence:** 0.85

**Sources:**

- mcp-vtable/packages/api/src/routers/vtable/vtable.router.ts
- mcp-vtable/packages/api/src/routers/vtable/service/vtable.service.ts
- mcp-vtable/packages/api/src/routers/vtable/repository/vtable.repository.ts

**Summary:**
The mcp-vtable project implements a clean service-repository pattern for handling vtable operations. The pattern consists of three main components:

1. Routers: Define the API endpoints and route requests to appropriate service methods
2. Services: Implement business logic and orchestrate data operations
3. Repositories: Handle direct data access, caching strategies, and data transformation

---

## Router Layer

The router layer uses tRPC to define API endpoints that directly map to service methods. Example from vtable.router.ts:

```typescript
export const vTableRouter = createTRPCRouter({
  getFullTable: publicProcedure
    .input(GetFullTableInput)
    .query(async ({ input }) => {
      return vTableService.getFullVTable(input);
    }),
  // other endpoints...
});
```

## Service Layer

The service layer contains business logic and orchestrates operations:

- Handles complex operations that might span multiple repository methods
- Implements features like backfilling cells when creating columns/rows
- Manages transactions when necessary
- Enforces business rules and validations

Examples of service methods:

- getFullVTable: Gets an assembled table with backfilled cells
- createVColumn: Creates a column and backfills cells
- createVRow: Creates a row and backfills cells
- updateVTableCell: Updates cell values

## Repository Layer

The repository layer handles direct data access:

- Implements a write-through caching pattern with Redis
- Provides methods for CRUD operations on vtable entities
- Transforms data between database and application formats
- Manages caching strategies to optimize performance

Key repository methods:

- getVTableShape: Gets the table structure
- getVTableCells: Gets cell data with caching
- bulkCreateVCells: Creates multiple cells at once
- updateVCell: Updates a single cell value
