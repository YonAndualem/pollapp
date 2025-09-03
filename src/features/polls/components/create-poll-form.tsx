"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createPollSchema, type CreatePollForm } from "@/lib/validations/polls";
import { Plus, X, Loader2, Calendar, Users, Lock, Unlock } from "lucide-react";
import { format } from "date-fns";

export function CreatePollForm() {
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<CreatePollForm>({
        resolver: zodResolver(createPollSchema),
        defaultValues: {
            title: "",
            description: "",
            options: ["", ""],
            isPublic: true,
            allowMultipleVotes: false,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "options",
    });

    const watchedOptions = watch("options");
    const isPublic = watch("isPublic");
    const allowMultipleVotes = watch("allowMultipleVotes");

    const onSubmit = async (data: CreatePollForm) => {
        setIsLoading(true);
        try {
            // TODO: Implement poll creation logic
            console.log("Create poll data:", data);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        } catch (error) {
            console.error("Create poll error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const addOption = () => {
        if (fields.length < 10) {
            append("");
        }
    };

    const removeOption = (index: number) => {
        if (fields.length > 2) {
            remove(index);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Poll</CardTitle>
                    <CardDescription>
                        Create a poll to gather opinions from your community
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Poll Title *</Label>
                            <Input
                                id="title"
                                placeholder="What's your poll about?"
                                {...register("title")}
                                disabled={isLoading}
                            />
                            {errors.title && (
                                <p className="text-sm text-destructive">{errors.title.message}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                placeholder="Provide more context about your poll..."
                                rows={3}
                                {...register("description")}
                                disabled={isLoading}
                            />
                            {errors.description && (
                                <p className="text-sm text-destructive">{errors.description.message}</p>
                            )}
                        </div>

                        {/* Options */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Poll Options *</Label>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-muted-foreground">
                                        {fields.length}/10 options
                                    </span>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addOption}
                                        disabled={fields.length >= 10 || isLoading}
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Option
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex items-center space-x-2">
                                        <div className="flex-1">
                                            <Input
                                                placeholder={`Option ${index + 1}`}
                                                {...register(`options.${index}` as const)}
                                                disabled={isLoading}
                                            />
                                            {errors.options?.[index] && (
                                                <p className="text-sm text-destructive mt-1">
                                                    {errors.options[index]?.message}
                                                </p>
                                            )}
                                        </div>
                                        {fields.length > 2 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeOption(index)}
                                                disabled={isLoading}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {errors.options && (
                                <p className="text-sm text-destructive">{errors.options.message}</p>
                            )}
                        </div>

                        {/* Settings */}
                        <div className="space-y-4">
                            <Label>Poll Settings</Label>

                            <div className="grid gap-4 md:grid-cols-2">
                                {/* Visibility */}
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        {isPublic ? (
                                            <Unlock className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <Lock className="h-4 w-4 text-orange-600" />
                                        )}
                                        <span className="text-sm font-medium">Visibility</span>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                value="true"
                                                {...register("isPublic")}
                                                disabled={isLoading}
                                                className="rounded"
                                            />
                                            <div className="flex items-center space-x-2">
                                                <Unlock className="h-4 w-4" />
                                                <span className="text-sm">Public</span>
                                                <Badge variant="secondary" className="text-xs">
                                                    Anyone can find and vote
                                                </Badge>
                                            </div>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                value="false"
                                                {...register("isPublic")}
                                                disabled={isLoading}
                                                className="rounded"
                                            />
                                            <div className="flex items-center space-x-2">
                                                <Lock className="h-4 w-4" />
                                                <span className="text-sm">Private</span>
                                                <Badge variant="secondary" className="text-xs">
                                                    Only with link
                                                </Badge>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Voting */}
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <Users className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-medium">Voting</span>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                value="false"
                                                {...register("allowMultipleVotes")}
                                                disabled={isLoading}
                                                className="rounded"
                                            />
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm">Single vote</span>
                                                <Badge variant="secondary" className="text-xs">
                                                    One option only
                                                </Badge>
                                            </div>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                value="true"
                                                {...register("allowMultipleVotes")}
                                                disabled={isLoading}
                                                className="rounded"
                                            />
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm">Multiple votes</span>
                                                <Badge variant="secondary" className="text-xs">
                                                    Vote for many
                                                </Badge>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Expiration */}
                        <div className="space-y-2">
                            <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="expiresAt"
                                    type="datetime-local"
                                    {...register("expiresAt", {
                                        setValueAs: (value) => value ? new Date(value) : undefined,
                                    })}
                                    disabled={isLoading}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Leave empty for no expiration
                            </p>
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end space-x-4 pt-4">
                            <Button type="button" variant="outline" disabled={isLoading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Poll
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
