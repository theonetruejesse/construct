# Implementation Plan: VTable Migration from mcp-vtable to construct with Convex Integration

**Run ID:** run
**Based on Synthesis of Validated Micro-Hypotheses:** [h_A_ProjectStructure_001, h_A_ConvexIntegration_001, h_A_ComponentMigration_001, h_A_ShadcnSetup_001, h_A_TanStackTable_001]
**Null Challenge Summary:** All challenges passed (See [nc_h_A_ShadcnSetup_001_challenge.json](run/null_challenges/nc_h_A_ShadcnSetup_001_challenge.json), [nc_h_A_TanStackTable_001_challenge.json](run/null_challenges/nc_h_A_TanStackTable_001_challenge.json))
**Synthesis Summary:** [run/synthesis.md](run/synthesis.md)

## 1. Problem Summary (The Gap)

The construct project requires a sophisticated data table component that matches the capabilities of the VTable component from the mcp-vtable project. This migration must preserve the component architecture, performance optimizations, and UX while adapting the data layer to use Convex with the TanStack Query adapter, ensuring real-time updates and optimistic UI patterns are maintained.

## 2. Proposed Solution (Synthesized)

### Overall Narrative

Our solution migrates the VTable component from mcp-vtable to the construct project through a three-phase approach:

1. Set up shadcn/ui components as a dedicated UI package
2. Implement the VTable component with TanStack Table integration
3. Connect the VTable to Convex data with optimistic updates

This approach ensures that the UI components and styling are consistent with the source project, the core table functionality is preserved, and the data layer is properly adapted to Convex's real-time capabilities.

### Key Components/Areas Addressed

1. **Project Structure**

   - Create a modular package architecture
   - Separate UI components, VTable implementation, and application code

2. **Shadcn/UI Components**

   - Set up shadcn/ui components with same customization as mcp-vtable
   - Use 'new-york' style variant for consistency
   - Implement Table, Button, Input, and other required components

3. **TanStack Table Integration**

   - Migrate the core table component with performance optimizations
   - Preserve memoization patterns for VColumns and VRows
   - Adapt for Convex's Id type instead of numeric IDs

4. **Convex Integration**
   - Use @convex-dev/react-query adapter for data fetching
   - Implement optimistic updates for cell edits
   - Ensure proper real-time update handling

### Implementation Prerequisites

- Node.js and npm/yarn
- TanStack Table v8.21.2
- @convex-dev/react-query
- Access to both mcp-vtable and construct projects
- Understanding of Convex data model and query patterns

### Key Dependencies

- **TanStack Table**: Core table functionality and state management
- **Convex**: Backend and real-time data capabilities
- **shadcn/ui**: UI component system
- **TanStack Query**: Data fetching and mutation patterns
- **Radix UI**: Primitives for UI components
- **Tailwind CSS**: Styling and theming

## 3. Implementation Sequence

### Phase 1: UI Components Setup

#### Step 1.1: Create UI Package Structure

**Rationale/Details:**
We need to establish a dedicated UI package to house the shadcn/ui components. This follows the modular architecture pattern in the construct project and allows for reuse across different applications.

**Related Micro-Hypotheses:** [h_A_ProjectStructure_001, h_A_ShadcnSetup_001]

**Full Proposed Implementation:**

```bash
# From the project root
mkdir -p packages/ui/src
```

Create package.json:

```json
{
  "name": "@construct/ui",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "sideEffects": false,
  "exports": {
    ".": "./src/index.ts",
    "./button": "./src/button/index.ts",
    "./input": "./src/input/index.ts",
    "./label": "./src/label/index.ts",
    "./select": "./src/select/index.ts",
    "./popover": "./src/popover/index.ts",
    "./dropdown-menu": "./src/dropdown-menu/index.ts",
    "./tooltip": "./src/tooltip/index.ts",
    "./dialog": "./src/dialog/index.ts",
    "./skeleton": "./src/skeleton/index.ts",
    "./table": "./src/table/index.ts",
    "./styles.css": "./src/styles.css"
  },
  "scripts": {
    "lint": "eslint src --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,md}\""
  },
  "dependencies": {
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.5",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-select": "^1.2.2",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-tooltip": "^1.0.6",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^1.14.0"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "tailwindcss": "^3.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.5.7",
    "@types/react": "^18.2.21",
    "@types/react-dom": "^18.2.7",
    "eslint": "^8.48.0",
    "prettier": "^3.0.3",
    "typescript": "^5.2.2"
  }
}
```

Create tsconfig.json:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

Create components.json for shadcn/ui configuration:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/styles.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

#### Step 1.2: Create Utility Functions

**Rationale/Details:**
We need utility functions for conditional class name application. This is a core pattern used by shadcn/ui components for style composition.

**Related Micro-Hypotheses:** [h_A_ShadcnSetup_001]

**Full Proposed Implementation:**

Create src/lib/utils.ts:

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with tailwind-merge to prevent conflicts
 * This is the standard shadcn/ui utility for handling conditional classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

#### Step 1.3: Create Global CSS for Theming

**Rationale/Details:**
We need to establish the CSS variables for theming, matching the approach in mcp-vtable. This ensures visual consistency across components.

**Related Micro-Hypotheses:** [h_A_ShadcnSetup_001]

**Full Proposed Implementation:**

Create src/styles.css:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;

    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;

    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;

    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;

    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;

    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;

    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;

    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;

    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;

    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;

    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;

    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;

    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

Update tailwind.config.js in project root:

```javascript
const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

#### Step 1.4: Implement Table Components

**Rationale/Details:**
The Table components are core to the VTable implementation. We need to recreate them with the same styling and functionality as in mcp-vtable.

**Related Micro-Hypotheses:** [h_A_ShadcnSetup_001, h_A_TanStackTable_001]

**Full Proposed Implementation:**

Create src/table/index.ts:

```typescript
export * from "./table";
```

Create src/table/table.tsx:

```tsx
import * as React from "react";

import { cn } from "@/lib/utils";

// Table Root Component
const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

// Table Header Component
const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("bg-muted/50 [&_tr]:border-b", className)}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

// Table Body Component
const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

// Table Footer Component
const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

// Table Row Component
const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

// Table Head Component
const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

// Table Cell Component
const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

// Table Caption Component
const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
```

#### Step 1.5: Implement Button Component

**Rationale/Details:**
The Button component is used throughout the VTable for actions like adding rows and columns. We need to recreate it with the same styling and variants as in mcp-vtable.

**Related Micro-Hypotheses:** [h_A_ShadcnSetup_001]

**Full Proposed Implementation:**

Create src/button/index.ts:

```typescript
export * from "./button";
```

Create src/button/button.tsx:

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

#### Step 1.11: Implement Skeleton Component

**Rationale/Details:**
The Skeleton component is used for loading states in the VTable. We need to implement it with the same styling as in mcp-vtable.

**Related Micro-Hypotheses:** [h_A_ShadcnSetup_001, h_A_TanStackTable_001]

**Full Proposed Implementation:**

Create src/skeleton/index.ts:

```typescript
export * from "./skeleton";
```

Create src/skeleton/skeleton.tsx:

```tsx
import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
```

#### Step 1.12: Create Main Exports File

**Rationale/Details:**
We need to create a main exports file to make it easy to import components from the UI package.

**Related Micro-Hypotheses:** [h_A_ShadcnSetup_001]

**Full Proposed Implementation:**

Create src/index.ts:

```typescript
export * from "./button";
export * from "./input";
export * from "./label";
export * from "./select";
export * from "./popover";
export * from "./dropdown-menu";
export * from "./tooltip";
export * from "./dialog";
export * from "./skeleton";
export * from "./table";

// Utils
export { cn } from "./lib/utils";
```

### Phase 2: VTable Component Implementation

#### Step 2.1: Create VTable Package Structure

**Rationale/Details:**
We need to establish a dedicated VTable package to house the table implementation. This follows the modular architecture pattern in the construct project.

**Related Micro-Hypotheses:** [h_A_ProjectStructure_001, h_A_TanStackTable_001]

**Full Proposed Implementation:**

```bash
# From the project root
mkdir -p packages/vtable/src
```

Create packages/vtable/package.json:

```json
{
  "name": "@construct/vtable",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "eslint src --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,md}\""
  },
  "dependencies": {
    "@construct/ui": "workspace:*",
    "@convex-dev/react-query": "^0.5.0",
    "@tanstack/react-table": "^8.21.2"
  },
  "peerDependencies": {
    "convex": "^1.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.5.7",
    "@types/react": "^18.2.21",
    "@types/react-dom": "^18.2.7",
    "eslint": "^8.48.0",
    "prettier": "^3.0.3",
    "typescript": "^5.2.2"
  }
}
```

Create packages/vtable/tsconfig.json:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

#### Step 2.2: Define VTable Types

**Rationale/Details:**
We need to define the core types for the VTable component, adapting from the mcp-vtable implementation but using Convex ID types instead of numeric IDs.

**Related Micro-Hypotheses:** [h_A_TanStackTable_001, h_A_ConvexIntegration_001]

**Full Proposed Implementation:**

Create packages/vtable/src/vtable-types.ts:

```typescript
import { Id } from "convex/values";

// Column type definitions
export type ColumnType = "text" | "number" | "boolean" | "select" | "date";

export interface ColumnOptions {
  selectOptions?: string[];
  dateFormat?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  [key: string]: any;
}

