import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const send = mutation({
  args: {
    text: v.string(),
    author: v.string(),
  },
  handler: async (ctx, args) => {
    const message = {
      text: args.text,
      author: args.author,
      createdAt: Date.now(),
    };
    return await ctx.db.insert("messages", message);
  },
});

export const list = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("messages")
      .withIndex("byCreatedAt")
      .order("asc")
      .collect();
  },
});
