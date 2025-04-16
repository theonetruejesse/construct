// Shared TypeScript types for VTables
import { v } from "convex/values";
import type { Doc, Id } from "../../_generated/dataModel";
import { vtableDocValidator } from "../tables"; // Assuming vtableDocValidator is exported from tables.ts

// Basic type for a single cell's data in the assembled view
export interface CellData {
  id: Id<"vtableCells"> | null;
  value: string | null;
}
// Corresponding validator for CellData
export const cellDataValidator = v.object({
  id: v.union(v.id("vtableCells"), v.null()),
  value: v.union(v.string(), v.null()),
});

// Type for an assembled row, including its cells keyed by column ID
export interface AssembledRow {
  id: Id<"vtableRows">;
  createdAt: number;
  cells: Record<string, CellData>; // ColumnId -> CellData
}
// Corresponding validator for AssembledRow
export const assembledRowValidator = v.object({
  id: v.id("vtableRows"),
  createdAt: v.number(),
  cells: v.record(v.string(), cellDataValidator),
});

// Type for an assembled column
export interface AssembledColumn {
  id: Id<"vtableColumns">;
  name: string;
  type: string;
  options: Record<string, any> | null;
  order: number;
}
// Corresponding validator for AssembledColumn
export const assembledColumnValidator = v.object({
  id: v.id("vtableColumns"),
  name: v.string(),
  type: v.string(),
  options: v.union(v.object({}), v.null()), // Match the assembled structure (null for missing)
  order: v.number(),
});

// Type for the fully assembled VTable view
export interface AssembledVTable {
  table: Doc<"vtables">;
  columns: AssembledColumn[];
  rows: AssembledRow[];
}
// Corresponding validator for AssembledVTable
export const assembledVTableValidator = v.object({
  table: vtableDocValidator, // Use the validator for the vtables document
  columns: v.array(assembledColumnValidator),
  rows: v.array(assembledRowValidator),
});

// Define allowed column types using as const for literal types
export const ALLOWED_COLUMN_TYPES = ["text", "number", "boolean"] as const;

// Create a TypeScript type from the allowed types
export type VTableColumnType = (typeof ALLOWED_COLUMN_TYPES)[number];

// You might want to define allowed column types here
// export const ALLOWED_COLUMN_TYPES = ["text", "number", "date", /* ... */] as const;
// export type VTableColumnType = typeof ALLOWED_COLUMN_TYPES[number];
