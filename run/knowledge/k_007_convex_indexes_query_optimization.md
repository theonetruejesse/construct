# Convex Indexes and Query Optimization

**Confidence:** 0.95

**Sources:**

- https://docs.convex.dev/database/reading-data/indexes/indexes-and-query-perf
- https://docs.convex.dev/functions/query-functions
- https://docs.convex.dev/database/schemas

**Summary:**
Convex uses indexes for efficient querying, with specific patterns for optimizing query performance. Understanding index creation, querying with indexes, and performance considerations is essential for building performant Convex applications, especially when dealing with relational-like queries.

---

## Index Definition

Indexes in Convex are defined on tables in the schema:

```typescript
// Example index definition on a table
messages: defineTable({
  author: v.string(),
  content: v.string(),
  timestamp: v.number(),
}).index("byAuthorAndTimestamp", ["author", "timestamp"]);
```

Key characteristics of Convex indexes:

1. **Multi-Column Indexes**: Can be created on multiple fields in a specific order
2. **Order Sensitivity**: Fields must be queried in the same order as defined in the index
3. **Naming Convention**: Index names should reflect all indexed fields (e.g., "byAuthorAndTimestamp")
4. **System Fields**: The `_creationTime` field is implicitly indexed for all tables

## Query Optimization

Queries in Convex should use indexes for optimal performance:

```typescript
// Efficient query using an index
const messages = await ctx.db
  .query("messages")
  .withIndex(
    "byAuthorAndTimestamp",
    (q) => q.eq("author", "Alice") // First indexed field
  )
  .order("desc") // Controls the order of timestamp (second indexed field)
  .collect();
```

Performance guidelines:

1. **Always Use Indexes**: Prefer `.withIndex()` over `.filter()` for performance
2. **Equality Prefix**: For multi-column indexes, provide equality predicates for the prefix fields
3. **Range Queries**: Use range predicates only on the last index field
4. **Order Clauses**: Apply ordering only on indexed fields

## Index Selection Tradeoffs

When designing indexes for Convex:

1. **Query Patterns**: Create indexes based on common access patterns
2. **Index Size**: Each index increases storage requirements and write time
3. **Composite Indexes**: Use for frequent filter combinations
4. **Multiple Indexes**: Create separate indexes for different query patterns on the same table

## Compound Query Patterns

For queries that need to filter across relationships:

1. **Multiple Separate Queries**: Use separate queries and combine results in memory

   ```typescript
   const user = await ctx.db
     .query("users")
     .filter((q) => q.eq(q.field("name"), "Alice"))
     .first();

   if (user) {
     const userBooks = await ctx.db
       .query("books")
       .filter((q) => q.eq(q.field("ownerId"), user._id))
       .collect();
   }
   ```

2. **Denormalization**: For frequent queries, consider denormalizing data
   ```typescript
   // Denormalizing user data into books
   await ctx.db.insert("books", {
     title: "Database Design",
     ownerId: userId,
     ownerName: "Alice", // Denormalized field
   });
   ```

## Performance Implications

Understanding Convex query execution:

1. **Query Filtering**: Happens on the server-side with index-based acceleration
2. **Pagination**: Use the `.paginate()` method for large result sets
3. **Document Loading**: When using `.first()` or `.collect()`, all fields are loaded
4. **Limiting Results**: Use `.take(n)` to limit the number of results returned

By efficiently using indexes and understanding query patterns, complex relational-like queries can be efficiently implemented in Convex.
