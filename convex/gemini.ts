"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { api } from "./_generated/api";

export const generateProgram = action({
    args: {
        programId: v.id("programs"),
    },
    handler: async (ctx, args) => {
        const program = await ctx.runQuery(api.users.getProgram, { programId: args.programId });

        if (!program) {
            throw new Error("Program not found");
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not set in Convex environment variables");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            You are a world-class fitness coach and nutritionist.
            Based on the following user data, create a detailed, personalized weekly workout and diet plan.
            - Age: ${program.age}
            - Weight: ${program.weight}
            - Height: ${program.height}
            - Fitness Goal: ${program.fitnessGoal}
            - Fitness Level: ${program.fitnessLevel}
            - Injuries or Limitations: ${program.injuries}
            - Workout Days Per Week: ${program.workoutDays}
            - Dietary Restrictions: ${program.dietaryRestrictions}

            Please format the response as a clean, easy-to-read markdown document.
            Include a section for the weekly workout routine (e.g., Day 1: Chest & Triceps, Day 2: Back & Biceps) and a separate section for a sample daily meal plan.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        await ctx.runMutation(api.programs.updateProgramText, {
            programId: args.programId,
            program: text,
        });

        return text;
    },
}); 