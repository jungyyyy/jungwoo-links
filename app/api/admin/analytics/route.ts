import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: links, error: linksError } = await supabase
    .from("links")
    .select("id, title")
    .order("title");

  if (linksError) {
    return NextResponse.json({ error: linksError.message }, { status: 500 });
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const analytics = await Promise.all(
    (links || []).map(async (link) => {
      const { count: totalClicks } = await supabase
        .from("link_clicks")
        .select("*", { count: "exact", head: true })
        .eq("link_id", link.id);

      const { count: recentClicks } = await supabase
        .from("link_clicks")
        .select("*", { count: "exact", head: true })
        .eq("link_id", link.id)
        .gte("clicked_at", sevenDaysAgo.toISOString());

      return {
        id: link.id,
        title: link.title,
        total_clicks: totalClicks ?? 0,
        clicks_last_7_days: recentClicks ?? 0,
      };
    })
  );

  analytics.sort((a, b) => b.total_clicks - a.total_clicks);

  const mostClickedThisWeek = [...analytics].sort(
    (a, b) => b.clicks_last_7_days - a.clicks_last_7_days
  )[0];

  return NextResponse.json({
    rows: analytics,
    mostClickedThisWeek:
      mostClickedThisWeek && mostClickedThisWeek.clicks_last_7_days > 0
        ? mostClickedThisWeek
        : null,
  });
}
