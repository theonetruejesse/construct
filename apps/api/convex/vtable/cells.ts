import { v } from "convex/values";
import { mutation } from "../_generated/server";

// Update the value of a specific cell
export const updateCell = mutation({
  args: {
    rowId: v.id("vtableRows"),
    columnId: v.id("vtableColumns"),
    value: v.optional(v.string()), // New value for the cell
  },
  returns: v.id("vtableCells"),
  handler: async (ctx, args) => {
    // Find the cell using the composite index
    const cell = await ctx.db
      .query("vtableCells")
      .withIndex("byRowAndColumn", (q) =>
        q.eq("rowId", args.rowId).eq("columnId", args.columnId)
      )
      .unique();

    if (!cell)
      throw new Error(
        `Cell not found for row ${args.rowId} and column ${args.columnId}`
      );

    await ctx.db.patch(cell._id, { value: args.value });
    return cell._id;
  },
});

// TODO: Any other cell operations? (Likely handled by row/column deletes)
