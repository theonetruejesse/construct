# Integrating Convex with React Query

**Confidence:** 0.85

**Sources:**

- Online research
- Convex documentation
- React Query documentation

**Summary:**
Convex provides its own reactive data querying system through the `useQuery` hook, but it can be integrated with React Query for more advanced caching, optimistic updates, and other features not natively available in Convex. This integration requires creating custom adapters that bridge the gap between Convex's real-time subscriptions and React Query's cache system. This approach allows leveraging React Query's optimistic updates while maintaining Convex's real-time capabilities.

---

## Integration Approaches

There are two main approaches to integrate Convex with React Query:

### 1. Custom Adapter Approach

This approach involves creating custom hooks that wrap Convex queries and mutations with React Query's functionality:

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../convex/_generated/api";
import { useConvex } from "convex/react";

// Custom hook to use Convex query with React Query
export function useConvexQuery(queryFn, args, options = {}) {
  const convex = useConvex();

  return useQuery({
    queryKey: [queryFn.toString(), args],
    queryFn: async () => await convex.query(queryFn, args),
    ...options,
  });
}

// Custom hook for mutations with optimistic updates
export function useConvexMutation(mutationFn, options = {}) {
  const convex = useConvex();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (args) => await convex.mutation(mutationFn, args),
    ...options,
  });
}
```

### 2. Real-time Subscription Integration

This approach leverages Convex's real-time capabilities while using React Query for optimistic updates:

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../convex/_generated/api";
import { useConvex } from "convex/react";
import { useEffect } from "react";

// Real-time subscription with React Query
export function useRealtimeQuery(queryFn, args, options = {}) {
  const convex = useConvex();
  const queryClient = useQueryClient();
  const queryKey = [queryFn.toString(), args];

  // Standard React Query
  const query = useQuery({
    queryKey,
    queryFn: async () => await convex.query(queryFn, args),
    ...options,
  });

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = convex.onUpdate(queryFn, args, (update) => {
      queryClient.setQueryData(queryKey, update);
    });

    return unsubscribe;
  }, [convex, queryFn, JSON.stringify(args), queryClient]);

  return query;
}
```

## Optimistic Updates with Convex and React Query

For optimistic updates, you can use React Query's optimistic update pattern:

```tsx
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: async (newRow) => {
    return await convex.mutation(api.vtable.rows.addRow, newRow);
  },
  onMutate: async (newRow) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ["vtable", tableId] });

    // Snapshot previous value
    const previousData = queryClient.getQueryData(["vtable", tableId]);

    // Optimistically update to the new value
    queryClient.setQueryData(["vtable", tableId], (old) => ({
      ...old,
      rows: [...old.rows, { id: "temp-id", ...newRow }],
    }));

    // Return context with the previous data
    return { previousData };
  },
  onError: (err, newRow, context) => {
    // If mutation fails, use the context returned from onMutate to roll back
    queryClient.setQueryData(["vtable", tableId], context.previousData);
  },
  onSettled: () => {
    // Always refetch after error or success
    queryClient.invalidateQueries({ queryKey: ["vtable", tableId] });
  },
});
```

This integration approach allows for combining the strengths of both Convex (real-time data) and React Query (sophisticated caching and optimistic updates).
