import { v } from "convex/values";
import { mutation, MutationCtx } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";

// ================ TYPES ================

// Define allowed column types using as const for literal types
export const ALLOWED_COLUMN_TYPES = ["text", "number", "boolean"] as const;

// Create a TypeScript type from the allowed types
export type VTableColumnType = (typeof ALLOWED_COLUMN_TYPES)[number];

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

// ================ VALIDATORS ================

/**
 * Validates if the provided column type is one of the allowed types.
 * Throws an error if the type is invalid.
 */
export function validateColumnType(
  type: string
): asserts type is VTableColumnType {
  if (!(ALLOWED_COLUMN_TYPES as readonly string[]).includes(type)) {
    throw new Error(
      `Invalid column type: ${type}. Allowed types are: ${ALLOWED_COLUMN_TYPES.join(
        ", "
      )}`
    );
  }
}

/**
 * Gets the default value (as a string or undefined) for a given column type.
 * This is used when creating new cells for a new column or row.
 *
 * @param type - The column type to get a default value for
 * @param options - Optional configuration for the column (not currently used, but kept for future extensibility)
 */
export function getDefaultValueForType(
  type: VTableColumnType,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  options?: Record<string, any> | null
): string | undefined {
  switch (type) {
    case "text":
      return ""; // Default empty string for text
    case "number":
      return "0"; // Default "0" for number (stored as string)
    case "boolean":
      return "false"; // Default "false" for boolean (stored as string)
    default:
      // This should be unreachable due to validateColumnType, but belts and braces
      const exhaustiveCheck: never = type;
      throw new Error(`Unhandled column type: ${exhaustiveCheck}`);
  }
}

// ================ CASCADE OPERATIONS ================

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

// ================ OPERATIONS ================

// Create a new column with default values for all rows
export const createVTableColumn = mutation({
  args: {
    tableId: v.id("vtables"),
    name: v.string(),
    type: v.string(),
    options: v.optional(v.object({})),
    order: v.optional(v.number()),
  },
  returns: v.id("vtableColumns"),
  handler: async (ctx, args) => {
    // Validate type
    validateColumnType(args.type);

    // Get the highest existing order value or default to 0
    let order = args.order;
    if (order === undefined) {
      const columns = await ctx.db
        .query("vtableColumns")
        .withIndex("byTableId", (q) => q.eq("tableId", args.tableId))
        .collect();

      order = columns.length ? Math.max(...columns.map((c) => c.order)) + 1 : 0;
    }

    // Create the column
    const columnId = await ctx.db.insert("vtableColumns", {
      tableId: args.tableId,
      name: args.name,
      type: args.type,
      options: args.options,
      order,
    });

    // Get all rows for this table to create cells for
    const rows = await ctx.db
      .query("vtableRows")
      .withIndex("byTableId", (q) => q.eq("tableId", args.tableId))
      .collect();

    // Create cells for all existing rows with default value
    const defaultValue = getDefaultValueForType(
      args.type as VTableColumnType,
      args.options
    );

    for (const row of rows) {
      await ctx.db.insert("vtableCells", {
        rowId: row._id,
        columnId,
        value: defaultValue,
      });
    }

    return columnId;
  },
});

// Delete a column and all associated cell data
export const deleteColumn = mutation({
  args: {
    columnId: v.id("vtableColumns"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // TODO: Add permission checks
    // TODO: Consider implications for column ordering if columns are deleted (Handled by re-fetch on FE?)

    await cascadeDeleteColumn(ctx, args.columnId);

    return null;
  },
});

// Update a column's properties, handling type changes and reordering
export const updateColumn = mutation({
  args: {
    columnId: v.id("vtableColumns"),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    options: v.optional(v.object({})),
    order: v.optional(v.number()), // The desired new order index (0-based)
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // TODO: Add permission checks

    const { columnId, ...updates } = args;
    const newOrder = updates.order;

    // --- Get Current Column State ---
    const columnToUpdate = await ctx.db.get(columnId);
    if (!columnToUpdate) {
      throw new Error(`Column not found: ${columnId}`);
    }
    const currentOrder = columnToUpdate.order;
    const tableId = columnToUpdate.tableId;
    // --- End Get Current Column State ---

    let newType: VTableColumnType | undefined = undefined;

    // Validate new type if provided
    if (updates.type !== undefined && updates.type !== columnToUpdate.type) {
      validateColumnType(updates.type); // Throws on invalid type
      newType = updates.type;
    }

    // --- Handle Reordering ---
    if (newOrder !== undefined && newOrder !== currentOrder) {
      // Fetch all other columns for the same table, ordered by their current order
      const otherColumns = await ctx.db
        .query("vtableColumns")
        .withIndex("byTableIdAndOrder", (q) => q.eq("tableId", tableId))
        // .order("asc") // Order implicitly handled by index range
        .filter((q) => q.neq(q.field("_id"), columnId)) // Exclude the column being moved
        .collect();

      const shiftPromises: Promise<unknown>[] = [];

      if (newOrder < currentOrder) {
        // Moving UP (to a lower index): Increment orders from newOrder up to currentOrder
        otherColumns.forEach((col) => {
          if (col.order >= newOrder && col.order < currentOrder) {
            shiftPromises.push(ctx.db.patch(col._id, { order: col.order + 1 }));
          }
        });
      } else {
        // newOrder > currentOrder
        // Moving DOWN (to a higher index): Decrement orders from currentOrder down to newOrder
        otherColumns.forEach((col) => {
          if (col.order > currentOrder && col.order <= newOrder) {
            shiftPromises.push(ctx.db.patch(col._id, { order: col.order - 1 }));
          }
        });
      }
      // Wait for all order shifts to complete
      if (shiftPromises.length > 0) {
        await Promise.all(shiftPromises);
      }
    }
    // --- End Handle Reordering ---

    // --- Update Existing Cell Values on Type Change ---
    if (newType) {
      const defaultValue = getDefaultValueForType(newType);
      const cellsToUpdate = await ctx.db
        .query("vtableCells")
        .withIndex("byColumnId", (q) => q.eq("columnId", columnId))
        .collect();

      const cellPatchPromises = cellsToUpdate.map((cell) =>
        ctx.db.patch(cell._id, { value: defaultValue })
      );
      if (cellPatchPromises.length > 0) {
        await Promise.all(cellPatchPromises);
      }
    }
    // --- End Cell Update Logic ---

    // Filter out undefined values for the target column update
    const validUpdates: Partial<Doc<"vtableColumns">> = {};
    if (updates.name !== undefined) validUpdates.name = updates.name;
    if (updates.type !== undefined) validUpdates.type = updates.type;
    if (updates.options !== undefined) validUpdates.options = updates.options;
    // Only include order in the final patch if it was provided
    if (newOrder !== undefined) validUpdates.order = newOrder;

    // Patch the target column itself
    if (Object.keys(validUpdates).length > 0) {
      await ctx.db.patch(columnId, validUpdates);
    }

    return null;
  },
});
