import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import { type MutationCtx, mutation } from "../_generated/server";

// ================ TYPES ================

// Validator for the vtables document structure
export const vtableDocValidator = v.object({
	_id: v.id("vtables"),
	_creationTime: v.number(),
	name: v.string(),
	ownerId: v.optional(v.string()),
	createdAt: v.number(),
	description: v.optional(v.string()),
});

// ================ CASCADE OPERATIONS ================

/**
 * Deletes a table and all its related columns, rows, and cells.
 * IMPORTANT: This performs many individual deletes. For large tables,
 * consider alternative patterns or batched operations if performance becomes an issue.
 */
export async function cascadeDeleteTable(
	ctx: MutationCtx,
	tableId: Id<"vtables">,
): Promise<void> {
	// Find all columns for this table
	const columns = await ctx.db
		.query("vtableColumns")
		.withIndex("byTableId", (q) => q.eq("tableId", tableId))
		.collect();

	// Find all rows for this table
	const rows = await ctx.db
		.query("vtableRows")
		.withIndex("byTableId", (q) => q.eq("tableId", tableId))
		.collect();

	// Collect all cell IDs to delete associated with columns
	const cellIdsToDelete = new Set<Id<"vtableCells">>();

	for (const column of columns) {
		const cells = await ctx.db
			.query("vtableCells")
			.withIndex("byColumnId", (q) => q.eq("columnId", column._id))
			.collect();
		for (const cell of cells) {
			cellIdsToDelete.add(cell._id);
		}
	}

	// Collect all cell IDs to delete associated with rows
	for (const row of rows) {
		const cells = await ctx.db
			.query("vtableCells")
			.withIndex("byRowId", (q) => q.eq("rowId", row._id))
			.collect();
		for (const cell of cells) {
			cellIdsToDelete.add(cell._id);
		}
	}

	// Delete all unique cells found
	for (const cellId of cellIdsToDelete) {
		await ctx.db.delete(cellId);
	}

	// Delete all columns
	for (const column of columns) {
		await ctx.db.delete(column._id);
	}

	// Delete all rows
	for (const row of rows) {
		await ctx.db.delete(row._id);
	}

	// Finally delete the table itself
	await ctx.db.delete(tableId);
}

// ================ OPERATIONS ================

// Create a new VTable
export const createVTable = mutation({
	args: {
		name: v.string(),
		ownerId: v.optional(v.string()),
		description: v.optional(v.string()),
	},
	returns: v.id("vtables"),
	handler: async (ctx, args) => {
		const tableId = await ctx.db.insert("vtables", {
			name: args.name,
			ownerId: args.ownerId,
			description: args.description,
			createdAt: Date.now(),
		});

		return tableId;
	},
});

// Delete a VTable and all associated data (columns, rows, cells)
export const deleteTable = mutation({
	args: {
		tableId: v.id("vtables"),
	},
	returns: v.null(), // Deleting returns nothing
	handler: async (ctx, args) => {
		// TODO: Add permission checks (e.g., only owner can delete)

		// Call the cascade delete helper function
		await cascadeDeleteTable(ctx, args.tableId);

		return null;
	},
});

// Update a VTable's mutable properties (name, description)
export const updateTable = mutation({
	args: {
		tableId: v.id("vtables"),
		name: v.optional(v.string()),
		description: v.optional(v.string()),
	},
	returns: v.null(), // Patch returns nothing
	handler: async (ctx, args) => {
		// TODO: Add permission checks (e.g., only owner can update)

		const { tableId, ...updates } = args;

		// Filter out undefined values to only patch provided fields
		const validUpdates: Partial<Doc<"vtables">> = {};
		if (updates.name !== undefined) {
			validUpdates.name = updates.name;
		}
		if (updates.description !== undefined) {
			validUpdates.description = updates.description;
		}

		if (Object.keys(validUpdates).length > 0) {
			await ctx.db.patch(tableId, validUpdates);
		}

		return null;
	},
});
