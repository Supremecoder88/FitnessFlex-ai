import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const saveProgramData = mutation({
    args: {
        userId: v.string(),
        age: v.number(),
        weight: v.string(),
        height: v.string(),
        fitnessGoal: v.string(),
        fitnessLevel: v.string(),
        injuries: v.string(),
        workoutDays: v.number(),
        dietaryRestrictions: v.string(),
    },
    handler: async (ctx, args) => {
        const existingProgram = await ctx.db
            .query("programs")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .first();

        if (existingProgram) {
            await ctx.db.patch(existingProgram._id, {
                age: args.age,
                weight: args.weight,
                height: args.height,
                fitnessGoal: args.fitnessGoal,
                fitnessLevel: args.fitnessLevel,
                injuries: args.injuries,
                workoutDays: args.workoutDays,
                dietaryRestrictions: args.dietaryRestrictions,
            });
            await ctx.scheduler.runAfter(0, api.gemini.generateProgram, { programId: existingProgram._id });
            return existingProgram._id;
        } else {
            const programId = await ctx.db.insert("programs", {
                userId: args.userId,
                age: args.age,
                weight: args.weight,
                height: args.height,
                fitnessGoal: args.fitnessGoal,
                fitnessLevel: args.fitnessLevel,
                injuries: args.injuries,
                workoutDays: args.workoutDays,
                dietaryRestrictions: args.dietaryRestrictions,
            });
            await ctx.scheduler.runAfter(0, api.gemini.generateProgram, { programId });
            return programId;
        }
    },
});

export const updateProgramText = mutation({
    args: {
        programId: v.id("programs"),
        program: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.programId, { program: args.program });
    },
}); 