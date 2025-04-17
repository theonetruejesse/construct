import { useConvexQuery, useConvexMutation } from "@convex-dev/react-query";
import type { Id, VTableData, UpdateCellInput, AddColumnInput, AddRowInput } from "../vtable-types";
import { useVTable } from "../state/vtable-context";

/**
 * This file provides hooks for interacting with the Convex backend.
 * 
 * NOTE: This is a temporary implementation that uses mock data and types.
 * When integrated with the actual Convex backend, these hooks should be updated
 * to use the generated API types from Convex.
 */

const mockApi: any = {
  vtable: {
    tables: {
      listTables: { _name: "vtable/tables:listTables" },
      getTableData: { _name: "vtable/tables:getTableData" },
      createVTable: { _name: "vtable/tables:createVTable" },
      deleteTable: { _name: "vtable/tables:deleteTable" },
    },
    columns: {
      addColumn: { _name: "vtable/columns:addColumn" },
      deleteColumn: { _name: "vtable/columns:deleteColumn" },
    },
    rows: {
      addRow: { _name: "vtable/rows:addRow" },
      deleteRow: { _name: "vtable/rows:deleteRow" },
    },
    cells: {
      updateCell: { _name: "vtable/cells:updateCell" },
    }
  }
};

/**
 * Hook to fetch all available VTables
 * @returns List of VTables with their basic information
 */
export function useVTables() {
  return useConvexQuery(mockApi.vtable.tables.listTables);
}

/**
 * Hook to fetch a specific VTable with all its data
 * @param tableId The ID of the VTable to fetch
 * @returns The VTable data including columns and rows
 */
export function useVTableData(tableId: Id<"vtables"> | null) {
  const { refreshCounter } = useVTable();
  
  return useConvexQuery(
    mockApi.vtable.tables.getTableData,
    tableId ? { tableId } : "skip"
  );
}

/**
 * Hook to create a new VTable
 * @returns Function to create a new VTable
 */
export function useCreateVTable() {
  return useConvexMutation(mockApi.vtable.tables.createVTable);
}

/**
 * Hook to delete a VTable
 * @returns Function to delete a VTable
 */
export function useDeleteVTable() {
  return useConvexMutation(mockApi.vtable.tables.deleteTable);
}

/**
 * Hook to update a cell in a VTable
 * @returns Function to update a cell
 */
export function useUpdateCell() {
  const { refreshTable } = useVTable();
  const updateCell = useConvexMutation(mockApi.vtable.cells.updateCell);
  
  return async (input: UpdateCellInput) => {
    await updateCell(input);
    refreshTable();
  };
}

/**
 * Hook to add a new column to a VTable
 * @returns Function to add a column
 */
export function useAddColumn() {
  const { refreshTable } = useVTable();
  const addColumn = useConvexMutation(mockApi.vtable.columns.addColumn);
  
  return async (input: AddColumnInput) => {
    await addColumn(input);
    refreshTable();
  };
}

/**
 * Hook to add a new row to a VTable
 * @returns Function to add a row
 */
export function useAddRow() {
  const { refreshTable } = useVTable();
  const addRow = useConvexMutation(mockApi.vtable.rows.addRow);
  
  return async (input: AddRowInput) => {
    await addRow(input);
    refreshTable();
  };
}

/**
 * Hook to delete a column from a VTable
 * @returns Function to delete a column
 */
export function useDeleteColumn() {
  const { refreshTable } = useVTable();
  const deleteColumn = useConvexMutation(mockApi.vtable.columns.deleteColumn);
  
  return async (columnId: Id<"vtableColumns">, tableId: Id<"vtables">) => {
    await deleteColumn({ columnId, tableId });
    refreshTable();
  };
}

/**
 * Hook to delete a row from a VTable
 * @returns Function to delete a row
 */
export function useDeleteRow() {
  const { refreshTable } = useVTable();
  const deleteRow = useConvexMutation(mockApi.vtable.rows.deleteRow);
  
  return async (rowId: Id<"vtableRows">, tableId: Id<"vtables">) => {
    await deleteRow({ rowId, tableId });
    refreshTable();
  };
}
