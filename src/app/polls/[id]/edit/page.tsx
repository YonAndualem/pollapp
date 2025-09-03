"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EditPollForm } from "@/features/polls/components/edit-poll-form";
import { useAuth } from "@/features/auth/context/auth-context";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EditPollPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const pollId = params.id;

    useEffect(() => {
        const checkOwnership = async () => {
            if (!user) {
                router.push("/auth/login");
                return;
            }

            try {
                const res = await fetch(`/api/polls/${pollId}`, { cache: "no-store" });
                const j = await res.json();

                if (!res.ok) {
                    toast.error("Poll not found", { duration: 5000 });
                    router.push("/dashboard");
                    return;
                }

                const poll = j.data;
                if (poll.authorId !== user.id) {
                    toast.error("You can only edit your own polls", { duration: 5000 });
                    router.push("/dashboard");
                    return;
                }

                setIsOwner(true);
            } catch (error) {
                toast.error("Failed to load poll", { duration: 5000 });
                router.push("/dashboard");
            } finally {
                setLoading(false);
            }
        };

        checkOwnership();
    }, [pollId, user, router]);

    const handleCancel = () => {
        router.back();
    };

    if (loading) {
        return (
            <div className="py-12 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
        );
    }

    if (!isOwner) {
        return null; // Will redirect in useEffect
    }

    return <EditPollForm pollId={pollId} onCancel={handleCancel} />;
}
