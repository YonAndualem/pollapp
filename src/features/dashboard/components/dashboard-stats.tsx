"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BarChart3, Clock, TrendingUp } from "lucide-react";

interface DashboardStatsProps {
    totalPolls: number;
    totalVotes: number;
    activePolls: number;
    totalViews: number;
}

export function DashboardStats({
    totalPolls,
    totalVotes,
    activePolls,
    totalViews
}: DashboardStatsProps) {
    const stats = [
        {
            title: "Total Polls",
            value: totalPolls,
            description: "Polls you've created",
            icon: BarChart3,
            color: "text-blue-600",
            bgColor: "bg-blue-50 dark:bg-blue-950",
        },
        {
            title: "Total Votes",
            value: totalVotes,
            description: "Votes across all polls",
            icon: Users,
            color: "text-green-600",
            bgColor: "bg-green-50 dark:bg-green-950",
        },
        {
            title: "Active Polls",
            value: activePolls,
            description: "Currently running",
            icon: Clock,
            color: "text-orange-600",
            bgColor: "bg-orange-50 dark:bg-orange-950",
        },
        {
            title: "Total Views",
            value: totalViews,
            description: "Poll page views",
            icon: TrendingUp,
            color: "text-purple-600",
            bgColor: "bg-purple-50 dark:bg-purple-950",
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                <Icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
