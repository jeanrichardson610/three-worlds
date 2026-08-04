import { useRef, type MouseEvent } from "react";
import gsap from "gsap";
import type { AnimeEntry } from "@/types/anime";
import CountdownBadge from "./CountdownBadge";

export default function AnimeCard({
  anime,
  rank,
  onSelect,
}: {
  anime: AnimeEntry;
  rank?: number;
  onSelect: (anime: AnimeEntry) => void;
}) {
  const cardRef = useRef<HTMLButtonElement | null>(null);

  const handleMove = (e: MouseEvent<HTMLButtonElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(el, {
      rotateY: x * 14,
      rotateX: -y * 14,
      scale: 1.04,
      duration: 0.4,
      ease: "power2.out",
      transformPerspective: 600,
    });
  };

  const handleLeave = () => {
    gsap.to(cardRef.current, {
      rotateY: 0,
      rotateX: 0,
      scale: 1,
      duration: 0.5,
      ease: "power3.out",
    });
  };

  return (
    <button
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={() => onSelect(anime)}
      className="group relative flex w-44 shrink-0 flex-col overflow-hidden rounded-xl border border-anime-border bg-anime-surface text-left will-change-transform"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        <img
          src={anime.coverImage}
          alt={anime.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        {rank && (
          <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-anime-gold font-display text-[11px] font-bold text-anime-bg">
            {rank}
          </span>
        )}
        {anime.score && (
          <span className="absolute right-2 top-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] font-medium text-anime-gold">
            ★ {anime.score.toFixed(1)}
          </span>
        )}
        {anime.nextAiringEpisode && <CountdownBadge episode={anime.nextAiringEpisode} />}
      </div>
      <div className="p-2.5">
        <p className="line-clamp-2 font-anime text-sm font-semibold leading-tight text-anime-text">
          {anime.title}
        </p>
        <p className="mt-1 text-[11px] text-anime-muted">
          {anime.format ?? "TV"} · {anime.episodes ?? "?"} eps
        </p>
      </div>
    </button>
  );
}