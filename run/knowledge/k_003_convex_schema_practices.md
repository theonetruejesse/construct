# Convex Schema Practices and Migration Plan (Updated)

**Confidence:** 0.95

**Sources:**

- construct/.cursor/rules/convex_rules.mdc
- construct/apps/api/convex/schema.ts

**Summary:**
Convex provides a document-based schema model with strong typing support. The schema guidelines emphasize proper type validation, indexing strategies, and organization patterns for optimal performance and maintainability in Convex applications.

---

## Schema Definition

Schemas in Convex should always be defined in `convex/schema.ts` using the `defineSchema` and `defineTable` functions imported from `convex/server`. System fields like `_creationTime` and `_id` are automatically added to all documents.

Example schema definition:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    text: v.string(),
    author: v.string(),
    createdAt: v.number(),
  }).index("byCreatedAt", ["createdAt"]),
});
```

## Validator Types

Convex supports various validators for data types:

- `v.string()`: For text values
- `v.number()`: For numeric values
- `v.boolean()`: For boolean values
- `v.int64()`: For 64-bit integers (using BigInt)
- `v.id(tableName)`: For document IDs
- `v.array(validator)`: For arrays of values
- `v.object({...})`: For structured objects
- `v.record(keyValidator, valueValidator)`: For dynamic key-value records
- `v.null()`: For null values
- `v.union(...)`: For union types
- `v.literal(value)`: For exact value matching

## Indexing

Indexes should be defined following these guidelines:

- Include all indexed fields in the index name (e.g., `byCreatedAt` for `["createdAt"]`)
- Index fields must be queried in the same order they're defined
- Create separate indexes for different query patterns
- Indexes significantly improve query performance for filtered and ordered queries

## Advanced Patterns

- Discriminated unions using `v.union()` and `v.literal()` for type-safe variants
- Optional fields using `v.optional(validator)`
- Structured data modeling using nested objects
- Cross-document references using `v.id(tableName)`

## Schema Design

- Use four primary collections: vtables, vtableColumns, vtableRows, vtableCells
- Apply strategic denormalization for common access patterns
- Use composite indexes for efficient queries
- Maintain relationships using document references and helper functions

## Migration Plan Highlights

- Domain-driven code organization (vtables, columns, rows, cells)
- Helper functions for cascading deletes and data assembly
- Application-level integrity constraints
- Public API functions organized by domain
- Risk management and success criteria outlined

(See run/synthesis_updated.md for full details)
