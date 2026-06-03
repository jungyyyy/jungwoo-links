import type { Link as LinkType, Profile, Section } from "@/lib/types";
import { LinkCard } from "./LinkCard";
import { SocialIcons } from "./SocialIcons";

type PublicPageProps = {
  profile: Profile;
  sections: Section[];
  links: LinkType[];
};

export function PublicPage({ profile, sections, links }: PublicPageProps) {
  const isDark = profile.theme === "dark";

  const unsectionedLinks = links.filter((l) => !l.section_id);
  const sectionedLinks = sections.map((section) => ({
    section,
    links: links.filter((l) => l.section_id === section.id),
  }));

  return (
    <div
      className={`min-h-screen ${
        isDark
          ? "bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white"
          : "bg-gradient-to-b from-gray-50 via-white to-gray-50 text-gray-900"
      }`}
    >
      <div className="mx-auto max-w-lg px-4 py-12">
        {/* Header */}
        <header className="text-center">
          {profile.photo_url ? (
            <img
              src={profile.photo_url}
              alt={profile.name}
              className="mx-auto h-24 w-24 rounded-full object-cover ring-2 ring-white/20"
            />
          ) : (
            <div
              className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold ${
                isDark ? "bg-white/10 text-white/60" : "bg-gray-200 text-gray-400"
              }`}
            >
              {profile.name.charAt(0)}
            </div>
          )}

          <h1 className="mt-4 text-2xl font-bold tracking-tight">{profile.name}</h1>

          {profile.bio && (
            <p
              className={`mt-1 text-sm ${
                isDark ? "text-white/60" : "text-gray-500"
              }`}
            >
              {profile.bio}
            </p>
          )}

          <SocialIcons profile={profile} isDark={isDark} />
        </header>

        {/* Links */}
        <main className="mt-10 space-y-3">
          {unsectionedLinks.map((link) => (
            <LinkCard key={link.id} link={link} isDark={isDark} />
          ))}

          {sectionedLinks.map(({ section, links: sectionLinks }) => {
            if (sectionLinks.length === 0) return null;

            return (
              <div key={section.id} className="space-y-3">
                <div
                  className={`section-divider ${
                    isDark ? "section-divider-dark" : "section-divider-light"
                  }`}
                >
                  <span
                    className={`px-4 text-xs font-medium uppercase tracking-wider ${
                      isDark ? "text-white/40" : "text-gray-400"
                    }`}
                  >
                    {section.name}
                  </span>
                </div>

                {sectionLinks.map((link) => (
                  <LinkCard key={link.id} link={link} isDark={isDark} />
                ))}
              </div>
            );
          })}
        </main>

        {/* Footer */}
        <footer className="mt-16 text-center">
          <p
            className={`text-xs ${
              isDark ? "text-white/30" : "text-gray-400"
            }`}
          >
            Jungwoo Lee
          </p>
        </footer>
      </div>
    </div>
  );
}
