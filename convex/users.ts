import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const syncUser = mutation({
    args:{
        clerkId:v.string(),
        email:v.string(),
        name:v.string(),
        image:v.optional(v.string()),
    },
    handler:async (ctx,args)=>{
        const {clerkId,email,name,image} = args;
        const existingUser = await ctx.db.query("users").filter((q)=>q.eq(q.field("clerkId"),clerkId)).first();
        if(existingUser) return;

        return await ctx.db.insert("users",args);
    }
});

export const getProgram = query({
    args: { programId: v.id("programs") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.programId);
    },
});

export const getProgramByUserId = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("programs")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .first();
    },
});