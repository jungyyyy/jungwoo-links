import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  const { linkId } = params;
  const supabase = createAdminClient();

  const { data: link, error: linkError } = await supabase
    .from("links")
    .select("url, is_active")
    .eq("id", linkId)
    .single();

  if (linkError || !link || !link.is_active) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const userAgent = request.headers.get("user-agent");

  await supabase.from("link_clicks").insert({
    link_id: linkId,
    user_agent: userAgent,
  });

  return NextResponse.redirect(link.url);
}
