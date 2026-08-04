import { useEffect, useState } from "react";
import type { GeoResult } from "@/types/weather";
import { searchLocations } from "@/lib/weatherApi";

export default function WeatherSearch({
  onSelect,
}: {
  onSelect: (loc: GeoResult) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const handle = setTimeout(() => {
      searchLocations(query)
        .then(setResults)
        .catch(() => setResults([]));
    }, 350);
    return () => clearTimeout(handle);
  }, [query]);

  return (
    <div className="relative w-full max-w-xs">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search city…"
        className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/60 outline-none backdrop-blur focus:border-white/50"
      />
      {open && results.length > 0 && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-white/20 bg-black/60 backdrop-blur-lg">
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                onSelect(r);
                setQuery(`${r.name}, ${r.country}`);
                setOpen(false);
              }}
              className="block w-full px-4 py-2.5 text-left text-sm text-white/90 hover:bg-white/10"
            >
              {r.name}
              {r.admin1 ? `, ${r.admin1}` : ""} — {r.country}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
