import type { Id, VTableData, UpdateCellInput, AddColumnInput, AddRowInput } from "../vtable-types";
import { useVTable } from "../state/vtable-context";

/**
 * This file provides hooks for interacting with the Convex backend.
 * 
 * NOTE: This is a placeholder implementation that will be replaced
 * when integrated with the actual Convex backend. The actual implementation
 * will use the Convex API client generated from the schema.
 */

const mockTables = [
  {
    _id: "table1" as Id<"vtables">,
    name: "Sample Table 1",
    ownerId: "user1",
    createdAt: Date.now(),
    description: "A sample table for testing" as string | null,
  },
  {
    _id: "table2" as Id<"vtables">,
    name: "Sample Table 2",
    ownerId: "user1",
    createdAt: Date.now(),
    description: "Another sample table for testing" as string | null,
  },
];

const mockColumns = [
  {
    id: "col1" as Id<"vtableColumns">,
    name: "Name",
    type: "text" as "text" | "number" | "boolean" | "select" | "date",
    options: null,
    order: 0,
  },
  {
    id: "col2" as Id<"vtableColumns">,
    name: "Age",
    type: "number" as "text" | "number" | "boolean" | "select" | "date",
    options: { min: 0, max: 120 },
    order: 1,
  },
  {
    id: "col3" as Id<"vtableColumns">,
    name: "Active",
    type: "boolean" as "text" | "number" | "boolean" | "select" | "date",
    options: null,
    order: 2,
  },
];

const mockRows = [
  {
    id: "row1" as Id<"vtableRows">,
    createdAt: Date.now(),
    cells: {
      col1: { id: "cell1" as Id<"vtableCells">, value: "John Doe" },
      col2: { id: "cell2" as Id<"vtableCells">, value: 30 },
      col3: { id: "cell3" as Id<"vtableCells">, value: true },
    },
  },
  {
    id: "row2" as Id<"vtableRows">,
    createdAt: Date.now() - 1000 * 60 * 60,
    cells: {
      col1: { id: "cell4" as Id<"vtableCells">, value: "Jane Smith" },
      col2: { id: "cell5" as Id<"vtableCells">, value: 25 },
      col3: { id: "cell6" as Id<"vtableCells">, value: false },
    },
  },
];

const mockData: VTableData = {
  table: {
    _id: mockTables[0]!._id,
    name: mockTables[0]!.name,
    ownerId: mockTables[0]!.ownerId,
    createdAt: mockTables[0]!.createdAt,
    description: mockTables[0]!.description,
  },
  columns: mockColumns,
  rows: mockRows,
};

/**
 * Hook to fetch all available VTables
 * @returns List of VTables with their basic information
 */
export function useVTables() {
  return { data: mockTables, isLoading: false, error: null };
}

/**
 * Hook to fetch a specific VTable with all its data
 * @param tableId The ID of the VTable to fetch
 * @returns The VTable data including columns and rows
 */
export function useVTableData(tableId: Id<"vtables"> | null) {
  const { refreshCounter } = useVTable();
  
  return {
    data: tableId ? mockData : null,
    isLoading: false,
    error: null,
  };
}

/**
 * Hook to create a new VTable
 * @returns Function to create a new VTable
 */
export function useCreateVTable() {
  return async (name: string, description?: string) => {
    console.log("Creating VTable:", { name, description });
    return "newTableId" as Id<"vtables">;
  };
}

/**
 * Hook to delete a VTable
 * @returns Function to delete a VTable
 */
export function useDeleteVTable() {
  return async (tableId: Id<"vtables">) => {
    console.log("Deleting VTable:", tableId);
    return true;
  };
}

/**
 * Hook to update a cell in a VTable
 * @returns Function to update a cell
 */
export function useUpdateCell() {
  const { refreshTable } = useVTable();
  
  return async (input: UpdateCellInput) => {
    console.log("Updating cell:", input);
    refreshTable();
    return "cellId" as Id<"vtableCells">;
  };
}

/**
 * Hook to add a new column to a VTable
 * @returns Function to add a column
 */
export function useAddColumn() {
  const { refreshTable } = useVTable();
  
  return async (input: AddColumnInput) => {
    console.log("Adding column:", input);
    refreshTable();
    return "newColumnId" as Id<"vtableColumns">;
  };
}

/**
 * Hook to add a new row to a VTable
 * @returns Function to add a row
 */
export function useAddRow() {
  const { refreshTable } = useVTable();
  
  return async (input: AddRowInput) => {
    console.log("Adding row:", input);
    refreshTable();
    return "newRowId" as Id<"vtableRows">;
  };
}

/**
 * Hook to delete a column from a VTable
 * @returns Function to delete a column
 */
export function useDeleteColumn() {
  const { refreshTable } = useVTable();
  
  return async (columnId: Id<"vtableColumns">, tableId: Id<"vtables">) => {
    console.log("Deleting column:", { columnId, tableId });
    refreshTable();
    return true;
  };
}

/**
 * Hook to delete a row from a VTable
 * @returns Function to delete a row
 */
export function useDeleteRow() {
  const { refreshTable } = useVTable();
  
  return async (rowId: Id<"vtableRows">, tableId: Id<"vtables">) => {
    console.log("Deleting row:", { rowId, tableId });
    refreshTable();
    return true;
  };
}
