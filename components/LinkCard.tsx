import type { Link as LinkType } from "@/lib/types";

type LinkCardProps = {
  link: LinkType;
  isDark: boolean;
};

export function LinkCard({ link, isDark }: LinkCardProps) {
  return (
    <a
      href={`/api/click/${link.id}`}
      className={`link-card ${isDark ? "link-card-dark" : "link-card-light"}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl leading-none">{link.emoji}</span>
        <div className="min-w-0 flex-1">
          <h3
            className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {link.title}
          </h3>
          {link.description && (
            <p
              className={`mt-0.5 truncate text-sm ${
                isDark ? "text-white/60" : "text-gray-500"
              }`}
            >
              {link.description}
            </p>
          )}
        </div>
      </div>
    </a>
  );
}
