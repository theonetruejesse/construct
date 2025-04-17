import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    text: v.string(),
    author: v.string(),
    createdAt: v.number(),
  }).index("byCreatedAt", ["createdAt"]),

  // vtables - defines the virtual tables
  vtables: defineTable({
    name: v.string(),
    ownerId: v.optional(v.string()),
    createdAt: v.number(),
    description: v.optional(v.string()),
  }).index("byOwner", ["ownerId"]),

  // vtableColumns - defines the columns for each table
  vtableColumns: defineTable({
    tableId: v.id("vtables"),
    name: v.string(),
    type: v.string(), // Validates against allowed types
    options: v.optional(v.object({})),
    order: v.number(), // For maintaining column order
  })
    .index("byTableId", ["tableId"])
    .index("byTableIdAndOrder", ["tableId", "order"]),

  // vtableRows - defines the rows for each table
  vtableRows: defineTable({
    tableId: v.id("vtables"),
    createdAt: v.number(),
  }).index("byTableId", ["tableId"]),

  // vtableCells - stores the actual cell values
  vtableCells: defineTable({
    rowId: v.id("vtableRows"),
    columnId: v.id("vtableColumns"),
    value: v.optional(v.string()), // All values stored as strings
  })
    .index("byRowId", ["rowId"])
    .index("byColumnId", ["columnId"])
    .index("byRowAndColumn", ["rowId", "columnId"]),
});
