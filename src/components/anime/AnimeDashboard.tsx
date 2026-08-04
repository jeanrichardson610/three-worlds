import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { AnimeEntry } from "@/types/anime";
import {
  fetchAiringNow,
  fetchAnimeById,
  fetchMostPopular,
  fetchTopAnime,
  fetchUpcoming,
  searchAnime,
} from "@/lib/animeApi";
import AnimeSection from "./AnimeSection";
import AnimeModal from "./AnimeModal";
import HeroBanner from "./HeroBanner";

type SectionState = {
  top: AnimeEntry[];
  airing: AnimeEntry[];
  upcoming: AnimeEntry[];
  popular: AnimeEntry[];
};

const EMPTY: SectionState = { top: [], airing: [], upcoming: [], popular: [] };

export default function AnimeDashboard() {
  const [sections, setSections] = useState<SectionState>(EMPTY);
  const [loading, setLoading] = useState<Record<keyof SectionState, boolean>>({
    top: true,
    airing: true,
    upcoming: true,
    popular: true,
  });
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AnimeEntry[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<AnimeEntry | null>(null);
  const [switchingRelated, setSwitchingRelated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchTopAnime()
      .then((data) => !cancelled && setSections((s) => ({ ...s, top: data })))
      .catch(() => !cancelled && setError("Couldn't reach the anime API. Try again shortly."))
      .finally(() => !cancelled && setLoading((l) => ({ ...l, top: false })));

    fetchAiringNow()
      .then((data) => !cancelled && setSections((s) => ({ ...s, airing: data })))
      .catch(() => {})
      .finally(() => !cancelled && setLoading((l) => ({ ...l, airing: false })));

    fetchUpcoming()
      .then((data) => !cancelled && setSections((s) => ({ ...s, upcoming: data })))
      .catch(() => {})
      .finally(() => !cancelled && setLoading((l) => ({ ...l, upcoming: false })));

    fetchMostPopular()
      .then((data) => !cancelled && setSections((s) => ({ ...s, popular: data })))
      .catch(() => {})
      .finally(() => !cancelled && setLoading((l) => ({ ...l, popular: false })));

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    const handle = setTimeout(() => {
      searchAnime(query)
        .then((res) => setSearchResults(res))
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false));
    }, 450);
    return () => clearTimeout(handle);
  }, [query]);

  const handleSelectRelated = (id: number) => {
    setSwitchingRelated(true);
    fetchAnimeById(id)
      .then((entry) => setSelected(entry))
      .catch(() => {})
      .finally(() => setSwitchingRelated(false));
  };

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8">
      <div ref={headerRef} className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-anime-cyan">
              AniList API
            </p>
            <h1 className="font-anime text-3xl font-extrabold text-anime-text">
              What's worth watching
            </h1>
          </div>
          <div className="flex w-full max-w-md items-center gap-2">
            <button
              onClick={() => setQuery("")}
              disabled={!query.trim()}
              className="shrink-0 rounded-xl border border-anime-border bg-anime-surface px-3.5 py-2.5 text-sm text-anime-muted transition-colors hover:text-anime-text disabled:cursor-default disabled:opacity-40 disabled:hover:text-anime-muted"
            >
              ⌂ Home
            </button>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search titles…"
              className="w-full rounded-xl border border-anime-border bg-anime-surface px-4 py-2.5 text-sm text-anime-text outline-none focus:border-anime-magenta hover:border-white"
            />
          </div>
        </div>
        {error && <p className="text-xs text-anime-magenta">{error}</p>}
      </div>

      {query.trim() ? (
        <section className="flex flex-col gap-3">
          <h2 className="font-anime text-lg font-semibold text-anime-text">
            Results for "{query}"
          </h2>
          <div className="flex flex-wrap gap-3">
            {searching && (
              <p className="text-sm text-anime-muted">Searching…</p>
            )}
            {!searching &&
              searchResults?.map((anime) => (
                <button
                  key={anime.id}
                  onClick={() => setSelected(anime)}
                  className="flex w-44 flex-col overflow-hidden rounded-xl border border-anime-border bg-anime-surface text-left"
                >
                  <img
                    src={anime.coverImage}
                    alt={anime.title}
                    className="aspect-[2/3] w-full object-cover"
                  />
                  <p className="line-clamp-2 p-2.5 font-anime text-sm font-semibold text-anime-text">
                    {anime.title}
                  </p>
                </button>
              ))}
            {!searching && searchResults?.length === 0 && (
              <p className="text-sm text-anime-muted">No matches found.</p>
            )}
          </div>
        </section>
      ) : (
        <div className="flex flex-col gap-8">
          {loading.top ? (
            <div className="skeleton h-[420px] w-full rounded-2xl md:h-[460px]" />
          ) : (
            sections.top.length > 0 && (
              <HeroBanner entries={sections.top} onViewDetails={setSelected} />
            )
          )}

          <AnimeSection
            title="Most popular"
            accentLabel="By fan count"
            entries={sections.top}
            loading={loading.top}
            showRank
            onSelect={setSelected}
          />
          <AnimeSection
            title="Airing now"
            accentLabel="This season"
            entries={sections.airing}
            loading={loading.airing}
            onSelect={setSelected}
          />
          <AnimeSection
            title="Upcoming"
            accentLabel="Next season"
            entries={sections.upcoming}
            loading={loading.upcoming}
            onSelect={setSelected}
          />
          <AnimeSection
            title="Community favorites"
            accentLabel="Most favorited"
            entries={sections.popular}
            loading={loading.popular}
            onSelect={setSelected}
          />
        </div>
      )}

      {selected && (
        <AnimeModal
          anime={selected}
          onClose={() => setSelected(null)}
          onSelectRelated={handleSelectRelated}
        />
      )}
      {switchingRelated && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-full bg-anime-surface px-4 py-2 text-sm text-anime-text shadow-lg">
            Loading…
          </div>
        </div>
      )}
    </div>
  );
}