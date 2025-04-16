import { v } from "convex/values";
import { query } from "../_generated/server";
import { assembleVTableData } from "./helpers/assembler";
import { vtableDocValidator } from "./tables";
import { assembledVTableValidator } from "./helpers/types";

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
    // TODO: Add permission checks - maybe only return tables owned by the user?

    const q = args.ownerId
      ? ctx.db
          .query("vtables")
          .withIndex("byOwner", (q) => q.eq("ownerId", args.ownerId!))
      : ctx.db.query("vtables");

    // Consider adding ordering, e.g., by createdAt
    return await q.order("desc").collect();
  },
});

// TODO: Add other necessary query operations
// - Get specific rows?
// - Get specific columns?
// - Filtered/paginated views?