export interface Column {
  id: Id<"vtableColumns">;
  name: string;
  type: ColumnType;
  options: ColumnOptions | null;
  order: number;
}

// Cell data
export interface CellData {
  id: Id<"vtableCells"> | null;
  value: any;
}

// Row definition
export interface Row {
  id: Id<"vtableRows">;
  createdAt: number;
  cells: Record<string, CellData>; // Column ID string -> CellData
}

// Table definition
export interface VTableData {
  table: {
    _id: Id<"vtables">;
    name: string;
    ownerId: string;
    createdAt: number;
    description: string | null;
  };
  columns: Column[];
  rows: Row[];
}

// Input types for mutations
export interface UpdateCellInput {
  id: Id<"vtableCells"> | null;
  value: any;
  tableId: Id<"vtables">;
  rowId: Id<"vtableRows">;
  columnId: Id<"vtableColumns">;
}

export interface AddColumnInput {
  tableId: Id<"vtables">;
  name: string;
  type: ColumnType;
  options?: ColumnOptions;
}

export interface AddRowInput {
  tableId: Id<"vtables">;
}

// Helper functions for default values
export function getDefaultValueForType(type: ColumnType): any {
  switch (type) {
    case "text":
      return "";
    case "number":
      return 0;
    case "boolean":
      return false;
    case "select":
      return null;
    case "date":
      return new Date().toISOString().split("T")[0];
    default:
      return null;
  }
}
```

#### Step 2.3: Create State Management

**Rationale/Details:**
We need to implement the state management for the VTable component, following the same pattern as in mcp-vtable but adapting for Convex.

**Related Micro-Hypotheses:** [h_A_TanStackTable_001]

**Full Proposed Implementation:**

Create packages/vtable/src/state/vtable-context.tsx:

```tsx
import React, { createContext, useContext, useState, useCallback } from "react";
import { Id } from "convex/values";

// Context type
interface VTableContextType {
  refreshCounter: number;
  refreshTable: () => void;
}

// Default context values
const defaultContext: VTableContextType = {
  refreshCounter: 0,
  refreshTable: () => {},
};

// Create context
const VTableContext = createContext<VTableContextType>(defaultContext);

// Provider component
export function VTableProvider({ children }: { children: React.ReactNode }) {
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Function to force refresh
  const refreshTable = useCallback(() => {
    setRefreshCounter((prev) => prev + 1);
  }, []);

  return (
    <VTableContext.Provider value={{ refreshCounter, refreshTable }}>
      {children}
    </VTableContext.Provider>
  );
}

// Hook to use the context
export function useVTable() {
  const context = useContext(VTableContext);
  if (!context) {
    throw new Error("useVTable must be used within a VTableProvider");
  }
  return context;
}
```

#### Step 2.4: Implement Data Transformation for TanStack Table

**Rationale/Details:**
We need to transform the Convex data into a format that can be consumed by TanStack Table. This follows the same pattern as in mcp-vtable but adapts for the Convex data model.

**Related Micro-Hypotheses:** [h_A_TanStackTable_001, h_A_ConvexIntegration_001]

**Full Proposed Implementation:**

Create packages/vtable/src/state/vtable-query.tsx:

```tsx
import { useMemo } from "react";
import { useQuery } from "@convex-dev/react-query";
import { Id } from "convex/values";
import { api } from "@/convex/api";
import {
  type ColumnType,
  type Column,
  type Row,
  type CellData,
  type VTableData,
} from "../vtable-types";
import { useVTable } from "./vtable-context";

/**
 * Custom hook to fetch and transform VTable data for use with TanStack Table
 * Handles data transformation from Convex to the format expected by @tanstack/react-table
 */
export function useVTableData(tableId: Id<"vtables">) {
  const { refreshCounter } = useVTable();

  // Use refresh counter as part of the query key to force refresh when needed
  const { data, isLoading, error } = useQuery(
    api.vtable.getFullTable,
    { id: tableId },
    { queryKey: ["vtable", tableId.toString(), refreshCounter] }
  );

  // Transform data for TanStack Table
  const transformedData = useMemo(() => {
    if (!data) return { tableData: [], tableColumns: [] };

    // Transform columns for TanStack Table
    const tableColumns = data.columns.map((column) => ({
      id: column.id.toString(),
      accessorFn: (row: any) => {
        const cellData = row.cells[column.id.toString()];
        return cellData ? cellData.value : null;
      },
      header: column.name,
      cell: ({ getValue, row, column }: any) => {
        const cellValue = getValue();
        const columnDef = data.columns.find(
          (col) => col.id.toString() === column.id
        );

        // Cell data includes the ID and value
        const cellData: CellData = {
          id: row.original.cells[column.id]?.id || null,
          value: cellValue,
        };

        return cellData;
      },
      meta: {
        columnType: column.type,
        columnOptions: column.options,
      },
    }));

    // Transform rows for TanStack Table
    const tableData = data.rows.map((row) => ({
      id: row.id,
      createdAt: row.createdAt,
      cells: row.cells,
    }));

    return { tableData, tableColumns, rawData: data };
  }, [data]);

  return {
    ...transformedData,
    isLoading,
    error,
  };
}

/**
 * Utility function to format values based on column type
 * Used for display formatting in table cells
 */
export function formatValueByType(value: any, type: ColumnType): string {
  if (value === null || value === undefined) return "";

  switch (type) {
    case "text":
      return String(value);
    case "number":
      return typeof value === "number" ? value.toString() : "";
    case "boolean":
      return value ? "Yes" : "No";
    case "date":
      try {
        const date = new Date(value);
        return date.toLocaleDateString();
      } catch {
        return String(value);
      }
    case "select":
      return String(value);
    default:
      return String(value);
  }
}
```

#### Step 2.5: Create Convex Query Adapter

**Rationale/Details:**
We need to create a Convex query adapter to handle data fetching and mutation operations, replacing the tRPC server actions in mcp-vtable.

**Related Micro-Hypotheses:** [h_A_ConvexIntegration_001]

**Full Proposed Implementation:**

Create packages/vtable/src/state/vtable-actions.ts:

```typescript
import { useMutation } from "@convex-dev/react-query";
import { api } from "@/convex/api";
import { Id } from "convex/values";
import {
  type UpdateCellInput,
  type AddColumnInput,
  type AddRowInput,
} from "../vtable-types";
import { useVTable } from "./vtable-context";

/**
 * Hook for updating a cell value
 * Includes optimistic update handling
 */
export function useUpdateCell() {
  const { refreshTable } = useVTable();
  const mutation = useMutation(api.vtable.updateCell);

  const updateCell = async (input: UpdateCellInput) => {
    return mutation.mutate(input, {
      // Optimistic updates will be implemented in the VCell component
      onSuccess: () => {
        refreshTable();
      },
      onError: (error) => {
        console.error("Error updating cell:", error);
      },
    });
  };

  return {
    updateCell,
    isLoading: mutation.isPending,
  };
}

/**
 * Hook for adding a column to the table
 * Implements optimistic updates for immediate UI feedback
 */
export function useAddColumn(tableId: Id<"vtables">) {
  const { refreshTable } = useVTable();
  const mutation = useMutation(api.vtable.createColumn);

  const addColumn = async (input: Omit<AddColumnInput, "tableId">) => {
    return mutation.mutate(
      { ...input, tableId },
      {
        // Optimistic update logic to be implemented
        onSuccess: () => {
          refreshTable();
        },
        onError: (error) => {
          console.error("Error adding column:", error);
        },
      }
    );
  };

  return {
    addColumn,
    isLoading: mutation.isPending,
  };
}

/**
 * Hook for adding a row to the table
 * Implements optimistic updates for immediate UI feedback
 */
export function useAddRow(tableId: Id<"vtables">) {
  const { refreshTable } = useVTable();
  const mutation = useMutation(api.vtable.createRow);

  const addRow = async () => {
    return mutation.mutate(
      { tableId },
      {
        // Optimistic update logic to be implemented
        onSuccess: () => {
          refreshTable();
        },
        onError: (error) => {
          console.error("Error adding row:", error);
        },
      }
    );
  };

  return {
    addRow,
    isLoading: mutation.isPending,
  };
}

/**
 * Hook for deleting a row from the table
 */
export function useDeleteRow() {
  const { refreshTable } = useVTable();
  const mutation = useMutation(api.vtable.deleteRow);

  const deleteRow = async (rowId: Id<"vtableRows">) => {
    return mutation.mutate(
      { rowId },
      {
        onSuccess: () => {
          refreshTable();
        },
        onError: (error) => {
          console.error("Error deleting row:", error);
        },
      }
    );
  };

  return {
    deleteRow,
    isLoading: mutation.isPending,
  };
}

/**
 * Hook for deleting a column from the table
 */
export function useDeleteColumn() {
  const { refreshTable } = useVTable();
  const mutation = useMutation(api.vtable.deleteColumn);

  const deleteColumn = async (columnId: Id<"vtableColumns">) => {
    return mutation.mutate(
      { columnId },
      {
        onSuccess: () => {
          refreshTable();
        },
        onError: (error) => {
          console.error("Error deleting column:", error);
        },
      }
    );
  };

  return {
    deleteColumn,
    isLoading: mutation.isPending,
  };
}
```

#### Step 2.6: Implement Main VTable Component

**Rationale/Details:**
We need to implement the main VTable component that sets up the TanStack Table and renders the table structure. This follows the same pattern as in mcp-vtable but adapts for Convex.

**Related Micro-Hypotheses:** [h_A_TanStackTable_001, h_A_ComponentMigration_001]

**Full Proposed Implementation:**

Create packages/vtable/src/index.tsx:

```tsx
import React, { Suspense } from "react";
import { Id } from "convex/values";
import { Skeleton } from "@construct/ui";
import { VTableProvider } from "./state/vtable-context";
import { VTableImpl } from "./vtable-impl";

