import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { Insight, InsightTone } from "@/types/banking";

const TONE_STYLES: Record<InsightTone, { border: string; badge: string; glyph: string }> = {
  positive: { border: "border-l-bank-mint", badge: "bg-bank-mint/15 text-bank-mint", glyph: "▲" },
  warning: { border: "border-l-bank-rose", badge: "bg-bank-rose/15 text-bank-rose", glyph: "!" },
  info: { border: "border-l-bank-gold", badge: "bg-bank-gold/15 text-bank-gold", glyph: "i" },
};

export default function InsightsCarousel({ insights }: { insights: Insight[] }) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        trackRef.current?.children ?? [],
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "power3.out",
        }
      );
    });

    return () => ctx.revert();
  }, [insights.length]);

  useEffect(() => {
    if (insights.length <= 1) return;

    const interval = setInterval(() => {
      if (pausedRef.current) return;
      setActive((prev) => (prev + 1) % insights.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [insights.length]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const card = track.children[active] as HTMLElement | undefined;
    if (!card) return;

    const target =
      card.offsetLeft - (track.clientWidth - card.clientWidth) / 2;

    const maxScroll = track.scrollWidth - track.clientWidth;

    gsap.to(track, {
      scrollLeft: Math.min(Math.max(target, 0), maxScroll),
      duration: 0.6,
      ease: "power3.inOut",
    });
  }, [active]);

  return (
    <div
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
      className="flex flex-col gap-3"
    >
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-hidden px-6 pb-1"
      >
        {insights.map((insight) => {
          const style = TONE_STYLES[insight.tone];

          return (
            <div
              key={insight.id}
              className={`flex w-[90%] shrink-0 flex-col gap-2 rounded-2xl border border-bank-border ${style.border} border-l-4 bg-bank-surface p-4`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${style.badge}`}
              >
                {style.glyph}
              </span>

              <p className="font-display text-sm text-bank-text">
                {insight.headline}
              </p>

              <p className="text-xs text-bank-muted">
                {insight.detail}
              </p>
            </div>
          );
        })}
      </div>

      {insights.length > 1 && (
        <div className="flex justify-center gap-1.5">
          {insights.map((insight, i) => (
            <button
              key={insight.id}
              onClick={() => setActive(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === active
                  ? "w-5 bg-bank-mint"
                  : "w-1.5 bg-bank-border"
              }`}
              aria-label={`Show insight ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}