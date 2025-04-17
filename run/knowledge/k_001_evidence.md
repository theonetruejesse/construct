# Construct Project Structure

**Confidence:** 0.9

**Sources:**

- Directory listing of root, apps, apps/web, apps/web/src, apps/web/src/app

**Summary:**
The construct project follows a monorepo structure with separate apps for web and API. The web app is built using Next.js 15 with React 19 and utilizes Convex for backend integration. The project structure is clean and modern, using src/app directory structure for Next.js App Router. The current structure doesn't have a dedicated tables or VTable section yet. Components are organized within src/app/components. The project uses TailwindCSS for styling and already has a ConvexProvider set up in the providers.tsx file.

---

The construct project is organized as a monorepo with the following main directories:

- `/apps/web`: Frontend Next.js application
- `/apps/api`: Backend API built with Convex
- `/packages`: Shared packages (currently contains tsconfig and biome configurations)

The web application has the following structure:

- `/apps/web/src/app`: Next.js App Router structure
- `/apps/web/src/app/components`: React components (currently includes Chat, ChatInput, ChatMessage)
- `/apps/web/src/app/providers.tsx`: Providers setup including ConvexProvider
- `/apps/web/src/app/layout.tsx`: Root layout component
- `/apps/web/src/app/page.tsx`: Simple homepage component that renders Chat component

The current dependencies in web app include:

- React 19
- Next.js 15
- Convex client
- TailwindCSS 4
- No shadcn/ui components installed yet
- No React Query integration yet for Convex
