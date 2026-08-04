import { useRef } from "react";
import type { HourlyPoint } from "@/types/weather";
import { describeWeatherCode } from "@/lib/weatherApi";
import WeatherIcon from "./WeatherIcon";

interface Props {
  hours: HourlyPoint[];
  selectedIndex: number | null;
  onChange: (index: number | null) => void;
}

export default function HourlyScrubber({ hours, selectedIndex, onChange }: Props) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const activeIndex = selectedIndex ?? 0;

  const scrollToIndex = (index: number) => {
    const row = rowRef.current;
    const card = row?.children[index] as HTMLElement | undefined;
    if (row && card) {
      row.scrollTo({
        left: card.offsetLeft - row.clientWidth / 2 + card.clientWidth / 2,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base text-white">
          Next 24 hours{" "}
          <span className="text-xs font-normal text-white/50">— drag to preview</span>
        </h2>
        {selectedIndex !== null && (
          <button
            onClick={() => onChange(null)}
            className="rounded-full bg-white/15 px-3 py-1 text-xs text-white hover:bg-white/25"
          >
            Back to now
          </button>
        )}
      </div>

      <input
        type="range"
        min={0}
        max={hours.length - 1}
        step={1}
        value={activeIndex}
        onChange={(e) => {
          const idx = Number(e.target.value);
          onChange(idx);
          scrollToIndex(idx);
        }}
        className="mb-4 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-amber-300"
      />

      <div ref={rowRef} className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
        {hours.map((h, i) => {
          const { icon } = describeWeatherCode(h.weatherCode);
          const isSelected = selectedIndex === i;
          return (
            <button
              key={h.time}
              onClick={() => onChange(isSelected ? null : i)}
              className={`flex shrink-0 flex-col items-center gap-2 rounded-xl border px-4 py-3 transition-colors ${
                isSelected
                  ? "border-white/60 bg-white/20"
                  : "border-white/15 bg-white/10 hover:bg-white/15"
              }`}
            >
              <span className="text-xs text-white/70">
                {i === 0
                  ? "Now"
                  : new Date(h.time).toLocaleTimeString("en-US", { hour: "numeric" })}
              </span>
              <WeatherIcon icon={icon} size={32} />
              <span className="tabular text-sm font-medium text-white">
                {Math.round(h.temperature)}°
              </span>
              {h.precipitationProbability > 10 && (
                <span className="text-[10px] text-sky-200">
                  {h.precipitationProbability}%
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}