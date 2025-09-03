"use client";

import { useState, useEffect } from "react";
import { DashboardStats } from "@/features/dashboard/components/dashboard-stats";
import { PollsGrid } from "@/features/polls/components/polls-grid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Poll } from "@/types";
import { Plus, BarChart3 } from "lucide-react";
import Link from "next/link";

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
        // Simulate API call
        const loadUserPolls = async () => {
            setIsLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1000));
            setPolls(mockUserPolls);
            setIsLoading(false);
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

    return (
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
                    <PollsGrid
                        polls={polls}
                        isLoading={isLoading}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
