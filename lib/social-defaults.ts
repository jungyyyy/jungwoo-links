import type { Profile } from "@/lib/types";

export const SOCIAL_DEFAULTS: Pick<
  Profile,
  | "social_tiktok"
  | "social_youtube"
  | "social_instagram"
  | "social_linkedin"
  | "social_email"
> = {
  social_tiktok: "https://www.tiktok.com/@growjungwoo",
  social_youtube: "https://www.youtube.com/@growjungwoo",
  social_instagram: "https://www.instagram.com/growjungwoo",
  social_linkedin: "https://www.linkedin.com/in/jung-woo-lee-9131901a8/",
  social_email: "jungwoolee6973@gmail.com",
};

export function applySocialDefaults(profile: Profile): Profile {
  return {
    ...profile,
    social_tiktok: profile.social_tiktok || SOCIAL_DEFAULTS.social_tiktok,
    social_youtube: profile.social_youtube || SOCIAL_DEFAULTS.social_youtube,
    social_instagram: profile.social_instagram || SOCIAL_DEFAULTS.social_instagram,
    social_linkedin: profile.social_linkedin || SOCIAL_DEFAULTS.social_linkedin,
    social_email: profile.social_email || SOCIAL_DEFAULTS.social_email,
  };
}