export interface VTableProps {
  tableId: Id<"vtables">;
  className?: string;
}

export function VTable({ tableId, className }: VTableProps) {
  return (
    <VTableProvider>
      <Suspense fallback={<VTableSkeleton />}>
        <VTableImpl tableId={tableId} className={className} />
      </Suspense>
    </VTableProvider>
  );
}

function VTableSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-8 w-[120px]" />
      </div>
      <div className="border rounded-md">
        <div className="h-10 border-b bg-muted/50">
          <div className="flex">
            <Skeleton className="h-full w-[200px] rounded-none" />
            <Skeleton className="h-full w-[200px] rounded-none" />
            <Skeleton className="h-full w-[200px] rounded-none" />
          </div>
        </div>
        <div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex h-10 border-b last:border-0">
              <Skeleton className="h-full w-[200px] rounded-none" />
              <Skeleton className="h-full w-[200px] rounded-none" />
              <Skeleton className="h-full w-[200px] rounded-none" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Re-export types
export * from "./vtable-types";
export * from "./state/vtable-context";
export * from "./state/vtable-actions";
```

Create packages/vtable/src/vtable-impl.tsx:

```tsx
import React, { useState } from "react";
import { Id } from "convex/values";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Table, TableHeader, TableBody, Button } from "@construct/ui";
import { useVTableData } from "./state/vtable-query";
import { useAddRow } from "./state/vtable-actions";
import { VColumns } from "./components/VColumns";
import { VRows } from "./components/VRows";
import { Plus } from "lucide-react";

export interface VTableImplProps {
  tableId: Id<"vtables">;
  className?: string;
}

export function VTableImpl({ tableId, className }: VTableImplProps) {
  const { tableData, tableColumns, rawData, isLoading } =
    useVTableData(tableId);
  const { addRow, isLoading: isAddingRow } = useAddRow(tableId);

  // Set up TanStack Table
  const table = useReactTable({
    data: tableData,
    columns: tableColumns as ColumnDef<any>[],
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      size: 200,
      minSize: 120,
    },
  });

  if (isLoading) return null; // Handled by Suspense

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{rawData?.table.name}</h2>
        <Button
          onClick={() => addRow()}
          disabled={isAddingRow}
          size="sm"
          className="flex items-center"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Row
        </Button>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <VColumns table={table} tableId={tableId} />
          </TableHeader>
          <TableBody>
            <VRows table={table} tableId={tableId} />
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

#### Step 2.7: Implement VColumns Component

**Rationale/Details:**
We need to implement the VColumns component that renders and manages table headers with the same memoization optimizations as in mcp-vtable.

**Related Micro-Hypotheses:** [h_A_TanStackTable_001]

**Full Proposed Implementation:**

Create packages/vtable/src/components/VColumns/index.tsx:

```tsx
import React from "react";
import { flexRender } from "@tanstack/react-table";
import type { Table } from "@tanstack/react-table";
import { Id } from "convex/values";
import { TableHead, TableRow } from "@construct/ui";
import { useAddColumn } from "../../state/vtable-actions";
import { Plus } from "lucide-react";

export interface VColumnsProps {
  table: Table<any>;
  tableId: Id<"vtables">;
}

/**
 * VColumns component renders the table headers and handles column-related operations
 * Uses React.memo with a custom equality function to optimize rendering performance
 */
export const VColumns = React.memo(
  ({ table, tableId }: VColumnsProps) => {
    const { addColumn } = useAddColumn(tableId);

    // Add column handler - simplified version for the implementation plan
    const handleAddColumn = () => {
      addColumn({
        name: `Column ${table.getAllColumns().length + 1}`,
        type: "text",
        options: {},
      });
    };

    return (
      <TableRow>
        {table.getHeaderGroups().map((headerGroup) => (
          <React.Fragment key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                style={{
                  width: header.getSize(),
                }}
                className="border-r last:border-r-0 relative"
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}

                {/* Column resize handle - simplified */}
                {header.column.getCanResize() && (
                  <div
                    className="absolute right-0 top-0 h-full w-1 bg-slate-300 cursor-col-resize select-none touch-none hover:bg-slate-400"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
              </TableHead>
            ))}

            {/* Add column button cell */}
            <TableHead className="w-10 p-0">
              <button
                onClick={handleAddColumn}
                className="flex h-full w-full items-center justify-center hover:bg-slate-100"
                title="Add column"
              >
                <Plus className="h-4 w-4 text-slate-400" />
              </button>
            </TableHead>
          </React.Fragment>
        ))}
      </TableRow>
    );
  },
  // Custom equality function for performance optimization
  (prevProps, nextProps) => {
    const prevState = prevProps.table.getState();
    const nextState = nextProps.table.getState();

    // Only re-render when these specific properties change
    return (
      prevState.columnSizing === nextState.columnSizing &&
      prevState.columnOrder === nextState.columnOrder &&
      prevProps.table.getAllColumns().length ===
        nextProps.table.getAllColumns().length &&
      !prevState.columnSizingInfo.isResizingColumn &&
      !nextState.columnSizingInfo.isResizingColumn
    );
  }
);

VColumns.displayName = "VColumns";
```

#### Step 2.8: Implement VRows Component

**Rationale/Details:**
We need to implement the VRows component that renders table rows with memoization optimizations.

**Related Micro-Hypotheses:** [h_A_TanStackTable_001]

**Full Proposed Implementation:**

Create packages/vtable/src/components/VRows/index.tsx:

```tsx
import React from "react";
import { flexRender } from "@tanstack/react-table";
import type { Table } from "@tanstack/react-table";
import { Id } from "convex/values";
import { TableRow } from "@construct/ui";
import { VCell } from "../VCell";

export interface VRowsProps {
  table: Table<any>;
  tableId: Id<"vtables">;
}

/**
 * VRows component renders the table rows with VCell components
 * Uses React.memo with a custom equality function to optimize rendering performance
 */
export const VRows = React.memo(
  ({ table, tableId }: VRowsProps) => {
    return (
      <>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id} className="relative">
            {row.getVisibleCells().map((cell) => (
              <VCell
                key={cell.id}
                cell={cell}
                style={{
                  width: cell.column.getSize(),
                }}
                tableId={tableId}
              />
            ))}

            {/* Empty cell for add column column */}
            <td className="w-10 p-0" />
          </TableRow>
        ))}

        {table.getRowModel().rows.length === 0 && (
          <TableRow>
            <td
              colSpan={table.getAllColumns().length + 1}
              className="h-24 text-center text-muted-foreground"
            >
              No data
            </td>
          </TableRow>
        )}
      </>
    );
  },
  // Custom equality function for performance optimization
  (prevProps, nextProps) => {
    // Only re-render when row data changes or column sizing changes
    const prevRows = prevProps.table.getRowModel().rows;
    const nextRows = nextProps.table.getRowModel().rows;

    if (prevRows.length !== nextRows.length) {
      return false;
    }

    const prevState = prevProps.table.getState();
    const nextState = nextProps.table.getState();

    // Check column sizing
    if (prevState.columnSizing !== nextState.columnSizing) {
      return false;
    }

    // Simplified row comparison - in practice, would need more detailed comparison
    // of the actual data to prevent unnecessary re-renders
    return true;
  }
);

VRows.displayName = "VRows";
```

#### Step 2.9: Implement VCell Component

**Rationale/Details:**
We need to implement the VCell component that renders and manages individual cell editing with optimistic updates.

**Related Micro-Hypotheses:** [h_A_TanStackTable_001, h_A_ConvexIntegration_001]

**Full Proposed Implementation:**

Create packages/vtable/src/components/VCell/index.tsx:

```tsx
import React, { useState, useEffect } from "react";
import { CellContext } from "@tanstack/react-table";
import { Id } from "convex/values";
import { TableCell, Input } from "@construct/ui";
import { useUpdateCell } from "../../state/vtable-actions";
import { CellData, ColumnType } from "../../vtable-types";
import { formatValueByType } from "../../state/vtable-query";

export interface VCellProps {
  cell: CellContext<any, unknown>;
  style?: React.CSSProperties;
  tableId: Id<"vtables">;
}

/**
 * VCell component renders and manages individual cell editing
 * Handles optimistic updates for immediate UI feedback
 */
export const VCell: React.FC<VCellProps> = ({
  cell,
  style,
  tableId,
  ...rest
}) => {
  // Access the cell data which contains both id and value
  const cellData = cell.getValue() as CellData;

  // Get column type metadata from column definition
  const columnType =
    (cell.column.columnDef.meta?.columnType as ColumnType) || "text";

  // Initialize state with the cell value
  const [lastValue, setLastValue] = useState(cellData.value || "");
  const [value, setValue] = useState(cellData.value || "");
  const [isEditing, setIsEditing] = useState(false);

  // Update action from Convex
  const { updateCell, isLoading } = useUpdateCell();

  // Update local state when cell data changes
  useEffect(() => {
    if (!isEditing) {
      setValue(cellData.value || "");
      setLastValue(cellData.value || "");
    }
  }, [cellData.value, isEditing]);

  // Handle value change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  // Handle save on blur
  const handleBlur = () => {
    setIsEditing(false);

    // Only update if value has changed
    if (value !== lastValue) {
      // Prepare update input
      const updateInput = {
        id: cellData.id,
        value,
        tableId,
        rowId: cell.row.original.id,
        columnId: cell.column.id as unknown as Id<"vtableColumns">,
      };

      // Optimistic update - local state is already updated
      updateCell(updateInput);

      // Update last value
      setLastValue(value);
    }
  };

  // Implementation for different column types would be expanded here
  // For this implementation plan, we'll use a simple text input for all types

  return (
    <TableCell
      style={{ ...style }}
      className="p-0 truncate border-r border-gray-200 text-left last:border-r-0"
      {...rest}
    >
      {isEditing ? (
        <Input
          value={value as string}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={() => setIsEditing(true)}
          className="w-full h-full rounded-none border-none bg-transparent shadow-none px-2"
          disabled={isLoading}
          autoFocus
        />
      ) : (
        <div
          className="w-full h-full p-2 truncate cursor-text"
          onClick={() => setIsEditing(true)}
        >
          {formatValueByType(value, columnType)}
        </div>
      )}
    </TableCell>
  );
};
```

