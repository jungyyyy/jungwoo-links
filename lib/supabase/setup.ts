import type { Profile } from "@/lib/types";
import { createAdminClient } from "./server";

export const DEFAULT_PROFILE: Profile = {
  id: 1,
  name: "Jungwoo Lee",
  bio: "Welcome to my links",
  photo_url: "",
  theme: "dark",
  social_tiktok: "",
  social_instagram: "",
  social_linkedin: "",
  social_youtube: "",
  social_twitter: "",
};

export async function ensureProfile(): Promise<Profile> {
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("profile")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (existing) {
    return existing as Profile;
  }

  const { data: created, error } = await supabase
    .from("profile")
    .insert(DEFAULT_PROFILE)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return created as Profile;
}

export async function ensureAvatarsBucket(): Promise<void> {
  const supabase = createAdminClient();

  const { data: buckets, error: listError } =
    await supabase.storage.listBuckets();

  if (listError) {
    throw new Error(listError.message);
  }

  if (buckets?.some((bucket) => bucket.name === "avatars")) {
    return;
  }

  const { error: createError } = await supabase.storage.createBucket("avatars", {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
  });

  if (createError && !createError.message.includes("already exists")) {
    throw new Error(createError.message);
  }
}
