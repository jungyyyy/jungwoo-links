import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("sections")
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

  if (!body.name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: maxOrder } = await supabase
    .from("sections")
    .select("order_index")
    .order("order_index", { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (maxOrder?.order_index ?? -1) + 1;

  const { data, error } = await supabase
    .from("sections")
    .insert({ name: body.name, order_index: nextOrder })
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
        .from("sections")
        .update({ order_index: item.order_index })
        .eq("id", item.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  }

  if (!body.id || !body.name) {
    return NextResponse.json(
      { error: "ID and name are required" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("sections")
    .update({ name: body.name })
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

  await supabase
    .from("links")
    .update({ section_id: null })
    .eq("section_id", id);

  const { error } = await supabase.from("sections").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
