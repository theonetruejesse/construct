# MCP-VTable Project Structure

**Confidence:** 0.9

**Sources:**

- Directory listing of /Users/jesselee/dev/mcp-vtable/apps/web/src/app/\_components/VTable
- mcp-vtable/apps/web/src/app/page.tsx
- mcp-vtable/apps/web/package.json
- mcp-vtable/packages/ui/package.json

**Summary:**
The mcp-vtable project is organized as a monorepo with a Next.js frontend and uses tRPC for API communication instead of Convex. The web app has a VTable component in the \_components directory with a comprehensive structure including state management, styling, and subcomponents. The project uses React Query via tRPC, shadcn/ui components, and TailwindCSS for styling. The main page directly integrates the VTable component with an ID parameter.

---

The mcp-vtable VTable component is structured as follows:

- `/apps/web/src/app/_components/VTable/index.tsx`: Main VTable component
- `/apps/web/src/app/_components/VTable/vtable-types.ts`: TypeScript types for VTable
- `/apps/web/src/app/_components/VTable/state/`: State management for VTable
- `/apps/web/src/app/_components/VTable/styles/`: Styling for VTable
- `/apps/web/src/app/_components/VTable/components/`: Subcomponents for VTable

The main page.tsx file directly renders the VTable component:

```tsx
import React from "react";
import { api, HydrateClient } from "../trpc/server";
import { VTable } from "./_components/VTable";

export default async function Home() {
  await api.vtable.getFullTable.prefetch({ id: 1 });
  return (
    <HydrateClient>
      <p>VTable</p>
      <div className="flex w-full flex-col items-start justify-start">
        <VTable id={1} />
      </div>
      <div className="h-20" />
    </HydrateClient>
  );
}
```

The project uses tRPC for API communication, which needs to be replaced with Convex in the target implementation. The packages/ui directory contains shadcn/ui components that need to be migrated to the construct project.
