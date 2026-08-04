import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import type { AnimeDetails, AnimeEntry } from "@/types/anime";
import { fetchAnimeDetails } from "@/lib/animeApi";
import TrailerModal from "./TrailerModal";
import ScoreHistogram from "./ScoreHistogram";
import CharacterStrip from "./CharacterStrip";
import WatchLinks from "./WatchLinks";
import RecommendationsRow from "./RecommendationsRow";

export default function AnimeModal({
  anime,
  onClose,
  onSelectRelated,
}: {
  anime: AnimeEntry;
  onClose: () => void;
  onSelectRelated: (id: number) => void;
}) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [details, setDetails] = useState<AnimeDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(true);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 });
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, y: 24, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power3.out" }
      );
    });

    // Prevent the page behind the modal from scrolling while it's open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      ctx.revert();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setDetailsLoading(true);
    setDetails(null);
    fetchAnimeDetails(anime.id)
      .then((data) => !cancelled && setDetails(data))
      .catch(() => !cancelled && setDetails(null))
      .finally(() => !cancelled && setDetailsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [anime.id]);

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className="my-auto flex max-h-[88vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-anime-border bg-anime-surface"
      >
        <img
          src={anime.coverImage}
          alt={anime.title}
          className="hidden w-56 shrink-0 object-cover sm:block"
        />
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-anime text-xl font-bold text-anime-text">{anime.title}</h3>
            <button
              onClick={onClose}
              className="shrink-0 rounded-full border border-anime-border px-2.5 py-1 text-xs text-anime-muted hover:text-anime-text"
            >
              Close
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {anime.genres?.map((g) => (
              <span
                key={g}
                className="rounded-full bg-anime-magenta/15 px-2.5 py-1 text-[11px] text-anime-magenta"
              >
                {g}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-anime-muted">
            <span>★ {anime.score?.toFixed(2) ?? "N/A"}</span>
            <span>{anime.episodes ?? "?"} episodes</span>
            <span>{anime.status}</span>
            {anime.year && <span>{anime.year}</span>}
          </div>

          {anime.trailer && (
            <button
              onClick={() => setShowTrailer(true)}
              className="flex w-fit items-center gap-2 rounded-xl bg-anime-magenta px-4 py-2 text-sm font-semibold text-white hover:bg-anime-magenta/90"
            >
              ▶ Watch trailer
            </button>
          )}

          <p className="text-sm leading-relaxed text-anime-text/90">
            {anime.synopsis ?? "No synopsis available."}
          </p>

          <div className="flex flex-col gap-2">
            <h4 className="font-anime text-sm font-semibold text-anime-text">
              Community score
            </h4>
            {detailsLoading ? (
              <div className="skeleton h-40 w-full rounded-xl" />
            ) : details && details.scoreDistribution.length > 0 ? (
              <ScoreHistogram data={details.scoreDistribution} />
            ) : (
              <p className="text-xs text-anime-muted">Not enough votes yet.</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="font-anime text-sm font-semibold text-anime-text">
              Characters &amp; voice actors
            </h4>
            {detailsLoading ? (
              <div className="flex gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="skeleton h-24 w-20 shrink-0 rounded-lg" />
                ))}
              </div>
            ) : details && details.characters.length > 0 ? (
              <CharacterStrip characters={details.characters} />
            ) : (
              <p className="text-xs text-anime-muted">No character data available.</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="font-anime text-sm font-semibold text-anime-text">
              Official links &amp; where to watch
            </h4>
            {detailsLoading ? (
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton h-7 w-20 rounded-full" />
                ))}
              </div>
            ) : details && details.externalLinks.length > 0 ? (
              <WatchLinks links={details.externalLinks} />
            ) : (
              <p className="text-xs text-anime-muted">No external links listed.</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="font-anime text-sm font-semibold text-anime-text">
              More like this
            </h4>
            {detailsLoading ? (
              <div className="flex gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="skeleton aspect-[2/3] w-24 shrink-0 rounded-lg" />
                ))}
              </div>
            ) : details && details.recommendations.length > 0 ? (
              <RecommendationsRow items={details.recommendations} onSelect={onSelectRelated} />
            ) : (
              <p className="text-xs text-anime-muted">No recommendations yet.</p>
            )}
          </div>
        </div>
      </div>

      {showTrailer && anime.trailer && (
        <TrailerModal
          youtubeId={anime.trailer.id}
          title={anime.title}
          onClose={() => setShowTrailer(false)}
        />
      )}
    </div>,
    document.body
  );
}