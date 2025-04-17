import { v } from "convex/values";
import { query, QueryCtx } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";
import { vtableDocValidator } from "./tables";
import { AssembledColumn, assembledColumnValidator } from "./columns";
import { AssembledRow, assembledRowValidator } from "./rows";
import { CellData } from "./cells";

// ================ TYPES ================

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

// ================ ASSEMBLER FUNCTIONS ================

/**
 * Assembles a complete VTable view (table info, ordered columns, rows with cells).
 * Fetches table, columns, rows, and all associated cells, then structures the data.
 */
export async function assembleVTableData(
  ctx: QueryCtx,
  tableId: Id<"vtables">
): Promise<AssembledVTable | null> {
  // Get the table
  const table = await ctx.db.get(tableId);
  if (!table) return null;

  // Get columns (ordered) and rows in parallel
  const [columns, rows] = await Promise.all([
    ctx.db
      .query("vtableColumns")
      .withIndex("byTableIdAndOrder", (q) => q.eq("tableId", tableId))
      // .order("asc") // Order is implicitly handled by the index range
      .collect(),
    ctx.db
      .query("vtableRows")
      .withIndex("byTableId", (q) => q.eq("tableId", tableId))
      .order("desc") // Default to newest rows first, adjust as needed
      .collect(),
  ]);

  // --- Efficient Cell Fetching ---
  // Instead of fetching cells per row, fetch all cells for the table rows at once.
  const rowIds = rows.map((r) => r._id);
  let allCells: Doc<"vtableCells">[] = [];
  if (rowIds.length > 0) {
    // Fetch cells for all rows in batches (or handle potential limits if many rows)
    // This example fetches all at once, assuming not thousands of rows.
    const cellPromises = rowIds.map((rowId) =>
      ctx.db
        .query("vtableCells")
        .withIndex("byRowId", (q) => q.eq("rowId", rowId))
        .collect()
    );
    const cellsByRowArray = await Promise.all(cellPromises);
    allCells = cellsByRowArray.flat();
  }
  // --- End Efficient Cell Fetching ---

  // Group cells by rowId for quick lookup
  const cellsByRow = new Map<
    Id<"vtableRows">,
    Map<Id<"vtableColumns">, CellData>
  >();

  for (const cell of allCells) {
    let rowMap = cellsByRow.get(cell.rowId);
    if (!rowMap) {
      rowMap = new Map<Id<"vtableColumns">, CellData>();
      cellsByRow.set(cell.rowId, rowMap);
    }
    rowMap.set(cell.columnId, {
      id: cell._id,
      value: cell.value ?? null, // Ensure null if undefined
    });
  }

  // Assemble the final structure
  const assembledRows = rows.map((row) => {
    const rowCellsMap = cellsByRow.get(row._id);
    const cellsResult: Record<string, CellData> = {};
    // Ensure all columns are present in the row's cells, even if no cell exists (value: null)
    for (const col of columns) {
      const cellData = rowCellsMap?.get(col._id);
      cellsResult[col._id.toString()] = cellData ?? { id: null, value: null }; // Use null ID placeholder if cell doesn't exist
    }

    return {
      id: row._id,
      createdAt: row.createdAt,
      cells: cellsResult,
    };
  });

  return {
    table,
    columns: columns.map((column) => ({
      id: column._id,
      name: column.name,
      type: column.type,
      options: column.options ?? null,
      order: column.order,
    })),
    rows: assembledRows,
  };
}

// ================ QUERY OPERATIONS ================

// Get a fully assembled VTable using the helper function
export const getVTable = query({
  args: { tableId: v.id("vtables") },
  returns: v.union(assembledVTableValidator, v.null()), // Added return validator
  handler: async (ctx, args) => {
    // TODO: Add permission checks if necessary (e.g., check if user owns/can view table)
    return await assembleVTableData(ctx, args.tableId);
  },
});

// List available VTables (basic implementation from plan)
export const listVTables = query({
  args: { ownerId: v.optional(v.string()) }, // Optional filter by owner
  returns: v.array(vtableDocValidator), // Added return validator
  handler: async (ctx, args) => {
    // TODO: Add permission checks - only return tables owned by the user

    const q = args.ownerId
      ? ctx.db
          .query("vtables")
          .withIndex("byOwner", (q) => q.eq("ownerId", args.ownerId!))
      : ctx.db.query("vtables");

    // Consider adding ordering, e.g., by createdAt
    return await q.order("desc").collect();
  },
});
