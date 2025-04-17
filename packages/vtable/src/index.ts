export * from "./vtable-types";

export { VTable } from "./components/vtable";
export { TableSelector } from "./components/table-selector";

export { VTableProvider, useVTable } from "./state/vtable-context";

export { transformDataForTable, extractColumnDefs, extractRowData } from "./utils/data-transform";

export {
  useVTables,
  useVTableData,
  useCreateVTable,
  useDeleteVTable,
  useUpdateCell,
  useAddColumn,
  useAddRow,
  useDeleteColumn,
  useDeleteRow
} from "./convex/vtable-hooks";
