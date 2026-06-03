export type Profile = {
  id: number;
  name: string;
  bio: string;
  photo_url: string;
  theme: "dark" | "light";
  social_tiktok: string;
  social_instagram: string;
  social_linkedin: string;
  social_youtube: string;
  social_twitter: string;
  social_email: string;
};

export type Section = {
  id: string;
  name: string;
  order_index: number;
};

export type Link = {
  id: string;
  section_id: string | null;
  emoji: string;
  title: string;
  url: string;
  description: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
};

export type LinkClick = {
  id: string;
  link_id: string;
  clicked_at: string;
  user_agent: string | null;
};

export type AnalyticsRow = {
  id: string;
  title: string;
  total_clicks: number;
  clicks_last_7_days: number;
};

export type SocialPlatform =
  | "tiktok"
  | "instagram"
  | "linkedin"
  | "youtube"
  | "twitter"
  | "email";

export const SOCIAL_PLATFORMS: {
  key: keyof Pick<
    Profile,
    | "social_tiktok"
    | "social_instagram"
    | "social_linkedin"
    | "social_youtube"
    | "social_twitter"
    | "social_email"
  >;
  label: string;
  icon: string;
  inputType?: "url" | "email";
}[] = [
  { key: "social_tiktok", label: "TikTok", icon: "tiktok" },
  { key: "social_youtube", label: "YouTube", icon: "youtube" },
  { key: "social_instagram", label: "Instagram", icon: "instagram" },
  { key: "social_linkedin", label: "LinkedIn", icon: "linkedin" },
  { key: "social_email", label: "Email", icon: "email", inputType: "email" },
  { key: "social_twitter", label: "Twitter/X", icon: "twitter" },
];
