import { useEffect, useState } from "react";
import type { NextAiringEpisode } from "@/types/anime";

function formatCountdown(seconds: number) {
  if (seconds <= 0) return "Airing now";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function CountdownBadge({ episode }: { episode: NextAiringEpisode }) {
  const [remaining, setRemaining] = useState(episode.timeUntilAiring);

  useEffect(() => {
    setRemaining(episode.timeUntilAiring);
    const interval = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [episode.timeUntilAiring]);

  return (
    <span className="absolute inset-x-2 bottom-2 rounded-md bg-black/75 px-2 py-1 text-center text-[10px] font-medium text-anime-cyan backdrop-blur-sm">
      Ep {episode.episode} in {formatCountdown(remaining)}
    </span>
  );
}