"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Lock, Unlock, Edit3, RotateCcw } from "lucide-react";
import { EditPollForm } from "@/features/polls/components/edit-poll-form";
import { useAuth } from "@/features/auth/context/auth-context";
import { toast } from "sonner";

type Option = { id: string; text: string; votes: number };

export default function PollDetailPage() {
    const params = useParams<{ id: string }>();
    const searchParams = useSearchParams();
    const pollId = params.id;
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deletingVote, setDeletingVote] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState<string | undefined>(undefined);
    const [allowMultiple, setAllowMultiple] = useState(false);
    const [isPublic, setIsPublic] = useState(true);
    const [authorId, setAuthorId] = useState<string | null>(null);
    const [expiresAt, setExpiresAt] = useState<string | undefined>(undefined);
    const [options, setOptions] = useState<Option[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [userHasVoted, setUserHasVoted] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    // Check if edit mode is requested via URL parameter
    useEffect(() => {
        const editParam = searchParams.get('edit');
        if (editParam === '1') {
            setIsEditMode(true);
        }
    }, [searchParams]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const res = await fetch(`/api/polls/${pollId}`, { cache: "no-store" });
            const j = await res.json();
            if (!res.ok) {
                setError(j.error || "Failed to load poll");
                setLoading(false);
                return;
            }
            const p = j.data;
            setTitle(p.title);
            setDescription(p.description);
            setAllowMultiple(Boolean(p.allowMultipleVotes));
            setIsPublic(Boolean(p.isPublic));
            setAuthorId(p.authorId);
            setExpiresAt(p.expiresAt || undefined);
            setOptions((p.options ?? []).map((o: any) => ({ id: o.id, text: o.text, votes: Number(o.votes || 0) })));

            // Check if user has already voted
            if (user) {
                try {
                    const votesRes = await fetch(`/api/polls/${pollId}/votes`, { cache: "no-store" });
                    if (votesRes.ok) {
                        const votesData = await votesRes.json();
                        setUserHasVoted(votesData.data && votesData.data.length > 0);
                    }
                } catch (e) {
                    // Ignore error - voting check is not critical
                }
            }

            setLoading(false);
        };
        load();
    }, [pollId, user]);

    const toggleSelect = (id: string) => {
        setSelected((cur) => {
            if (allowMultiple) {
                return cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
            }
            return cur.includes(id) ? [] : [id];
        });
    };

    const submitVote = async () => {
        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch(`/api/polls/${pollId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ optionIds: selected }),
            });
            const j = await res.json();
            if (!res.ok) throw new Error(j.error || "Failed to vote");

            toast.success("Vote submitted successfully!", { duration: 5000 });
            setUserHasVoted(true);

            // Refresh poll data
            const r = await fetch(`/api/polls/${pollId}`, { cache: "no-store" });
            const jj = await r.json();
            const p = jj.data;
            setOptions((p.options ?? []).map((o: any) => ({ id: o.id, text: o.text, votes: Number(o.votes || 0) })));
            setSelected([]);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSubmitting(false);
        }
    };

    const deleteVote = async () => {
        setDeletingVote(true);
        setError(null);
        try {
            const res = await fetch(`/api/polls/${pollId}/vote`, {
                method: "DELETE",
            });
            const j = await res.json();
            if (!res.ok) throw new Error(j.error || "Failed to delete vote");

            toast.success("Vote deleted successfully! You can vote again.", { duration: 5000 });
            setUserHasVoted(false);

            // Refresh poll data
            const r = await fetch(`/api/polls/${pollId}`, { cache: "no-store" });
            const jj = await r.json();
            const p = jj.data;
            setOptions((p.options ?? []).map((o: any) => ({ id: o.id, text: o.text, votes: Number(o.votes || 0) })));
        } catch (e: any) {
            setError(e.message);
            toast.error(e.message, { duration: 5000 });
        } finally {
            setDeletingVote(false);
        }
    };

    // Calculate total votes for percentage calculation
    const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);

    const isOwner = user && authorId === user.id;

    if (loading) {
        return (
            <div className="py-12 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
        );
    }

    // Show edit form if in edit mode and user is the owner
    if (isEditMode && isOwner) {
        return <EditPollForm pollId={pollId} onCancel={() => setIsEditMode(false)} />;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>{title}</CardTitle>
                            {description && (
                                <CardDescription>{description}</CardDescription>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="flex items-center gap-1">
                                {allowMultiple ? "Multiple votes" : "Single vote"}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                                {isPublic ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                                {isPublic ? "Public" : "Private"}
                            </Badge>
                            {expiresAt && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Expires {new Date(expiresAt).toLocaleString()}
                                </Badge>
                            )}
                        </div>
                    </div>
                    {isOwner && (
                        <div className="flex justify-end pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditMode(true)}
                            >
                                <Edit3 className="h-4 w-4 mr-2" />
                                Edit Poll
                            </Button>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                            {error}
                        </div>
                    )}

                    <div className="space-y-3">
                        {options.map((opt) => {
                            const percentage = totalVotes > 0 ? (opt.votes / totalVotes) * 100 : 0;
                            const isSelected = selected.includes(opt.id);

                            return (
                                <div key={opt.id} className="relative">
                                    <button
                                        onClick={() => !userHasVoted && toggleSelect(opt.id)}
                                        disabled={userHasVoted}
                                        className={`w-full text-left px-4 py-4 rounded-lg border transition-all relative overflow-hidden ${userHasVoted
                                                ? "cursor-default"
                                                : isSelected
                                                    ? "border-primary bg-primary/10 hover:bg-primary/15"
                                                    : "border-border hover:bg-muted hover:border-muted-foreground/30"
                                            }`}
                                    >
                                        {/* Vote percentage background bar */}
                                        <div
                                            className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 transition-all duration-500 ease-out"
                                            style={{ width: `${percentage}%` }}
                                        />

                                        {/* Content */}
                                        <div className="relative flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <span className="font-medium">{opt.text}</span>
                                                {userHasVoted && (
                                                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                                        {percentage.toFixed(1)}%
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-muted-foreground text-sm font-medium">
                                                    {opt.votes} {opt.votes === 1 ? 'vote' : 'votes'}
                                                </span>
                                                {isSelected && !userHasVoted && (
                                                    <div className="w-3 h-3 rounded-full bg-primary" />
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Total votes display */}
                    {totalVotes > 0 && (
                        <div className="text-center text-sm text-muted-foreground pt-2 border-t">
                            Total votes: {totalVotes}
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex justify-end gap-2 pt-4">
                        {userHasVoted ? (
                            <Button
                                variant="outline"
                                onClick={deleteVote}
                                disabled={deletingVote}
                            >
                                {deletingVote && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Change Vote
                            </Button>
                        ) : (
                            <Button
                                onClick={submitVote}
                                disabled={selected.length === 0 || submitting}
                            >
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Vote{selected.length > 1 ? 's' : ''}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


