import type { AnimeEntry } from "@/types/anime";
import { useGsapReveal } from "@/hooks/useGsapReveal";
import AnimeCard from "./AnimeCard";

export default function AnimeSection({
  title,
  accentLabel,
  entries,
  loading,
  showRank,
  onSelect,
}: {
  title: string;
  accentLabel: string;
  entries: AnimeEntry[];
  loading: boolean;
  showRank?: boolean;
  onSelect: (anime: AnimeEntry) => void;
}) {
  const rowRef = useGsapReveal<HTMLDivElement>([loading, entries.length], {
    y: 14,
    stagger: 0.04,
  });

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="font-anime text-lg font-semibold text-anime-text">{title}</h2>
        <span className="text-[11px] uppercase tracking-widest text-anime-muted">
          {accentLabel}
        </span>
      </div>
      <div
        ref={rowRef}
        className="flex gap-3 overflow-x-auto pb-2 no-scrollbar"
        style={{ perspective: 800 }}
      >
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] w-44 shrink-0 animate-pulse rounded-xl bg-anime-surface"
              />
            ))
          : entries.map((anime, i) => (
              <AnimeCard
                key={anime.id}
                anime={anime}
                rank={showRank ? i + 1 : undefined}
                onSelect={onSelect}
              />
            ))}
      </div>
    </section>
  );
}