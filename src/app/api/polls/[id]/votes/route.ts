import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

// GET /api/polls/[id]/votes - get user's votes on this poll
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
    const supabase = createServerSupabase();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const pollId = params.id;

    // Get all votes by this user for this poll
    const { data: votes, error } = await supabase
        .from("votes")
        .select("id, option_id, created_at")
        .eq("poll_id", pollId)
        .eq("voter_id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ data: votes });
}
