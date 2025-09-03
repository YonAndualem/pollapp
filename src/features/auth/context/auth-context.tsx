"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type AuthContextValue = {
    user: User | null;
    loading: boolean;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string, options?: { name?: string }) => Promise<void>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const supabase = useMemo(() => createClient(), []);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const init = async () => {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (isMounted) setUser(session?.user ?? null);
            setLoading(false);
        };
        init();

        const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            isMounted = false;
            subscription.subscription?.unsubscribe();
        };
    }, [supabase]);

    const signInWithEmail = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
    };

    const signUpWithEmail = async (email: string, password: string, options?: { name?: string }) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: options?.name ? { name: options.name } : undefined,
                emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
            },
        });
        if (error) throw error;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    const value: AuthContextValue = { user, loading, signInWithEmail, signUpWithEmail, signOut };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}

export function Protected({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="py-12 text-center">Loading...</div>;
    if (!user) return <div className="py-12 text-center">You must be signed in to view this page.</div>;
    return <>{children}</>;
}


