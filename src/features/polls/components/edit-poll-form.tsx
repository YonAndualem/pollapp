"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, FieldValues } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Loader2, Calendar, Users, Lock, Unlock, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface EditPollFormData extends FieldValues {
    title: string;
    description?: string;
    options: string[];
    isPublic: string;
    allowMultipleVotes: string;
    expiresAt?: Date;
}

interface EditPollFormProps {
    pollId: string;
    onCancel: () => void;
}

export function EditPollForm({ pollId, onCancel }: EditPollFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingPoll, setIsLoadingPoll] = useState(true);
    const router = useRouter();

    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<EditPollFormData>({
        defaultValues: {
            title: "",
            description: "",
            options: ["", ""],
            isPublic: "true",
            allowMultipleVotes: "false",
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "options",
    });

    const watchedOptions = watch("options");
    const isPublic = watch("isPublic") === "true";
    const allowMultipleVotes = watch("allowMultipleVotes") === "true";

    // Load poll data
    useEffect(() => {
        const loadPoll = async () => {
            setIsLoadingPoll(true);
            try {
                const res = await fetch(`/api/polls/${pollId}`, { cache: "no-store" });
                const j = await res.json();
                if (!res.ok) throw new Error(j.error || "Failed to load poll");

                const poll = j.data;
                setValue("title", poll.title);
                setValue("description", poll.description || "");
                setValue("isPublic", poll.isPublic ? "true" : "false");
                setValue("allowMultipleVotes", poll.allowMultipleVotes ? "true" : "false");
                setValue("options", poll.options.map((o: any) => o.text));

                if (poll.expiresAt) {
                    const date = new Date(poll.expiresAt);
                    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                    setValue("expiresAt", localDate);
                }
            } catch (error) {
                toast.error("Failed to load poll data", { duration: 5000 });
                onCancel();
            } finally {
                setIsLoadingPoll(false);
            }
        };

        loadPoll();
    }, [pollId, setValue, onCancel]);

    const onSubmit = async (data: EditPollFormData) => {
        setIsLoading(true);
        try {
            // Basic validation
            if (!data.title.trim()) {
                toast.error("Title is required", { duration: 5000 });
                return;
            }

            const validOptions = data.options.filter(Boolean);
            if (validOptions.length < 2) {
                toast.error("At least 2 options are required", { duration: 5000 });
                return;
            }

            const res = await fetch(`/api/polls/${pollId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: data.title,
                    description: data.description || null,
                    options: validOptions,
                    isPublic: data.isPublic === "true",
                    allowMultipleVotes: data.allowMultipleVotes === "true",
                    expiresAt: data.expiresAt ? data.expiresAt.toISOString() : null,
                }),
            });
            if (!res.ok) {
                const text = await res.text();
                const j = (() => { try { return JSON.parse(text); } catch { return {}; } })();
                const serverMsg = j.error || text || "Failed to update poll";
                throw new Error(`${res.status} ${res.statusText}: ${serverMsg}`);
            }

            toast.success("Poll updated successfully", { duration: 5000 });
            onCancel(); // Close edit mode
        } catch (error) {
            console.error("Update poll error:", error);
            toast.error(error instanceof Error ? error.message : "Failed to update poll", { duration: 5000 });
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

    if (isLoadingPoll) {
        return (
            <div className="py-12 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Edit Poll</CardTitle>
                    <CardDescription>
                        Update your poll details and options
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Poll Title *</Label>
                            <Input
                                id="title"
                                placeholder="What's your poll about?"
                                {...register("title")}
                                disabled={isLoading}
                            />
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
                            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
