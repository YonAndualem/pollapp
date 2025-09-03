"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Protected, useAuth } from "@/features/auth/context/auth-context";
import { toast } from "sonner";

export default function SettingsPage() {
    const { refreshProfile } = useAuth();
    const [name, setName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const res = await fetch("/api/profile", { cache: "no-store" });
            const j = await res.json();
            if (res.ok) {
                setName(j.data?.name || "");
                setAvatarUrl(j.data?.avatarUrl || "");
            }
            setLoading(false);
        };
        load();
    }, []);

    const save = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, avatarUrl }),
            });
            const j = await res.json();
            if (!res.ok) throw new Error(j.error || "Failed to update profile");
            toast.success("Profile updated", { duration: 5000 });
            await refreshProfile();
        } catch (e: any) {
            toast.error(e.message, { duration: 5000 });
        } finally {
            setSaving(false);
        }
    };

    const onSelectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/profile/upload", { method: "POST", body: fd });
        const j = await res.json();
        if (!res.ok) {
            toast.error(j.error || "Failed to upload avatar", { duration: 5000 });
            return;
        }
        setAvatarUrl(j.data?.url || "");
        toast.success("Avatar uploaded", { duration: 5000 });
    };

    return (
        <Protected>
            <div className="max-w-xl mx-auto py-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Settings</CardTitle>
                        <CardDescription>Update your profile information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={loading || saving} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="avatar">Avatar</Label>
                            <Input id="avatar" type="file" accept="image/*" onChange={onSelectFile} disabled={loading || saving} />
                            {avatarUrl && (
                                <div className="text-sm text-muted-foreground truncate">{avatarUrl}</div>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={save} disabled={saving}>
                                Save Changes
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Protected>
    );
}