#### Step 2.10: Implement Optimistic Update for Add Column

**Rationale/Details:**
We need to implement the optimistic update pattern for adding columns, following the same approach as in mcp-vtable but adapting for Convex.

**Related Micro-Hypotheses:** [h_A_ConvexIntegration_001, h_A_TanStackTable_001]

**Full Proposed Implementation:**

Create packages/vtable/src/hooks/useAddColumnWithOptimisticUpdate.ts:

```typescript
import { useMutation, useQuery } from "@convex-dev/react-query";
import { api } from "@/convex/api";
import { Id } from "convex/values";
import { useVTable } from "../state/vtable-context";
import {
  type ColumnType,
  type ColumnOptions,
  getDefaultValueForType,
} from "../vtable-types";

/**
 * Add column mutation with optimistic updates
 * When successful, invalidates getFullTable query cache and refreshes the table
 */
export const useAddColumnWithOptimisticUpdate = (tableId: Id<"vtables">) => {
  const { refreshTable } = useVTable();

  // Access the query cache
  const queryClient = useQuery.getQueryClient();

  const { mutate, isPending } = useMutation(api.vtable.createColumn, {
    onMutate: async (newColumn) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({
        queryKey: ["vtable", tableId.toString()],
      });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData([
        "vtable",
        tableId.toString(),
      ]);

      if (!previousData) return { previousData }; // Nothing to update optimistically

      // Create a temporary ID for the optimistic column
      const tempColumnId =
        `temp-${Date.now()}` as unknown as Id<"vtableColumns">;

      const optimisticColumn = {
        id: tempColumnId,
        tableId,
        name: newColumn.name,
        type: newColumn.type,
        options: newColumn.options || {},
        order: previousData.columns.length,
      };

      // Clone the data and add our new column
      const updatedData = {
        ...previousData,
        columns: [...previousData.columns, optimisticColumn],
      };

      // Add empty cells for each row for this new column
      updatedData.rows = updatedData.rows.map((row) => {
        // Deep clone the row to avoid mutating the original
        const updatedRow = { ...row, cells: { ...row.cells } };
        updatedRow.cells[tempColumnId.toString()] = {
          id: null,
          value: getDefaultValueForType(newColumn.type),
        };
        return updatedRow;
      });

      // Set the optimistic data in the cache
      queryClient.setQueryData(["vtable", tableId.toString()], updatedData);

      // Refresh the table to show our optimistic update
      refreshTable();

      // Return the previous data so we can revert if needed
      return { previousData };
    },

    // When successful, refresh with actual server data
    onSuccess: async () => {
      // Invalidate the query to get the real data from the server
      await queryClient.invalidateQueries({
        queryKey: ["vtable", tableId.toString()],
      });
      // Refresh the UI with the actual server data
      refreshTable();
    },

    // On error, roll back to the previous state
    onError: (error, _, context) => {
      console.error("Error creating column:", error);

      // If we have the previous data, roll back
      if (context?.previousData) {
        queryClient.setQueryData(
          ["vtable", tableId.toString()],
          context.previousData
        );
        refreshTable();
      }
    },
  });

  // Wrapper function with the right input type
  const addColumn = (input: {
    name: string;
    type: ColumnType;
    options?: ColumnOptions;
  }) => {
    mutate({
      tableId,
      name: input.name,
      type: input.type,
      options: input.options || {},
    });
  };

  return { addColumn, isPending };
};
```

#### Step 2.11: Implement Optimistic Update for Add Row

**Rationale/Details:**
We need to implement the optimistic update pattern for adding rows, following the same approach as in mcp-vtable but adapting for Convex.

**Related Micro-Hypotheses:** [h_A_ConvexIntegration_001, h_A_TanStackTable_001]

**Full Proposed Implementation:**

Create packages/vtable/src/hooks/useAddRowWithOptimisticUpdate.ts:

```typescript
import { useMutation, useQuery } from "@convex-dev/react-query";
import { api } from "@/convex/api";
import { Id } from "convex/values";
import { useVTable } from "../state/vtable-context";
import { getDefaultValueForType } from "../vtable-types";

/**
 * Add row mutation with optimistic updates
 * When successful, invalidates getFullTable query cache and refreshes the table
 */
export const useAddRowWithOptimisticUpdate = (tableId: Id<"vtables">) => {
  const { refreshTable } = useVTable();

  // Access the query cache
  const queryClient = useQuery.getQueryClient();

  const { mutate, isPending } = useMutation(api.vtable.createRow, {
    onMutate: async () => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({
        queryKey: ["vtable", tableId.toString()],
      });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData([
        "vtable",
        tableId.toString(),
      ]);

      if (!previousData) return { previousData }; // Nothing to update optimistically

      // Create a temporary ID for the optimistic row
      const tempRowId = `temp-${Date.now()}` as unknown as Id<"vtableRows">;

      // Create cells object with default values for each column
      const cells = {};
      previousData.columns.forEach((column) => {
        cells[column.id.toString()] = {
          id: null,
          value: getDefaultValueForType(column.type),
        };
      });

      const optimisticRow = {
        id: tempRowId,
        tableId,
        createdAt: Date.now(),
        cells,
      };

      // Clone the data and add our new row
      const updatedData = {
        ...previousData,
        rows: [optimisticRow, ...previousData.rows], // Add to beginning as per mcp-vtable
      };

      // Set the optimistic data in the cache
      queryClient.setQueryData(["vtable", tableId.toString()], updatedData);

      // Refresh the table to show our optimistic update
      refreshTable();

      // Return the previous data so we can revert if needed
      return { previousData };
    },

    // When successful, refresh with actual server data
    onSuccess: async () => {
      // Invalidate the query to get the real data from the server
      await queryClient.invalidateQueries({
        queryKey: ["vtable", tableId.toString()],
      });
      // Refresh the UI with the actual server data
      refreshTable();
    },

    // On error, roll back to the previous state
    onError: (error, _, context) => {
      console.error("Error creating row:", error);

      // If we have the previous data, roll back
      if (context?.previousData) {
        queryClient.setQueryData(
          ["vtable", tableId.toString()],
          context.previousData
        );
        refreshTable();
      }
    },
  });

  // Wrapper function with the right input type
  const addRow = () => {
    mutate({ tableId });
  };

  return { addRow, isPending };
};
```

#### Step 2.12: Create Main Package Exports

**Rationale/Details:**
We need to create a main exports file for the VTable package to make it easy to import in the application.

**Related Micro-Hypotheses:** [h_A_ProjectStructure_001]

**Full Proposed Implementation:**

Update packages/vtable/src/index.tsx to include new hooks:

```tsx
import React, { Suspense } from "react";
import { Id } from "convex/values";
import { Skeleton } from "@construct/ui";
import { VTableProvider } from "./state/vtable-context";
import { VTableImpl } from "./vtable-impl";

export interface VTableProps {
  tableId: Id<"vtables">;
  className?: string;
}

export function VTable({ tableId, className }: VTableProps) {
  return (
    <VTableProvider>
      <Suspense fallback={<VTableSkeleton />}>
        <VTableImpl tableId={tableId} className={className} />
      </Suspense>
    </VTableProvider>
  );
}

function VTableSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-8 w-[120px]" />
      </div>
      <div className="border rounded-md">
        <div className="h-10 border-b bg-muted/50">
          <div className="flex">
            <Skeleton className="h-full w-[200px] rounded-none" />
            <Skeleton className="h-full w-[200px] rounded-none" />
            <Skeleton className="h-full w-[200px] rounded-none" />
          </div>
        </div>
        <div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex h-10 border-b last:border-0">
              <Skeleton className="h-full w-[200px] rounded-none" />
              <Skeleton className="h-full w-[200px] rounded-none" />
              <Skeleton className="h-full w-[200px] rounded-none" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Re-export types
export * from "./vtable-types";
export * from "./state/vtable-context";
export * from "./state/vtable-actions";
export * from "./hooks/useAddColumnWithOptimisticUpdate";
export * from "./hooks/useAddRowWithOptimisticUpdate";
```

### Phase 3: Integration and Testing

#### Step 3.1: Create Example VTable Page in Web App

**Rationale/Details:**
We need to create an example page in the web application to demonstrate the VTable component integration with Convex.

