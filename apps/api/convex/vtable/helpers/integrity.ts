import { MutationCtx, QueryCtx } from "../../_generated/server";
import { Id } from "../../_generated/dataModel";

/**
 * Deletes a table and all its related columns, rows, and cells.
 * IMPORTANT: This performs many individual deletes. For large tables,
 * consider alternative patterns or batched operations if performance becomes an issue.
 */
export async function cascadeDeleteTable(
  ctx: MutationCtx,
  tableId: Id<"vtables">
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
  let cellIdsToDelete = new Set<Id<"vtableCells">>();

  for (const column of columns) {
    const cells = await ctx.db
      .query("vtableCells")
      .withIndex("byColumnId", (q) => q.eq("columnId", column._id))
      .collect();
    cells.forEach((cell) => cellIdsToDelete.add(cell._id));
  }

  // Collect all cell IDs to delete associated with rows
  for (const row of rows) {
    const cells = await ctx.db
      .query("vtableCells")
      .withIndex("byRowId", (q) => q.eq("rowId", row._id))
      .collect();
    cells.forEach((cell) => cellIdsToDelete.add(cell._id));
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

/**
 * Deletes a specific column and all its associated cells.
 */
export async function cascadeDeleteColumn(
  ctx: MutationCtx,
  columnId: Id<"vtableColumns">
): Promise<void> {
  // Find and delete all cells associated with this column
  const cells = await ctx.db
    .query("vtableCells")
    .withIndex("byColumnId", (q) => q.eq("columnId", columnId))
    .collect();

  for (const cell of cells) {
    await ctx.db.delete(cell._id);
  }

  // Delete the column itself
  await ctx.db.delete(columnId);
}

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

// TODO: Add helper function for cascading row delete
