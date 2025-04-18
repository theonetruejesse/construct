import { api } from "@construct/api-client";
import type { Id, VTableData, UpdateCellInput, AddColumnInput, AddRowInput } from "../vtable-types";
import type { FunctionReference } from "convex/server";

/**
 * This file provides Convex function references for interacting with the Convex backend.
 * 
 * In a real implementation, these would be actual Convex function references.
 * For now, we're using the API paths from @construct/api-client.
 */

type MockFunctionReference<T extends "query" | "mutation"> = FunctionReference<T>;

export const fetchVTables = api.vtable.queries.listVTables as unknown as MockFunctionReference<"query">;
export const fetchVTableData = api.vtable.queries.getVTable as unknown as MockFunctionReference<"query">;
export const createVTable = api.vtable.tables.createVTable as unknown as MockFunctionReference<"mutation">;
export const deleteVTable = api.vtable.tables.deleteTable as unknown as MockFunctionReference<"mutation">;
export const updateCell = api.vtable.cells.updateCell as unknown as MockFunctionReference<"mutation">;
export const addColumn = api.vtable.columns.createVTableColumn as unknown as MockFunctionReference<"mutation">;
export const addRow = api.vtable.rows.createRow as unknown as MockFunctionReference<"mutation">;
export const deleteColumn = api.vtable.columns.deleteColumn as unknown as MockFunctionReference<"mutation">;
export const deleteRow = api.vtable.rows.deleteRow as unknown as MockFunctionReference<"mutation">;
