import { PublicPage } from "@/components/PublicPage";
import { applySocialDefaults } from "@/lib/social-defaults";
import { createAdminClient } from "@/lib/supabase/server";
import { DEFAULT_PROFILE } from "@/lib/supabase/setup";
import type { Link, Profile, Section } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getPageData(): Promise<{
  profile: Profile;
  sections: Section[];
  links: Link[];
}> {
  const supabase = createAdminClient();

  const [profileRes, sectionsRes, linksRes] = await Promise.all([
    supabase.from("profile").select("*").eq("id", 1).maybeSingle(),
    supabase.from("sections").select("*").order("order_index", { ascending: true }),
    supabase
      .from("links")
      .select("*")
      .eq("is_active", true)
      .order("order_index", { ascending: true }),
  ]);

  const profile = applySocialDefaults(
    (profileRes.data as Profile) || DEFAULT_PROFILE
  );
  const sections = (sectionsRes.data || []) as Section[];
  const links = (linksRes.data || []) as Link[];

  return { profile, sections, links };
}

export default async function HomePage() {
  const { profile, sections, links } = await getPageData();

  return <PublicPage profile={profile} sections={sections} links={links} />;
}
