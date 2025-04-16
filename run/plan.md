# VTable Migration and Implementation Plan

## Executive Summary

This plan details the complete strategy for migrating VTable functionality from the mcp-vtable project (built on t3 stack with Prisma, tRPC, and Redis) to the Convex-based construct project. The approach leverages Convex's strengths in document modeling, real-time updates, and transaction handling while maintaining the core functionality of VTables.

## Core Architecture Decisions

1. **Schema Design**: Implement a four-collection schema with strategic denormalization, composite indexes for common access patterns, and helper functions for maintaining relational integrity.

2. **Code Organization**: Apply a domain-driven organization with internal helper functions and entity abstractions that adapt the service-repository pattern while leveraging Convex's built-in architecture.

3. **Data Integrity**: Implement application-level integrity constraints through helper functions and transactional updates to replace the database-enforced foreign key relationships from Prisma.

4. **API Integration**: Organize Convex queries and mutations by domain with appropriate argument validation, leveraging Convex's built-in features for efficient data access and reactivity.

## Updated Knowledge and Best Practices

- **Schema**: Four-collection model (vtables, vtableColumns, vtableRows, vtableCells) with strategic denormalization and composite indexes.
- **Relationships**: Managed via document references and helper functions for integrity and cascading operations.
- **Code Organization**: Domain-driven, with internal helpers and entity abstractions adapting the service-repository pattern to Convex.
- **Performance**: Composite indexes and denormalization for common access patterns.
- **Integrity**: Application-level constraints enforced by helper functions and transactional updates.

## Hypotheses Validation

The implementation plan has been validated through analysis of multiple hypotheses:

- **Schema Design**: The four-collection schema, denormalization, and helper-based integrity enforcement are effective for modeling VTables in Convex.
- **Service Pattern**: Domain-driven organization with helpers aligns with Convex's architecture and maintains separation of concerns.
- **Data Migration**: Mapping entities to collections, using references and indexes, and helper functions for integrity properly preserves functionality.
- **API Integration**: Domain-focused modules, argument validation, and leveraging Convex's features provide a maintainable and performant API.

## Challenges Resolution

- **Document Model Limitations**: Addressed by helper functions, denormalization, and composite indexes.
- **Service-Repository Pattern Misalignment**: Addressed by adapting the pattern to Convex's architecture with domain-driven organization and helpers.

## Detailed Implementation Plan

### 1. Schema Definition

The schema will include four primary collections with strategic indexes:

```typescript
// vtables - defines the virtual tables
vtables: defineTable({
  name: v.string(),
  ownerId: v.optional(v.string()),
  createdAt: v.number(),
  description: v.optional(v.string()),
}).index("byOwner", ["ownerId"]),

// vtableColumns - defines the columns for each table
vtableColumns: defineTable({
  tableId: v.id("vtables"),
  name: v.string(),
  type: v.string(), // Validates against allowed types
  options: v.optional(v.object({})),
  order: v.number(), // For maintaining column order
})
.index("byTableId", ["tableId"])
.index("byTableIdAndOrder", ["tableId", "order"]),

// vtableRows - defines the rows for each table
vtableRows: defineTable({
  tableId: v.id("vtables"),
  createdAt: v.number(),
}).index("byTableId", ["tableId"]),

// vtableCells - stores the actual cell values
vtableCells: defineTable({
  rowId: v.id("vtableRows"),
  columnId: v.id("vtableColumns"),
  value: v.optional(v.string()), // All values stored as strings
})
.index("byRowId", ["rowId"])
.index("byColumnId", ["columnId"])
.index("byRowAndColumn", ["rowId", "columnId"]),
```

### 2. Domain-Driven Organization

Code will be organized into domain-focused modules:

