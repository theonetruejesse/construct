import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getDefaultValueForType } from "./helpers/validators";
import { VTableColumnType } from "./helpers/types";
import { cascadeDeleteRow } from "./helpers/integrity";

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

// TODO: Add other row operations: update (complex), delete (needs cascade)
