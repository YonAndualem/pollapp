import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    const supabase = createServerSupabase();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const filePath = `${user.id}/${Date.now()}-${file.name}`;

    const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "avatars";
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, new Uint8Array(arrayBuffer), {
        contentType: file.type || "application/octet-stream",
        upsert: false,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return NextResponse.json({ data: { url: pub.publicUrl } });
}