```
convex/
├── vtable/
│   ├── tables.ts        # Table CRUD operations
│   ├── columns.ts       # Column operations (create, update, delete)
│   ├── rows.ts          # Row operations (create, update, delete)
│   ├── cells.ts         # Cell operations (update values)
│   ├── queries.ts       # Complex query operations for assembled data
│   └── helpers/
│       ├── assembler.ts # Functions for assembling table views
│       ├── integrity.ts # Functions for maintaining data integrity
│       ├── types.ts     # Shared TypeScript types for VTables
│       └── validators.ts # Validation functions for VTable operations
└── messages.ts          # Existing chat functionality
```

### 3. Core Implementation Components

#### Helper Functions for Data Integrity

Example of a helper function for maintaining data integrity:

```typescript
// Delete a table and all its related data
export async function cascadeDeleteTable(
  ctx: MutationCtx,
  tableId: Id<"vtables">
): Promise<void> {
  // Find all columns for this table
  const columns = await ctx.db
    .query("vtableColumns")
    .withIndex("byTableId", (q) => q.eq("tableId", tableId))
    .collect();

  // Find all rows for this table
  const rows = await ctx.db
    .query("vtableRows")
    .withIndex("byTableId", (q) => q.eq("tableId", tableId))
    .collect();

  // Delete all cells for the table's columns
  for (const column of columns) {
    const cells = await ctx.db
      .query("vtableCells")
      .withIndex("byColumnId", (q) => q.eq("columnId", column._id))
      .collect();

    for (const cell of cells) {
      await ctx.db.delete(cell._id);
    }

    await ctx.db.delete(column._id);
  }

  // Delete all cells for the table's rows
  for (const row of rows) {
    const cells = await ctx.db
      .query("vtableCells")
      .withIndex("byRowId", (q) => q.eq("rowId", row._id))
      .collect();

    for (const cell of cells) {
      await ctx.db.delete(cell._id);
    }

    await ctx.db.delete(row._id);
  }

  // Finally delete the table itself
  await ctx.db.delete(tableId);
}
```

#### Data Assembly Functions

Example of a helper function for data assembly:

```typescript
// Assemble a complete VTable view
export async function assembleVTableData(
  ctx: QueryCtx,
  tableId: Id<"vtables">
): Promise<AssembledVTable | null> {
  // Get the table
  const table = await ctx.db.get(tableId);
  if (!table) return null;

  // Get columns and rows in parallel
  const [columns, rows] = await Promise.all([
    ctx.db
      .query("vtableColumns")
      .withIndex("byTableIdAndOrder", (q) => q.eq("tableId", tableId))
      .collect(),
    ctx.db
      .query("vtableRows")
      .withIndex("byTableId", (q) => q.eq("tableId", tableId))
      .collect(),
  ]);

  // Get all cells for this table
  const allCells: Doc<"vtableCells">[] = [];
  for (const row of rows) {
    const rowCells = await ctx.db
      .query("vtableCells")
      .withIndex("byRowId", (q) => q.eq("rowId", row._id))
      .collect();
    allCells.push(...rowCells);
  }

  // Group cells by row
  const cellsByRow = new Map<Id<"vtableRows">, Record<string, CellData>>();

  for (const cell of allCells) {
    const rowCells = cellsByRow.get(cell.rowId) || {};
    rowCells[cell.columnId] = {
      id: cell._id,
      value: cell.value || null,
    };
    cellsByRow.set(cell.rowId, rowCells);
  }

  // Assemble the final structure
  const assembledRows = rows.map((row) => ({
    id: row._id,
    createdAt: row.createdAt,
    cells: cellsByRow.get(row._id) || {},
  }));

  return {
    table,
    columns: columns.map((column) => ({
      id: column._id,
      name: column.name,
      type: column.type,
      options: column.options || null,
      order: column.order,
    })),
    rows: assembledRows,
  };
}
```

### 4. Public API Functions

Examples of public API functions:

