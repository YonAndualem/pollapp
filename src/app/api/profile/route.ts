import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET() {
    const supabase = createServerSupabase();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, created_at")
        .eq("id", user.id)
        .single();

    return NextResponse.json({ data: { id: user.id, email: user.email, name: profile?.name, avatarUrl: profile?.avatar_url } });
}

export async function PUT(req: NextRequest) {
    const supabase = createServerSupabase();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, avatarUrl } = body as { name?: string; avatarUrl?: string };

    // upsert profile
    const { error: upsertErr } = await supabase.from("profiles").upsert({
        id: user.id,
        name: name ?? null,
        avatar_url: avatarUrl ?? null,
    });
    if (upsertErr) return NextResponse.json({ error: upsertErr.message }, { status: 400 });

    // update auth metadata (optional)
    if (name) {
        await supabase.auth.updateUser({ data: { name } });
    }

    return NextResponse.json({ data: { ok: true } });
}


