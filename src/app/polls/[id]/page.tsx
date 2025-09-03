"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Lock, Unlock } from "lucide-react";

type Option = { id: string; text: string; votes: number };

export default function PollDetailPage() {
    const params = useParams<{ id: string }>();
    const pollId = params.id;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState<string | undefined>(undefined);
    const [allowMultiple, setAllowMultiple] = useState(false);
    const [isPublic, setIsPublic] = useState(true);
    const [expiresAt, setExpiresAt] = useState<string | undefined>(undefined);
    const [options, setOptions] = useState<Option[]>([]);
    const [selected, setSelected] = useState<string[]>([]);

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
            setExpiresAt(p.expiresAt || undefined);
            setOptions((p.options ?? []).map((o: any) => ({ id: o.id, text: o.text, votes: Number(o.votes || 0) })));
            setLoading(false);
        };
        load();
    }, [pollId]);

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
            // Refresh
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

    if (loading) {
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
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="text-sm text-destructive">{error}</div>
                    )}
                    <div className="space-y-2">
                        {options.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => toggleSelect(opt.id)}
                                className={`w-full text-left px-4 py-3 rounded-md border transition ${selected.includes(opt.id)
                                        ? "border-primary bg-primary/10"
                                        : "border-border hover:bg-muted"
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span>{opt.text}</span>
                                    <span className="text-muted-foreground text-sm">{opt.votes} votes</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button onClick={submitVote} disabled={selected.length === 0 || submitting}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Vote
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


