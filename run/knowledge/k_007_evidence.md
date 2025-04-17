# Official Convex Integration with TanStack Query

**Confidence:** 0.95

**Sources:**

- https://docs.convex.dev/client/tanstack-query

**Summary:**
Convex provides an official adapter for TanStack Query that enables reactive updates while leveraging TanStack Query's capabilities. This integration uses a different approach than custom hooks, providing specific utility functions that work with TanStack Query's API. The adapter is designed to maintain Convex's real-time capabilities while allowing developers to use the familiar TanStack Query patterns.

---

## Official Convex-TanStack Query Integration

The official Convex documentation provides a well-defined approach to integrate with TanStack Query:

1. **Setup**:

   ```tsx
   import { ConvexQueryClient } from "@convex-dev/react-query";
   import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
   import { ConvexProvider, ConvexReactClient } from "convex/react";

   const convex = new ConvexReactClient(
     process.env.NEXT_PUBLIC_CONVEX_URL as string
   );
   const convexQueryClient = new ConvexQueryClient(convex);
   const queryClient = new QueryClient({
     defaultOptions: {
       queries: {
         queryKeyHashFn: convexQueryClient.hashFn(),
         queryFn: convexQueryClient.queryFn(),
       },
     },
   });
   convexQueryClient.connect(queryClient);

   // In your app component
   <ConvexProvider client={convex}>
     <QueryClientProvider client={queryClient}>
       <App />
     </QueryClientProvider>
   </ConvexProvider>;
   ```

2. **Queries**:

   ```tsx
   import { useQuery } from "@tanstack/react-query";
   import { convexQuery } from "@convex-dev/react-query";
   import { api } from "../convex/_generated/api";

   export function App() {
     const { data, isPending, error } = useQuery(
       convexQuery(api.functions.myQuery, { id: 123 })
     );
     return isPending ? "Loading..." : data;
   }
   ```

3. **Mutations**:

   ```tsx
   import { useMutation } from "@tanstack/react-query";
   import { useConvexMutation } from "@convex-dev/react-query";
   import { api } from "../convex/_generated/api";

   export function App() {
     const { mutate, isPending } = useMutation({
       mutationFn: useConvexMutation(api.functions.doSomething),
     });
     return <button onClick={() => mutate({ a: "Hello" })}>Click me</button>;
   }
   ```

## Key Advantages

1. **Real-time Updates**: Unlike typical polling-based TanStack Query usage, this integration receives updates reactively from the Convex server.
2. **No Manual Query Invalidation**: Data is never stale, and there's no need to manually invalidate queries.
3. **Optimistic Updates**: Can leverage TanStack Query's optimistic update patterns.
4. **Official Support**: As an official adapter maintained by Convex, it's likely to be kept up-to-date with both Convex and TanStack Query changes.

## Limitations

1. **Beta Status**: The adapter is currently in beta, which may mean some features are still evolving.
2. **Not All Features Available**: The documentation notes that not all features of the standard Convex React client are available through the TanStack Query APIs.

This official integration approach is simpler and more maintainable than our custom integration ideas and should be the preferred approach for integrating Convex with TanStack Query in the VTable implementation.
