import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

// GET /api/polls - list polls (public only for anonymous)
export async function GET() {
    const supabase = await createServerSupabase();

    const { data, error } = await supabase
        .from("poll_stats")
        .select("poll_id, title, author_id, is_public, allow_multiple_votes, expires_at, created_at, total_votes")
        .order("created_at", { ascending: false })
        .limit(50);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Fetch options preview for listed polls
    const pollIds = (data ?? []).map((p) => p.poll_id);
    let optionsByPoll: Record<string, { id: string; option_text: string; vote_count: number }[]> = {};
    if (pollIds.length > 0) {
        const { data: optionsData } = await supabase
            .from("poll_option_stats")
            .select("option_id, poll_id, option_text, vote_count")
            .in("poll_id", pollIds);
        for (const row of optionsData ?? []) {
            const list = optionsByPoll[row.poll_id] ?? [];
            list.push({ id: row.option_id, option_text: row.option_text, vote_count: Number(row.vote_count || 0) });
            optionsByPoll[row.poll_id] = list;
        }
    }

    const payload = (data ?? []).map((p) => ({
        id: p.poll_id,
        title: p.title,
        authorId: p.author_id,
        isPublic: p.is_public,
        allowMultipleVotes: p.allow_multiple_votes,
        expiresAt: p.expires_at,
        createdAt: p.created_at,
        totalVotes: Number(p.total_votes || 0),
        options: (optionsByPoll[p.poll_id] ?? []).slice(0, 5).map((o) => ({
            id: o.id,
            text: o.option_text,
            votes: o.vote_count,
        })),
    }));

    return NextResponse.json({ data: payload });
}

// POST /api/polls - create a poll
export async function POST(req: NextRequest) {
    const supabase = await createServerSupabase();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, description, options, isPublic, allowMultipleVotes, expiresAt } = body as {
        title: string;
        description?: string;
        options: string[];
        isPublic: boolean;
        allowMultipleVotes: boolean;
        expiresAt?: string | null;
    };

    if (!title || !Array.isArray(options) || options.length < 2) {
        return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { data: pollInsert, error: pollErr } = await supabase
        .from("polls")
        .insert({
            author_id: user.id,
            title,
            description,
            is_public: isPublic,
            allow_multiple_votes: allowMultipleVotes,
            expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        })
        .select("id")
        .single();

    if (pollErr || !pollInsert) return NextResponse.json({ error: pollErr?.message || "Create failed" }, { status: 500 });

    const pollId = pollInsert.id as string;
    const optionRows = options.map((text: string, idx: number) => ({ poll_id: pollId, option_text: text, position: idx }));
    const { error: optErr } = await supabase.from("poll_options").insert(optionRows);
    if (optErr) return NextResponse.json({ error: optErr.message }, { status: 500 });

    return NextResponse.json({ data: { id: pollId } }, { status: 201 });
}


