import { useEffect, useRef } from "react";
import gsap from "gsap";

interface Props {
  uvIndex: number;
  aqi: number | null;
  windSpeed: number;
  precipProbability: number;
}

function computeScore({ uvIndex, aqi, windSpeed, precipProbability }: Props) {
  let score = 100;
  const factors: string[] = [];

  if (precipProbability > 40) {
    score -= precipProbability * 0.4;
    factors.push("high rain chance");
  }
  if (aqi != null && aqi > 100) {
    score -= (aqi - 100) * 0.3;
    factors.push("elevated air quality index");
  }
  if (windSpeed > 30) {
    score -= (windSpeed - 30) * 0.5;
    factors.push("strong wind");
  }
  if (uvIndex > 7) {
    score -= (uvIndex - 7) * 4;
    factors.push("very high UV");
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let label = "Great day to be outside";
  let color = "#4ade80";
  if (score < 40) {
    label = "Better off indoors";
    color = "#f87171";
  } else if (score < 60) {
    label = "Fair — check conditions";
    color = "#facc15";
  } else if (score < 80) {
    label = "Good, minor caveats";
    color = "#a3e635";
  }

  return { score, label, color, factors };
}

export default function OutdoorScore(props: Props) {
  const ringRef = useRef<SVGCircleElement | null>(null);
  const valueRef = useRef<HTMLSpanElement | null>(null);
  const { score, label, color, factors } = computeScore(props);

  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;
    const circumference = 2 * Math.PI * 52;
    gsap.set(ring, { strokeDasharray: circumference, strokeDashoffset: circumference });
    const obj = { val: 0 };
    gsap.to(ring, {
      strokeDashoffset: circumference * (1 - score / 100),
      duration: 1.2,
      ease: "power3.out",
    });
    gsap.to(obj, {
      val: score,
      duration: 1.2,
      ease: "power3.out",
      onUpdate: () => {
        if (valueRef.current) valueRef.current.textContent = String(Math.round(obj.val));
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  return (
    <section className="flex flex-col items-center gap-3 rounded-2xl border border-white/15 bg-white/5 p-5 text-center backdrop-blur">
      <h2 className="self-start font-display text-base text-white">Outdoor score</h2>
      <div className="relative flex h-32 w-32 items-center justify-center">
        <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90">
          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
          <circle
            ref={ringRef}
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
          />
        </svg>
        <span ref={valueRef} className="tabular font-display text-3xl font-semibold text-white">
          0
        </span>
      </div>
      <p className="font-display text-sm text-white" style={{ color }}>
        {label}
      </p>
      {factors.length > 0 ? (
        <p className="text-xs text-white/60">
          Held back by {factors.join(", ")}.
        </p>
      ) : (
        <p className="text-xs text-white/60">No major concerns right now.</p>
      )}
    </section>
  );
}