```typescript
// Get a fully assembled VTable
export const getVTable = query({
  args: { tableId: v.id("vtables") },
  handler: async (ctx, args) => {
    return await assembleVTableData(ctx, args.tableId);
  },
});

// List available VTables
export const listVTables = query({
  args: { ownerId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const q = args.ownerId
      ? ctx.db
          .query("vtables")
          .withIndex("byOwner", (q) => q.eq("ownerId", args.ownerId))
      : ctx.db.query("vtables");

    return await q.collect();
  },
});

// Create a new VTable
export const createVTable = mutation({
  args: {
    name: v.string(),
    ownerId: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const tableId = await ctx.db.insert("vtables", {
      name: args.name,
      ownerId: args.ownerId,
      description: args.description,
      createdAt: Date.now(),
    });

    return tableId;
  },
});

// Create a new column with default values for all rows
export const createVTableColumn = mutation({
  args: {
    tableId: v.id("vtables"),
    name: v.string(),
    type: v.string(),
    options: v.optional(v.object({})),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Validate type
    validateColumnType(args.type);

    // Get the highest existing order value or default to 0
    let order = args.order;
    if (order === undefined) {
      const columns = await ctx.db
        .query("vtableColumns")
        .withIndex("byTableId", (q) => q.eq("tableId", args.tableId))
        .collect();

      order = columns.length ? Math.max(...columns.map((c) => c.order)) + 1 : 0;
    }

    // Create the column
    const columnId = await ctx.db.insert("vtableColumns", {
      tableId: args.tableId,
      name: args.name,
      type: args.type,
      options: args.options,
      order,
    });

    // Get all rows for this table to create cells for
    const rows = await ctx.db
      .query("vtableRows")
      .withIndex("byTableId", (q) => q.eq("tableId", args.tableId))
      .collect();

    // Create cells for all existing rows with default value
    const defaultValue = getDefaultValueForType(args.type, args.options);

    for (const row of rows) {
      await ctx.db.insert("vtableCells", {
        rowId: row._id,
        columnId,
        value: defaultValue,
      });
    }

    return columnId;
  },
});
```

## Implementation Phases

### Phase 1: Schema and Types

- Define the Convex schema for vtables, columns, rows, and cells with indexes.
- Create shared TypeScript types and validators for VTable entities.

### Phase 2: Core CRUD Operations

- Implement CRUD mutations and queries for tables, columns, rows, and cells.
- Use helper functions for cascading deletes and integrity enforcement.

### Phase 3: Data Assembly and Complex Operations

- Implement data assembly helpers for efficient VTable view construction.
- Optimize queries with composite indexes and denormalization as needed.

### Phase 4: API and Integration

- Expose public API functions (queries/mutations) organized by domain.
- Integrate with the existing construct web app and ensure compatibility.
- Implement argument and return validation for all API functions.

### Phase 5: Testing and Validation

- Test all operations for correctness, performance, and integrity.
- Validate real-time updates and reactivity in the web app.
- Refine helper functions and indexes based on usage patterns.

## Risk Management and Success Criteria

### Risk Management

| Risk                                          | Mitigation                                                             |
| --------------------------------------------- | ---------------------------------------------------------------------- |
| Performance issues with complex queries       | Use composite indexes and denormalization for common access patterns   |
| Data integrity challenges                     | Implement comprehensive helper functions for maintaining relationships |
| Complexity from application-level constraints | Abstract complexity into well-tested and reusable helper functions     |
| Differences in API behavior                   | Focus on functional compatibility rather than exact API matching       |
| Transaction limitations                       | Use Convex's optimistic concurrency control for complex operations     |

### Success Criteria

- All core VTable operations are supported
- Performance and integrity are validated
- Code is maintainable and follows Convex best practices
- The implementation is ready for production use

## Next Steps

- Begin implementation following the phased plan
- Review and refine based on feedback and real-world usage
- Document and share best practices for future development

---

This plan is ready for implementation. All knowledge, hypotheses, and challenges have been addressed, resulting in an actionable and comprehensive migration strategy that leverages Convex's strengths while preserving VTable functionality.
