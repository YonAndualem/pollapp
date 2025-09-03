import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

// GET /api/polls/[id] - get poll with options and counts
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
    const supabase = createServerSupabase();
    const pollId = params.id;

    const { data: poll, error } = await supabase
        .from("polls")
        .select("id, title, description, author_id, is_public, allow_multiple_votes, expires_at, created_at")
        .eq("id", pollId)
        .single();
    if (error || !poll) return NextResponse.json({ error: error?.message || "Not found" }, { status: 404 });

    const { data: options } = await supabase
        .from("poll_option_stats")
        .select("option_id, option_text, vote_count")
        .eq("poll_id", pollId);

    return NextResponse.json({
        data: {
            id: poll.id,
            title: poll.title,
            description: poll.description,
            authorId: poll.author_id,
            isPublic: poll.is_public,
            allowMultipleVotes: poll.allow_multiple_votes,
            expiresAt: poll.expires_at,
            createdAt: poll.created_at,
            options: (options ?? []).map((o) => ({ id: o.option_id, text: o.option_text, votes: Number(o.vote_count || 0) })),
        },
    });
}

// POST /api/polls/[id]/vote - cast a vote
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const supabase = createServerSupabase();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const pollId = params.id;
    const body = await req.json();
    const { optionIds } = (body ?? {}) as { optionIds: string[] };

    if (!Array.isArray(optionIds) || optionIds.length < 1) {
        return NextResponse.json({ error: "No options selected" }, { status: 400 });
    }

    // Insert votes; RLS + triggers enforce rules
    const rows = optionIds.map((option_id) => ({ poll_id: pollId, option_id, voter_id: user.id }));
    const { error } = await supabase.from("votes").insert(rows);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ data: { ok: true } }, { status: 201 });
}

// PATCH /api/polls/[id] - update poll (title, description, visibility, allow_multiple_votes, expires_at) and options
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const supabase = createServerSupabase();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const pollId = params.id;
    const body = await req.json();
    const { title, description, isPublic, allowMultipleVotes, expiresAt, options } = body as any;

    // Verify ownership
    const { data: poll } = await supabase.from("polls").select("author_id").eq("id", pollId).single();
    if (!poll || poll.author_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (isPublic !== undefined) updates.is_public = !!isPublic;
    if (allowMultipleVotes !== undefined) updates.allow_multiple_votes = !!allowMultipleVotes;
    if (expiresAt !== undefined) updates.expires_at = expiresAt ? new Date(expiresAt).toISOString() : null;

    if (Object.keys(updates).length > 0) {
        const { error } = await supabase.from("polls").update(updates).eq("id", pollId);
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (Array.isArray(options)) {
        // naive approach: delete and reinsert options
        await supabase.from("poll_options").delete().eq("poll_id", pollId);
        const rows = options.map((text: string, idx: number) => ({ poll_id: pollId, option_text: text, position: idx }));
        const { error } = await supabase.from("poll_options").insert(rows);
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: { ok: true } });
}

// DELETE /api/polls/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
    const supabase = createServerSupabase();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const pollId = params.id;
    // Verify ownership
    const { data: poll } = await supabase.from("polls").select("author_id").eq("id", pollId).single();
    if (!poll || poll.author_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { error } = await supabase.from("polls").delete().eq("id", pollId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data: { ok: true } });
}


