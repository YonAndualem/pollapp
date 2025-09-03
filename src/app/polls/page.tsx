"use client";

import { useState, useEffect } from "react";
import { PollsGrid } from "@/features/polls/components/polls-grid";
import { PollFilters, type SortOption, type FilterOption } from "@/features/polls/components/poll-filters";
import { Poll } from "@/types";

// Load from API instead of mock

export default function PollsPage() {
    const [polls, setPolls] = useState<Poll[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("newest");
    const [filterBy, setFilterBy] = useState<FilterOption>("all");

    useEffect(() => {
        const loadPolls = async () => {
            setIsLoading(true);
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
