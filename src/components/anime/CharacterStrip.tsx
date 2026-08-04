import type { AnimeCharacter } from "@/types/anime";

export default function CharacterStrip({ characters }: { characters: AnimeCharacter[] }) {
  if (characters.length === 0) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
      {characters.map((c) => (
        <div key={c.id} className="flex w-24 shrink-0 flex-col items-center gap-1.5 text-center">
          <img
            src={c.image}
            alt={c.name}
            loading="lazy"
            className="h-24 w-20 rounded-lg object-cover"
          />
          <p className="line-clamp-2 text-[11px] font-medium leading-tight text-anime-text">
            {c.name}
          </p>
          {c.voiceActor && (
            <p className="line-clamp-1 text-[10px] text-anime-muted">{c.voiceActor.name}</p>
          )}
        </div>
      ))}
    </div>
  );
}