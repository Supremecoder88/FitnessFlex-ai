"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import Markdown from "react-markdown";

const ProfilePage = () => {
    const { user } = useUser();
    const program = useQuery(api.users.getProgramByUserId, user?.id ? { userId: user.id } : "skip");

    if (program === undefined) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">Your Fitness Profile</h1>
            {program ? (
                <div className="bg-card p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-primary">Your Generated Program</h2>
                    {program.program ? (
                        <Markdown
                            components={{
                                h1: ({ ...props }) => <h1 className="text-3xl font-bold mb-4" {...props} />,
                                h2: ({ ...props }) => <h2 className="text-2xl font-semibold mb-3" {...props} />,
                                h3: ({ ...props }) => <h3 className="text-xl font-semibold mb-2" {...props} />,
                                p: ({ ...props }) => <p className="mb-2" {...props} />,
                                ul: ({ ...props }) => <ul className="list-disc list-inside mb-4" {...props} />,
                                li: ({ ...props }) => <li className="mb-1" {...props} />,
                            }}
                        >
                            {program.program}
                        </Markdown>
                    ) : (
                        <div className="text-center p-8">
                            <p className="text-lg">Your program is being generated by our AI...</p>
                            <p className="text-muted-foreground">Please check back in a moment.</p>
                            <div className="mt-4 animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                        </div>
                    )}
                </div>
            ) : (
                <p>You have not generated a program yet. Go to the &quot;Generate&quot; page to create one!</p>
               )}
        </div>
   );
};

export default ProfilePage;