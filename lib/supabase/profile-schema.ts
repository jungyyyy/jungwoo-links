import type { SupabaseClient } from "@supabase/supabase-js";
import { SOCIAL_DEFAULTS } from "@/lib/social-defaults";
import type { Profile } from "@/lib/types";

export const ADD_SOCIAL_EMAIL_SQL = `ALTER TABLE profile ADD COLUMN IF NOT EXISTS social_email TEXT NOT NULL DEFAULT '';`;

export async function profileHasSocialEmailColumn(
  supabase: SupabaseClient
): Promise<boolean> {
  const { error } = await supabase
    .from("profile")
    .select("social_email")
    .eq("id", 1)
    .limit(1);

  if (!error) return true;
  const message = error.message.toLowerCase();
  return !message.includes("social_email");
}

export async function ensureSocialEmailColumn(): Promise<boolean> {
  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!dbUrl) return false;

  try {
    const postgres = (await import("postgres")).default;
    const sql = postgres(dbUrl, {
      ssl: "require",
      prepare: false,
      max: 1,
    });

    await sql.unsafe(ADD_SOCIAL_EMAIL_SQL);
    await sql.end({ timeout: 5 });
    return true;
  } catch {
    return false;
  }
}

export function normalizeProfile(
  profile: Profile,
  hasSocialEmailColumn: boolean
): Profile {
  return {
    ...profile,
    social_email: hasSocialEmailColumn
      ? (profile.social_email ?? "")
      : profile.social_email || SOCIAL_DEFAULTS.social_email,
  };
}

export function buildProfileUpsertRow(
  body: Profile,
  hasSocialEmailColumn: boolean
): Record<string, unknown> {
  const row: Record<string, unknown> = {
    id: 1,
    name: body.name,
    bio: body.bio,
    photo_url: body.photo_url,
    theme: body.theme,
    social_tiktok: body.social_tiktok,
    social_instagram: body.social_instagram,
    social_linkedin: body.social_linkedin,
    social_youtube: body.social_youtube,
    social_twitter: body.social_twitter,
  };

  if (hasSocialEmailColumn) {
    row.social_email = body.social_email ?? "";
  }

  return row;
}
