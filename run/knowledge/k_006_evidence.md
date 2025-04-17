# Shadcn/UI Setup and Migration

**Confidence:** 0.85

**Sources:**

- /Users/jesselee/dev/mcp-vtable/packages/ui/package.json
- /Users/jesselee/dev/mcp-vtable/packages/ui/components.json
- Online research on shadcn/ui

**Summary:**
Shadcn/UI is a collection of reusable components built using Radix UI and styled with Tailwind CSS. The mcp-vtable project has implemented shadcn/ui as a shared package, which needs to be migrated to the construct project. This migration involves setting up shadcn/ui, adding the necessary components, and ensuring the styling is consistent with the construct project.

---

## Setting Up Shadcn/UI in the Construct Project

To set up shadcn/ui in the construct project, we need to:

1. Create a new UI package in the packages directory
2. Configure shadcn/ui with `components.json`
3. Install required dependencies
4. Add the necessary components

The process involves:

### 1. Creating the package structure

```
/packages/ui/
├── src/
├── package.json
├── tsconfig.json
└── components.json
```

### 2. Setting up package.json

The package.json should include:

- Dependencies on Radix UI components
- Utility libraries like class-variance-authority, clsx, and tailwind-merge
- Peer dependencies on React, TailwindCSS, and other shared libraries

### 3. Configuring components.json

The components.json file should specify:

- Component style (default, new-york, etc.)
- CSS framework (tailwind)
- Output directory (src)
- Import aliases

### 4. Adding Components

Using the shadcn CLI, add the required components:

- Table components (essential for VTable)
- Button, Input, Label, Popover, etc.

### 5. Exporting Components

The package should export components via specific paths:

```javascript
// package.json exports
{
  "exports": {
    ".": "./src/index.ts",
    "./button": "./src/button.tsx",
    "./table": "./src/table.tsx"
    // etc.
  }
}
```

## Migrating to the Construct Project

The migration process involves:

1. Setting up the UI package with the same structure and components
2. Updating imports in the VTable components to use the new package
3. Ensuring styles are consistent with the construct project's design system

This migration will require creating all the necessary shadcn/ui components before implementing the VTable component to ensure all dependencies are available.
