import { useEffect, useRef } from "react";
import gsap from "gsap";

interface Props {
  sunrise: string;
  sunset: string;
}

function pointOnArc(fraction: number) {
  const t = Math.max(0, Math.min(1, fraction)) * Math.PI;
  return {
    x: 100 - 80 * Math.cos(t),
    y: 100 - 80 * Math.sin(t),
  };
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function SunPathArc({ sunrise, sunset }: Props) {
  const markerRef = useRef<SVGGElement | null>(null);
  const arcRef = useRef<SVGPathElement | null>(null);

  const sunriseMs = new Date(sunrise).getTime();
  const sunsetMs = new Date(sunset).getTime();
  const now = Date.now();
  const rawFraction = (now - sunriseMs) / (sunsetMs - sunriseMs);
  const isDaytime = rawFraction >= 0 && rawFraction <= 1;
  const fraction = Math.max(0, Math.min(1, rawFraction));

  useEffect(() => {
    const marker = markerRef.current;
    const arc = arcRef.current;
    if (!marker || !arc) return;

    const length = arc.getTotalLength();
    gsap.set(arc, { strokeDasharray: length, strokeDashoffset: length });
    gsap.to(arc, { strokeDashoffset: 0, duration: 1, ease: "power2.out" });

    const proxy = { f: 0 };
    gsap.to(proxy, {
      f: fraction,
      duration: 1.2,
      ease: "power3.out",
      onUpdate: () => {
        const { x, y } = pointOnArc(proxy.f);
        marker.setAttribute("transform", `translate(${x}, ${y})`);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fraction]);

  return (
    <section className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur">
      <h2 className="mb-2 font-display text-base text-white">Sun path</h2>
      <svg viewBox="0 0 200 115" className="w-full">
        <path
          ref={arcRef}
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="2"
          strokeDasharray="4 5"
        />
        <line x1="10" y1="100" x2="190" y2="100" stroke="rgba(255,255,255,0.15)" />
        <g ref={markerRef}>
          <circle
            r="7"
            fill={isDaytime ? "#ffd166" : "#c9d6e8"}
            stroke="white"
            strokeWidth="1.5"
          />
        </g>
      </svg>
      <div className="flex items-center justify-between text-xs text-white/70">
        <span>☀ Rise {formatTime(sunrise)}</span>
        <span>
          {isDaytime
            ? `${Math.round(fraction * 100)}% through the day`
            : rawFraction < 0
              ? "Before sunrise"
              : "After sunset"}
        </span>
        <span>Set {formatTime(sunset)} ☾</span>
      </div>
    </section>
  );
}