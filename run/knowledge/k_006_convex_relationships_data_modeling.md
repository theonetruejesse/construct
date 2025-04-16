# Convex Relationships and Data Modeling

**Confidence:** 0.9

**Sources:**

- https://docs.convex.dev/database/document-ids
- https://stack.convex.dev/functional-relationships-helpers
- https://stack.convex.dev/ents

**Summary:**
Convex supports relationship modeling through document IDs and references, with best practices for balancing between embedded documents and separate collections. Helper functions can abstract complexity and implement referential integrity that would normally be handled by foreign key constraints in relational databases.

---

## Document References

In Convex, relationships between documents are modeled using IDs as references:

```typescript
// Create a user and store its ID
const userId = await ctx.db.insert("users", { name: "Alice" });

// Reference the user in a book document
await ctx.db.insert("books", {
  title: "Database Design",
  ownerId: userId, // Reference to the user
});

// Follow the reference to get the related user
const book = await ctx.db
  .query("books")
  .filter((q) => q.eq(q.field("title"), "Database Design"))
  .first();

const owner = await ctx.db.get(book.ownerId);
```

## Document Structure Tradeoffs

Convex recommends a balanced approach to document structure:

1. **Limit Array Size**: Keep arrays to 5-10 elements to avoid performance issues
2. **Avoid Deeply Nested Objects**: Prefer references between documents over deep nesting
3. **Use Separate Collections**: For related entities that grow independently or are queried separately
4. **Consider Document Size**: Keep documents relatively small (under 1MB)

## Implementing Relationships with Helpers

To implement relationships effectively in Convex, use helper functions for:

1. **Fetching Related Documents**: Create helpers that efficiently load related documents
2. **Maintaining Integrity**: Implement cascading operations when parent documents are modified
3. **Type Safety**: Use TypeScript to ensure relationship consistency

Example relationship helper:

```typescript
// Helper to get all books owned by a user
export async function getBooksForUser(
  ctx: QueryCtx,
  userId: Id<"users">
): Promise<Doc<"books">[]> {
  return await ctx.db
    .query("books")
    .filter((q) => q.eq(q.field("ownerId"), userId))
    .collect();
}
```

## Cascade Operations

Since Convex doesn't have built-in foreign key constraints for cascading deletes, these must be implemented in application code:

```typescript
// Helper for cascading deletion
export async function deleteUserWithBooks(
  ctx: MutationCtx,
  userId: Id<"users">
): Promise<void> {
  // First delete all books owned by this user
  const books = await ctx.db
    .query("books")
    .filter((q) => q.eq(q.field("ownerId"), userId))
    .collect();

  for (const book of books) {
    await ctx.db.delete(book._id);
  }

  // Then delete the user
  await ctx.db.delete(userId);
}
```

## Entity-Based Modeling

For complex data models, using an "ents" (entities) approach can add structure:

1. **Define Entity Types**: Create clear types for each entity
2. **Implement CRUD Functions**: Standardize creation, reading, updating, and deletion
3. **Encapsulate Validation**: Include validation logic in entity operations
4. **Abstract Relationships**: Hide relationship complexity behind helper functions

This approach creates a more structured layer over Convex's document model while maintaining flexibility.