**Related Micro-Hypotheses:** [h_A_ComponentMigration_001, h_A_ConvexIntegration_001]

**Full Proposed Implementation:**

Create apps/web/app/vtable/page.tsx:

```tsx
"use client";

import React from "react";
import { ConvexProvider } from "@convex-dev/react-query";
import { convex } from "@/convex";
import { VTable } from "@construct/vtable";
import { Id } from "convex/values";

export default function VTablePage() {
  // In a real implementation, this would likely be dynamic or from URL params
  const tableId = "your_table_id_here" as Id<"vtables">;

  return (
    <ConvexProvider client={convex}>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">VTable Demo</h1>
        <VTable tableId={tableId} className="w-full" />
      </div>
    </ConvexProvider>
  );
}
```

#### Step 3.2: Set Up TanStack Query Integration with Convex

**Rationale/Details:**
We need to configure the TanStack Query integration with Convex in the web application.

**Related Micro-Hypotheses:** [h_A_ConvexIntegration_001]

**Full Proposed Implementation:**

Create apps/web/convex.ts:

```typescript
import {
  ConvexReactClientWithQuery,
  ReactQueryConvexClientOptions,
} from "@convex-dev/react-query";
import { api } from "@/convex/api";
import { QueryClient } from "@tanstack/react-query";

// Configure queryClient with React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // General settings for all queries
      staleTime: 0, // Default to real-time updates
      refetchOnWindowFocus: false, // Handled by Convex subscription
      retry: false, // Let Convex handle retries
    },
  },
});

// Configure Convex client
const options: ReactQueryConvexClientOptions = {
  address: process.env.NEXT_PUBLIC_CONVEX_URL as string,
};

// Create the client
export const convex = new ConvexReactClientWithQuery(options, queryClient);

// Export the typed API
export type Api = typeof api;
```

Update apps/web/app/layout.tsx to include CSS:

```tsx
import "@/styles/globals.css";
import "@construct/ui/styles.css"; // Import UI package styles

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

#### Step 3.3: Create Table Selection Component

**Rationale/Details:**
We need to create a component to list and select available VTables.

**Related Micro-Hypotheses:** [h_A_ComponentMigration_001]

**Full Proposed Implementation:**

Create apps/web/app/vtable/table-selector.tsx:

```tsx
"use client";

import React from "react";
import { useQuery } from "@convex-dev/react-query";
import { api } from "@/convex/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@construct/ui";
import { Id } from "convex/values";

interface TableSelectorProps {
  onChange: (tableId: Id<"vtables">) => void;
  value?: Id<"vtables">;
}

