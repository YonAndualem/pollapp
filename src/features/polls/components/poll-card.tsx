"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Poll } from "@/types";
import { Users, Clock, BarChart3 } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface PollCardProps {
    poll: Poll;
}

export function PollCard({ poll }: PollCardProps) {
    const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date();
    const timeRemaining = poll.expiresAt
        ? formatDistanceToNow(new Date(poll.expiresAt), { addSuffix: true })
        : null;

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg line-clamp-2">
                            <Link
                                href={`/polls/${poll.id}`}
                                className="hover:text-primary transition-colors"
                            >
                                {poll.title}
                            </Link>
                        </CardTitle>
                        {poll.description && (
                            <CardDescription className="line-clamp-2">
                                {poll.description}
                            </CardDescription>
                        )}
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                        {!poll.isPublic && (
                            <Badge variant="secondary">Private</Badge>
                        )}
                        {isExpired && (
                            <Badge variant="destructive">Expired</Badge>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Poll Options Preview */}
                <div className="space-y-2">
                    {poll.options.slice(0, 3).map((option) => (
                        <div key={option.id} className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground truncate flex-1">
                                {option.text}
                            </span>
                            <span className="text-xs text-muted-foreground ml-2">
                                {option.votes} votes
                            </span>
                        </div>
                    ))}
                    {poll.options.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                            +{poll.options.length - 3} more options
                        </p>
                    )}
                </div>

                {/* Poll Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{poll.totalVotes} votes</span>
                        </div>
                        {poll.allowMultipleVotes && (
                            <Badge variant="outline" className="text-xs">
                                Multiple votes
                            </Badge>
                        )}
                    </div>
                    {timeRemaining && !isExpired && (
                        <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Expires {timeRemaining}</span>
                        </div>
                    )}
                </div>

                {/* Author Info */}
                <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={poll.author.avatar} alt={poll.author.name} />
                            <AvatarFallback className="text-xs">
                                {poll.author.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">
                            {poll.author.name}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/polls/${poll.id}`}>
                                <BarChart3 className="h-4 w-4 mr-1" />
                                View
                            </Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
