"use client";

import { useState, useEffect } from "react";
import { PollsGrid } from "@/features/polls/components/polls-grid";
import { PollFilters, type SortOption, type FilterOption } from "@/features/polls/components/poll-filters";
import { Poll } from "@/types";

// Mock data for demonstration
const mockPolls: Poll[] = [
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
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
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

export default function PollsPage() {
    const [polls, setPolls] = useState<Poll[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("newest");
    const [filterBy, setFilterBy] = useState<FilterOption>("all");

    useEffect(() => {
        // Simulate API call
        const loadPolls = async () => {
            setIsLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
            setPolls(mockPolls);
            setIsLoading(false);
        };

        loadPolls();
    }, []);

    // Filter and sort polls based on current filters
    const filteredPolls = polls.filter(poll => {
        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            if (!poll.title.toLowerCase().includes(query) &&
                !poll.description?.toLowerCase().includes(query)) {
                return false;
            }
        }

        // Type filter
        switch (filterBy) {
            case "public":
                return poll.isPublic;
            case "private":
                return !poll.isPublic;
            case "active":
                return !poll.expiresAt || new Date(poll.expiresAt) > new Date();
            case "expired":
                return poll.expiresAt && new Date(poll.expiresAt) <= new Date();
            default:
                return true;
        }
    }).sort((a, b) => {
        switch (sortBy) {
            case "newest":
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case "oldest":
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            case "most-voted":
                return b.totalVotes - a.totalVotes;
            case "least-voted":
                return a.totalVotes - b.totalVotes;
            default:
                return 0;
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Browse Polls</h1>
                    <p className="text-muted-foreground">
                        Discover and participate in community polls
                    </p>
                </div>
            </div>

            <PollFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortBy={sortBy}
                onSortChange={setSortBy}
                filterBy={filterBy}
                onFilterChange={setFilterBy}
                totalResults={filteredPolls.length}
            />

            <PollsGrid
                polls={filteredPolls}
                isLoading={isLoading}
            />
        </div>
    );
}
