import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { type MutationCtx, mutation } from "../_generated/server";
import { type CellData, cellDataValidator } from "./cells";
import { type VTableColumnType, getDefaultValueForType } from "./columns";

// ================ TYPES ================

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

// ================ CASCADE OPERATIONS ================

/**
 * Deletes a specific row and all its associated cells.
 */
export async function cascadeDeleteRow(
  ctx: MutationCtx,
  rowId: Id<"vtableRows">
): Promise<void> {
  // Find and delete all cells associated with this row
  const cells = await ctx.db
    .query("vtableCells")
    .withIndex("byRowId", (q) => q.eq("rowId", rowId))
    .collect();

  for (const cell of cells) {
    await ctx.db.delete(cell._id);
  }

  // Delete the row itself
  await ctx.db.delete(rowId);
}

// ================ OPERATIONS ================

// Create a new row for a table, populating default cell values
export const createRow = mutation({
  args: {
    tableId: v.id("vtables"),
  },
  returns: v.id("vtableRows"),
  handler: async (ctx, args) => {
    // Insert the new row
    const rowId = await ctx.db.insert("vtableRows", {
      tableId: args.tableId,
      createdAt: Date.now(),
    });

    // Get all columns for this table
    const columns = await ctx.db
      .query("vtableColumns")
      .withIndex("byTableId", (q) => q.eq("tableId", args.tableId))
      .collect();

    // Create cells for all columns in parallel with Promise.all
    await Promise.all(
      columns.map(async (column) => {
        const defaultValue = getDefaultValueForType(
          column.type as VTableColumnType,
          column.options
        );
        await ctx.db.insert("vtableCells", {
          rowId: rowId,
          columnId: column._id,
          value: defaultValue,
        });
      })
    );

    return rowId;
  },
});

// Delete a row and all associated cell data
export const deleteRow = mutation({
  args: {
    rowId: v.id("vtableRows"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // TODO: Add permission checks

    await cascadeDeleteRow(ctx, args.rowId);

    return null;
  },
});
