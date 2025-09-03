"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";

export type SortOption = "newest" | "oldest" | "most-voted" | "least-voted";
export type FilterOption = "all" | "public" | "private" | "expired" | "active";

interface PollFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    sortBy: SortOption;
    onSortChange: (sort: SortOption) => void;
    filterBy: FilterOption;
    onFilterChange: (filter: FilterOption) => void;
    totalResults?: number;
}

export function PollFilters({
    searchQuery,
    onSearchChange,
    sortBy,
    onSortChange,
    filterBy,
    onFilterChange,
    totalResults,
}: PollFiltersProps) {
    const [showFilters, setShowFilters] = useState(false);

    const clearFilters = () => {
        onSearchChange("");
        onSortChange("newest");
        onFilterChange("all");
    };

    const hasActiveFilters = searchQuery || sortBy !== "newest" || filterBy !== "all";

    return (
        <div className="space-y-4">
            {/* Search and Filter Toggle */}
            <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search polls..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                </Button>
            </div>

            {/* Results Count */}
            {totalResults !== undefined && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        {totalResults} poll{totalResults !== 1 ? 's' : ''} found
                    </p>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Clear filters
                        </Button>
                    )}
                </div>
            )}

            {/* Filter Options */}
            {showFilters && (
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Sort by</label>
                        <Select value={sortBy} onValueChange={onSortChange}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Newest first</SelectItem>
                                <SelectItem value="oldest">Oldest first</SelectItem>
                                <SelectItem value="most-voted">Most voted</SelectItem>
                                <SelectItem value="least-voted">Least voted</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Filter by</label>
                        <Select value={filterBy} onValueChange={onFilterChange}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All polls</SelectItem>
                                <SelectItem value="public">Public polls</SelectItem>
                                <SelectItem value="private">Private polls</SelectItem>
                                <SelectItem value="active">Active polls</SelectItem>
                                <SelectItem value="expired">Expired polls</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            {/* Active Filter Badges */}
            {hasActiveFilters && (
                <div className="flex flex-wrap gap-2">
                    {searchQuery && (
                        <Badge variant="secondary" className="gap-1">
                            Search: "{searchQuery}"
                            <button
                                onClick={() => onSearchChange("")}
                                className="ml-1 hover:bg-muted rounded-full p-0.5"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                    {sortBy !== "newest" && (
                        <Badge variant="secondary" className="gap-1">
                            Sort: {sortBy.replace("-", " ")}
                            <button
                                onClick={() => onSortChange("newest")}
                                className="ml-1 hover:bg-muted rounded-full p-0.5"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                    {filterBy !== "all" && (
                        <Badge variant="secondary" className="gap-1">
                            Filter: {filterBy}
                            <button
                                onClick={() => onFilterChange("all")}
                                className="ml-1 hover:bg-muted rounded-full p-0.5"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
}
