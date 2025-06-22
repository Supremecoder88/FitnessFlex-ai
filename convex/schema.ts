import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    clerkId: v.string(),
  }).index("by_clerk_id", ["clerkId"]),

  programs: defineTable({
    userId: v.string(),
    age: v.number(),
    weight: v.string(),
    height: v.string(),
    fitnessGoal: v.string(),
    fitnessLevel: v.string(),
    injuries: v.string(),
    workoutDays: v.number(),
    dietaryRestrictions: v.string(),
    program: v.optional(v.string()),
  }).index("by_userId", ["userId"]),
});