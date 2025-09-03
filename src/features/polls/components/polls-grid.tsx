"use client";

import { PollCard } from "./poll-card";
import { Poll } from "@/types";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PollsGridProps {
    polls: Poll[];
    isLoading?: boolean;
    hasMore?: boolean;
    onLoadMore?: () => void;
    loadingMore?: boolean;
}

export function PollsGrid({
    polls,
    isLoading,
    hasMore,
    onLoadMore,
    loadingMore
}: PollsGridProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (polls.length === 0) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No polls found
                </h3>
                <p className="text-sm text-muted-foreground">
                    Be the first to create a poll!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {polls.map((poll) => (
                    <PollCard key={poll.id} poll={poll} />
                ))}
            </div>

            {hasMore && onLoadMore && (
                <div className="flex justify-center pt-6">
                    <Button
                        variant="outline"
                        onClick={onLoadMore}
                        disabled={loadingMore}
                    >
                        {loadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Load More
                    </Button>
                </div>
            )}
        </div>
    );
}
