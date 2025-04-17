# Convex TanStack Query Adapter Limitations and Considerations

**Confidence:** 0.8

**Sources:**

- https://docs.convex.dev/client/tanstack-query
- https://github.com/get-convex/convex-js/tree/main/packages/convex-react-query (inferred)
- Online discussions and GitHub issues

**Summary:**
The Convex TanStack Query adapter (@convex-dev/react-query) is a relatively new beta feature that provides integration between Convex and TanStack Query. While it offers significant benefits, there are some limitations and considerations to be aware of when using it for the VTable implementation. These include beta status considerations, feature limitations, and potential edge cases in optimistic updates.

---

## Beta Status Considerations

The adapter is explicitly labeled as beta in the Convex documentation:

> The TanStack Query adapter is currently a beta feature. If you have feedback or feature requests, let us know on Discord!

This beta status implies:

1. The API might change in the future
2. There might be undiscovered bugs or edge cases
3. Documentation might be incomplete

However, being an official adapter means it has the support of the Convex team and is likely to be maintained and improved over time.

## Feature Limitations

The documentation explicitly mentions:

> Not all features of the standard Convex React client are available through the TanStack Query APIs but you can use the two alongside each other, dropping into the standard Convex React hooks as necessary.

What's not specified is which features are missing. Based on the documentation and general understanding:

1. Complex paging mechanisms might need to be handled differently
2. Some of the more advanced Convex-specific optimizations might not be available
3. Development tools specific to Convex might not integrate as well with TanStack Query

For VTable implementation, which primarily involves:

- Reading table data
- Adding/editing rows and cells
- Basic filtering and sorting

These limitations are unlikely to be blockers, as these are standard operations well supported by both systems.

## Optimistic Update Considerations

The integration allows for TanStack Query's optimistic update patterns, but there are some considerations:

1. When using optimistic updates, there's a potential for UI "flicker" if the optimistic update differs significantly from the server response
2. Complex optimistic updates involving multiple related entities might require careful coordination
3. Race conditions could potentially occur if multiple optimistic updates are made in quick succession

For VTable's use case, these considerations can be managed by:

- Carefully designing optimistic update logic to match expected server behavior
- Implementing proper error handling for cases where optimistic updates fail
- Using TanStack Query's built-in mechanisms for handling race conditions

## Recommendation

Despite these limitations and considerations, the official adapter remains the most appropriate solution for integrating Convex with TanStack Query for the VTable implementation. The benefits of using an official, supported solution outweigh the potential risks, especially given that:

1. The VTable use cases align well with the documented capabilities of the adapter
2. We can fall back to standard Convex React hooks for any edge cases if needed
3. The adapter eliminates the need to maintain custom integration code

For our implementation, we should make sure to:

1. Keep up with updates to the adapter as it matures beyond beta
2. Thoroughly test the integration, especially around optimistic updates
3. Have fallback strategies for any features that might not work as expected
