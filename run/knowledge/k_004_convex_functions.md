# Convex Functions Structure and Best Practices

**Confidence:** 0.95

**Sources:**

- construct/.cursor/rules/convex_rules.mdc
- construct/apps/api/convex/messages.ts

**Summary:**
Convex provides a structured approach to defining backend functions with three main types: queries, mutations, and actions. Each follows a consistent pattern with argument validation, return type specification, and handler implementation. Proper function organization and calling patterns are essential for maintainable Convex applications.

---

## Function Types

### Queries

- Read-only operations that don't modify data
- Can be cached and optimistically updated
- Used for fetching data from the database

Example:

```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("messages")
      .withIndex("byCreatedAt")
      .order("desc")
      .collect();
  },
});
```

### Mutations

- Operations that modify data
- Transactional and atomic
- Used for creating, updating or deleting data

Example:

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const send = mutation({
  args: {
    text: v.string(),
    author: v.string(),
  },
  handler: async (ctx, args) => {
    const message = {
      text: args.text,
      author: args.author,
      createdAt: Date.now(),
    };
    return await ctx.db.insert("messages", message);
  },
});
```

### Actions

- Non-transactional operations
- Can interact with external APIs
- No direct database access
- Must run queries/mutations via ctx.runQuery/ctx.runMutation

## Function Organization

- Public functions: Use `query`, `mutation`, and `action`
- Internal functions: Use `internalQuery`, `internalMutation`, and `internalAction`
- Convex uses file-based routing (e.g., function `f` in `convex/example.ts` = `api.example.f`)
- Group related functions in domain-specific files

## Function Calling Patterns

- From query: Use `ctx.runQuery` to call other queries
- From mutation: Use `ctx.runQuery` or `ctx.runMutation`
- From action: Use `ctx.runQuery`, `ctx.runMutation`, or `ctx.runAction`
- Always use function references (e.g., `api.example.f`) not direct function calls

## Validation

- Always include argument validators with `args` property
- Always include return type validators with `returns` property
- Use appropriate validators from the `v` object
- Specify `returns: v.null()` for functions that don't return a value
