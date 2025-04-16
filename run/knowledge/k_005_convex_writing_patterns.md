# Convex Writing Patterns and Transactions

**Confidence:** 0.95

**Sources:**

- https://docs.convex.dev/database/writing-data
- https://docs.convex.dev/database/advanced/occ

**Summary:**
Convex provides robust transaction handling with optimistic concurrency control (OCC) and automatic retries. This creates a powerful system for maintaining data integrity without explicit locking mechanisms, particularly useful for complex operations that span multiple documents.

---

## Transaction Atomicity

Convex mutations are automatically wrapped in atomic transactions. The entire mutation function is a single transaction - all database changes made during the function are queued up and executed as a single atomic unit when the function ends. This means that either all changes succeed, or all changes fail together.

For example, in a transfer operation:

```typescript
// The entire function is one atomic transaction
await ctx.db.patch(aliceId, { balance: aliceBalance - amount });
await ctx.db.patch(bobId, { balance: bobBalance + amount });
```

## Optimistic Concurrency Control (OCC)

Convex uses optimistic concurrency control rather than pessimistic locking:

1. **No Explicit Locks**: Developers don't need to worry about acquiring or releasing locks
2. **Automatic Conflict Resolution**: If concurrent operations modify the same data, Convex automatically retries the transaction
3. **Deterministic Execution**: Functions should be deterministic so they can be safely retried

This means that for operations like bulk modifications or complex updates across multiple collections, you don't need to implement special locking logic - Convex handles concurrency automatically.

## Bulk Operations

For bulk inserts or updates, Convex recommends using loops within a single mutation:

```typescript
// This is efficient because all changes are executed in a single transaction
for (const product of products) {
  await ctx.db.insert("products", {
    product_name: product.product_name,
    category: product.category,
    price: product.price,
    in_stock: product.in_stock,
  });
}
```

## Document Mutations

Convex provides three primary methods for modifying documents:

1. **`db.insert`**: Creates a new document and returns its ID
2. **`db.patch`**: Updates specific fields in an existing document
   - Shallow merges new fields
   - Overwrites existing fields
   - Removes fields set to `undefined`
3. **`db.replace`**: Completely replaces a document (except for system fields)
4. **`db.delete`**: Removes a document

This flexibility allows for efficient updates to document subsets without having to replace entire documents.
