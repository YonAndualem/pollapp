import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

// DELETE /api/polls/[id]/vote - delete user's vote on a poll
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
    const supabase = await createServerSupabase();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const pollId = params.id;

    // Delete all votes by this user for this poll
    const { error } = await supabase
        .from("votes")
        .delete()
        .eq("poll_id", pollId)
        .eq("voter_id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ data: { ok: true } });
}
