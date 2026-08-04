import type { ExternalLink } from "@/types/anime";

export default function WatchLinks({ links }: { links: ExternalLink[] }) {
  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {links.slice(0, 8).map((link) => (
        <a
          key={link.url}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-full border border-anime-border bg-anime-surface px-3 py-1.5 text-xs text-anime-text transition-colors hover:border-anime-cyan/50"
          style={link.color ? { borderColor: `${link.color}66` } : undefined}
        >
          {link.icon && (
            <img src={link.icon} alt="" className="h-3.5 w-3.5 rounded-sm" loading="lazy" />
          )}
          {link.site}
        </a>
      ))}
    </div>
  );
}