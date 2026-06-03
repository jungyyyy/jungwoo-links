import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("links")
    .select("*")
    .order("order_index", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (!body.title || !body.url) {
    return NextResponse.json(
      { error: "Title and URL are required" },
      { status: 400 }
    );
  }

  if (!body.url.startsWith("http")) {
    return NextResponse.json(
      { error: "URL must start with http" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data: maxOrder } = await supabase
    .from("links")
    .select("order_index")
    .order("order_index", { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (maxOrder?.order_index ?? -1) + 1;

  const { data, error } = await supabase
    .from("links")
    .insert({
      emoji: body.emoji || "🔗",
      title: body.title,
      url: body.url,
      description: body.description || null,
      section_id: body.section_id || null,
      is_active: body.is_active ?? true,
      order_index: nextOrder,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (body.reorder) {
    const supabase = createAdminClient();
    const updates = body.items as { id: string; order_index: number }[];

    for (const item of updates) {
      const { error } = await supabase
        .from("links")
        .update({ order_index: item.order_index })
        .eq("id", item.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  }

  if (!body.id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  if (body.url && !body.url.startsWith("http")) {
    return NextResponse.json(
      { error: "URL must start with http" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const updateData: Record<string, unknown> = {};

  if (body.emoji !== undefined) updateData.emoji = body.emoji;
  if (body.title !== undefined) updateData.title = body.title;
  if (body.url !== undefined) updateData.url = body.url;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.section_id !== undefined) updateData.section_id = body.section_id;
  if (body.is_active !== undefined) updateData.is_active = body.is_active;

  const { data, error } = await supabase
    .from("links")
    .update(updateData)
    .eq("id", body.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("links").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
