import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { revalidatePublicSite } from "@/lib/revalidate-public";
import { createAdminClient } from "@/lib/supabase/server";
import { ensureAvatarsBucket } from "@/lib/supabase/setup";

export async function POST(request: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    await ensureAvatarsBucket();

    const supabase = createAdminClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `avatar-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, buffer, {
        upsert: true,
        contentType: file.type || "image/jpeg",
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(fileName);

    const { data, error } = await supabase
      .from("profile")
      .update({ photo_url: publicUrl })
      .eq("id", 1)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePublicSite();
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to upload photo";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
