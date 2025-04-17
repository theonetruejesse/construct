import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { mutation } from "../_generated/server";

// ================ TYPES ================

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

// ================ OPERATIONS ================

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
				q.eq("rowId", args.rowId).eq("columnId", args.columnId),
			)
			.unique();

		if (!cell)
			throw new Error(
				`Cell not found for row ${args.rowId} and column ${args.columnId}`,
			);

		await ctx.db.patch(cell._id, { value: args.value });
		return cell._id;
	},
});