export function TableSelector({ onChange, value }: TableSelectorProps) {
  const { data: tables, isLoading } = useQuery(api.vtable.listTables);

  if (isLoading) {
    return <div>Loading tables...</div>;
  }

  if (!tables || tables.length === 0) {
    return <div>No tables available</div>;
  }

  return (
    <Select
      value={value ? value.toString() : undefined}
      onValueChange={(newValue) =>
        onChange(newValue as unknown as Id<"vtables">)
      }
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select a table" />
      </SelectTrigger>
      <SelectContent>
        {tables.map((table) => (
          <SelectItem key={table._id.toString()} value={table._id.toString()}>
            {table.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

Update apps/web/app/vtable/page.tsx:

```tsx
"use client";

import React, { useState } from "react";
import { ConvexProvider } from "@convex-dev/react-query";
import { convex } from "@/convex";
import { VTable } from "@construct/vtable";
import { TableSelector } from "./table-selector";
import { Id } from "convex/values";

export default function VTablePage() {
  const [tableId, setTableId] = useState<Id<"vtables"> | undefined>();

  return (
    <ConvexProvider client={convex}>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">VTable Demo</h1>

        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Select a table:</h2>
          <TableSelector value={tableId} onChange={setTableId} />
        </div>

        {tableId ? (
          <VTable tableId={tableId} className="w-full" />
        ) : (
          <div className="text-center p-10 border rounded-md">
            Please select a table to view
          </div>
        )}
      </div>
    </ConvexProvider>
  );
}
```

#### Step 3.4: Set Up Real-Time Updates Test

**Rationale/Details:**
We need to create a test page to verify that real-time updates work correctly across multiple clients.

**Related Micro-Hypotheses:** [h_A_ConvexIntegration_001]

**Full Proposed Implementation:**

Create apps/web/app/vtable/realtime-test.tsx:

```tsx
"use client";

import React, { useState } from "react";
import { ConvexProvider } from "@convex-dev/react-query";
import { convex } from "@/convex";
import { useQuery, useMutation } from "@convex-dev/react-query";
import { api } from "@/convex/api";
import { Id } from "convex/values";
import { Button, Input } from "@construct/ui";

// Component to display a real-time value from a cell
function RealTimeValue({
  tableId,
  rowId,
  columnId,
}: {
  tableId: Id<"vtables">;
  rowId: Id<"vtableRows">;
  columnId: Id<"vtableColumns">;
}) {
  const { data, isLoading } = useQuery(
    api.vtable.getCellValue,
    { tableId, rowId, columnId }
    // Using default real-time updates from Convex
  );

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-4 border rounded-md">
      <h3 className="text-sm font-medium mb-2">Real-time cell value:</h3>
      <div className="text-2xl">{data?.value || "null"}</div>
    </div>
  );
}

// Component to update a cell value
function CellUpdater({
  tableId,
  rowId,
  columnId,
}: {
  tableId: Id<"vtables">;
  rowId: Id<"vtableRows">;
  columnId: Id<"vtableColumns">;
}) {
  const [value, setValue] = useState("");
  const updateCell = useMutation(api.vtable.updateCell);

  const handleUpdate = () => {
    updateCell({
      tableId,
      rowId,
      columnId,
      value,
      id: null, // This would be dynamically determined in real usage
    });
  };

  return (
    <div className="p-4 border rounded-md">
      <h3 className="text-sm font-medium mb-2">Update cell value:</h3>
      <div className="flex gap-2 mb-4">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="New value"
          className="flex-1"
        />
        <Button onClick={handleUpdate}>Update</Button>
      </div>
    </div>
  );
}

export default function RealTimeTestPage() {
  // In a real implementation, these would be dynamic
  const tableId = "your_table_id_here" as Id<"vtables">;
  const rowId = "your_row_id_here" as Id<"vtableRows">;
  const columnId = "your_column_id_here" as Id<"vtableColumns">;

  return (
    <ConvexProvider client={convex}>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">Real-Time Updates Test</h1>
        <p className="mb-6">
          Open this page in two browser windows to test real-time updates. Make
          changes in one window and see them reflect in the other.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RealTimeValue tableId={tableId} rowId={rowId} columnId={columnId} />
          <CellUpdater tableId={tableId} rowId={rowId} columnId={columnId} />
        </div>
      </div>
    </ConvexProvider>
  );
}
```

#### Step 3.5: Test Optimistic Updates and Error Recovery

**Rationale/Details:**
We need to create a test case for optimistic updates and error recovery to ensure the system handles failures gracefully.

**Related Micro-Hypotheses:** [h_A_ConvexIntegration_001]

**Full Proposed Implementation:**

Create apps/web/app/vtable/optimistic-test.tsx:

```tsx
"use client";

import React, { useState } from "react";
import { ConvexProvider } from "@convex-dev/react-query";
import { convex } from "@/convex";
import { useMutation, useQuery } from "@convex-dev/react-query";
import { api } from "@/convex/api";
import { Id } from "convex/values";
import { Button, Input, Switch } from "@construct/ui";

export default function OptimisticUpdateTestPage() {
  const [shouldFail, setShouldFail] = useState(false);
  const [value, setValue] = useState("");
  const tableId = "your_table_id_here" as Id<"vtables">;

  // Access the query cache
  const queryClient = useQuery.getQueryClient();

  // Custom mutation that simulates failures for testing
  const updateWithOptimistic = useMutation({
    mutationFn: async (input: { value: string }) => {
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate failure if shouldFail is true
      if (shouldFail) {
        throw new Error("Simulated failure");
      }

      // Return success
      return { success: true };
    },
    onMutate: async (newData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["testData"] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(["testData"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["testData"], { value: newData.value });

      // Return a context object with the previous data
      return { previousData };
    },
    onError: (err, _, context) => {
      console.error("Error updating:", err);

      // Roll back to the previous value
      queryClient.setQueryData(["testData"], context.previousData);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we're in sync
      queryClient.invalidateQueries({ queryKey: ["testData"] });
    },
  });

  // Query to display current value
  const { data } = useQuery({
    queryKey: ["testData"],
    queryFn: async () => {
      // Simulate fetching from server
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { value: "Original Value" };
    },
    initialData: { value: "Original Value" },
  });

  const handleUpdate = () => {
    updateWithOptimistic.mutate({ value });
  };

  return (
    <ConvexProvider client={convex}>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">Optimistic Updates Test</h1>

        <div className="mb-6 p-4 border rounded-md">
          <h2 className="text-lg font-medium mb-2">Current Value</h2>
          <div className="text-2xl">{data?.value}</div>

          <div className="mt-4">
            <div className="text-sm text-gray-500">
              Status: {updateWithOptimistic.isPending ? "Updating..." : "Idle"}
            </div>
            {updateWithOptimistic.isError && (
              <div className="text-sm text-red-500">
                Error: {updateWithOptimistic.error.message}
              </div>
            )}
          </div>
        </div>

        <div className="mb-6 p-4 border rounded-md">
          <h2 className="text-lg font-medium mb-2">Update Value</h2>
          <div className="flex gap-2 mb-4">
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="New value"
              className="flex-1"
            />
            <Button
              onClick={handleUpdate}
              disabled={updateWithOptimistic.isPending}
            >
              Update
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="should-fail"
              checked={shouldFail}
              onCheckedChange={setShouldFail}
            />
            <label htmlFor="should-fail">
              Simulate failure (to test rollback)
            </label>
          </div>
        </div>

        <div className="mt-8 p-4 border rounded-md bg-gray-50">
          <h2 className="text-lg font-medium mb-2">How This Works</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Enter a new value and click "Update"</li>
            <li>
              The UI immediately updates with the new value (optimistically)
            </li>
            <li>
              If "Simulate failure" is checked, the update will fail after 1
              second
            </li>
            <li>On failure, the UI rolls back to the previous value</li>
            <li>On success, the update is committed</li>
          </ol>
        </div>
      </div>
    </ConvexProvider>
  );
}
```

#### Step 3.6: Performance Testing with Large Datasets

**Rationale/Details:**
We need to create a test for performance with large datasets to ensure the VTable component can handle substantial amounts of data.

**Related Micro-Hypotheses:** [h_A_TanStackTable_001]

**Full Proposed Implementation:**

Create apps/web/app/vtable/performance-test.tsx:

```tsx
"use client";

import React, { useState } from "react";
import { VTable } from "@construct/vtable";
import { ConvexProvider } from "@convex-dev/react-query";
import { convex } from "@/convex";
import { Button, Input } from "@construct/ui";
import { useMutation } from "@convex-dev/react-query";
import { api } from "@/convex/api";
import { Id } from "convex/values";

export default function PerformanceTestPage() {
  const [tableId, setTableId] = useState<Id<"vtables"> | null>(null);
  const [tableName, setTableName] = useState("Performance Test Table");
  const [rowCount, setRowCount] = useState(100);
  const [columnCount, setColumnCount] = useState(10);

  const createTable = useMutation(api.vtable.createTable);
  const seedTable = useMutation(api.vtable.seedTableData);

  const handleCreateTable = async () => {
    try {
      // Create new table
      const newTableId = await createTable({
        name: tableName,
        description: `Performance test with ${rowCount} rows and ${columnCount} columns`,
      });

      setTableId(newTableId);

      // Seed with test data
      await seedTable({
        tableId: newTableId,
        rowCount,
        columnCount,
      });
    } catch (error) {
      console.error("Error creating test table:", error);
    }
  };

  return (
    <ConvexProvider client={convex}>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">Performance Testing</h1>

        {!tableId ? (
          <div className="p-6 border rounded-md bg-gray-50">
            <h2 className="text-xl font-medium mb-4">Create Test Table</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Table Name
                </label>
                <Input
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Number of Rows
                </label>
                <Input
                  type="number"
                  value={rowCount}
                  onChange={(e) => setRowCount(parseInt(e.target.value) || 10)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Number of Columns
                </label>
                <Input
                  type="number"
                  value={columnCount}
                  onChange={(e) =>
                    setColumnCount(parseInt(e.target.value) || 5)
                  }
                  className="w-full"
                />
              </div>

              <Button onClick={handleCreateTable} className="w-full">
                Create and Seed Test Table
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <Button variant="outline" onClick={() => setTableId(null)}>
                Create Another Test Table
              </Button>
            </div>

            <VTable tableId={tableId} className="w-full" />
          </div>
        )}
      </div>
    </ConvexProvider>
  );
}
```

## 4. Key Assumptions & Considerations

- **Assumption:** The Convex backend already has the necessary schema and API endpoints for VTable operations. (Supporting Evidence: [k_003 - Convex VTable API implementation analysis](run/knowledge/k_003_evidence.md))

- **Assumption:** The construct project's existing TailwindCSS setup is compatible with shadcn/ui. (Supporting Evidence: [k_006 - shadcn/ui setup and migration](run/knowledge/k_006_evidence.md))

- **Assumption:** TanStack Table's memoization patterns will work effectively with Convex's Id types after appropriate adaptations. (Supporting Evidence: [k_tanstack_convex_integration](run/knowledge/k_tanstack_convex_integration.json))

- **Potential Critique/Risk:** Complex nested components might suffer performance degradation with real-time updates if not properly memoized.

- **Potential Critique/Risk:** Optimistic updates for complex operations like reordering columns might require more sophisticated state management.

- **Potential Critique/Risk:** There could be increased bandwidth usage due to the real-time nature of Convex compared to the request-response pattern of tRPC.

## 5. Relevant Visualizations

**VTable Component Architecture:**

```
┌───────────────────────────────────────────────────────┐
│                      VTable                           │
│                                                       │
│  ┌─────────────────────────────────────────────────┐  │
│  │                 VTableProvider                  │  │
│  │                                                 │  │
│  │  ┌───────────────────────────────────────────┐  │  │
│  │  │               VTableImpl                  │  │  │
│  │  │                                           │  │  │
│  │  │  ┌─────────────┐        ┌──────────────┐  │  │  │
│  │  │  │   VColumns  │        │    VRows     │  │  │  │
│  │  │  └─────────────┘        └──────────────┘  │  │  │
│  │  │         │                      │          │  │  │
│  │  │         └──────────┬───────────┘          │  │  │
│  │  │                    ▼                      │  │  │
│  │  │             ┌─────────────┐               │  │  │
│  │  │             │    VCell    │               │  │  │
│  │  │             └─────────────┘               │  │  │
│  │  │                                           │  │  │
│  │  └───────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────┘
```

**Data Flow Diagram:**

```
┌──────────────┐      ┌───────────────┐      ┌───────────────┐
│              │      │               │      │               │
│  Convex DB   │◄────►│  Convex API   │◄────►│ TanStack Query│
│              │      │               │      │     Cache     │
└──────────────┘      └───────────────┘      └───┬───────────┘
                                                 │
                                                 ▼
┌──────────────┐      ┌───────────────┐      ┌───────────────┐
│              │      │               │      │               │
│   VCell      │◄────►│  VTable State │◄────►│ TanStack Table│
│  Component   │      │               │      │     State     │
└──────────────┘      └───────────────┘      └───────────────┘
        ▲                                           ▲
        │                                           │
        │                                           │
┌───────┴──────┐                           ┌───────┴──────┐
│              │                           │              │
│   UI Input   │                           │   UI Output  │
│              │                           │              │
└──────────────┘                           └──────────────┘
```

**Optimistic Update Pattern:**

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│   User Input   │────►│  Local Update  │────►│  UI Refreshes  │
└────────────────┘     └────────────────┘     └────────────────┘
        │                                             ▲
        │                                             │
        ▼                                             │
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│   Mutation     │────►│   Convex DB    │────►│  Query Cache   │
│    Request     │     │                │     │    Update      │
└────────────────┘     └────────────────┘     └────────────────┘
        │                      │                      │
        │                      │                      │
        ▼                      ▼                      ▼
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│    Success     │     │     Error      │     │     State      │
│                │     │                │     │  Reconciliation│
└────────────────┘     └────────────────┘     └────────────────┘
                              │
                              ▼
                       ┌────────────────┐
                       │   Rollback     │
                       │ Optimistic UI  │
                       └────────────────┘
```

#### Step 2.13: Implement the Main VTable Component

**Rationale/Details:**
Now we need to implement the main VTable component that will use TanStack Table and integrate with our Convex data.

**Related Micro-Hypotheses:** [h_A_TanStackTable_001, h_A_ConvexIntegration_001]

**Full Proposed Implementation:**

Create packages/vtable/src/vtable-impl.tsx:

```tsx
import React, { useMemo, useState } from "react";
import { useQuery } from "@convex-dev/react-query";
import { api } from "@/convex/api";
import { Id } from "convex/values";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import { VTableColumnType } from "./vtable-types";
import { Button } from "@construct/ui";
import { useAddColumnWithOptimisticUpdate } from "./hooks/useAddColumnWithOptimisticUpdate";
import { useAddRowWithOptimisticUpdate } from "./hooks/useAddRowWithOptimisticUpdate";
import { VCell } from "./components/v-cell";
import { VColumns } from "./components/v-columns";
import { VRows } from "./components/v-rows";
import { useVTable } from "./state/vtable-context";

export interface VTableImplProps {
  tableId: Id<"vtables">;
  className?: string;
}

export function VTableImpl({ tableId, className }: VTableImplProps) {
  const { data, isLoading, isError } = useQuery(api.vtable.getFullTable, {
    tableId,
  });

  const { addColumn } = useAddColumnWithOptimisticUpdate(tableId);
  const { addRow } = useAddRowWithOptimisticUpdate(tableId);
  const { setTable } = useVTable();

  const [sorting, setSorting] = useState<SortingState>([]);

  // When table data changes, update the context
  React.useEffect(() => {
    if (data) {
      setTable(data);
    }
  }, [data, setTable]);

  // Handle loading and error states
  if (isLoading) {
    return <div>Loading table data...</div>;
  }

  if (isError || !data) {
    return <div>Error loading table data</div>;
  }

  // Define columns for TanStack Table
  const columns = useMemo(() => {
    if (!data || !data.columns) return [];

    return data.columns.map((column) => {
      // Create a column definition for TanStack Table
      const columnDef: ColumnDef<any> = {
        id: column.id.toString(),
        accessorKey: `cells.${column.id.toString()}.value`,
        header: column.name,
        meta: {
          columnId: column.id,
          name: column.name,
          type: column.type,
          tableId,
        },
        // Custom cell renderer that uses our VCell component
        cell: ({ row, column: tanstackColumn }) => {
          const rowId = row.original.id;
          const columnId = tanstackColumn.meta?.columnId;

          return (
            <VCell
              tableId={tableId}
              rowId={rowId}
              columnId={columnId}
              type={tanstackColumn.meta?.type as VTableColumnType}
            />
          );
        },
      };

      return columnDef;
    });
  }, [data, tableId]);

  // Initialize TanStack Table
  const table = useReactTable({
    data: data.rows || [],
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{data.name || "Table"}</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => addColumn({ name: "New Column", type: "text" })}
          >
            Add Column
          </Button>
          <Button variant="outline" size="sm" onClick={() => addRow()}>
            Add Row
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <VColumns key={header.id} header={header} table={table} />
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <VRows key={cell.id} cell={cell} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {table.getRowModel().rows.length === 0 && (
        <div className="text-center p-4 border-t">
          No data available. Add a row to get started.
        </div>
      )}
    </div>
  );
}
```

#### Step 2.14: Create VTable Context

**Rationale/Details:**
We need to implement a context provider to manage the VTable state and provide access to actions.

**Related Micro-Hypotheses:** [h_A_TanStackTable_001]

**Full Proposed Implementation:**

Create packages/vtable/src/state/vtable-context.tsx:

```tsx
import React, { createContext, useContext, useState, useCallback } from "react";
import { Id } from "convex/values";

export interface VTableRow {
  id: Id<"vtableRows">;
  cells: Record<string, { id: Id<"vtableCells"> | null; value: any }>;
  tableId: Id<"vtables">;
  [key: string]: any;
}

export interface VTableColumn {
  id: Id<"vtableColumns">;
  name: string;
  type: string;
  tableId: Id<"vtables">;
  [key: string]: any;
}

export interface VTableData {
  id: Id<"vtables">;
  name: string;
  description?: string;
  columns: VTableColumn[];
  rows: VTableRow[];
  [key: string]: any;
}

export interface VTableContextValue {
  table: VTableData | null;
  setTable: (table: VTableData) => void;
  refreshTable: () => void;
  refreshCount: number;
}

const VTableContext = createContext<VTableContextValue | undefined>(undefined);

export function VTableProvider({ children }: { children: React.ReactNode }) {
  const [table, setTableState] = useState<VTableData | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  const setTable = useCallback((newTable: VTableData) => {
    setTableState(newTable);
  }, []);

  const refreshTable = useCallback(() => {
    setRefreshCount((prev) => prev + 1);
  }, []);

  const value = {
    table,
    setTable,
    refreshTable,
    refreshCount,
  };

  return (
    <VTableContext.Provider value={value}>{children}</VTableContext.Provider>
  );
}

export function useVTable() {
  const context = useContext(VTableContext);

  if (context === undefined) {
    throw new Error("useVTable must be used within a VTableProvider");
  }

  return context;
}
```

#### Step 2.15: Create VTable Actions

**Rationale/Details:**
We need to implement actions for common VTable operations that might be reused across components.

**Related Micro-Hypotheses:** [h_A_TanStackTable_001]

**Full Proposed Implementation:**

Create packages/vtable/src/state/vtable-actions.ts:

```typescript
import { useMutation } from "@convex-dev/react-query";
import { api } from "@/convex/api";
import { Id } from "convex/values";
import { useVTable } from "./vtable-context";

/**
 * Hook to delete a column from the VTable
 */
export function useDeleteColumn() {
  const { refreshTable } = useVTable();
  const deleteColumnMutation = useMutation(api.vtable.deleteColumn);

  const deleteColumn = async (
    tableId: Id<"vtables">,
    columnId: Id<"vtableColumns">
  ) => {
    try {
      await deleteColumnMutation({ tableId, columnId });
      refreshTable();
      return true;
    } catch (error) {
      console.error("Error deleting column:", error);
      return false;
    }
  };

  return { deleteColumn };
}

/**
 * Hook to rename a column in the VTable
 */
export function useRenameColumn() {
  const { refreshTable } = useVTable();
  const renameColumnMutation = useMutation(api.vtable.updateColumn);

  const renameColumn = async (
    tableId: Id<"vtables">,
    columnId: Id<"vtableColumns">,
    name: string
  ) => {
    try {
      await renameColumnMutation({ tableId, columnId, name });
      refreshTable();
      return true;
    } catch (error) {
      console.error("Error renaming column:", error);
      return false;
    }
  };

  return { renameColumn };
}

/**
 * Hook to delete a row from the VTable
 */
export function useDeleteRow() {
  const { refreshTable } = useVTable();
  const deleteRowMutation = useMutation(api.vtable.deleteRow);

  const deleteRow = async (tableId: Id<"vtables">, rowId: Id<"vtableRows">) => {
    try {
      await deleteRowMutation({ tableId, rowId });
      refreshTable();
      return true;
    } catch (error) {
      console.error("Error deleting row:", error);
      return false;
    }
  };

  return { deleteRow };
}

/**
 * Hook for batch operations on the VTable
 */
export function useBatchOperations() {
  const { refreshTable } = useVTable();
  const batchUpdateMutation = useMutation(api.vtable.batchUpdate);

  const batchUpdate = async (
    tableId: Id<"vtables">,
    operations: Array<{
      type: "updateCell" | "deleteRow" | "deleteColumn";
      params: Record<string, any>;
    }>
  ) => {
    try {
      await batchUpdateMutation({ tableId, operations });
      refreshTable();
      return true;
    } catch (error) {
      console.error("Error performing batch update:", error);
      return false;
    }
  };

  return { batchUpdate };
}

/**
 * Hook for reordering columns in the VTable
 */
export function useReorderColumns() {
  const { refreshTable } = useVTable();
  const reorderColumnsMutation = useMutation(api.vtable.reorderColumns);

  const reorderColumns = async (
    tableId: Id<"vtables">,
    columnIds: Id<"vtableColumns">[]
  ) => {
    try {
      await reorderColumnsMutation({ tableId, columnIds });
      refreshTable();
      return true;
    } catch (error) {
      console.error("Error reordering columns:", error);
      return false;
    }
  };

  return { reorderColumns };
}
```

#### Step 2.16: Implement Column Type Definitions

**Rationale/Details:**
We need to define the column types and helper functions for handling different data types in the VTable.

**Related Micro-Hypotheses:** [h_A_ComponentMigration_001]

**Full Proposed Implementation:**

Create packages/vtable/src/vtable-types.ts:

```typescript
/**
 * Available column types for VTable
 */
export type VTableColumnType =
  | "text"
  | "number"
  | "boolean"
  | "date"
  | "select";

/**
 * Interface for column configuration
 */
export interface VTableColumnConfig {
  type: VTableColumnType;
  name: string;
  options?: string[]; // For select type
  defaultValue?: any;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
}

/**
 * Get a default value based on column type
 */
export function getDefaultValueForType(type: VTableColumnType): any {
  switch (type) {
    case "text":
      return "";
    case "number":
      return 0;
    case "boolean":
      return false;
    case "date":
      return new Date().toISOString();
    case "select":
      return null;
    default:
      return null;
  }
}

/**
 * Validate a value against column type
 */
export function validateValueForType(
  value: any,
  type: VTableColumnType,
  config?: Partial<VTableColumnConfig>
): boolean {
  if (value === null || value === undefined) {
    return !(config?.validation?.required ?? false);
  }

  switch (type) {
    case "text":
      if (typeof value !== "string") return false;
      if (config?.validation?.pattern) {
        const pattern = new RegExp(config.validation.pattern);
        return pattern.test(value);
      }
      return true;

    case "number":
      if (typeof value !== "number") return false;
      const min = config?.validation?.min;
      const max = config?.validation?.max;
      if (min !== undefined && value < min) return false;
      if (max !== undefined && value > max) return false;
      return true;

    case "boolean":
      return typeof value === "boolean";

    case "date":
      try {
        new Date(value);
        return true;
      } catch {
        return false;
      }

    case "select":
      if (typeof value !== "string") return false;
      if (config?.options) {
        return config.options.includes(value);
      }
      return true;

    default:
      return true;
  }
}

/**
 * Format a value for display based on column type
 */
export function formatValueForDisplay(
  value: any,
  type: VTableColumnType
): string {
  if (value === null || value === undefined) {
    return "";
  }

  switch (type) {
    case "text":
      return String(value);

    case "number":
      return typeof value === "number" ? value.toString() : "";

    case "boolean":
      return value === true ? "Yes" : "No";

    case "date":
      try {
        return new Date(value).toLocaleDateString();
      } catch {
        return "";
      }

    case "select":
      return String(value);

    default:
      return String(value);
  }
}

/**
 * Parse a displayed value based on column type
 */
export function parseValueFromDisplay(
  displayValue: string,
  type: VTableColumnType
): any {
  switch (type) {
    case "text":
      return displayValue;

    case "number":
      return parseFloat(displayValue);

    case "boolean":
      return (
        displayValue.toLowerCase() === "yes" ||
        displayValue.toLowerCase() === "true"
      );

    case "date":
      try {
        return new Date(displayValue).toISOString();
      } catch {
        return null;
      }

    case "select":
      return displayValue;

    default:
      return displayValue;
  }
}
```

#### Step 2.17: Create Column Header Menu for Actions

**Rationale/Details:**
We need to implement a column header menu to allow users to perform actions like renaming, deleting, or changing the type of a column.

**Related Micro-Hypotheses:** [h_A_ComponentMigration_001]

**Full Proposed Implementation:**

Create packages/vtable/src/components/column-header-menu.tsx:

```tsx
import React from "react";
import { HeaderContext } from "@tanstack/react-table";
import { Id } from "convex/values";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Button,
  Input,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@construct/ui";
import { ChevronDown, Edit, Trash2, Move } from "lucide-react";
import { useRenameColumn, useDeleteColumn } from "../state/vtable-actions";

interface ColumnHeaderMenuProps {
  table: any;
  header: HeaderContext<any, unknown>;
}

export function ColumnHeaderMenu({ header, table }: ColumnHeaderMenuProps) {
  const [showRenameDialog, setShowRenameDialog] = React.useState(false);
  const [newColumnName, setNewColumnName] = React.useState("");

  const { deleteColumn } = useDeleteColumn();
  const { renameColumn } = useRenameColumn();

  const columnMeta = header.column.columnDef.meta;

  if (!columnMeta) {
    return null;
  }

  const tableId = columnMeta.tableId as Id<"vtables">;
  const columnId = columnMeta.columnId as Id<"vtableColumns">;
  const columnName = columnMeta.name as string;

  const handleDeleteColumn = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete the column "${columnName}"?`
      )
    ) {
      await deleteColumn(tableId, columnId);
    }
  };

  const handleOpenRenameDialog = () => {
    setNewColumnName(columnName);
    setShowRenameDialog(true);
  };

  const handleRenameColumn = async () => {
    if (newColumnName.trim() !== "") {
      await renameColumn(tableId, columnId, newColumnName.trim());
      setShowRenameDialog(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 data-[state=open]:bg-accent"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleOpenRenameDialog}>
            <Edit className="mr-2 h-4 w-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDeleteColumn}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Column</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="Column name"
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowRenameDialog(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleRenameColumn}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

#### Step 2.18: Implement VCell Component

**Rationale/Details:**
We need to create a cell component that can display and edit different data types.

**Related Micro-Hypotheses:** [h_A_TanStackTable_001, h_A_OptimisticUpdates_001]

**Full Proposed Implementation:**

Create packages/vtable/src/components/v-cell.tsx:

```tsx
import React, { useState, useEffect, useRef } from "react";
import { Id } from "convex/values";
import { useVTable } from "../state/vtable-context";
import { useMutation } from "@convex-dev/react-query";
import { api } from "@/convex/api";
import {
  VTableColumnType,
  formatValueForDisplay,
  parseValueFromDisplay,
} from "../vtable-types";
import {
  Checkbox,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@construct/ui";

interface VCellProps {
  tableId: Id<"vtables">;
  rowId: Id<"vtableRows">;
  columnId: Id<"vtableColumns">;
  type: VTableColumnType;
}

export function VCell({ tableId, rowId, columnId, type }: VCellProps) {
  const { table } = useVTable();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const updateCellMutation = useMutation(api.vtable.updateCell);
  const inputRef = useRef<HTMLInputElement>(null);

  // Find the cell in the table data
  const row = table?.rows.find((r) => r.id === rowId);
  const cellKey = columnId.toString();
  const cell = row?.cells[cellKey];
  const cellValue = cell?.value;

  // Get formatted display value
  const displayValue = formatValueForDisplay(cellValue, type);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    if (type !== "boolean") {
      setEditValue(displayValue);
      setIsEditing(true);
    }
  };

  const handleChange = (value: any) => {
    if (type === "boolean") {
      // For booleans, update immediately
      handleSave(value);
    } else {
      setEditValue(value);
    }
  };

  const handleBlur = () => {
    if (isEditing) {
      handleSave(editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave(editValue);
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  const handleSave = async (value: any) => {
    setIsEditing(false);

    const parsedValue =
      type === "boolean" ? value : parseValueFromDisplay(value, type);

    if (parsedValue !== cellValue) {
      try {
        await updateCellMutation({
          tableId,
          rowId,
          columnId,
          value: parsedValue,
          cellId: cell?.id || null,
        });
      } catch (error) {
        console.error("Error updating cell:", error);
      }
    }
  };

  // Render cell based on type
  if (isEditing) {
    switch (type) {
      case "text":
        return (
          <td className="p-2 border-b">
            <Input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full"
            />
          </td>
        );

      case "number":
        return (
          <td className="p-2 border-b">
            <Input
              ref={inputRef}
              type="number"
              value={editValue}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full"
            />
          </td>
        );

      case "date":
        return (
          <td className="p-2 border-b">
            <Input
              ref={inputRef}
              type="date"
              value={editValue}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full"
            />
          </td>
        );

      case "select":
        const column = table?.columns.find((c) => c.id === columnId);
        const options = column?.options || [];

        return (
          <td className="p-2 border-b">
            <Select
              value={editValue}
              onValueChange={(value) => {
                handleChange(value);
                handleSave(value);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </td>
        );

      default:
        return (
          <td className="p-2 border-b">
            <Input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full"
            />
          </td>
        );
    }
  }

  // Display mode
  switch (type) {
    case "boolean":
      return (
        <td className="p-2 border-b text-center">
          <Checkbox
            checked={cellValue === true}
            onCheckedChange={handleChange}
          />
        </td>
      );

    default:
      return (
        <td
          className="p-2 border-b cursor-pointer hover:bg-gray-50"
          onClick={handleStartEdit}
        >
          {displayValue}
        </td>
      );
  }
}
```

#### Step 2.19: Implement VColumns Component

**Rationale/Details:**
We need to create a component to render table column headers with sorting and menu options.

**Related Micro-Hypotheses:** [h_A_TanStackTable_001]

**Full Proposed Implementation:**

Create packages/vtable/src/components/v-columns.tsx:

```tsx
import React from "react";
import { HeaderContext, flexRender } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@construct/ui";
import { ColumnHeaderMenu } from "./column-header-menu";

interface VColumnsProps {
  header: HeaderContext<any, unknown>;
  table: any;
}

export function VColumns({ header, table }: VColumnsProps) {
  const isSortable = header.column.getCanSort();
  const sortDirection = header.column.getIsSorted();

  return (
    <th
      key={header.id}
      className="px-4 py-3 text-left border-b font-medium text-sm"
    >
      <div className="flex items-center justify-between">
        {isSortable ? (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => header.column.toggleSorting()}
          >
            {flexRender(header.column.columnDef.header, header.getContext())}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <div className="font-medium">
            {flexRender(header.column.columnDef.header, header.getContext())}
          </div>
        )}

        <ColumnHeaderMenu header={header} table={table} />
      </div>
    </th>
  );
}
```

#### Step 2.20: Implement VRows Component

**Rationale/Details:**
We need to create a component to render table rows.

**Related Micro-Hypotheses:** [h_A_TanStackTable_001]

**Full Proposed Implementation:**

Create packages/vtable/src/components/v-rows.tsx:

```tsx
import React from "react";
import { CellContext, flexRender } from "@tanstack/react-table";

interface VRowsProps {
  cell: CellContext<any, unknown>;
}

export function VRows({ cell }: VRowsProps) {
  return (
    <td key={cell.id} className="px-4 py-2 border-b">
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </td>
  );
}
```

#### Step 2.21: Create Main VTable Component

**Rationale/Details:**
Finally, we need to create the main exported VTable component that wraps the implementation with the context provider.

**Related Micro-Hypotheses:** [h_A_ShadcnSetup_001, h_A_TanStackTable_001]

**Full Proposed Implementation:**

Create packages/vtable/src/index.tsx:

```tsx
import React, { Suspense } from "react";
import { Id } from "convex/values";
import { VTableProvider } from "./state/vtable-context";
import { VTableImpl } from "./vtable-impl";

export interface VTableProps {
  tableId: Id<"vtables">;
  className?: string;
}

export function VTable({ tableId, className }: VTableProps) {
  return (
    <VTableProvider>
      <Suspense fallback={<div>Loading VTable...</div>}>
        <VTableImpl tableId={tableId} className={className} />
      </Suspense>
    </VTableProvider>
  );
}

// Re-export types and hooks for easier imports
export * from "./vtable-types";
export * from "./state/vtable-context";
export * from "./state/vtable-actions";
export * from "./hooks/useAddRowWithOptimisticUpdate";
export * from "./hooks/useAddColumnWithOptimisticUpdate";

// Define a version for debugging
export const VERSION = "0.1.0";
```

### Phase 3: Integration and Testing

#### Step 3.1: Create Example VTable Page

**Rationale/Details:**
We need to create an example page that demonstrates the VTable component.

**Related Micro-Hypotheses:** [h_A_ConvexIntegration_001]

**Full Proposed Implementation:**

Create apps/web/app/vtable/page.tsx:

```tsx
"use client";

import React from "react";
import { ConvexProvider } from "@convex-dev/react-query";
import { convex } from "@/convex";
import { VTable } from "@construct/vtable";

export default function VTablePage() {
  // Use a static tableId for demonstration purposes
  // In a real application, this would come from a route parameter or state
  const tableId = "abc123"; // Replace with an actual tableId

  return (
    <ConvexProvider client={convex}>
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">VTable Example</h1>
        <VTable tableId={tableId} className="w-full" />
      </div>
    </ConvexProvider>
  );
}
```
