import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { Doc } from "../_generated/dataModel";
import { cascadeDeleteTable } from "./helpers/integrity"; // Import cascade helper

// Validator for the vtables document structure
export const vtableDocValidator = v.object({
  _id: v.id("vtables"),
  _creationTime: v.number(),
  name: v.string(),
  ownerId: v.optional(v.string()),
  createdAt: v.number(),
  description: v.optional(v.string()),
});

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

// TODO: Add other table operations: get, list (partially defined in plan), update, delete (needs cascade)
