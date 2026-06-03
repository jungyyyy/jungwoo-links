import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { revalidatePublicSite } from "@/lib/revalidate-public";
import { createAdminClient } from "@/lib/supabase/server";
import {
  ADD_SOCIAL_EMAIL_SQL,
  buildProfileUpsertRow,
  ensureSocialEmailColumn,
  normalizeProfile,
  profileHasSocialEmailColumn,
} from "@/lib/supabase/profile-schema";
import { ensureProfile } from "@/lib/supabase/setup";
import type { Profile } from "@/lib/types";

export async function GET() {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    await ensureSocialEmailColumn();
    const hasSocialEmailColumn = await profileHasSocialEmailColumn(supabase);
    const profile = await ensureProfile();

    return NextResponse.json({
      ...normalizeProfile(profile, hasSocialEmailColumn),
      _schema: { hasSocialEmailColumn },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Profile;
    const supabase = createAdminClient();

    await ensureSocialEmailColumn();
    let hasSocialEmailColumn = await profileHasSocialEmailColumn(supabase);

    let row = buildProfileUpsertRow(body, hasSocialEmailColumn);

    let { data, error } = await supabase
      .from("profile")
      .upsert(row, { onConflict: "id" })
      .select()
      .single();

    if (error?.message.includes("social_email")) {
      hasSocialEmailColumn = false;
      row = buildProfileUpsertRow(body, false);
      ({ data, error } = await supabase
        .from("profile")
        .upsert(row, { onConflict: "id" })
        .select()
        .single());
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const profile = normalizeProfile(data as Profile, hasSocialEmailColumn);

    revalidatePublicSite();

    if (!hasSocialEmailColumn) {
      return NextResponse.json({
        ...profile,
        _schema: { hasSocialEmailColumn: false },
        _warning:
          "Profile saved, but email could not be stored. Add the social_email column in Supabase (SQL below) and save again.",
        _migrationSql: ADD_SOCIAL_EMAIL_SQL,
      });
    }

    return NextResponse.json({
      ...profile,
      _schema: { hasSocialEmailColumn: true },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
