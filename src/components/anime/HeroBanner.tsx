import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { AnimeEntry } from "@/types/anime";
import TrailerModal from "./TrailerModal";

export default function HeroBanner({
  entries,
  onViewDetails,
}: {
  entries: AnimeEntry[];
  onViewDetails: (anime: AnimeEntry) => void;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [trailerFor, setTrailerFor] = useState<AnimeEntry | null>(null);
  const slideRef = useRef<HTMLDivElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);

  const featured = entries.filter((e) => e.bannerImage).slice(0, 6);
  const active = featured[index];

  useEffect(() => {
    if (paused || featured.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % featured.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [paused, featured.length]);

  useEffect(() => {
    if (!active) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        slideRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
      gsap.fromTo(
        bgRef.current,
        { scale: 1.08 },
        { scale: 1, duration: 7, ease: "power1.out" }
      );
    });
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, active?.id]);

  if (!active) return null;

  return (
    <section
      className="relative h-[420px] w-full overflow-hidden rounded-2xl border border-anime-border md:h-[460px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        ref={bgRef}
        className="absolute inset-0 bg-cover bg-center will-change-transform"
        style={{ backgroundImage: `url(${active.bannerImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-anime-bg via-anime-bg/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-anime-bg/80 via-transparent to-transparent" />

      <div
        ref={slideRef}
        className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 md:p-10"
      >
        <span className="w-fit rounded-full bg-anime-magenta/20 px-3 py-1 text-[11px] uppercase tracking-widest text-anime-magenta">
          ◆ Featured
        </span>
        <h2 className="max-w-xl font-anime text-3xl font-extrabold leading-tight text-anime-text md:text-5xl">
          {active.title}
        </h2>
        <div className="flex flex-wrap gap-2">
          {active.genres?.slice(0, 4).map((g) => (
            <span
              key={g}
              className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-anime-text/80"
            >
              {g}
            </span>
          ))}
          {active.score && (
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-anime-gold">
              ★ {active.score.toFixed(1)}
            </span>
          )}
        </div>
        <p className="max-w-xl text-sm text-anime-text/70 line-clamp-2">
          {active.synopsis ?? ""}
        </p>
        <div className="mt-1 flex gap-3">
          {active.trailer && (
            <button
              onClick={() => setTrailerFor(active)}
              className="flex items-center gap-2 rounded-xl bg-anime-magenta px-4 py-2.5 text-sm font-semibold text-white hover:bg-anime-magenta/90"
            >
              ▶ Watch trailer
            </button>
          )}
          <button
            onClick={() => onViewDetails(active)}
            className="rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm text-white backdrop-blur hover:bg-white/20"
          >
            Details
          </button>
        </div>
      </div>

      {featured.length > 1 && (
        <div className="absolute bottom-4 right-4 flex gap-1.5 md:bottom-6 md:right-8">
          {featured.map((f, i) => (
            <button
              key={f.id}
              onClick={() => setIndex(i)}
              aria-label={`Show featured title ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-anime-magenta" : "w-1.5 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}

      {trailerFor?.trailer && (
        <TrailerModal
          youtubeId={trailerFor.trailer.id}
          title={trailerFor.title}
          onClose={() => setTrailerFor(null)}
        />
      )}
    </section>
  );
}