"use client";

import { useState, useEffect } from "react";
import { Protected } from "@/features/auth/context/auth-context";
import { DashboardStats } from "@/features/dashboard/components/dashboard-stats";
import { PollsGrid } from "@/features/polls/components/polls-grid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Poll } from "@/types";
import { Plus, BarChart3, Loader2, Trash2, Pencil } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// Mock data for demonstration
const mockUserPolls: Poll[] = [
    {
        id: "1",
        title: "What's your favorite programming language?",
        description: "Help us understand the community's preferences for our next project.",
        options: [
            { id: "1-1", text: "TypeScript", pollId: "1", votes: 45, voters: [] },
            { id: "1-2", text: "Python", pollId: "1", votes: 32, voters: [] },
            { id: "1-3", text: "Rust", pollId: "1", votes: 28, voters: [] },
            { id: "1-4", text: "Go", pollId: "1", votes: 15, voters: [] },
        ],
        authorId: "user1",
        author: {
            id: "user1",
            name: "John Doe",
            email: "john@example.com",
            createdAt: new Date(),
        },
        isPublic: true,
        allowMultipleVotes: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
        totalVotes: 120,
    },
    {
        id: "2",
        title: "Best framework for building web apps?",
        description: "Share your experience with different frameworks.",
        options: [
            { id: "2-1", text: "Next.js", pollId: "2", votes: 38, voters: [] },
            { id: "2-2", text: "React", pollId: "2", votes: 25, voters: [] },
            { id: "2-3", text: "Vue.js", pollId: "2", votes: 18, voters: [] },
            { id: "2-4", text: "Svelte", pollId: "2", votes: 12, voters: [] },
        ],
        authorId: "user2",
        author: {
            id: "user2",
            name: "Jane Smith",
            email: "jane@example.com",
            createdAt: new Date(),
        },
        isPublic: true,
        allowMultipleVotes: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        totalVotes: 93,
    },
];

export default function DashboardPage() {
    const [polls, setPolls] = useState<Poll[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUserPolls = async () => {
            setIsLoading(true);
            try {
                const res = await fetch("/api/polls", { cache: "no-store" });
                const j = await res.json();
                const data = (j?.data ?? []) as any[];
                const mapped: Poll[] = data.map((p: any) => ({
                    id: p.id,
                    title: p.title,
                    description: p.description,
                    options: (p.options ?? []).map((o: any) => ({ id: o.id, text: o.text, pollId: p.id, votes: o.votes, voters: [] })),
                    authorId: p.authorId,
                    author: { id: p.authorId, email: "", name: "", createdAt: new Date() },
                    isPublic: p.isPublic,
                    allowMultipleVotes: p.allowMultipleVotes,
                    expiresAt: p.expiresAt ? new Date(p.expiresAt) : undefined,
                    createdAt: new Date(p.createdAt),
                    updatedAt: new Date(p.createdAt),
                    totalVotes: p.totalVotes ?? 0,
                }));
                setPolls(mapped);
            } finally {
                setIsLoading(false);
            }
        };

        loadUserPolls();
    }, []);

    // Calculate stats
    const totalPolls = polls.length;
    const totalVotes = polls.reduce((sum, poll) => sum + poll.totalVotes, 0);
    const activePolls = polls.filter(poll =>
        !poll.expiresAt || new Date(poll.expiresAt) > new Date()
    ).length;
    const totalViews = totalVotes * 2; // Mock calculation

    const [busyId, setBusyId] = useState<string | null>(null);

    const deletePoll = async (id: string) => {
        setBusyId(id);
        try {
            const res = await fetch(`/api/polls/${id}`, { method: "DELETE" });
            const j = await res.json();
            if (!res.ok) throw new Error(j.error || "Failed to delete poll");
            toast.success("Poll deleted", { duration: 5000 });
            // reload
            const res2 = await fetch("/api/polls", { cache: "no-store" });
            const j2 = await res2.json();
            const data = (j2?.data ?? []) as any[];
            const mapped: Poll[] = data.map((p: any) => ({
                id: p.id,
                title: p.title,
                description: p.description,
                options: (p.options ?? []).map((o: any) => ({ id: o.id, text: o.text, pollId: p.id, votes: o.votes, voters: [] })),
                authorId: p.authorId,
                author: { id: p.authorId, email: "", name: "", createdAt: new Date() },
                isPublic: p.isPublic,
                allowMultipleVotes: p.allowMultipleVotes,
                expiresAt: p.expiresAt ? new Date(p.expiresAt) : undefined,
                createdAt: new Date(p.createdAt),
                updatedAt: new Date(p.createdAt),
                totalVotes: p.totalVotes ?? 0,
            }));
            setPolls(mapped);
        } catch (e: any) {
            toast.error(e.message, { duration: 5000 });
        } finally {
            setBusyId(null);
        }
    };

    return (
        <Protected>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground">
                            Manage your polls and track their performance
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/polls/create">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Poll
                        </Link>
                    </Button>
                </div>

                {/* Stats */}
                <DashboardStats
                    totalPolls={totalPolls}
                    totalVotes={totalVotes}
                    activePolls={activePolls}
                    totalViews={totalViews}
                />

                {/* Recent Polls */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Your Polls</CardTitle>
                                <CardDescription>
                                    Manage and monitor your created polls
                                </CardDescription>
                            </div>
                            <Button variant="outline" asChild>
                                <Link href="/polls">
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    View All
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="py-12 flex items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : polls.length === 0 ? (
                            <div className="text-center text-muted-foreground py-12">No polls yet.</div>
                        ) : (
                            <div className="space-y-4">
                                {polls.map((p) => (
                                    <div key={p.id} className="flex items-center justify-between border rounded-md p-4">
                                        <div>
                                            <div className="font-medium">{p.title}</div>
                                            <div className="text-sm text-muted-foreground">{p.totalVotes} votes</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/polls/${p.id}`}>
                                                    <BarChart3 className="h-4 w-4 mr-1" /> View
                                                </Link>
                                            </Button>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/polls/${p.id}?edit=1`}>
                                                    <Pencil className="h-4 w-4 mr-1" /> Edit
                                                </Link>
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => deletePoll(p.id)} disabled={busyId === p.id}>
                                                {busyId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Protected>
    );
}
