# Shadcn/UI Components in mcp-vtable

**Confidence:** 0.9

**Sources:**

- /Users/jesselee/dev/mcp-vtable/packages/ui/package.json
- /Users/jesselee/dev/mcp-vtable/packages/ui/components.json
- /Users/jesselee/dev/mcp-vtable/packages/ui/src/table.tsx
- /Users/jesselee/dev/mcp-vtable/packages/ui/src/input.tsx
- /Users/jesselee/dev/mcp-vtable/packages/ui/src/index.ts
- /Users/jesselee/dev/mcp-vtable/apps/web/src/app/\_components/VTable/components

**Summary:**
The mcp-vtable project implements shadcn/ui components as a shared package with specific customizations for the VTable UI. The implementation uses the "new-york" style variant and follows shadcn/ui's component patterns while making targeted modifications to fit the VTable's requirements. These components are used extensively throughout the VTable implementation and require careful migration to maintain consistent styling and behavior.

---

## Shadcn/UI Configuration

The project configures shadcn/ui in `components.json` with the following settings:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "../../tooling/tailwind/web.ts",
    "css": "unused.css",
    "baseColor": "zinc",
    "cssVariables": true
  },
  "aliases": {
    "utils": "@construct/ui/",
    "components": "src/",
    "ui": "src/"
  }
}
```

Key aspects of this configuration:

1. Uses the "new-york" style variant (more rounded, boxier than the default)
2. Configured for React Server Components (RSC)
3. Uses zinc as the base color
4. Uses CSS variables for theming
5. Has specific aliases for imports

## Component Structure and Organization

The UI package organizes components in individual files with a consistent pattern:

- Each component is exported from its own file (e.g., `table.tsx`, `input.tsx`)
- Components use React.forwardRef for proper ref handling
- Styling uses the `cn` utility for class name merging
- All components follow shadcn/ui's compositional pattern

The main components used by VTable include:

1. **Table Components**:

   - Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption
   - Used for the core table structure

2. **Input Components**:

   - Input - Used for editable cells

3. **Other Components**:
   - Button - Used for actions like adding rows/columns
   - Select - Used for filtering and type selection
   - Popover - Used for column options
   - Label - Used for form elements
   - Skeleton - Used for loading states

## Component Customizations

The components have specific customizations for the VTable use case:

### Table Components

```tsx
// TableCell customization
const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-2 align-middle transition-colors hover:bg-muted/50 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
));
```

When used in VTable, additional styling is applied:

```tsx
<TableCell
  style={{ ...style }}
  className="p-0.1 truncate border-r border-gray-200 text-left last:border-r-0"
  {...rest}
>
  {/* Cell content */}
</TableCell>
```

### Input Component

The Input component has a base style:

```tsx
<input
  type={type}
  className={cn(
    "flex h-9 w-full rounded-md border border-input bg-transparent px-2 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
    className
  )}
  ref={ref}
  {...props}
/>
```

But when used in VTable cells, it's customized to fit the table cell styling:

```tsx
<Input
  value={value as string}
  onChange={(e) => setValue(e.target.value)}
  onBlur={handleOnBlur}
  className="w-full rounded-none border-none bg-transparent shadow-none"
/>
```

## Export Pattern

The UI package uses a specific export pattern that makes components available through specific import paths:

```jsx
// package.json exports
{
  "exports": {
    ".": "./src/index.ts",
    "./button": "./src/button.tsx",
    "./table": "./src/table.tsx",
    // ... other components
  }
}
```

This allows components to be imported individually:

```tsx
import { Table, TableBody, TableHeader } from "@construct/ui/table";
import { Input } from "@construct/ui/input";
```

## Integration with VTable Components

The shadcn/ui components are tightly integrated with the VTable implementation:

1. Components are imported from the UI package using the specific paths
2. Additional styling is applied to match the VTable design
3. Components are extended with additional functionality where needed
4. The compositional pattern of shadcn/ui is followed throughout the VTable implementation

## Migration Considerations

When migrating to the construct project, we need to consider:

1. **Style Consistency**: Maintain the "new-york" style variant for visual consistency
2. **Component Customizations**: Preserve specific styling customizations made for VTable
3. **Export Pattern**: Replicate the same export pattern for component imports
4. **Component Composition**: Maintain the compositional pattern in VTable components
5. **Tailwind Configuration**: Ensure the tailwind configuration is compatible with the shadcn/ui components

These considerations are essential to ensure the VTable components have the same look and feel after migration.
