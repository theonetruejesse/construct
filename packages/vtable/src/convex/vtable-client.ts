import type { Id, VTableData, UpdateCellInput, AddColumnInput, AddRowInput } from "../vtable-types";
import type { FunctionReference } from "convex/server";

/**
 * This file provides mock Convex function references for interacting with the Convex backend.
 * 
 * In a real implementation, these would be actual Convex function references imported from
 * the generated API. For now, we're using mock function references that match the 
 * Convex API structure in apps/api/convex/vtable.
 */

type MockFunctionReference<T extends "query" | "mutation"> = FunctionReference<T>;

export const fetchVTables = { name: "vtable/queries:listVTables" } as unknown as MockFunctionReference<"query">;
export const fetchVTableData = { name: "vtable/queries:getVTable" } as unknown as MockFunctionReference<"query">;
export const createVTable = { name: "vtable/tables:createVTable" } as unknown as MockFunctionReference<"mutation">;
export const deleteVTable = { name: "vtable/tables:deleteTable" } as unknown as MockFunctionReference<"mutation">;
export const updateCell = { name: "vtable/cells:updateCell" } as unknown as MockFunctionReference<"mutation">;
export const addColumn = { name: "vtable/columns:createVTableColumn" } as unknown as MockFunctionReference<"mutation">;
export const addRow = { name: "vtable/rows:createRow" } as unknown as MockFunctionReference<"mutation">;
export const deleteColumn = { name: "vtable/columns:deleteColumn" } as unknown as MockFunctionReference<"mutation">;
export const deleteRow = { name: "vtable/rows:deleteRow" } as unknown as MockFunctionReference<"mutation">;
