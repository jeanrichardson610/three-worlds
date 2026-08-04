import type { AnimeRecommendation } from "@/types/anime";

export default function RecommendationsRow({
  items,
  onSelect,
}: {
  items: AnimeRecommendation[];
  onSelect: (id: number) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
      {items.map((r) => (
        <button
          key={r.id}
          onClick={() => onSelect(r.id)}
          className="flex w-24 shrink-0 flex-col gap-1.5 text-left"
        >
          <img
            src={r.coverImage}
            alt={r.title}
            loading="lazy"
            className="aspect-[2/3] w-full rounded-lg object-cover transition-transform hover:scale-105"
          />
          <p className="line-clamp-2 text-[11px] leading-tight text-anime-text">{r.title}</p>
        </button>
      ))}
    </div>
  );
}