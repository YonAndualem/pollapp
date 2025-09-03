// Core domain types for the polling app

export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    createdAt: Date;
}

export interface Poll {
    id: string;
    title: string;
    description?: string;
    options: PollOption[];
    authorId: string;
    author: User;
    isPublic: boolean;
    allowMultipleVotes: boolean;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    totalVotes: number;
}

export interface PollOption {
    id: string;
    text: string;
    pollId: string;
    votes: number;
    voters: string[]; // User IDs who voted for this option
}

export interface Vote {
    id: string;
    pollId: string;
    optionId: string;
    userId: string;
    createdAt: Date;
}

// Form types
export interface CreatePollForm {
    title: string;
    description?: string;
    options: string[];
    isPublic: boolean;
    allowMultipleVotes: boolean;
    expiresAt?: Date;
}

export interface AuthForm {
    email: string;
    password: string;
    name?: string; // For registration
}

// API response types
export interface ApiResponse<T> {
    data: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
