import { httpRouter } from "convex/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { api } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
    path: "/clerk-webhook",
    method: "POST",
    handler: httpAction(async (ctx,request)=>{
        const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
        if(!webhookSecret){
            throw new Error("CLERK_WEBHOOK_SECRET is not set");
        }
        
        const payload = await request.json();
        const body = JSON.stringify(payload);
        const wh = new Webhook(webhookSecret);
        let evt: WebhookEvent;
        try{
            evt = wh.verify(body, {
                "svix-id": request.headers.get("svix-id")!,
                "svix-timestamp": request.headers.get("svix-timestamp")!,
                "svix-signature": request.headers.get("svix-signature")!,
            }) as WebhookEvent;
        }catch(err){
            console.error(err);
            return new Response("Error",{status:400});
        }

        const eventType = evt.type;
        if(eventType === "user.created"){
            const {id,email_addresses,image_url,first_name,last_name} = evt.data;
            const email = email_addresses[0].email_address;
            const name = `${first_name || ""} ${last_name || ""}`.trim();
            try{
                await ctx.runMutation(api.users.syncUser,{
                    clerkId:id,
                    email,
                    name,
                    image:image_url,
                });
            }catch(err){
                console.error(err);
                return new Response("Error",{status:500});
            }
        }
        return new Response("OK",{status:200});
    })
})

http.route({
    path: "/vapi-webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const payload = await request.json();

        switch (payload.message?.type) {
            case "tool-calls":
                console.log("Processing 'tool-calls' message...");
                const toolCall = payload.message.toolCalls[0];

                if (toolCall.function?.name === "save_user_data") {
                    console.log("Found 'save_user_data' function call.");
                    const parameters = toolCall.function.arguments;
                    console.log("Parsed parameters:", parameters);
                    
                    const userId = payload.message?.call?.assistantOverrides?.metadata?.user_id;
                    console.log("Extracted userId:", userId);

                    if (!userId) {
                        console.error("User ID not found in Vapi call metadata. Aborting.");
                        return new Response(JSON.stringify({ success: true }), { status: 200 });
                    }
                    
                    console.log("Calling saveProgramData mutation...");
                    try {
                        await ctx.runMutation(api.programs.saveProgramData, {
                            userId: userId,
                            age: parameters.age,
                            weight: parameters.weight,
                            height: parameters.height,
                            fitnessGoal: parameters.fitnessGoal,
                            fitnessLevel: parameters.fitnessLevel,
                            injuries: parameters.injuries,
                            workoutDays: parameters.workoutDays,
                            dietaryRestrictions: parameters.dietaryRestrictions,
                        });
                        console.log("saveProgramData mutation call completed successfully.");
                    } catch (error) {
                        console.error("Error calling saveProgramData mutation:", error);
                    }
                }
                break;
            case "call-start":
                console.log("Vapi call started");
                break;
            case "call-end":
                console.log("Vapi call ended");
                break;
            default:
                break;
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });
    }),
});

export default http;

