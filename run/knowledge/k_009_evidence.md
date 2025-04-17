# TanStack Table Implementation in mcp-vtable

**Confidence:** 0.9

**Sources:**

- /Users/jesselee/dev/mcp-vtable/apps/web/package.json
- /Users/jesselee/dev/mcp-vtable/apps/web/src/app/\_components/VTable/index.tsx
- /Users/jesselee/dev/mcp-vtable/apps/web/src/app/\_components/VTable/components/VColumns/index.tsx
- /Users/jesselee/dev/mcp-vtable/apps/web/src/app/\_components/VTable/components/VRows/index.tsx
- /Users/jesselee/dev/mcp-vtable/apps/web/src/app/\_components/VTable/components/VCell/index.tsx
- /Users/jesselee/dev/mcp-vtable/apps/web/src/app/\_components/VTable/components/VCell/update-cell.ts

**Summary:**
The mcp-vtable project implements a sophisticated data table using TanStack Table v8.21.2 with a modular component architecture. The implementation leverages TanStack Table's core features for table management while separating concerns into distinct components for columns, rows, and cells. The solution integrates with tRPC for data operations and uses shadcn/ui components for the UI, with specific optimization patterns for performance.

---

## TanStack Table Version and Core Setup

The project uses TanStack Table version 8.21.2 as specified in package.json. The main table setup is in the primary VTable component's `index.tsx`:

```tsx
// From VTable/index.tsx
const table = useReactTable({
  data: tableData,
  columns: tableColumns,
  getCoreRowModel: getCoreRowModel(),
  defaultColumn: {
    size: 200,
    minSize: 120,
  },
});
```

This creates a basic table instance with:

- Core row model for rendering
- Default column sizes
- Data and column definitions from the query hook

## Component Architecture

The VTable implementation is split into several specialized components:

1. **VTable**: Main component that sets up the table and provides context
2. **VColumns**: Renders table headers with column management
3. **VRows**: Renders table rows
4. **VCell**: Renders individual cells with edit capability

Each component is carefully memoized to optimize rendering performance:

```tsx
// From VColumns/index.tsx - Performance optimization with memo
export const VColumns = React.memo(
  ({ table, tableId }: VColumnsProps) => {
    // Component implementation
  },
  (prevProps, nextProps) => {
    // Deep equality check for specific properties to prevent unnecessary re-renders
    const prevState = prevProps.table.getState();
    const nextState = nextProps.table.getState();

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
```

## Data and Mutation Handling

The implementation uses cell-level data management with optimistic updates:

```tsx
// From VCell/index.tsx
export const VCell: React.FC<VCellProps> = ({
  cell,
  style,
  tableId,
  ...rest
}) => {
  // Access the cell data which contains both id and value
  const cellData = cell.getValue() as CellData;

  // Initialize state with the cell value
  const [lastValue, setLastValue] = React.useState(cellData.value || "");
  const [value, setValue] = React.useState(cellData.value || "");

  const handleOnBlur = () => {
    const cellId = cellData.id;

    if (value !== lastValue) {
      updateCell({ id: cellId, value, table_id: tableId });
    }
    setLastValue(value);
  };

  // ... component rendering ...
};
```

Data mutations are handled through tRPC server actions:

```tsx
// From update-cell.ts
"use server";

import type { TUpdateCellInput } from "@construct/api/routers/vtable/vtable.router.types";
import { api } from "~/trpc/server";

export const updateCell = async (cell: TUpdateCellInput) => {
  await api.vtable.updateCell(cell);
};
```

## UI Component Integration

The table uses shadcn/ui components like Table, TableHeader, TableBody, TableRow, and TableCell for rendering the UI. These components are customized with specific styling for the VTable use case:

```tsx
// From VCell/index.tsx
return (
  <TableCell
    style={{ ...style }}
    className="p-0.1 truncate border-r border-gray-200 text-left last:border-r-0"
    {...rest}
  >
    <Input
      value={value as string}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleOnBlur}
      className="w-full rounded-none border-none bg-transparent shadow-none"
    />
  </TableCell>
);
```

## Key TanStack Table Features Used

1. **Header groups**: `table.getHeaderGroups()` for rendering column headers
2. **Row model**: `table.getRowModel().rows` for iterating through rows
3. **Cells**: `row.getVisibleCells()` for rendering cells
4. **Memoization**: Custom memoization with deep equality checks for performance
5. **Flex rendering**: `flexRender()` for rendering column headers

## Migration Considerations

When migrating to Convex, several aspects need attention:

1. **Data Types**: Update ID types from numeric to Convex's document IDs
2. **Data Fetching**: Replace tRPC queries with Convex queries using the TanStack Query adapter
3. **Mutations**: Replace server actions with Convex mutations, handling optimistic updates
4. **Real-time Updates**: Leverage Convex's real-time capabilities for instant data synchronization

The migration should preserve the component architecture while updating the data layer to use Convex instead of tRPC.
